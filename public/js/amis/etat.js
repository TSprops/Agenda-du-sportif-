// Amis : état partagé (SOC), fiche publique, synchronisation, compteurs de non-lus.
import { renderFriends } from "./liste.js";
import { myReactsHTML } from "./page-ami.js";
import { $, BENCH, LIFTS, S, avatarHTML, collection, dayVolume, db, doc, getDoc, onSnapshot, plural, query, runKm, setDoc, todayK, where } from "../commun/core.js";
import { norm } from "../pages/faq.js";
import { streakInfo } from "../pages/accueil.js";
import { CALIS_PRS, MUSCU_LIFTS, RUN_PRS, benchEntries, benchText, benchValue, cfData, prBest, prText, prsData } from "../idees/index.js";
import { acceptedFriends, activityList, bestLifts, monthShare, newChallenges, renderMessages, renderSocial, seenAct, subscribeChallenges } from "../social/index.js";
import { go, saveProfile } from "../commun/store.js";

/* ============================================================
   Amis, séances partagées et messages
   ============================================================ */
export const REACTS = [["muscle", "💪"], ["fire", "🔥"], ["clap", "👏"]];
export const pairOf = (a, b) => a < b ? [a, b] : [b, a];
export const pairId = (a, b) => pairOf(a, b).join("_");
export const SOC = { friends: {}, chats: {}, chatSubs: {}, dir: {}, results: null, searchMsg: "", friendUid: null, friendData: null, chatUid: null, chatUnsub: null, msgs: [], reportMid: null, myReacts: [], menu: false };
export const otherOf = f => f.users[0] === S.uid ? f.users[1] : f.users[0];
function makeCode(pseudo) { const base = norm(pseudo).replace(/[^a-z]/g, "").toUpperCase().slice(0, 6) || "SPORT"; return base + "-" + (1000 + Math.floor(Math.random() * 9000)); }
export async function dirOf(uid) {
  if (SOC.dir[uid]) return SOC.dir[uid];
  try { const s = await getDoc(doc(db, "directory", uid)); SOC.dir[uid] = s.exists() ? s.data() : { uid, pseudo: "Utilisateur" }; }
  catch (e) { SOC.dir[uid] = { uid, pseudo: "Utilisateur" }; }
  return SOC.dir[uid];
}
// Fiche publique (annuaire) + ce que voient les amis (share), mises à jour à chaque connexion et modification.
export async function ensureSocialProfile() {
  if (!S.profile || S.banned) return;
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
export function syncShare() {
  if (!S.uid || !S.profile || !S.oldReady) return;
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
export function subscribeSocial() {
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
export function resetSocial() { Object.assign(SOC, { friends: {}, chats: {}, chatSubs: {}, dir: {}, results: null, searchMsg: "", friendUid: null, friendData: null, chatUid: null, msgs: [], myReacts: [], menu: false, myComments: [], challenges: [], feed: null, shares: {}, sharesAt: 0, newCh: null, openCmt: null, feedOpen: null }); if (SOC.chatUnsub) { SOC.chatUnsub(); SOC.chatUnsub = null; } }
export const unreadOf = pid => { const c = SOC.chats[pid]; return !!(c && c.last && c.last.from !== S.uid && c.last.at > ((c.read || {})[S.uid] || 0)); };
export function socialCounts() {
  const F = Object.entries(SOC.friends);
  return { requests: F.filter(([, f]) => f.status === "pending" && f.to === S.uid).length, unread: F.filter(([pid, f]) => f.status === "accepted" && unreadOf(pid)).length };
}
export function refreshSocial() {
  const c = socialCounts(), el = $("homeSocial");
  if (el) {
    const nf2 = acceptedFriends().length, act = activityList().filter(a => a.at > seenAct()).length, live = (SOC.challenges || []).filter(ch => ch.end >= todayK()).length;
    el.innerHTML = `<span class="pill${nf2 ? " ok" : ""}">${nf2} ami${nf2 > 1 ? "s" : ""}</span>${c.requests ? `<span class="pill alert">${plural(c.requests, "demande")}</span>` : ""}${c.unread ? `<span class="pill alert">${c.unread} message${c.unread > 1 ? "s" : ""} non lu${c.unread > 1 ? "s" : ""}</span>` : ""}${act ? `<span class="pill alert">${plural(act, "nouveauté")}</span>` : ""}${live ? `<span class="pill">${plural(live, "défi")} en cours</span>` : ""}`;
    const nc = newChallenges().length;
    if (nc) el.insertAdjacentHTML("beforeend", `<span class="pill alert">${plural(nc, "nouveau défi")}</span>`);
    $("socialDot").hidden = $("tabSocialDot").hidden = !(c.requests || c.unread || act || nc);
  }
  if (S.screen === "friends") renderFriends();
  if (S.screen === "messages") renderMessages();
  if (S.screen === "social") renderSocial();
}
export const who = (uid, size) => { const d = SOC.dir[uid] || { pseudo: "…" }; return { d, av: avatarHTML({ pseudo: d.pseudo, photo: d.photo }, size || 44) }; };
