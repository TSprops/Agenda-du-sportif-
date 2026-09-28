import {
  initializeApp, getAuth, connectAuthEmulator, onAuthStateChanged, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut, sendPasswordResetEmail, deleteUser, reauthenticateWithCredential, EmailAuthProvider,
  initializeFirestore, connectFirestoreEmulator, persistentLocalCache, persistentMultipleTabManager,
  doc, collection, getDoc, getDocs, setDoc, updateDoc, deleteDoc, addDoc, onSnapshot, query, where, orderBy, writeBatch
} from "./vendor/firebase.js";
import { firebaseConfig } from "./firebase-config.js";

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
const parse = k => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
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
  muscu: { name: "Musculation", color: "#FF2B34", desc: "Push, pull, jambes… séries, reps et charges",
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
  }, 1500);
}

/* ============================================================
   Navigation
   ============================================================ */
const RENDER = {
  home: renderHome, seances: renderMain, nutrition: renderNutrition, complements: renderNutrition, creatine: renderNutrition,
  contact: renderContact, profile: renderProfile, admin: renderAdmin, onboard: renderOnboard, crossfit: renderCrossfit
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
  if (v === "home") maybeInvite();
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
      typesV: TYPES_V, types: DEFAULT_TYPES.map(t => ({ ...t })), prefs: { creaDose: 5 }
    });
    S.visitCounted = true;
    subscribeData(); go("home");
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
  renderPfView(); refreshInstallBtn();
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
  saveProfile(f).then(() => renderPfView("Profil enregistré.")).catch(() => show($("pfMsg"), "Échec de l’enregistrement. Vérifie ta connexion et réessaie."))
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
    const k = key(new Date(y, m, d)), s = S.days[k], mt = s && dayMeta(s);
    h += `<button class="day${s ? " has" : ""}${k === tk ? " today" : ""}" data-k="${k}" style="--tc:${mt ? mt.color : "#8A847E"}" aria-label="${d} ${MONTHS[m]}${s ? ", " + esc(titleOf(s)) : ""}"><span class="n">${d}</span>${s ? `<span class="t">${esc(mt.short)}</span>` : ""}</button>`;
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
function exHTML(ex, i, disc) {
  const r = ex.rpe || 0, calis = disc === "calis";
  const col1 = calis ? (ex.hold ? "Tenue (s)" : "Reps") : "Reps", col2 = calis ? "Lest (kg)" : "Poids (kg)";
  return `<article class="ex">
  <div class="ex-head"><span class="ex-num">${pad(i + 1)}</span><input id="exn-${i}" class="ex-name" data-f="ex-name" data-ex="${i}" placeholder="${calis ? "ex. Tractions" : "Nom de l’exercice"}" value="${esc(ex.name)}" autocomplete="off">${calis ? `<button class="icon-btn" data-a="hold" data-ex="${i}" aria-label="Changer répétitions ou tenue">${ex.hold ? "Tenue" : "Reps"} ⇄</button>` : ""}<button class="icon-btn" data-a="del-ex" data-ex="${i}" aria-label="Supprimer l’exercice">Retirer</button></div>
  <div class="ex-stats" id="st-${i}">${exStats(ex, disc)}</div>
  <table class="sets"><thead><tr><th style="text-align:center">Série</th><th>${col1}</th><th>${col2}</th><th></th></tr></thead><tbody>
  ${(ex.sets || []).map((s, j) => `<tr><td class="n">${j + 1}</td><td><input id="r-${i}-${j}" class="num" inputmode="numeric" data-f="reps" data-ex="${i}" data-s="${j}" value="${esc(s.reps)}" placeholder="–" aria-label="${col1} série ${j + 1}"></td><td><input id="k-${i}-${j}" class="num" inputmode="decimal" data-f="kg" data-ex="${i}" data-s="${j}" value="${esc(s.kg)}" placeholder="${calis ? "0" : "–"}" aria-label="${col2} série ${j + 1}"></td><td class="x"><button class="icon-btn" data-a="del-set" data-ex="${i}" data-s="${j}" aria-label="Supprimer la série ${j + 1}">−</button></td></tr>`).join("")}
  </tbody></table>
  <button class="add-set" data-a="add-set" data-ex="${i}">+ Ajouter une série</button>
  <div class="rest-row"><div class="lbl">Repos entre les séries</div><div class="rest-ctl"><button class="step" data-a="rest-dec" data-ex="${i}" aria-label="Moins de repos">−</button><span class="rest-val" id="rv-${i}">${fmtRest(restOf(ex))}</span><button class="step" data-a="rest-inc" data-ex="${i}" aria-label="Plus de repos">+</button><button class="rest-go" data-a="rest-go" data-ex="${i}">⏱ Lancer</button></div></div>
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
    ${(c.exercises || []).map((ex, i) => exHTML(ex, i, "muscu")).join("")}
    <button class="add-ex" data-a="add-ex">+ Ajouter un exercice</button>`;
}
function calisHTML(c, k) {
  const last = !(c.exercises || []).length ? lastComparable(c, k) : null;
  return `<section><div class="lbl" style="margin-bottom:8px">Ajout rapide</div>
    <div class="chips">${CALIS_MOVES.map(([n, hold]) => `<button class="chip" data-a="calis-add" data-name="${esc(n)}" data-hold="${hold ? 1 : ""}">+ ${esc(n)}</button>`).join("")}</div></section>
    ${last ? `<button class="suggest" data-a="copy" data-k="${last}"><span style="flex:1"><b>Reprendre ta dernière séance</b><span>${parse(last).getDate()} ${MONTHS[parse(last).getMonth()]} · ${(S.days[last].exercises || []).length} exercices</span></span><span aria-hidden="true">›</span></button>` : ""}
    ${(c.exercises || []).map((ex, i) => exHTML(ex, i, "calis")).join("")}
    <button class="add-ex" data-a="add-ex">+ Ajouter un exercice libre</button>`;
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
  if (!disc) body = `<p class="eyebrow">${dateTxt}</p>${choiceHTML()}`;
  else {
    const specific = disc === "muscu" ? muscuHTML(c, k) : disc === "calis" ? calisHTML(c, k) : disc === "course" ? courseHTML(c) : crossfitHTML(c);
    const ph = disc === "muscu" && mt && typeOf(c.typeId) ? mt.name : disc === "course" && c.runType ? mt.name : disc === "crossfit" ? "WOD du jour" : DISC[disc].name;
    body = `<div class="disc-line"><p class="eyebrow">${dateTxt} · ${DISC[disc].name}</p><button class="linkish" data-a="change-disc">Changer d’activité</button></div>
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
    ${isEmpty(c) ? "" : `<button class="danger" data-a="del-session">Supprimer la séance</button>`}`;
  }
  el.innerHTML = `<div class="bar-top"><button class="link" data-a="close">‹ Calendrier</button><span class="save" id="saveState">${esc(S.saveMsg || "")}</span></div>
  <div class="sheet-body" style="--tc:${mt ? mt.color : "#FF2B34"}">${body}</div>`;
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
  else { const data = { ...clone(c), updatedAt: Date.now() }; S.days[k] = data; persistDay(k, data); }
}
const intOr = v => { const n = parseInt(String(v), 10); return isFinite(n) ? n : ""; };
$("sheet").addEventListener("input", e => {
  const f = e.target.dataset.f; if (!f || !S.cur || f === "photo") return;
  const c = S.cur, i = +e.target.dataset.ex, j = +e.target.dataset.s, v = e.target.value, t = v.trim();
  if (f === "title") c.title = v; else if (f === "note") c.note = v;
  else if (f === "ex-name") c.exercises[i].name = v; else if (f === "ex-note") c.exercises[i].note = v;
  else if (f === "reps" || f === "kg") { c.exercises[i].sets[j][f] = t === "" ? "" : numOr(v); $("st-" + i).textContent = exStats(c.exercises[i], c.disc); }
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
  else if (a === "add-ex") {
    c.exercises.push({ name: "", sets: [{ reps: "", kg: "" }, { reps: "", kg: "" }, { reps: "", kg: "" }], rpe: 0, note: "", rest: 90 });
    changed(); renderSheet(); const n = $("exn-" + (c.exercises.length - 1)); n && n.focus(); return;
  }
  else if (a === "calis-add") {
    c.exercises.push({ name: b.dataset.name, hold: !!b.dataset.hold, sets: [{ reps: "", kg: "" }, { reps: "", kg: "" }, { reps: "", kg: "" }], rpe: 0, note: "", rest: 90 });
  }
  else if (a === "hold") { c.exercises[i].hold = !c.exercises[i].hold; }
  else if (a === "del-ex") { if (!armed(b, "Confirmer")) return; c.exercises.splice(i, 1); }
  else if (a === "add-set") { const s = c.exercises[i].sets, l = s[s.length - 1]; s.push(l ? { reps: l.reps, kg: l.kg } : { reps: "", kg: "" }); }
  else if (a === "del-set") { c.exercises[i].sets.splice(+b.dataset.s, 1); }
  else if (a === "photo") { openViewer(+b.dataset.i); return; }
  else if (a === "rest-inc" || a === "rest-dec") {
    const ex = c.exercises[i], v = Math.min(600, Math.max(0, restOf(ex) + (a === "rest-inc" ? 15 : -15)));
    ex.rest = v; $("rv-" + i).textContent = fmtRest(v); changed(); return;
  }
  else if (a === "rest-go") { startRest(restOf(c.exercises[i]), c.exercises[i].name); return; }
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
    c.exercises = clone(src.exercises || []).map(x => ({ name: x.name, hold: !!x.hold, sets: (x.sets || []).map(s => ({ reps: s.reps, kg: s.kg })), rpe: 0, note: "", rest: restOf(x) }));
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
      const ref = await addDoc(subCol("photos"), { data, date: k, createdAt: Date.now() });
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
$("grid").addEventListener("click", e => { const b = e.target.closest("[data-k]"); b && openDay(b.dataset.k); });
$("list").addEventListener("click", e => { const b = e.target.closest("[data-k]"); b && openDay(b.dataset.k); });
$("prev").onclick = () => { S.view = new Date(S.view.getFullYear(), S.view.getMonth() - 1, 1); renderMain(); };
$("next").onclick = () => { S.view = new Date(S.view.getFullYear(), S.view.getMonth() + 1, 1); renderMain(); };
$("today").onclick = () => { const t = new Date(); S.view = new Date(t.getFullYear(), t.getMonth(), 1); renderMain(); openDay(key(t)); };
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
function renderHome() {
  const t = new Date(), tk = key(t);
  $("homeDate").innerHTML = `<span>${cap(DAYS[t.getDay()])}</span>${t.getDate()} ${MONTHS[t.getMonth()]} ${t.getFullYear()}`;
  $("homeAvatar").innerHTML = avatarHTML(S.profile, 34);
  const mon = new Date(t.getFullYear(), t.getMonth(), t.getDate() - ((t.getDay() + 6) % 7));
  let h = "", cnt = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + i), k = key(d), s = S.days[k], ty = s && dayMeta(s);
    if (s) cnt++;
    h += `<span class="${s ? "on" : ""}${k === tk ? " now" : ""}" style="--tc:${ty ? ty.color : "#8A847E"}">${"LMMJVSD"[i]}</span>`;
  }
  $("homeWeek").innerHTML = h;
  $("homeSeancesSub").textContent = cnt ? `${cnt} séance${cnt > 1 ? "s" : ""} cette semaine` : "Aucune séance cette semaine pour l’instant";
  const n = nutOf(tk), c = (n.complements || []).length;
  $("homeNut").innerHTML = `<span class="pill${n.creatine ? " ok" : ""}">${n.creatine ? "✓ Créatine prise" : "Créatine à prendre"}</span><span class="pill${c ? " ok" : ""}">${c} complément${c > 1 ? "s" : ""} aujourd’hui</span>`;
  const cfm = Object.keys(S.days).filter(k => k.startsWith(tk.slice(0, 7)) && discOf(S.days[k]) === "crossfit").length;
  const cfd = cfData(), prs = Object.values(cfd.prs).filter(l => l.length).length;
  $("homeCf").innerHTML = `<span class="pill${cfm ? " ok cf" : ""}">${cfm} WOD ce mois</span><span class="pill${prs ? " ok cf" : ""}">${prs} record${prs > 1 ? "s" : ""}</span>`;
  $("mode").textContent = navigator.onLine ? "" : "Hors connexion : tes modifications seront envoyées au retour du réseau.";
}

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
  <section><h2 class="h2">Messages reçus · ${unread} non lu${unread > 1 ? "s" : ""}</h2><div class="card" style="gap:0;padding-block:4px">${msgs.length ? msgs.map(m => `<div class="msg"><div class="msg-top"><span class="tag${m.lu ? " done" : ""}">${esc(m.objet)}</span><b>${esc(m.pseudo || "Utilisateur")}</b><small>${esc(fmtDate(m.at))}</small></div><p>${esc(m.texte)}</p>${m.email ? `<small>Répondre à : <span style="user-select:all;color:var(--ink)">${esc(m.email)}</span></small>` : ""}<button class="icon-btn" style="align-self:flex-start" data-mid="${esc(m.id)}">${m.lu ? "Marquer non lu" : "Marquer comme lu"}</button></div>`).join("") : `<p class="hint" style="padding-block:12px">Aucun message pour l’instant.</p>`}</div></section>
  </div>`;
}
$("adminBody").addEventListener("click", e => {
  const u = e.target.closest("[data-uid]"); if (u) { openUser(u.dataset.uid); return; }
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
  const cf = cfData(), tk = todayK(), ym = tk.slice(0, 7);
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
    const ents = benchEntries(bm), best = ents.slice().sort((a, b) => benchValue(bm, b) - benchValue(bm, a))[0], open = S.cfOpen === "bm:" + bm.id;
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
        <button class="add-set" data-bmwod="${bm.id}">Faire ce WOD aujourd’hui ›</button>` : ""}
    </div>`;
  }).join("");
}
$("cfToday").onclick = () => { go("seances"); openDay(todayK(), "crossfit"); };
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
    const bm = BENCH.find(x => x.id === bw.dataset.bmwod), k = todayK();
    go("seances");
    if (S.days[k]) { openDay(k); return; }
    openDay(k, "crossfit");
    Object.assign(S.cur.wod, { name: bm.name, format: bm.type === "amrap" ? "AMRAP" : "For Time", cap: bm.cap || "", moves: clone(bm.moves) });
    changed(); renderSheet();
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
   Minuteur de repos
   ============================================================ */
const RT = { end: 0, total: 0, tick: null, ctx: null };
function beep() {
  try {
    const ctx = RT.ctx; if (!ctx) return;
    [0, .25, .5].forEach(t => {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = 880; o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(.001, ctx.currentTime + t); g.gain.exponentialRampToValueAtTime(.3, ctx.currentTime + t + .02);
      g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + t + .18); o.start(ctx.currentTime + t); o.stop(ctx.currentTime + t + .2);
    });
  } catch (e) { /* son indisponible */ }
}
function startRest(seconds, name) {
  if (!seconds) seconds = 90;
  try { RT.ctx = RT.ctx || new (window.AudioContext || window.webkitAudioContext)(); RT.ctx.resume && RT.ctx.resume(); } catch (e) { RT.ctx = null; }
  RT.total = seconds; RT.end = Date.now() + seconds * 1000;
  $("rtLbl").textContent = name ? "Repos · " + name : "Repos";
  $("restTimer").classList.remove("done"); $("restTimer").hidden = false; $("rtSkip").textContent = "Passer";
  clearInterval(RT.tick); RT.tick = setInterval(drawRest, 250); drawRest();
}
function drawRest() {
  const left = Math.max(0, Math.round((RT.end - Date.now()) / 1000));
  $("rtTime").textContent = Math.floor(left / 60) + ":" + pad(left % 60);
  $("rtFill").style.width = (RT.total ? left / RT.total * 100 : 0) + "%";
  if (left <= 0) {
    clearInterval(RT.tick); RT.tick = null;
    $("restTimer").classList.add("done"); $("rtLbl").textContent = "C’est reparti !"; $("rtTime").textContent = "0:00"; $("rtSkip").textContent = "OK";
    beep(); if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    setTimeout(() => { if (!RT.tick) $("restTimer").hidden = true; }, 6000);
  }
}
$("rtPlus").onclick = () => { if (RT.tick) { RT.end += 15000; RT.total += 15; drawRest(); } else startRest(15); };
$("rtSkip").onclick = () => { clearInterval(RT.tick); RT.tick = null; $("restTimer").hidden = true; };

/* ============================================================
   Installation sur l'écran d'accueil
   ============================================================ */
const UA = navigator.userAgent;
const IS_IOS = /iphone|ipad|ipod/i.test(UA) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const IS_ANDROID = /android/i.test(UA);
const standalone = () => window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
let deferredInstall = null;
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredInstall = e; refreshInstallBtn(); });
window.addEventListener("appinstalled", () => { lsSet("install-done", 1); closeInstall(); refreshInstallBtn(); });
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, String(v)); } catch (e) { /* stockage bloqué */ } }
const canInstall = () => !standalone() && !lsGet("install-done") && (IS_IOS || IS_ANDROID || !!deferredInstall);
function refreshInstallBtn() { const b = $("installBtn"); if (b) b.hidden = !canInstall(); }
const ICON_SHARE = '<svg viewBox="0 0 24 24"><path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>';
const ICON_PLUS = '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/></svg>';
function openInstall() {
  if (!canInstall()) return;
  $("installBody").innerHTML = deferredInstall
    ? `<button type="button" class="btn primary" id="installGo" style="width:100%">Installer l’application</button>`
    : IS_IOS
      ? `<ol class="steps"><li><span class="n">1</span><span>Touche <b>Partager</b> en bas de Safari</span><span class="ico">${ICON_SHARE}</span></li>
         <li><span class="n">2</span><span>Choisis <b>Sur l’écran d’accueil</b></span><span class="ico">${ICON_PLUS}</span></li>
         <li><span class="n">3</span><span>Touche <b>Ajouter</b>, c’est fait&nbsp;!</span></li></ol>
         <p class="hint" style="margin-top:6px">Tu ne vois pas « Partager » ? Il est parfois dans le menu <b>•••</b>. Sur un autre navigateur que Safari, ouvre d’abord ce lien dans Safari.</p>`
      : `<ol class="steps"><li><span class="n">1</span><span>Touche le menu <b>⋮</b> en haut à droite</span></li>
         <li><span class="n">2</span><span>Choisis <b>Installer l’application</b> ou <b>Ajouter à l’écran d’accueil</b></span><span class="ico">${ICON_PLUS}</span></li></ol>`;
  $("installBackdrop").hidden = false; $("installSheet").hidden = false;
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
let installTimer = null;
function maybeInvite() {
  clearTimeout(installTimer);
  const later = +(lsGet("install-later") || 0);
  if (!canInstall() || Date.now() - later < 7 * 864e5) return;
  installTimer = setTimeout(() => { if (S.screen === "home" && !document.body.classList.contains("sheet-open")) openInstall(); }, 3000);
}

/* ============================================================
   Assistant (FAQ, sans IA)
   ============================================================ */
const FAQ = [
  { q: "Comment noter une séance ?", k: "noter seance ajouter entrainement jour calendrier creer",
    a: "Va dans Séances, puis touche le jour voulu dans le calendrier (ou « Noter la séance du jour »).\nChoisis ton activité : Musculation, CrossFit, Callisthénie ou Course à pied. Chaque activité a sa fiche adaptée." },
  { q: "Comment ajouter des séries ?", k: "serie series repetition reps poids kg exercice ajouter",
    a: "Dans ta séance, touche « + Ajouter un exercice », écris son nom, puis remplis Reps et Poids pour chaque série.\n« + Ajouter une série » recopie la série précédente pour aller plus vite." },
  { q: "Comment marche le temps de repos ?", k: "repos minuteur timer chrono temps pause recuperation",
    a: "Sous chaque exercice, règle ton temps de repos avec − et + (par pas de 15 s).\nTouche « ⏱ Lancer » après une série : un minuteur s’affiche en bas et sonne à la fin. « +15 s » ajoute du temps, « Passer » l’arrête." },
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
const FAB_SCREENS = ["home", "seances", "nutrition", "complements", "creatine", "contact", "profile", "crossfit"];
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
}
function resetState() {
  Object.assign(S, { uid: null, email: "", admin: false, profile: null, days: {}, nut: {}, members: {}, messages: [], myMsgs: [], photoCache: {}, visitCounted: false, prefs: { creaDose: 5 } });
  S.types = DEFAULT_TYPES.map(t => ({ ...t }));
  const f = $("suFields"); if (f) f.innerHTML = "";
}

onAuthStateChanged(auth, async user => {
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
        subscribeData();
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
