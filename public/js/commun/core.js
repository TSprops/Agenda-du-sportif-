// Base : Firebase, constantes, état de l'app et petits utilitaires. Ne dépend d'aucun autre fichier.

import {
  initializeApp, getAuth, connectAuthEmulator, onAuthStateChanged, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut, sendPasswordResetEmail, deleteUser, reauthenticateWithCredential, EmailAuthProvider,
  initializeFirestore, connectFirestoreEmulator, persistentLocalCache, persistentMultipleTabManager,
  doc, collection, getDoc, getDocs, setDoc, updateDoc, deleteDoc, addDoc, onSnapshot, query, where, orderBy, limit, limitToLast, writeBatch,
  arrayRemove, documentId, getDocsFromCache
} from "../../vendor/firebase.js";
import { firebaseConfig } from "../../firebase-config.js";
import { LANGUE, LOCALE, dateFormat, dateLongue, majuscule, relatif, t, tFr, valeur } from "./i18n.js";
import { CF_LIB, MUSCLES, GROUPS, EQUIP, EXERCISES, KEYWORDS, PROGRAMS } from "../../data.js";
/* ============================================================
   Constantes
   ============================================================ */
const TYPES_V = 2;
const TERMS_V = 1; // version des conditions d'utilisation acceptées
/* Valeurs enregistrées en base en français (identifiants historiques) : affichées avec valeur("valeurs.…", v).
   Leur texte de référence est aussi dans langues/fr.json, avec les traductions. */
const DEFAULT_TYPES = [["push", "#FF3B30"], ["pull", "#3D8BFF"], ["jambes", "#2FBF71"], ["haut", "#A56BFF"], ["bas", "#FF9F0A"], ["cardio", "#19C3C3"],
  ["cordes", "#FF5FA2"], ["repos", "#8A847E"]].map(([id, color]) => ({ id, name: tFr("valeurs.types." + id), color }));
// Nom d'un type de séance à l'affichage (types par défaut traduits, types créés par l'utilisateur tels quels).
const nomType = n => valeur("valeurs.types", n);
const PALETTE = ["#FF3B30", "#3D8BFF", "#2FBF71", "#A56BFF", "#FF9F0A", "#19C3C3", "#FF5FA2", "#8A847E", "#C9D63A"];
const MOODS = ["forme", "normal", "fatigue", "douleur"].map(id => tFr("valeurs.humeurs." + id));
const OBJECTIFS = ["masse", "seche", "force", "maintien", "forme", "endurance"].map(id => tFr("valeurs.objectifs." + id));
const OBJETS = ["aide", "reclamation", "amelioration", "probleme"].map(id => tFr("valeurs.objets." + id));
const DEFAULT_SUPPS = [["whey", "30 g"], ["omega3", "doses.gelules2"], ["vitd", "doses.ui1000"], ["magnesium", "300 mg"], ["multi", "doses.comprime1"], ["cafeine", "200 mg"]]
  .map(([id, dose]) => [tFr("valeurs.complements." + id), dose.startsWith("doses.") ? tFr("valeurs." + dose) : dose]); // i18n-cles : valeurs.doses.

/* ============================================================
   Firebase
   ============================================================ */
const LOCAL = ["localhost", "127.0.0.1"].includes(location.hostname);
const configured = !!(firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId);
const $ = id => document.getElementById(id);

if (!configured && !LOCAL) {
  document.querySelectorAll(".view").forEach(v => { v.hidden = true; });
  $("v-setup").hidden = false;
  throw new Error("firebase-config.js est vide"); // i18n-ignore (console)
}
// Tests en local : les émulateurs Firebase (port 5000) au lieu de la vraie base.
const EMU = LOCAL && (!configured || location.port === "5000");
const fbApp = initializeApp(EMU ? { apiKey: "demo-key", authDomain: "localhost", projectId: "demo-agenda" } : firebaseConfig);
const auth = getAuth(fbApp);
auth.languageCode = LANGUE; // e-mails de Firebase (mot de passe oublié…) dans la langue choisie
const db = initializeFirestore(fbApp, EMU ? {} : { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
if (EMU) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}

/* ============================================================
   État et utilitaires
   ============================================================ */
const now = new Date();
const S = {
  uid: null, email: "", admin: false, profile: null,
  types: DEFAULT_TYPES.map(t => ({ ...t })), days: {}, nut: {}, prefs: { creaDose: 5 },
  view: new Date(now.getFullYear(), now.getMonth(), 1), open: null, cur: null, screen: "splash",
  cpDay: null, crView: null, members: {}, messages: [], myMsgs: [], photoCache: {}, formPhoto: {},
  unsubs: [], dataSubscribed: false, visitCounted: false
};
const clone = o => JSON.parse(JSON.stringify(o));
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pad = n => String(n).padStart(2, "0");
const key = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const parse = k => { const [y, m, d] = k.slice(0, 10).split("-").map(Number); return new Date(y, m - 1, d); };
// Plusieurs séances par jour : « 2026-09-28 », puis « 2026-09-28~2 », « 2026-09-28~3 »…
const dayOf = k => k.slice(0, 10);
const sessionsOn = d => Object.keys(S.days).filter(k => dayOf(k) === d).sort();
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const typeOf = id => S.types.find(t => t.id === id);
const nf = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 1 });
const numOr = v => { const n = parseFloat(String(v).replace(",", ".")); return isFinite(n) ? n : ""; };
const todayK = () => key(new Date());
const hm = () => { const d = new Date(); return pad(d.getHours()) + ":" + pad(d.getMinutes()); };
/* Dates selon la langue : « 2 octobre 2026 », « lundi 2 octobre », « octobre 2026 », « 2 oct. », « lun. ». */
const fmtDate = ts => dateLongue(ts);
const fmtJour = d => dateFormat(d, { weekday: "long", day: "numeric", month: "long" });
const fmtJourAn = d => dateFormat(d, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const fmtJourMois = d => dateFormat(d, { day: "numeric", month: "long" });
const fmtMoisAn = d => majuscule(dateFormat(d, { month: "long", year: "numeric" }));
const fmtMois = d => dateFormat(d, { month: "long" });
const fmtCourt = (d, an) => dateFormat(d, an ? { day: "numeric", month: "short", year: "numeric" } : { day: "numeric", month: "short" });
const jourCourt = d => dateFormat(d, { weekday: "short" }).replace(".", "");
function ago(ts) {
  if (!ts) return t("commun.jamais");
  const days = Math.floor((new Date(todayK()) - new Date(key(new Date(ts)))) / 864e5);
  return days < 30 ? relatif(-Math.max(0, days), "day") : fmtDate(ts);
}
/* Activités proposées quand on touche un jour du calendrier */
const DISC = {
  muscu: { name: t("valeurs.seances.muscu"), color: "var(--red-hi)", desc: t("disciplines.muscu"),
    icon: '<path d="M6 7v10M18 7v10M3 9.5v5M21 9.5v5M6 12h12"/>' },
  crossfit: { name: t("valeurs.seances.crossfit"), color: "#FFD60A", desc: t("disciplines.crossfit"),
    icon: '<path d="M9 8a3 3 0 1 1 6 0"/><path d="M7 10h10l1.4 8.2A2 2 0 0 1 16.4 20.5H7.6a2 2 0 0 1-2-2.3z"/>' },
  calis: { name: t("valeurs.seances.calis"), color: "#C9D63A", desc: t("disciplines.calis"),
    icon: '<path d="M3 4h18M8 4v3M16 4v3"/><circle cx="12" cy="10" r="2"/><path d="M8 7l4 4.5L16 7M12 12v4.5M9 21l3-4.5 3 4.5"/>' },
  course: { name: t("valeurs.seances.course"), color: "#5AC8FA", desc: t("disciplines.course"),
    icon: '<circle cx="14.5" cy="4.5" r="2"/><path d="M7 21l3.5-6 3 2.5V22M5.5 11.5l3.5-3 4 1 2.5 3.5h3.5M10.5 15l-1.5-4.5"/>' },
  cordes: { name: t("valeurs.seances.cordes"), color: "#FF5FA2", desc: t("disciplines.cordes"),
    icon: '<path d="M8 2h8"/><path d="M12 2c-3 2.5 3 4.5 0 7s3 4.5 0 7 3 4.5 0 6"/>' },
  hyrox: { name: t("valeurs.seances.hyrox"), color: "#2EE6C5", desc: t("disciplines.hyrox"),
    icon: '<path d="M5 4v16M19 4v16M5 12h14"/><path d="M9 8l6 8M15 8l-6 8"/>' }
};
// Activités qui ont leurs pages Idées, Records et Progression.
const MAIN_DISC = ["muscu", "crossfit", "calis", "course"];
const RUN_TYPES = [
  { id: "ef", color: "#5AC8FA" }, { id: "seuil", color: "#FF7A45" }, { id: "frac", color: "#E040FB" }
].map(r => ({ ...r, ref: tFr("valeurs.seances." + r.id), name: t("valeurs.seances." + r.id), short: t("course.court." + r.id), hint: t("course.aide." + r.id) }));

// Formats de WOD : identifiants enregistrés (« Force » compris), affichés avec nomFormat().
const WOD_FORMATS = ["For Time", "AMRAP", "EMOM", "Tabata", "Chipper", "Force"]; // i18n-ignore (identifiants)
const FORMAT_ID = { "For Time": "fortime", AMRAP: "amrap", EMOM: "emom", Tabata: "tabata", Chipper: "chipper", Force: "force" }; // i18n-ignore
const nomFormat = f => FORMAT_ID[f] ? t("crossfit.formats." + FORMAT_ID[f]) : f;
const WOD_HINTS = Object.fromEntries(WOD_FORMATS.map(f => [f, t("crossfit.formatsAide." + FORMAT_ID[f])]));
// Noms d'exercices : identifiants enregistrés en français, affichés avec nomEx() (traduction dans « exercices.noms »).
const nomEx = n => valeur("exercices.noms", n);
const CALIS_MOVES = [["Tractions"], ["Dips"], ["Pompes"], ["Muscle-up"], ["Squats"], ["Pistol squat"], ["Tractions australiennes"], ["Handstand push-up"],
  ["Front lever", 1], ["Back lever", 1], ["Planche", 1], ["Handstand", 1], ["L-sit", 1], ["Human flag", 1], ["Gainage", 1]];
const CF_MOVES = CF_LIB.map(x => x[0]);
// WOD de référence (« Girls » et « Hero WODs ») : charges homme / femme. Description traduite dans « crossfit.bench ».
const BENCH = [
  { id: "fran", name: "Fran", type: "time", desc: t("crossfit.bench.fran"),
    moves: [{ reps: "21-15-9", name: "Thrusters", kg: 43 }, { reps: "21-15-9", name: "Tractions", kg: "" }] },
  { id: "grace", name: "Grace", type: "time", desc: t("crossfit.bench.grace"), moves: [{ reps: "30", name: "Clean & jerk", kg: 61 }] },
  { id: "isabel", name: "Isabel", type: "time", desc: t("crossfit.bench.isabel"), moves: [{ reps: "30", name: "Snatch", kg: 61 }] },
  { id: "diane", name: "Diane", type: "time", desc: t("crossfit.bench.diane"),
    moves: [{ reps: "21-15-9", name: "Soulevé de terre", kg: 102 }, { reps: "21-15-9", name: "Handstand push-ups", kg: "" }] },
  { id: "elizabeth", name: "Elizabeth", type: "time", desc: t("crossfit.bench.elizabeth"),
    moves: [{ reps: "21-15-9", name: "Squat clean", kg: 61 }, { reps: "21-15-9", name: "Dips aux anneaux", kg: "" }] },
  { id: "helen", name: "Helen", type: "time", desc: t("crossfit.bench.helen"),
    moves: [{ reps: t("crossfit.bench.tours", { n: 3 }), name: "Course (m) 400", kg: "" }, { reps: "21", name: "Kettlebell swings", kg: 24 }, { reps: "12", name: "Tractions", kg: "" }] },
  { id: "karen", name: "Karen", type: "time", desc: t("crossfit.bench.karen"), moves: [{ reps: "150", name: "Wall balls", kg: 9 }] },
  { id: "annie", name: "Annie", type: "time", desc: t("crossfit.bench.annie"),
    moves: [{ reps: "50-40-30-20-10", name: "Double unders", kg: "" }, { reps: "50-40-30-20-10", name: "Sit-ups", kg: "" }] },
  { id: "jackie", name: "Jackie", type: "time", desc: t("crossfit.bench.jackie"),
    moves: [{ reps: "1000 m", name: "Rameur (m)", kg: "" }, { reps: "50", name: "Thrusters", kg: 20 }, { reps: "30", name: "Tractions", kg: "" }] },
  { id: "cindy", name: "Cindy", type: "amrap", cap: 20, desc: t("crossfit.bench.cindy"),
    moves: [{ reps: "5", name: "Tractions", kg: "" }, { reps: "10", name: "Pompes", kg: "" }, { reps: "15", name: "Air squats", kg: "" }] },
  { id: "murph", name: "Murph", type: "time", desc: t("crossfit.bench.murph"),
    moves: [{ reps: "1600 m", name: "Course (m)", kg: 9 }, { reps: "100", name: "Tractions", kg: 9 }, { reps: "200", name: "Pompes", kg: 9 }, { reps: "300", name: "Air squats", kg: 9 }, { reps: "1600 m", name: "Course (m)", kg: 9 }] }
];
const LIFTS = ["bsquat", "fsquat", "dl", "clean", "cj", "snatch", "spress", "ppress", "bench"].map(id => [id, t("crossfit.lifts." + id)]);

function discOf(d) { return d && d.disc ? d.disc : "muscu"; }
// Nom et couleur d'une séance. name / short : affichés (traduits) ; ref : nom de référence en français (statistiques).
function dayMeta(d, types) {
  const disc = discOf(d), ref = id => tFr("valeurs.seances." + id);
  if (disc === "course") { const r = RUN_TYPES.find(x => x.id === d.runType); return { disc, ref: r ? r.ref : ref("course"), name: r ? r.name : DISC.course.name, short: r ? r.short : t("seances.court.course"), color: r ? r.color : DISC.course.color }; }
  if (disc === "crossfit") return { disc, ref: ref("crossfit"), name: DISC.crossfit.name, short: DISC.crossfit.name, color: DISC.crossfit.color };
  if (disc === "calis") return { disc, ref: ref("calis"), name: DISC.calis.name, short: t("seances.court.calis"), color: DISC.calis.color };
  if (disc === "hyrox") return { disc, ref: ref("hyrox"), name: DISC.hyrox.name, short: DISC.hyrox.name, color: DISC.hyrox.color };
  if (disc === "cordes" || d.typeId === "cordes") return { disc: "cordes", ref: ref("cordes"), name: DISC.cordes.name, short: DISC.cordes.name, color: DISC.cordes.color };
  const ty = (types || S.types).find(x => x.id === d.typeId);
  return { disc, ref: ty ? ty.name : ref("muscu"), name: ty ? nomType(ty.name) : DISC.muscu.name, short: ty ? nomType(ty.name) : t("seances.court.muscu"), color: ty ? ty.color : "#8A847E" };
}
// Couleur d'un nom de référence (statistiques), et ce nom à l'affichage.
function nameColor(n) {
  const all = [...DEFAULT_TYPES.map(x => [x.name, x.color]), ...RUN_TYPES.map(r => [r.ref, r.color]), ...["crossfit", "calis", "cordes", "hyrox"].map(id => [tFr("valeurs.seances." + id), DISC[id].color])];
  const f = all.find(x => x[0] === n); return f ? f[1] : "#8A847E";
}
const nomRef = n => valeur("valeurs.seances", valeur("valeurs.types", n));
function exVolume(ex) { return (ex.sets || []).reduce((a, s) => a + ((+s.reps || 0) * (+s.kg || 0)), 0); }
function dayVolume(d) { return discOf(d) !== "muscu" ? 0 : (d.exercises || []).reduce((a, e) => a + exVolume(e), 0); }
function runSecs(r) { return r ? (+r.h || 0) * 3600 + (+r.m || 0) * 60 + (+r.s || 0) : 0; }
// Course, blocs (seuil, fractionné) : distance d'un bloc en km. Mètres et km directs ;
// une durée (min, s) se convertit avec l'allure cible (« 4:30 »), sinon 0.
function blocKm(b, runType) {
  const n = +b.rep || 1, e = +b.eff || 0, u = b.unit || (runType === "seuil" ? "min" : "m");
  if (u === "m") return n * e / 1000; if (u === "km") return n * e;
  const p = String(b.pace || "").match(/(\d+)\s*[:']\s*(\d{1,2})/), sec = p ? +p[1] * 60 + +p[2] : 0;
  return sec ? n * e * (u === "min" ? 60 : 1) / sec : 0;
}
// Un bloc compte une fois validé. Les blocs d'avant la validation (sans « fini ») sont déjà réalisés.
const blocDone = b => b.fini !== false;
const blocsRun = d => !!d.runType && d.runType !== "ef";
// Anciennes séances seuil / fractionné : la distance saisie dans « Ma sortie » reste prioritaire.
const blocsLegacy = r => !(r.blocks || []).some(b => "fini" in b);
function blocsKm(d) { return (d.run.blocks || []).filter(blocDone).reduce((a, b) => a + blocKm(b, d.runType), 0); }
// Distance de « Ma sortie » (avec sa durée) : seule base des allures et vitesses.
function sortieKm(d) { const r = d.run || {}; return blocsRun(d) && !blocsLegacy(r) ? 0 : +r.dist || 0; }
function runKm(d) {
  if (discOf(d) !== "course" || !d.run) return 0;
  const r = d.run, dist = +r.dist || 0;
  if (!blocsRun(d) || (dist && blocsLegacy(r))) return dist;
  return Math.round(blocsKm(d) * 1000) / 1000;
}
// 800 m, 1 km, 6,4 km
function fmtKm(km) { const m = Math.round(km * 1000); return m < 1000 ? m + " m" : nf.format(Math.round(m / 100) / 10) + " km"; }
function fmtDur(sec) { const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = Math.round(sec % 60); return h ? t("commun.dureeHeures", { h: String(h), m: pad(m) }) : `${m}:${pad(s)}`; }
function runPace(r) { const t = runSecs(r), dist = +r.dist || 0; if (!t || !dist) return ""; const p = t / dist; return Math.floor(p / 60) + ":" + pad(Math.round(p % 60)); }
function runCalcHTML(r) {
  const sec = runSecs(r), dist = +(r && r.dist) || 0;
  if (!sec || !dist) return `<span class="hint">${t("course.calculAide")}</span>`;
  return `<span><b>${runPace(r)}</b> /km</span><span><b>${nf.format(dist / (sec / 3600))}</b> km/h</span><span>${t("course.auTotal", { duree: `<b>${fmtDur(sec)}</b>` })}</span>`;
}
// "1:30" -> 90, "90" -> 90, "2 min" -> 120
function parseClock(v) {
  const s = String(v || "").trim(); if (!s) return 0;
  const m = s.match(/^(\d+)\s*[:']\s*(\d{1,2})/); if (m) return +m[1] * 60 + +m[2];
  const n = parseFloat(s.replace(",", ".")); if (!isFinite(n)) return 0;
  return /min/i.test(s) ? Math.round(n * 60) : Math.round(n);
}
function wodScore(w) {
  if (!w) return "";
  const f = w.format;
  if (f === "AMRAP") return w.rounds !== "" && w.rounds != null ? t(w.reps ? "crossfit.score.toursReps" : "crossfit.score.tours", { n: +w.rounds || 0, reps: w.reps }) : "";
  if (f === "EMOM") return w.rounds ? t("crossfit.score.emom", { n: +w.rounds || 0 }) : "";
  if (f === "Tabata") return w.rounds ? t("crossfit.score.reps", { n: +w.rounds || 0 }) : "";
  if (f === "Force") return w.kg ? `${nf.format(w.kg)} kg` : "";
  return (w.sMin !== "" && w.sMin != null) || w.sSec ? `${+w.sMin || 0}:${pad(+w.sSec || 0)}` : "";
}
function isEmpty(d) {
  if (!d) return true;
  const w = d.wod || {}, r = d.run || {};
  return !String(d.title || "").trim() && !d.typeId && !d.runType && !(d.exercises || []).length && !d.mood && !String(d.note || "").trim()
    && !(d.photos || []).length && !d.rpe
    && !r.dist && !runSecs(r) && !r.fc && !r.dplus && !(r.blocks || []).some(b => b.rep || b.eff || b.pace || b.rec)
    && !w.format && !String(w.name || "").trim() && !w.cap && !(w.moves || []).some(m => m.name || m.reps) && !String(w.strength || "").trim()
    && !wodScore({ ...w, format: w.format || "For Time" }) && !w.rounds && !w.kg && w.rx == null;
}
function titleOf(d, types) { // titre tapé par l'utilisateur, nom du WOD, sinon nom de la séance (traduit)
  const t = String(d.title || "").trim(); if (t) return t;
  if (discOf(d) === "crossfit" && d.wod && String(d.wod.name || "").trim()) return d.wod.name.trim();
  return dayMeta(d, types).name;
}
function avatarHTML(p, size) {
  const s = size || 40, ph = p && p.photo;
  const ini = ((p && (p.pseudo || p.prenom)) || "?").trim().charAt(0) || "?";
  return `<span class="avatar" style="--s:${s}px">${ph ? `<img src="${esc(ph)}" alt="">` : esc(ini)}</span>`;
}
function armed(btn, label) {
  if (btn.classList.contains("armed")) return true;
  const old = btn.textContent; btn.classList.add("armed"); btn.textContent = label;
  setTimeout(() => { if (btn.isConnected) { btn.classList.remove("armed"); btn.textContent = old; } }, 3000);
  return false;
}
function show(el, text) { el.textContent = text; el.hidden = false; }

export { $, BENCH, CALIS_MOVES, CF_MOVES, DEFAULT_SUPPS, DEFAULT_TYPES, DISC, EQUIP, EXERCISES, EmailAuthProvider, GROUPS,
  KEYWORDS, LIFTS, LOCAL, MAIN_DISC, MOODS, MUSCLES, OBJECTIFS, OBJETS, PALETTE, PROGRAMS, RUN_TYPES, S, TERMS_V,
  TYPES_V, WOD_FORMATS, WOD_HINTS, addDoc, ago, armed, arrayRemove, auth, avatarHTML, cap, clone, collection,
  createUserWithEmailAndPassword, dayMeta, dayOf, dayVolume, db, deleteDoc, deleteUser, discOf, doc, documentId, esc, exVolume,
  fmtCourt, fmtDate, fmtDur, fmtJour, fmtJourAn, fmtJourMois, fmtMois, fmtMoisAn, getDoc, getDocs, getDocsFromCache, hm, isEmpty, key, limit, limitToLast, nameColor, nf, numOr,
  jourCourt, nomEx, nomFormat, nomRef, nomType, onAuthStateChanged, onSnapshot, orderBy, pad, parse, parseClock, query, reauthenticateWithCredential, runCalcHTML,
  blocDone, blocKm, blocsLegacy, blocsRun, fmtKm, runKm, sortieKm, runPace, runSecs, sendPasswordResetEmail, sessionsOn, setDoc, show, signInWithEmailAndPassword, signOut, titleOf,
  todayK, typeOf, updateDoc, where, wodScore, writeBatch };
