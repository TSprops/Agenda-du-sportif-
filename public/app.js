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
const OBJECTIFS = ["Prise de masse", "Sèche", "Force", "Remise en forme", "Endurance"];
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
function exVolume(ex) { return (ex.sets || []).reduce((a, s) => a + ((+s.reps || 0) * (+s.kg || 0)), 0); }
function dayVolume(d) { return (d.exercises || []).reduce((a, e) => a + exVolume(e), 0); }
function isEmpty(d) { return !d || (!String(d.title || "").trim() && !d.typeId && !(d.exercises || []).length && !d.mood && !String(d.note || "").trim() && !(d.photos || []).length); }
function titleOf(d, types) { const t = (types || S.types).find(x => x.id === d.typeId); return String(d.title || "").trim() || (t ? t.name : "Séance"); }
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
      const d = S.days[k], t = typeOf(d.typeId), n = t ? t.name : "Sans type";
      byType[n] = (byType[n] || 0) + 1; ex += (d.exercises || []).length; vol += dayVolume(d); photos += (d.photos || []).length;
    });
    const nk = Object.keys(S.nut);
    const stats = {
      seances: ks.length, lastSeance: ks[ks.length - 1] || null, exercices: ex, volume: Math.round(vol), photos, byType,
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
  contact: renderContact, profile: renderProfile, admin: renderAdmin, onboard: renderOnboard
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
    const k = key(new Date(y, m, d)), s = S.days[k], t = s && typeOf(s.typeId);
    h += `<button class="day${s ? " has" : ""}${k === tk ? " today" : ""}" data-k="${k}" style="--tc:${t ? t.color : "#8A847E"}" aria-label="${d} ${MONTHS[m]}${s ? ", " + esc(titleOf(s)) : ""}"><span class="n">${d}</span>${s ? `<span class="t">${esc(t ? t.name : titleOf(s))}</span>` : ""}</button>`;
  }
  $("grid").innerHTML = h;
  $("legend").innerHTML = S.types.map(t => `<span style="--tc:${t.color}"><i class="dot"></i>${esc(t.name)}</span>`).join("");
  const ks = Object.keys(S.days).filter(k => k.startsWith(y + "-" + pad(m + 1))).sort().reverse();
  const vol = ks.reduce((a, k) => a + dayVolume(S.days[k]), 0);
  const sets = ks.reduce((a, k) => a + (S.days[k].exercises || []).reduce((b, e) => b + (e.sets || []).length, 0), 0);
  $("sumTitle").textContent = cap(MONTHS[m]) + " en chiffres";
  $("stats").innerHTML = `<div class="stat"><b>${ks.length}</b><span>séance${ks.length > 1 ? "s" : ""}</span></div><div class="stat"><b>${sets}</b><span>séries</span></div><div class="stat"><b>${vol >= 10000 ? nf.format(vol / 1000) + " t" : nf.format(vol)}</b><span>${vol >= 10000 ? "soulevées" : "kg soulevés"}</span></div>`;
  $("list").innerHTML = ks.length ? ks.map(k => {
    const s = S.days[k], t = typeOf(s.typeId), d = parse(k), n = (s.exercises || []).length, ph = (s.photos || []).length;
    return `<button class="row" data-k="${k}" style="--tc:${t ? t.color : "#8A847E"}"><i class="bar"></i><span class="d">${DAYS[d.getDay()].slice(0, 3)}<b>${d.getDate()}</b></span><span class="main"><div class="ti">${esc(titleOf(s))}</div><div class="me">${t ? esc(t.name) + " · " : ""}${n} exercice${n > 1 ? "s" : ""}${dayVolume(s) ? " · " + nf.format(dayVolume(s)) + " kg" : ""}${ph ? " · " + ph + " photo" + (ph > 1 ? "s" : "") : ""}</div></span><span aria-hidden="true" style="color:var(--red-hi)">›</span></button>`;
  }).join("") : `<div class="empty">Aucune séance en ${MONTHS[m]}. Touche un jour du calendrier pour noter ton entraînement.</div>`;
}

/* ============================================================
   Séances : fiche du jour
   ============================================================ */
function rpeColor(v) { return v <= 6 ? "#2FBF71" : v <= 8 ? "#FF9F0A" : "#FF3B30"; }
function rpeLabel(v) { return !v ? "Non notée" : v <= 5 ? "Facile" : v === 6 ? "Modérée" : v === 7 ? "3 reps en réserve" : v === 8 ? "2 reps en réserve" : v === 9 ? "1 rep en réserve" : "Échec"; }
function restOf(ex) { return typeof ex.rest === "number" ? ex.rest : 90; }
function fmtRest(v) { if (!v) return "Aucun"; const m = Math.floor(v / 60), sec = v % 60; return m ? m + " min" + (sec ? " " + pad(sec) : "") : sec + " s"; }
function exStats(ex) {
  const s = (ex.sets || []).filter(x => x.reps !== "" || x.kg !== "");
  if (!s.length) return "Aucune série remplie";
  const best = Math.max(0, ...s.map(x => +x.kg || 0)), v = exVolume(ex);
  return `${s.length} série${s.length > 1 ? "s" : ""}${best ? " · max " + nf.format(best) + " kg" : ""}${v ? " · volume " + nf.format(v) + " kg" : ""}`;
}
function lastOfType(typeId, before) { return Object.keys(S.days).filter(k => k < before && S.days[k].typeId === typeId && (S.days[k].exercises || []).length).sort().pop(); }
function exHTML(ex, i) {
  const r = ex.rpe || 0;
  return `<article class="ex">
  <div class="ex-head"><span class="ex-num">${pad(i + 1)}</span><input id="exn-${i}" class="ex-name" data-f="ex-name" data-ex="${i}" placeholder="Nom de l’exercice" value="${esc(ex.name)}" autocomplete="off"><button class="icon-btn" data-a="del-ex" data-ex="${i}" aria-label="Supprimer l’exercice">Retirer</button></div>
  <div class="ex-stats" id="st-${i}">${exStats(ex)}</div>
  <table class="sets"><thead><tr><th style="text-align:center">Série</th><th>Reps</th><th>Poids (kg)</th><th></th></tr></thead><tbody>
  ${(ex.sets || []).map((s, j) => `<tr><td class="n">${j + 1}</td><td><input id="r-${i}-${j}" class="num" inputmode="numeric" data-f="reps" data-ex="${i}" data-s="${j}" value="${esc(s.reps)}" placeholder="–" aria-label="Répétitions série ${j + 1}"></td><td><input id="k-${i}-${j}" class="num" inputmode="decimal" data-f="kg" data-ex="${i}" data-s="${j}" value="${esc(s.kg)}" placeholder="–" aria-label="Poids série ${j + 1}"></td><td class="x"><button class="icon-btn" data-a="del-set" data-ex="${i}" data-s="${j}" aria-label="Supprimer la série ${j + 1}">−</button></td></tr>`).join("")}
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
function renderSheet() {
  const c = S.cur, k = S.open, d = parse(k), t = typeOf(c.typeId);
  const last = t && !(c.exercises || []).length ? lastOfType(t.id, k) : null;
  const el = $("sheet"), y = el.scrollTop;
  el.innerHTML = `<div class="bar-top"><button class="link" data-a="close">‹ Calendrier</button><span class="save" id="saveState">${esc(S.saveMsg || "")}</span></div>
  <div class="sheet-body" style="--tc:${t ? t.color : "#FF2B34"}">
    <p class="eyebrow">${cap(DAYS[d.getDay()])} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}</p>
    <input id="f-title" class="title-in" data-f="title" placeholder="${t ? esc(t.name) : "Titre de la séance"}" value="${esc(c.title)}" autocomplete="off" aria-label="Titre de la séance">
    <div class="chips" role="group" aria-label="Type de séance">${S.types.map(x => `<button class="chip" data-a="type" data-id="${x.id}" style="--tc:${x.color}" aria-pressed="${x.id === c.typeId}"><i class="dot"></i>${esc(x.name)}</button>`).join("")}</div>
    ${last ? `<button class="suggest" data-a="copy" data-k="${last}"><span style="flex:1"><b>Reprendre la dernière séance ${esc(t.name)}</b><span>${parse(last).getDate()} ${MONTHS[parse(last).getMonth()]} · ${(S.days[last].exercises || []).length} exercices, poids pré-remplis</span></span><span aria-hidden="true">›</span></button>` : ""}
    ${(c.exercises || []).map(exHTML).join("")}
    <button class="add-ex" data-a="add-ex">+ Ajouter un exercice</button>
    <section class="card"><div class="lbl">Ressenti général</div>
      <div class="chips">${MOODS.map(m => `<button class="chip" data-a="mood" data-v="${m}" style="--tc:var(--red)" aria-pressed="${c.mood === m}">${m}</button>`).join("")}</div>
      <textarea id="f-note" data-f="note" placeholder="Sommeil, énergie, ce qu’il faut changer la prochaine fois…" rows="3">${esc(c.note)}</textarea>
    </section>
    <section class="card"><div class="lbl">Photos <em>${(c.photos || []).length || ""}</em></div>
      <div class="photos">${(c.photos || []).map(photoTile).join("")}${'<div class="ph loading">Envoi…</div>'.repeat(S.uploading || 0)}
      <label class="ph-add" for="phIn"><span class="plus">+</span>Prendre une photo<input id="phIn" type="file" accept="image/*" multiple data-f="photo"></label></div>
      ${S.photoErr ? `<p class="err">${esc(S.photoErr)}</p>` : ""}
    </section>
    ${isEmpty(c) ? "" : `<button class="danger" data-a="del-session">Supprimer la séance</button>`}
  </div>`;
  el.scrollTop = y;
  loadPhotos(c.photos || []);
}
function openDay(k) {
  S.open = k; S.cur = clone(S.days[k] || { title: "", typeId: null, exercises: [], mood: null, note: "", photos: [] });
  if (!S.cur.photos) S.cur.photos = [];
  S.saveMsg = ""; S.photoErr = "";
  renderSheet(); $("sheet").scrollTop = 0; $("sheet").classList.add("open"); document.body.style.overflow = "hidden"; document.body.classList.add("sheet-open");
}
function closeSheet() { flush(); $("sheet").classList.remove("open"); document.body.style.overflow = ""; document.body.classList.remove("sheet-open"); S.open = null; S.cur = null; S.photoErr = ""; renderMain(); }
function setSave(m) { S.saveMsg = m; const e = $("saveState"); if (e) e.textContent = m; }
let timer = null;
function changed() { clearTimeout(timer); timer = setTimeout(flush, 700); }
function flush() {
  if (!S.open || timer === null) return;
  clearTimeout(timer); timer = null;
  const k = S.open, c = S.cur;
  if (isEmpty(c)) { delete S.days[k]; persistDay(k, null); }
  else { const data = { ...clone(c), updatedAt: Date.now() }; S.days[k] = data; persistDay(k, data); }
}
$("sheet").addEventListener("input", e => {
  const f = e.target.dataset.f; if (!f || !S.cur || f === "photo") return;
  const c = S.cur, i = +e.target.dataset.ex, j = +e.target.dataset.s, v = e.target.value;
  if (f === "title") c.title = v; else if (f === "note") c.note = v;
  else if (f === "ex-name") c.exercises[i].name = v; else if (f === "ex-note") c.exercises[i].note = v;
  else if (f === "reps" || f === "kg") { c.exercises[i].sets[j][f] = v.trim() === "" ? "" : numOr(v); $("st-" + i).textContent = exStats(c.exercises[i]); }
  changed();
});
$("sheet").addEventListener("click", e => {
  const b = e.target.closest("[data-a]"); if (!b) return;
  const a = b.dataset.a, c = S.cur, i = +b.dataset.ex;
  if (a === "close") return closeSheet();
  if (a === "type") { c.typeId = c.typeId === b.dataset.id ? null : b.dataset.id; }
  else if (a === "mood") { c.mood = c.mood === b.dataset.v ? null : b.dataset.v; }
  else if (a === "add-ex") {
    c.exercises.push({ name: "", sets: [{ reps: "", kg: "" }, { reps: "", kg: "" }, { reps: "", kg: "" }], rpe: 0, note: "", rest: 90 });
    changed(); renderSheet(); const n = $("exn-" + (c.exercises.length - 1)); n && n.focus(); return;
  }
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
  else if (a === "copy") {
    const src = S.days[b.dataset.k];
    c.exercises = clone(src.exercises || []).map(x => ({ name: x.name, sets: (x.sets || []).map(s => ({ reps: s.reps, kg: s.kg })), rpe: 0, note: "", rest: restOf(x) }));
    if (!String(c.title).trim()) c.title = src.title || "";
  }
  else if (a === "del-session") {
    if (!armed(b, "Toucher à nouveau pour supprimer")) return;
    const gone = (c.photos || []).map(p => p.pid).filter(Boolean);
    S.cur = { title: "", typeId: null, exercises: [], mood: null, note: "", photos: [] };
    timer = 1; flush(); gone.forEach(dropPhoto); return closeSheet();
  }
  else return;
  changed(); renderSheet();
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
    const d = new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + i), k = key(d), s = S.days[k], ty = s && typeOf(s.typeId);
    if (s) cnt++;
    h += `<span class="${s ? "on" : ""}${k === tk ? " now" : ""}" style="--tc:${ty ? ty.color : "#8A847E"}">${"LMMJVSD"[i]}</span>`;
  }
  $("homeWeek").innerHTML = h;
  $("homeSeancesSub").textContent = cnt ? `${cnt} séance${cnt > 1 ? "s" : ""} cette semaine` : "Aucune séance cette semaine pour l’instant";
  const n = nutOf(tk), c = (n.complements || []).length;
  $("homeNut").innerHTML = `<span class="pill${n.creatine ? " ok" : ""}">${n.creatine ? "✓ Créatine prise" : "Créatine à prendre"}</span><span class="pill${c ? " ok" : ""}">${c} complément${c > 1 ? "s" : ""} aujourd’hui</span>`;
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
  const colorOf = n => (DEFAULT_TYPES.find(t => t.name === n) || { color: "#8A847E" }).color;
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
  const kv = [["Pseudo", m.pseudo], ["E-mail", m.email], ["Prénom", m.prenom], ["Nom", m.nom], ["Âge", m.age ? m.age + " ans" : ""], ["Taille", m.taille ? m.taille + " cm" : ""], ["Poids", m.poids ? m.poids + " kg" : ""], ["Objectif", m.objectif], ["Inscrit le", m.createdAt ? fmtDate(m.createdAt) : ""], ["Dernière visite", ago(m.lastSeen)], ["Visites", m.visits], ["Volume total", st.volume ? nf.format(st.volume) + " kg" : ""], ["Photos", st.photos]].filter(x => x[1] !== undefined && x[1] !== "" && x[1] !== null);
  $("auserBody").innerHTML = `<div style="display:flex;flex-direction:column;gap:20px">
   <div style="display:flex;align-items:center;gap:14px">${avatarHTML(m, 64)}<h1 class="vtitle" style="margin:0;font-size:34px">${esc(m.pseudo || "Utilisateur")}</h1></div>
   <div class="stats"><div class="stat"><b>${seances.length}</b><span>séance${seances.length > 1 ? "s" : ""}</span></div><div class="stat"><b>${st.creatineDays || 0}</b><span>jours créatine</span></div><div class="stat"><b>${st.complements || 0}</b><span>compléments notés</span></div></div>
   <section class="card"><div class="lbl">Informations</div><dl class="kv">${kv.map(([a, b]) => `<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join("")}</dl></section>
   <section><h2 class="h2">Dernières séances</h2><div class="list">${seances.length ? seances.slice(0, 30).map(s => {
     const t = types.find(x => x.id === s.typeId), d = parse(s.k), n = (s.exercises || []).length;
     return `<div class="row" style="--tc:${t ? t.color : "#8A847E"}"><i class="bar"></i><span class="d">${DAYS[d.getDay()].slice(0, 3)}<b>${d.getDate()}</b></span><span class="main"><div class="ti">${esc(titleOf(s, types))}</div><div class="me">${esc(MONTHS[d.getMonth()])} ${d.getFullYear()} · ${n} exercice${n > 1 ? "s" : ""}${dayVolume(s) ? " · " + nf.format(dayVolume(s)) + " kg" : ""}</div></span></div>`;
   }).join("") : `<div class="empty">Aucune séance enregistrée.</div>`}</div></section>
   <p class="hint">${nut} jour${nut > 1 ? "s" : ""} de nutrition renseigné${nut > 1 ? "s" : ""}.</p>
  </div>`;
}

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
    a: "Va dans Séances, puis touche le jour voulu dans le calendrier (ou « Noter la séance du jour »).\nDonne un titre, choisis le type (Push, Pull, Jambes…), puis ajoute tes exercices." },
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
  { q: "Comment contacter le créateur ?", k: "contact contacter createur probleme bug aide reclamation idee",
    a: "Touche « Contact » en bas de l’accueil, choisis un objet et écris ton message : il arrive directement chez moi." }
];
const STOP = new Set("comment pour avec dans une des les est que qui quoi quel quelle quels mon mes ton tes son ses faire fait fais peux peut puis sur pas par plus moins tout tous toute cette ces aux the and elle ils nous vous etre avoir suis sont veux voudrais savoir aide aider app application".split(" "));
const norm = t => String(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, " ");
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
  $("helpPanel").hidden = false; $("helpFab").hidden = true;
  if (!$("helpMsgs").children.length) {
    const who = S.profile && S.profile.pseudo ? " " + S.profile.pseudo : "";
    helpAdd("Salut" + who + " 👋 Je réponds aux questions fréquentes sur l’app. Choisis une question ou écris la tienne.", "bot");
    helpSuggest([0, 2, 3, 5, 8, 10], false);
  }
}
function helpClose() { $("helpPanel").hidden = true; updateFab(); }
$("helpFab").onclick = helpOpen;
$("helpClose").onclick = helpClose;
$("helpMsgs").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  if (b.dataset.contact) { helpClose(); go("contactform"); return; }
  if (b.dataset.faq != null) helpAnswer(+b.dataset.faq);
});
$("helpForm").addEventListener("submit", e => {
  e.preventDefault();
  const text = $("helpInput").value.trim(); if (!text) return;
  $("helpInput").value = ""; helpAdd(text, "me");
  const words = norm(text).split(" ").filter(w => w.length > 2 && !STOP.has(w));
  const scored = FAQ.map((f, i) => {
    const hay = norm(f.k + " " + f.q);
    return { i, score: words.reduce((a, w) => a + (hay.includes(w) || hay.includes(w.replace(/s$/, "")) ? 1 : 0), 0) };
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
const FAB_SCREENS = ["home", "seances", "nutrition", "complements", "creatine", "contact", "profile"];
function updateFab() { $("helpFab").hidden = !FAB_SCREENS.includes(S.screen) || !$("helpPanel").hidden; }

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
