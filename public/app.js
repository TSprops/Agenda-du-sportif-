import {
  initializeApp, getAuth, connectAuthEmulator, onAuthStateChanged, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut, sendPasswordResetEmail, deleteUser, reauthenticateWithCredential, EmailAuthProvider,
  initializeFirestore, connectFirestoreEmulator, persistentLocalCache, persistentMultipleTabManager,
  doc, collection, getDoc, getDocs, setDoc, updateDoc, deleteDoc, addDoc, onSnapshot, query, where, orderBy, limit, limitToLast, writeBatch,
  arrayRemove
} from "./vendor/firebase.js";
import { firebaseConfig } from "./firebase-config.js";
import { MUSCLES, GROUPS, EQUIP, EXERCISES, KEYWORDS, PROGRAMS } from "./data.js";

/* Version : si la page et le code ne correspondent pas (ancien fichier en cache), on recharge proprement. */
const APP_VERSION = "16";
if (window.APP_PAGE_VERSION !== APP_VERSION) {
  let tried = false; try { tried = sessionStorage.getItem("reload-v" + APP_VERSION) === "1"; sessionStorage.setItem("reload-v" + APP_VERSION, "1"); } catch (e) { /* stockage bloqué */ }
  if (!tried && window.__repairApp) { window.__repairApp(); throw new Error("Mise à jour en cours"); }
  if (!tried) { location.replace(location.pathname + "?r=" + Date.now()); throw new Error("Mise à jour en cours"); }
}

/* ============================================================
   Constantes
   ============================================================ */
const TYPES_V = 2;
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
const fbApp = initializeApp(configured ? firebaseConfig : { apiKey: "demo-key", authDomain: "localhost", projectId: "demo-agenda" });
const auth = getAuth(fbApp);
const db = initializeFirestore(fbApp, LOCAL && !configured ? {} : { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
if (LOCAL && !configured) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}

/* ============================================================
   Apparence (couleur principale et mode clair / sombre)
   ============================================================ */
const ACCENTS = [
  { id: "rouge", name: "Rouge", c: "#E3161F", hi: "#FF2B34", on: "#FFFFFF" },
  { id: "bleu", name: "Bleu", c: "#1F6FEB", hi: "#4C8DFF", on: "#FFFFFF" },
  { id: "vert", name: "Vert", c: "#16A34A", hi: "#2FD073", on: "#FFFFFF" },
  { id: "violet", name: "Violet", c: "#7C3AED", hi: "#A07BFF", on: "#FFFFFF" },
  { id: "orange", name: "Orange", c: "#EA6A12", hi: "#FF8A3D", on: "#FFFFFF" },
  { id: "rose", name: "Rose", c: "#DB2777", hi: "#FF5E9A", on: "#FFFFFF" },
  { id: "or", name: "Or", c: "#D4A017", hi: "#F5C542", on: "#111111" },
  { id: "argent", name: "Argent", c: "#D9D6D2", hi: "#FFFFFF", on: "#111111", light: "#3A3A40" }
];
const BGS = [
  { id: "noir", name: "Sombre", ground: "#0A0A0B", ink: "#F4F1EE" },
  { id: "anthracite", name: "Anthracite", ground: "#16171A", ink: "#F4F1EE" },
  { id: "clair", name: "Clair", ground: "#F3F1EE", ink: "#171514" }
];
function applyTheme(t) {
  t = t || {};
  const a = ACCENTS.find(x => x.id === t.accent) || ACCENTS[0], bg = BGS.find(x => x.id === t.bg) || BGS[0], light = bg.id === "clair";
  const r = document.documentElement, c = light && a.light ? a.light : a.c;
  r.dataset.bg = bg.id;
  r.style.setProperty("--red", c);
  r.style.setProperty("--red-hi", light ? `color-mix(in srgb, ${c} 85%, #000)` : a.hi);
  r.style.setProperty("--on-red", light && a.light ? "#FFFFFF" : a.on);
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute("content", bg.ground);
  try { localStorage.setItem("theme", JSON.stringify({ accent: a.id, bg: bg.id })); } catch (e) { /* stockage bloqué */ }
}
try { applyTheme(JSON.parse(localStorage.getItem("theme") || "{}")); } catch (e) { applyTheme({}); }
function currentTheme() { try { return JSON.parse(localStorage.getItem("theme") || "{}"); } catch (e) { return {}; } }
function renderTheme() {
  const t = currentTheme();
  $("accentList").innerHTML = ACCENTS.map(a => `<button type="button" class="swatch-btn" data-accent="${a.id}" style="--sw:${t.bg === "clair" && a.light ? a.light : a.c}" aria-pressed="${(t.accent || "rouge") === a.id}"><i></i>${a.name}</button>`).join("");
  $("bgList").innerHTML = BGS.map(b => `<button type="button" class="mode-btn" data-bg="${b.id}" aria-pressed="${(t.bg || "noir") === b.id}"><span class="mode-prev" style="--pg:${b.ground};--pi:${b.ink}"><b></b><u></u></span>${b.name}</button>`).join("");
}
function setTheme(patch) {
  const t = { ...currentTheme(), ...patch };
  applyTheme(t); renderTheme();
  if (S.profile) saveProfile({ theme: { accent: t.accent || "rouge", bg: t.bg || "noir" } });
}
$("themeCard").addEventListener("click", e => {
  const a = e.target.closest("[data-accent]"); if (a) { setTheme({ accent: a.dataset.accent }); return; }
  const b = e.target.closest("[data-bg]"); if (b) setTheme({ bg: b.dataset.bg });
});

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
    icon: '<circle cx="14.5" cy="4.5" r="2"/><path d="M7 21l3.5-6 3 2.5V22M5.5 11.5l3.5-3 4 1 2.5 3.5h3.5M10.5 15l-1.5-4.5"/>' }
};
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
  const t = (types || S.types).find(x => x.id === d.typeId);
  return { disc, name: t ? t.name : "Musculation", short: t ? t.name : "Muscu", color: t ? t.color : "#8A847E" };
}
function nameColor(n) {
  const all = [...DEFAULT_TYPES.map(t => [t.name, t.color]), ...RUN_TYPES.map(r => [r.name, r.color]), ["CrossFit", DISC.crossfit.color], ["Callisthénie", DISC.calis.color]];
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

/* ============================================================
   Accès aux données
   ============================================================ */
const userRef = (uid = S.uid) => doc(db, "users", uid);
const subCol = (name, uid = S.uid) => collection(db, "users", uid, name);
const subDoc = (name, id, uid = S.uid) => doc(db, "users", uid, name, id);
let pChain = Promise.resolve(), dChain = Promise.resolve(), nChain = Promise.resolve();

function applyProfile() {
  const p = S.profile; if (!p) return;
  S.types = (p.typesV === TYPES_V && Array.isArray(p.types) && p.types.length) ? clone(p.types) : DEFAULT_TYPES.map(t => ({ ...t }));
  S.prefs = { creaDose: 5, ...(p.prefs || {}) };
  if (p.theme) { const cur = currentTheme(); if (cur.accent !== p.theme.accent || cur.bg !== p.theme.bg) applyTheme(p.theme); }
}
function saveProfile(patch) {
  S.profile = { ...(S.profile || {}), ...patch, updatedAt: Date.now() }; applyProfile();
  const data = clone(S.profile);
  pChain = pChain.catch(() => {}).then(() => setDoc(userRef(), data, { merge: true }));
  syncStats();
  return pChain;
}
function persistDay(k, data) {
  const ref = subDoc("seances", k);
  dChain = dChain.then(() => data ? setDoc(ref, data) : deleteDoc(ref))
    .then(() => setSave(""))
    .catch(() => setSave("Non enregistré : vérifie ta connexion"));
  syncStats();
}
function persistTypes() { saveProfile({ types: clone(S.types), typesV: TYPES_V }); }
function savePrefs() { saveProfile({ prefs: { ...S.prefs } }); }

// Résumé d'activité lu par l'administrateur (stocké dans le document de l'utilisateur).
let statsTimer = null;
function syncStats() {
  if (!S.uid || !S.profile) return;
  clearTimeout(statsTimer);
  statsTimer = setTimeout(() => {
    const ks = Object.keys(S.days).sort(), byType = {};
    let ex = 0, vol = 0, photos = 0;
    ks.forEach(k => {
      const d = S.days[k], n = dayMeta(d).name;
      byType[n] = (byType[n] || 0) + 1; ex += (d.exercises || []).length; vol += dayVolume(d); photos += (d.photos || []).length;
    });
    const nk = Object.keys(S.nut);
    const stats = {
      seances: ks.length, lastSeance: ks[ks.length - 1] || null, exercices: ex, volume: Math.round(vol), photos, byType,
      km: Math.round(ks.reduce((a, k) => a + runKm(S.days[k]), 0) * 10) / 10,
      creatineDays: nk.filter(k => S.nut[k].creatine).length,
      complements: nk.reduce((a, k) => a + (S.nut[k].complements || []).length, 0)
    };
    setDoc(userRef(), { stats, lastSeen: Date.now() }, { merge: true }).catch(() => {});
    syncShare(); syncChallenges();
  }, 1500);
}

/* ============================================================
   Navigation
   ============================================================ */
const RENDER = {
  home: renderHome, seances: renderMain, nutrition: renderNutrition, complements: renderNutrition, creatine: renderNutrition,
  contact: renderContact, profile: renderProfile, admin: renderAdmin, onboard: renderOnboard, friends: renderFriends, friend: renderFriend, chat: renderChat, go: renderGo, social: renderSocial, messages: renderMessages, feed: () => loadFeed(false), challenges: renderChallenges, challenge: renderChallenge, ranks: renderRanks, muscles: renderMuscles, recap: renderRecap, routines: renderRoutines, routine: renderRoutine, programs: renderPrograms, crossfit: renderCrossfit, types: renderTypesHub, hub: renderHub, records: renderRecordsHub, rec: renderRec, progress: renderProgHub, prog: renderProg
};
function go(v) {
  if (v === "complements" && !S.cpDay) S.cpDay = todayK();
  if (v === "creatine" && !S.crView) { const t = new Date(); S.crView = new Date(t.getFullYear(), t.getMonth(), 1); }
  if (v === "contactform") { $("ctForm").hidden = false; $("ctDone").hidden = true; $("ctErr").hidden = true; renderObjets(); }
  S.screen = v;
  document.querySelectorAll(".view").forEach(el => { el.hidden = el.id !== "v-" + v; });
  RENDER[v] && RENDER[v]();
  window.scrollTo(0, 0);
  if (!$("helpPanel").hidden && !FAB_SCREENS.includes(v)) $("helpPanel").hidden = true;
  updateFab();
  if (v !== "chat") leaveChat();
  if (v === "home") { maybeNews(); maybeInvite(); }
}
function refresh() {
  if (S.screen === "profile") renderPfStats();
  else if (!["contactform", "auser", "login", "onboard", "splash"].includes(S.screen) && RENDER[S.screen]) RENDER[S.screen]();
}
document.addEventListener("click", e => { const b = e.target.closest("[data-go]"); if (b) go(b.dataset.go); });

/* ============================================================
   Connexion / inscription
   ============================================================ */
let authMode = "in";
function setAuthMode(m) {
  authMode = m;
  $("tabIn").setAttribute("aria-selected", String(m === "in"));
  $("tabUp").setAttribute("aria-selected", String(m === "up"));
  $("auSubmit").textContent = m === "in" ? "Se connecter" : "Créer mon compte";
  $("auPass").autocomplete = m === "in" ? "current-password" : "new-password";
  $("auForgot").hidden = m !== "in";
  $("auErr").hidden = true; $("auOk").hidden = true;
}
$("tabIn").onclick = () => setAuthMode("in");
$("tabUp").onclick = () => setAuthMode("up");
const AUTH_ERRORS = {
  "auth/invalid-email": "Cette adresse e-mail n’est pas valide.",
  "auth/email-already-in-use": "Un compte existe déjà avec cet e-mail. Connecte-toi plutôt.",
  "auth/weak-password": "Choisis un mot de passe d’au moins 6 caractères.",
  "auth/invalid-credential": "E-mail ou mot de passe incorrect.",
  "auth/wrong-password": "Mot de passe incorrect.",
  "auth/user-not-found": "Aucun compte avec cet e-mail.",
  "auth/too-many-requests": "Trop d’essais. Patiente quelques minutes puis réessaie.",
  "auth/network-request-failed": "Pas de connexion internet. Vérifie ton réseau.",
  "auth/missing-password": "Entre ton mot de passe."
};
const authMsg = e => AUTH_ERRORS[e && e.code] || "Une erreur est survenue. Réessaie.";
$("authForm").addEventListener("submit", async e => {
  e.preventDefault();
  const email = $("auEmail").value.trim(), pass = $("auPass").value;
  $("auErr").hidden = true; $("auOk").hidden = true;
  const btn = $("auSubmit"), label = btn.textContent; btn.disabled = true; btn.textContent = "Un instant…";
  try {
    if (authMode === "in") await signInWithEmailAndPassword(auth, email, pass);
    else await createUserWithEmailAndPassword(auth, email, pass);
    $("auPass").value = "";
  } catch (err) { show($("auErr"), authMsg(err)); }
  btn.disabled = false; btn.textContent = label;
});
$("auForgot").onclick = async () => {
  const email = $("auEmail").value.trim();
  $("auErr").hidden = true; $("auOk").hidden = true;
  if (!email) { show($("auErr"), "Entre ton e-mail ci-dessus, puis touche « Mot de passe oublié ? »."); return; }
  try { await sendPasswordResetEmail(auth, email); show($("auOk"), "E-mail envoyé. Suis le lien reçu pour choisir un nouveau mot de passe."); }
  catch (err) { show($("auErr"), authMsg(err)); }
};

/* ============================================================
   Champs de profil (inscription et page profil)
   ============================================================ */
function fieldsHTML(px, p) {
  p = p || {};
  return `<div style="display:flex;flex-direction:column;gap:12px">
  <label class="avatar-pick" for="${px}-photo"><span id="${px}-av">${avatarHTML(p, 64)}</span><span><b>Photo de profil</b><span class="hint">Touche pour ${p.photo ? "changer" : "ajouter"} ta photo</span></span><input id="${px}-photo" type="file" accept="image/*" data-px="${px}"></label>
  <label class="field"><span>Pseudo *</span><input id="${px}-pseudo" value="${esc(p.pseudo)}" placeholder="ex. TheoFit" required maxlength="30"></label>
  <div class="grid2"><label class="field"><span>Prénom</span><input id="${px}-prenom" value="${esc(p.prenom)}" maxlength="40"></label><label class="field"><span>Nom</span><input id="${px}-nom" value="${esc(p.nom)}" maxlength="40"></label></div>
  <div class="grid3"><label class="field"><span>Âge</span><input id="${px}-age" inputmode="numeric" value="${esc(p.age)}" placeholder="ans"></label><label class="field"><span>Taille</span><input id="${px}-taille" inputmode="numeric" value="${esc(p.taille)}" placeholder="cm"></label><label class="field"><span>Poids</span><input id="${px}-poids" inputmode="decimal" value="${esc(p.poids)}" placeholder="kg"></label></div>
  <div class="field"><span>Objectif</span><div class="chips" id="${px}-obj">${OBJECTIFS.map(o => `<button type="button" class="chip" data-obj="${esc(o)}" aria-pressed="${p.objectif === o}">${esc(o)}</button>`).join("")}</div></div>
  </div>`;
}
function readFields(px) {
  const v = id => $(px + "-" + id).value.trim();
  const sel = document.querySelector(`#${px}-obj [aria-pressed="true"]`);
  const out = { pseudo: v("pseudo"), prenom: v("prenom"), nom: v("nom"), age: numOr(v("age")), taille: numOr(v("taille")), poids: numOr(v("poids")), objectif: sel ? sel.dataset.obj : "" };
  if (S.formPhoto[px] !== undefined) out.photo = S.formPhoto[px];
  return out;
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-obj]"); if (!b) return;
  const was = b.getAttribute("aria-pressed") === "true";
  b.parentElement.querySelectorAll("[data-obj]").forEach(x => x.setAttribute("aria-pressed", "false"));
  b.setAttribute("aria-pressed", String(!was));
});
document.addEventListener("change", async e => {
  const px = e.target.dataset.px; if (!px || !e.target.files[0]) return;
  try {
    const b = await compress(e.target.files[0], 320, .82);
    S.formPhoto[px] = await blobToData(b);
    $(px + "-av").innerHTML = avatarHTML({ photo: S.formPhoto[px] }, 64);
  } catch (err) { /* image illisible : on garde l'ancienne */ }
  e.target.value = "";
});

function renderOnboard() { if (!$("su-pseudo")) { S.formPhoto.su = undefined; $("suFields").innerHTML = fieldsHTML("su", {}); } }
$("signup").addEventListener("submit", async e => {
  e.preventDefault();
  const f = readFields("su");
  if (!f.pseudo) { show($("suErr"), "Choisis un pseudo pour terminer ton inscription."); return; }
  $("suErr").hidden = true;
  try {
    await saveProfile({
      ...f, photo: f.photo || null, email: S.email, createdAt: Date.now(), visits: 1, lastSeen: Date.now(),
      typesV: TYPES_V, types: DEFAULT_TYPES.map(t => ({ ...t })), prefs: { creaDose: 5 }, goal: 3, seen: { amis1: true, v2: true }
    });
    S.visitCounted = true;
    subscribeData(); ensureSocialProfile(); subscribeSocial(); go("home"); openTuto();
  } catch (err) { S.profile = null; show($("suErr"), "Impossible d’enregistrer ton profil. Vérifie ta connexion et réessaie."); }
});

/* ============================================================
   Page profil
   ============================================================ */
function renderPfStats() {
  const p = S.profile || {}, ks = Object.keys(S.days);
  const cd = Object.keys(S.nut).filter(k => S.nut[k].creatine).length;
  $("pfStats").innerHTML = `<div class="stat"><b>${ks.length}</b><span>séance${ks.length > 1 ? "s" : ""}</span></div><div class="stat"><b>${cd}</b><span>jour${cd > 1 ? "s" : ""} de créatine</span></div><div class="stat"><b style="font-size:17px;line-height:1.6">${p.createdAt ? esc(fmtDate(p.createdAt)) : "–"}</b><span>membre depuis</span></div>`;
}
function renderPfView(msg) {
  const p = S.profile || {}, dash = v => (v === "" || v == null) ? `<dd class="none">Non renseigné</dd>` : `<dd>${esc(v)}</dd>`;
  $("pfView").innerHTML = `<div class="pf-top">${avatarHTML(p, 72)}<div><b>${esc(p.pseudo || "")}</b>${p.objectif ? `<span class="tag">${esc(p.objectif)}</span>` : ""}</div></div>
    <dl class="kv"><dt>Prénom</dt>${dash(p.prenom)}<dt>Nom</dt>${dash(p.nom)}<dt>Âge</dt>${dash(p.age ? p.age + " ans" : "")}<dt>Taille</dt>${dash(p.taille ? p.taille + " cm" : "")}<dt>Poids</dt>${dash(p.poids ? nf.format(p.poids) + " kg" : "")}<dt>Objectif</dt>${dash(p.objectif)}</dl>
    ${msg ? `<p class="ok-msg">${esc(msg)}</p>` : ""}
    <button type="button" class="btn" id="pfEdit">Modifier</button>`;
  $("pfView").hidden = false; $("pfForm").hidden = true;
  $("pfEdit").onclick = () => {
    S.formPhoto.pf = undefined; $("pfFields").innerHTML = fieldsHTML("pf", S.profile); $("pfMsg").hidden = true;
    $("pfView").hidden = true; $("pfForm").hidden = false; $("pfForm").scrollIntoView({ block: "start", behavior: "smooth" });
  };
}
$("pfCancel").onclick = () => renderPfView();
function renderProfile() {
  renderPfView(); refreshInstallBtn(); renderTheme(); renderSound();
  $("pfEmail").textContent = "Connecté avec " + (S.email || "ton e-mail");
  $("pwMsg").hidden = true; $("delForm").hidden = true; $("delAccount").hidden = false; $("delErr").hidden = true;
  $("adminBtn").hidden = !S.admin; renderPfStats();
}
$("pfForm").addEventListener("submit", e => {
  e.preventDefault();
  const f = readFields("pf");
  if (!f.pseudo) { show($("pfMsg"), "Le pseudo ne peut pas être vide."); return; }
  $("pfMsg").hidden = true;
  const btn = e.submitter || $("pfForm").querySelector("[type=submit]"); btn.disabled = true;
  saveProfile(f).then(() => { renderPfView("Profil enregistré."); ensureSocialProfile(); }).catch(() => show($("pfMsg"), "Échec de l’enregistrement. Vérifie ta connexion et réessaie."))
    .finally(() => { btn.disabled = false; });
});
$("pwReset").onclick = async () => {
  try { await sendPasswordResetEmail(auth, S.email); show($("pwMsg"), "E-mail envoyé à " + S.email + ". Suis le lien pour choisir un nouveau mot de passe."); }
  catch (err) { show($("pwMsg"), authMsg(err)); }
};
$("logout").onclick = () => signOut(auth);
$("delAccount").onclick = () => { $("delAccount").hidden = true; $("delForm").hidden = false; $("delPass").focus(); };
$("delForm").addEventListener("submit", async e => {
  e.preventDefault();
  const btn = $("delGo"); btn.disabled = true; btn.textContent = "Suppression…"; $("delErr").hidden = true;
  try {
    const user = auth.currentUser;
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(S.email, $("delPass").value));
    stopSubscriptions();
    const refs = [];
    for (const name of ["seances", "nutrition", "photos"]) (await getDocs(subCol(name))).forEach(d => refs.push(d.ref));
    (await getDocs(query(collection(db, "messages"), where("uid", "==", S.uid)))).forEach(d => refs.push(d.ref));
    try { (await getDocs(collection(db, "reacts", S.uid, "items"))).forEach(d => refs.push(d.ref)); } catch (x) { /* rien */ }
    try { (await getDocs(collection(db, "comments", S.uid, "items"))).forEach(d => refs.push(d.ref)); } catch (x) { /* rien */ }
    try { (await getDocs(query(collection(db, "challenges"), where("members", "array-contains", S.uid)))).forEach(d => { if (d.data().owner === S.uid) refs.push(d.ref); else updateDoc(d.ref, { members: arrayRemove(S.uid) }).catch(() => {}); }); } catch (x) { /* rien */ }
    try { (await getDocs(query(collection(db, "friends"), where("users", "array-contains", S.uid)))).forEach(d => { const f = d.data(); if (f.status !== "blocked" || f.blockedBy === S.uid) refs.push(d.ref); }); } catch (x) { /* rien */ }
    refs.push(doc(db, "directory", S.uid), doc(db, "share", S.uid));
    for (let i = 0; i < refs.length; i += 400) { const b = writeBatch(db); refs.slice(i, i + 400).forEach(r => b.delete(r)); await b.commit(); }
    await deleteDoc(userRef());
    await deleteUser(user);
  } catch (err) {
    show($("delErr"), err && err.code && err.code.startsWith("auth/") ? authMsg(err) : "La suppression a échoué. Réessaie.");
    btn.disabled = false; btn.textContent = "Supprimer définitivement";
  }
});

/* ============================================================
   Séances : calendrier
   ============================================================ */
function renderMain() {
  const y = S.view.getFullYear(), m = S.view.getMonth();
  $("monthTitle").innerHTML = cap(MONTHS[m]) + " <small>" + y + "</small>";
  const first = (new Date(y, m, 1).getDay() + 6) % 7, count = new Date(y, m + 1, 0).getDate(), tk = todayK();
  let h = "";
  for (let i = 0; i < first; i++) h += '<span class="day pad" aria-hidden="true"></span>';
  for (let d = 1; d <= count; d++) {
    const k = key(new Date(y, m, d)), ks = sessionsOn(k), s = ks.length && S.days[ks[0]], mt = s && dayMeta(s);
    h += `<button class="day${s ? " has" : ""}${k === tk ? " today" : ""}" data-k="${k}" style="--tc:${mt ? mt.color : "#8A847E"}" aria-label="${d} ${MONTHS[m]}${s ? ", " + esc(ks.map(x => titleOf(S.days[x])).join(" et ")) : ""}"><span class="n">${d}</span>${s ? `<span class="t">${esc(mt.short)}</span>` : ""}${ks.length > 1 ? `<span class="more">+${ks.length - 1}</span>` : ""}</button>`;
  }
  $("grid").innerHTML = h;
  $("legend").innerHTML = S.types.map(t => `<span style="--tc:${t.color}"><i class="dot"></i>${esc(t.name)}</span>`).join("")
    + `<span class="legend-sep">Autres activités</span>`
    + [["CrossFit", DISC.crossfit.color], ["Callisthénie", DISC.calis.color], ...RUN_TYPES.map(r => [r.name, r.color])]
      .map(([n, c]) => `<span style="--tc:${c}"><i class="dot"></i>${esc(n)}</span>`).join("");
  const ks = Object.keys(S.days).filter(k => k.startsWith(y + "-" + pad(m + 1))).sort().reverse();
  const vol = ks.reduce((a, k) => a + dayVolume(S.days[k]), 0);
  const km = ks.reduce((a, k) => a + runKm(S.days[k]), 0);
  $("sumTitle").textContent = cap(MONTHS[m]) + " en chiffres";
  $("stats").innerHTML = `<div class="stat"><b>${ks.length}</b><span>séance${ks.length > 1 ? "s" : ""}</span></div><div class="stat"><b>${vol >= 10000 ? nf.format(vol / 1000) + " t" : nf.format(vol)}</b><span>${vol >= 10000 ? "soulevées" : "kg soulevés"}</span></div><div class="stat"><b>${nf.format(km)}</b><span>km courus</span></div>`;
  $("list").innerHTML = ks.length ? ks.map(k => {
    const s = S.days[k], mt = dayMeta(s), d = parse(k), ph = (s.photos || []).length;
    return `<button class="row" data-k="${k}" style="--tc:${mt.color}"><i class="bar"></i><span class="d">${DAYS[d.getDay()].slice(0, 3)}<b>${d.getDate()}</b></span><span class="main"><div class="ti">${esc(titleOf(s))}</div><div class="me">${esc(sessionSummary(s))}${ph ? " · " + ph + " photo" + (ph > 1 ? "s" : "") : ""}</div></span><span aria-hidden="true" style="color:var(--red-hi)">›</span></button>`;
  }).join("") : `<div class="empty">Aucune séance en ${MONTHS[m]}. Touche un jour du calendrier pour noter ton entraînement.</div>`;
}
// Résumé d'une séance sur une ligne (liste du mois, administration).
function sessionSummary(s, types) {
  const mt = dayMeta(s, types), disc = mt.disc;
  if (disc === "course") {
    const r = s.run || {}, parts = [mt.name];
    if (r.dist) parts.push(nf.format(r.dist) + " km");
    if (runSecs(r)) parts.push(fmtDur(runSecs(r)));
    if (runPace(r)) parts.push(runPace(r) + " /km");
    return parts.join(" · ");
  }
  if (disc === "crossfit") {
    const w = s.wod || {}, parts = ["CrossFit"];
    if (w.format) parts.push(w.format);
    const sc = wodScore(w); if (sc) parts.push(sc + (w.rx === false ? " (Scaled)" : w.rx ? " (Rx)" : ""));
    return parts.join(" · ");
  }
  const n = (s.exercises || []).length;
  return `${disc === "calis" ? "Callisthénie" : mt.name} · ${n} exercice${n > 1 ? "s" : ""}${dayVolume(s) ? " · " + nf.format(dayVolume(s)) + " kg" : ""}`;
}

/* ============================================================
   Séances : fiche du jour
   ============================================================ */
function rpeColor(v) { return v <= 6 ? "#2FBF71" : v <= 8 ? "#FF9F0A" : "#FF3B30"; }
function rpeLabel(v) { return !v ? "Non notée" : v <= 5 ? "Facile" : v === 6 ? "Modérée" : v === 7 ? "3 reps en réserve" : v === 8 ? "2 reps en réserve" : v === 9 ? "1 rep en réserve" : "Échec"; }
function effortLabel(v) { return !v ? "Non noté" : v <= 3 ? "Très facile" : v <= 5 ? "Facile" : v <= 7 ? "Soutenu" : v <= 9 ? "Très dur" : "Maximal"; }
function restOf(ex) { return typeof ex.rest === "number" ? ex.rest : 90; }
function fmtRest(v) { if (!v) return "Aucun"; const m = Math.floor(v / 60), sec = v % 60; return m ? m + " min" + (sec ? " " + pad(sec) : "") : sec + " s"; }
function exStats(ex, disc) {
  const s = (ex.sets || []).filter(x => x.reps !== "" || x.kg !== "");
  if (!s.length) return "Aucune série remplie";
  const best = Math.max(0, ...s.map(x => +x.kg || 0));
  if (disc === "calis") {
    const tot = s.reduce((a, x) => a + (+x.reps || 0), 0);
    return `${s.length} série${s.length > 1 ? "s" : ""} · ${ex.hold ? "total " + tot + " s de tenue" : "total " + tot + " reps"}${best ? " · lest max " + nf.format(best) + " kg" : ""}`;
  }
  const v = exVolume(ex);
  return `${s.length} série${s.length > 1 ? "s" : ""}${best ? " · max " + nf.format(best) + " kg" : ""}${v ? " · volume " + nf.format(v) + " kg" : ""}`;
}
// Dernière séance comparable, pour la reprendre (musculation : même type ; callisthénie : n'importe laquelle).
function lastComparable(c, before) {
  const disc = c.disc;
  if (disc !== "muscu" && disc !== "calis") return null;
  if (disc === "muscu" && !c.typeId) return null;
  return Object.keys(S.days).filter(k => k < before && discOf(S.days[k]) === disc && (disc === "calis" || S.days[k].typeId === c.typeId) && (S.days[k].exercises || []).length).sort().pop();
}
// Progression des séries : une série est « faite » si elle est cochée ou si ses répétitions sont remplies.
// Une série n'est « faite » que si on la valide (bouton « Série finie » ou toucher sur son numéro).
// Pour les séances des jours passés notées avant cette règle, une série remplie compte comme faite.
function isDone(st) {
  if (st.done === true) return true;
  if (st.done === false) return false;
  return !!(S.open && dayOf(S.open) < todayK() && st.reps !== "" && st.reps != null);
}
const resting = i => !!(RT.tick && RT.ex === i && RT.day === S.open);
function activeSet(ex, i) {
  if (resting(i)) return -1;
  const sets = ex.sets || [];
  if (typeof ex.cur === "number" && sets[ex.cur] && !isDone(sets[ex.cur])) return ex.cur;
  return sets.findIndex(st => !isDone(st));
}
// Exercice en cours : celui choisi en dernier s'il reste des séries, sinon le premier non terminé.
function focusEx() {
  const L = (S.cur && S.cur.exercises) || [];
  if (RT.tick && RT.day === S.open && RT.ex != null && L[RT.ex]) return RT.ex;
  if (typeof S.cur.focus === "number" && L[S.cur.focus] && (L[S.cur.focus].sets || []).some(st => !isDone(st))) return S.cur.focus;
  return L.findIndex(ex => (ex.sets || []).some(st => !isDone(st)));
}
function setState(ex, j, i) {
  if (isDone(ex.sets[j])) return "done";
  if (j === activeSet(ex, i) && i === focusEx()) return "cur";
  if (resting(i) && j === (ex.sets || []).findIndex(st => !isDone(st))) return "next";
  return "";
}
function setNowText(ex, i) {
  const sets = ex.sets || [], n = sets.length; if (!n) return "";
  if (resting(i)) { const nx = sets.findIndex(st => !isDone(st)); return nx === -1 ? `<span class="ok">✓ Dernière série faite · repos</span>` : `⏸ Repos · série <b>${nx + 1}</b> ensuite`; }
  const a = activeSet(ex, i);
  if (a === -1) return `<span class="ok">✓ Toutes les séries sont faites</span>`;
  return i === focusEx() ? `<span class="dot-live"></span>Série en cours : <b>${a + 1}</b> / ${n}` : `À faire · ${sets.filter(isDone).length} / ${n} séries`;
}
function goLabel(ex, i) {
  const a = activeSet(ex, i);
  if (resting(i)) return "⏸ Repos en cours…";
  return a === -1 ? "⏱ Lancer un repos" : `✓ Série ${a + 1} finie · repos ${fmtRest(restOf(ex))}`;
}
function refreshAllSets() { ((S.cur && S.cur.exercises) || []).forEach((_, k) => refreshSets(k)); }
function refreshSets(i) {
  const ex = S.cur && S.cur.exercises && S.cur.exercises[i]; if (!ex) return;
  ex.sets.forEach((_, j) => { const r = $("row-" + i + "-" + j); if (r) r.className = setState(ex, j, i); });
  const sn = $("sn-" + i); if (sn) sn.innerHTML = setNowText(ex, i);
  const g = $("go-" + i); if (g) { g.textContent = goLabel(ex, i); g.disabled = resting(i); }
}
// Fin du repos : la série suivante s'allume et l'écran défile jusqu'à elle (ou jusqu'à l'exercice suivant).
function advanceAfterRest(i) {
  if (!S.cur || !S.cur.exercises || i == null) return;
  let ei = i, a = activeSet(S.cur.exercises[i], i);
  if (a === -1) { ei = S.cur.exercises.findIndex((ex, k) => k > i && activeSet(ex, k) !== -1); if (ei === -1) ei = S.cur.exercises.findIndex((ex, k) => activeSet(ex, k) !== -1); }
  S.cur.focus = ei === -1 ? null : ei; changed(); refreshAllSets();
  if (ei === -1) return;
  a = activeSet(S.cur.exercises[ei], ei);
  const row = $("row-" + ei + "-" + a);
  if (row) { row.classList.add("flash"); row.scrollIntoView({ block: "center", behavior: "smooth" }); setTimeout(() => row.classList.remove("flash"), 1600); }
}
function exHTML(ex, i, disc) {
  const r = ex.rpe || 0, calis = disc === "calis";
  const col1 = calis ? (ex.hold ? "Tenue (s)" : "Reps") : "Reps", col2 = calis ? "Lest (kg)" : "Poids (kg)";
  return `<article class="ex">
  <div class="ex-head"><span class="ex-num">${pad(i + 1)}</span><input id="exn-${i}" class="ex-name${ex.lock ? " locked" : ""}" data-f="ex-name" data-ex="${i}" placeholder="${calis ? "ex. Tractions" : "Nom de l’exercice"}" value="${esc(ex.name)}" autocomplete="off"${ex.lock ? ' readonly aria-readonly="true"' : ""}>${calis ? `<button class="icon-btn" data-a="hold" data-ex="${i}" aria-label="Changer répétitions ou tenue">${ex.hold ? "Tenue" : "Reps"} ⇄</button>` : ""}<button class="icon-btn" data-a="del-ex" data-ex="${i}" aria-label="Supprimer l’exercice">Retirer</button></div>
  <div class="ex-last" id="el-${i}">${lastLineHTML(ex)}</div>
  <div class="ex-stats" id="st-${i}">${exStats(ex, disc)}</div>
  <div class="set-now" id="sn-${i}">${setNowText(ex, i)}</div>
  <table class="sets"><thead><tr><th style="text-align:center">Série</th><th>${col1}</th><th>${col2}</th><th></th></tr></thead><tbody>
  ${(ex.sets || []).map((s, j) => `<tr id="row-${i}-${j}" class="${setState(ex, j, i)}"><td class="n"><button class="set-n" data-a="set-toggle" data-ex="${i}" data-s="${j}" aria-label="Cocher ou décocher la série ${j + 1}">${j + 1}</button></td><td><input id="r-${i}-${j}" class="num" inputmode="numeric" data-f="reps" data-ex="${i}" data-s="${j}" value="${esc(s.reps)}" placeholder="${s.target !== undefined && s.target !== "" ? esc(s.target) : "–"}" aria-label="${col1} série ${j + 1}"></td><td><input id="k-${i}-${j}" class="num" inputmode="decimal" data-f="kg" data-ex="${i}" data-s="${j}" value="${esc(s.kg)}" placeholder="${calis ? "0" : "–"}" aria-label="${col2} série ${j + 1}"></td><td class="x"><button class="icon-btn" data-a="del-set" data-ex="${i}" data-s="${j}" aria-label="Supprimer la série ${j + 1}">−</button></td></tr>`).join("")}
  </tbody></table>
  <button class="btn primary set-go" id="go-${i}" data-a="set-go" data-ex="${i}"${resting(i) ? " disabled" : ""}>${goLabel(ex, i)}</button>
  <button class="add-set" data-a="add-set" data-ex="${i}">+ Ajouter une série</button>
  <div class="rest-row"><div class="lbl">Repos entre les séries</div><div class="rest-ctl"><button class="step" data-a="rest-dec" data-ex="${i}" aria-label="Moins de repos">−</button><span class="rest-val" id="rv-${i}">${fmtRest(restOf(ex))}</span><button class="step" data-a="rest-inc" data-ex="${i}" aria-label="Plus de repos">+</button></div></div>
  <div><div class="lbl">Difficulté (RPE) <em>${r ? r + "/10 · " : ""}${rpeLabel(r)}</em></div>
  <div class="rpe-row" role="group" aria-label="Difficulté de 1 à 10">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => `<button data-a="rpe" data-ex="${i}" data-v="${v}" class="${r && v < r ? "lit" : ""}" style="--rc:${rpeColor(r || v)}" aria-pressed="${v === r}">${v}</button>`).join("")}</div></div>
  <textarea id="exr-${i}" data-f="ex-note" data-ex="${i}" placeholder="Ressenti : technique, sensations, douleurs…" rows="2">${esc(ex.note)}</textarea>
  </article>`;
}
function photoTile(p, i) {
  const src = S.photoCache[p.pid];
  return src
    ? `<button class="ph" data-a="photo" data-i="${i}" aria-label="Voir la photo ${i + 1}"><img src="${esc(src)}" alt="" loading="lazy"></button>`
    : `<div class="ph wait">…</div>`;
}
function effortCard(c, label) {
  const r = c.rpe || 0;
  return `<section class="card"><div class="lbl">${label} <em>${r ? r + "/10 · " : ""}${effortLabel(r)}</em></div>
  <div class="rpe-row" role="group" aria-label="Effort de 1 à 10">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => `<button data-a="srpe" data-v="${v}" class="${r && v < r ? "lit" : ""}" style="--rc:${rpeColor(r || v)}" aria-pressed="${v === r}">${v}</button>`).join("")}</div></section>`;
}
function choiceHTML() {
  return `<h2 class="title-in" style="margin:0">Quelle activité ?</h2>
  <p class="hint" style="margin-top:-8px">Choisis ton sport du jour : chaque activité a sa propre fiche.</p>
  <div class="disc-grid">${Object.entries(DISC).map(([id, x]) => `<button class="disc-card" data-a="disc" data-id="${id}" style="--tc:${x.color}"><span class="disc-ico" aria-hidden="true"><svg viewBox="0 0 24 24">${x.icon}</svg></span><b>${x.name}</b><span>${x.desc}</span></button>`).join("")}</div>`;
}
function muscuHTML(c, k) {
  const t = typeOf(c.typeId), last = !(c.exercises || []).length ? lastComparable(c, k) : null;
  return `<div class="chips" role="group" aria-label="Type de séance">${S.types.map(x => `<button class="chip" data-a="type" data-id="${x.id}" style="--tc:${x.color}" aria-pressed="${x.id === c.typeId}"><i class="dot"></i>${esc(x.name)}</button>`).join("")}</div>
    ${last ? `<button class="suggest" data-a="copy" data-k="${last}"><span style="flex:1"><b>Reprendre la dernière séance ${esc(t.name)}</b><span>${parse(last).getDate()} ${MONTHS[parse(last).getMonth()]} · ${(S.days[last].exercises || []).length} exercices, poids pré-remplis</span></span><span aria-hidden="true">›</span></button>` : ""}
    ${c.typeId === "cordes" ? `<p class="hint" style="margin-top:-6px">Pour chaque exercice : nombre de cordes, départ toutes les X secondes ou minutes, avec ou sans lest.</p>` : ""}
    ${(c.exercises || []).map((ex, i) => c.typeId === "cordes" ? cordesExHTML(ex, i) : exHTML(ex, i, "muscu")).join("")}
    <button class="add-ex" data-a="add-ex">+ Ajouter un exercice</button>
    ${(c.exercises || []).some(x => String(x.name || "").trim()) ? `<button class="btn" data-a="save-routine">☆ Enregistrer comme routine</button>` : ""}`;
}
function calisHTML(c, k) {
  const last = !(c.exercises || []).length ? lastComparable(c, k) : null;
  return `<section><div class="lbl" style="margin-bottom:8px">Ajout rapide</div>
    <div class="chips">${CALIS_MOVES.map(([n, hold]) => `<button class="chip" data-a="calis-add" data-name="${esc(n)}" data-hold="${hold ? 1 : ""}">+ ${esc(n)}</button>`).join("")}</div></section>
    ${last ? `<button class="suggest" data-a="copy" data-k="${last}"><span style="flex:1"><b>Reprendre ta dernière séance</b><span>${parse(last).getDate()} ${MONTHS[parse(last).getMonth()]} · ${(S.days[last].exercises || []).length} exercices</span></span><span aria-hidden="true">›</span></button>` : ""}
    ${(c.exercises || []).map((ex, i) => exHTML(ex, i, "calis")).join("")}
    <button class="add-ex" data-a="add-ex">+ Ajouter un exercice</button>
    ${(c.exercises || []).some(x => String(x.name || "").trim()) ? `<button class="btn" data-a="save-routine">☆ Enregistrer comme routine</button>` : ""}`;
}
function courseHTML(c) {
  const r = c.run || {}, rt = RUN_TYPES.find(x => x.id === c.runType), blocks = r.blocks || [];
  const val = v => v === undefined || v === null ? "" : esc(v);
  return `<div class="chips" role="group" aria-label="Type de sortie">${RUN_TYPES.map(x => `<button class="chip" data-a="runtype" data-id="${x.id}" style="--tc:${x.color}" aria-pressed="${x.id === c.runType}"><i class="dot"></i>${esc(x.name)}</button>`).join("")}</div>
    ${rt ? `<p class="hint" style="margin-top:-6px">${esc(rt.hint)}</p>` : ""}
    <section class="card"><div class="lbl">Ma sortie</div>
      <div class="grid2">
        <label class="field"><span>Distance (km)</span><input id="rn-dist" data-f="run-dist" inputmode="decimal" placeholder="ex. 8,5" value="${val(r.dist)}"></label>
        <div class="field"><span>Durée (h : min : s)</span><div class="dur"><input id="rn-h" data-f="run-h" inputmode="numeric" placeholder="0" value="${val(r.h)}" aria-label="Heures"><i>:</i><input id="rn-m" data-f="run-m" inputmode="numeric" placeholder="45" value="${val(r.m)}" aria-label="Minutes"><i>:</i><input id="rn-s" data-f="run-s" inputmode="numeric" placeholder="00" value="${val(r.s)}" aria-label="Secondes"></div></div>
      </div>
      <div class="run-calc" id="runCalc">${runCalcHTML(r)}</div>
      <div class="grid2">
        <label class="field"><span>FC moyenne (bpm)</span><input id="rn-fc" data-f="run-fc" inputmode="numeric" placeholder="ex. 145" value="${val(r.fc)}"></label>
        <label class="field"><span>Dénivelé + (m)</span><input id="rn-dplus" data-f="run-dplus" inputmode="numeric" placeholder="ex. 120" value="${val(r.dplus)}"></label>
      </div>
    </section>
    ${rt && rt.id !== "ef" ? `<section class="card"><div class="lbl">${rt.id === "seuil" ? "Blocs au seuil" : "Fractions"}</div>
      <p class="hint" style="margin-top:-4px">Ex. : ${rt.id === "seuil" ? "3 × 10 min à allure seuil, récup 2:00" : "10 × 400 m à 3:45 /km, récup 1:00"}</p>
      ${blocks.map((b, j) => `<div class="bloc">
        <div class="bloc-top"><span class="ex-num">${pad(j + 1)}</span>
          <input class="num bl-rep" id="bl-rep-${j}" data-f="bl-rep" data-b="${j}" inputmode="numeric" placeholder="10" value="${val(b.rep)}" aria-label="Répétitions du bloc ${j + 1}"><span class="times">×</span>
          <input class="num" id="bl-eff-${j}" data-f="bl-eff" data-b="${j}" inputmode="decimal" placeholder="${rt.id === "seuil" ? "10" : "400"}" value="${val(b.eff)}" aria-label="Effort du bloc ${j + 1}">
          <button class="unit" data-a="bl-unit" data-b="${j}" aria-label="Changer l’unité">${esc(b.unit || (rt.id === "seuil" ? "min" : "m"))}</button>
          <button class="icon-btn" data-a="bl-del" data-b="${j}" aria-label="Supprimer le bloc ${j + 1}">−</button></div>
        <div class="grid2"><label class="field"><span>Allure cible</span><input id="bl-pace-${j}" data-f="bl-pace" data-b="${j}" placeholder="3:45 /km" value="${val(b.pace)}"></label><label class="field"><span>Récup</span><input id="bl-rec-${j}" data-f="bl-rec" data-b="${j}" placeholder="1:00" value="${val(b.rec)}"></label></div>
        <button class="rest-go" data-a="bl-go" data-b="${j}" style="align-self:flex-start;margin-left:0">⏱ Lancer la récup</button>
      </div>`).join("")}
      <button class="add-set" data-a="bl-add">+ Ajouter un bloc</button></section>` : ""}
    ${effortCard(c, "Effort ressenti")}`;
}
function crossfitHTML(c) {
  const w = c.wod || {}, f = w.format, val = v => v === undefined || v === null ? "" : esc(v);
  const capLbl = f === "AMRAP" || f === "EMOM" || f === "Tabata" ? "Durée (min)" : "Time cap (min)";
  let score;
  if (f === "AMRAP") score = `<div class="grid2"><label class="field"><span>Tours complets</span><input id="sc-rounds" data-f="sc-rounds" inputmode="numeric" placeholder="ex. 12" value="${val(w.rounds)}"></label><label class="field"><span>+ Reps</span><input id="sc-reps" data-f="sc-reps" inputmode="numeric" placeholder="ex. 5" value="${val(w.reps)}"></label></div>`;
  else if (f === "EMOM" || f === "Tabata") score = `<label class="field"><span>${f === "EMOM" ? "Minutes réussies" : "Reps au total"}</span><input id="sc-rounds" data-f="sc-rounds" inputmode="numeric" value="${val(w.rounds)}"></label>`;
  else if (f === "Force") score = `<label class="field"><span>Charge max (kg)</span><input id="sc-kg" data-f="sc-kg" inputmode="decimal" placeholder="ex. 100" value="${val(w.kg)}"></label>`;
  else score = `<div class="field"><span>Temps final (min : s)</span><div class="dur dur2"><input id="sc-min" data-f="sc-min" inputmode="numeric" placeholder="8" value="${val(w.sMin)}" aria-label="Minutes"><i>:</i><input id="sc-sec" data-f="sc-sec" inputmode="numeric" placeholder="32" value="${val(w.sSec)}" aria-label="Secondes"></div></div>`;
  return `<div class="chips" role="group" aria-label="Format du WOD">${WOD_FORMATS.map(x => `<button class="chip" data-a="wf" data-v="${x}" style="--tc:${DISC.crossfit.color}" aria-pressed="${x === f}">${x}</button>`).join("")}</div>
    ${f ? `<p class="hint" style="margin-top:-6px">${esc(WOD_HINTS[f])}</p>` : ""}
    <section class="card"><div class="lbl">Le WOD</div>
      <label class="field"><span>Nom du WOD (facultatif)</span><input id="wd-name" data-f="wod-name" list="benchList" placeholder="ex. Fran, Murph, WOD du jour" value="${val(w.name)}" autocomplete="off"></label>
      <datalist id="benchList">${BENCH.map(b => `<option value="${esc(b.name)}">`).join("")}</datalist>
      <label class="field"><span>${capLbl}</span><input id="wd-cap" data-f="wod-cap" inputmode="numeric" placeholder="ex. 12" value="${val(w.cap)}"></label>
      <div class="lbl">Mouvements</div>
      ${(w.moves || []).map((m, j) => `<div class="move"><input class="num mv-reps" id="mv-reps-${j}" data-f="mv-reps" data-m="${j}" placeholder="21" value="${val(m.reps)}" aria-label="Répétitions"><input class="mv-name" id="mv-name-${j}" data-f="mv-name" data-m="${j}" list="moveList" placeholder="ex. Thrusters" value="${val(m.name)}" aria-label="Mouvement"><input class="num mv-kg" id="mv-kg-${j}" data-f="mv-kg" data-m="${j}" inputmode="decimal" placeholder="kg" value="${val(m.kg)}" aria-label="Charge en kg"><button class="icon-btn" data-a="mv-del" data-m="${j}" aria-label="Supprimer le mouvement">−</button></div>`).join("")}
      <datalist id="moveList">${CF_MOVES.map(m => `<option value="${esc(m)}">`).join("")}</datalist>
      <button class="add-set" data-a="mv-add">+ Ajouter un mouvement</button>
    </section>
    <section class="card"><div class="lbl">Mon score</div>
      ${score}
      <div class="chips"><button class="chip" data-a="rx" data-v="rx" style="--tc:${DISC.crossfit.color}" aria-pressed="${w.rx === true}">Rx (charges officielles)</button><button class="chip" data-a="rx" data-v="scaled" style="--tc:${DISC.crossfit.color}" aria-pressed="${w.rx === false}">Scaled (adapté)</button></div>
    </section>
    <section class="card"><div class="lbl">Force / technique (facultatif)</div>
      <textarea id="wd-strength" data-f="wod-strength" rows="2" placeholder="ex. Back squat 5×5 à 100 kg">${esc(w.strength)}</textarea>
    </section>
    ${effortCard(c, "Intensité ressentie")}`;
}
function renderSheet() {
  const c = S.cur, k = S.open, d = parse(k), disc = c.disc;
  const mt = disc ? dayMeta(c) : null;
  const el = $("sheet"), y = el.scrollTop;
  const dateTxt = `${cap(DAYS[d.getDay()])} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  let body;
  if (!disc) body = `${sessTabsHTML(c, k)}<p class="eyebrow">${dateTxt}</p>${choiceHTML()}`;
  else {
    const specific = disc === "muscu" ? muscuHTML(c, k) : disc === "calis" ? calisHTML(c, k) : disc === "course" ? courseHTML(c) : crossfitHTML(c);
    const ph = disc === "muscu" && mt && typeOf(c.typeId) ? mt.name : disc === "course" && c.runType ? mt.name : disc === "crossfit" ? "WOD du jour" : DISC[disc].name;
    body = `${sessTabsHTML(c, k)}<div class="disc-line"><p class="eyebrow">${dateTxt} · ${DISC[disc].name}</p><button class="linkish" data-a="change-disc">Changer d’activité</button></div>
    <div class="my-reacts" id="myReacts">${myReactsHTML(k)}</div>
    <input id="f-title" class="title-in" data-f="title" placeholder="${esc(ph)}" value="${esc(c.title)}" autocomplete="off" aria-label="Titre de la séance">
    ${specific}
    <section class="card"><div class="lbl">Ressenti général</div>
      <div class="chips">${MOODS.map(m => `<button class="chip" data-a="mood" data-v="${m}" style="--tc:var(--red)" aria-pressed="${c.mood === m}">${m}</button>`).join("")}</div>
      <textarea id="f-note" data-f="note" placeholder="Sommeil, énergie, ce qu’il faut changer la prochaine fois…" rows="3">${esc(c.note)}</textarea>
    </section>
    <section class="card"><div class="lbl">Photos <em>${(c.photos || []).length || ""}</em></div>
      <div class="photos">${(c.photos || []).map(photoTile).join("")}${'<div class="ph loading">Envoi…</div>'.repeat(S.uploading || 0)}
      <label class="ph-add" for="phIn"><span class="plus">+</span>Prendre une photo<input id="phIn" type="file" accept="image/*" multiple data-f="photo"></label></div>
      ${S.photoErr ? `<p class="err">${esc(S.photoErr)}</p>` : ""}
    </section>
    <section class="card" id="myComments">${myCommentsHTML(k)}</section>
    ${isEmpty(c) ? "" : `<button class="danger" data-a="del-session">Supprimer la séance</button>`}`;
  }
  el.innerHTML = `<div class="bar-top"><button class="link" data-a="close">‹ Calendrier</button><span class="save" id="saveState">${esc(S.saveMsg || "")}</span></div>
  <div class="sheet-body" style="--tc:${mt ? mt.color : "var(--red-hi)"}">${body}</div>`;
  el.scrollTop = y;
  if (disc) loadPhotos(c.photos || []);
}
const EMPTY_DAY = () => ({ disc: null, title: "", typeId: null, exercises: [], mood: null, note: "", photos: [] });
function setDisc(c, disc) {
  c.disc = disc;
  if (disc === "course") c.run = c.run || { blocks: [] };
  if (disc === "crossfit") c.wod = c.wod || { moves: [] };
  if (!c.exercises) c.exercises = [];
}
function openDay(k, preset) {
  S.open = k;
  const existing = S.days[k];
  S.cur = existing ? clone(existing) : EMPTY_DAY();
  if (existing && !S.cur.disc) S.cur.disc = "muscu"; // anciennes séances = musculation
  if (!existing && preset) setDisc(S.cur, preset);
  if (!S.cur.photos) S.cur.photos = [];
  S.saveMsg = ""; S.photoErr = "";
  S.prSeen = new Set(sessionPRs(S.cur, k).map(p => k + "|" + p.ex));
  renderSheet(); $("sheet").scrollTop = 0; $("sheet").classList.add("open"); document.body.style.overflow = "hidden"; document.body.classList.add("sheet-open");
}
function closeSheet() { flush(); $("sheet").classList.remove("open"); document.body.style.overflow = ""; document.body.classList.remove("sheet-open"); S.open = null; S.cur = null; S.photoErr = ""; renderMain(); if (S.screen === "crossfit") renderCrossfit(); }
function setSave(m) { S.saveMsg = m; const e = $("saveState"); if (e) e.textContent = m; }
let timer = null;
function changed() { clearTimeout(timer); timer = setTimeout(flush, 700); }
function flush() {
  if (!S.open || timer === null) return;
  clearTimeout(timer); timer = null;
  const k = S.open, c = S.cur;
  if (isEmpty(c)) { if (S.days[k]) { delete S.days[k]; persistDay(k, null); } }
  else {
    const prs = sessionPRs(c, k); c.prs = prs.map(p => p.ex + " · " + p.txt);
    const data = { ...clone(c), updatedAt: Date.now() }; S.days[k] = data; persistDay(k, data);
    announcePRs(prs, k);
  }
}
const intOr = v => { const n = parseInt(String(v), 10); return isFinite(n) ? n : ""; };
$("sheet").addEventListener("input", e => {
  const f = e.target.dataset.f; if (!f || !S.cur || f === "photo") return;
  const c = S.cur, i = +e.target.dataset.ex, j = +e.target.dataset.s, v = e.target.value, t = v.trim();
  if (f === "title") c.title = v; else if (f === "note") c.note = v;
  else if (f === "ex-name") { if (!c.exercises[i].lock) c.exercises[i].name = v; } else if (f === "ex-note") c.exercises[i].note = v;
  else if (f === "cd-ropes" || f === "cd-every" || f === "cd-kg") {
    const ex = c.exercises[i]; ex[f.slice(3)] = t === "" ? "" : f === "cd-ropes" ? intOr(v) : numOr(v);
    const g = $("cdgo-" + i); if (g) g.disabled = !(+ex.ropes && +ex.every);
  }
  else if (f === "reps" || f === "kg") { c.exercises[i].sets[j][f] = t === "" ? "" : numOr(v); $("st-" + i).textContent = exStats(c.exercises[i], c.disc); refreshAllSets(); }
  else if (f.startsWith("run-")) {
    const r = c.run = c.run || { blocks: [] }, fld = f.slice(4);
    r[fld] = t === "" ? "" : fld === "dist" ? numOr(v) : intOr(v);
    $("runCalc").innerHTML = runCalcHTML(r);
  }
  else if (f.startsWith("bl-")) {
    const b = c.run.blocks[+e.target.dataset.b], fld = f.slice(3);
    b[fld] = fld === "rep" ? (t === "" ? "" : intOr(v)) : fld === "eff" ? (t === "" ? "" : numOr(v)) : v;
  }
  else if (f.startsWith("wod-")) { c.wod[f.slice(4)] = f === "wod-cap" ? (t === "" ? "" : intOr(v)) : v; }
  else if (f.startsWith("mv-")) { const m = c.wod.moves[+e.target.dataset.m], fld = f.slice(3); m[fld] = fld === "kg" ? (t === "" ? "" : numOr(v)) : v; }
  else if (f.startsWith("sc-")) {
    const map = { "sc-min": "sMin", "sc-sec": "sSec", "sc-rounds": "rounds", "sc-reps": "reps", "sc-kg": "kg" };
    c.wod[map[f]] = t === "" ? "" : f === "sc-kg" ? numOr(v) : intOr(v);
  }
  changed();
});
$("sheet").addEventListener("click", e => {
  const b = e.target.closest("[data-a]"); if (!b) return;
  const a = b.dataset.a, c = S.cur, i = +b.dataset.ex;
  if (a === "close") return closeSheet();
  if (a === "disc") { setDisc(c, b.dataset.id); renderSheet(); $("sheet").scrollTop = 0; return; }
  if (a === "change-disc") {
    if (!isEmpty(c) && !armed(b, "Toucher à nouveau : le contenu sera effacé")) return;
    const keep = { title: c.title, mood: c.mood, note: c.note, photos: c.photos };
    S.cur = { ...EMPTY_DAY(), ...keep }; changed(); renderSheet(); $("sheet").scrollTop = 0; return;
  }
  if (a === "type") { c.typeId = c.typeId === b.dataset.id ? null : b.dataset.id; }
  else if (a === "runtype") {
    c.runType = c.runType === b.dataset.id ? null : b.dataset.id;
    const r = c.run = c.run || { blocks: [] }; r.blocks = r.blocks || [];
    if (c.runType && c.runType !== "ef" && !r.blocks.length) r.blocks.push({ rep: "", eff: "", unit: c.runType === "seuil" ? "min" : "m", pace: "", rec: "" });
  }
  else if (a === "mood") { c.mood = c.mood === b.dataset.v ? null : b.dataset.v; }
  else if (a === "add-ex") { openLib(name => addExercise(name), c.disc); return; }
  else if (a === "calis-add") { addExercise(b.dataset.name, !!b.dataset.hold); return; }
  else if (a === "save-routine") { saveRoutineFromSession(c); b.textContent = "✓ Routine enregistrée"; b.disabled = true; return; }
  else if (a === "sess") { flush(); openDay(b.dataset.k); return; }
  else if (a === "sess-new") { flush(); openDay(freshKey(dayOf(S.open))); return; }
  else if (a === "hold") { c.exercises[i].hold = !c.exercises[i].hold; }
  else if (a === "cd-unit") { const ex = c.exercises[i]; ex.unit = ex.unit === "min" ? "s" : "min"; }
  else if (a === "cd-lest") { c.exercises[i].lest = b.dataset.v === "1"; }
  else if (a === "cd-go") { const ex = c.exercises[i]; startIntervals((+ex.every || 0) * (ex.unit === "min" ? 60 : 1), +ex.ropes || 1, ex.name || "Corde"); return; }
  else if (a === "del-ex") { if (!armed(b, "Confirmer")) return; c.exercises.splice(i, 1); }
  else if (a === "add-set") { const s = c.exercises[i].sets, l = s[s.length - 1]; s.push(l ? { reps: "", kg: l.kg, target: l.reps !== "" && l.reps != null ? l.reps : (l.target ?? "") } : { reps: "", kg: "" }); }
  else if (a === "del-set") { c.exercises[i].sets.splice(+b.dataset.s, 1); }
  else if (a === "photo") { openViewer(+b.dataset.i); return; }
  else if (a === "rest-inc" || a === "rest-dec") {
    const ex = c.exercises[i], v = Math.min(600, Math.max(0, restOf(ex) + (a === "rest-inc" ? 15 : -15)));
    ex.rest = v; $("rv-" + i).textContent = fmtRest(v); refreshSets(i); changed(); return;
  }
  else if (a === "rest-go" || a === "set-go") {
    const ex = c.exercises[i], cur = activeSet(ex, i);
    if (a === "set-go" && cur !== -1) {
      const st = ex.sets[cur]; st.done = true;
      if ((st.reps === "" || st.reps == null) && st.target !== undefined && st.target !== "") st.reps = st.target;
      const nx = ex.sets.findIndex(x => !isDone(x)); ex.cur = nx === -1 ? null : nx;
      const rIn = $("r-" + i + "-" + cur); if (rIn) rIn.value = st.reps ?? "";
      $("st-" + i).textContent = exStats(ex, c.disc); changed();
      announcePRs(sessionPRs(c, S.open), S.open);
    }
    c.focus = i; startRest(restOf(ex), ex.name, { day: S.open, ex: i }); refreshAllSets(); return;
  }
  else if (a === "set-toggle") {
    const ex = c.exercises[i], j = +b.dataset.s, st = ex.sets[j];
    st.done = !isDone(st); if (!st.done) { ex.cur = j; c.focus = i; }
    $("st-" + i).textContent = exStats(ex, c.disc); refreshAllSets(); changed(); return;
  }
  else if (a === "rpe") { const v = +b.dataset.v; c.exercises[i].rpe = c.exercises[i].rpe === v ? 0 : v; }
  else if (a === "srpe") { const v = +b.dataset.v; c.rpe = c.rpe === v ? 0 : v; }
  else if (a === "bl-add") { const bl = c.run.blocks, l = bl[bl.length - 1]; bl.push(l ? { ...l } : { rep: "", eff: "", unit: c.runType === "seuil" ? "min" : "m", pace: "", rec: "" }); }
  else if (a === "bl-del") { c.run.blocks.splice(+b.dataset.b, 1); }
  else if (a === "bl-unit") { const bl = c.run.blocks[+b.dataset.b], u = ["m", "km", "min", "s"]; bl.unit = u[(u.indexOf(bl.unit || "m") + 1) % u.length]; }
  else if (a === "bl-go") { const bl = c.run.blocks[+b.dataset.b]; startRest(parseClock(bl.rec) || 60, "Récup"); return; }
  else if (a === "wf") { c.wod.format = c.wod.format === b.dataset.v ? "" : b.dataset.v; }
  else if (a === "mv-add") { (c.wod.moves = c.wod.moves || []).push({ reps: "", name: "", kg: "" }); changed(); renderSheet(); const n = $("mv-name-" + (c.wod.moves.length - 1)); n && n.focus(); return; }
  else if (a === "mv-del") { c.wod.moves.splice(+b.dataset.m, 1); }
  else if (a === "rx") { const v = b.dataset.v === "rx"; c.wod.rx = c.wod.rx === v ? null : v; }
  else if (a === "copy") {
    const src = S.days[b.dataset.k];
    c.exercises = clone(src.exercises || []).map(x => ({ name: x.name, hold: !!x.hold, lock: true, ...cordesOf(x), sets: (x.sets || []).map(s => ({ reps: "", kg: s.kg, target: s.reps !== "" && s.reps != null ? s.reps : (s.target ?? "") })), rpe: 0, note: "", rest: restOf(x) }));
    if (!String(c.title).trim()) c.title = src.title || "";
  }
  else if (a === "del-session") {
    if (!armed(b, "Toucher à nouveau pour supprimer")) return;
    const gone = (c.photos || []).map(p => p.pid).filter(Boolean);
    S.cur = EMPTY_DAY();
    timer = 1; flush(); gone.forEach(dropPhoto); return closeSheet();
  }
  else return;
  changed(); renderSheet();
});
// Choisir un WOD de référence dans la liste pré-remplit le format et les mouvements.
$("sheet").addEventListener("change", e => {
  if (e.target.dataset.f !== "wod-name" || !S.cur || !S.cur.wod) return;
  const bm = BENCH.find(x => norm(x.name).trim() === norm(e.target.value).trim()); if (!bm) return;
  const w = S.cur.wod;
  if (!(w.moves || []).some(m => m.name)) w.moves = clone(bm.moves);
  if (!w.format) w.format = bm.type === "amrap" ? "AMRAP" : "For Time";
  if (!w.cap && bm.cap) w.cap = bm.cap;
  w.name = bm.name; changed(); renderSheet();
});

/* ============================================================
   Photos (stockées en JPEG compressé dans Firestore : reste gratuit)
   ============================================================ */
function compress(file, max, q) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      const r = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight)), w = Math.round(img.naturalWidth * r), h = Math.round(img.naturalHeight * r);
      const cv = document.createElement("canvas"); cv.width = w; cv.height = h; cv.getContext("2d").drawImage(img, 0, 0, w, h); URL.revokeObjectURL(url);
      cv.toBlob(b => b ? res(b) : rej(new Error("encode")), "image/jpeg", q);
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("decode")); };
    img.src = url;
  });
}
function blobToData(b) { return new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(b); }); }
const loading = new Set();
function loadPhotos(list) {
  const missing = list.map(p => p.pid).filter(id => id && !S.photoCache[id] && !loading.has(id));
  if (!missing.length) return;
  missing.forEach(id => loading.add(id));
  Promise.all(missing.map(id => getDoc(subDoc("photos", id)).then(s => { if (s.exists()) S.photoCache[id] = s.data().data; }).catch(() => {})))
    .then(() => { missing.forEach(id => loading.delete(id)); if (S.open) renderSheet(); });
}
function dropPhoto(pid) { deleteDoc(subDoc("photos", pid)).catch(() => {}); delete S.photoCache[pid]; }
async function addPhotos(files) {
  const k = S.open, target = S.cur; if (!k || !target) return;
  S.photoErr = ""; S.uploading = (S.uploading || 0) + files.length; renderSheet();
  for (const f of files) {
    try {
      let data = await blobToData(await compress(f, 1280, .72));
      if (data.length > 850000) data = await blobToData(await compress(f, 900, .6));
      // Identifiant créé tout de suite : la photo s'ajoute même sans réseau (envoyée au retour de la connexion).
      const ref = doc(subCol("photos")); setDoc(ref, { data, date: k, createdAt: Date.now() }).catch(() => {});
      S.photoCache[ref.id] = data;
      target.photos = target.photos || []; target.photos.push({ pid: ref.id });
    } catch (e) { S.photoErr = "La photo n’a pas pu être ajoutée. Réessaie."; }
    S.uploading--;
    if (S.open === k && S.cur === target) { changed(); renderSheet(); }
    else { const data = { ...clone(target), updatedAt: Date.now() }; S.days[k] = data; persistDay(k, data); renderMain(); }
  }
}
$("sheet").addEventListener("change", e => {
  if (e.target.dataset.f !== "photo") return;
  const fs = [...e.target.files]; e.target.value = ""; if (fs.length) addPhotos(fs);
});
let vIdx = -1;
function openViewer(i) { vIdx = i; $("viewerImg").src = S.photoCache[S.cur.photos[i].pid] || ""; $("viewer").hidden = false; }
$("viewer").addEventListener("click", e => {
  const b = e.target.closest("[data-a]"); if (!b) return;
  if (b.dataset.a === "vclose") { $("viewer").hidden = true; return; }
  if (b.dataset.a === "vdel") {
    if (!armed(b, "Confirmer la suppression")) return;
    const [p] = S.cur.photos.splice(vIdx, 1); $("viewer").hidden = true;
    timer = 1; flush(); if (p && p.pid) dropPhoto(p.pid); renderSheet();
  }
});

/* ============================================================
   Types de séance
   ============================================================ */
function renderTypes() {
  $("typesSheet").innerHTML = `<div class="bar-top"><button class="link" data-a="close">‹ Calendrier</button><span class="save"></span></div>
  <div class="sheet-body"><h2 class="title-in" style="margin:0">Types de séance</h2>
  <p class="hint">Chaque type a sa couleur dans le calendrier. Touche la pastille pour changer de couleur.</p>
  <div class="card">${S.types.map((t, i) => `<div class="trow"><button class="swatch" data-a="color" data-i="${i}" style="--tc:${t.color}" aria-label="Changer la couleur de ${esc(t.name)}"></button><input id="tn-${t.id}" data-i="${i}" value="${esc(t.name)}" aria-label="Nom du type"><button class="icon-btn" data-a="del" data-i="${i}">Retirer</button></div>`).join("")}</div>
  <button class="add-ex" data-a="add">+ Nouveau type</button>
  <button class="danger" data-a="reset">Revenir aux types par défaut</button></div>`;
}
let tTimer = null;
$("typesSheet").addEventListener("input", e => {
  const i = e.target.dataset.i; if (i == null) return;
  S.types[+i].name = e.target.value; clearTimeout(tTimer); tTimer = setTimeout(persistTypes, 700);
});
$("typesSheet").addEventListener("click", e => {
  const b = e.target.closest("[data-a]"); if (!b) return;
  const a = b.dataset.a, i = +b.dataset.i;
  if (a === "close") { clearTimeout(tTimer); persistTypes(); $("typesSheet").classList.remove("open"); document.body.style.overflow = ""; document.body.classList.remove("sheet-open"); renderMain(); return; }
  if (a === "color") { const t = S.types[i]; t.color = PALETTE[(PALETTE.indexOf(t.color) + 1) % PALETTE.length]; }
  else if (a === "del") { if (!armed(b, "Confirmer")) return; S.types.splice(i, 1); }
  else if (a === "add") { const used = S.types.map(t => t.color); S.types.push({ id: "t" + Date.now().toString(36), name: "Nouveau type", color: PALETTE.find(c => !used.includes(c)) || PALETTE[0] }); }
  else if (a === "reset") { if (!armed(b, "Confirmer")) return; S.types = DEFAULT_TYPES.map(t => ({ ...t })); }
  persistTypes(); renderTypes();
});
$("grid").addEventListener("click", e => { const b = e.target.closest("[data-k]"); if (b) openDay(sessionsOn(b.dataset.k)[0] || b.dataset.k); });
$("list").addEventListener("click", e => { const b = e.target.closest("[data-k]"); b && openDay(b.dataset.k); });
$("prev").onclick = () => { S.view = new Date(S.view.getFullYear(), S.view.getMonth() - 1, 1); renderMain(); };
$("next").onclick = () => { S.view = new Date(S.view.getFullYear(), S.view.getMonth() + 1, 1); renderMain(); };
$("today").onclick = () => { const t = new Date(); S.view = new Date(t.getFullYear(), t.getMonth(), 1); renderMain(); openDay(sessionsOn(key(t))[0] || key(t)); };
$("types").onclick = () => { renderTypes(); $("typesSheet").scrollTop = 0; $("typesSheet").classList.add("open"); document.body.style.overflow = "hidden"; document.body.classList.add("sheet-open"); };
let sx = null;
$("seancesCal").addEventListener("touchstart", e => { sx = e.touches[0].clientX; }, { passive: true });
$("seancesCal").addEventListener("touchend", e => {
  if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; sx = null;
  if (Math.abs(dx) > 60) (dx < 0 ? $("next") : $("prev")).click();
}, { passive: true });
window.addEventListener("pagehide", flush);
document.addEventListener("visibilitychange", () => { if (document.hidden) flush(); });

/* ============================================================
   Nutrition
   ============================================================ */
function nutOf(k) { return S.nut[k] || { complements: [], creatine: null }; }
function saveNut(k, n) {
  if (!(n.complements || []).length && !n.creatine) delete S.nut[k]; else S.nut[k] = { ...n, updatedAt: Date.now() };
  const data = S.nut[k], ref = subDoc("nutrition", k);
  nChain = nChain.then(() => data ? setDoc(ref, data) : deleteDoc(ref)).catch(() => {});
  syncStats(); renderNutrition();
}
function suppCatalog() { const m = new Map(DEFAULT_SUPPS); Object.keys(S.nut).sort().forEach(k => (S.nut[k].complements || []).forEach(c => m.set(c.name, c.dose || ""))); return m; }
function fmtDay(k) { const d = parse(k); return (k === todayK() ? "aujourd’hui, " : "") + DAYS[d.getDay()] + " " + d.getDate() + " " + MONTHS[d.getMonth()]; }
function renderComplements() {
  const k = S.cpDay, n = nutOf(k), cat = suppCatalog(), L = n.complements || [], taken = new Set(L.map(c => c.name));
  $("cpDate").textContent = cap(fmtDay(k)); $("cpNext").disabled = k >= todayK();
  $("cpChips").innerHTML = [...cat].map(([name, dose]) => `<button class="chip" data-name="${esc(name)}" data-dose="${esc(dose)}" style="--tc:var(--red)" aria-pressed="${taken.has(name)}">${taken.has(name) ? "✓" : "+"} ${esc(name)}${dose ? ` <span style="opacity:.7;font-weight:500">${esc(dose)}</span>` : ""}</button>`).join("");
  $("cpList").innerHTML = [...cat.keys()].map(x => `<option value="${esc(x)}">`).join("");
  $("cpListTitle").textContent = L.length ? "Pris ce jour · " + L.length : "Pris ce jour";
  $("cpItems").innerHTML = L.length ? L.map((c, i) => `<div class="intake"><i class="dot" style="--tc:var(--red)"></i><span class="main"><b>${esc(c.name)}</b><span>${[c.dose, c.time && ("à " + c.time)].filter(Boolean).map(esc).join(" · ") || "Dose non précisée"}</span></span><button class="icon-btn" data-del="${i}">Retirer</button></div>`).join("") : `<p class="hint">Rien de noté ce jour. Touche un complément ci-dessus pour l’ajouter.</p>`;
}
function addSupp(name, dose) { const k = S.cpDay, n = clone(nutOf(k)); n.complements = n.complements || []; n.complements.push({ name, dose, time: k === todayK() ? hm() : "" }); saveNut(k, n); }
$("cpChips").addEventListener("click", e => {
  const b = e.target.closest("[data-name]"); if (!b) return;
  const k = S.cpDay, n = clone(nutOf(k)), nm = b.dataset.name;
  if ((n.complements || []).some(c => c.name === nm)) { n.complements = n.complements.filter(c => c.name !== nm); saveNut(k, n); }
  else addSupp(nm, b.dataset.dose);
});
$("cpForm").addEventListener("submit", e => {
  e.preventDefault(); const nm = $("cpName").value.trim(); if (!nm) return;
  addSupp(nm, $("cpDose").value.trim()); $("cpName").value = ""; $("cpDose").value = "";
});
$("cpName").addEventListener("change", () => { const d = suppCatalog().get($("cpName").value.trim()); if (d && !$("cpDose").value) $("cpDose").value = d; });
$("cpItems").addEventListener("click", e => {
  const b = e.target.closest("[data-del]"); if (!b || !armed(b, "Confirmer")) return;
  const k = S.cpDay, n = clone(nutOf(k)); n.complements.splice(+b.dataset.del, 1); saveNut(k, n);
});
$("cpPrev").onclick = () => { const d = parse(S.cpDay); d.setDate(d.getDate() - 1); S.cpDay = key(d); renderComplements(); };
$("cpNext").onclick = () => { const d = parse(S.cpDay); d.setDate(d.getDate() + 1); if (key(d) <= todayK()) { S.cpDay = key(d); renderComplements(); } };
function creaStreak() { let n = 0; const d = new Date(); if (!nutOf(key(d)).creatine) d.setDate(d.getDate() - 1); while (nutOf(key(d)).creatine && n < 3660) { n++; d.setDate(d.getDate() - 1); } return n; }
function toggleCrea(k) { const n = clone(nutOf(k)); n.creatine = n.creatine ? null : { time: k === todayK() ? hm() : "", dose: S.prefs.creaDose }; saveNut(k, n); }
function renderCreatine() {
  const tk = todayK(), c = nutOf(tk).creatine, b = $("creaBtn");
  b.classList.toggle("ok", !!c); b.setAttribute("aria-pressed", String(!!c));
  b.innerHTML = c
    ? `<span class="crea-check" aria-hidden="true">✓</span><b>Prise</b><span>${c.time ? "à " + esc(c.time) + " · " : ""}${nf.format(c.dose || S.prefs.creaDose)} g</span>`
    : `<b>À prendre</b><span>Touche pour confirmer<br>${nf.format(S.prefs.creaDose)} g aujourd’hui</span>`;
  $("creaHint").textContent = c ? "Touche à nouveau pour annuler." : "";
  const y = S.crView.getFullYear(), m = S.crView.getMonth(), count = new Date(y, m + 1, 0).getDate(), first = (new Date(y, m, 1).getDay() + 6) % 7;
  $("creaMonth").textContent = cap(MONTHS[m]) + " " + y;
  let h = "", done = 0, elapsed = 0, grams = 0;
  for (let i = 0; i < first; i++) h += '<span class="day pad" aria-hidden="true"></span>';
  for (let d = 1; d <= count; d++) {
    const k = key(new Date(y, m, d)), cr = nutOf(k).creatine, fut = k > tk;
    if (!fut) { elapsed++; if (cr) { done++; grams += +cr.dose || 0; } }
    h += `<button class="day${cr ? " crea-on" : ""}${k === tk ? " today" : ""}" data-k="${k}"${fut ? " disabled" : ""} aria-pressed="${!!cr}" aria-label="${d} ${MONTHS[m]}${cr ? ", prise" : ""}"><span class="n">${d}</span></button>`;
  }
  $("creaGrid").innerHTML = h;
  const st = creaStreak();
  $("creaStats").innerHTML = `<div class="stat"><b>${st}</b><span>jour${st > 1 ? "s" : ""} d’affilée</span></div><div class="stat"><b>${done}<small style="font-size:.55em;color:var(--muted)">/${elapsed}</small></b><span>jours ce mois</span></div><div class="stat"><b>${nf.format(grams)}</b><span>g ce mois</span></div>`;
  if (document.activeElement !== $("creaDose")) $("creaDose").value = S.prefs.creaDose;
}
$("creaBtn").onclick = () => toggleCrea(todayK());
$("creaGrid").addEventListener("click", e => { const b = e.target.closest("[data-k]"); if (b && !b.disabled) toggleCrea(b.dataset.k); });
$("crPrev").onclick = () => { S.crView = new Date(S.crView.getFullYear(), S.crView.getMonth() - 1, 1); renderCreatine(); };
$("crNext").onclick = () => { S.crView = new Date(S.crView.getFullYear(), S.crView.getMonth() + 1, 1); renderCreatine(); };
$("creaDose").addEventListener("change", () => {
  const v = numOr($("creaDose").value);
  if (v === "" || v <= 0) { $("creaDose").value = S.prefs.creaDose; return; }
  S.prefs.creaDose = v; savePrefs(); renderCreatine();
});
function renderNutrition() {
  const n = nutOf(todayK()), L = n.complements || [];
  $("nutCpMark").textContent = L.length; $("nutCpMark").classList.toggle("ok", L.length > 0);
  $("nutCpSub").textContent = L.length ? L.map(c => c.name).join(", ") : "Rien de noté aujourd’hui";
  $("nutCrMark").textContent = n.creatine ? "✓" : "–"; $("nutCrMark").classList.toggle("ok", !!n.creatine);
  $("nutCrSub").textContent = n.creatine ? "Prise aujourd’hui" + (n.creatine.time ? " à " + n.creatine.time : "") : "Pas encore prise aujourd’hui";
  if (S.screen === "complements") renderComplements();
  if (S.screen === "creatine") renderCreatine();
}

/* ============================================================
   Accueil
   ============================================================ */
/* ============================================================
   Contact
   ============================================================ */
let ctObjet = "";
function renderObjets() { $("ctObjets").innerHTML = OBJETS.map(o => `<button type="button" class="chip" data-objet="${esc(o)}" aria-pressed="${o === ctObjet}">${esc(o)}</button>`).join(""); }
$("ctObjets").addEventListener("click", e => { const b = e.target.closest("[data-objet]"); if (!b) return; ctObjet = b.dataset.objet; renderObjets(); });
function msgHTML(m) { return `<div class="msg"><div class="msg-top"><span class="tag">${esc(m.objet)}</span><small>${esc(fmtDate(m.at))}</small>${m.lu ? '<span class="tag done">Lu</span>' : ""}</div><p>${esc(m.texte)}</p></div>`; }
async function loadMyMessages() {
  try {
    const snap = await getDocs(query(collection(db, "messages"), where("uid", "==", S.uid)));
    S.myMsgs = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.at - a.at);
  } catch (e) { /* pas de réseau : on garde la liste actuelle */ }
}
function renderContact() {
  const draw = () => { $("myMsgsWrap").hidden = !S.myMsgs.length; $("myMsgs").innerHTML = S.myMsgs.map(msgHTML).join(""); };
  draw(); loadMyMessages().then(() => { if (S.screen === "contact") draw(); });
}
$("ctForm").addEventListener("submit", async e => {
  e.preventDefault();
  const t = $("ctText").value.trim(), mail = $("ctMail").value.trim(), err = $("ctErr");
  if (!ctObjet) { show(err, "Choisis un objet pour ton message."); return; }
  if (t.length < 3) { show(err, "Écris ton message avant de l’envoyer."); return; }
  err.hidden = true; $("ctSend").disabled = true; $("ctSend").textContent = "Envoi…";
  try {
    await addDoc(collection(db, "messages"), {
      uid: S.uid, pseudo: (S.profile && S.profile.pseudo) || "", objet: ctObjet, texte: t.slice(0, 3000),
      email: mail.slice(0, 120), at: Date.now(), lu: false
    });
    $("ctForm").hidden = true; $("ctDone").hidden = false; $("ctText").value = ""; ctObjet = "";
  } catch (x) { show(err, "Le message n’a pas pu être envoyé. Vérifie ta connexion et réessaie."); }
  $("ctSend").disabled = false; $("ctSend").textContent = "Envoyer";
});

/* ============================================================
   Administration
   ============================================================ */
function renderAdmin() {
  if (!S.admin) { $("adminBody").innerHTML = `<p class="hint">Accès réservé à l’administrateur.</p>`; return; }
  const M = Object.values(S.members).filter(m => m.pseudo).sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0));
  const week = Date.now() - 7 * 864e5, active = M.filter(m => (m.lastSeen || 0) >= week).length;
  const totalS = M.reduce((a, m) => a + ((m.stats && m.stats.seances) || 0), 0), totalV = M.reduce((a, m) => a + (m.visits || 0), 0);
  const byType = {}; M.forEach(m => Object.entries((m.stats && m.stats.byType) || {}).forEach(([k, v]) => { byType[k] = (byType[k] || 0) + v; }));
  const maxT = Math.max(1, ...Object.values(byType));
  const colorOf = nameColor;
  const msgs = S.messages, unread = msgs.filter(m => !m.lu).length;
  $("adminBody").innerHTML = `<div style="display:flex;flex-direction:column;gap:22px">
  <div class="stats" style="grid-template-columns:repeat(2,1fr)">
    <div class="stat"><b>${M.length}</b><span>utilisateurs inscrits</span></div>
    <div class="stat"><b>${active}</b><span>actifs ces 7 derniers jours</span></div>
    <div class="stat"><b>${totalS}</b><span>séances enregistrées</span></div>
    <div class="stat"><b>${totalV}</b><span>visites au total</span></div>
  </div>
  <section><h2 class="h2">Séances par type</h2><div class="card bars">${Object.keys(byType).length ? Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([n, v]) => `<div class="barrow" style="--tc:${colorOf(n)}"><span>${esc(n)}</span><span class="track"><span class="fill" style="display:block;width:${Math.round(v / maxT * 100)}%"></span></span><b>${v}</b></div>`).join("") : `<p class="hint">Aucune séance enregistrée pour l’instant.</p>`}</div></section>
  <section><h2 class="h2">Utilisateurs · ${M.length}</h2><div class="card" style="gap:0;padding-block:4px">${M.length ? M.map(m => `<button class="urow" data-uid="${esc(m.id)}">${avatarHTML(m, 42)}<span class="main"><b>${esc(m.pseudo)}${m.id === S.uid ? ' <span class="tag done">toi</span>' : ""}</b><span>Vu ${esc(ago(m.lastSeen))} · ${plural((m.stats && m.stats.seances) || 0, "séance")} · ${plural(m.visits || 0, "visite")}</span></span><span class="arrow" aria-hidden="true">›</span></button>`).join("") : `<p class="hint" style="padding-block:12px">Personne ne s’est encore inscrit.</p>`}</div></section>
  <section><h2 class="h2">Signalements · ${(S.reports || []).length}</h2><div class="card" style="gap:0;padding-block:4px">${(S.reports || []).length ? S.reports.map(r => `<div class="msg"><div class="msg-top"><span class="tag">${r.kind === "conversation" ? "Conversation" : "Message"}</span><b>${esc(r.targetPseudo || "?")}</b><small>signalé par ${esc(r.fromPseudo || "?")} · ${esc(fmtDate(r.at))}</small></div><p>${esc(r.text)}</p><button class="icon-btn" style="align-self:flex-start" data-repdone="${esc(r.id)}">Traité · supprimer</button></div>`).join("") : `<p class="hint" style="padding-block:12px">Aucun signalement.</p>`}</div></section>
  <section><h2 class="h2">Messages reçus · ${unread} non lu${unread > 1 ? "s" : ""}</h2><div class="card" style="gap:0;padding-block:4px">${msgs.length ? msgs.map(m => `<div class="msg"><div class="msg-top"><span class="tag${m.lu ? " done" : ""}">${esc(m.objet)}</span><b>${esc(m.pseudo || "Utilisateur")}</b><small>${esc(fmtDate(m.at))}</small></div><p>${esc(m.texte)}</p>${m.email ? `<small>Répondre à : <span style="user-select:all;color:var(--ink)">${esc(m.email)}</span></small>` : ""}<button class="icon-btn" style="align-self:flex-start" data-mid="${esc(m.id)}">${m.lu ? "Marquer non lu" : "Marquer comme lu"}</button></div>`).join("") : `<p class="hint" style="padding-block:12px">Aucun message pour l’instant.</p>`}</div></section>
  </div>`;
}
$("adminBody").addEventListener("click", e => {
  const u = e.target.closest("[data-uid]"); if (u) { openUser(u.dataset.uid); return; }
  const rd = e.target.closest("[data-repdone]"); if (rd) { if (!armed(rd, "Confirmer")) return; deleteDoc(doc(db, "reports", rd.dataset.repdone)).catch(() => {}); return; }
  const r = e.target.closest("[data-mid]"); if (!r) return;
  const m = S.messages.find(x => x.id === r.dataset.mid); if (!m) return;
  updateDoc(doc(db, "messages", m.id), { lu: !m.lu }).catch(() => {});
});
async function openUser(uid) {
  go("auser");
  const m = S.members[uid] || {};
  $("auserBody").innerHTML = `<p class="hint">Chargement…</p>`;
  let seances = [], nut = 0;
  try {
    const [ss, ns] = await Promise.all([getDocs(subCol("seances", uid)), getDocs(subCol("nutrition", uid))]);
    seances = ss.docs.map(d => ({ k: d.id, ...d.data() })).sort((a, b) => a.k < b.k ? 1 : -1); nut = ns.size;
  } catch (x) { /* affichage partiel */ }
  const types = (m.typesV === TYPES_V && Array.isArray(m.types)) ? m.types : DEFAULT_TYPES, st = m.stats || {};
  const kv = [["Pseudo", m.pseudo], ["E-mail", m.email], ["Prénom", m.prenom], ["Nom", m.nom], ["Âge", m.age ? m.age + " ans" : ""], ["Taille", m.taille ? m.taille + " cm" : ""], ["Poids", m.poids ? m.poids + " kg" : ""], ["Objectif", m.objectif], ["Inscrit le", m.createdAt ? fmtDate(m.createdAt) : ""], ["Dernière visite", ago(m.lastSeen)], ["Visites", m.visits], ["Volume total", st.volume ? nf.format(st.volume) + " kg" : ""], ["Distance courue", st.km ? nf.format(st.km) + " km" : ""], ["Photos", st.photos]].filter(x => x[1] !== undefined && x[1] !== "" && x[1] !== null);
  $("auserBody").innerHTML = `<div style="display:flex;flex-direction:column;gap:20px">
   <div style="display:flex;align-items:center;gap:14px">${avatarHTML(m, 64)}<h1 class="vtitle" style="margin:0;font-size:34px">${esc(m.pseudo || "Utilisateur")}</h1></div>
   <div class="stats"><div class="stat"><b>${seances.length}</b><span>séance${seances.length > 1 ? "s" : ""}</span></div><div class="stat"><b>${st.creatineDays || 0}</b><span>jours créatine</span></div><div class="stat"><b>${st.complements || 0}</b><span>compléments notés</span></div></div>
   <section class="card"><div class="lbl">Informations</div><dl class="kv">${kv.map(([a, b]) => `<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join("")}</dl></section>
   <section><h2 class="h2">Dernières séances</h2><div class="list">${seances.length ? seances.slice(0, 30).map(s => {
     const mt = dayMeta(s, types), d = parse(s.k);
     return `<div class="row" style="--tc:${mt.color}"><i class="bar"></i><span class="d">${DAYS[d.getDay()].slice(0, 3)}<b>${d.getDate()}</b></span><span class="main"><div class="ti">${esc(titleOf(s, types))}</div><div class="me">${esc(MONTHS_S[d.getMonth()])} ${d.getFullYear()} · ${esc(sessionSummary(s, types))}</div></span></div>`;
   }).join("") : `<div class="empty">Aucune séance enregistrée.</div>`}</div></section>
   <p class="hint">${nut} jour${nut > 1 ? "s" : ""} de nutrition renseigné${nut > 1 ? "s" : ""}.</p>
  </div>`;
}

/* ============================================================
   CrossFit : records (1RM) et WOD de référence
   ============================================================ */
function cfData() { const cf = clone((S.profile && S.profile.cf) || {}); cf.prs = cf.prs || {}; cf.bench = cf.bench || {}; return cf; }
const MONTHS_S = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
function shortDate(k) { const d = parse(k); return d.getDate() + " " + MONTHS_S[d.getMonth()] + (d.getFullYear() !== new Date().getFullYear() ? " " + d.getFullYear() : ""); }
// Résultats d'un WOD de référence : ceux notés ici + ceux des séances du calendrier portant le même nom.
function benchEntries(bm) {
  const manual = (cfData().bench[bm.id] || []).map((e, idx) => ({ ...e, idx, manual: true }));
  const fromDays = Object.keys(S.days).filter(k => discOf(S.days[k]) === "crossfit" && S.days[k].wod && norm(S.days[k].wod.name || "").trim() === norm(bm.name).trim())
    .map(k => {
      const w = S.days[k].wod;
      if (bm.type === "amrap") return w.rounds !== "" && w.rounds != null ? { date: k, r: +w.rounds || 0, reps: +w.reps || 0, rx: w.rx } : null;
      const t = (+w.sMin || 0) * 60 + (+w.sSec || 0); return t ? { date: k, t, rx: w.rx } : null;
    }).filter(Boolean);
  return [...manual, ...fromDays].sort((a, b) => a.date < b.date ? 1 : -1);
}
function benchValue(bm, e) { return bm.type === "amrap" ? e.r * 1000 + (e.reps || 0) : -e.t; }
function benchText(bm, e) { return bm.type === "amrap" ? `${e.r} tours${e.reps ? " + " + e.reps : ""}` : fmtDur(e.t); }
function renderCrossfit() {
  const rec = S.cfMode === "records", cf = cfData(), tk = todayK(), ym = tk.slice(0, 7);
  $("cfTitle").textContent = rec ? "Records · CrossFit" : "Idées · CrossFit";
  $("cfBack").dataset.go = rec ? "records" : "types"; $("cfBack").textContent = rec ? "‹ Mes records" : "‹ Séances types";
  $("cfToday").hidden = rec; $("cfStats").hidden = !rec; $("cfPrSec").hidden = !rec;
  $("cfBenchTitle").textContent = rec ? "Mes temps sur les WOD de référence" : "WOD de référence à essayer";
  const cfDays = Object.keys(S.days).filter(k => discOf(S.days[k]) === "crossfit");
  const nPr = Object.values(cf.prs).filter(l => l.length).length;
  $("cfStats").innerHTML = `<div class="stat"><b>${cfDays.filter(k => k.startsWith(ym)).length}</b><span>WOD ce mois</span></div><div class="stat"><b>${cfDays.length}</b><span>WOD au total</span></div><div class="stat"><b>${nPr}</b><span>record${nPr > 1 ? "s" : ""}</span></div>`;
  $("cfPrs").innerHTML = LIFTS.map(([id, name]) => {
    const list = (cf.prs[id] || []).slice().sort((a, b) => b.kg - a.kg), best = list[0], open = S.cfOpen === "pr:" + id;
    return `<div class="pr${open ? " open" : ""}">
      <button class="pr-row" data-cf="pr:${id}"><span class="main"><b>${esc(name)}</b><span>${best ? "le " + esc(shortDate(best.date)) : "Pas encore de record"}</span></span><span class="pr-kg">${best ? nf.format(best.kg) + "<small> kg</small>" : "–"}</span><span class="arrow" aria-hidden="true">${open ? "−" : "+"}</span></button>
      ${open ? `<form class="pr-form" data-pr="${id}"><label class="field"><span>Nouvelle charge (kg)</span><input id="pr-kg" inputmode="decimal" placeholder="ex. 100" required></label><button class="btn primary" type="submit">Ajouter</button></form>
        ${list.length ? `<ul class="hist">${(cf.prs[id] || []).map((e, idx) => ({ ...e, idx })).sort((a, b) => a.date < b.date ? 1 : -1).map(e => `<li><span>${esc(shortDate(e.date))}</span><b>${nf.format(e.kg)} kg</b><button class="icon-btn" data-prdel="${id}:${e.idx}">Retirer</button></li>`).join("")}</ul>` : ""}` : ""}
    </div>`;
  }).join("");
  $("cfBench").innerHTML = BENCH.map(bm => {
    const ents = benchEntries(bm), best = ents.slice().sort((a, b) => benchValue(bm, b) - benchValue(bm, a))[0], open = rec && S.cfOpen === "bm:" + bm.id;
    if (!rec) return `<div class="bench"><div class="bench-top"><span class="main"><b>${esc(bm.name)}</b><span class="tag cf">${bm.type === "amrap" ? "AMRAP " + bm.cap + " min" : "For Time"}</span><span class="desc">${esc(bm.desc)}</span></span>
        <span class="bench-best">${best ? `<b>${esc(benchText(bm, best))}</b><small>ton record</small>` : ""}</span></div>
        <button class="btn primary idea-go cf-btn" data-bmwod="${bm.id}" style="margin-bottom:14px">Essayer aujourd’hui</button></div>`;
    return `<div class="bench${open ? " open" : ""}">
      <button class="bench-top" data-cf="bm:${bm.id}"><span class="main"><b>${esc(bm.name)}</b><span class="tag cf">${bm.type === "amrap" ? "AMRAP " + bm.cap + " min" : "For Time"}</span><span class="desc">${esc(bm.desc)}</span></span>
        <span class="bench-best">${best ? `<b>${esc(benchText(bm, best))}</b><small>${best.rx === false ? "Scaled" : best.rx ? "Rx" : "record"}</small>` : `<small>À tenter</small>`}</span></button>
      ${open ? `<form class="pr-form" data-bm="${bm.id}">
          ${bm.type === "amrap"
            ? `<div class="grid2"><label class="field"><span>Tours</span><input id="bm-r" inputmode="numeric" required></label><label class="field"><span>+ Reps</span><input id="bm-reps" inputmode="numeric"></label></div>`
            : `<div class="field"><span>Ton temps (min : s)</span><div class="dur dur2"><input id="bm-m" inputmode="numeric" placeholder="4" required aria-label="Minutes"><i>:</i><input id="bm-s" inputmode="numeric" placeholder="35" aria-label="Secondes"></div></div>`}
          <div class="chips"><button type="button" class="chip" data-bmrx="1" aria-pressed="${S.bmRx !== false}" style="--tc:${DISC.crossfit.color}">Rx</button><button type="button" class="chip" data-bmrx="0" aria-pressed="${S.bmRx === false}" style="--tc:${DISC.crossfit.color}">Scaled</button></div>
          <button class="btn primary" type="submit">Enregistrer mon résultat</button>
        </form>
        ${ents.length ? `<ul class="hist">${ents.slice(0, 8).map(e => `<li><span>${esc(shortDate(e.date))}</span><b>${esc(benchText(bm, e))}</b><small>${e.rx === false ? "Scaled" : e.rx ? "Rx" : ""}</small>${e.manual ? `<button class="icon-btn" data-bmdel="${bm.id}:${e.idx}">Retirer</button>` : `<small class="src">séance</small>`}</li>`).join("")}</ul>` : ""}
` : ""}
    </div>`;
  }).join("");
}
$("cfToday").onclick = () => { go("seances"); openDay(freshKey(todayK()), "crossfit"); };
$("v-crossfit").addEventListener("click", e => {
  const t = e.target.closest("[data-cf]");
  if (t) { S.cfOpen = S.cfOpen === t.dataset.cf ? null : t.dataset.cf; S.bmRx = true; renderCrossfit(); return; }
  const rx = e.target.closest("[data-bmrx]");
  if (rx) { S.bmRx = rx.dataset.bmrx === "1"; rx.parentElement.querySelectorAll("[data-bmrx]").forEach(x => x.setAttribute("aria-pressed", String(x === rx))); return; }
  const pd = e.target.closest("[data-prdel]");
  if (pd) { if (!armed(pd, "Confirmer")) return; const [id, idx] = pd.dataset.prdel.split(":"); const cf = cfData(); cf.prs[id].splice(+idx, 1); saveProfile({ cf }); renderCrossfit(); return; }
  const bd = e.target.closest("[data-bmdel]");
  if (bd) { if (!armed(bd, "Confirmer")) return; const [id, idx] = bd.dataset.bmdel.split(":"); const cf = cfData(); cf.bench[id].splice(+idx, 1); saveProfile({ cf }); renderCrossfit(); return; }
  const bw = e.target.closest("[data-bmwod]");
  if (bw) {
    const bm = BENCH.find(x => x.id === bw.dataset.bmwod);
    tryIdea(bw, "crossfit", c => { c.title = bm.name; Object.assign(c.wod, { name: bm.name, format: bm.type === "amrap" ? "AMRAP" : "For Time", cap: bm.cap || "", moves: clone(bm.moves) }); });
  }
});
$("v-crossfit").addEventListener("submit", e => {
  e.preventDefault();
  const f = e.target, cf = cfData(), date = todayK();
  if (f.dataset.pr) {
    const kg = numOr($("pr-kg").value); if (kg === "" || kg <= 0) return;
    (cf.prs[f.dataset.pr] = cf.prs[f.dataset.pr] || []).push({ kg, date });
  } else if (f.dataset.bm) {
    const bm = BENCH.find(x => x.id === f.dataset.bm), entry = { date, rx: S.bmRx !== false };
    if (bm.type === "amrap") { const r = intOr($("bm-r").value); if (r === "") return; entry.r = r; entry.reps = intOr($("bm-reps").value) || 0; }
    else { const t = (intOr($("bm-m").value) || 0) * 60 + (intOr($("bm-s").value) || 0); if (!t) return; entry.t = t; }
    (cf.bench[bm.id] = cf.bench[bm.id] || []).push(entry);
  }
  saveProfile({ cf }); renderCrossfit();
});

/* ============================================================
   Séances types : idées de séances et records par activité
   ============================================================ */
// Exercice d'une idée : [nom, séries, répétitions (nombre, texte ou liste par série), repos en s, tenue ?]
const MUSCU_IDEAS = {
  push: [
    { name: "Push force", level: "Intermédiaire", dur: "60 min", ex: [["Développé couché", 5, 5, 180], ["Développé militaire", 4, 6, 150], ["Dips lestés", 3, 8, 120], ["Développé incliné haltères", 3, 10, 90], ["Extensions triceps poulie", 3, 12, 60]] },
    { name: "Push volume", level: "Tous niveaux", dur: "55 min", ex: [["Développé incliné haltères", 4, 10, 90], ["Développé couché machine", 3, 12, 90], ["Écartés poulie", 3, 15, 60], ["Élévations latérales", 4, 15, 60], ["Barre au front", 3, 12, 60], ["Extensions triceps corde", 3, 15, 45]] }
  ],
  pull: [
    { name: "Pull force", level: "Intermédiaire", dur: "60 min", ex: [["Soulevé de terre", 4, 5, 180], ["Tractions lestées", 4, 6, 150], ["Rowing barre", 4, 8, 120], ["Curl barre", 3, 10, 60]] },
    { name: "Pull dos large", level: "Tous niveaux", dur: "55 min", ex: [["Tractions", 4, 8, 120], ["Tirage vertical", 3, 12, 90], ["Rowing haltère", 3, 10, 90], ["Face pull", 3, 15, 60], ["Curl incliné", 3, 12, 60], ["Curl marteau", 3, 12, 60]] }
  ],
  jambes: [
    { name: "Jambes complètes", level: "Intermédiaire", dur: "65 min", ex: [["Squat", 5, 5, 180], ["Presse à cuisses", 4, 10, 120], ["Fentes marchées", 3, 12, 90], ["Leg curl", 3, 12, 60], ["Mollets debout", 4, 15, 45]] },
    { name: "Quadriceps & fessiers", level: "Tous niveaux", dur: "55 min", ex: [["Front squat", 4, 8, 150], ["Hip thrust", 4, 10, 120], ["Leg extension", 3, 15, 60], ["Soulevé de terre roumain", 3, 10, 90], ["Mollets assis", 4, 15, 45]] }
  ],
  haut: [
    { name: "Haut du corps complet", level: "Intermédiaire", dur: "60 min", ex: [["Développé couché", 4, 8, 120], ["Tractions", 4, 8, 120], ["Développé militaire", 3, 10, 90], ["Rowing haltère", 3, 10, 90], ["Curl barre", 3, 12, 60], ["Extensions triceps poulie", 3, 12, 60]] },
    { name: "Haut du corps express", level: "Débutant", dur: "40 min", ex: [["Développé incliné haltères", 3, 10, 90], ["Tirage vertical", 3, 10, 90], ["Élévations latérales", 3, 15, 60], ["Dips", 3, 10, 90], ["Curl haltères", 3, 12, 60]] }
  ],
  bas: [
    { name: "Bas du corps force", level: "Intermédiaire", dur: "60 min", ex: [["Squat", 4, 6, 180], ["Soulevé de terre roumain", 4, 8, 120], ["Fentes bulgares", 3, 10, 90], ["Leg curl", 3, 12, 60], ["Gainage", 3, "45 s", 45]] },
    { name: "Fessiers & ischios", level: "Tous niveaux", dur: "50 min", ex: [["Hip thrust", 4, 10, 120], ["Soulevé de terre sumo", 4, 8, 150], ["Fentes arrière", 3, 12, 90], ["Abduction machine", 3, 15, 60], ["Kickback poulie", 3, 15, 45]] }
  ]
};
const CALIS_IDEAS = [
  { name: "Débutant full body", level: "Débutant", dur: "40 min", ex: [["Tractions australiennes", 3, 10, 90], ["Pompes", 3, 12, 90], ["Squats", 3, 20, 60], ["Dips", 3, 8, 90], ["Gainage", 3, 30, 60, 1]] },
  { name: "Tirage & poussée", level: "Intermédiaire", dur: "50 min", ex: [["Tractions", 5, 6, 120], ["Dips", 5, 8, 120], ["Pompes pieds surélevés", 3, 12, 90], ["Tractions australiennes", 3, 12, 60], ["Handstand push-up", 3, 5, 120]] },
  { name: "Skills : équilibres et leviers", level: "Avancé", dur: "45 min", ex: [["Handstand", 6, 20, 60, 1], ["Front lever", 5, 10, 90, 1], ["Planche", 5, 10, 90, 1], ["L-sit", 4, 15, 60, 1]] },
  { name: "Pyramide d’endurance", level: "Tous niveaux", dur: "35 min", ex: [["Tractions", 9, [1, 2, 3, 4, 5, 4, 3, 2, 1], 45], ["Pompes", 9, [2, 4, 6, 8, 10, 8, 6, 4, 2], 45], ["Squats", 3, 25, 60]] },
  { name: "Muscle-up : progression", level: "Avancé", dur: "45 min", ex: [["Tractions", 4, 5, 150], ["Muscle-up", 5, 2, 150], ["Dips", 4, 10, 90], ["L-sit", 3, 15, 60, 1]] }
];
// Course : [répétitions, effort, unité, allure, récup]
const RUN_IDEAS = {
  ef: [
    { name: "Footing en endurance", level: "Tous niveaux", dur: "45 min", note: "Allure confortable : tu dois pouvoir parler.", m: 45 },
    { name: "Sortie longue", level: "Intermédiaire", dur: "1 h 15", note: "Allure EF, régulière du début à la fin. Hydrate-toi.", h: 1, m: 15 },
    { name: "EF + lignes droites", level: "Tous niveaux", dur: "45 min", note: "40 min en EF, puis 5 accélérations progressives de 100 m, retour en marchant.", m: 45 }
  ],
  seuil: [
    { name: "Seuil 3 × 10 min", level: "Intermédiaire", dur: "55 min", note: "Échauffement 15 min EF, retour au calme 10 min.", blocks: [[3, 10, "min", "allure semi", "2:00"]] },
    { name: "Seuil 2 × 15 min", level: "Confirmé", dur: "60 min", note: "Échauffement 15 min EF, retour au calme 10 min.", blocks: [[2, 15, "min", "allure semi", "3:00"]] },
    { name: "Tempo 20 min", level: "Tous niveaux", dur: "45 min", note: "Échauffement 15 min, 20 min en continu à allure soutenue, 10 min au calme.", blocks: [[1, 20, "min", "allure 10 km +10 s", ""]] }
  ],
  frac: [
    { name: "VMA 10 × 400 m", level: "Intermédiaire", dur: "50 min", note: "Échauffement 20 min EF + gammes. Récup en trottinant.", blocks: [[10, 400, "m", "VMA 95 %", "1:15"]] },
    { name: "30/30 × 2 séries", level: "Tous niveaux", dur: "45 min", note: "2 séries de 10 × 30 s vite / 30 s lent, 3 min de récup entre les séries.", blocks: [[10, 30, "s", "VMA", "0:30"], [10, 30, "s", "VMA", "0:30"]] },
    { name: "Pyramide 200 à 800 m", level: "Confirmé", dur: "55 min", note: "Récup = temps de l’effort, en trottinant.", blocks: [[1, 200, "m", "VMA", "0:45"], [1, 400, "m", "VMA", "1:30"], [1, 600, "m", "VMA 95 %", "2:15"], [1, 800, "m", "VMA 90 %", "3:00"], [1, 600, "m", "VMA 95 %", "2:15"], [1, 400, "m", "VMA", "1:30"], [1, 200, "m", "VMA", "0:45"]] },
    { name: "Côtes 8 × 30 s", level: "Tous niveaux", dur: "45 min", note: "Pente moyenne, montée dynamique, récup en descendant au trot.", blocks: [[8, 30, "s", "fort en côte", "1:30"]] }
  ]
};
const MUSCU_LIFTS = [["bench", "Développé couché"], ["squat", "Squat"], ["dl", "Soulevé de terre"], ["ohp", "Développé militaire"], ["pullw", "Traction lestée (lest)"], ["row", "Rowing barre"]];
const RUN_PRS = [["5k", "5 km", 5, "time"], ["10k", "10 km", 10, "time"], ["semi", "Semi-marathon", 21.0975, "time"], ["marathon", "Marathon", 42.195, "time"]];
const CALIS_PRS = [["pullups", "Tractions", 0, "reps"], ["dips", "Dips", 0, "reps"], ["pushups", "Pompes", 0, "reps"], ["muscleup", "Muscle-up", 0, "reps"],
  ["frontlever", "Front lever", 0, "sec"], ["planche", "Planche", 0, "sec"], ["handstand", "Handstand", 0, "sec"], ["lsit", "L-sit", 0, "sec"]];

function prsData() { const p = clone((S.profile && S.profile.prs) || {}); p.muscu = p.muscu || {}; p.course = p.course || {}; p.calis = p.calis || {}; return p; }
function fmtTime(t) { const h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), s = Math.round(t % 60); return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`; }
function repsText(r, hold) { return Array.isArray(r) ? r.join("-") : (typeof r === "number" && hold ? r + " s" : String(r)); }
function ideaExercises(ex) {
  return ex.map(([name, sets, reps, rest, hold]) => ({
    name, hold: !!hold, rpe: 0, note: "", rest,
    sets: Array.from({ length: sets }, (_, j) => ({ reps: "", kg: "", target: Array.isArray(reps) ? reps[j] : typeof reps === "number" ? reps : "" })),
    ...(typeof reps === "string" ? { note: "Objectif : " + reps } : {})
  }));
}
function ideaCard(idea, disc, key, idx, extra) {
  let lines;
  if (disc === "course") {
    lines = (idea.blocks || []).map(b => `${b[0]} × ${b[1]} ${b[2]}${b[3] ? " · " + b[3] : ""}${b[4] ? " · récup " + b[4] : ""}`);
    if (!lines.length) lines = [idea.note];
  } else lines = idea.ex.map(([n, s, r, rest, hold]) => `${n} — ${Array.isArray(r) ? repsText(r) : s + " × " + repsText(r, hold)} · repos ${fmtRest(rest)}`);
  return `<article class="idea" style="--tc:${extra || "var(--red-hi)"}">
    <div class="idea-top"><b>${esc(idea.name)}</b><span class="tag">${esc(idea.level)}</span></div>
    <span class="idea-meta">⏱ ${esc(idea.dur)}${disc !== "course" ? " · " + idea.ex.length + " exercices" : ""}</span>
    <ul>${lines.map(l => `<li>${esc(l)}</li>`).join("")}</ul>
    ${disc === "course" && idea.blocks ? `<p class="hint">${esc(idea.note)}</p>` : ""}
    <button class="btn primary idea-go" data-try="${disc}:${key}:${idx}">Essayer aujourd’hui</button>
  </article>`;
}
// Ouvre la séance du jour dans la bonne activité, pré-remplie avec l'idée choisie.
// S'il y a déjà une séance aujourd'hui, l'idée devient une séance de plus (rien n'est remplacé).
function tryIdea(btn, disc, fill) {
  const d = todayK(), k = freshKey(d), extra = sessionsOn(d).filter(x => x !== k && !isEmpty(S.days[x])).length;
  go("seances"); const t = new Date(); S.view = new Date(t.getFullYear(), t.getMonth(), 1); renderMain();
  openDay(k);
  S.cur = EMPTY_DAY(); setDisc(S.cur, disc); fill(S.cur);
  if (S.cur.exercises) { S.cur.exercises.forEach(e => { if (String(e.name || "").trim()) e.lock = true; }); prefillKg(S.cur.exercises, k); }
  timer = 1; flush(); renderSheet(); $("sheet").scrollTop = 0;
  if (extra) toast(`Ajoutée comme ${extra + 1}<sup>e</sup> séance du jour`);
}

/* ---------- Records ---------- */
// items : [id, nom, distance (course), type : kg | time | reps | sec]
const prBest = (kind, list) => kind === "time" ? list.slice().sort((a, b) => a.t - b.t)[0] : kind === "kg" ? list.slice().sort((a, b) => b.kg - a.kg)[0] : list.slice().sort((a, b) => b.v - a.v)[0];
const prText = (kind, e) => kind === "time" ? fmtTime(e.t) : kind === "kg" ? nf.format(e.kg) + " kg" : kind === "sec" ? e.v + " s" : e.v + " reps";
function prRows(items, data, defKind) {
  return items.map(([id, name, km, k]) => {
    const kind = k || defKind, list = data[id] || [], open = S.recOpen === id, best = prBest(kind, list);
    const bestTxt = !best ? "–" : kind === "kg" ? `${nf.format(best.kg)}<small> kg</small>` : kind === "time" ? fmtTime(best.t) : `${best.v}<small>${kind === "sec" ? " s" : " reps"}</small>`;
    const sub = !best ? "Pas encore de record" : "le " + shortDate(best.date) + (kind === "time" ? " · " + runPace({ dist: km, s: best.t }) + " /km" : "");
    const input = kind === "kg" ? `<label class="field"><span>Nouvelle charge (kg)</span><input id="rp-v" inputmode="decimal" placeholder="ex. 100" required></label>`
      : kind === "time" ? `<div class="field"><span>Ton temps (h : min : s)</span><div class="dur"><input id="rp-h" inputmode="numeric" placeholder="0" aria-label="Heures"><i>:</i><input id="rp-m" inputmode="numeric" placeholder="25" aria-label="Minutes" required><i>:</i><input id="rp-s" inputmode="numeric" placeholder="00" aria-label="Secondes"></div></div>`
      : `<label class="field"><span>${kind === "sec" ? "Durée de tenue (secondes)" : "Répétitions d’affilée"}</span><input id="rp-v" inputmode="numeric" placeholder="${kind === "sec" ? "ex. 15" : "ex. 12"}" required></label>`;
    return `<div class="pr${open ? " open" : ""}">
      <button class="pr-row" data-ropen="${id}"><span class="main"><b>${esc(name)}</b><span>${esc(sub)}</span></span><span class="pr-kg">${bestTxt}</span><span class="arrow" aria-hidden="true">${open ? "−" : "+"}</span></button>
      ${open ? `<form class="pr-form" data-rpr="${id}" data-kind="${kind}">${input}<button class="btn primary" type="submit">Ajouter</button></form>
        ${list.length ? `<ul class="hist">${list.map((e, idx) => ({ ...e, idx })).sort((a, b) => a.date < b.date ? 1 : -1).map(e => `<li><span>${esc(shortDate(e.date))}</span><b>${prText(kind, e)}</b><button class="icon-btn" data-rdel="${id}:${e.idx}">Retirer</button></li>`).join("")}</ul>` : ""}` : ""}
    </div>`;
  }).join("");
}
function countRecords() {
  const pd = prsData(), cf = cfData();
  return [pd.muscu, pd.course, pd.calis, cf.prs].reduce((a, o) => a + Object.values(o).filter(l => l.length).length, 0)
    + BENCH.filter(bm => benchEntries(bm).length).length;
}

/* ---------- Pages « catégories » (idées, records, progression) ---------- */
const HUB_DESC = {
  ideas: { muscu: "Push, Pull, Jambes, Haut et Bas du corps", crossfit: "Les WOD de référence à essayer", calis: "Du débutant aux figures", course: "Endurance, seuil et fractionné" },
  rec: { muscu: "Développé couché, squat, soulevé de terre…", crossfit: "1RM et temps sur les WOD de référence", calis: "Max de tractions, dips, tenues…", course: "5 km, 10 km, semi et marathon" },
  prog: { muscu: "Tes charges exercice par exercice", crossfit: "Tes WOD de référence et tes 1RM", calis: "Tes répétitions et tes tenues", course: "Ton allure et tes distances" }
};
function discGrid(mode) {
  return Object.entries(DISC).map(([id, x]) => `<button class="disc-card" data-cat="${mode}:${id}" style="--tc:${x.color}"><span class="disc-ico" aria-hidden="true"><svg viewBox="0 0 24 24">${x.icon}</svg></span><b>${x.name}</b><span>${HUB_DESC[mode][id]}</span></button>`).join("");
}
function renderTypesHub() { $("typesGrid").innerHTML = discGrid("ideas"); }
function renderRecordsHub() { $("recGrid").innerHTML = discGrid("rec"); }
function renderProgHub() { $("progGrid").innerHTML = discGrid("prog"); }
document.addEventListener("click", e => {
  const b = e.target.closest("[data-cat]"); if (!b) return;
  const [mode, d] = b.dataset.cat.split(":");
  if (d === "crossfit" && mode !== "prog") { S.cfMode = mode === "rec" ? "records" : "ideas"; S.cfOpen = null; go("crossfit"); return; }
  if (mode === "ideas") { S.hub = d; S.hubTab = null; go("hub"); }
  else if (mode === "rec") { S.rec = d; S.recOpen = null; go("rec"); }
  else { S.prog = d; S.progTab = null; go("prog"); }
});
function catColor(id) { return (typeOf(id) || DEFAULT_TYPES.find(t => t.id === id) || {}).color || "#8A847E"; }
function renderHub() {
  const d = S.hub, x = DISC[d]; if (!x) return;
  $("hubTitle").textContent = "Idées · " + x.name; $("v-hub").style.setProperty("--tc", x.color);
  let h = "";
  if (d === "muscu") {
    const types = [["push", "Push"], ["pull", "Pull"], ["jambes", "Jambes"], ["haut", "Haut du corps"], ["bas", "Bas du corps"]];
    const tab = S.hubTab && MUSCU_IDEAS[S.hubTab] ? S.hubTab : "push";
    h += `<div class="chips">${types.map(([id, n]) => `<button class="chip" data-tab="${id}" style="--tc:${catColor(id)}" aria-pressed="${id === tab}"><i class="dot"></i>${n}</button>`).join("")}</div>
      <div class="list">${MUSCU_IDEAS[tab].map((idea, i) => ideaCard(idea, "muscu", tab, i, catColor(tab))).join("")}</div>`;
  } else if (d === "course") {
    const tab = S.hubTab && RUN_IDEAS[S.hubTab] ? S.hubTab : "ef", rt = RUN_TYPES.find(r => r.id === tab);
    h += `<div class="chips">${RUN_TYPES.map(r => `<button class="chip" data-tab="${r.id}" style="--tc:${r.color}" aria-pressed="${r.id === tab}"><i class="dot"></i>${r.name}</button>`).join("")}</div>
      <p class="hint" style="margin:-10px 0 0">${esc(rt.hint)}</p>
      <div class="list">${RUN_IDEAS[tab].map((idea, i) => ideaCard(idea, "course", tab, i, rt.color)).join("")}</div>`;
  } else if (d === "calis") {
    h += `<div class="list">${CALIS_IDEAS.map((idea, i) => ideaCard(idea, "calis", "all", i, DISC.calis.color)).join("")}</div>`;
  }
  $("hubBody").innerHTML = h;
}
$("v-hub").addEventListener("click", e => {
  const tb = e.target.closest("[data-tab]"); if (tb) { S.hubTab = tb.dataset.tab; renderHub(); return; }
  const go2 = e.target.closest("[data-try]"); if (!go2) return;
  const [disc, key, idx] = go2.dataset.try.split(":");
  if (disc === "muscu") {
    const idea = MUSCU_IDEAS[key][+idx];
    tryIdea(go2, "muscu", c => { c.typeId = S.types.some(t => t.id === key) ? key : null; c.title = idea.name; c.exercises = ideaExercises(idea.ex); });
  } else if (disc === "calis") {
    const idea = CALIS_IDEAS[+idx];
    tryIdea(go2, "calis", c => { c.title = idea.name; c.exercises = ideaExercises(idea.ex); });
  } else if (disc === "course") {
    const idea = RUN_IDEAS[key][+idx];
    tryIdea(go2, "course", c => {
      c.runType = key; c.title = idea.name; c.note = idea.note || "";
      c.run = { blocks: (idea.blocks || []).map(([rep, eff, unit, pace, rec]) => ({ rep, eff, unit, pace, rec })), h: idea.h || "", m: idea.m || "", s: "" };
    });
  }
});
function renderRec() {
  const d = S.rec, x = DISC[d]; if (!x) return;
  $("recTitle").textContent = "Records · " + x.name; $("v-rec").style.setProperty("--tc", x.color);
  const pd = prsData();
  const items = d === "muscu" ? MUSCU_LIFTS : d === "course" ? RUN_PRS : CALIS_PRS;
  const hint = d === "muscu" ? "Ta charge maximale sur une répétition (ou ta meilleure série lourde)." : d === "course" ? "Ton meilleur temps sur chaque distance. L’allure se calcule toute seule." : "Ton maximum de répétitions d’affilée, ou ta plus longue tenue.";
  $("recBody").innerHTML = `<p class="hint" style="margin-top:-10px">${hint} Touche + pour ajouter un record.</p>
    <div class="card" style="gap:0;padding-block:4px">${prRows(items, pd[d], d === "muscu" ? "kg" : "time")}</div>`;
}
$("v-rec").addEventListener("click", e => {
  const op = e.target.closest("[data-ropen]"); if (op) { S.recOpen = S.recOpen === op.dataset.ropen ? null : op.dataset.ropen; renderRec(); return; }
  const del = e.target.closest("[data-rdel]");
  if (del) { if (!armed(del, "Confirmer")) return; const [id, idx] = del.dataset.rdel.split(":"), pd = prsData(); pd[S.rec][id].splice(+idx, 1); saveProfile({ prs: pd }); renderRec(); }
});
$("v-rec").addEventListener("submit", e => {
  e.preventDefault();
  const f = e.target, id = f.dataset.rpr, kind = f.dataset.kind, pd = prsData(), date = todayK(); if (!id) return;
  let entry;
  if (kind === "kg") { const kg = numOr($("rp-v").value); if (kg === "" || kg <= 0) return; entry = { kg, date }; }
  else if (kind === "time") { const t = (intOr($("rp-h").value) || 0) * 3600 + (intOr($("rp-m").value) || 0) * 60 + (intOr($("rp-s").value) || 0); if (!t) return; entry = { t, date }; }
  else { const v = intOr($("rp-v").value); if (v === "" || v <= 0) return; entry = { v, date }; }
  (pd[S.rec][id] = pd[S.rec][id] || []).push(entry);
  saveProfile({ prs: pd }); renderRec();
});

/* ---------- Graphiques de progression (courbes SVG) ---------- */
const CHARTS = {};
function niceStep(raw, time) {
  if (time) { const opts = [5, 10, 15, 30, 60, 120, 300, 600]; return opts.find(o => o >= raw) || Math.ceil(raw / 600) * 600; }
  const p = Math.pow(10, Math.floor(Math.log10(raw || 1))), f = raw / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
}
// pts : [{ k: "AAAA-MM-JJ", v: nombre }] triés par date. fmt : texte d'une valeur. better : "up" ou "down".
function lineChart(id, pts, { fmt, color, better = "up", time = false, tickFmt }) {
  const W = 340, H = 168, L = 46, R = 16, T = 22, B = 26, n = pts.length;
  const vals = pts.map(p => p.v);
  let lo = Math.min(...vals), hi = Math.max(...vals);
  if (lo === hi) { const d = Math.abs(lo) * 0.1 || 1; lo -= d; hi += d; }
  const step = niceStep((hi - lo) / 3, time);
  lo = Math.floor(lo / step) * step; hi = Math.ceil(hi / step) * step;
  if (!time && lo < 0 && Math.min(...vals) >= 0) lo = 0;
  const ticks = []; for (let t = lo; t <= hi + step / 1000; t += step) ticks.push(t);
  const X = i => n === 1 ? L + (W - L - R) / 2 : L + i * (W - L - R) / (n - 1);
  const Y = v => T + (hi - v) / (hi - lo || 1) * (H - T - B);
  const tf = tickFmt || fmt;
  const bestV = better === "down" ? Math.min(...vals) : Math.max(...vals), bestI = vals.lastIndexOf(bestV), lastI = n - 1;
  // Étiquette placée du côté libre du point (au-dessus d'un sommet, en dessous d'un creux), toujours dans le cadre.
  const lab = (i) => {
    const y0 = Y(pts[i].v), isMax = pts[i].v >= Math.max(...vals), isMin = pts[i].v <= Math.min(...vals);
    let above = isMax || (!isMin && better === "up");
    if (isMin && !isMax) above = false;
    let y = y0 + (above ? -11 : 19), side = false;
    if (y < 10) y = y0 + 19;
    if (y > H - B - 2) { y = y0 + 4; side = true; } // pas de place en dessous : à côté du point
    let anchor = X(i) > W - R - 40 ? "end" : X(i) < L + 40 ? "start" : "middle";
    let x = anchor === "end" ? X(i) + 4 : anchor === "start" ? X(i) - 4 : X(i);
    if (side) { anchor = X(i) > W / 2 ? "end" : "start"; x = anchor === "end" ? X(i) - 10 : X(i) + 10; }
    return `<text class="c-lab" x="${x}" y="${y}" text-anchor="${anchor}">${esc(fmt(pts[i].v))}</text>`;
  };
  CHARTS[id] = { pts, X, Y, fmt, W };
  return `<div class="chart" data-chart="${id}" style="--cc:${color}">
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Courbe de progression, ${n} séances">
      ${ticks.map(t => `<line class="c-grid" x1="${L}" x2="${W - R}" y1="${Y(t)}" y2="${Y(t)}"/><text class="c-tick" x="${L - 6}" y="${Y(t) + 3.5}" text-anchor="end">${esc(tf(t))}</text>`).join("")}
      <text class="c-tick" x="${X(0)}" y="${H - 6}" text-anchor="${n === 1 ? "middle" : "start"}">${esc(shortDate(pts[0].k))}</text>
      ${n > 1 ? `<text class="c-tick" x="${X(lastI)}" y="${H - 6}" text-anchor="end">${esc(shortDate(pts[lastI].k))}</text>` : ""}
      <line class="c-xh" x1="0" x2="0" y1="${T - 6}" y2="${H - B}" style="opacity:0"/>
      ${n > 1 ? `<path class="c-line" d="${pts.map((p, i) => (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(p.v).toFixed(1)).join(" ")}"/>` : ""}
      ${pts.map((p, i) => `<circle class="c-pt${i === bestI ? " best" : ""}" cx="${X(i).toFixed(1)}" cy="${Y(p.v).toFixed(1)}" r="${i === lastI || i === bestI ? 5 : 4}"/>`).join("")}
      ${lab(bestI)}${lastI !== bestI && pts[lastI].v !== bestV ? lab(lastI) : ""}
      <rect class="c-hit" x="${L - 10}" y="0" width="${W - L - R + 20}" height="${H}"/>
    </svg>
    <div class="c-tip" hidden></div>
  </div>`;
}
function chartPoint(el, clientX) {
  const c = CHARTS[el.dataset.chart]; if (!c) return;
  const svg = el.querySelector("svg"), r = svg.getBoundingClientRect(), x = (clientX - r.left) / r.width * c.W;
  let bi = 0, bd = 1e9; c.pts.forEach((p, i) => { const d = Math.abs(c.X(i) - x); if (d < bd) { bd = d; bi = i; } });
  const px = c.X(bi), xh = el.querySelector(".c-xh"), tip = el.querySelector(".c-tip");
  xh.setAttribute("x1", px); xh.setAttribute("x2", px); xh.style.opacity = 1;
  el.querySelectorAll(".c-pt").forEach((ci, i) => ci.classList.toggle("on", i === bi));
  tip.hidden = false; tip.innerHTML = `<b>${esc(c.fmt(c.pts[bi].v))}</b><span>${esc(shortDate(c.pts[bi].k))}${c.pts[bi].note ? " · " + esc(c.pts[bi].note) : ""}</span>`;
  const pct = px / c.W * 100; tip.style.left = `clamp(0px, calc(${pct}% - 60px), calc(100% - 120px))`;
}
document.addEventListener("pointermove", e => { const el = e.target.closest && e.target.closest(".chart"); if (el && e.pointerType === "mouse") chartPoint(el, e.clientX); });
document.addEventListener("pointerdown", e => { const el = e.target.closest && e.target.closest(".chart"); if (el) chartPoint(el, e.clientX); });

// Carte d'un graphique : titre, meilleur résultat, évolution, courbe et tableau des valeurs.
function chartCard(id, title, pts, opt) {
  const first = pts[0].v, last = pts[pts.length - 1].v, diff = last - first, better = opt.better || "up";
  const good = better === "up" ? diff > 0 : diff < 0;
  const best = better === "down" ? Math.min(...pts.map(p => p.v)) : Math.max(...pts.map(p => p.v));
  const evo = pts.length < 2 || !diff ? `<span class="evo">${pts.length < 2 ? "1 séance pour l’instant" : "stable"}</span>`
    : `<span class="evo ${good ? "up" : "down"}">${good ? "▲" : "▼"} ${esc(opt.diffFmt ? opt.diffFmt(Math.abs(diff)) : opt.fmt(Math.abs(diff)))} depuis le ${esc(shortDate(pts[0].k))}</span>`;
  return `<article class="prog-card" style="--cc:${opt.color}">
    <div class="prog-top"><b>${esc(title)}</b><span class="prog-best"><small>${opt.bestLabel || "Record"}</small>${esc(opt.fmt(best))}</span></div>
    ${evo}
    ${lineChart(id, pts, opt)}
    <details class="prog-tab"><summary>Voir les valeurs</summary><table><tbody>${pts.slice().reverse().map(p => `<tr><td>${esc(shortDate(p.k))}</td><td>${esc(opt.fmt(p.v))}</td></tr>`).join("")}</tbody></table></details>
  </article>`;
}
const emptyProg = txt => `<div class="empty">${txt}</div>`;
// Regroupe les séances par exercice (nom sans accents ni majuscules) : un point par séance.
function exerciseSeries(days, valueOf) {
  const map = new Map();
  days.forEach(k => (S.days[k].exercises || []).forEach(ex => {
    const name = String(ex.name || "").trim(); if (!name) return;
    const v = valueOf(ex); if (!v) return;
    const key = norm(name).replace(/\s+/g, " ").trim() + (ex.hold ? "#t" : "");
    const it = map.get(key) || { name, hold: !!ex.hold, pts: [] };
    it.name = name; const prev = it.pts.find(p => p.k === k);
    if (prev) prev.v = Math.max(prev.v, v); else it.pts.push({ k, v });
    map.set(key, it);
  }));
  return [...map.values()].sort((a, b) => b.pts.length - a.pts.length || a.name.localeCompare(b.name));
}
const doneSet = st => st.reps !== "" && st.reps != null;
function renderProg() {
  const d = S.prog, x = DISC[d]; if (!x) return;
  $("progTitle").textContent = "Progression · " + x.name; $("v-prog").style.setProperty("--tc", x.color);
  const days = Object.keys(S.days).filter(k => discOf(S.days[k]) === d).sort();
  let h = "";
  if (d === "muscu") {
    const used = S.types.filter(t => days.some(k => S.days[k].typeId === t.id));
    const tab = S.progTab && used.some(t => t.id === S.progTab) ? S.progTab : (used[0] && used[0].id);
    if (!used.length) h = emptyProg("Pas encore de séance de musculation. Note tes séances avec leurs poids : ta progression s’affichera ici, exercice par exercice.");
    else {
      const t = typeOf(tab), series = exerciseSeries(days.filter(k => S.days[k].typeId === tab),
        ex => Math.max(0, ...(ex.sets || []).filter(doneSet).map(st => +st.kg || 0)));
      h = `<div class="chips">${used.map(u => `<button class="chip" data-ptab="${u.id}" style="--tc:${u.color}" aria-pressed="${u.id === tab}"><i class="dot"></i>${esc(u.name)}</button>`).join("")}</div>
        <p class="hint" style="margin:-10px 0 0">Charge maximale soulevée à chaque séance ${esc(t.name)}. Touche une courbe pour voir le détail.</p>
        ${series.length ? `<div class="list">${series.slice(0, 15).map((s, i) => chartCard("m" + i, s.name, s.pts, { fmt: v => nf.format(v) + " kg", tickFmt: v => nf.format(v), color: t.color })).join("")}</div>`
          : emptyProg("Aucun poids noté dans tes séances " + esc(t.name) + " pour l’instant.")}`;
    }
  } else if (d === "calis") {
    const series = exerciseSeries(days, ex => Math.max(0, ...(ex.sets || []).map(st => +st.reps || 0)));
    h = series.length ? `<p class="hint" style="margin-top:-10px">Ton meilleur résultat par séance : répétitions, ou secondes pour les figures tenues.</p>
      <div class="list">${series.slice(0, 15).map((s, i) => chartCard("c" + i, s.name, s.pts, { fmt: v => v + (s.hold ? " s" : " reps"), tickFmt: v => String(v), color: DISC.calis.color, bestLabel: "Max" })).join("")}</div>`
      : emptyProg("Pas encore de séance de callisthénie notée. Ta progression s’affichera ici, exercice par exercice.");
  } else if (d === "course") {
    const tab = S.progTab || "all";
    const sel = days.filter(k => tab === "all" || S.days[k].runType === tab);
    const col = tab === "all" ? DISC.course.color : RUN_TYPES.find(r => r.id === tab).color;
    const pace = sel.map(k => { const r = S.days[k].run || {}, t = runSecs(r), dist = +r.dist || 0; return t && dist ? { k, v: Math.round(t / dist) } : null; }).filter(Boolean);
    const dist = sel.map(k => { const r = S.days[k].run || {}; return +r.dist ? { k, v: +r.dist } : null; }).filter(Boolean);
    h = `<div class="chips"><button class="chip" data-ptab="all" style="--tc:${DISC.course.color}" aria-pressed="${tab === "all"}">Toutes</button>${RUN_TYPES.map(r => `<button class="chip" data-ptab="${r.id}" style="--tc:${r.color}" aria-pressed="${r.id === tab}"><i class="dot"></i>${r.name}</button>`).join("")}</div>
      ${pace.length ? `<div class="list">
        ${chartCard("rp", "Allure moyenne", pace, { fmt: v => fmtTime(v) + " /km", tickFmt: v => fmtTime(v), diffFmt: v => fmtTime(v) + " /km", color: col, better: "down", time: true, bestLabel: "Meilleure" })}
        ${chartCard("rd", "Distance", dist, { fmt: v => nf.format(v) + " km", tickFmt: v => nf.format(v), color: col, bestLabel: "Plus longue" })}
      </div><p class="hint">Pour l’allure, plus la courbe descend, plus tu cours vite.</p>`
        : emptyProg("Pas encore de sortie avec distance et durée. Entre-les dans tes séances de course : ton allure et tes distances s’afficheront ici.")}`;
  } else if (d === "crossfit") {
    const cf = cfData();
    const benches = BENCH.map(bm => ({ bm, ents: benchEntries(bm).slice().sort((a, b) => a.date < b.date ? -1 : 1) })).filter(o => o.ents.length);
    const lifts = LIFTS.map(([id, name]) => ({ id, name, pts: (cf.prs[id] || []).slice().sort((a, b) => a.date < b.date ? -1 : 1).map(e => ({ k: e.date, v: e.kg })) })).filter(o => o.pts.length);
    h = `${benches.length ? `<h2 class="h2">WOD de référence</h2><div class="list">${benches.map((o, i) => o.bm.type === "amrap"
        ? chartCard("b" + i, o.bm.name, o.ents.map(e => ({ k: e.date, v: e.r + (e.reps || 0) / 100, note: e.rx === false ? "Scaled" : "Rx" })), { fmt: v => `${Math.floor(v)} tours + ${Math.round((v % 1) * 100)}`, tickFmt: v => String(Math.round(v)), diffFmt: v => nf.format(v) + " tour(s)", color: DISC.crossfit.color, bestLabel: "Record" })
        : chartCard("b" + i, o.bm.name, o.ents.map(e => ({ k: e.date, v: e.t, note: e.rx === false ? "Scaled" : "Rx" })), { fmt: fmtTime, color: DISC.crossfit.color, better: "down", time: true, bestLabel: "Record" })).join("")}</div>` : ""}
      ${lifts.length ? `<h2 class="h2">Records 1RM</h2><div class="list">${lifts.map((o, i) => chartCard("l" + i, o.name, o.pts, { fmt: v => nf.format(v) + " kg", tickFmt: v => nf.format(v), color: DISC.crossfit.color })).join("")}</div>` : ""}
      ${!benches.length && !lifts.length ? emptyProg("Note tes résultats sur les WOD de référence (Fran, Murph…) et tes 1RM dans « Mes records » : leur évolution s’affichera ici.") : ""}
      ${benches.length ? `<p class="hint">Pour un WOD en temps, plus la courbe descend, plus tu es rapide.</p>` : ""}`;
  }
  $("progBody").innerHTML = h;
}
$("v-prog").addEventListener("click", e => { const t = e.target.closest("[data-ptab]"); if (t) { S.progTab = t.dataset.ptab; renderProg(); } });

/* ============================================================
   Minuteur de repos
   ============================================================ */
const RT = { end: 0, total: 0, tick: null, ctx: null, lastLeft: null };
const SOUNDS = [["bip", "Bip"], ["alarme", "Alarme"], ["sifflet", "Sifflet"], ["gong", "Gong"]];
function soundPrefs() { return { vol: 80, type: "bip", countdown: true, ...((S.prefs && S.prefs.sound) || {}) }; }
function audioReady() {
  try { RT.ctx = RT.ctx || new (window.AudioContext || window.webkitAudioContext)(); if (RT.ctx.state === "suspended") RT.ctx.resume(); } catch (e) { RT.ctx = null; }
  return RT.ctx;
}
// Une note : fréquence (ou [début, fin] pour un glissement), début, durée, forme d'onde, volume relatif.
function tone(ctx, master, f, t0, dur, wave, rel) {
  const o = ctx.createOscillator(), g = ctx.createGain(), at = ctx.currentTime + t0;
  o.type = wave;
  if (Array.isArray(f)) { o.frequency.setValueAtTime(f[0], at); o.frequency.exponentialRampToValueAtTime(f[1], at + dur); } else o.frequency.setValueAtTime(f, at);
  g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, master * rel), at + 0.015);
  g.gain.setValueAtTime(Math.max(0.0002, master * rel), at + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g); g.connect(ctx.destination); o.start(at); o.stop(at + dur + 0.02);
}
function playSound(kind) {
  const ctx = audioReady(); if (!ctx) return;
  const p = soundPrefs(), master = Math.min(1, Math.max(0, p.vol / 100));
  if (!master) return;
  try {
    if (kind === "tick") { tone(ctx, master, 1046, 0, 0.09, "square", 0.45); return; }
    const type = kind || p.type;
    if (type === "alarme") for (let i = 0; i < 6; i++) tone(ctx, master, i % 2 ? 740 : 988, i * 0.18, 0.16, "sawtooth", 0.8);
    else if (type === "sifflet") { tone(ctx, master, [1400, 2600], 0, 0.28, "sine", 1); tone(ctx, master, [1400, 2600], 0.36, 0.28, "sine", 1); tone(ctx, master, 2600, 0.72, 0.5, "sine", 1); }
    else if (type === "gong") { tone(ctx, master, 196, 0, 1.6, "sine", 1); tone(ctx, master, 392, 0, 1.2, "triangle", 0.6); tone(ctx, master, 587, 0, 0.9, "sine", 0.35); }
    else [0, 0.28, 0.56].forEach(t => tone(ctx, master, 880, t, 0.2, "square", 0.9));
  } catch (e) { /* son indisponible */ }
}
function startRest(seconds, name, ctx) {
  if (!seconds) seconds = 90;
  if (RT.tick && RT.ex != null) { const prev = RT.ex; RT.tick = (clearInterval(RT.tick), null); RT.ex = null; advanceAfterRest(prev); }
  RT.day = ctx ? ctx.day : null; RT.ex = ctx ? ctx.ex : null; RT.iv = null;
  audioReady(); // débloque le son (il faut un toucher de l'utilisateur sur iPhone)
  RT.total = seconds; RT.end = Date.now() + seconds * 1000; RT.lastLeft = null;
  $("rtLbl").textContent = name ? "Repos · " + name : "Repos";
  $("restTimer").classList.remove("done"); $("restTimer").hidden = false; $("rtSkip").textContent = "Passer";
  clearInterval(RT.tick); RT.tick = setInterval(drawRest, 200); drawRest();
}
function drawRest() {
  const left = Math.max(0, Math.ceil((RT.end - Date.now()) / 1000));
  $("rtTime").textContent = Math.floor(left / 60) + ":" + pad(left % 60);
  $("rtFill").style.width = (RT.total ? left / RT.total * 100 : 0) + "%";
  if (left !== RT.lastLeft && left > 0 && left <= 3 && soundPrefs().countdown) playSound("tick");
  RT.lastLeft = left;
  if (left <= 0 && RT.iv && RT.iv.rep + 1 < RT.iv.n) {
    // Départ suivant (cordes) : on relance tout de suite le même intervalle.
    RT.iv.rep++; RT.end = Date.now() + RT.total * 1000; RT.lastLeft = null;
    $("rtLbl").textContent = `Départ ${RT.iv.rep} / ${RT.iv.n} · ${RT.iv.name}`;
    playSound(); if (navigator.vibrate) navigator.vibrate([200, 80, 200]);
    return;
  }
  if (left <= 0) {
    clearInterval(RT.tick); RT.tick = null;
    $("restTimer").classList.add("done"); $("rtLbl").textContent = RT.iv ? `Départ ${RT.iv.n} / ${RT.iv.n} · le dernier !` : "C’est reparti !"; RT.iv = null; $("rtTime").textContent = "0:00"; $("rtSkip").textContent = "OK";
    playSound(); if (navigator.vibrate) navigator.vibrate([300, 120, 300, 120, 300]);
    const ei = RT.ex; RT.ex = null; if (S.open && S.open === RT.day) advanceAfterRest(ei);
    setTimeout(() => { if (!RT.tick) $("restTimer").hidden = true; }, 6000);
  }
}
// Départs réguliers (ex. 10 cordes, départ toutes les 60 s) : le minuteur se relance à chaque départ.
function startIntervals(every, n, name) {
  if (!every) { toast("Indique le temps entre deux départs."); return; }
  startRest(every, name);
  if (n < 2) { $("rtLbl").textContent = "Départ · " + name; return; }
  RT.iv = { rep: 1, n, name };
  $("rtLbl").textContent = `Départ 1 / ${n} · ${name}`;
}
$("rtPlus").onclick = () => { if (RT.tick) { RT.end += 15000; RT.total += 15; drawRest(); } else startRest(15); };
$("rtSkip").onclick = () => {
  const running = !!RT.tick; clearInterval(RT.tick); RT.tick = null; $("restTimer").hidden = true;
  if (running) { const ei = RT.ex; RT.ex = null; if (S.open && S.open === RT.day) advanceAfterRest(ei); }
};

// Réglages du son (page Profil)
function renderSound() {
  const p = soundPrefs();
  $("sndVol").value = p.vol; $("sndVolTxt").textContent = p.vol + " %";
  $("sndTypes").innerHTML = SOUNDS.map(([id, n]) => `<button type="button" class="chip" data-snd="${id}" style="--tc:var(--red)" aria-pressed="${p.type === id}">${n}</button>`).join("");
  $("sndCount").setAttribute("aria-pressed", String(!!p.countdown));
}
let sndTimer = null;
function saveSound(patch, silent) {
  S.prefs.sound = { ...soundPrefs(), ...patch };
  clearTimeout(sndTimer); sndTimer = setTimeout(savePrefs, 400);
  renderSound(); if (!silent) playSound();
}
$("sndVol").addEventListener("input", e => { S.prefs.sound = { ...soundPrefs(), vol: +e.target.value }; $("sndVolTxt").textContent = e.target.value + " %"; });
$("sndVol").addEventListener("change", e => saveSound({ vol: +e.target.value }));
$("sndTypes").addEventListener("click", e => { const b = e.target.closest("[data-snd]"); if (b) saveSound({ type: b.dataset.snd }); });
$("sndCount").onclick = () => saveSound({ countdown: !soundPrefs().countdown }, true);
$("sndTest").onclick = () => playSound();

/* ============================================================
   Installation sur l'écran d'accueil
   ============================================================ */
const UA = navigator.userAgent;
const IS_IOS = /iphone|ipad|ipod/i.test(UA) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const IS_ANDROID = /android/i.test(UA);
// Navigateur intégré à une autre app (lien ouvert depuis Snapchat, Instagram, Messenger…) : l'installation y est impossible.
const IN_APP = /Instagram|FBAN|FBAV|FB_IAB|Messenger|Snapchat|musical_ly|TikTok|Twitter|LinkedInApp|Line\//i.test(UA);
const standalone = () => window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
let deferredInstall = null;
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredInstall = e; refreshInstallBtn(); });
window.addEventListener("appinstalled", () => { lsSet("install-done", 1); closeInstall(); refreshInstallBtn(); });
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, String(v)); } catch (e) { /* stockage bloqué */ } }
const canInstall = () => !standalone() && !lsGet("install-done") && (IS_IOS || IS_ANDROID || !!deferredInstall);
function refreshInstallBtn() {
  const b = $("installBtn"); if (b) b.hidden = !canInstall();
  const bn = $("installBanner"); if (bn) bn.hidden = !canInstall() || !!lsGet("install-banner-off");
}
const ICON_SHARE = '<svg viewBox="0 0 24 24"><path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>';
const ICON_PLUS = '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/></svg>';
function openInstall() {
  if (!canInstall()) return;
  const link = location.origin + location.pathname;
  $("installBody").innerHTML = IN_APP
    ? `<ol class="steps"><li><span class="n">1</span><span>Tu as ouvert le lien depuis une autre app (Snapchat, Instagram…). Il faut l’ouvrir dans <b>${IS_IOS ? "Safari" : "Chrome"}</b>.</span></li>
         <li><span class="n">2</span><span>Touche <b>•••</b> ou l’icône <b>${IS_IOS ? "boussole" : "navigateur"}</b>, puis <b>Ouvrir dans ${IS_IOS ? "Safari" : "le navigateur"}</b>.</span></li>
         <li><span class="n">3</span><span>Tu ne trouves pas ? Copie le lien et colle-le dans ${IS_IOS ? "Safari" : "Chrome"}.</span></li></ol>
       <button type="button" class="btn primary" id="installCopy" style="width:100%">Copier le lien</button>
       <p class="hint" id="installLink" style="text-align:center;user-select:all;word-break:break-all">${esc(link)}</p>`
    : deferredInstall
    ? `<button type="button" class="btn primary" id="installGo" style="width:100%">Installer l’application</button>`
    : IS_IOS
      ? `<ol class="steps"><li><span class="n">1</span><span>Touche <b>Partager</b> en bas de Safari</span><span class="ico">${ICON_SHARE}</span></li>
         <li><span class="n">2</span><span>Choisis <b>Sur l’écran d’accueil</b></span><span class="ico">${ICON_PLUS}</span></li>
         <li><span class="n">3</span><span>Touche <b>Ajouter</b>, c’est fait&nbsp;!</span></li></ol>
         <p class="hint" style="margin-top:6px">Tu ne vois pas « Partager » ? Il est parfois dans le menu <b>•••</b>. Sur un autre navigateur que Safari, ouvre d’abord ce lien dans Safari.</p>`
      : `<ol class="steps"><li><span class="n">1</span><span>Touche le menu <b>⋮</b> en haut à droite</span></li>
         <li><span class="n">2</span><span>Choisis <b>Installer l’application</b> ou <b>Ajouter à l’écran d’accueil</b></span><span class="ico">${ICON_PLUS}</span></li></ol>`;
  $("installBackdrop").hidden = false; $("installSheet").hidden = false;
  const cp = $("installCopy");
  if (cp) cp.onclick = async () => {
    try { await navigator.clipboard.writeText(link); cp.textContent = "Lien copié ✓"; }
    catch (e) { const r = document.createRange(); r.selectNodeContents($("installLink")); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); cp.textContent = "Lien sélectionné : copie-le"; }
  };
  const go = $("installGo");
  if (go) go.onclick = async () => {
    const p = deferredInstall; deferredInstall = null; closeInstall();
    try { p.prompt(); const r = await p.userChoice; if (r && r.outcome === "accepted") lsSet("install-done", 1); } catch (e) { /* fenêtre système fermée */ }
    refreshInstallBtn();
  };
}
function closeInstall() { $("installBackdrop").hidden = true; $("installSheet").hidden = true; }
$("installLater").onclick = () => { lsSet("install-later", Date.now()); closeInstall(); };
$("installBackdrop").onclick = () => { lsSet("install-later", Date.now()); closeInstall(); };
$("installBtn").onclick = () => openInstall();
$("installBannerOpen").onclick = () => openInstall();
$("installBannerClose").onclick = () => { lsSet("install-banner-off", 1); refreshInstallBtn(); };
let installTimer = null;
function maybeInvite() {
  clearTimeout(installTimer);
  if (newsPending()) return;
  const later = +(lsGet("install-later") || 0);
  if (!canInstall() || Date.now() - later < 7 * 864e5) return;
  installTimer = setTimeout(() => { if (S.screen === "home" && !document.body.classList.contains("sheet-open")) openInstall(); }, 3000);
}

/* ============================================================
   Assistant (FAQ, sans IA)
   ============================================================ */
const FAQ = [
  { q: "C’est quoi Let’s go ?", k: "lets go let go lancer demarrer seance commencer accueil",
    a: "Let’s go, c’est ton point de départ pour t’entraîner : démarre une séance, lance une routine ou la prochaine séance de ton programme.\nTu y trouves aussi le calendrier, les idées de séances, tes records, ta progression, la carte musculaire et ton bilan du mois." },
  { q: "Comment créer une routine ?", k: "routine enregistrer sauvegarder modele refaire seance favorite",
    a: "Deux façons :\n• dans une séance, touche « ☆ Enregistrer comme routine » ;\n• ou Let’s go › Mes routines › « + Créer une routine ».\nEnsuite, un toucher sur « Lancer » et la séance est prête, avec tes poids de la dernière fois." },
  { q: "Comment suivre un programme ?", k: "programme plan semaines ppl full body 5x5 prepa 10 km suivre",
    a: "Let’s go › Programmes, puis « Suivre ce programme ».\nL’app te propose ensuite la bonne séance à chaque fois (« ▶ Lancer »), semaine après semaine." },
  { q: "C’est quoi « la dernière fois » ?", k: "derniere fois historique precedent poids pre rempli avant",
    a: "Quand tu ajoutes un exercice déjà fait, l’app affiche ce que tu as fait la dernière fois (↺) et reprend tes poids. Les répétitions sont proposées en gris : tape les tiennes ou valide la série." },
  { q: "Comment marchent les records en direct ?", k: "record nouveau pr battre trophee direct",
    a: "Quand tu valides une série plus lourde que ton meilleur résultat (ou plus de reps au même poids), un bandeau « 🏆 Nouveau record ! » s’affiche. Pour la course : ta plus longue sortie et ta meilleure allure. Tes amis voient tes records dans le fil d’actu." },
  { q: "C’est quoi la série 🔥 ?", k: "serie flamme streak objectif semaine hebdo anneau",
    a: "Sur l’accueil, choisis ton objectif de séances par semaine (touche l’anneau). Chaque semaine où tu l’atteins fait grandir ta série 🔥. Les jours « Repos » ne comptent pas." },
  { q: "Plusieurs séances le même jour ?", k: "plusieurs deux seances meme jour matin soir double",
    a: "Oui : dans une séance, touche « + Autre séance » en haut, ou « + Nouvelle » dans Let’s go. Les séances du jour s’affichent en onglets." },
  { q: "C’est quoi la carte musculaire ?", k: "carte musculaire muscles corps travailles oublies",
    a: "Let’s go › Carte musculaire : les muscles travaillés sur 7 ou 30 jours s’allument, du plus clair au plus rouge. Touche un muscle pour voir son nombre de séries." },
  { q: "Comment partager mon bilan ?", k: "bilan mois story partager instagram image recap",
    a: "Let’s go › Bilan du mois, puis « 📲 Partager en story ». Une image est créée avec tes chiffres du mois : partage-la sur Insta, Snap ou WhatsApp." },
  { q: "Comment lancer un défi ?", k: "defi challenge competition amis concours",
    a: "Social › Défis › « + Nouveau défi » : choisis ce qu’on compte (séances, jours actifs, km ou volume), la durée et les amis invités. Le classement se met à jour tout seul." },
  { q: "Comment commenter une séance ?", k: "commenter commentaire fil actu actualite feed",
    a: "Social › Fil d’actu : sous chaque séance de tes amis, écris ton commentaire et touche « Envoyer ». Tu vois les commentaires sur tes séances dans Social et dans la fiche de la séance." },
  { q: "Comment noter une séance ?", k: "noter seance ajouter entrainement jour calendrier creer",
    a: "Va dans Séances, puis touche le jour voulu dans le calendrier (ou « Noter la séance du jour »).\nChoisis ton activité : Musculation, CrossFit, Callisthénie ou Course à pied. Chaque activité a sa fiche adaptée." },
  { q: "Comment ajouter des séries ?", k: "serie series repetition reps poids kg exercice ajouter",
    a: "Dans ta séance, touche « + Ajouter un exercice », écris son nom, puis remplis Reps et Poids pour chaque série.\n« + Ajouter une série » recopie la série précédente pour aller plus vite." },
  { q: "Comment marche le temps de repos ?", k: "repos minuteur timer chrono temps pause recuperation",
    a: "Sous chaque exercice, règle ton temps de repos avec − et + (par pas de 15 s).\nAprès ta série, touche « ✓ Série 1 finie · repos » : la série passe en vert et le minuteur démarre. À la fin du repos, la série suivante s’allume toute seule. « +15 s » ajoute du temps, « Passer » passe directement à la série suivante." },
  { q: "Est-ce que ma séance s’enregistre ?", k: "enregistrer sauvegarder sauvegarde perdu perdre bouton valider",
    a: "Oui, tout s’enregistre tout seul pendant que tu écris, pas besoin de bouton.\nUn message rouge s’affiche en haut seulement s’il y a un problème de connexion." },
  { q: "C’est quoi le RPE ?", k: "rpe difficulte dur effort note",
    a: "Le RPE note la difficulté de 1 à 10.\n8 = il te restait 2 répétitions en réserve, 9 = 1 répétition, 10 = échec. Ça t’aide à savoir quand augmenter les charges." },
  { q: "Comment ajouter une photo ?", k: "photo image camera prendre physique",
    a: "Ouvre ta séance et descends jusqu’à « Photos », puis touche « + Prendre une photo ».\nTouche une photo pour l’agrandir ou la supprimer." },
  { q: "Comment reprendre ma dernière séance ?", k: "reprendre copier derniere precedente meme",
    a: "Sur un jour vide, choisis le type de séance : un bouton « Reprendre la dernière séance » apparaît. Il recopie tes exercices et tes poids." },
  { q: "Comment changer les types et les couleurs ?", k: "type couleur modifier push pull jambes cardio cordes repos",
    a: "Dans Séances, touche le bouton « Types ». Tu peux renommer un type, changer sa couleur (touche la pastille), en ajouter ou en retirer." },
  { q: "Comment noter ma créatine ?", k: "creatine prise dose",
    a: "Nutrition › Créatine : touche le grand rond, il devient rouge = prise.\nTu as oublié un jour ? Touche la date dans le calendrier en dessous. La dose se règle en bas de la page." },
  { q: "Comment ajouter un complément ?", k: "complement whey proteine omega vitamine magnesium supplement",
    a: "Nutrition › Compléments : touche un complément dans « Ajout rapide », ou écris-en un nouveau avec sa dose. Les flèches en haut changent de jour." },
  { q: "Comment installer l’app sur mon téléphone ?", k: "installer app application ecran accueil telecharger icone",
    a: "Sur iPhone : dans Safari, touche Partager puis « Sur l’écran d’accueil ».\nSur Android : menu ⋮ puis « Installer l’application ».\nTu retrouves aussi un bouton dans Profil." },
  { q: "Comment modifier mon profil ?", k: "profil modifier photo pseudo poids taille age objectif infos",
    a: "Touche « Profil » en haut à droite de l’accueil, puis « Modifier ». Change ce que tu veux et touche « Enregistrer »." },
  { q: "J’ai oublié mon mot de passe", k: "mot de passe oublie oubli reinitialiser connexion connecter",
    a: "Sur l’écran de connexion, écris ton e-mail puis touche « Mot de passe oublié ? ». Tu reçois un lien par e-mail (regarde aussi dans les spams)." },
  { q: "Mes données sont-elles privées ?", k: "prive privee donnees securite voir confidentialite",
    a: "Les autres utilisateurs ne peuvent pas voir tes données.\nL’administrateur de l’application peut consulter les comptes pour gérer l’app et t’aider." },
  { q: "Ça marche sans internet ?", k: "internet hors connexion reseau wifi offline",
    a: "Oui, l’app s’ouvre sans réseau et garde tes modifications. Elles sont envoyées dès que la connexion revient." },
  { q: "Comment supprimer mon compte ?", k: "supprimer compte effacer desinscrire",
    a: "Profil › « Supprimer mon compte et mes données », puis confirme avec ton mot de passe. Tout est effacé définitivement." },
  { q: "Comment noter une course à pied ?", k: "course courir running footing endurance fondamentale seuil fractionne vma allure distance km",
    a: "Touche un jour › Course à pied, puis choisis Endurance fondamentale, Seuil ou Fractionné.\nEntre la distance et la durée : ton allure (min/km) et ta vitesse se calculent seules. Pour le seuil et le fractionné, ajoute tes blocs (ex. 10 × 400 m, récup 1:00) et lance le minuteur de récup." },
  { q: "Comment noter un WOD de CrossFit ?", k: "crossfit wod noter enregistrer score",
    a: "Touche un jour › CrossFit. Choisis le format (For Time, AMRAP, EMOM…), écris les mouvements, puis ton score et Rx ou Scaled.\nÉcris « Fran », « Murph »… dans le nom du WOD : les mouvements se remplissent tout seuls." },
  { q: "Où voir mes records de CrossFit ?", k: "record 1rm pr charge max benchmark girls fran murph cindy",
    a: "Sur l’accueil, touche CrossFit : tu y notes tes records (1RM) en back squat, clean, snatch… et tes temps sur les WOD de référence comme Fran ou Murph." },
  { q: "Comment noter une séance de callisthénie ?", k: "callisthenie calisthenics street workout traction dips muscle front lever planche handstand poids corps",
    a: "Touche un jour › Callisthénie. Ajoute tes exercices en un toucher (Tractions, Dips, Front lever…). Pour les figures tenues, touche « Reps ⇄ » pour noter des secondes. La colonne Lest sert si tu t’alourdis." },
  { q: "Où trouver des idées de séances ?", k: "idee idees seance type programme exemple inspiration essayer",
    a: "Sur l’accueil, touche « Séances types » puis choisis ton activité : Musculation (Push, Pull, Jambes…), CrossFit, Callisthénie ou Course à pied.\nChaque idée a un bouton « Essayer aujourd’hui » qui remplit ta séance du jour." },
  { q: "Où noter mes records (PR) ?", k: "record pr 5km 10km semi marathon developpe couche squat souleve",
    a: "Accueil › Mes records, puis choisis ta catégorie : Musculation, CrossFit, Callisthénie ou Course à pied. Touche + pour ajouter un record : ton meilleur s’affiche en gros." },
  { q: "Où voir ma progression ?", k: "progression graphique courbe evolution progres stats statistiques", a: "Accueil › Ma progression, puis choisis ta catégorie. En musculation, choisis Push, Pull… : chaque exercice a sa courbe avec ta charge max à chaque séance. Touche une courbe pour voir la valeur d’une séance." },
  { q: "Comment régler le son du minuteur ?", k: "son volume minuteur chrono bip alarme entendre fort",
    a: "Profil › « Son du minuteur » : règle le volume, choisis Bip, Alarme, Sifflet ou Gong, et touche « Tester le son ».\nSur iPhone, le son est coupé si le bouton silencieux (sur le côté) est activé." },
  { q: "C’est quoi la série en couleur ?", k: "serie couleur cours surligne verte",
    a: "Dans une séance, la série sur laquelle tu es est entourée de ta couleur principale (« Série en cours »). Remplis tes reps et ton poids, puis touche « ✓ Série finie » : elle passe en vert, le repos démarre, et la suivante s’allume à la fin du chrono." },
  { q: "Comment ajouter un ami ?", k: "ami amis ajouter code pseudo demande accepter", a: "Accueil › Amis. Donne ton code ami (ex. THEO-4821) à tes potes, ou cherche leur code ou leur pseudo, puis touche « Ajouter ». Ton ami accepte la demande et c’est fait." },
  { q: "Comment envoyer un message à un ami ?", k: "message messages ecrire discuter conversation chat", a: "Accueil › Amis, puis touche 💬 à côté de ton ami. Les messages ne sont visibles que par vous deux. Un point rouge t’indique les nouveaux messages." },
  { q: "Comment essayer la séance d’un ami ?", k: "seance ami essayer copier suivre voir", a: "Accueil › Amis, touche ton ami puis une de ses séances, et « Essayer cette séance » : elle est copiée dans ta séance du jour, avec ses poids comme objectif. Tu peux aussi réagir avec 💪 🔥 👏." },
  { q: "Qui voit mes séances ?", k: "voir seances prive partager partage confidentialite amis", a: "Seulement tes amis acceptés, et seulement si « Partager mes séances avec mes amis » est activé (Accueil › Amis). Ta nutrition et tes infos personnelles ne sont jamais partagées." },
  { q: "Comment bloquer ou signaler quelqu’un ?", k: "bloquer signaler harcelement probleme insulte", a: "Dans une conversation, touche ••• puis « Bloquer » ou « Signaler ». Tu peux aussi toucher un message pour le signaler. Les signalements arrivent chez l’administrateur." },
  { q: "Comment contacter le créateur ?", k: "contact contacter createur probleme bug aide reclamation idee",
    a: "Touche « Contact » en bas de l’accueil, choisis un objet et écris ton message : il arrive directement chez moi." }
];
const norm = t => String(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, " ");
// Lexique : t = termes exacts (bonus de pertinence), lex = rubrique du lexique.
const GLOSS = [
  { lex: "cf", t: ["wod"], q: "C’est quoi un WOD ?", k: "wod workout day seance jour",
    a: "WOD = « Workout Of the Day », l’entraînement du jour.\nEn CrossFit, c’est la partie principale de la séance : souvent courte (5 à 20 min) et intense, elle mélange cardio, gymnastique et haltérophilie." },
  { lex: "cf", t: ["rx", "scaled", "scale"], q: "C’est quoi Rx et Scaled ?", k: "rx scaled prescribed adapte niveau",
    a: "Rx (« as prescribed ») = tu fais le WOD exactement comme il est écrit : charges, mouvements et répétitions officiels.\nScaled = version adaptée à ton niveau : charge plus légère, tractions avec élastique, pompes sur les genoux…\nFaire en Scaled n’a rien de honteux : c’est comme ça qu’on progresse sans se blesser." },
  { lex: "cf", t: ["fortime"], q: "C’est quoi un For Time ?", k: "for time chrono vite possible temps",
    a: "For Time = tu fais tout le travail demandé le plus vite possible. Ton score, c’est ton temps.\nIl y a souvent un « time cap » (temps maximum)." },
  { lex: "cf", t: ["cap", "timecap"], q: "C’est quoi un time cap ?", k: "time cap limite maximum",
    a: "Le time cap est le temps maximum autorisé pour un WOD.\nSi tu n’as pas fini à temps, ton score = le nombre de répétitions faites (on note par exemple « CAP + 12 »)." },
  { lex: "cf", t: ["amrap"], q: "C’est quoi un AMRAP ?", k: "amrap many rounds possible tours maximum",
    a: "AMRAP = « As Many Rounds As Possible » : un maximum de tours dans un temps donné.\nEx. : AMRAP 12 min de 5 tractions, 10 pompes, 15 squats. Tu enchaînes les tours jusqu’au bip.\nScore = tours complets + répétitions du tour en cours (ex. 8 tours + 7)." },
  { lex: "cf", t: ["emom", "e2mom"], q: "C’est quoi un EMOM ?", k: "emom every minute chaque minute",
    a: "EMOM = « Every Minute On the Minute » : au début de chaque minute, tu fais le travail demandé, puis tu te reposes le reste de la minute.\nEx. : EMOM 10 min : 3 power cleans. Plus tu vas vite, plus tu te reposes.\nUn « E2MOM » = toutes les 2 minutes." },
  { lex: "cf", t: ["tabata"], q: "C’est quoi un Tabata ?", k: "tabata 20 10 secondes intervalle",
    a: "Tabata = 8 tours de 20 secondes d’effort maximal / 10 secondes de repos, soit 4 minutes.\nScore : le total de répétitions, ou le tour le plus faible selon la consigne." },
  { lex: "cf", t: ["chipper"], q: "C’est quoi un Chipper ?", k: "chipper liste longue",
    a: "Un Chipper est une longue liste de mouvements avec beaucoup de répétitions, à faire une seule fois dans l’ordre.\nOn les « grignote » (to chip) petit à petit. Ex. : 50 box jumps, 50 wall balls, 50 burpees…" },
  { lex: "cf", t: ["21159"], q: "Que veut dire 21-15-9 ?", k: "21 15 9 schema repetitions",
    a: "C’est un schéma de répétitions : 21 de chaque mouvement, puis 15, puis 9.\nEx. Fran : 21 thrusters, 21 tractions, 15 thrusters, 15 tractions, 9 thrusters, 9 tractions." },
  { lex: "cf", t: ["1rm", "rm", "pr"], q: "C’est quoi un 1RM et un PR ?", k: "1rm rm pr record personnel charge max repetition",
    a: "1RM = « 1 Repetition Max » : la charge la plus lourde que tu peux soulever une seule fois.\nPR = « Personal Record », ton record personnel. Note-les dans l’onglet CrossFit pour suivre tes progrès." },
  { lex: "cf", t: ["girls", "girl", "hero", "heroes", "benchmark"], q: "C’est quoi les Girls et les Hero WODs ?", k: "girls hero benchmark reference fran murph grace cindy",
    a: "Ce sont des WOD de référence (« benchmarks »), toujours identiques, pour mesurer tes progrès.\nLes « Girls » portent des prénoms féminins (Fran, Grace, Cindy…). Les « Hero WODs » rendent hommage à des militaires ou pompiers morts en service (Murph…).\nTu les retrouves tous dans l’onglet CrossFit." },
  { lex: "cf", t: ["kg"], q: "Que veut dire 43/29 kg ?", k: "charge homme femme slash deux poids",
    a: "Deux charges séparées par « / » = charge homme / charge femme.\nEx. Thrusters 43/29 kg : 43 kg pour les hommes, 29 kg pour les femmes (version Rx)." },
  { lex: "cf", t: ["metcon"], q: "C’est quoi un Metcon ?", k: "metcon metabolic conditioning cardio",
    a: "Metcon = « metabolic conditioning » : la partie intense et cardio du WOD, qui fait monter le cœur (souvent un For Time ou un AMRAP)." },
  { lex: "cf", t: ["box"], q: "C’est quoi une box ?", k: "box salle crossfit",
    a: "Une « box » est une salle de CrossFit." },
  { lex: "cf", t: ["kipping", "strict", "butterfly"], q: "Kipping ou strict, c’est quoi ?", k: "kipping strict balancement elan traction",
    a: "Strict = mouvement sans élan (ex. traction stricte).\nKipping = on utilise un balancement du corps pour enchaîner plus vite (tractions, toes to bar, HSPU). Le « butterfly » est un kipping encore plus rapide." },
  { lex: "cf", t: ["unbroken"], q: "Que veut dire Unbroken ?", k: "unbroken sans pause lacher",
    a: "Unbroken = toutes les répétitions d’une série sans t’arrêter ni lâcher la barre." },
  { lex: "cf", t: ["thruster", "thrusters"], q: "C’est quoi un thruster ?", k: "thruster squat developpe",
    a: "Un thruster = un front squat enchaîné avec un développé au-dessus de la tête, en un seul mouvement fluide : tu utilises l’élan de la remontée du squat pour pousser la barre." },
  { lex: "cf", t: ["wall", "wallball", "wallballs"], q: "C’est quoi un wall ball ?", k: "wall ball medecine ballon mur cible",
    a: "Wall ball = un squat avec un médecine-ball contre la poitrine, puis tu lances le ballon vers une cible au mur (3 m pour les hommes, 2,70 m pour les femmes) et tu le rattrapes." },
  { lex: "cf", t: ["double", "unders", "du"], q: "C’est quoi un double under ?", k: "double under corde sauter",
    a: "Double under = à la corde à sauter, la corde passe 2 fois sous tes pieds pendant un seul saut." },
  { lex: "cf", t: ["t2b", "toes"], q: "C’est quoi un toes to bar ?", k: "toes to bar pieds barre suspendu abdos",
    a: "Toes to bar = suspendu à la barre, tu montes les pieds jusqu’à toucher la barre." },
  { lex: "cf", t: ["muscleup", "muscle"], q: "C’est quoi un muscle-up ?", k: "muscle up anneaux barre traction dips",
    a: "Muscle-up = une traction enchaînée avec un dips pour passer le buste au-dessus de la barre ou des anneaux. C’est un mouvement avancé." },
  { lex: "cf", t: ["hspu"], q: "C’est quoi un HSPU ?", k: "hspu handstand push up pompe equilibre",
    a: "HSPU = « Handstand Push-Up » : une pompe en équilibre sur les mains, les pieds contre le mur." },
  { lex: "cf", t: ["clean", "snatch", "jerk", "epaule", "arrache"], q: "Clean, snatch, jerk : c’est quoi ?", k: "clean snatch jerk epaule arrache jete halterophilie",
    a: "Ce sont les mouvements d’haltérophilie :\n• Clean (épaulé) : la barre passe du sol aux épaules.\n• Jerk (jeté) : des épaules au-dessus de la tête.\n• Clean & jerk : les deux enchaînés.\n• Snatch (arraché) : du sol au-dessus de la tête en un seul mouvement.\n« Power » = réception en demi-squat au lieu du squat complet." },
  { lex: "cf", t: ["kb", "kettlebell", "swing", "swings"], q: "C’est quoi un KB swing ?", k: "kb kettlebell swing balancier",
    a: "KB swing = tu balances une kettlebell entre les jambes puis jusqu’à hauteur des yeux (swing russe) ou au-dessus de la tête (swing américain), grâce à la poussée des hanches." },
  { lex: "cf", t: ["burpee", "burpees"], q: "C’est quoi un burpee ?", k: "burpee",
    a: "Burpee = tu poses la poitrine au sol, tu te relèves et tu sautes en tapant des mains au-dessus de la tête." },
  { lex: "run", t: ["ef", "endurance", "fondamentale"], q: "C’est quoi l’endurance fondamentale ?", k: "endurance fondamentale ef lent footing zone 2",
    a: "L’endurance fondamentale (EF) est une allure lente et confortable : tu peux parler en courant. Environ 60 à 75 % de ta fréquence cardiaque max.\nElle représente la majorité de l’entraînement d’un coureur : elle développe le « moteur » sans fatiguer." },
  { lex: "run", t: ["seuil"], q: "C’est quoi le seuil ?", k: "seuil lactique allure tempo",
    a: "Le seuil est une allure soutenue mais contrôlée, que tu pourrais tenir environ 45 min à 1 h en course. Environ 85 à 90 % de ta FC max.\nEn séance, on le travaille par blocs (ex. 3 × 10 min au seuil, 2 min de récup)." },
  { lex: "run", t: ["fractionne", "fractionnee", "intervalle", "interval"], q: "C’est quoi le fractionné ?", k: "fractionne intervalle vitesse repetition",
    a: "Le fractionné alterne des efforts rapides et des récupérations.\nEx. : 10 × 400 m vite avec 1 min de récup, ou 30/30. C’est ce qui fait progresser ta vitesse et ta VMA." },
  { lex: "run", t: ["vma"], q: "C’est quoi la VMA ?", k: "vma vitesse maximale aerobie",
    a: "VMA = Vitesse Maximale Aérobie : la vitesse à laquelle tu consommes le maximum d’oxygène. Tu peux la tenir environ 4 à 7 minutes.\nOn s’en sert pour régler les allures du fractionné (ex. 30/30 à 100 % de VMA)." },
  { lex: "run", t: ["allure", "pace"], q: "C’est quoi l’allure ?", k: "allure pace min km vitesse",
    a: "L’allure est le temps pour parcourir 1 km (ex. 5:00 /km).\n5:00 /km = 12 km/h, 6:00 /km = 10 km/h, 4:00 /km = 15 km/h. L’app la calcule toute seule à partir de ta distance et de ta durée." },
  { lex: "run", t: ["3030"], q: "C’est quoi un 30/30 ?", k: "30 30 trente fractionne court",
    a: "30/30 = 30 secondes vite (autour de ta VMA) puis 30 secondes lentement, à répéter (ex. 2 × 10 fois). C’est un fractionné court classique." },
  { lex: "run", t: ["fc", "bpm", "cardiaque", "frequence"], q: "C’est quoi la FC max ?", k: "fc frequence cardiaque max bpm coeur",
    a: "La FC max est ta fréquence cardiaque maximale (en battements par minute). Une estimation simple : 220 − ton âge, mais elle varie beaucoup d’une personne à l’autre.\nLa FC moyenne de ta sortie se lit sur ta montre." }
];
const BENCH_NOTES = {
  murph: "Tu peux découper les tractions, pompes et squats comme tu veux (ex. 20 tours de 5-10-15), mais la course se fait au début et à la fin.",
  cindy: "Enchaîne les tours sans t’arrêter pendant 20 minutes : ton score = tours + reps.",
  fran: "C’est l’un des WOD les plus connus : très court (souvent 3 à 10 min) mais très intense.",
  helen: "Enchaîne 3 fois : la course, les swings puis les tractions.",
  annie: "50 double unders et 50 sit-ups, puis 40 et 40, etc. jusqu’à 10."
};
GLOSS.forEach(g => FAQ.push(g));
BENCH.forEach(bm => FAQ.push({
  lex: "wod", t: [norm(bm.name).trim()], q: `C’est quoi le WOD ${bm.name} ?`, k: norm(bm.name) + " wod benchmark",
  a: `${bm.name} : ${bm.desc}.\n${bm.type === "amrap" ? `C’est un AMRAP de ${bm.cap} min : ton score est ton nombre de tours + reps.` : "C’est un For Time : ton score est ton temps."}${BENCH_NOTES[bm.id] ? "\n" + BENCH_NOTES[bm.id] : ""}\nNote ton résultat dans l’onglet CrossFit.`
}));
const STOP = new Set("je tu il le la les de du un en et ou ce ca sa ma ta se ne on au comment pour avec dans une des est que qui quoi quel quelle quels mon mes ton tes son ses faire fait fais peux peut puis sur pas par plus moins tout tous toute cette ces aux the and elle ils nous vous etre avoir suis sont veux voudrais savoir aide aider app application veut dire signifie explique expliquer ".split(" "));
function helpAdd(text, who) {
  const d = document.createElement("div"); d.className = "bubble " + who; d.textContent = text;
  $("helpMsgs").appendChild(d); $("helpMsgs").scrollTop = $("helpMsgs").scrollHeight;
}
function helpSuggest(list, withContact) {
  const w = document.createElement("div"); w.className = "help-sugg";
  list.forEach(i => { const b = document.createElement("button"); b.type = "button"; b.textContent = FAQ[i].q; b.dataset.faq = i; w.appendChild(b); });
  if (withContact) { const b = document.createElement("button"); b.type = "button"; b.textContent = "✉️ Écrire au créateur"; b.dataset.contact = "1"; w.appendChild(b); }
  $("helpMsgs").appendChild(w); $("helpMsgs").scrollTop = $("helpMsgs").scrollHeight;
}
function helpAnswer(i) { helpAdd(FAQ[i].q, "me"); setTimeout(() => helpAdd(FAQ[i].a, "bot"), 250); }
function helpOpen() {
  $("helpPanel").hidden = false; $("helpFab").hidden = true; $("helpHint").hidden = true;
  if (!$("helpMsgs").children.length) {
    const who = S.profile && S.profile.pseudo ? " " + S.profile.pseudo : "";
    helpAdd("Salut" + who + " 👋 Je réponds aux questions fréquentes sur l’app. Choisis une question ou écris la tienne.", "bot");
    helpSuggest([0, 16, 17, 2, 5, 8], false);
    helpLexButtons();
  }
}
function helpLexButtons() {
  const w = document.createElement("div"); w.className = "help-sugg";
  [["cf", "📖 Lexique CrossFit"], ["wod", "📖 Explication des WOD"], ["run", "📖 Lexique course à pied"]].forEach(([id, label]) => {
    const b = document.createElement("button"); b.type = "button"; b.className = "lex"; b.textContent = label; b.dataset.lex = id; w.appendChild(b);
  });
  $("helpMsgs").appendChild(w); $("helpMsgs").scrollTop = $("helpMsgs").scrollHeight;
}
function helpClose() { $("helpPanel").hidden = true; updateFab(); }
$("helpFab").onclick = () => { lsSet("help-hint-off", 1); helpOpen(); };
$("helpClose").onclick = helpClose;
$("helpMsgs").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  if (b.dataset.contact) { helpClose(); go("contactform"); return; }
  if (b.dataset.lex) {
    const titles = { cf: "Lexique CrossFit", wod: "Explication des WOD", run: "Lexique course à pied" };
    helpAdd(titles[b.dataset.lex], "me");
    setTimeout(() => { helpAdd("Choisis le mot ou le WOD que tu veux comprendre :", "bot"); helpSuggest(FAQ.map((f, i) => f.lex === b.dataset.lex ? i : -1).filter(i => i >= 0), false); }, 250);
    return;
  }
  if (b.dataset.faq != null) helpAnswer(+b.dataset.faq);
});
$("helpForm").addEventListener("submit", e => {
  e.preventDefault();
  const text = $("helpInput").value.trim(); if (!text) return;
  $("helpInput").value = ""; helpAdd(text, "me");
  const raw = norm(text), words = raw.split(" ").filter(w => w.length > 1 && !STOP.has(w));
  const joined = raw.replace(/\s+/g, "");
  const scored = FAQ.map((f, i) => {
    const hay = norm(f.k + " " + f.q);
    let score = words.reduce((a, w) => a + (w.length > 2 && (hay.includes(w) || hay.includes(w.replace(/s$/, ""))) ? 1 : 0) + ((f.t || []).includes(w) ? 3 : 0), 0);
    (f.t || []).forEach(t => { if (t.length > 3 && !words.includes(t) && joined.includes(t)) score += 3; });
    return { i, score };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);
  setTimeout(() => {
    if (scored.length) {
      helpAdd(FAQ[scored[0].i].a, "bot");
      const more = scored.slice(1, 3).filter(x => x.score >= Math.max(2, scored[0].score));
      if (more.length) { helpAdd("Ça peut aussi t’aider :", "bot"); helpSuggest(more.map(x => x.i), false); }
    } else {
      helpAdd("Je n’ai pas trouvé de réponse à ta question. Tu peux écrire directement au créateur de l’app, il te répondra.", "bot");
      helpSuggest([0, 10, 12], true);
    }
  }, 300);
});
const FAB_SCREENS = ["home", "seances", "nutrition", "complements", "creatine", "contact", "profile", "crossfit", "types", "hub", "records", "rec", "progress", "prog", "friends", "friend", "go", "social", "messages", "feed", "challenges", "challenge", "ranks", "muscles", "recap", "routines", "programs"];
let hintReady = false;
setTimeout(() => { hintReady = true; updateFab(); }, 2500);
function updateFab() {
  $("helpFab").hidden = !FAB_SCREENS.includes(S.screen) || !$("helpPanel").hidden;
  $("helpHint").hidden = $("helpFab").hidden || !hintReady || !!lsGet("help-hint-off");
}
function hideHint() { lsSet("help-hint-off", 1); $("helpHint").hidden = true; }
$("helpHintClose").onclick = hideHint;
$("helpHintOpen").onclick = () => { hideHint(); helpOpen(); };

/* ============================================================
   Amis, séances partagées et messages
   ============================================================ */
const REACTS = [["muscle", "💪"], ["fire", "🔥"], ["clap", "👏"]];
const pairOf = (a, b) => a < b ? [a, b] : [b, a];
const pairId = (a, b) => pairOf(a, b).join("_");
const SOC = { friends: {}, chats: {}, chatSubs: {}, dir: {}, results: null, searchMsg: "", friendUid: null, friendData: null, chatUid: null, chatUnsub: null, msgs: [], reportMid: null, myReacts: [], menu: false };
const otherOf = f => f.users[0] === S.uid ? f.users[1] : f.users[0];
function makeCode(pseudo) { const base = norm(pseudo).replace(/[^a-z]/g, "").toUpperCase().slice(0, 6) || "SPORT"; return base + "-" + (1000 + Math.floor(Math.random() * 9000)); }
async function dirOf(uid) {
  if (SOC.dir[uid]) return SOC.dir[uid];
  try { const s = await getDoc(doc(db, "directory", uid)); SOC.dir[uid] = s.exists() ? s.data() : { uid, pseudo: "Utilisateur" }; }
  catch (e) { SOC.dir[uid] = { uid, pseudo: "Utilisateur" }; }
  return SOC.dir[uid];
}
// Fiche publique (annuaire) + ce que voient les amis (share), mises à jour à chaque connexion et modification.
async function ensureSocialProfile() {
  if (!S.profile) return;
  if (!S.profile.friendCode) await saveProfile({ friendCode: makeCode(S.profile.pseudo) }).catch(() => {});
  const p = S.profile;
  setDoc(doc(db, "directory", S.uid), { uid: S.uid, pseudo: p.pseudo, pseudoLower: norm(p.pseudo).trim(), code: p.friendCode, photo: p.photo || null, objectif: p.objectif || "" }).catch(() => {});
  syncShare();
}
function recordsSummary() {
  const pd = prsData(), cf = cfData(), out = [];
  const push = (cat, name, text) => out.push({ cat, name, text });
  MUSCU_LIFTS.forEach(([id, n]) => { const b = prBest("kg", pd.muscu[id] || []); if (b) push("Musculation", n, prText("kg", b)); });
  RUN_PRS.forEach(([id, n, , k]) => { const b = prBest(k, pd.course[id] || []); if (b) push("Course", n, prText(k, b)); });
  CALIS_PRS.forEach(([id, n, , k]) => { const b = prBest(k, pd.calis[id] || []); if (b) push("Callisthénie", n, prText(k, b)); });
  LIFTS.forEach(([id, n]) => { const b = prBest("kg", cf.prs[id] || []); if (b) push("CrossFit", n, prText("kg", b)); });
  BENCH.forEach(bm => { const e = benchEntries(bm).sort((a, b) => benchValue(bm, b) - benchValue(bm, a))[0]; if (e) push("CrossFit", bm.name, benchText(bm, e)); });
  return out;
}
let shareTimer = null;
function syncShare() {
  if (!S.uid || !S.profile) return;
  clearTimeout(shareTimer);
  shareTimer = setTimeout(() => {
    const ks = Object.keys(S.days);
    setDoc(doc(db, "share", S.uid), {
      sessions: S.profile.shareSessions !== false, pseudo: S.profile.pseudo, objectif: S.profile.objectif || "",
      types: S.types, records: recordsSummary(), month: monthShare(), best: bestLifts(), streak: streakInfo().n,
      stats: { seances: ks.length, km: Math.round(ks.reduce((a, k) => a + runKm(S.days[k]), 0) * 10) / 10, volume: Math.round(ks.reduce((a, k) => a + dayVolume(S.days[k]), 0)) },
      updatedAt: Date.now()
    }).catch(() => {});
  }, 1200);
}
// Suit la conversation avec un ami (pour les messages non lus). Juste après l'acceptation, le serveur peut
// refuser la lecture quelques instants : on réessaie alors un peu plus tard.
function watchChat(pid, tries = 0) {
  const un = onSnapshot(doc(db, "chats", pid), s => { SOC.chats[pid] = s.exists() ? s.data() : null; refreshSocial(); }, () => {
    if (SOC.chatSubs[pid] !== un) return;
    delete SOC.chatSubs[pid];
    if (tries < 5) setTimeout(() => { const f = SOC.friends[pid]; if (S.uid && f && f.status === "accepted" && !SOC.chatSubs[pid]) watchChat(pid, tries + 1); }, 1500 * (tries + 1));
  });
  SOC.chatSubs[pid] = un; S.unsubs.push(un);
}
function subscribeSocial() {
  S.unsubs.push(onSnapshot(query(collection(db, "friends"), where("users", "array-contains", S.uid)), snap => {
    const d = {}; snap.docs.forEach(x => { d[x.id] = x.data(); }); SOC.friends = d;
    Object.entries(d).forEach(([pid, f]) => {
      dirOf(otherOf(f)).then(() => refreshSocial());
      if (f.status === "accepted" && !SOC.chatSubs[pid]) watchChat(pid);
    });
    Object.keys(SOC.chatSubs).forEach(pid => { if (!d[pid] || d[pid].status !== "accepted") { SOC.chatSubs[pid](); delete SOC.chatSubs[pid]; delete SOC.chats[pid]; } });
    // Plus amis (retiré ou bloqué) : on quitte sa conversation ou sa page.
    const cur = S.screen === "chat" ? SOC.chatUid : S.screen === "friend" ? SOC.friendUid : null, cf = cur && d[pairId(S.uid, cur)];
    if (cur && (!cf || cf.status !== "accepted")) go(S.screen === "chat" && SOC.chatFrom === "messages" ? "messages" : "friends");
    refreshSocial();
  }, () => {}));
  S.unsubs.push(onSnapshot(collection(db, "reacts", S.uid, "items"), snap => { SOC.myReacts = snap.docs.map(x => x.data()); SOC.myReacts.forEach(r => dirOf(r.from)); refreshSocial(); if (S.open) { const el = $("myReacts"); if (el) el.innerHTML = myReactsHTML(S.open); } }, () => {}));
  subscribeChallenges();
}
function resetSocial() { Object.assign(SOC, { friends: {}, chats: {}, chatSubs: {}, dir: {}, results: null, searchMsg: "", friendUid: null, friendData: null, chatUid: null, msgs: [], myReacts: [], menu: false, myComments: [], challenges: [], feed: null, shares: {}, sharesAt: 0, newCh: null, openCmt: null, feedOpen: null }); if (SOC.chatUnsub) { SOC.chatUnsub(); SOC.chatUnsub = null; } }
const unreadOf = pid => { const c = SOC.chats[pid]; return !!(c && c.last && c.last.from !== S.uid && c.last.at > ((c.read || {})[S.uid] || 0)); };
function socialCounts() {
  const F = Object.entries(SOC.friends);
  return { requests: F.filter(([, f]) => f.status === "pending" && f.to === S.uid).length, unread: F.filter(([pid, f]) => f.status === "accepted" && unreadOf(pid)).length };
}
function refreshSocial() {
  const c = socialCounts(), el = $("homeSocial");
  if (el) {
    const nf2 = acceptedFriends().length, act = activityList().filter(a => a.at > seenAct()).length, live = (SOC.challenges || []).filter(ch => ch.end >= todayK()).length;
    el.innerHTML = `<span class="pill${nf2 ? " ok" : ""}">${nf2} ami${nf2 > 1 ? "s" : ""}</span>${c.requests ? `<span class="pill alert">${plural(c.requests, "demande")}</span>` : ""}${c.unread ? `<span class="pill alert">${c.unread} message${c.unread > 1 ? "s" : ""} non lu${c.unread > 1 ? "s" : ""}</span>` : ""}${act ? `<span class="pill alert">${plural(act, "nouveauté")}</span>` : ""}${live ? `<span class="pill">${plural(live, "défi")} en cours</span>` : ""}`;
    const nc = newChallenges().length;
    if (nc) el.insertAdjacentHTML("beforeend", `<span class="pill alert">${plural(nc, "nouveau défi")}</span>`);
    $("socialDot").hidden = !(c.requests || c.unread || act || nc);
  }
  if (S.screen === "friends") renderFriends();
  if (S.screen === "messages") renderMessages();
  if (S.screen === "social") renderSocial();
}
const who = (uid, size) => { const d = SOC.dir[uid] || { pseudo: "…" }; return { d, av: avatarHTML({ pseudo: d.pseudo, photo: d.photo }, size || 44) }; };
function renderFriends() {
  const code = (S.profile && S.profile.friendCode) || "…", share = !S.profile || S.profile.shareSessions !== false;
  const F = Object.entries(SOC.friends);
  const recv = F.filter(([, f]) => f.status === "pending" && f.to === S.uid), sent = F.filter(([, f]) => f.status === "pending" && f.from === S.uid);
  const friends = F.filter(([, f]) => f.status === "accepted").sort((a, b) => ((SOC.chats[b[0]] || {}).last || {}).at - ((SOC.chats[a[0]] || {}).last || {}).at || 0);
  const blocked = F.filter(([, f]) => f.status === "blocked" && f.blockedBy === S.uid);
  const rel = uid => { const f = SOC.friends[pairId(S.uid, uid)]; return !f ? "none" : f.status === "accepted" ? "friend" : f.status === "blocked" ? "blocked" : f.from === S.uid ? "sent" : "recv"; };
  $("friendsBody").innerHTML = `
    <section class="card code-card">
      <div class="lbl">Mon code ami</div>
      <div class="code-row"><b id="myCode">${esc(code)}</b><button class="btn" id="copyCode">Copier</button></div>
      <p class="hint">Donne ce code à tes amis pour qu’ils t’ajoutent.</p>
      <button type="button" class="chip" id="shareToggle" style="--tc:var(--red);align-self:flex-start" aria-pressed="${share}">${share ? "✓ Mes séances sont partagées" : "Mes séances ne sont pas partagées"}</button>
    </section>
    <form class="card" id="friendSearch" autocomplete="off">
      <div class="lbl">Ajouter un ami</div>
      <div class="search-row"><input id="fsInput" placeholder="Code ami ou pseudo" aria-label="Code ami ou pseudo"><button class="btn primary" type="submit">Chercher</button></div>
      ${SOC.searchMsg ? `<p class="hint">${esc(SOC.searchMsg)}</p>` : ""}
      ${(SOC.results || []).map(u => { const r = rel(u.uid); return `<div class="frow">${avatarHTML(u, 40)}<span class="main"><b>${esc(u.pseudo)}</b><span>${esc(u.code || "")}</span></span>
        ${r === "none" ? `<button type="button" class="btn primary sm" data-fadd="${u.uid}">Ajouter</button>` : r === "sent" ? `<span class="tag done">Demande envoyée</span>` : r === "recv" ? `<button type="button" class="btn primary sm" data-faccept="${pairId(S.uid, u.uid)}">Accepter</button>` : r === "friend" ? `<span class="tag done">Ami</span>` : `<span class="tag done">Bloqué</span>`}</div>`; }).join("")}
    </form>
    ${recv.length ? `<section><h2 class="h2">Demandes reçues · ${recv.length}</h2><div class="card" style="gap:0;padding-block:4px">${recv.map(([pid, f]) => { const u = otherOf(f), w = who(u, 40); return `<div class="frow">${w.av}<span class="main"><b>${esc(w.d.pseudo)}</b><span>veut t’ajouter en ami</span></span><button type="button" class="btn primary sm" data-faccept="${pid}">Accepter</button><button type="button" class="icon-btn" data-fdel="${pid}">Refuser</button></div>`; }).join("")}</div></section>` : ""}
    <section><h2 class="h2">Mes amis · ${friends.length}</h2>
      ${friends.length ? `<div class="card" style="gap:0;padding-block:4px">${friends.map(([pid, f]) => { const u = otherOf(f), w = who(u, 44), c = SOC.chats[pid], un = unreadOf(pid); return `<div class="frow">
        <button type="button" class="frow-main" data-fopen="${u}">${w.av}<span class="main"><b>${esc(w.d.pseudo)}${un ? ' <i class="dot-new"></i>' : ""}</b><span class="${un ? "unread" : ""}">${c && c.last ? esc((c.last.from === S.uid ? "Toi : " : "") + c.last.text) : "Voir ses séances"}</span></span></button>
        <button type="button" class="btn sm" data-fchat="${u}" aria-label="Écrire à ${esc(w.d.pseudo)}">💬</button></div>`; }).join("")}</div>`
        : `<div class="empty">Pas encore d’ami. Cherche un pseudo ou entre le code ami de quelqu’un ci-dessus.</div>`}
    </section>
    ${sent.length ? `<section><h2 class="h2">Demandes envoyées</h2><div class="card" style="gap:0;padding-block:4px">${sent.map(([pid, f]) => { const w = who(otherOf(f), 40); return `<div class="frow">${w.av}<span class="main"><b>${esc(w.d.pseudo)}</b><span>en attente</span></span><button type="button" class="icon-btn" data-fdel="${pid}">Annuler</button></div>`; }).join("")}</div></section>` : ""}
    ${blocked.length ? `<section><h2 class="h2">Personnes bloquées</h2><div class="card" style="gap:0;padding-block:4px">${blocked.map(([pid, f]) => { const w = who(otherOf(f), 40); return `<div class="frow">${w.av}<span class="main"><b>${esc(w.d.pseudo)}</b></span><button type="button" class="icon-btn" data-fdel="${pid}">Débloquer</button></div>`; }).join("")}</div></section>` : ""}`;
  const inp = $("fsInput"); if (inp && SOC.lastQuery) inp.value = SOC.lastQuery;
}
async function searchUsers(q) {
  q = q.trim(); SOC.lastQuery = q; SOC.results = []; SOC.searchMsg = "Recherche…"; renderFriends();
  try {
    let docs;
    if (/^[A-Za-z]+-\d{4}$/.test(q)) docs = (await getDocs(query(collection(db, "directory"), where("code", "==", q.toUpperCase()), limit(5)))).docs;
    else { const n = norm(q).trim(); if (n.length < 2) { SOC.searchMsg = "Tape au moins 2 lettres."; renderFriends(); return; } docs = (await getDocs(query(collection(db, "directory"), where("pseudoLower", ">=", n), where("pseudoLower", "<=", n + ""), limit(10)))).docs; }
    SOC.results = docs.map(d => d.data()).filter(u => u.uid !== S.uid);
    SOC.results.forEach(u => { SOC.dir[u.uid] = u; });
    SOC.searchMsg = SOC.results.length ? "" : "Aucun résultat. Vérifie le code ou le pseudo.";
  } catch (e) { SOC.searchMsg = "La recherche a échoué. Vérifie ta connexion."; }
  renderFriends();
}
const relDoc = uid => doc(db, "friends", pairId(S.uid, uid));
async function addFriend(uid) {
  const pid = pairId(S.uid, uid), f = SOC.friends[pid];
  if (f && f.status === "pending" && f.to === S.uid) return acceptFriend(pid);
  try { await setDoc(relDoc(uid), { users: pairOf(S.uid, uid), from: S.uid, to: uid, status: "pending", at: Date.now() }); }
  catch (e) { SOC.searchMsg = "Impossible d’envoyer la demande."; renderFriends(); }
}
async function acceptFriend(pid) { try { await updateDoc(doc(db, "friends", pid), { status: "accepted", acceptedAt: Date.now() }); } catch (e) { /* déjà traité */ } }
async function blockUser(uid) {
  const pid = pairId(S.uid, uid), f = SOC.friends[pid];
  try {
    if (f) await updateDoc(relDoc(uid), { status: "blocked", blockedBy: S.uid, blockedAt: Date.now() });
    else await setDoc(relDoc(uid), { users: pairOf(S.uid, uid), from: S.uid, to: uid, status: "blocked", blockedBy: S.uid, at: Date.now() });
  } catch (e) { /* déjà bloqué */ }
}
$("friendsBody").addEventListener("submit", e => { e.preventDefault(); if (e.target.id === "friendSearch") searchUsers($("fsInput").value); });
$("friendsBody").addEventListener("click", e => {
  const t = e.target.closest("button"); if (!t) return;
  if (t.id === "copyCode") { const c = S.profile.friendCode; (navigator.clipboard ? navigator.clipboard.writeText(c) : Promise.reject()).then(() => { t.textContent = "Copié ✓"; }, () => { const r = document.createRange(); r.selectNodeContents($("myCode")); getSelection().removeAllRanges(); getSelection().addRange(r); }); return; }
  if (t.id === "shareToggle") { saveProfile({ shareSessions: S.profile.shareSessions === false }); syncShare(); renderFriends(); return; }
  if (t.dataset.fadd) { addFriend(t.dataset.fadd); t.disabled = true; t.textContent = "Envoi…"; return; }
  if (t.dataset.faccept) { acceptFriend(t.dataset.faccept); t.disabled = true; return; }
  if (t.dataset.fdel) { if (!armed(t, "Confirmer")) return; deleteDoc(doc(db, "friends", t.dataset.fdel)).catch(() => {}); return; }
  if (t.dataset.fchat) { openChat(t.dataset.fchat); return; }
  if (t.dataset.fopen) openFriend(t.dataset.fopen);
});

/* ---------- Page d'un ami : records, séances, réactions ---------- */
async function openFriend(uid) {
  SOC.friendUid = uid; SOC.friendData = null; SOC.friendShow = 10; SOC.friendOpenK = null; go("friend");
  // Les 30 dernières séances seulement (moins de lectures = reste gratuit plus longtemps).
  const [sh, ss] = await Promise.allSettled([getDoc(doc(db, "share", uid)), getDocs(query(collection(db, "users", uid, "seances"), orderBy("updatedAt", "desc"), limit(30)))]);
  if (SOC.friendUid !== uid) return;
  const days = ss.status === "fulfilled" ? ss.value.docs.map(d => ({ k: d.id, ...d.data() })).filter(x => !isEmpty(x)).sort((a, b) => a.k < b.k ? 1 : -1) : null;
  const oldest = days && days.length ? dayOf(days[days.length - 1].k) : "9999";
  const [rs, cs] = await Promise.allSettled([getDocs(query(collection(db, "reacts", uid, "items"), where("date", ">=", oldest))), getDocs(query(collection(db, "comments", uid, "items"), where("date", ">=", oldest)))]);
  if (SOC.friendUid !== uid) return;
  SOC.friendData = {
    share: sh.status === "fulfilled" && sh.value.exists() ? sh.value.data() : null, days,
    reacts: rs.status === "fulfilled" ? rs.value.docs.map(d => d.data()) : [],
    comments: cs.status === "fulfilled" ? cs.value.docs.map(d => ({ id: d.id, owner: uid, ...d.data() })) : []
  };
  SOC.friendData.comments.forEach(c => dirOf(c.from));
  renderFriend();
}
function friendSessionDetail(s, types) {
  const disc = discOf(s);
  if (disc === "course") {
    const r = s.run || {};
    return `<ul class="fs-list">${r.dist ? `<li>${nf.format(r.dist)} km${runSecs(r) ? " en " + fmtDur(runSecs(r)) : ""}${runPace(r) ? " · " + runPace(r) + " /km" : ""}</li>` : ""}${(r.blocks || []).filter(b => b.rep || b.eff).map(b => `<li>${esc(b.rep || 1)} × ${esc(b.eff)} ${esc(b.unit || "")}${b.pace ? " · " + esc(b.pace) : ""}${b.rec ? " · récup " + esc(b.rec) : ""}</li>`).join("")}</ul>`;
  }
  if (disc === "crossfit") {
    const w = s.wod || {};
    return `<ul class="fs-list">${w.format ? `<li>${esc(w.format)}${w.cap ? " · " + esc(w.cap) + " min" : ""}</li>` : ""}${(w.moves || []).filter(m => m.name).map(m => `<li>${esc(m.reps || "")} ${esc(m.name)}${m.kg ? " · " + esc(m.kg) + " kg" : ""}</li>`).join("")}${wodScore(w) ? `<li>Score : <b>${esc(wodScore(w))}</b>${w.rx ? " (Rx)" : w.rx === false ? " (Scaled)" : ""}</li>` : ""}</ul>`;
  }
  return `<ul class="fs-list">${(s.exercises || []).filter(x => x.name).map(x => {
    if (x.kind === "cordes") return `<li><b>${esc(x.name)}</b> — ${esc(cordesText(x))}</li>`;
    const sets = (x.sets || []).filter(st => st.reps !== "" && st.reps != null);
    return `<li><b>${esc(x.name)}</b> — ${sets.length ? sets.map(st => esc(st.reps) + (x.hold ? " s" : "") + (st.kg ? " × " + nf.format(st.kg) + " kg" : "")).join(", ") : (x.sets || []).length + " séries"}</li>`;
  }).join("")}</ul>`;
}
function renderFriend() {
  const uid = SOC.friendUid, d = SOC.dir[uid] || { pseudo: "…" }, fd = SOC.friendData;
  $("friendName").textContent = d.pseudo;
  if (!fd) { $("friendBody").innerHTML = `<p class="hint">Chargement…</p>`; return; }
  const sh = fd.share || {}, types = Array.isArray(sh.types) && sh.types.length ? sh.types : DEFAULT_TYPES, st = sh.stats || {};
  const recs = sh.records || [];
  const rx = k => REACTS.map(([id, em]) => { const n = fd.reacts.filter(r => r.date === k && r.emoji === id).length, mine = fd.reacts.some(r => r.date === k && r.emoji === id && r.from === S.uid); return `<button type="button" class="react${mine ? " on" : ""}" data-react="${k}:${id}">${em}${n ? " " + n : ""}</button>`; }).join("");
  const days = fd.days;
  $("friendBody").innerHTML = `
    <div class="friend-top">${avatarHTML({ pseudo: d.pseudo, photo: d.photo }, 64)}<div>${d.objectif ? `<span class="tag">${esc(d.objectif)}</span>` : `<span class="hint">Ami</span>`}</div>
      <button type="button" class="btn primary sm" data-fchat2="${uid}">💬 Message</button></div>
    <div class="stats"><div class="stat"><b>${st.seances || 0}</b><span>séances</span></div><div class="stat"><b>${nf.format(st.km || 0)}</b><span>km courus</span></div><div class="stat"><b>${(st.volume || 0) >= 10000 ? nf.format(st.volume / 1000) + " t" : nf.format(st.volume || 0)}</b><span>${(st.volume || 0) >= 10000 ? "soulevées" : "kg soulevés"}</span></div></div>
    ${recs.length ? `<section><h2 class="h2">Ses records</h2><div class="card" style="gap:0;padding-block:4px">${recs.map(r => `<div class="frow"><span class="main"><b>${esc(r.name)}</b><span>${esc(r.cat)}</span></span><span class="pr-kg">${esc(r.text)}</span></div>`).join("")}</div></section>` : ""}
    <section><h2 class="h2">Ses séances</h2>
    ${days === null ? `<div class="empty">${esc(d.pseudo)} ne partage pas ses séances pour l’instant.</div>`
      : !days.length ? `<div class="empty">Aucune séance notée pour l’instant.</div>`
      : `<div class="list">${days.slice(0, SOC.friendShow).map(s => { const mt = dayMeta(s, types), dd = parse(s.k), open = SOC.friendOpenK === s.k; return `<article class="fsess" style="--tc:${mt.color}">
          <button type="button" class="fsess-top" data-fsk="${s.k}"><span class="d">${DAYS[dd.getDay()].slice(0, 3)}<b>${dd.getDate()}</b></span><span class="main"><div class="ti">${esc(titleOf(s, types))}</div><div class="me">${esc(MONTHS_S[dd.getMonth()])} · ${esc(sessionSummary(s, types))}</div></span><span class="arrow" aria-hidden="true">${open ? "−" : "+"}</span></button>
          ${open ? friendSessionDetail(s, types) + `<button type="button" class="btn primary idea-go" data-ftry="${s.k}">Essayer cette séance</button>` : ""}
          ${(s.prs || []).length ? `<div class="pr-badges">${s.prs.slice(0, 4).map(p => `<span class="pr-badge">🏆 ${esc(p)}</span>`).join("")}</div>` : ""}
          <div class="reacts">${rx(s.k)}</div>${commentsHTML(fd.comments || [], uid, s.k, { all: SOC.openCmt === s.k })}</article>`; }).join("")}</div>
        ${days.length > SOC.friendShow ? `<button type="button" class="btn" data-fmore="1">Voir plus de séances</button>` : ""}`}
    </section>
    <button type="button" class="danger" data-fblock="${uid}">Bloquer ${esc(d.pseudo)}</button>`;
}
$("friendBody").addEventListener("click", async e => {
  const t = e.target.closest("button"); if (!t) return;
  const fd = SOC.friendData, uid = SOC.friendUid;
  if (t.dataset.fchat2) { openChat(t.dataset.fchat2); return; }
  if (t.dataset.fmore) { SOC.friendShow += 10; renderFriend(); return; }
  if (t.dataset.fsk) { SOC.friendOpenK = SOC.friendOpenK === t.dataset.fsk ? null : t.dataset.fsk; renderFriend(); return; }
  if (t.dataset.fblock) { if (!armed(t, "Toucher à nouveau pour bloquer")) return; await blockUser(uid); go("friends"); return; }
  if (t.dataset.react) {
    const i = t.dataset.react.lastIndexOf(":"), k = t.dataset.react.slice(0, i), id = t.dataset.react.slice(i + 1);
    await toggleReact(uid, k, id, fd); renderFriend(); return;
  }
  if (t.dataset.ftry) { const s = fd.days.find(x => x.k === t.dataset.ftry); if (s) trySession(t, uid, s, (fd.share && fd.share.types) || DEFAULT_TYPES); }
});
// Réactions reçues sur mes séances (affichées dans la fiche du jour).
function myReactsHTML(k) {
  const list = SOC.myReacts.filter(r => r.date === k); if (!list.length) return "";
  return REACTS.map(([id, em]) => { const n = list.filter(r => r.emoji === id).length; return n ? `<span class="react on">${em} ${n}</span>` : ""; }).join("") + `<span class="hint">de tes amis</span>`;
}

/* ---------- Messages ---------- */
function openChat(uid) {
  const pid = pairId(S.uid, uid);
  if (SOC.chatUnsub) SOC.chatUnsub();
  if (S.screen !== "chat") SOC.chatFrom = S.screen;
  SOC.chatUid = uid; SOC.msgs = []; SOC.reportMid = null; SOC.menu = false; go("chat");
  setDoc(doc(db, "chats", pid), { users: pairOf(S.uid, uid), read: { [S.uid]: Date.now() } }, { merge: true }).catch(() => {});
  SOC.chatUnsub = onSnapshot(query(collection(db, "chats", pid, "messages"), orderBy("at"), limitToLast(150)), snap => {
    SOC.msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderChatMsgs(true);
    if (S.screen === "chat") setDoc(doc(db, "chats", pid), { read: { [S.uid]: Date.now() } }, { merge: true }).catch(() => {});
  }, () => { $("chatMsgs").innerHTML = `<p class="hint" style="text-align:center">Conversation indisponible.</p>`; });
}
function renderChat() {
  const d = SOC.dir[SOC.chatUid] || { pseudo: "…" };
  $("chatWho").innerHTML = `${avatarHTML({ pseudo: d.pseudo, photo: d.photo }, 36)}<b>${esc(d.pseudo)}</b>`;
  $("chatMenu").hidden = !SOC.menu;
  renderChatMsgs(true);
}
function renderChatMsgs(scroll) {
  const box = $("chatMsgs"); if (!box) return;
  let lastDay = "";
  box.innerHTML = SOC.msgs.length ? SOC.msgs.map(m => {
    const k = key(new Date(m.at)), day = k !== lastDay ? `<p class="chat-day">${esc(k === todayK() ? "Aujourd’hui" : shortDate(k))}</p>` : ""; lastDay = k;
    const mine = m.from === S.uid, t = new Date(m.at);
    return `${day}<div class="bubble ${mine ? "me" : "bot"}" data-mid="${m.id}">${esc(m.text)}<small>${pad(t.getHours())}:${pad(t.getMinutes())}</small></div>${!mine && SOC.reportMid === m.id ? `<button type="button" class="report-btn" data-report="${m.id}">Signaler ce message</button>` : ""}`;
  }).join("") : `<p class="hint" style="text-align:center;margin-top:30px">Dis bonjour 👋<br>Les messages ne sont visibles que par vous deux.</p>`;
  if (scroll) box.scrollTop = box.scrollHeight;
}
async function sendReport(text, extra) {
  const d = SOC.dir[SOC.chatUid] || {};
  await addDoc(collection(db, "reports"), { from: S.uid, fromPseudo: S.profile.pseudo, target: SOC.chatUid, targetPseudo: d.pseudo || "", text: String(text).slice(0, 1200), kind: extra || "message", at: Date.now() });
}
$("chatForm").addEventListener("submit", async e => {
  e.preventDefault();
  const inp = $("chatInput"), text = inp.value.trim(); if (!text) return;
  const pid = pairId(S.uid, SOC.chatUid), at = Date.now(); inp.value = "";
  try {
    await addDoc(collection(db, "chats", pid, "messages"), { from: S.uid, text: text.slice(0, 1000), at });
    await setDoc(doc(db, "chats", pid), { users: pairOf(S.uid, SOC.chatUid), last: { text: text.slice(0, 80), from: S.uid, at }, read: { [S.uid]: at } }, { merge: true });
  } catch (x) { inp.value = text; $("chatMsgs").insertAdjacentHTML("beforeend", `<p class="err" style="text-align:center">Message non envoyé : vous n’êtes peut-être plus amis.</p>`); }
});
$("chatBack").onclick = () => go(["messages", "friend", "friends", "feed"].includes(SOC.chatFrom) ? SOC.chatFrom : "friends");
$("v-chat").addEventListener("click", async e => {
  const b = e.target.closest("[data-mid]");
  if (b && !b.classList.contains("me")) { SOC.reportMid = SOC.reportMid === b.dataset.mid ? null : b.dataset.mid; renderChatMsgs(false); return; }
  const t = e.target.closest("button"); if (!t) return;
  if (t.id === "chatMore") { SOC.menu = !SOC.menu; $("chatMenu").hidden = !SOC.menu; return; }
  if (t.id === "chatWho") { openFriend(SOC.chatUid); return; }
  if (t.dataset.report) {
    const m = SOC.msgs.find(x => x.id === t.dataset.report); if (!m) return;
    try { await sendReport(m.text); t.textContent = "Signalé ✓ Merci"; t.disabled = true; } catch (x) { t.textContent = "Échec, réessaie"; }
    return;
  }
  if (t.dataset.cm === "profile") { openFriend(SOC.chatUid); return; }
  if (t.dataset.cm === "report") {
    const last = SOC.msgs.filter(m => m.from !== S.uid).slice(-10).map(m => "« " + m.text + " »").join("\n");
    try { await sendReport(last || "(conversation vide)", "conversation"); t.textContent = "Conversation signalée ✓"; t.disabled = true; } catch (x) { t.textContent = "Échec, réessaie"; }
    return;
  }
  if (t.dataset.cm === "block") { if (!armed(t, "Toucher à nouveau pour bloquer")) return; await blockUser(SOC.chatUid); go("friends"); }
});
function leaveChat() { if (SOC.chatUnsub) { SOC.chatUnsub(); SOC.chatUnsub = null; } }

/* ---------- Annonce de la nouveauté (une seule fois par utilisateur) ---------- */
const NEWS_ID = "v2";
function newsPending() { return !!(S.profile && !((S.profile.seen || {})[NEWS_ID]) && !lsGet("seen-" + NEWS_ID)); }
let newsTimer = null;
function maybeNews() {
  clearTimeout(newsTimer);
  if (!newsPending()) return;
  newsTimer = setTimeout(() => { if (S.screen === "home" && newsPending() && !document.body.classList.contains("sheet-open") && $("tuto").hidden) { closeInstall(); $("newsBackdrop").hidden = false; $("newsSheet").hidden = false; } }, 1200);
}
function closeNews(goFriends) {
  $("newsBackdrop").hidden = true; $("newsSheet").hidden = true;
  lsSet("seen-" + NEWS_ID, 1); saveProfile({ seen: { ...((S.profile && S.profile.seen) || {}), [NEWS_ID]: true } });
  if (goFriends) openTuto();
}
$("newsGo").onclick = () => closeNews(true);
$("newsLater").onclick = () => closeNews(false);
$("newsBackdrop").onclick = () => closeNews(false);

/* ============================================================
   Plusieurs séances par jour
   ============================================================ */
function newSessionKey(d) {
  if (!S.days[d] && S.open !== d) return d;
  let n = 2; while (S.days[d + "~" + n] || S.open === d + "~" + n) n++;
  return d + "~" + n;
}
// Une séance vide du jour si elle existe, sinon une nouvelle.
function freshKey(d) {
  const ks = sessionsOn(d), empty = ks.find(k => isEmpty(S.days[k]));
  return empty || (ks.length ? newSessionKey(d) : d);
}
function sessTabsHTML(c, k) {
  const list = [...new Set([...sessionsOn(dayOf(k)), k])].sort();
  const others = list.filter(x => x !== k && S.days[x] && !isEmpty(S.days[x]));
  if (!others.length && isEmpty(c)) return "";
  return `<div class="sess-tabs" role="tablist" aria-label="Séances du jour">${list.filter(x => x === k || (S.days[x] && !isEmpty(S.days[x]))).map((x, i) => {
    const d = x === k ? c : S.days[x], mt = d && d.disc ? dayMeta(d) : null;
    return `<button type="button" role="tab" data-a="sess" data-k="${x}" aria-selected="${x === k}" style="--tc:${mt ? mt.color : "var(--muted)"}"><i class="dot"></i>Séance ${i + 1}${mt ? " · " + esc(mt.short) : ""}</button>`;
  }).join("")}${isEmpty(c) ? "" : `<button type="button" class="sess-add" data-a="sess-new">+ Autre séance</button>`}</div>`;
}

/* ============================================================
   « La dernière fois » : historique d'un exercice
   ============================================================ */
const exKey = n => norm(n).replace(/\s+/g, " ").trim();
// Séance la plus récente (avant « before ») où l'exercice a des séries remplies.
function exHistory(name, before) {
  const nk = exKey(name || ""); if (!nk) return null;
  const ks = Object.keys(S.days).filter(k => k < before).sort().reverse();
  for (const k of ks) {
    const ex = (S.days[k].exercises || []).find(x => exKey(x.name || "") === nk && (x.sets || []).some(doneSet));
    if (ex) return { k, ex };
  }
  return null;
}
const setTxt = (st, hold) => (hold ? st.reps + " s" : st.reps) + (+st.kg ? " × " + nf.format(st.kg) + " kg" : "");
function lastLineHTML(ex) {
  if (!S.open || !String(ex.name || "").trim()) return "";
  const h = exHistory(ex.name, S.open); if (!h) return "";
  const sets = h.ex.sets.filter(doneSet);
  return `<span class="ll-k">↺ ${esc(shortDate(h.k))}</span> ${esc(sets.map(st => setTxt(st, h.ex.hold)).join(" · "))}`;
}
// Pré-remplit les séries avec celles de la dernière fois (poids repris, répétitions en objectif).
function prefillFromLast(ex, before) {
  const h = exHistory(ex.name, before); if (!h) return false;
  ex.sets = h.ex.sets.filter(doneSet).map(st => ({ reps: "", kg: st.kg ?? "", target: st.reps }));
  ex.rest = restOf(h.ex); ex.hold = !!h.ex.hold;
  return true;
}
// Pour une routine ou une idée : reprend seulement les poids de la dernière fois.
function prefillKg(list, before) {
  list.forEach(ex => {
    const h = exHistory(ex.name, before); if (!h) return;
    const hs = h.ex.sets.filter(doneSet); if (!hs.length) return;
    ex.sets.forEach((st, j) => { if (st.kg === "" || st.kg == null) st.kg = (hs[j] || hs[hs.length - 1]).kg ?? ""; });
  });
}
const blankSets = n => Array.from({ length: n }, () => ({ reps: "", kg: "" }));
function addExercise(name, hold) {
  const c = S.cur; if (!c) return;
  const lib = libFind(name), ex = { name, hold: !!(hold || (lib && lib.hold)), sets: blankSets(3), rpe: 0, note: "", rest: 90 };
  if (c.disc === "muscu" && c.typeId === "cordes") {
    const h = lastCordes(name, S.open);
    Object.assign(ex, { kind: "cordes", sets: [], ropes: "", every: "", unit: "s", lest: false, kg: "" }, h ? cordesOf(h.ex) : {});
  } else prefillFromLast(ex, S.open);
  c.exercises.push(ex); changed(); renderSheet();
  const el = $("exn-" + (c.exercises.length - 1)); if (el) el.closest(".ex").scrollIntoView({ block: "start", behavior: "smooth" });
}
// Nom tapé à la main : si l'exercice est connu et encore vide, on reprend la dernière fois.
$("sheet").addEventListener("change", e => {
  if (e.target.dataset.f !== "ex-name" || !S.cur) return;
  const i = +e.target.dataset.ex, ex = S.cur.exercises[i]; if (!ex || ex.lock || ex.kind === "cordes") return;
  const blank = (ex.sets || []).every(st => (st.reps === "" || st.reps == null) && (st.kg === "" || st.kg == null) && !st.done);
  if (blank && prefillFromLast(ex, S.open)) { changed(); renderSheet(); }
  else { const el = $("el-" + i); if (el) el.innerHTML = lastLineHTML(ex); }
});

/* ============================================================
   Séance « Cordes » : nombre de cordes, départ toutes les X, lest
   ============================================================ */
const CORDES_KEYS = ["ropes", "every", "unit", "lest", "kg"];
function cordesOf(x) { return x && x.kind === "cordes" ? { kind: "cordes", ...Object.fromEntries(CORDES_KEYS.map(k => [k, x[k] ?? (k === "unit" ? "s" : k === "lest" ? false : "")])) } : {}; }
function cordesText(x) {
  const p = [];
  if (x.ropes) p.push(plural(+x.ropes, "corde"));
  if (x.every) p.push("départ toutes les " + nf.format(x.every) + (x.unit === "min" ? " min" : " s"));
  p.push(x.lest ? "lesté" + (x.kg ? " " + nf.format(x.kg) + " kg" : "") : "sans lest");
  return p.join(" · ");
}
function lastCordes(name, before) {
  const nk = exKey(name || ""); if (!nk) return null;
  const k = Object.keys(S.days).filter(x => x < before).sort().reverse().find(x => (S.days[x].exercises || []).some(e => e.kind === "cordes" && exKey(e.name || "") === nk && +e.ropes));
  return k ? { k, ex: S.days[k].exercises.find(e => e.kind === "cordes" && exKey(e.name || "") === nk && +e.ropes) } : null;
}
function cordesExHTML(ex, i) {
  const h = S.open && lastCordes(ex.name, S.open), val = v => v === undefined || v === null ? "" : esc(v);
  return `<article class="ex cordes">
  <div class="ex-head"><span class="ex-num">${pad(i + 1)}</span><input id="exn-${i}" class="ex-name${ex.lock ? " locked" : ""}" data-f="ex-name" data-ex="${i}" placeholder="ex. Montée de corde" value="${esc(ex.name)}" autocomplete="off"${ex.lock ? ' readonly aria-readonly="true"' : ""}><button class="icon-btn" data-a="del-ex" data-ex="${i}" aria-label="Supprimer l’exercice">Retirer</button></div>
  ${h ? `<div class="ex-last"><span class="ll-k">↺ ${esc(shortDate(h.k))}</span> ${esc(cordesText(h.ex))}</div>` : ""}
  <div class="grid2">
    <label class="field"><span>Nombre de cordes</span><input id="cd-ropes-${i}" class="num" data-f="cd-ropes" data-ex="${i}" inputmode="numeric" placeholder="ex. 10" value="${val(ex.ropes)}"></label>
    <div class="field"><span>Départ toutes les</span><div class="cd-every"><input id="cd-every-${i}" class="num" data-f="cd-every" data-ex="${i}" inputmode="decimal" placeholder="${ex.unit === "min" ? "1" : "60"}" value="${val(ex.every)}"><button type="button" class="unit" data-a="cd-unit" data-ex="${i}" aria-label="Changer secondes ou minutes">${ex.unit === "min" ? "min" : "s"}</button></div></div>
  </div>
  <div class="field"><span>Lest</span><div class="chips">
    <button type="button" class="chip" data-a="cd-lest" data-ex="${i}" data-v="0" style="--tc:var(--tc)" aria-pressed="${!ex.lest}">Sans lest</button>
    <button type="button" class="chip" data-a="cd-lest" data-ex="${i}" data-v="1" style="--tc:var(--tc)" aria-pressed="${!!ex.lest}">Lesté</button>
  </div></div>
  ${ex.lest ? `<label class="field"><span>Poids du lest (kg)</span><input id="cd-kg-${i}" class="num" data-f="cd-kg" data-ex="${i}" inputmode="decimal" placeholder="ex. 5" value="${val(ex.kg)}"></label>` : ""}
  <button class="btn primary set-go" id="cdgo-${i}" data-a="cd-go" data-ex="${i}"${+ex.ropes && +ex.every ? "" : " disabled"}>⏱ Lancer les départs</button>
  <textarea id="exr-${i}" data-f="ex-note" data-ex="${i}" placeholder="Ressenti : prise, technique, fatigue…" rows="2">${esc(ex.note)}</textarea>
  </article>`;
}

/* ============================================================
   Bibliothèque d'exercices
   ============================================================ */
const LIB_ALL = EXERCISES.map(([name, m, sec, eq, hold]) => ({ name, m, s: sec, eq, hold: !!hold }));
function libList() { return [...((S.profile && S.profile.customEx) || []).map(x => ({ name: x.name, m: x.m || [], s: x.s || [], eq: "", hold: !!x.hold, custom: true })), ...LIB_ALL]; }
function libFind(name) { const k = exKey(name || ""); return libList().find(x => exKey(x.name) === k); }
// Muscles d'un exercice : bibliothèque, sinon mots-clés du nom.
function musclesOf(name) {
  const f = libFind(name); if (f && f.m.length) return { p: f.m, s: f.s || [] };
  const n = norm(name || "");
  const kw = KEYWORDS.find(([re]) => re.test(n));
  return kw ? { p: kw[1], s: kw[2] } : null;
}
const LIB = { cb: null, q: "", g: null, disc: "muscu" };
function openLib(cb, disc) {
  Object.assign(LIB, { cb, q: "", g: null, disc: disc || "muscu" });
  $("libQ").value = ""; renderLibChips(); renderLib();
  $("libSheet").scrollTop = 0; $("libSheet").classList.add("open"); document.body.classList.add("sheet-open");
}
function closeLib() { $("libSheet").classList.remove("open"); if (!$("sheet").classList.contains("open")) document.body.classList.remove("sheet-open"); }
function renderLibChips() {
  $("libChips").innerHTML = `<button type="button" class="chip" data-lg="" aria-pressed="${!LIB.g}" style="--tc:var(--red)">Tous</button>` +
    GROUPS.map(([id, n]) => `<button type="button" class="chip" data-lg="${id}" aria-pressed="${LIB.g === id}" style="--tc:var(--red)">${n}</button>`).join("");
}
function usedNames() {
  const seen = new Map();
  Object.keys(S.days).sort().reverse().forEach(k => (S.days[k].exercises || []).forEach(ex => { const n = String(ex.name || "").trim(); if (n && !seen.has(exKey(n))) seen.set(exKey(n), n); }));
  return seen;
}
function libRow(x, before) {
  const h = exHistory(x.name, before || "9999"), mus = (x.m || []).map(m => MUSCLES[m]).join(", ");
  return `<button type="button" class="lib-row" data-lib="${esc(x.name)}" data-hold="${x.hold ? 1 : ""}">${muscleMini(x.m || [], x.s || [])}
    <span class="main"><b>${esc(x.name)}</b><span>${esc([mus, EQUIP[x.eq]].filter(Boolean).join(" · ") || "Exercice perso")}</span>
    ${h ? `<span class="lib-last">↺ ${esc(h.ex.sets.filter(doneSet).map(st => setTxt(st, h.ex.hold)).slice(0, 3).join(" · "))}</span>` : ""}</span><span class="plus" aria-hidden="true">+</span></button>`;
}
function renderLib() {
  const q = exKey(LIB.q), grp = GROUPS.find(g => g[0] === LIB.g), all = libList(), before = S.open || "9999";
  const byKey = new Map(all.map(x => [exKey(x.name), x]));
  // Exercices déjà faits mais absents de la bibliothèque (noms tapés à la main).
  usedNames().forEach((n, k) => { if (!byKey.has(k)) { const mu = musclesOf(n); const x = { name: n, m: mu ? mu.p : [], s: mu ? mu.s : [], eq: "", hold: false, custom: true }; all.unshift(x); byKey.set(k, x); } });
  let list = all.filter(x => (!q || exKey(x.name).includes(q)) && (!grp || (x.m || []).some(m => grp[2].includes(m))));
  if (LIB.disc === "calis" && !q && !grp) list = list.filter(x => x.eq === "C" || x.custom);
  const recent = !q && !grp ? [...usedNames().keys()].slice(0, 8).map(k => byKey.get(k)).filter(Boolean) : [];
  const exact = q && all.some(x => exKey(x.name) === q);
  $("libList").innerHTML = `${q && !exact ? `<button type="button" class="lib-row lib-new" data-libnew="1"><span class="plus-big">+</span><span class="main"><b>Créer « ${esc(LIB.q.trim())} »</b><span>Ajouter ton propre exercice</span></span></button>` : ""}
    ${recent.length ? `<h3 class="h2">Tes exercices récents</h3><div class="lib-group">${recent.map(x => libRow(x, before)).join("")}</div>` : ""}
    ${list.length ? `<h3 class="h2">${q || grp ? list.length + " exercice" + (list.length > 1 ? "s" : "") : "Tous les exercices"}</h3><div class="lib-group">${list.filter(x => !recent.includes(x)).map(x => libRow(x, before)).join("")}</div>`
      : q ? "" : `<p class="hint">Aucun exercice dans ce groupe.</p>`}`;
}
$("libQ").addEventListener("input", e => { LIB.q = e.target.value; renderLib(); });
$("libSheet").addEventListener("click", e => {
  if (e.target.closest("#libClose")) { closeLib(); return; }
  const g = e.target.closest("[data-lg]"); if (g) { LIB.g = g.dataset.lg || null; renderLibChips(); renderLib(); return; }
  const n = e.target.closest("[data-libnew]");
  if (n) {
    const name = LIB.q.trim().slice(0, 60); if (!name) return;
    const mu = musclesOf(name), list = ((S.profile && S.profile.customEx) || []).filter(x => exKey(x.name) !== exKey(name));
    list.unshift({ name, m: mu ? mu.p : [], s: mu ? mu.s : [] }); saveProfile({ customEx: list.slice(0, 80) });
    closeLib(); LIB.cb && LIB.cb(name, false); return;
  }
  const r = e.target.closest("[data-lib]"); if (r) { closeLib(); LIB.cb && LIB.cb(r.dataset.lib, !!r.dataset.hold); }
});

/* ============================================================
   Records battus en direct
   ============================================================ */
// Meilleure série d'un exercice : charge max (et reps à cette charge), reps max.
function bestSets(sets, doneFn) {
  let kg = 0, rk = 0, reps = 0;
  (sets || []).filter(doneFn).forEach(st => { const k = +st.kg || 0, r = +st.reps || 0; if (!r) return; if (k > kg || (k === kg && r > rk)) { kg = k; rk = r; } if (r > reps) reps = r; });
  return { kg, rk, reps };
}
function exBestBefore(name, before) {
  const nk = exKey(name); let kg = 0, rk = 0, reps = 0, n = 0;
  Object.keys(S.days).forEach(k => { if (k >= before) return; (S.days[k].exercises || []).forEach(ex => {
    if (exKey(ex.name || "") !== nk) return; const b = bestSets(ex.sets, doneSet); if (!b.reps) return; n++;
    if (b.kg > kg || (b.kg === kg && b.rk > rk)) { kg = b.kg; rk = b.rk; } if (b.reps > reps) reps = b.reps;
  }); });
  return { kg, rk, reps, n };
}
// Records de la séance (par rapport à toutes les séances d'avant). Il faut au moins une séance d'avant pour comparer.
function sessionPRs(c, k) {
  const out = [], disc = c && c.disc;
  if (!c || !k) return out;
  if (disc === "muscu" || disc === "calis") {
    const seen = new Set();
    (c.exercises || []).forEach(ex => {
      const name = String(ex.name || "").trim(), nk = exKey(name); if (!name || seen.has(nk)) return;
      const cur = bestSets(ex.sets, st => isDone(st) && doneSet(st)); if (!cur.reps) return;
      const h = exBestBefore(name, k); if (!h.n) return;
      if (cur.kg > 0 && (cur.kg > h.kg || (cur.kg === h.kg && cur.rk > h.rk))) { seen.add(nk); out.push({ ex: name, txt: nf.format(cur.kg) + " kg × " + cur.rk }); }
      else if (!cur.kg && !h.kg && cur.reps > h.reps) { seen.add(nk); out.push({ ex: name, txt: cur.reps + (ex.hold ? " s" : " reps") }); }
    });
  } else if (disc === "course") {
    const r = c.run || {}, dist = +r.dist || 0, t = runSecs(r); if (!dist) return out;
    const prev = Object.keys(S.days).filter(x => x < k && discOf(S.days[x]) === "course" && S.days[x].run && +S.days[x].run.dist);
    if (!prev.length) return out;
    const maxD = Math.max(...prev.map(x => +S.days[x].run.dist));
    if (dist > maxD) out.push({ ex: "Plus longue sortie", txt: nf.format(dist) + " km" });
    if (t && dist >= 3) {
      const paces = prev.map(x => S.days[x].run).filter(p => +p.dist >= 3 && runSecs(p)).map(p => runSecs(p) / +p.dist);
      if (paces.length && t / dist < Math.min(...paces)) out.push({ ex: "Meilleure allure", txt: runPace(r) + " /km" });
    }
  }
  return out;
}
function announcePRs(prs, k) {
  if (!S.prSeen) S.prSeen = new Set();
  const fresh = prs.filter(p => !S.prSeen.has(k + "|" + p.ex));
  prs.forEach(p => S.prSeen.add(k + "|" + p.ex));
  if (!fresh.length) return;
  const p = fresh[0];
  toast(`<b>🏆 Nouveau record !</b><span>${esc(p.ex)} · ${esc(p.txt)}</span>`, "pr");
  if (navigator.vibrate) navigator.vibrate([80, 60, 160]);
}
let toastTimer = null;
function toast(html, kind) {
  const t = $("toast"); t.innerHTML = html; t.className = "toast" + (kind ? " " + kind : ""); t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, kind === "pr" ? 4200 : 2600);
}
$("toast").onclick = () => { $("toast").hidden = true; };

/* ============================================================
   Routines et programmes
   ============================================================ */
// Stockage : { n: nom, s: séries, r: reps, rest, h: tenue } (Firestore n'accepte pas les tableaux de tableaux).
const toTuple = e => [e.n, e.s, e.r, e.rest, e.h, e.c || null];
function routines() { return ((S.profile && S.profile.routines) || []).slice(); }
function saveRoutines(list) { return saveProfile({ routines: list }); }
function saveRoutineFromSession(c) {
  const ex = (c.exercises || []).filter(x => String(x.name || "").trim()).map(x => {
    const sets = x.sets || [], last = sets.filter(doneSet).pop() || sets[sets.length - 1] || {};
    const r = sets.find(doneSet) ? sets.find(doneSet).reps : last.target ?? "";
    const out = { n: x.name.trim(), s: sets.length || 3, r: r === "" ? 10 : r, rest: restOf(x), h: !!x.hold };
    if (x.kind === "cordes") { const { kind, ...cd } = cordesOf(x); out.c = cd; out.s = 1; out.r = x.ropes || ""; }
    return out;
  });
  const name = String(c.title || "").trim() || (c.disc === "calis" ? "Callisthénie" : dayMeta(c).name);
  const list = routines(); list.unshift({ id: "r" + Date.now().toString(36), name: name.slice(0, 40), disc: c.disc, typeId: c.typeId || null, ex });
  saveRoutines(list.slice(0, 40));
  toast("☆ Routine « " + esc(name) + " » enregistrée");
}
// Lance une séance (routine, programme) aujourd'hui : poids de la dernière fois déjà remplis.
function startWorkout(w, extra) {
  const d = todayK(), k = freshKey(d);
  go("seances"); const t = new Date(); S.view = new Date(t.getFullYear(), t.getMonth(), 1); renderMain();
  openDay(k);
  S.cur = EMPTY_DAY(); setDisc(S.cur, w.disc || "muscu"); S.cur.title = w.name || "";
  if (w.disc === "course") {
    S.cur.runType = w.runType || null; S.cur.note = w.note || "";
    S.cur.run = { blocks: (w.blocks || []).map(([rep, eff, unit, pace, rec]) => ({ rep, eff, unit, pace, rec })), h: "", m: w.m || "", s: "" };
  } else {
    if (w.disc === "muscu") S.cur.typeId = S.types.some(x => x.id === w.typeId) ? w.typeId : null;
    S.cur.exercises = ideaExercises(w.ex).map((e, j) => ({ ...e, lock: true, ...(w.ex[j][5] ? { ...w.ex[j][5], kind: "cordes", sets: [] } : {}) }));
    prefillKg(S.cur.exercises, k);
  }
  if (extra) Object.assign(S.cur, extra);
  timer = 1; flush(); renderSheet(); $("sheet").scrollTop = 0;
}
function renderRoutines() {
  const list = routines();
  $("routinesBody").innerHTML = `<button class="btn primary" data-rnew="1">+ Créer une routine</button>
    <p class="hint">Astuce : dans une séance, touche « ☆ Enregistrer comme routine » pour la refaire en un toucher.</p>
    ${list.length ? `<div class="list">${list.map(r => {
      const col = r.disc === "calis" ? DISC.calis.color : (typeOf(r.typeId) || {}).color || "var(--red-hi)";
      return `<article class="idea" style="--tc:${col}">
        <div class="idea-top"><b>${esc(r.name)}</b><span class="tag">${r.disc === "calis" ? "Callisthénie" : esc((typeOf(r.typeId) || {}).name || "Musculation")}</span></div>
        <ul>${(r.ex || []).map(e => `<li>${esc(e.n)} — ${e.c ? esc(cordesText(e.c)) : esc(e.s) + " × " + esc(repsText(e.r, e.h))}</li>`).join("")}</ul>
        <div class="grid2"><button class="btn" data-redit="${r.id}">Modifier</button><button class="btn primary" data-rgo="${r.id}">Lancer</button></div>
      </article>`; }).join("")}</div>` : `<div class="empty">Pas encore de routine. Crée ta première : tes exercices, tes séries et tes temps de repos, prêts à lancer.</div>`}`;
}
$("routinesBody").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  if (b.dataset.rnew) { S.rEdit = { id: null, name: "", disc: "muscu", typeId: null, ex: [] }; go("routine"); return; }
  if (b.dataset.redit) { S.rEdit = clone(routines().find(r => r.id === b.dataset.redit)); go("routine"); return; }
  if (b.dataset.rgo) { const r = routines().find(x => x.id === b.dataset.rgo); if (r) startWorkout({ name: r.name, disc: r.disc, typeId: r.typeId, ex: (r.ex || []).map(toTuple) }); }
});
function renderRoutine() {
  const r = S.rEdit; if (!r) { go("routines"); return; }
  $("routineTitle").textContent = r.id ? "Modifier" : "Nouvelle routine";
  $("routineBody").innerHTML = `<label class="field"><span>Nom de la routine</span><input id="rtn-name" value="${esc(r.name)}" placeholder="ex. Push du lundi" maxlength="40"></label>
    <div class="chips">${["muscu", "calis"].map(d => `<button type="button" class="chip" data-rdisc="${d}" style="--tc:${DISC[d].color}" aria-pressed="${r.disc === d}">${DISC[d].name}</button>`).join("")}</div>
    ${r.disc === "muscu" ? `<div class="chips">${S.types.filter(t => t.id !== "repos").map(t => `<button type="button" class="chip" data-rtype="${t.id}" style="--tc:${t.color}" aria-pressed="${r.typeId === t.id}"><i class="dot"></i>${esc(t.name)}</button>`).join("")}</div>` : ""}
    <div class="list">${r.ex.map((e, i) => `<div class="rt-ex card">
      <div class="rt-ex-top"><b>${esc(e.n)}</b><button type="button" class="icon-btn" data-rdel="${i}">Retirer</button></div>
      ${e.c ? `<p class="hint">${esc(cordesText(e.c))}</p>` : `<div class="grid3">
        <div class="field"><span>Séries</span><div class="rest-ctl"><button type="button" class="step" data-rset="${i}:-1" aria-label="Moins de séries">−</button><span class="rest-val">${e.s}</span><button type="button" class="step" data-rset="${i}:1" aria-label="Plus de séries">+</button></div></div>
        <label class="field"><span>${e.h ? "Secondes" : "Reps"}</span><input data-rreps="${i}" value="${esc(e.r)}" inputmode="text" placeholder="10"></label>
        <div class="field"><span>Repos</span><div class="rest-ctl"><button type="button" class="step" data-rrest="${i}:-15" aria-label="Moins de repos">−</button><span class="rest-val sm">${fmtRest(e.rest)}</span><button type="button" class="step" data-rrest="${i}:15" aria-label="Plus de repos">+</button></div></div>
      </div>`}</div>`).join("")}</div>
    <button type="button" class="add-ex" data-radd="1">+ Ajouter un exercice</button>
    <p class="err" id="rtnErr" hidden></p>
    <button type="button" class="btn primary" data-rsave="1">Enregistrer la routine</button>
    ${r.id ? `<button type="button" class="danger" data-rremove="1">Supprimer la routine</button>` : ""}`;
}
$("routineBody").addEventListener("input", e => {
  const r = S.rEdit; if (!r) return;
  if (e.target.id === "rtn-name") r.name = e.target.value;
  if (e.target.dataset.rreps) { const v = e.target.value.trim(), i = +e.target.dataset.rreps; r.ex[i].r = /^\d+$/.test(v) ? +v : v; }
});
$("routineBody").addEventListener("click", e => {
  const b = e.target.closest("button"), r = S.rEdit; if (!b || !r) return;
  if (b.dataset.rdisc) { r.disc = b.dataset.rdisc; renderRoutine(); return; }
  if (b.dataset.rtype) { r.typeId = r.typeId === b.dataset.rtype ? null : b.dataset.rtype; renderRoutine(); return; }
  if (b.dataset.rdel) { r.ex.splice(+b.dataset.rdel, 1); renderRoutine(); return; }
  if (b.dataset.rset) { const [i, d] = b.dataset.rset.split(":").map(Number); r.ex[i].s = Math.min(10, Math.max(1, r.ex[i].s + d)); renderRoutine(); return; }
  if (b.dataset.rrest) { const [i, d] = b.dataset.rrest.split(":").map(Number); r.ex[i].rest = Math.min(600, Math.max(0, r.ex[i].rest + d)); renderRoutine(); return; }
  if (b.dataset.radd) { openLib((name, hold) => { r.ex.push({ n: name, s: 3, r: hold ? 30 : 10, rest: 90, h: !!hold }); renderRoutine(); }, r.disc); return; }
  if (b.dataset.rsave) {
    if (!r.name.trim()) { show($("rtnErr"), "Donne un nom à ta routine."); return; }
    if (!r.ex.length) { show($("rtnErr"), "Ajoute au moins un exercice."); return; }
    const list = routines(), data = { ...r, name: r.name.trim().slice(0, 40), id: r.id || "r" + Date.now().toString(36) };
    const i = list.findIndex(x => x.id === data.id); if (i >= 0) list[i] = data; else list.unshift(data);
    saveRoutines(list.slice(0, 40)); S.rEdit = null; go("routines"); toast("✓ Routine enregistrée"); return;
  }
  if (b.dataset.rremove) { if (!armed(b, "Toucher à nouveau pour supprimer")) return; saveRoutines(routines().filter(x => x.id !== r.id)); S.rEdit = null; go("routines"); }
});

// Programme suivi : { id, start, done } dans le profil.
function programState() {
  const p = S.profile && S.profile.program; if (!p) return null;
  const pg = PROGRAMS.find(x => x.id === p.id); if (!pg) return null;
  const done = p.done || 0, week = Math.floor(done / pg.perWeek) + 1, finished = week > pg.weeks;
  const plan = pg.plan(Math.min(week, pg.weeks)), next = plan[done % plan.length];
  return { p, pg, done, week, finished, next, total: pg.weeks * pg.perWeek, inWeek: done % pg.perWeek + 1 };
}
function programCardHTML(ps, compact) {
  if (!ps) return "";
  const pct = Math.min(100, Math.round(ps.done / ps.total * 100));
  return `<section class="prog-now" style="--tc:${ps.pg.color}">
    <div class="pn-top"><span class="tag">Mon programme</span><b>${esc(ps.pg.name)}</b></div>
    <div class="pn-bar"><i style="width:${pct}%"></i></div>
    <span class="hint">${ps.finished ? "Programme terminé, bravo ! 🎉" : `Semaine ${ps.week} / ${ps.pg.weeks} · séance ${ps.inWeek} / ${ps.pg.perWeek}`}</span>
    ${ps.finished ? `<button class="btn" data-pgstop="1">Choisir un autre programme</button>` : `<button class="btn primary" data-pgnext="1">▶ Lancer : ${esc(ps.next.name)}</button>`}
    ${compact ? "" : `<p class="hint">${esc(ps.pg.tip)}</p>`}
  </section>`;
}
function launchProgram() {
  const ps = programState(); if (!ps || ps.finished) return;
  startWorkout(ps.next, { program: { id: ps.pg.id, n: ps.done + 1 } });
  saveProfile({ program: { ...ps.p, done: ps.done + 1, last: todayK() } });
}
function renderPrograms() {
  const ps = programState();
  $("programsBody").innerHTML = `${programCardHTML(ps)}
    ${ps ? `<button class="linkish" data-pgstop="1">Arrêter ce programme</button>` : `<p class="hint" style="margin-top:-8px">Choisis un programme : l’app te propose la bonne séance à chaque fois, avec tes poids de la dernière fois.</p>`}
    <div class="list">${PROGRAMS.map(pg => {
      const cur = ps && ps.pg.id === pg.id, names = [...new Set(pg.plan(1).map(w => w.name))];
      return `<article class="idea" style="--tc:${pg.color}">
        <div class="idea-top"><b>${esc(pg.name)}</b><span class="tag">${esc(pg.level)}</span></div>
        <span class="idea-meta">${pg.weeks} semaines · ${pg.perWeek} séances par semaine</span>
        <p style="margin:0;font-size:14px">${esc(pg.desc)}</p>
        <ul>${names.map(n => `<li>${esc(n)}</li>`).join("")}</ul>
        ${cur ? `<span class="tag done" style="align-self:flex-start">Programme en cours</span>` : `<button class="btn primary idea-go" data-pgstart="${pg.id}">Suivre ce programme</button>`}
      </article>`; }).join("")}</div>`;
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-pgstart],[data-pgnext],[data-pgstop]"); if (!b) return;
  if (b.dataset.pgstart) {
    if (S.profile.program && !armed(b, "Remplacer ton programme actuel ?")) return;
    saveProfile({ program: { id: b.dataset.pgstart, start: todayK(), done: 0 } }); toast("✓ Programme choisi : c’est parti !"); refresh(); window.scrollTo(0, 0); return;
  }
  if (b.dataset.pgnext) { launchProgram(); return; }
  if (b.dataset.pgstop) { if (!armed(b, "Toucher à nouveau pour arrêter")) return; saveProfile({ program: null }); refresh(); }
});

/* ============================================================
   Série de semaines 🔥 et objectif de la semaine
   ============================================================ */
const mondayOf = d => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - (x.getDay() + 6) % 7); return x; };
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const counts = s => s && !isEmpty(s) && s.typeId !== "repos";
function weekCounts() {
  const m = new Map();
  Object.keys(S.days).forEach(k => { if (!counts(S.days[k])) return; const w = key(mondayOf(parse(k))); m.set(w, (m.get(w) || 0) + 1); });
  return m;
}
function weeklyGoal() { return Math.min(7, Math.max(1, +((S.profile && S.profile.goal) || 3))); }
// Série = semaines d'affilée où l'objectif est atteint. La semaine en cours compte dès qu'elle est réussie.
function streakInfo() {
  const m = weekCounts(), G = weeklyGoal(), cur = mondayOf(new Date()), thisWeek = m.get(key(cur)) || 0;
  let n = thisWeek >= G ? 1 : 0, d = addDays(cur, -7);
  while ((m.get(key(d)) || 0) >= G) { n++; d = addDays(d, -7); }
  let best = 0, run = 0;
  const first = [...m.keys()].sort()[0];
  if (first) for (let w = parse(first); w <= cur; w = addDays(w, 7)) { if ((m.get(key(w)) || 0) >= G) { run++; best = Math.max(best, run); } else run = 0; }
  return { n, best, thisWeek, G, left: Math.max(0, G - thisWeek), daysLeft: 7 - ((new Date().getDay() + 6) % 7) };
}
function ringSVG(v, max, size) {
  const r = 26, c = 2 * Math.PI * r, p = Math.min(1, max ? v / max : 0);
  return `<svg viewBox="0 0 64 64" width="${size || 64}" height="${size || 64}" aria-hidden="true" class="ring"><circle cx="32" cy="32" r="${r}" class="ring-bg"/><circle cx="32" cy="32" r="${r}" class="ring-fg" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - p)).toFixed(1)}" transform="rotate(-90 32 32)"/></svg>`;
}
function streakCardHTML() {
  const st = streakInfo(), done = st.thisWeek >= st.G;
  const msg = done ? (st.thisWeek > st.G ? "Objectif dépassé, énorme 💪" : "Objectif de la semaine atteint ✓")
    : st.n ? `Encore ${st.left} séance${st.left > 1 ? "s" : ""} pour garder ta série` : `Encore ${st.left} séance${st.left > 1 ? "s" : ""} pour lancer ta série`;
  return `<button type="button" class="streak-card${done ? " done" : ""}" id="goalBtn" aria-label="Objectif de la semaine : ${st.thisWeek} sur ${st.G}. Toucher pour le changer.">
    <span class="ring-wrap">${ringSVG(st.thisWeek, st.G)}<span class="ring-txt"><b>${st.thisWeek}</b>/${st.G}</span></span>
    <span class="sc-main"><span class="sc-lbl">Objectif de la semaine</span><b>${esc(msg)}</b><span class="sc-sub">${st.best > st.n ? "Record : " + st.best + " semaine" + (st.best > 1 ? "s" : "") : done ? "Tu bats ta série, continue !" : st.daysLeft + " jour" + (st.daysLeft > 1 ? "s" : "") + " restant" + (st.daysLeft > 1 ? "s" : "")}</span></span>
    <span class="flame${st.n ? " on" : ""}"><span aria-hidden="true">🔥</span><b>${st.n}</b><small>semaine${st.n > 1 ? "s" : ""}</small></span>
  </button>
  <div class="goal-pick card" id="goalPick" hidden><div class="lbl">Combien de séances par semaine ?</div>
    <div class="chips">${[1, 2, 3, 4, 5, 6, 7].map(n => `<button type="button" class="chip" data-goal="${n}" style="--tc:var(--red)" aria-pressed="${n === st.G}">${n}</button>`).join("")}</div>
    <p class="hint">Ta série 🔥 compte les semaines d’affilée où tu atteins cet objectif. Les jours « Repos » ne comptent pas.</p></div>`;
}
document.addEventListener("click", e => {
  if (e.target.closest("#goalBtn")) { const p = $("goalPick"); if (p) p.hidden = !p.hidden; return; }
  const g = e.target.closest("[data-goal]"); if (g) { saveProfile({ goal: +g.dataset.goal }); refresh(); }
});

/* ============================================================
   Accueil, « Let's go » et « Social »
   ============================================================ */
function todaySummary() {
  const ks = sessionsOn(todayK()).filter(k => !isEmpty(S.days[k]));
  return ks.map(k => titleOf(S.days[k])).join(" + ");
}
function renderHome() {
  refreshInstallBtn(); refreshSocial();
  const t = new Date(), tk = key(t);
  $("homeDate").innerHTML = `<span>${cap(DAYS[t.getDay()])}</span>${t.getDate()} ${MONTHS[t.getMonth()]} ${t.getFullYear()}`;
  $("homeAvatar").innerHTML = avatarHTML(S.profile, 34);
  $("homeStreak").innerHTML = streakCardHTML();
  const mon = mondayOf(t);
  let h = "";
  for (let i = 0; i < 7; i++) {
    const k = key(addDays(mon, i)), ks = sessionsOn(k).filter(x => counts(S.days[x])), ty = ks.length && dayMeta(S.days[ks[0]]);
    h += `<span class="${ks.length ? "on" : ""}${k === tk ? " now" : ""}" style="--tc:${ty ? ty.color : "#8A847E"}">${"LMMJVSD"[i]}${ks.length > 1 ? "<sup>" + ks.length + "</sup>" : ""}</span>`;
  }
  $("homeWeek").innerHTML = h;
  const today = todaySummary(), ps = programState();
  $("homeGoSub").textContent = today ? "Aujourd’hui : " + today : ps && !ps.finished ? "Prochaine séance : " + ps.next.name : "Lance ta séance";
  const n = nutOf(tk), c = (n.complements || []).length;
  $("homeNut").innerHTML = `<span class="pill${n.creatine ? " ok" : ""}">${n.creatine ? "✓ Créatine prise" : "Créatine à prendre"}</span><span class="pill${c ? " ok" : ""}">${c} complément${c > 1 ? "s" : ""} aujourd’hui</span>`;
}
const GO_TILES = [
  ["seances", "Calendrier", "Toutes tes séances, jour par jour", '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>'],
  ["routines", "Mes routines", "Tes séances enregistrées, prêtes à lancer", '<path d="M5 4h14v17l-7-4-7 4z"/>'],
  ["programs", "Programmes", "Des plans sur plusieurs semaines", '<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>'],
  ["types", "Idées de séances", "Muscu, CrossFit, callisthénie, course", '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.4 1 2.5h6c0-1.1.4-1.9 1-2.5A6 6 0 0 0 12 3z"/>'],
  ["records", "Mes records", "Tes meilleures perfs", '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>'],
  ["progress", "Ma progression", "Tes courbes séance après séance", '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>'],
  ["muscles", "Carte musculaire", "Les muscles travaillés cette semaine", '<circle cx="12" cy="4.5" r="2"/><path d="M7 21l2-8-3-4 6-2 6 2-3 4 2 8M9 13h6"/>'],
  ["recap", "Bilan du mois", "Tes chiffres à partager en story", '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 18h4M9 12l2-3 2 2 2-3"/>']
];
function renderGo() {
  const ks = sessionsOn(todayK()).filter(k => !isEmpty(S.days[k])), ps = programState(), rs = routines();
  $("goBody").innerHTML = `
    <section class="go-hero">
      ${ks.length ? `<span class="sc-lbl">Aujourd’hui</span><b class="go-today">${esc(todaySummary())}</b>
        <div class="grid2"><button class="btn" data-goopen="${ks[ks.length - 1]}">Continuer</button><button class="btn primary" data-gonew="1">+ Nouvelle</button></div>`
      : `<span class="sc-lbl">Pas encore de séance aujourd’hui</span><button class="btn primary go-start" data-gonew="1">▶ Démarrer ma séance</button>`}
    </section>
    ${programCardHTML(ps, true)}
    ${rs.length ? `<section><h2 class="h2">Lancer une routine</h2><div class="chips">${rs.slice(0, 6).map(r => `<button class="chip" data-rgo2="${r.id}" style="--tc:var(--red)">▶ ${esc(r.name)}</button>`).join("")}</div></section>` : ""}
    <div class="go-grid">${GO_TILES.map(([v, n, d, ic]) => `<button class="go-tile" data-go="${v}"><span class="disc-ico" aria-hidden="true" style="--tc:var(--red-hi)"><svg viewBox="0 0 24 24">${ic}</svg></span><b>${n}</b><span>${d}</span></button>`).join("")}</div>`;
}
$("goBody").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  if (b.dataset.goopen) { go("seances"); openDay(b.dataset.goopen); return; }
  if (b.dataset.gonew) { go("seances"); openDay(freshKey(todayK())); return; }
  if (b.dataset.rgo2) { const r = routines().find(x => x.id === b.dataset.rgo2); if (r) startWorkout({ name: r.name, disc: r.disc, typeId: r.typeId, ex: (r.ex || []).map(toTuple) }); }
});

/* ============================================================
   Bilan du mois (et image à partager en story)
   ============================================================ */
function monthStats(mk) {
  const ks = Object.keys(S.days).filter(k => k.startsWith(mk) && !isEmpty(S.days[k]) && S.days[k].typeId !== "repos").sort();
  const disc = {}, exCount = {}, mus = {};
  let vol = 0, km = 0, runT = 0, prs = 0;
  ks.forEach(k => {
    const s = S.days[k], dn = DISC[discOf(s)].name; disc[dn] = (disc[dn] || 0) + 1;
    vol += dayVolume(s); km += runKm(s); if (discOf(s) === "course") runT += runSecs(s.run); prs += (s.prs || []).length;
    (s.exercises || []).forEach(ex => { const n = String(ex.name || "").trim(); if (!n) return; exCount[n] = (exCount[n] || 0) + 1; });
  });
  Object.entries(muscleLoad(ks)).forEach(([m, v]) => { mus[m] = v; });
  const top = o => Object.entries(o).sort((a, b) => b[1] - a[1])[0];
  return { ks, n: ks.length, days: new Set(ks.map(dayOf)).size, vol, km, runT, prs, disc: top(disc), ex: top(exCount), mus: top(mus) };
}
function renderRecap() {
  const d = S.recapMonth || (S.recapMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const mk = d.getFullYear() + "-" + pad(d.getMonth() + 1), st = monthStats(mk);
  const pm = new Date(d.getFullYear(), d.getMonth() - 1, 1), prev = monthStats(pm.getFullYear() + "-" + pad(pm.getMonth() + 1));
  const diff = st.n - prev.n, streak = streakInfo();
  $("recapMonth").textContent = cap(MONTHS[d.getMonth()]) + " " + d.getFullYear();
  $("recapNext").disabled = d >= new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const big = (v, l) => `<div class="stat"><b>${v}</b><span>${l}</span></div>`;
  $("recapBody").innerHTML = !st.n ? `<div class="empty">Aucune séance en ${MONTHS[d.getMonth()]}. Ton bilan apparaîtra ici dès ta première séance.</div>` : `
    <div class="stats">${big(st.n, "séance" + (st.n > 1 ? "s" : ""))}${big(st.days, "jour" + (st.days > 1 ? "s" : "") + " actif" + (st.days > 1 ? "s" : ""))}${big(st.prs, "record" + (st.prs > 1 ? "s" : "") + " battu" + (st.prs > 1 ? "s" : ""))}</div>
    <div class="stats">${big(st.vol >= 10000 ? nf.format(st.vol / 1000) + " t" : nf.format(st.vol), st.vol >= 10000 ? "soulevées" : "kg soulevés")}${big(nf.format(st.km), "km courus")}${big(streak.best, "semaines 🔥 (record)")}</div>
    <section class="card"><dl class="kv">
      <dt>Par rapport au mois d’avant</dt><dd>${diff > 0 ? "▲ " + diff + " séance" + (diff > 1 ? "s" : "") + " de plus" : diff < 0 ? "▼ " + (-diff) + " séance" + (diff < -1 ? "s" : "") + " de moins" : "Autant de séances"}</dd>
      ${st.disc ? `<dt>Activité favorite</dt><dd>${esc(st.disc[0])} (${st.disc[1]})</dd>` : ""}
      ${st.ex ? `<dt>Exercice le plus fait</dt><dd>${esc(st.ex[0])} (${st.ex[1]} fois)</dd>` : ""}
      ${st.mus ? `<dt>Muscle le plus travaillé</dt><dd>${esc(MUSCLES[st.mus[0]])}</dd>` : ""}
      ${st.runT ? `<dt>Temps de course</dt><dd>${esc(fmtDur(st.runT))}</dd>` : ""}
    </dl></section>
    <button class="btn primary" id="recapShare">📲 Partager en story</button>
    <p class="hint" id="recapMsg" style="text-align:center">Une image de ton bilan est créée : partage-la sur Insta, Snap ou WhatsApp.</p>
    <img id="recapImg" class="recap-img" alt="Aperçu de l’image du bilan" hidden>`;
}
$("recapPrev").onclick = () => { const d = S.recapMonth; S.recapMonth = new Date(d.getFullYear(), d.getMonth() - 1, 1); renderRecap(); };
$("recapNext").onclick = () => { const d = S.recapMonth; S.recapMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1); renderRecap(); };
async function recapImage() {
  const d = S.recapMonth, mk = d.getFullYear() + "-" + pad(d.getMonth() + 1), st = monthStats(mk);
  try { await Promise.all([document.fonts.load('italic 800 120px "Barlow Condensed"'), document.fonts.load('800 120px "Barlow Condensed"'), document.fonts.load('600 40px "Figtree"')]); } catch (e) { /* police système */ }
  const W = 1080, H = 1920, cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const g = cv.getContext("2d"), red = getComputedStyle(document.documentElement).getPropertyValue("--red").trim() || "#E3161F";
  g.fillStyle = "#0A0A0B"; g.fillRect(0, 0, W, H);
  const grd = g.createRadialGradient(W / 2, 260, 40, W / 2, 260, 900); grd.addColorStop(0, red + "55"); grd.addColorStop(1, "transparent");
  g.fillStyle = grd; g.fillRect(0, 0, W, H);
  g.textAlign = "center"; g.fillStyle = "#9C9690"; g.font = '600 44px "Figtree", sans-serif';
  g.fillText("MON BILAN DU MOIS", W / 2, 200);
  g.fillStyle = "#F4F1EE"; g.font = 'italic 800 150px "Barlow Condensed", sans-serif';
  g.fillText(MONTHS[d.getMonth()].toUpperCase(), W / 2, 350, W - 120);
  g.fillStyle = red; g.fillText(String(d.getFullYear()), W / 2, 490);
  const tiles = [[st.n, "SÉANCES"], [st.days, "JOURS ACTIFS"], [st.vol >= 10000 ? nf.format(st.vol / 1000) + " t" : nf.format(st.vol) + " kg", "SOULEVÉS"], [nf.format(st.km) + " km", "COURUS"], [st.prs, "RECORDS BATTUS"], [streakInfo().n, "SEMAINES 🔥"]];
  tiles.forEach(([v, l], i) => {
    const x = 90 + (i % 2) * 470, y = 600 + Math.floor(i / 2) * 330;
    g.fillStyle = "#141416"; g.strokeStyle = "#2B2B2F"; g.lineWidth = 3;
    g.beginPath(); g.roundRect ? g.roundRect(x, y, 430, 290, 36) : g.rect(x, y, 430, 290); g.fill(); g.stroke();
    g.textAlign = "left"; g.fillStyle = "#F4F1EE"; g.font = '800 120px "Barlow Condensed", sans-serif'; g.fillText(String(v), x + 40, y + 160, 350);
    g.fillStyle = "#9C9690"; g.font = '600 34px "Figtree", sans-serif'; g.fillText(l, x + 40, y + 230, 350);
  });
  g.textAlign = "center";
  if (st.ex) { g.fillStyle = "#9C9690"; g.font = '600 36px "Figtree", sans-serif'; g.fillText("Exercice favori : " + st.ex[0], W / 2, 1640, W - 120); }
  g.font = 'italic 800 76px "Barlow Condensed", sans-serif'; g.textAlign = "left";
  const w1 = g.measureText("L’AGENDA ").width, w2 = g.measureText("DU SPORTIF").width, x0 = (W - w1 - w2) / 2;
  g.fillStyle = "#F4F1EE"; g.fillText("L’AGENDA ", x0, 1800); g.fillStyle = red; g.fillText("DU SPORTIF", x0 + w1, 1800);
  return new Promise(r => cv.toBlob(r, "image/png"));
}
$("recapBody").addEventListener("click", async e => {
  if (!e.target.closest("#recapShare")) return;
  const btn = $("recapShare"); btn.disabled = true; btn.textContent = "Création de l’image…";
  try {
    const blob = await recapImage(), name = "bilan-" + MONTHS[S.recapMonth.getMonth()] + ".png", file = new File([blob], name, { type: "image/png" });
    const img = $("recapImg"); img.src = URL.createObjectURL(blob); img.hidden = false;
    if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: "Mon bilan du mois" }).catch(() => {}); $("recapMsg").textContent = "Tu peux aussi appuyer longuement sur l’image pour l’enregistrer."; }
    else { const a = document.createElement("a"); a.href = img.src; a.download = name; document.body.appendChild(a); a.click(); a.remove(); $("recapMsg").textContent = "Image téléchargée. Sur iPhone, appuie longuement sur l’image pour l’enregistrer."; }
  } catch (x) { $("recapMsg").textContent = "Impossible de créer l’image. Réessaie."; }
  btn.disabled = false; btn.textContent = "📲 Partager en story";
});

/* ============================================================
   Social : page d'accueil, activité, fil, commentaires, défis, classements
   ============================================================ */
const acceptedFriends = () => Object.values(SOC.friends).filter(f => f.status === "accepted").map(otherOf);
const seenAct = () => (S.profile && S.profile.seenAct) || 0;
// Réactions et commentaires des amis sur mes séances, du plus récent au plus ancien.
function activityList() {
  const r = SOC.myReacts.filter(x => x.from !== S.uid).map(x => ({ kind: "react", ...x }));
  const c = (SOC.myComments || []).filter(x => x.from !== S.uid).map(x => ({ kind: "comment", ...x }));
  return [...r, ...c].filter(x => x.at).sort((a, b) => b.at - a.at);
}
function sessLabel(k) { const s = S.days[k]; return s ? titleOf(s) : "ta séance"; }
function renderSocial() {
  const c = socialCounts(), act = activityList().slice(0, 8), seen = seenAct(), nf2 = acceptedFriends().length;
  const live = (SOC.challenges || []).filter(ch => ch.end >= todayK()).length, newCh = newChallenges().length;
  const em = id => (REACTS.find(r => r[0] === id) || [, "👍"])[1];
  $("socialBody").innerHTML = `<div class="menu">
      <button class="menu-card" data-go="feed"><span class="mark ok">≡</span><span class="mc"><b>Fil d’actu</b><span class="s">Les dernières séances de tes amis</span></span><span class="arrow" aria-hidden="true">›</span></button>
      <button class="menu-card${c.requests ? " hot" : ""}" data-go="friends"><span class="mark${c.requests ? " ok" : ""}">${nf2}</span><span class="mc"><b>Amis ${c.requests ? '<i class="dot-new"></i>' : ""}</b><span class="s">${c.requests ? plural(c.requests, "demande") + " d’ami en attente" : "Ajoute tes potes, vois leurs séances"}</span></span><span class="arrow" aria-hidden="true">›</span></button>
      <button class="menu-card${c.unread ? " hot" : ""}" data-go="messages"><span class="mark${c.unread ? " ok" : ""}">${c.unread || "✉"}</span><span class="mc"><b>Messages ${c.unread ? '<i class="dot-new"></i>' : ""}</b><span class="s">${c.unread ? plural(c.unread, "conversation") + " en attente de réponse" : "Tes conversations avec tes amis"}</span></span><span class="arrow" aria-hidden="true">›</span></button>
      <button class="menu-card${newCh ? " hot" : ""}" data-go="challenges"><span class="mark${live ? " ok" : ""}">${live}</span><span class="mc"><b>Défis ${newCh ? '<i class="dot-new"></i>' : ""}</b><span class="s">${newCh ? plural(newCh, "nouveau défi") + " pour toi !" : live ? plural(live, "défi") + " en cours" : "Qui fera le plus de séances ce mois-ci ?"}</span></span><span class="arrow" aria-hidden="true">›</span></button>
      <button class="menu-card" data-go="ranks"><span class="mark">🏆</span><span class="mc"><b>Classements</b><span class="s">Records et chiffres du mois entre amis</span></span><span class="arrow" aria-hidden="true">›</span></button>
    </div>
    <section><h2 class="h2">Activité sur tes séances</h2>
    ${act.length ? `<div class="card" style="gap:0;padding-block:4px">${act.map(a => { const w = who(a.from, 36); return `<button type="button" class="frow act${a.at > seen ? " new" : ""}" data-actk="${esc(a.date)}">${w.av}<span class="main"><b>${esc(w.d.pseudo !== "…" ? w.d.pseudo : a.pseudo || "Un ami")}</b><span>${a.kind === "react" ? "a réagi " + em(a.emoji) + " à " + esc(sessLabel(a.date)) : "a commenté : « " + esc(a.text) + " »"}</span></span><small>${esc(ago(a.at))}</small></button>`; }).join("")}</div>`
      : `<div class="empty">Quand tes amis réagiront ou commenteront tes séances, tu le verras ici.</div>`}</section>`;
  act.forEach(a => dirOf(a.from));
  if (act.length && act[0].at > seen) saveProfile({ seenAct: Date.now() });
}
$("socialBody").addEventListener("click", e => {
  const a = e.target.closest("[data-actk]"); if (!a) return;
  const k = a.dataset.actk; if (!S.days[k]) return;
  go("seances"); const d = parse(k); S.view = new Date(d.getFullYear(), d.getMonth(), 1); renderMain(); openDay(k);
});

// Défis où on m'a invité et que je n'ai pas encore ouverts.
function seenChs() { try { return JSON.parse(lsGet("ch-seen") || "[]"); } catch (e) { return []; } }
function newChallenges() { const seen = seenChs(); return (SOC.challenges || []).filter(ch => ch.owner !== S.uid && ch.end >= todayK() && !seen.includes(ch.id)); }
function markChallengesSeen() { const ids = (SOC.challenges || []).map(ch => ch.id); if (newChallenges().length) lsSet("ch-seen", JSON.stringify(ids.slice(-100))); }

/* ---------- Messages : toutes les conversations ---------- */
function renderMessages() {
  const F = Object.entries(SOC.friends).filter(([, f]) => f.status === "accepted");
  const last = pid => ((SOC.chats[pid] || {}).last || {}).at || 0;
  const withMsg = F.filter(([pid]) => last(pid)).sort((a, b) => (unreadOf(b[0]) - unreadOf(a[0])) || last(b[0]) - last(a[0])), without = F.filter(([pid]) => !last(pid));
  const row = ([pid, f]) => { const u = otherOf(f), w = who(u, 46), c = SOC.chats[pid], un = unreadOf(pid);
    return `<button type="button" class="conv${un ? " unread" : ""}" data-conv="${u}">${w.av}<span class="main"><b>${esc(w.d.pseudo)}</b><span>${c && c.last ? esc((c.last.from === S.uid ? "Toi : " : "") + c.last.text) : "Démarrer la conversation"}</span></span>${c && c.last ? `<small>${esc(ago(c.last.at))}</small>` : ""}${un ? '<i class="dot-new"></i>' : ""}</button>`; };
  $("msgsBody").innerHTML = !F.length ? `<div class="empty">Ajoute des amis pour pouvoir leur écrire.</div><button class="btn primary" data-go="friends">Ajouter des amis</button>`
    : `${withMsg.length ? `<div class="conv-list">${withMsg.map(row).join("")}</div>` : `<div class="empty">Pas encore de conversation. Choisis un ami ci-dessous pour lui écrire.</div>`}
       ${without.length ? `<section><h2 class="h2">Écrire à un ami</h2><div class="conv-list">${without.map(row).join("")}</div></section>` : ""}`;
}
$("msgsBody").addEventListener("click", e => { const b = e.target.closest("[data-conv]"); if (b) openChat(b.dataset.conv); });

/* ---------- Commentaires ---------- */
async function postComment(owner, k, text) {
  const data = { date: k, from: S.uid, pseudo: S.profile.pseudo, text: text.slice(0, 500), at: Date.now() };
  const ref = await addDoc(collection(db, "comments", owner, "items"), data);
  return { id: ref.id, owner, ...data };
}
function commentsHTML(list, owner, k, opt) {
  const o = opt || {}, all = list.filter(c => c.date === k).sort((a, b) => a.at - b.at), show = o.all ? all : all.slice(-2);
  return `<div class="comments" data-cowner="${owner}" data-ck="${esc(k)}">
    ${all.length > show.length ? `<button type="button" class="linkish c-more" data-callk="${esc(k)}">Voir les ${all.length} commentaires</button>` : ""}
    ${show.map(c => { const d = SOC.dir[c.from] || {}; return `<p class="cmt"><b>${esc(c.from === S.uid ? "Toi" : d.pseudo || c.pseudo || "Ami")}</b> ${esc(c.text)} <small>${esc(ago(c.at))}</small>${c.from === S.uid || owner === S.uid ? `<button type="button" class="c-del" data-cdel="${owner}|${c.id}" aria-label="Supprimer le commentaire">✕</button>` : ""}</p>`; }).join("")}
    <form class="c-form" data-cform="${owner}|${esc(k)}"><input placeholder="${owner === S.uid ? "Répondre…" : "Écrire un commentaire…"}" maxlength="500" aria-label="Commentaire"><button class="btn sm" type="submit">Envoyer</button></form>
  </div>`;
}
// Commentaires sur ma séance (dans la fiche du jour).
function myCommentsHTML(k) {
  const list = (SOC.myComments || []).filter(c => c.date === k);
  if (!list.length) return "";
  return `<div class="lbl">Commentaires de tes amis <em>${list.length}</em></div>${commentsHTML(SOC.myComments, S.uid, k, { all: true })}`;
}
// Envoi et suppression, partout dans l'app (fiche, fil, page d'un ami).
document.addEventListener("submit", async e => {
  const f = e.target.closest("[data-cform]"); if (!f) return;
  e.preventDefault();
  const inp = f.querySelector("input"), text = inp.value.trim(); if (!text) return;
  const [owner, k] = f.dataset.cform.split("|"); inp.value = ""; inp.disabled = true;
  try {
    const c = await postComment(owner, k, text);
    if (owner !== S.uid) { [SOC.feed && SOC.feed.by[owner], SOC.friendUid === owner && SOC.friendData].forEach(x => { if (x) (x.comments = x.comments || []).push(c); }); }
    SOC.openCmt = k; rerenderComments();
  } catch (x) { inp.value = text; toast("Commentaire non envoyé. Vérifie ta connexion."); }
  inp.disabled = false;
});
document.addEventListener("click", async e => {
  const m = e.target.closest("[data-callk]"); if (m) { SOC.openCmt = m.dataset.callk; rerenderComments(true); return; }
  const d = e.target.closest("[data-cdel]"); if (!d) return;
  if (!armed(d, "Supprimer ?")) return;
  const [owner, id] = d.dataset.cdel.split("|");
  try {
    await deleteDoc(doc(db, "comments", owner, "items", id));
    [SOC.feed && SOC.feed.by[owner], SOC.friendUid === owner && SOC.friendData].forEach(x => { if (x && x.comments) x.comments = x.comments.filter(c => c.id !== id); });
    rerenderComments();
  } catch (x) { toast("Suppression impossible."); }
});
function rerenderComments() {
  if (S.screen === "feed") renderFeed();
  if (S.screen === "friend") renderFriend();
  if (S.open) { const el = $("myComments"); if (el) el.innerHTML = myCommentsHTML(S.open); }
}

/* ---------- Fil d'actualité ---------- */
async function loadFeedFor(uid) {
  try {
    const ss = await getDocs(query(collection(db, "users", uid, "seances"), orderBy("updatedAt", "desc"), limit(8)));
    const days = ss.docs.map(d => ({ k: d.id, ...d.data() })).filter(s => !isEmpty(s)).sort((a, b) => a.k < b.k ? 1 : -1).slice(0, 6);
    const out = { days, reacts: [], comments: [], share: null };
    if (!days.length) return out;
    const oldest = dayOf(days[days.length - 1].k);
    const [rs, cs, sh] = await Promise.allSettled([
      getDocs(query(collection(db, "reacts", uid, "items"), where("date", ">=", oldest))),
      getDocs(query(collection(db, "comments", uid, "items"), where("date", ">=", oldest))),
      getDoc(doc(db, "share", uid))]);
    if (rs.status === "fulfilled") out.reacts = rs.value.docs.map(d => d.data());
    if (cs.status === "fulfilled") out.comments = cs.value.docs.map(d => ({ id: d.id, owner: uid, ...d.data() }));
    if (sh.status === "fulfilled" && sh.value.exists()) out.share = sh.value.data();
    return out;
  } catch (e) { return { days: [], reacts: [], comments: [], share: null, off: true }; }
}
async function loadFeed(force) {
  const F = SOC.feed;
  if (F && F.loading) return;
  if (F && !force && Date.now() - F.at < 180000) { renderFeed(); return; }
  SOC.feed = { ...(F || { by: {}, items: [] }), loading: true }; renderFeed();
  const uids = acceptedFriends(), res = await Promise.all(uids.map(loadFeedFor)), by = {};
  uids.forEach((u, i) => { by[u] = res[i]; dirOf(u); });
  SOC.feed = { by, at: Date.now(), loading: false };
  renderFeed();
}
function feedItems() {
  const F = SOC.feed, items = [];
  Object.entries((F && F.by) || {}).forEach(([uid, x]) => x.days.forEach(s => items.push({ uid, s })));
  Object.keys(S.days).sort().reverse().filter(k => !isEmpty(S.days[k])).slice(0, 6).forEach(k => items.push({ uid: S.uid, s: { k, ...S.days[k] } }));
  return items.sort((a, b) => a.s.k < b.s.k ? 1 : a.s.k > b.s.k ? -1 : (b.s.updatedAt || 0) - (a.s.updatedAt || 0));
}
function renderFeed() {
  const F = SOC.feed || { by: {} }, items = feedItems(), fr = acceptedFriends();
  const head = `<button class="btn" id="feedRefresh"${F.loading ? " disabled" : ""}>${F.loading ? "Chargement…" : "↻ Actualiser"}</button>`;
  if (!fr.length) { $("feedBody").innerHTML = `<div class="empty">Ajoute des amis pour voir leurs séances ici.</div><button class="btn primary" data-go="friends">Ajouter des amis</button>`; return; }
  $("feedBody").innerHTML = head + (items.length ? `<div class="list">${items.map(it => feedCard(it.uid, it.s, F.by[it.uid])).join("")}</div>`
    : F.loading ? "" : `<div class="empty">Pas encore de séance chez tes amis.</div>`);
}
function feedCard(uid, s, x) {
  const mine = uid === S.uid, w = who(uid, 40), types = !mine && x && x.share && Array.isArray(x.share.types) && x.share.types.length ? x.share.types : mine ? S.types : DEFAULT_TYPES;
  const mt = dayMeta(s, types), open = SOC.feedOpen === uid + "|" + s.k;
  const reacts = mine ? SOC.myReacts : (x && x.reacts) || [], comments = mine ? SOC.myComments || [] : (x && x.comments) || [];
  const rx = REACTS.map(([id, em]) => { const n = reacts.filter(r => r.date === s.k && r.emoji === id).length, me = reacts.some(r => r.date === s.k && r.emoji === id && r.from === S.uid);
    return mine ? (n ? `<span class="react">${em} ${n}</span>` : "") : `<button type="button" class="react${me ? " on" : ""}" data-freact="${uid}|${esc(s.k)}|${id}">${em}${n ? " " + n : ""}</button>`; }).join("");
  const d = parse(s.k);
  return `<article class="feed-card" style="--tc:${mt.color}">
    <header>${w.av}<span class="main"><b>${esc(mine ? "Toi" : w.d.pseudo)}</b><span>${esc(cap(DAYS[d.getDay()]))} ${d.getDate()} ${esc(MONTHS_S[d.getMonth()])} · ${esc(mt.name)}</span></span></header>
    <button type="button" class="fc-body" data-fopen2="${uid}|${esc(s.k)}"><b>${esc(titleOf(s, types))}</b><span>${esc(sessionSummary(s, types))}</span><span class="arrow" aria-hidden="true">${open ? "−" : "+"}</span></button>
    ${(s.prs || []).length ? `<div class="pr-badges">${s.prs.slice(0, 4).map(p => `<span class="pr-badge">🏆 ${esc(p)}</span>`).join("")}</div>` : ""}
    ${open ? friendSessionDetail(s, types) + (mine ? "" : `<button type="button" class="btn primary idea-go" data-ftry2="${uid}|${esc(s.k)}">Essayer cette séance</button>`) : ""}
    ${rx ? `<div class="reacts">${rx}</div>` : ""}
    ${commentsHTML(comments, uid, s.k, { all: SOC.openCmt === s.k })}
  </article>`;
}
$("feedBody").addEventListener("click", async e => {
  if (e.target.closest("#feedRefresh")) { loadFeed(true); return; }
  const o = e.target.closest("[data-fopen2]"); if (o) { SOC.feedOpen = SOC.feedOpen === o.dataset.fopen2 ? null : o.dataset.fopen2; renderFeed(); return; }
  const r = e.target.closest("[data-freact]");
  if (r) {
    const [uid, k, id] = r.dataset.freact.split("|"), x = SOC.feed.by[uid]; if (!x) return;
    await toggleReact(uid, k, id, x); renderFeed(); return;
  }
  const t = e.target.closest("[data-ftry2]");
  if (t) { const [uid, k] = t.dataset.ftry2.split("|"), x = SOC.feed.by[uid], s = x && x.days.find(d => d.k === k); if (s) trySession(t, uid, s, (x.share && x.share.types) || DEFAULT_TYPES); }
});
async function toggleReact(uid, k, id, holder) {
  const ref = doc(db, "reacts", uid, "items", k + "__" + S.uid), mine = holder.reacts.find(r => r.date === k && r.from === S.uid);
  try {
    if (mine && mine.emoji === id) { await deleteDoc(ref); holder.reacts = holder.reacts.filter(r => r !== mine); }
    else { const r = { date: k, from: S.uid, emoji: id, at: Date.now() }; await setDoc(ref, r); holder.reacts = holder.reacts.filter(x => x !== mine).concat(r); }
  } catch (x) { toast("Réaction impossible (connexion ?)"); }
}
function trySession(btn, uid, s, types) {
  const disc = discOf(s);
  tryIdea(btn, disc, c => {
    c.title = titleOf(s, types) + " · " + (SOC.dir[uid] || {}).pseudo;
    if (disc === "muscu" || disc === "calis") {
      if (disc === "muscu") c.typeId = S.types.some(x => x.id === s.typeId) ? s.typeId : null;
      c.exercises = (s.exercises || []).map(x => ({ name: x.name, hold: !!x.hold, rpe: 0, note: "", rest: restOf(x), ...cordesOf(x), sets: (x.sets || []).map(st => ({ reps: "", kg: "", target: st.reps !== "" && st.reps != null ? st.reps : (st.target ?? "") })) }));
    } else if (disc === "course") { c.runType = s.runType || null; c.run = { blocks: clone((s.run || {}).blocks || []) }; }
    else if (disc === "crossfit") { const w = s.wod || {}; Object.assign(c.wod, { name: w.name || "", format: w.format || "", cap: w.cap || "", moves: clone(w.moves || []), strength: w.strength || "" }); }
  });
}

/* ---------- Défis entre amis ---------- */
const METRICS = { seances: ["Séances", v => v > 1 ? "séances" : "séance", v => String(v)], jours: ["Jours actifs", v => v > 1 ? "jours" : "jour", v => String(v)], km: ["Km courus", () => "km", v => nf.format(v)], volume: ["Volume soulevé", () => "t", v => nf.format(Math.round(v / 100) / 10)] };
function myScore(ch) {
  const ks = Object.keys(S.days).filter(k => dayOf(k) >= ch.start && dayOf(k) <= ch.end && counts(S.days[k]));
  if (ch.metric === "seances") return ks.length;
  if (ch.metric === "jours") return new Set(ks.map(dayOf)).size;
  if (ch.metric === "km") return Math.round(ks.reduce((a, k) => a + runKm(S.days[k]), 0) * 10) / 10;
  return Math.round(ks.reduce((a, k) => a + dayVolume(S.days[k]), 0));
}
let chTimer = null;
function syncChallenges() {
  clearTimeout(chTimer);
  chTimer = setTimeout(() => (SOC.challenges || []).forEach(ch => {
    if (ch.end < key(addDays(new Date(), -2))) return;
    const v = myScore(ch);
    if ((ch.scores || {})[S.uid] !== v) updateDoc(doc(db, "challenges", ch.id), { ["scores." + S.uid]: v }).catch(() => {});
  }), 1500);
}
function subscribeChallenges() {
  S.unsubs.push(onSnapshot(query(collection(db, "challenges"), where("members", "array-contains", S.uid)), snap => {
    SOC.challenges = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => a.end < b.end ? 1 : -1);
    syncChallenges(); refreshSocial();
    if (S.screen === "challenges") renderChallenges();
    if (S.screen === "challenge") renderChallenge();
  }, () => {}));
  S.unsubs.push(onSnapshot(query(collection(db, "comments", S.uid, "items"), orderBy("at", "desc"), limit(100)), snap => {
    SOC.myComments = snap.docs.map(d => ({ id: d.id, owner: S.uid, ...d.data() }));
    SOC.myComments.forEach(c => dirOf(c.from));
    refreshSocial(); if (S.open) { const el = $("myComments"); if (el) el.innerHTML = myCommentsHTML(S.open); }
  }, () => {}));
}
const daysLeft = ch => Math.round((parse(ch.end) - parse(todayK())) / 864e5);
function ranking(ch) { return (ch.members || []).map(u => ({ u, v: (ch.scores || {})[u] || 0, name: u === S.uid ? "Toi" : (SOC.dir[u] || {}).pseudo || (ch.names || {})[u] || "Ami" })).sort((a, b) => b.v - a.v); }
function renderChallenges() {
  markChallengesSeen();
  const all = SOC.challenges || [], live = all.filter(c => c.end >= todayK()), done = all.filter(c => c.end < todayK()), fr = acceptedFriends(), NC = SOC.newCh;
  const card = ch => { const r = ranking(ch), me = r.findIndex(x => x.u === S.uid), m = METRICS[ch.metric] || METRICS.seances, dl = daysLeft(ch);
    return `<button class="menu-card" data-chopen="${ch.id}"><span class="mark${me === 0 ? " ok" : ""}">${me === 0 ? "🥇" : me + 1}</span><span class="mc"><b>${esc(ch.name)}</b><span class="s">${esc(m[0])} · ${r.length} participant${r.length > 1 ? "s" : ""} · ${dl > 0 ? dl + " jour" + (dl > 1 ? "s" : "") + " restant" + (dl > 1 ? "s" : "") : dl === 0 ? "dernier jour !" : "terminé"}</span></span><span class="arrow" aria-hidden="true">›</span></button>`; };
  $("chBody").innerHTML = `${NC ? `<form class="card" id="chForm" autocomplete="off">
      <div class="lbl">Nouveau défi</div>
      <div class="field"><span>Ce qu’on compte</span><div class="chips">${Object.entries(METRICS).map(([id, m]) => `<button type="button" class="chip" data-chm="${id}" style="--tc:var(--red)" aria-pressed="${NC.metric === id}">${m[0]}</button>`).join("")}</div></div>
      <div class="field"><span>Durée (à partir d’aujourd’hui)</span><div class="chips">${[[7, "1 semaine"], [14, "2 semaines"], [30, "1 mois"]].map(([d, n]) => `<button type="button" class="chip" data-chd="${d}" style="--tc:var(--red)" aria-pressed="${NC.days === d}">${n}</button>`).join("")}</div></div>
      <label class="field"><span>Nom du défi</span><input id="chName" maxlength="60" value="${esc(NC.name)}" placeholder="${esc(chPlaceholder(NC))}"></label>
      <div class="field"><span>Amis invités</span>${fr.length ? `<div class="chips">${fr.map(u => `<button type="button" class="chip" data-chf="${u}" style="--tc:var(--red)" aria-pressed="${NC.friends.includes(u)}">${esc((SOC.dir[u] || {}).pseudo || "…")}</button>`).join("")}</div>` : `<p class="hint">Ajoute d’abord des amis pour les défier.</p>`}</div>
      <p class="err" id="chErr" hidden></p>
      <div class="grid2"><button type="button" class="btn" data-chcancel="1">Annuler</button><button class="btn primary" type="submit">Lancer le défi</button></div>
    </form>` : `<button class="btn primary" data-chnew="1">+ Nouveau défi</button>`}
    <section><h2 class="h2">En cours</h2>${live.length ? `<div class="menu">${live.map(card).join("")}</div>` : `<div class="empty">Aucun défi en cours. Lance-en un contre tes amis : séances, km, volume…</div>`}</section>
    ${done.length ? `<section><h2 class="h2">Terminés</h2><div class="menu">${done.slice(0, 10).map(card).join("")}</div></section>` : ""}`;
}
function chPlaceholder(nc) { return { seances: "Le plus de séances", jours: "Le plus de jours actifs", km: "Le plus de km", volume: "Le plus gros volume" }[nc.metric] + (nc.days === 7 ? " de la semaine" : nc.days === 30 ? " du mois" : " en 2 semaines"); }
$("chBody").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  const NC = SOC.newCh;
  if (b.dataset.chnew) { SOC.newCh = { metric: "seances", days: 7, name: "", friends: [] }; renderChallenges(); return; }
  if (b.dataset.chcancel) { SOC.newCh = null; renderChallenges(); return; }
  if (NC && b.dataset.chm) { NC.name = $("chName").value; NC.metric = b.dataset.chm; renderChallenges(); return; }
  if (NC && b.dataset.chd) { NC.name = $("chName").value; NC.days = +b.dataset.chd; renderChallenges(); return; }
  if (NC && b.dataset.chf) { NC.name = $("chName").value; const u = b.dataset.chf; NC.friends = NC.friends.includes(u) ? NC.friends.filter(x => x !== u) : [...NC.friends, u]; renderChallenges(); return; }
  if (b.dataset.chopen) { SOC.chId = b.dataset.chopen; go("challenge"); }
});
$("chBody").addEventListener("submit", async e => {
  e.preventDefault(); const NC = SOC.newCh; if (!NC) return;
  if (!NC.friends.length) { show($("chErr"), "Invite au moins un ami."); return; }
  const members = [S.uid, ...NC.friends].slice(0, 20), names = {};
  members.forEach(u => { names[u] = u === S.uid ? S.profile.pseudo : (SOC.dir[u] || {}).pseudo || "Ami"; });
  const data = { name: ($("chName").value.trim() || chPlaceholder(NC)).slice(0, 60), metric: NC.metric, start: todayK(), end: key(addDays(new Date(), NC.days - 1)), owner: S.uid, members, names, scores: {}, at: Date.now() };
  data.scores[S.uid] = myScore(data);
  try { const ref = await addDoc(collection(db, "challenges"), data); SOC.newCh = null; SOC.chId = ref.id; toast("🏁 Défi lancé !"); go("challenge"); }
  catch (x) { show($("chErr"), "Impossible de créer le défi. Vérifie ta connexion."); }
});
function renderChallenge() {
  const ch = (SOC.challenges || []).find(c => c.id === SOC.chId); if (!ch) { $("chdBody").innerHTML = `<p class="hint">Chargement…</p>`; return; }
  const m = METRICS[ch.metric] || METRICS.seances, r = ranking(ch), max = Math.max(1, ...r.map(x => x.v)), dl = daysLeft(ch);
  $("chdTitle").textContent = ch.name;
  $("chdBody").innerHTML = `<p class="hint" style="margin-top:-10px">${esc(m[0])} · du ${esc(shortDate(ch.start))} au ${esc(shortDate(ch.end))} · ${dl > 0 ? dl + " jour" + (dl > 1 ? "s" : "") + " restant" + (dl > 1 ? "s" : "") : dl === 0 ? "dernier jour !" : "terminé"}</p>
    <section class="card"><div class="lbl">Classement</div>
      ${r.map((x, i) => `<div class="rank-row${x.u === S.uid ? " me" : ""}"><span class="rk">${["🥇", "🥈", "🥉"][i] || i + 1}</span><span class="main"><b>${esc(x.name)}</b><span class="track"><span class="fill" style="width:${x.v / max * 100}%"></span></span></span><b class="rv">${esc(m[2](x.v))} <small>${esc(m[1](x.v))}</small></b></div>`).join("")}
      <p class="hint">Les scores se mettent à jour quand chacun ouvre l’app.</p>
    </section>
    ${ch.owner === S.uid ? `<button class="danger" data-chdel="1">Supprimer le défi</button>` : `<button class="danger" data-chleave="1">Quitter le défi</button>`}`;
  (ch.members || []).forEach(u => { if (!SOC.dir[u] && u !== S.uid) dirOf(u).then(() => { if (S.screen === "challenge") renderChallenge(); }); });
}
$("chdBody").addEventListener("click", async e => {
  const b = e.target.closest("button"); if (!b) return;
  const ch = (SOC.challenges || []).find(c => c.id === SOC.chId); if (!ch) return;
  if (b.dataset.chdel) { if (!armed(b, "Toucher à nouveau pour supprimer")) return; await deleteDoc(doc(db, "challenges", ch.id)).catch(() => {}); go("challenges"); }
  if (b.dataset.chleave) { if (!armed(b, "Toucher à nouveau pour quitter")) return; await updateDoc(doc(db, "challenges", ch.id), { members: arrayRemove(S.uid) }).catch(() => {}); go("challenges"); }
});

/* ---------- Classements entre amis ---------- */
async function loadShares(force) {
  if (SOC.sharesLoading) return;
  if (!force && SOC.sharesAt && Date.now() - SOC.sharesAt < 180000) return;
  SOC.sharesLoading = true;
  const uids = acceptedFriends(), res = await Promise.allSettled(uids.map(u => getDoc(doc(db, "share", u))));
  SOC.shares = {}; uids.forEach((u, i) => { if (res[i].status === "fulfilled" && res[i].value.exists()) SOC.shares[u] = res[i].value.data(); dirOf(u); });
  SOC.sharesAt = Date.now(); SOC.sharesLoading = false;
  if (S.screen === "ranks") renderRanks();
}
// Meilleure série de chaque exercice (charge max, sinon reps max) : partagée avec les amis.
function bestLifts() {
  const m = {};
  Object.keys(S.days).forEach(k => (S.days[k].exercises || []).forEach(ex => {
    const n = String(ex.name || "").trim(); if (!n) return; const b = bestSets(ex.sets, doneSet); if (!b.reps) return;
    const id = exKey(n), cur = m[id] || { n, kg: 0, r: 0, c: 0 }; cur.c++;
    if (b.kg > cur.kg || (b.kg === cur.kg && (b.kg ? b.rk : b.reps) > cur.r)) { cur.kg = b.kg; cur.r = b.kg ? b.rk : b.reps; cur.n = n; }
    m[id] = cur;
  }));
  return Object.fromEntries(Object.entries(m).sort((a, b) => b[1].c - a[1].c).slice(0, 40).map(([id, v]) => [id, { n: v.n, kg: v.kg, r: v.r }]));
}
function monthShare() {
  const mk = todayK().slice(0, 7), ks = Object.keys(S.days).filter(k => k.startsWith(mk) && counts(S.days[k]));
  return { mk, seances: ks.length, jours: new Set(ks.map(dayOf)).size, km: Math.round(ks.reduce((a, k) => a + runKm(S.days[k]), 0) * 10) / 10, volume: Math.round(ks.reduce((a, k) => a + dayVolume(S.days[k]), 0)) };
}
function renderRanks() {
  loadShares();
  const tab = S.rankTab || "month", mk = todayK().slice(0, 7);
  const people = [{ u: S.uid, name: "Toi", sh: { month: monthShare(), best: bestLifts(), streak: streakInfo().n } }, ...Object.entries(SOC.shares || {}).map(([u, sh]) => ({ u, name: (SOC.dir[u] || {}).pseudo || sh.pseudo || "Ami", sh }))];
  const row = (x, i, val, unit) => `<div class="rank-row${x.u === S.uid ? " me" : ""}"><span class="rk">${["🥇", "🥈", "🥉"][i] || i + 1}</span>${avatarHTML(x.u === S.uid ? S.profile : SOC.dir[x.u] || { pseudo: x.name }, 32)}<span class="main"><b>${esc(x.name)}</b></span><b class="rv">${esc(val)}${unit ? ` <small>${esc(unit)}</small>` : ""}</b></div>`;
  let h = `<div class="tabs" role="tablist"><button type="button" role="tab" data-rtab="month" aria-selected="${tab === "month"}">Ce mois-ci</button><button type="button" role="tab" data-rtab="lifts" aria-selected="${tab === "lifts"}">Par exercice</button></div>`;
  if (!acceptedFriends().length) h += `<div class="empty">Ajoute des amis pour te comparer à eux.</div>`;
  else if (tab === "month") {
    const met = S.rankMet || "seances", mv = x => met === "streak" ? x.sh.streak || 0 : ((x.sh.month && x.sh.month.mk === mk) ? x.sh.month[met] || 0 : 0);
    const list = people.map(x => ({ ...x, v: mv(x) })).sort((a, b) => b.v - a.v);
    h += `<div class="chips">${[["seances", "Séances"], ["jours", "Jours actifs"], ["km", "Km"], ["volume", "Volume"], ["streak", "Série 🔥"]].map(([id, n]) => `<button type="button" class="chip" data-rmet="${id}" style="--tc:var(--red)" aria-pressed="${met === id}">${n}</button>`).join("")}</div>
      <section class="card">${list.map((x, i) => row(x, i, met === "volume" ? nf.format(Math.round(x.v / 100) / 10) : met === "km" ? nf.format(x.v) : String(x.v), { seances: x.v > 1 ? "séances" : "séance", jours: x.v > 1 ? "jours" : "jour", km: "km", volume: "t", streak: "sem." }[met])).join("")}</section>`;
  } else {
    const cnt = {}; people.forEach(x => Object.entries(x.sh.best || {}).forEach(([id, b]) => { cnt[id] = cnt[id] || { n: b.n, c: 0 }; cnt[id].c++; }));
    const exs = Object.entries(cnt).sort((a, b) => b[1].c - a[1].c || a[1].n.localeCompare(b[1].n)).slice(0, 14);
    const sel = S.rankEx && cnt[S.rankEx] ? S.rankEx : exs[0] && exs[0][0];
    if (!sel) h += `<div class="empty">Pas encore d’exercice noté avec des poids.</div>`;
    else {
      const list = people.filter(x => (x.sh.best || {})[sel]).map(x => ({ ...x, b: x.sh.best[sel] })).sort((a, b) => b.b.kg - a.b.kg || b.b.r - a.b.r);
      h += `<div class="chips">${exs.map(([id, v]) => `<button type="button" class="chip" data-rex="${esc(id)}" style="--tc:var(--red)" aria-pressed="${id === sel}">${esc(v.n)}</button>`).join("")}</div>
        <section class="card">${list.map((x, i) => row(x, i, x.b.kg ? nf.format(x.b.kg) + " kg × " + x.b.r : x.b.r + " reps", "")).join("")}
        <p class="hint">Meilleure série notée dans les séances (charge la plus lourde, puis le plus de répétitions).</p></section>`;
    }
  }
  if (SOC.sharesLoading) h += `<p class="hint">Chargement des amis…</p>`;
  $("ranksBody").innerHTML = h;
}
$("ranksBody").addEventListener("click", e => {
  const t = e.target.closest("[data-rtab]"); if (t) { S.rankTab = t.dataset.rtab; renderRanks(); return; }
  const m = e.target.closest("[data-rmet]"); if (m) { S.rankMet = m.dataset.rmet; renderRanks(); return; }
  const x = e.target.closest("[data-rex]"); if (x) { S.rankEx = x.dataset.rex; renderRanks(); }
});

/* ============================================================
   Carte musculaire
   ============================================================ */
// Séries par muscle sur une liste de séances : 1 par série pour les muscles principaux, 0,5 pour les secondaires.
function muscleLoad(ks) {
  const out = {};
  const add = (mu, v) => { if (!mu) return; mu.p.forEach(m => { out[m] = (out[m] || 0) + v; }); (mu.s || []).forEach(m => { out[m] = (out[m] || 0) + v / 2; }); };
  ks.forEach(k => {
    const s = S.days[k]; if (!s || isEmpty(s)) return;
    const disc = discOf(s);
    if (disc === "muscu" || disc === "calis") (s.exercises || []).forEach(ex => {
      const n = ex.kind === "cordes" ? Math.ceil((+ex.ropes || 0) / 2) : (ex.sets || []).filter(st => st.done === true || doneSet(st)).length; if (n) add(musclesOf(ex.name), n);
    });
    else if (disc === "crossfit") ((s.wod || {}).moves || []).forEach(m => { if (m.name) add(musclesOf(m.name), 2); });
    else if (disc === "course" && +((s.run || {}).dist)) add({ p: ["quadriceps", "mollets"], s: ["ischios", "fessiers"] }, 3);
  });
  return out;
}
// Formes du corps (moitié gauche : la droite est dessinée en miroir). [muscle, forme SVG]
const BODY = {
  front: {
    mid: [["", '<ellipse cx="60" cy="18" rx="11" ry="13"/>'], ["", '<path d="M54 29h12v8H54z"/>'], ["trapezes", '<path d="M52 35q8-2 16 0l10 7q-18-3-36 0z"/>'],
      ["abdos", '<rect x="50" y="65" width="20" height="38" rx="5"/>'], ["", '<path d="M44 104h32l1 12-17 8-17-8z"/>']],
    side: [["epaules", '<ellipse cx="36" cy="49" rx="9" ry="9"/>'], ["pecs", '<path d="M44 43q8-2 15 0v19q-9 4-16-1-3-9 1-18z"/>'],
      ["biceps", '<ellipse cx="31" cy="66" rx="6" ry="12"/>'], ["avantbras", '<ellipse cx="27" cy="91" rx="5.5" ry="13"/>'], ["", '<circle cx="25" cy="110" r="5"/>'],
      ["obliques", '<path d="M43 64q4 2 6 4v34q-5-2-7-10z"/>'], ["quadriceps", '<path d="M43 118q9 4 15 8l-2 42q-8 4-12-2-5-26-1-48z"/>'],
      ["", '<circle cx="50" cy="175" r="5"/>'], ["mollets", '<ellipse cx="49" cy="200" rx="6" ry="19"/>'], ["", '<ellipse cx="48" cy="225" rx="7" ry="4"/>']]
  },
  back: {
    mid: [["", '<ellipse cx="60" cy="18" rx="11" ry="13"/>'], ["", '<path d="M54 29h12v6H54z"/>'], ["trapezes", '<path d="M50 33q10-3 20 0l10 10-12 17-8 4-8-4-12-17z"/>'],
      ["lombaires", '<path d="M53 88h14l1 16H52z"/>']],
    side: [["epaules", '<ellipse cx="36" cy="49" rx="9" ry="9"/>'], ["dorsaux", '<path d="M42 50l10 10 6 8-2 24q-8-4-12-14-4-14-2-28z"/>'],
      ["triceps", '<ellipse cx="31" cy="66" rx="6" ry="12"/>'], ["avantbras", '<ellipse cx="27" cy="91" rx="5.5" ry="13"/>'], ["", '<circle cx="25" cy="110" r="5"/>'],
      ["fessiers", '<path d="M44 105q8-2 15 2v17q-9 4-15-2z"/>'], ["ischios", '<path d="M44 126q8 4 14 4l-2 38q-8 4-11-2-4-20-1-40z"/>'],
      ["", '<circle cx="50" cy="175" r="5"/>'], ["mollets", '<ellipse cx="49" cy="198" rx="7" ry="17"/>'], ["", '<ellipse cx="48" cy="225" rx="7" ry="4"/>']]
  }
};
const BACK_ONLY = ["dorsaux", "lombaires", "triceps", "fessiers", "ischios"];
function bodySVG(view, lv, opt) {
  const b = BODY[view], o = opt || {};
  const shape = ([m, d]) => {
    const l = m ? (lv[m] || 0) : -1;
    return d.replace(/^<(\w+)/, `<$1 class="mu l${l}"${m && o.tap ? ` data-mu="${m}"` : ""}`);
  };
  return `<svg viewBox="0 0 120 232" class="body${o.cls ? " " + o.cls : ""}" role="img" aria-label="${view === "front" ? "Vue de face" : "Vue de dos"}">
    ${b.mid.map(shape).join("")}${b.side.map(shape).join("")}<g transform="translate(120 0) scale(-1 1)">${b.side.map(shape).join("")}</g></svg>`;
}
// Petite silhouette pour la bibliothèque : muscles principaux en couleur, secondaires en clair.
function muscleMini(p, s) {
  const lv = {}; (s || []).forEach(m => { lv[m] = 1; }); (p || []).forEach(m => { lv[m] = 4; });
  const view = (p || []).some(m => BACK_ONLY.includes(m)) ? "back" : "front";
  return bodySVG(view, lv, { cls: "mini" });
}
const LOAD_LEVELS = [[0, "Pas travaillé"], [1, "Un peu"], [2, "Bien"], [3, "Beaucoup"], [4, "Énormément"]];
function levelOf(v, days) { const f = days > 7 ? 3 : 1; return v <= 0 ? 0 : v < 4 * f ? 1 : v < 8 * f ? 2 : v < 14 * f ? 3 : 4; }
function renderMuscles() {
  const days = S.musDays || 7, from = key(addDays(new Date(), -(days - 1)));
  const ks = Object.keys(S.days).filter(k => dayOf(k) >= from), load = muscleLoad(ks), lv = {};
  Object.keys(MUSCLES).forEach(m => { lv[m] = levelOf(load[m] || 0, days); });
  const rows = Object.keys(MUSCLES).map(m => [m, Math.round((load[m] || 0) * 2) / 2]).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...rows.map(r => r[1])), rest = rows.filter(r => !r[1]).map(r => MUSCLES[r[0]]);
  $("musBody").innerHTML = `<div class="chips">${[[7, "7 derniers jours"], [30, "30 derniers jours"]].map(([d, n]) => `<button type="button" class="chip" data-mdays="${d}" style="--tc:var(--red)" aria-pressed="${d === days}">${n}</button>`).join("")}</div>
    <section class="card mus-card">
      <div class="bodies"><figure>${bodySVG("front", lv, { tap: 1 })}<figcaption>Face</figcaption></figure><figure>${bodySVG("back", lv, { tap: 1 })}<figcaption>Dos</figcaption></figure></div>
      <p class="mus-tip" id="musTip">Touche un muscle pour voir son nombre de séries.</p>
      <div class="mus-legend">${LOAD_LEVELS.map(([l, n]) => `<span><i class="mu l${l}"></i>${n}</span>`).join("")}</div>
    </section>
    ${ks.length ? "" : `<div class="empty">Aucune séance sur cette période : tes muscles s’allumeront au fil de tes séances.</div>`}
    ${rest.length && ks.length ? `<section class="card"><div class="lbl">À travailler</div><p style="margin:0">${esc(rest.join(", "))}</p><p class="hint">Aucune série pour ces muscles sur les ${days} derniers jours.</p></section>` : ""}
    <section><h2 class="h2">Séries par muscle</h2><div class="card"><div class="bars">${rows.map(([m, v]) => `<div class="barrow"><span>${esc(MUSCLES[m])}</span><span class="track"><span class="fill" style="width:${v / max * 100}%;--tc:var(--red-hi)"></span></span><b>${nf.format(v)}</b></div>`).join("")}</div>
      <p class="hint">Une série compte pour 1 sur les muscles principaux de l’exercice et 0,5 sur les muscles qui aident.</p></div></section>`;
  S.musLoad = load;
}
$("musBody").addEventListener("click", e => {
  const d = e.target.closest("[data-mdays]"); if (d) { S.musDays = +d.dataset.mdays; renderMuscles(); return; }
  const m = e.target.closest("[data-mu]"); if (!m) return;
  const mu = m.dataset.mu, v = Math.round(((S.musLoad || {})[mu] || 0) * 2) / 2;
  $("musTip").innerHTML = `<b>${esc(MUSCLES[mu])}</b> · ${nf.format(v)} série${v > 1 ? "s" : ""} sur les ${S.musDays || 7} derniers jours`;
  document.querySelectorAll("#musBody .mu.on").forEach(x => x.classList.remove("on"));
  document.querySelectorAll(`#musBody [data-mu="${mu}"]`).forEach(x => x.classList.add("on"));
});

/* ============================================================
   Mini tutoriel (passable) et annonce de la mise à jour
   ============================================================ */
const TUTO = [
  ["👋", "Bienvenue !", "Ton carnet d’entraînement : musculation, CrossFit, callisthénie et course à pied, au même endroit."],
  ["▶", "Let’s go", "Lance ta séance, une routine ou un programme. Tes poids de la dernière fois sont déjà remplis : tu n’as plus qu’à battre ton record."],
  ["🏆", "Valide tes séries", "Touche « Série finie » : le minuteur de repos démarre tout seul, et l’app te prévient dès que tu bats un record."],
  ["🔥", "Garde ta série", "Choisis ton objectif de séances par semaine sur l’accueil. Chaque semaine réussie fait grandir ta série."],
  ["👥", "Social", "Ajoute tes amis, suis leurs séances dans le fil d’actu, commente, et lance des défis entre potes."]
];
let tutoI = 0;
function openTuto() { tutoI = 0; renderTuto(); $("tuto").hidden = false; document.body.classList.add("sheet-open"); }
function closeTuto() {
  $("tuto").hidden = true; if (!$("sheet").classList.contains("open")) document.body.classList.remove("sheet-open");
  lsSet("seen-tuto", 1); if (S.profile) saveProfile({ seen: { ...(S.profile.seen || {}), tuto: true } });
}
function renderTuto() {
  const [ico, t, d] = TUTO[tutoI], last = tutoI === TUTO.length - 1;
  $("tutoBody").innerHTML = `<span class="tuto-ico" aria-hidden="true">${ico}</span><h2>${esc(t)}</h2><p>${esc(d)}</p>`;
  $("tutoDots").innerHTML = TUTO.map((_, i) => `<i class="${i === tutoI ? "on" : ""}"></i>`).join("");
  $("tutoNext").textContent = last ? "C’est parti !" : "Suivant";
  $("tutoPrev").style.visibility = tutoI ? "visible" : "hidden";
}
$("tutoNext").onclick = () => { if (tutoI === TUTO.length - 1) closeTuto(); else { tutoI++; renderTuto(); } };
$("tutoPrev").onclick = () => { if (tutoI) { tutoI--; renderTuto(); } };
$("tutoSkip").onclick = closeTuto;
$("tutoAgain").onclick = openTuto;
// Hors connexion : petit bandeau discret sur tous les écrans (les données restent enregistrées sur le téléphone).
function netState() { $("offlinePill").hidden = navigator.onLine; if (S.screen === "home") $("mode").textContent = ""; }
window.addEventListener("online", () => { netState(); if (S.screen === "feed") loadFeed(true); });
window.addEventListener("offline", netState);
netState();
let tx0 = null;
$("tuto").addEventListener("touchstart", e => { tx0 = e.touches[0].clientX; }, { passive: true });
$("tuto").addEventListener("touchend", e => {
  if (tx0 == null) return; const dx = e.changedTouches[0].clientX - tx0; tx0 = null;
  if (dx < -50 && tutoI < TUTO.length - 1) { tutoI++; renderTuto(); } else if (dx > 50 && tutoI) { tutoI--; renderTuto(); }
});

/* ============================================================
   Abonnements temps réel et démarrage
   ============================================================ */
function stopSubscriptions() { S.unsubs.forEach(u => { try { u(); } catch (e) { /* déjà arrêté */ } }); S.unsubs = []; S.dataSubscribed = false; }
function subscribeData() {
  if (S.dataSubscribed) return; S.dataSubscribed = true;
  S.unsubs.push(onSnapshot(subCol("seances"), snap => {
    const d = {}; snap.docs.forEach(x => { d[x.id] = x.data(); });
    if (S.open && S.cur) { if (isEmpty(S.cur)) delete d[S.open]; else d[S.open] = clone(S.cur); }
    S.days = d; refresh(); syncStats();
  }, () => {}));
  S.unsubs.push(onSnapshot(subCol("nutrition"), snap => {
    const d = {}; snap.docs.forEach(x => { d[x.id] = x.data(); }); S.nut = d; refresh();
  }, () => {}));
}
function subscribeAdmin() {
  S.unsubs.push(onSnapshot(collection(db, "users"), snap => {
    const d = {}; snap.docs.forEach(x => { d[x.id] = { id: x.id, ...x.data() }; }); S.members = d;
    if (S.screen === "admin") renderAdmin();
  }, () => {}));
  S.unsubs.push(onSnapshot(query(collection(db, "messages"), orderBy("at", "desc")), snap => {
    S.messages = snap.docs.map(x => ({ id: x.id, ...x.data() }));
    if (S.screen === "admin") renderAdmin();
  }, () => {}));
  S.unsubs.push(onSnapshot(query(collection(db, "reports"), orderBy("at", "desc")), snap => {
    S.reports = snap.docs.map(x => ({ id: x.id, ...x.data() }));
    if (S.screen === "admin") renderAdmin();
  }, () => {}));
}
function resetState() {
  Object.assign(S, { uid: null, email: "", admin: false, profile: null, days: {}, nut: {}, members: {}, messages: [], myMsgs: [], photoCache: {}, visitCounted: false, prefs: { creaDose: 5 } });
  S.types = DEFAULT_TYPES.map(t => ({ ...t }));
  const f = $("suFields"); if (f) f.innerHTML = "";
  resetSocial();
}

onAuthStateChanged(auth, async user => {
  window.__appBooted = true; const rescue = document.getElementById("rescue"); if (rescue) rescue.remove();
  stopSubscriptions();
  if (!user) { resetState(); setAuthMode("in"); go("login"); return; }
  S.uid = user.uid; S.email = user.email || "";
  go("splash");
  try { S.admin = (await getDoc(doc(db, "admins", user.uid))).exists(); } catch (e) { S.admin = false; }
  if (S.admin) subscribeAdmin();
  let first = true;
  S.unsubs.push(onSnapshot(userRef(), snap => {
    const had = !!S.profile;
    S.profile = snap.exists() && snap.data().pseudo ? snap.data() : null;
    applyProfile();
    if (first) {
      first = false;
      if (S.profile) {
        subscribeData(); ensureSocialProfile(); subscribeSocial();
        if (!S.visitCounted) { S.visitCounted = true; saveProfile({ visits: (S.profile.visits || 0) + 1, lastSeen: Date.now(), email: S.email }); }
        go("home");
      } else go("onboard");
    } else if (!S.profile && had) go("onboard");
    else if (S.screen === "home") renderHome();
    else if (S.screen === "profile" && !$("pfView").hidden) renderPfView();
  }, err => {
    console.error("profil", err && err.code, err && err.message);
    go("login"); show($("auErr"), "Impossible de charger ton compte. Vérifie ta connexion puis réessaie.");
  }));
});

/* Installation hors ligne (PWA) */
if ("serviceWorker" in navigator && !LOCAL) navigator.serviceWorker.register("sw.js").catch(() => {});
