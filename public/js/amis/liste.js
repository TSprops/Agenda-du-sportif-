// Amis : page « Amis » (liste, recherche, ajout, blocage).
import { openChat } from "./conversation.js";
import { SOC, otherOf, pairId, pairOf, syncShare, unreadOf, who } from "./etat.js";
import { openFriend } from "./page-ami.js";
import { openScanner } from "./partage-profil.js";
import { $, S, armed, avatarHTML, collection, db, deleteDoc, doc, esc, getDocs, limit, query, setDoc, updateDoc, where } from "../commun/core.js";
import { norm } from "../pages/faq.js";
import { bannedStop } from "../social/index.js";
import { saveProfile } from "../commun/store.js";
import { t } from "../commun/i18n.js";

export function renderFriends() {
  const code = (S.profile && S.profile.friendCode) || "…", share = !S.profile || S.profile.shareSessions !== false;
  const F = Object.entries(SOC.friends);
  const recv = F.filter(([, f]) => f.status === "pending" && f.to === S.uid), sent = F.filter(([, f]) => f.status === "pending" && f.from === S.uid);
  const friends = F.filter(([, f]) => f.status === "accepted").sort((a, b) => ((SOC.chats[b[0]] || {}).last || {}).at - ((SOC.chats[a[0]] || {}).last || {}).at || 0);
  const blocked = F.filter(([, f]) => f.status === "blocked" && f.blockedBy === S.uid);
  const rel = uid => { const f = SOC.friends[pairId(S.uid, uid)]; return !f ? "none" : f.status === "accepted" ? "friend" : f.status === "blocked" ? "blocked" : f.from === S.uid ? "sent" : "recv"; };
  $("friendsBody").innerHTML = `
    <section class="card code-card">
      <div class="lbl">${t("amis.monCode")}</div>
      <div class="code-row"><b id="myCode">${esc(code)}</b><button class="btn" id="copyCode">${t("nouveautes.ios.copier")}</button></div>
      <p class="hint">${t("amis.donneCode")}</p>
      <button type="button" class="btn" data-go="share">${t("amis.monQr")}</button>
      <button type="button" class="chip" id="shareToggle" style="--tc:var(--red);align-self:flex-start" aria-pressed="${share}">${t(share ? "amis.partagees" : "amis.nonPartagees")}</button>
    </section>
    <form class="card" id="friendSearch" autocomplete="off">
      <div class="lbl">${t("amis.ajouter")}</div>
      <div class="search-row"><input id="fsInput" placeholder="${esc(t("amis.codeOuPseudo"))}" aria-label="${esc(t("amis.codeOuPseudo"))}"><button class="btn primary" type="submit">${t("amis.chercher")}</button></div>
      <button type="button" class="btn" id="scanFriend">${t("amis.scanner")}</button>
      ${SOC.searchMsg ? `<p class="hint">${esc(SOC.searchMsg)}</p>` : ""}
      ${(SOC.results || []).map(u => { const r = rel(u.uid); return `<div class="frow">${avatarHTML(u, 40)}<span class="main"><b>${esc(u.pseudo)}</b><span>${esc(u.code || "")}</span></span>
        ${r === "none" ? `<button type="button" class="btn primary sm" data-fadd="${u.uid}">${t("commun.ajouter")}</button>` : r === "sent" ? `<span class="tag done">${t("amis.demandeEnvoyee")}</span>` : r === "recv" ? `<button type="button" class="btn primary sm" data-faccept="${pairId(S.uid, u.uid)}">${t("amis.accepter")}</button>` : r === "friend" ? `<span class="tag done">${t("social.ami")}</span>` : `<span class="tag done">${t("amis.bloque")}</span>`}</div>`; }).join("")}
    </form>
    ${recv.length ? `<section><h2 class="h2">${t("amis.demandesRecues", { n: recv.length })}</h2><div class="card" style="gap:0;padding-block:4px">${recv.map(([pid, f]) => { const u = otherOf(f), w = who(u, 40); return `<div class="frow">${w.av}<span class="main"><b>${esc(w.d.pseudo)}</b><span>${t("amis.veutAjouter")}</span></span><button type="button" class="btn primary sm" data-faccept="${pid}">${t("amis.accepter")}</button><button type="button" class="icon-btn" data-fdel="${pid}">${t("amis.refuser")}</button></div>`; }).join("")}</div></section>` : ""}
    <section><h2 class="h2">${t("amis.mesAmis", { n: friends.length })}</h2>
      ${friends.length ? `<div class="card" style="gap:0;padding-block:4px">${friends.map(([pid, f]) => { const u = otherOf(f), w = who(u, 44), c = SOC.chats[pid], un = unreadOf(pid); return `<div class="frow">
        <button type="button" class="frow-main" data-fopen="${u}">${w.av}<span class="main"><b>${esc(w.d.pseudo)}${un ? ' <i class="dot-new"></i>' : ""}</b><span class="${un ? "unread" : ""}">${c && c.last ? esc(c.last.from === S.uid ? t("messages.toiTexte", { texte: c.last.text }) : c.last.text) : t("conversation.voirSeances")}</span></span></button>
        <button type="button" class="btn sm" data-fchat="${u}" aria-label="${esc(t("amis.ecrireA", { pseudo: w.d.pseudo }))}">💬</button></div>`; }).join("")}</div>`
        : `<div class="empty">${t("amis.aucun")}</div>`}
    </section>
    ${sent.length ? `<section><h2 class="h2">${t("amis.demandesEnvoyees")}</h2><div class="card" style="gap:0;padding-block:4px">${sent.map(([pid, f]) => { const w = who(otherOf(f), 40); return `<div class="frow">${w.av}<span class="main"><b>${esc(w.d.pseudo)}</b><span>${t("amis.enAttente")}</span></span><button type="button" class="icon-btn" data-fdel="${pid}">${t("commun.annuler")}</button></div>`; }).join("")}</div></section>` : ""}
    ${blocked.length ? `<section><h2 class="h2">${t("amis.bloquees")}</h2><div class="card" style="gap:0;padding-block:4px">${blocked.map(([pid, f]) => { const w = who(otherOf(f), 40); return `<div class="frow">${w.av}<span class="main"><b>${esc(w.d.pseudo)}</b></span><button type="button" class="icon-btn" data-fdel="${pid}">${t("amis.debloquer")}</button></div>`; }).join("")}</div></section>` : ""}`;
  const inp = $("fsInput"); if (inp && SOC.lastQuery) inp.value = SOC.lastQuery;
}
export async function searchUsers(q) {
  q = q.trim(); SOC.lastQuery = q; SOC.results = []; SOC.searchMsg = t("amis.recherche"); renderFriends();
  try {
    let docs;
    if (/^[A-Za-z]+-\d{4}$/.test(q)) docs = (await getDocs(query(collection(db, "directory"), where("code", "==", q.toUpperCase()), limit(5)))).docs;
    else { const n = norm(q).trim(); if (n.length < 2) { SOC.searchMsg = t("amis.deuxLettres"); renderFriends(); return; } docs = (await getDocs(query(collection(db, "directory"), where("pseudoLower", ">=", n), where("pseudoLower", "<=", n + ""), limit(10)))).docs; }
    SOC.results = docs.map(d => d.data()).filter(u => u.uid !== S.uid);
    SOC.results.forEach(u => { SOC.dir[u.uid] = u; });
    SOC.searchMsg = SOC.results.length ? "" : t("amis.aucunResultat");
  } catch (e) { SOC.searchMsg = t("amis.rechercheEchec"); }
  renderFriends();
}
const relDoc = uid => doc(db, "friends", pairId(S.uid, uid));
async function addFriend(uid) {
  if (bannedStop()) return;
  const pid = pairId(S.uid, uid), f = SOC.friends[pid];
  if (f && f.status === "pending" && f.to === S.uid) return acceptFriend(pid);
  try { await setDoc(relDoc(uid), { users: pairOf(S.uid, uid), from: S.uid, to: uid, status: "pending", at: Date.now() }); }
  catch (e) { SOC.searchMsg = t("amis.demandeImpossible"); renderFriends(); }
}
async function acceptFriend(pid) { try { await updateDoc(doc(db, "friends", pid), { status: "accepted", acceptedAt: Date.now() }); } catch (e) { /* déjà traité */ } }
export async function blockUser(uid) {
  const pid = pairId(S.uid, uid), f = SOC.friends[pid];
  try {
    if (f) await updateDoc(relDoc(uid), { status: "blocked", blockedBy: S.uid, blockedAt: Date.now() });
    else await setDoc(relDoc(uid), { users: pairOf(S.uid, uid), from: S.uid, to: uid, status: "blocked", blockedBy: S.uid, at: Date.now() });
  } catch (e) { /* déjà bloqué */ }
}
$("friendsBody").addEventListener("submit", e => { e.preventDefault(); if (e.target.id === "friendSearch") searchUsers($("fsInput").value); });
$("friendsBody").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  if (b.id === "copyCode") { const c = S.profile.friendCode; (navigator.clipboard ? navigator.clipboard.writeText(c) : Promise.reject()).then(() => { b.textContent = t("nouveautes.copie"); }, () => { const r = document.createRange(); r.selectNodeContents($("myCode")); getSelection().removeAllRanges(); getSelection().addRange(r); }); return; }
  if (b.id === "scanFriend") { openScanner(); return; }
  if (b.id === "shareToggle") { saveProfile({ shareSessions: S.profile.shareSessions === false }); syncShare(); renderFriends(); return; }
  if (b.dataset.fadd) { addFriend(b.dataset.fadd); b.disabled = true; b.textContent = t("contact.envoi"); return; }
  if (b.dataset.faccept) { acceptFriend(b.dataset.faccept); b.disabled = true; return; }
  if (b.dataset.fdel) { if (!armed(b, t("commun.confirmer"))) return; deleteDoc(doc(db, "friends", b.dataset.fdel)).catch(() => {}); return; }
  if (b.dataset.fchat) { openChat(b.dataset.fchat); return; }
  if (b.dataset.fopen) openFriend(b.dataset.fopen);
});
