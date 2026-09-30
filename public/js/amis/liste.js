// Amis : page « Amis » (liste, recherche, ajout, blocage).
import { openChat } from "./conversation.js";
import { SOC, otherOf, pairId, pairOf, syncShare, unreadOf, who } from "./etat.js";
import { openFriend } from "./page-ami.js";
import { $, S, armed, avatarHTML, collection, db, deleteDoc, doc, esc, getDocs, limit, query, setDoc, updateDoc, where } from "../core.js";
import { norm } from "../faq.js";
import { bannedStop } from "../social/index.js";
import { saveProfile } from "../store.js";

export function renderFriends() {
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
  if (bannedStop()) return;
  const pid = pairId(S.uid, uid), f = SOC.friends[pid];
  if (f && f.status === "pending" && f.to === S.uid) return acceptFriend(pid);
  try { await setDoc(relDoc(uid), { users: pairOf(S.uid, uid), from: S.uid, to: uid, status: "pending", at: Date.now() }); }
  catch (e) { SOC.searchMsg = "Impossible d’envoyer la demande."; renderFriends(); }
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
  const t = e.target.closest("button"); if (!t) return;
  if (t.id === "copyCode") { const c = S.profile.friendCode; (navigator.clipboard ? navigator.clipboard.writeText(c) : Promise.reject()).then(() => { t.textContent = "Copié ✓"; }, () => { const r = document.createRange(); r.selectNodeContents($("myCode")); getSelection().removeAllRanges(); getSelection().addRange(r); }); return; }
  if (t.id === "shareToggle") { saveProfile({ shareSessions: S.profile.shareSessions === false }); syncShare(); renderFriends(); return; }
  if (t.dataset.fadd) { addFriend(t.dataset.fadd); t.disabled = true; t.textContent = "Envoi…"; return; }
  if (t.dataset.faccept) { acceptFriend(t.dataset.faccept); t.disabled = true; return; }
  if (t.dataset.fdel) { if (!armed(t, "Confirmer")) return; deleteDoc(doc(db, "friends", t.dataset.fdel)).catch(() => {}); return; }
  if (t.dataset.fchat) { openChat(t.dataset.fchat); return; }
  if (t.dataset.fopen) openFriend(t.dataset.fopen);
});
