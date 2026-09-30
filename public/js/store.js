// Enregistrement (profil, séances, statistiques) et navigation entre les écrans.
import { $, DEFAULT_TYPES, S, TYPES_V, clone, collection, dayMeta, dayVolume, db, deleteDoc, doc, runKm, setDoc, todayK } from "./core.js";
import { applyTheme, currentTheme } from "./theme.js";
import { renderOnboard, renderPfStats, renderProfile } from "./account.js";
import { renderMain, setSave } from "./seances/index.js";
import { renderNutrition } from "./nutrition.js";
import { renderContact, renderObjets } from "./contact.js";
import { renderAdmin } from "./admin.js";
import { renderCrossfit, renderHub, renderProg, renderProgHub, renderRec, renderRecordsHub, renderTypesHub } from "./ideas.js";
import { maybeInvite, maybeWelcomeInstall } from "./install.js";
import { FAB_SCREENS, updateFab } from "./faq.js";
import { leaveChat, maybeNews, maybeTerms, newsPending, renderChat, renderFriend, renderFriends, syncShare } from "./friends.js";
import { renderPrograms, renderRoutine, renderRoutines } from "./entrainement/index.js";
import { renderGo, renderHome, renderRecap } from "./home.js";
import { loadFeed, renderChallenge, renderChallenges, renderMessages, renderRanks, renderSocial, syncChallenges } from "./social.js";
import { renderMuscles } from "./muscles.js";
import { maybeResetTours, renderTutos, tourCheck } from "./tour.js";

/* ============================================================
   Accès aux données
   ============================================================ */
const userRef = (uid = S.uid) => doc(db, "users", uid);
const subCol = (name, uid = S.uid) => collection(db, "users", uid, name);
const subDoc = (name, id, uid = S.uid) => doc(db, "users", uid, name, id);
let pChain = Promise.resolve(), dChain = Promise.resolve();

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
  if (S.old && S.split && k < S.split) { if (data) S.old.seances[k] = data; else delete S.old.seances[k]; }
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
  if (!S.uid || !S.profile || !S.oldReady) return;
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
  contact: renderContact, profile: renderProfile, admin: renderAdmin, onboard: renderOnboard, friends: renderFriends, friend: renderFriend, chat: renderChat, go: renderGo, social: renderSocial, messages: renderMessages, feed: () => loadFeed(false), challenges: renderChallenges, challenge: renderChallenge, ranks: renderRanks, muscles: renderMuscles, recap: renderRecap, routines: renderRoutines, routine: renderRoutine, tutos: renderTutos, programs: renderPrograms, crossfit: renderCrossfit, types: renderTypesHub, hub: renderHub, records: renderRecordsHub, rec: renderRec, progress: renderProgHub, prog: renderProg
};
function go(v) {
  if (v === "complements" && !S.cpDay) S.cpDay = todayK();
  if (v === "creatine" && !S.crView) { const t = new Date(); S.crView = new Date(t.getFullYear(), t.getMonth(), 1); }
  if (v === "contactform") { $("ctForm").hidden = false; $("ctDone").hidden = true; $("ctErr").hidden = true; renderObjets(); }
  S.screen = v;
  document.querySelectorAll(".view").forEach(el => { el.hidden = el.id !== "v-" + v; });
  RENDER[v] && RENDER[v]();
  window.scrollTo(0, 0);
  maybeResetTours(); tourCheck(v);
  if (!$("helpPanel").hidden && !FAB_SCREENS.includes(v)) $("helpPanel").hidden = true;
  updateFab();
  if (v !== "chat") leaveChat();
  if (v === "home") { if (!maybeTerms()) { maybeNews(); if (newsPending() || !maybeWelcomeInstall()) maybeInvite(); } }
}
function refresh() {
  if (S.screen === "profile") renderPfStats();
  else if (!["contactform", "auser", "login", "onboard", "splash"].includes(S.screen) && RENDER[S.screen]) RENDER[S.screen]();
}
document.addEventListener("click", e => { const b = e.target.closest("[data-go]"); if (b) go(b.dataset.go); });

export { applyProfile, go, persistDay, persistTypes, refresh, savePrefs, saveProfile, subCol, subDoc, syncStats, userRef };
