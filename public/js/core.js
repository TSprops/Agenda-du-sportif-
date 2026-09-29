// Base : Firebase, constantes, état de l'app et petits utilitaires. Ne dépend d'aucun autre fichier.

import {
  initializeApp, getAuth, connectAuthEmulator, onAuthStateChanged, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut, sendPasswordResetEmail, deleteUser, reauthenticateWithCredential, EmailAuthProvider,
  initializeFirestore, connectFirestoreEmulator, persistentLocalCache, persistentMultipleTabManager,
  doc, collection, getDoc, getDocs, setDoc, updateDoc, deleteDoc, addDoc, onSnapshot, query, where, orderBy, limit, limitToLast, writeBatch,
  arrayRemove, documentId, getDocsFromCache
} from "../vendor/firebase.js";
import { firebaseConfig } from "../firebase-config.js";
import { MUSCLES, GROUPS, EQUIP, EXERCISES, KEYWORDS, PROGRAMS } from "../data.js";
/* ============================================================
   Constantes
   ============================================================ */
const TYPES_V = 2;
const TERMS_V = 1; // version des conditions d'utilisation acceptées
const DEFAULT_TYPES = [
  { id: "push", name: "Push", color: "#FF3B30" },
  { id: "pull", name: "Pull", color: "#3D8BFF" },
  { id: "jambes", name: "Jambes", color: "#2FBF71" },
  { id: "haut", name: "Haut du corps", color: "#A56BFF" },
  { id: "bas", name: "Bas du corps", color: "#FF9F0A" },
  { id: "cardio", name: "Cardio", color: "#19C3C3" },
  { id: "cordes", name: "Cordes", color: "#FF5FA2" },
  { id: "repos", name: "Repos", color: "#8A847E" }
];
const PALETTE = ["#FF3B30", "#3D8BFF", "#2FBF71", "#A56BFF", "#FF9F0A", "#19C3C3", "#FF5FA2", "#8A847E", "#C9D63A"];
const MOODS = ["En forme", "Normal", "Fatigué", "Douleur"];
const OBJECTIFS = ["Prise de masse", "Sèche", "Force", "Maintien de force", "Remise en forme", "Endurance"];
const OBJETS = ["Aide", "Réclamation", "Amélioration à suggérer", "Problème sur l’application"];
const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const DAYS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const DEFAULT_SUPPS = [["Whey", "30 g"], ["Oméga-3", "2 gélules"], ["Vitamine D", "1000 UI"], ["Magnésium", "300 mg"], ["Multivitamines", "1 comprimé"], ["Caféine", "200 mg"]];

/* ============================================================
   Firebase
   ============================================================ */
const LOCAL = ["localhost", "127.0.0.1"].includes(location.hostname);
const configured = !!(firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId);
const $ = id => document.getElementById(id);

if (!configured && !LOCAL) {
  document.querySelectorAll(".view").forEach(v => { v.hidden = true; });
  $("v-setup").hidden = false;
  throw new Error("firebase-config.js est vide");
}
// Tests en local : les émulateurs Firebase (port 5000) au lieu de la vraie base.
const EMU = LOCAL && (!configured || location.port === "5000");
const fbApp = initializeApp(EMU ? { apiKey: "demo-key", authDomain: "localhost", projectId: "demo-agenda" } : firebaseConfig);
const auth = getAuth(fbApp);
auth.languageCode = "fr"; // e-mails (mot de passe oublié…) envoyés en français
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
const nf = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });
const numOr = v => { const n = parseFloat(String(v).replace(",", ".")); return isFinite(n) ? n : ""; };
const todayK = () => key(new Date());
const hm = () => { const d = new Date(); return pad(d.getHours()) + ":" + pad(d.getMinutes()); };
function fmtDate(ts) { const d = new Date(ts); return d.getDate() + " " + MONTHS[d.getMonth()] + " " + d.getFullYear(); }
function ago(ts) {
  if (!ts) return "jamais";
  const days = Math.floor((new Date(todayK()) - new Date(key(new Date(ts)))) / 864e5);
  return days <= 0 ? "aujourd’hui" : days === 1 ? "hier" : days < 30 ? "il y a " + days + " jours" : fmtDate(ts);
}
/* Activités proposées quand on touche un jour du calendrier */
const DISC = {
  muscu: { name: "Musculation", color: "var(--red-hi)", desc: "Push, pull, jambes… séries, reps et charges",
    icon: '<path d="M6 7v10M18 7v10M3 9.5v5M21 9.5v5M6 12h12"/>' },
  crossfit: { name: "CrossFit", color: "#FFD60A", desc: "WOD, AMRAP, EMOM, For Time, records",
    icon: '<path d="M9 8a3 3 0 1 1 6 0"/><path d="M7 10h10l1.4 8.2A2 2 0 0 1 16.4 20.5H7.6a2 2 0 0 1-2-2.3z"/>' },
  calis: { name: "Callisthénie", color: "#C9D63A", desc: "Poids du corps : tractions, dips, figures…",
    icon: '<path d="M3 4h18M8 4v3M16 4v3"/><circle cx="12" cy="10" r="2"/><path d="M8 7l4 4.5L16 7M12 12v4.5M9 21l3-4.5 3 4.5"/>' },
  course: { name: "Course à pied", color: "#5AC8FA", desc: "Endurance fondamentale, seuil, fractionné",
    icon: '<circle cx="14.5" cy="4.5" r="2"/><path d="M7 21l3.5-6 3 2.5V22M5.5 11.5l3.5-3 4 1 2.5 3.5h3.5M10.5 15l-1.5-4.5"/>' },
  cordes: { name: "Cordes", color: "#FF5FA2", desc: "Montées de corde : nombre, départs, lest",
    icon: '<path d="M8 2h8"/><path d="M12 2c-3 2.5 3 4.5 0 7s3 4.5 0 7 3 4.5 0 6"/>' }
};
// Activités qui ont leurs pages Idées, Records et Progression.
const MAIN_DISC = ["muscu", "crossfit", "calis", "course"];
const RUN_TYPES = [
  { id: "ef", name: "Endurance fondamentale", short: "EF", color: "#5AC8FA", hint: "Allure facile : tu dois pouvoir parler en courant (60 à 75 % de ta FC max)." },
  { id: "seuil", name: "Seuil", short: "Seuil", color: "#FF7A45", hint: "Allure soutenue mais contrôlée, tenable 30 à 60 min en course (85 à 90 % de ta FC max)." },
  { id: "frac", name: "Fractionné", short: "Fract.", color: "#E040FB", hint: "Efforts courts et rapides entrecoupés de récupérations (VMA, côtes, 30/30…)." }
];
const WOD_FORMATS = ["For Time", "AMRAP", "EMOM", "Tabata", "Chipper", "Force"];
const WOD_HINTS = {
  "For Time": "Termine le travail le plus vite possible. Ton score = ton temps.",
  "AMRAP": "« As Many Rounds As Possible » : un maximum de tours dans le temps donné.",
  "EMOM": "« Every Minute On the Minute » : un bloc au début de chaque minute, repos le reste de la minute.",
  "Tabata": "8 tours de 20 s d’effort / 10 s de repos par mouvement.",
  "Chipper": "Une longue liste de mouvements à « grignoter » une seule fois, pour le temps.",
  "Force": "Travail de charge lourde (ex. 5×5, 1RM). Ton score = ta charge max."
};
const CALIS_MOVES = [["Tractions"], ["Dips"], ["Pompes"], ["Muscle-up"], ["Squats"], ["Pistol squat"], ["Tractions australiennes"], ["Handstand push-up"],
  ["Front lever", 1], ["Back lever", 1], ["Planche", 1], ["Handstand", 1], ["L-sit", 1], ["Human flag", 1], ["Gainage", 1]];
const CF_MOVES = ["Thrusters", "Tractions", "Burpees", "Wall balls", "Kettlebell swings", "Box jumps", "Double unders", "Toes to bar", "Muscle-ups",
  "Handstand push-ups", "Clean", "Power clean", "Snatch", "Power snatch", "Clean & jerk", "Soulevé de terre", "Front squat", "Back squat",
  "Overhead squat", "Push press", "Rameur (m)", "Course (m)", "Air bike (cal)", "Sit-ups", "Pompes", "Air squats", "Lunges", "Rope climb"];
// WOD de référence (« Girls » et « Hero WODs ») : charges homme / femme.
const BENCH = [
  { id: "fran", name: "Fran", type: "time", desc: "21-15-9 : Thrusters (43/29 kg), Tractions",
    moves: [{ reps: "21-15-9", name: "Thrusters", kg: 43 }, { reps: "21-15-9", name: "Tractions", kg: "" }] },
  { id: "grace", name: "Grace", type: "time", desc: "30 Clean & jerks (61/43 kg)", moves: [{ reps: "30", name: "Clean & jerk", kg: 61 }] },
  { id: "isabel", name: "Isabel", type: "time", desc: "30 Snatchs (61/43 kg)", moves: [{ reps: "30", name: "Snatch", kg: 61 }] },
  { id: "diane", name: "Diane", type: "time", desc: "21-15-9 : Soulevé de terre (102/70 kg), Handstand push-ups",
    moves: [{ reps: "21-15-9", name: "Soulevé de terre", kg: 102 }, { reps: "21-15-9", name: "Handstand push-ups", kg: "" }] },
  { id: "elizabeth", name: "Elizabeth", type: "time", desc: "21-15-9 : Squat cleans (61/43 kg), Dips aux anneaux",
    moves: [{ reps: "21-15-9", name: "Squat clean", kg: 61 }, { reps: "21-15-9", name: "Dips aux anneaux", kg: "" }] },
  { id: "helen", name: "Helen", type: "time", desc: "3 tours : 400 m course, 21 KB swings (24/16 kg), 12 tractions",
    moves: [{ reps: "3 tours", name: "Course (m) 400", kg: "" }, { reps: "21", name: "Kettlebell swings", kg: 24 }, { reps: "12", name: "Tractions", kg: "" }] },
  { id: "karen", name: "Karen", type: "time", desc: "150 Wall balls (9/6 kg)", moves: [{ reps: "150", name: "Wall balls", kg: 9 }] },
  { id: "annie", name: "Annie", type: "time", desc: "50-40-30-20-10 : Double unders, Sit-ups",
    moves: [{ reps: "50-40-30-20-10", name: "Double unders", kg: "" }, { reps: "50-40-30-20-10", name: "Sit-ups", kg: "" }] },
  { id: "jackie", name: "Jackie", type: "time", desc: "1000 m rameur, 50 Thrusters (20/15 kg), 30 Tractions",
    moves: [{ reps: "1000 m", name: "Rameur (m)", kg: "" }, { reps: "50", name: "Thrusters", kg: 20 }, { reps: "30", name: "Tractions", kg: "" }] },
  { id: "cindy", name: "Cindy", type: "amrap", cap: 20, desc: "AMRAP 20 min : 5 Tractions, 10 Pompes, 15 Air squats",
    moves: [{ reps: "5", name: "Tractions", kg: "" }, { reps: "10", name: "Pompes", kg: "" }, { reps: "15", name: "Air squats", kg: "" }] },
  { id: "murph", name: "Murph", type: "time", desc: "1,6 km course, 100 tractions, 200 pompes, 300 squats, 1,6 km course (gilet 9/6 kg)",
    moves: [{ reps: "1600 m", name: "Course (m)", kg: 9 }, { reps: "100", name: "Tractions", kg: 9 }, { reps: "200", name: "Pompes", kg: 9 }, { reps: "300", name: "Air squats", kg: 9 }, { reps: "1600 m", name: "Course (m)", kg: 9 }] }
];
const LIFTS = [["bsquat", "Back squat"], ["fsquat", "Front squat"], ["dl", "Soulevé de terre"], ["clean", "Clean"], ["cj", "Clean & jerk"],
  ["snatch", "Snatch"], ["spress", "Strict press"], ["ppress", "Push press"], ["bench", "Développé couché"]];

function discOf(d) { return d && d.disc ? d.disc : "muscu"; }
function dayMeta(d, types) {
  const disc = discOf(d);
  if (disc === "course") { const r = RUN_TYPES.find(x => x.id === d.runType); return { disc, name: r ? r.name : "Course à pied", short: r ? r.short : "Course", color: r ? r.color : DISC.course.color }; }
  if (disc === "crossfit") return { disc, name: "CrossFit", short: "CrossFit", color: DISC.crossfit.color };
  if (disc === "calis") return { disc, name: "Callisthénie", short: "Calis", color: DISC.calis.color };
  if (disc === "cordes" || d.typeId === "cordes") return { disc: "cordes", name: "Cordes", short: "Cordes", color: DISC.cordes.color };
  const t = (types || S.types).find(x => x.id === d.typeId);
  return { disc, name: t ? t.name : "Musculation", short: t ? t.name : "Muscu", color: t ? t.color : "#8A847E" };
}
function nameColor(n) {
  const all = [...DEFAULT_TYPES.map(t => [t.name, t.color]), ...RUN_TYPES.map(r => [r.name, r.color]), ["CrossFit", DISC.crossfit.color], ["Callisthénie", DISC.calis.color], ["Cordes", DISC.cordes.color]];
  const f = all.find(x => x[0] === n); return f ? f[1] : "#8A847E";
}
function exVolume(ex) { return (ex.sets || []).reduce((a, s) => a + ((+s.reps || 0) * (+s.kg || 0)), 0); }
function dayVolume(d) { return discOf(d) !== "muscu" ? 0 : (d.exercises || []).reduce((a, e) => a + exVolume(e), 0); }
function runSecs(r) { return r ? (+r.h || 0) * 3600 + (+r.m || 0) * 60 + (+r.s || 0) : 0; }
function runKm(d) { return discOf(d) === "course" && d.run ? (+d.run.dist || 0) : 0; }
function fmtDur(sec) { const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = Math.round(sec % 60); return h ? `${h} h ${pad(m)}` : `${m}:${pad(s)}`; }
function runPace(r) { const t = runSecs(r), dist = +r.dist || 0; if (!t || !dist) return ""; const p = t / dist; return Math.floor(p / 60) + ":" + pad(Math.round(p % 60)); }
function runCalcHTML(r) {
  const t = runSecs(r), dist = +(r && r.dist) || 0;
  if (!t || !dist) return `<span class="hint">Entre la distance et la durée : ton allure et ta vitesse se calculent toutes seules.</span>`;
  return `<span><b>${runPace(r)}</b> /km</span><span><b>${nf.format(dist / (t / 3600))}</b> km/h</span><span><b>${fmtDur(t)}</b> au total</span>`;
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
  if (f === "AMRAP") return w.rounds !== "" && w.rounds != null ? `${w.rounds} tours${w.reps ? " + " + w.reps : ""}` : "";
  if (f === "EMOM") return w.rounds ? `${w.rounds} min réussies` : "";
  if (f === "Tabata") return w.rounds ? `${w.rounds} reps` : "";
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
function titleOf(d, types) {
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
const plural = (n, w) => n + " " + w + (n > 1 ? "s" : "");
function show(el, text) { el.textContent = text; el.hidden = false; }

export { $, BENCH, CALIS_MOVES, CF_MOVES, DAYS, DEFAULT_SUPPS, DEFAULT_TYPES, DISC, EQUIP, EXERCISES, EmailAuthProvider, GROUPS,
  KEYWORDS, LIFTS, LOCAL, MAIN_DISC, MONTHS, MOODS, MUSCLES, OBJECTIFS, OBJETS, PALETTE, PROGRAMS, RUN_TYPES, S, TERMS_V,
  TYPES_V, WOD_FORMATS, WOD_HINTS, addDoc, ago, armed, arrayRemove, auth, avatarHTML, cap, clone, collection,
  createUserWithEmailAndPassword, dayMeta, dayOf, dayVolume, db, deleteDoc, deleteUser, discOf, doc, documentId, esc, exVolume,
  fmtDate, fmtDur, getDoc, getDocs, getDocsFromCache, hm, isEmpty, key, limit, limitToLast, nameColor, nf, numOr,
  onAuthStateChanged, onSnapshot, orderBy, pad, parse, parseClock, plural, query, reauthenticateWithCredential, runCalcHTML,
  runKm, runPace, runSecs, sendPasswordResetEmail, sessionsOn, setDoc, show, signInWithEmailAndPassword, signOut, titleOf,
  todayK, typeOf, updateDoc, where, wodScore, writeBatch };
