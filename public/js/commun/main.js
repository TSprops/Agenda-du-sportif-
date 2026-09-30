// Abonnements temps réel et démarrage de l'app (connexion détectée).
import { $, DEFAULT_TYPES, LOCAL, S, auth, clone, collection, db, doc, documentId, getDoc, getDocs, getDocsFromCache, isEmpty,
  key, onAuthStateChanged, onSnapshot, orderBy, query, show, where } from "./core.js";
import { applyProfile, go, refresh, saveProfile, subCol, syncStats, userRef } from "./store.js";
import { renderPfView, setAuthMode } from "../pages/compte.js";
import { renderAdmin } from "../pages/admin.js";
import { lsGet, lsSet } from "./install.js";
import { ensureSocialProfile, resetSocial, subscribeSocial } from "../amis/index.js";
import { renderHome } from "../pages/accueil.js";

/* ============================================================
   Abonnements temps réel et démarrage
   ============================================================ */
function stopSubscriptions() { S.unsubs.forEach(u => { try { u(); } catch (e) { /* déjà arrêté */ } }); S.unsubs = []; S.dataSubscribed = false; }
/* Chargement de l'historique par morceaux (moins de lectures = l'app reste gratuite plus longtemps) :
   - les 90 derniers jours sont suivis en direct ;
   - le plus ancien est lu une fois, puis repris du cache du téléphone (nouvelle lecture au plus une fois par semaine). */
const RECENT_DAYS = 90;
function mergeDays() {
  const d = { ...S.old.seances, ...S.recent.seances };
  if (S.open && S.cur) { if (isEmpty(S.cur)) delete d[S.open]; else d[S.open] = clone(S.cur); }
  S.days = d;
}
async function loadOld(name) {
  const q = query(subCol(name), where(documentId(), "<", S.split)), tag = "old-" + name + "-" + S.uid, uid = S.uid;
  let snap = null;
  if (Date.now() - +(lsGet(tag) || 0) < 7 * 864e5) { try { snap = await getDocsFromCache(q); if (!snap.size) snap = null; } catch (e) { snap = null; } }
  if (!snap) {
    try { snap = await getDocs(q); lsSet(tag, Date.now()); }
    catch (e) { try { snap = await getDocsFromCache(q); } catch (x) { snap = null; } }
  }
  if (S.uid !== uid) return;
  const d = {}; if (snap) snap.docs.forEach(x => { d[x.id] = x.data(); });
  S.old[name] = d;
}
function subscribeData() {
  if (S.dataSubscribed) return; S.dataSubscribed = true;
  S.split = key(new Date(Date.now() - RECENT_DAYS * 864e5)); S.old = { seances: {}, nutrition: {} }; S.recent = { seances: {}, nutrition: {} }; S.oldReady = false;
  S.unsubs.push(onSnapshot(query(subCol("seances"), where(documentId(), ">=", S.split)), snap => {
    const d = {}; snap.docs.forEach(x => { d[x.id] = x.data(); }); S.recent.seances = d;
    mergeDays(); refresh(); syncStats();
  }, () => {}));
  S.unsubs.push(onSnapshot(query(subCol("nutrition"), where(documentId(), ">=", S.split)), snap => {
    const d = {}; snap.docs.forEach(x => { d[x.id] = x.data(); }); S.recent.nutrition = d;
    S.nut = { ...S.old.nutrition, ...d }; refresh();
  }, () => {}));
  Promise.all([loadOld("seances"), loadOld("nutrition")]).then(() => {
    S.oldReady = true; mergeDays(); S.nut = { ...S.old.nutrition, ...S.recent.nutrition }; refresh(); syncStats();
  });
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
  S.unsubs.push(onSnapshot(collection(db, "bans"), snap => {
    S.bans = {}; snap.docs.forEach(x => { S.bans[x.id] = x.data(); });
    if (S.screen === "admin") renderAdmin();
  }, () => {}));
  S.unsubs.push(onSnapshot(query(collection(db, "reports"), orderBy("at", "desc")), snap => {
    S.reports = snap.docs.map(x => ({ id: x.id, ...x.data() }));
    if (S.screen === "admin") renderAdmin();
  }, () => {}));
}
function resetState() {
  Object.assign(S, { uid: null, email: "", admin: false, banned: false, profile: null, days: {}, nut: {}, members: {}, messages: [], myMsgs: [], photoCache: {}, visitCounted: false, prefs: { creaDose: 5 }, oldReady: false, bans: {} });
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
  try { S.banned = (await getDoc(doc(db, "bans", user.uid))).exists(); } catch (e) { S.banned = false; }
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

export { stopSubscriptions, subscribeData };
