// Amis, séances partagées, messages privés et annonce de nouveauté.
import { $, BENCH, DAYS, DEFAULT_TYPES, LIFTS, S, TERMS_V, addDoc, armed, avatarHTML, collection, dayMeta, dayOf, dayVolume, db,
  deleteDoc, discOf, doc, esc, fmtDur, getDoc, getDocs, isEmpty, key, limit, limitToLast, nf, onSnapshot, orderBy, pad, parse,
  plural, query, runKm, runPace, runSecs, setDoc, titleOf, todayK, updateDoc, where, wodScore } from "./core.js";
import { go, saveProfile } from "./store.js";
import { sessionSummary } from "./seances.js";
import { CALIS_PRS, MONTHS_S, MUSCU_LIFTS, RUN_PRS, benchEntries, benchText, benchValue, cfData, prBest, prText, prsData,
  shortDate } from "./ideas.js";
import { closeInstall, lsGet, lsSet, maybeWelcomeInstall } from "./install.js";
import { norm } from "./faq.js";
import { cordesText, toast } from "./workout.js";
import { streakInfo } from "./home.js";
import { acceptedFriends, activityList, bannedStop, bestLifts, commentsHTML, monthShare, newChallenges, renderMessages,
  renderSocial, seenAct, subscribeChallenges, toggleReact, trySession } from "./social.js";
import { figure, frameBox } from "./silhouette/index.js";
import { HOW } from "./exercices/index.js";

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
function syncShare() {
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
  if (bannedStop()) return;
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
    <div class="grid2"><button type="button" class="btn ghost-danger" data-freport="${uid}">⚑ Signaler</button><button type="button" class="btn ghost-danger" data-fblock="${uid}">Bloquer</button></div>`;
}
$("friendBody").addEventListener("click", async e => {
  const t = e.target.closest("button"); if (!t) return;
  const fd = SOC.friendData, uid = SOC.friendUid;
  if (t.dataset.fchat2) { openChat(t.dataset.fchat2); return; }
  if (t.dataset.fmore) { SOC.friendShow += 10; renderFriend(); return; }
  if (t.dataset.fsk) { SOC.friendOpenK = SOC.friendOpenK === t.dataset.fsk ? null : t.dataset.fsk; renderFriend(); return; }
  if (t.dataset.fblock) { if (!armed(t, "Confirmer")) return; await blockUser(uid); go("friends"); return; }
  if (t.dataset.freport) {
    if (!armed(t, "Confirmer")) return;
    const d = SOC.dir[uid] || {};
    try { await reportContent({ target: uid, kind: "profile", text: `Profil « ${d.pseudo || "?"} »${d.objectif ? " · objectif : " + d.objectif : ""}${d.photo ? " · avec photo" : ""}`, ref: `directory/${uid}` }); t.textContent = "Signalé ✓"; t.disabled = true; }
    catch (x) { toast("Signalement impossible. Réessaie."); }
    return;
  }
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
// Signalement envoyé à l'administrateur. ref = chemin du contenu, pour pouvoir le supprimer.
async function reportContent(o) {
  const d = SOC.dir[o.target] || {};
  await addDoc(collection(db, "reports"), { from: S.uid, fromPseudo: S.profile.pseudo, target: o.target || "", targetPseudo: o.targetPseudo || d.pseudo || "", text: String(o.text || "").slice(0, 1200), kind: o.kind, ref: o.ref || null, at: Date.now() });
}
$("chatForm").addEventListener("submit", async e => {
  e.preventDefault();
  if (bannedStop()) return;
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
    try { await reportContent({ target: SOC.chatUid, kind: "message", text: m.text, ref: `chats/${pairId(S.uid, SOC.chatUid)}/messages/${m.id}` }); t.textContent = "Signalé ✓ Merci"; t.disabled = true; } catch (x) { t.textContent = "Échec, réessaie"; }
    return;
  }
  if (t.dataset.cm === "profile") { openFriend(SOC.chatUid); return; }
  if (t.dataset.cm === "report") {
    const last = SOC.msgs.filter(m => m.from !== S.uid).slice(-10).map(m => "« " + m.text + " »").join("\n");
    try { await reportContent({ target: SOC.chatUid, kind: "conversation", text: last || "(conversation vide)", ref: `chats/${pairId(S.uid, SOC.chatUid)}` }); t.textContent = "Conversation signalée ✓"; t.disabled = true; } catch (x) { t.textContent = "Échec, réessaie"; }
    return;
  }
  if (t.dataset.cm === "block") { if (!armed(t, "Toucher à nouveau pour bloquer")) return; await blockUser(SOC.chatUid); go("friends"); }
});
function leaveChat() { if (SOC.chatUnsub) { SOC.chatUnsub(); SOC.chatUnsub = null; } }

/* ---------- Nouveautés (une seule fois par utilisateur) ---------- */
// Deux diapositives : « Comment faire », puis où trouver le bouton Contact. Vue une fois = plus jamais
// (mémorisé sur l'appareil ET dans le profil, donc aussi après rechargement ou sur un autre appareil).
// Pour la revoir (test) : ouvrir l'app avec « ?nouveautes » à la fin de l'adresse.
const NEWS_ID = "v3";
const NEWS_FORCE = new URLSearchParams(location.search).has("nouveautes");
let newsClosed = false, newsI = 0;
function termsPending() { return !!(S.profile && (S.profile.termsV || 0) < TERMS_V); }
function maybeTerms() { if (termsPending()) { $("termsBackdrop").hidden = false; $("termsSheet").hidden = false; return true; } return false; }
$("termsOk").onclick = () => {
  saveProfile({ termsV: TERMS_V, termsAt: Date.now() });
  $("termsBackdrop").hidden = true; $("termsSheet").hidden = true; maybeNews(); if (!newsPending()) maybeWelcomeInstall();
};
function newsPending() {
  if (newsClosed || !S.profile) return false;
  return NEWS_FORCE || (!((S.profile.seen || {})[NEWS_ID]) && !lsGet("seen-" + NEWS_ID));
}
let newsTimer = null;
function maybeNews() {
  clearTimeout(newsTimer);
  if (!newsPending()) return;
  newsTimer = setTimeout(() => { if (S.screen === "home" && newsPending() && !document.body.classList.contains("sheet-open") && !document.body.classList.contains("tour-on") && $("newsSheet").hidden) openNews(); }, 1200);
}
function openNews() {
  closeInstall();
  // Illustration de la diapo 1 : le vrai bouton « ? » et le mannequin de « Comment faire » (départ / arrivée).
  const v = HOW["Squats (poids du corps)"].views[0], box = frameBox(v.frames);
  $("newsHow").innerHTML = `<div class="nh-row"><span class="nh-name">Squat</span><span class="how-btn nh-q"><span>?</span></span></div>
    <div class="nh-figs">${v.frames.map((f, i) => `<figure>${figure(f, ["quadriceps", "fessiers"], box)}<figcaption>${["Départ", "Arrivée"][i]}</figcaption></figure>`).join("")}</div>
    <span class="nh-play">▶ Voir le mouvement</span>`;
  newsGoTo(0);
  $("newsBackdrop").hidden = false; $("newsSheet").hidden = false;
  document.addEventListener("keydown", newsKey);
  $("newsNext").focus();
}
function newsGoTo(i) {
  const slides = [...$("newsTrack").children];
  newsI = Math.max(0, Math.min(slides.length - 1, i));
  $("newsTrack").style.transform = `translateX(${-100 * newsI}%)`;
  slides.forEach((el, k) => { el.inert = k !== newsI; el.setAttribute("aria-hidden", k !== newsI); });
  [...$("newsDots").children].forEach((d, k) => d.classList.toggle("on", k === newsI));
  $("newsSheet").setAttribute("aria-labelledby", "newsTitle" + (newsI + 1));
  const last = newsI === slides.length - 1;
  $("newsPrev").style.visibility = newsI ? "visible" : "hidden";
  $("newsNext").textContent = last ? "C’est parti\u00a0!" : "Suivant";
}
function closeNews() {
  newsClosed = true;
  document.removeEventListener("keydown", newsKey);
  $("newsBackdrop").hidden = true; $("newsSheet").hidden = true; $("newsHow").innerHTML = "";
  lsSet("seen-" + NEWS_ID, 1); saveProfile({ seen: { ...((S.profile && S.profile.seen) || {}), [NEWS_ID]: true } });
}
function newsKey(e) {
  if (e.key === "Escape") closeNews();
  else if (e.key === "ArrowRight") newsGoTo(newsI + 1);
  else if (e.key === "ArrowLeft") newsGoTo(newsI - 1);
}
$("newsSkip").onclick = closeNews;
$("newsPrev").onclick = () => newsGoTo(newsI - 1);
$("newsNext").onclick = () => { if (newsI === $("newsTrack").children.length - 1) closeNews(); else newsGoTo(newsI + 1); };
// Glisser le doigt vers la gauche / la droite pour changer de diapositive.
let newsX = null, newsY = null;
$("newsViewport").addEventListener("touchstart", e => { newsX = e.touches[0].clientX; newsY = e.touches[0].clientY; }, { passive: true });
$("newsViewport").addEventListener("touchend", e => {
  if (newsX == null) return;
  const dx = e.changedTouches[0].clientX - newsX, dy = e.changedTouches[0].clientY - newsY; newsX = null;
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) newsGoTo(newsI + (dx < 0 ? 1 : -1));
}, { passive: true });

export { REACTS, SOC, dirOf, ensureSocialProfile, friendSessionDetail, leaveChat, maybeNews, maybeTerms, myReactsHTML,
  newsPending, openChat, otherOf, refreshSocial, renderChat, renderFriend, renderFriends, reportContent, resetSocial,
  socialCounts, subscribeSocial, syncShare, termsPending, unreadOf, who };
