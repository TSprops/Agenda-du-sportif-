// Social : activité, fil d'actu, commentaires, messages, défis et classements.
import { $, DAYS, DEFAULT_TYPES, S, addDoc, ago, armed, arrayRemove, avatarHTML, cap, clone, collection, dayMeta, dayOf,
  dayVolume, db, deleteDoc, discOf, doc, esc, getDoc, getDocs, isEmpty, key, limit, nf, onSnapshot, orderBy, parse, plural,
  query, runKm, setDoc, show, titleOf, todayK, updateDoc, where } from "./core.js";
import { go, saveProfile } from "./store.js";
import { openDay, renderMain, restOf, sessionSummary } from "./seances.js";
import { MONTHS_S, doneSet, shortDate, tryIdea } from "./ideas.js";
import { lsGet, lsSet } from "./install.js";
import { REACTS, SOC, dirOf, friendSessionDetail, openChat, otherOf, refreshSocial, renderFriend, reportContent, socialCounts,
  unreadOf, who } from "./friends.js";
import { bestSets, cordesOf, exKey, toast } from "./workout.js";
import { addDays, counts, streakInfo } from "./home.js";

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
const BANNED_MSG = "Ton compte est suspendu des fonctions sociales suite à des signalements. Pour en parler, écris depuis la page Contact.";
function bannedStop() { if (!S.banned) return false; toast("⛔ Compte suspendu des fonctions sociales"); return true; }
function renderSocial() {
  const c = socialCounts(), act = activityList().slice(0, 8), seen = seenAct(), nf2 = acceptedFriends().length;
  const live = (SOC.challenges || []).filter(ch => ch.end >= todayK()).length, newCh = newChallenges().length;
  const em = id => (REACTS.find(r => r[0] === id) || [, "👍"])[1];
  $("socialBody").innerHTML = `${S.banned ? `<div class="card ban-card"><b>⛔ Compte suspendu</b><p class="hint">${BANNED_MSG}</p></div>` : ""}<div class="menu">
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
    ${show.map(c => { const d = SOC.dir[c.from] || {}; return `<p class="cmt"><b>${esc(c.from === S.uid ? "Toi" : d.pseudo || c.pseudo || "Ami")}</b> ${esc(c.text)} <small>${esc(ago(c.at))}</small>${c.from === S.uid || owner === S.uid ? `<button type="button" class="c-del" data-cdel="${owner}|${c.id}" aria-label="Supprimer le commentaire">✕</button>` : ""}${c.from !== S.uid ? `<button type="button" class="c-del" data-crep="${owner}|${c.id}" aria-label="Signaler le commentaire">⚑</button>` : ""}</p>`; }).join("")}
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
  if (bannedStop()) return;
  const inp = f.querySelector("input"), text = inp.value.trim(); if (!text) return;
  const [owner, k] = f.dataset.cform.split("|"); inp.value = ""; inp.disabled = true;
  try {
    const c = await postComment(owner, k, text);
    if (owner !== S.uid) { [SOC.feed && SOC.feed.by[owner], SOC.friendUid === owner && SOC.friendData].forEach(x => { if (x) (x.comments = x.comments || []).push(c); }); }
    SOC.openCmt = k; rerenderComments();
  } catch (x) { inp.value = text; toast("Commentaire non envoyé. Vérifie ta connexion."); }
  inp.disabled = false;
});
function findComment(owner, id) {
  const lists = [SOC.myComments, SOC.feed && SOC.feed.by[owner] && SOC.feed.by[owner].comments, SOC.friendUid === owner && SOC.friendData && SOC.friendData.comments];
  for (const l of lists) { const c = (l || []).find(x => x.id === id); if (c) return c; }
  return null;
}
document.addEventListener("click", async e => {
  const rp = e.target.closest("[data-crep]");
  if (rp) {
    if (!armed(rp, "Signaler ?")) return;
    const [owner, id] = rp.dataset.crep.split("|"), c = findComment(owner, id); if (!c) return;
    SOC.reported = SOC.reported || new Set();
    if (SOC.reported.has(id)) { toast("Déjà signalé, merci !"); return; }
    SOC.reported.add(id);
    try { await reportContent({ target: c.from, targetPseudo: c.pseudo, kind: "comment", text: c.text, ref: `comments/${owner}/items/${id}` }); toast("⚑ Merci, le commentaire est signalé"); }
    catch (x) { SOC.reported.delete(id); toast("Signalement impossible. Réessaie."); }
    return;
  }
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
  if (bannedStop()) return;
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
    if (disc === "muscu" || disc === "calis" || disc === "cordes") {
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
  if (!S.oldReady) return;
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
  if (bannedStop()) return;
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
    ${ch.owner === S.uid ? `<button class="danger" data-chdel="1">Supprimer le défi</button>` : `<div class="grid2"><button class="btn ghost-danger" data-chrep="1">⚑ Signaler</button><button class="btn ghost-danger" data-chleave="1">Quitter le défi</button></div>`}`;
  (ch.members || []).forEach(u => { if (!SOC.dir[u] && u !== S.uid) dirOf(u).then(() => { if (S.screen === "challenge") renderChallenge(); }); });
}
$("chdBody").addEventListener("click", async e => {
  const b = e.target.closest("button"); if (!b) return;
  const ch = (SOC.challenges || []).find(c => c.id === SOC.chId); if (!ch) return;
  if (b.dataset.chdel) { if (!armed(b, "Toucher à nouveau pour supprimer")) return; await deleteDoc(doc(db, "challenges", ch.id)).catch(() => {}); go("challenges"); }
  if (b.dataset.chrep) {
    if (!armed(b, "Confirmer")) return;
    try { await reportContent({ target: ch.owner, targetPseudo: (ch.names || {})[ch.owner] || "", kind: "challenge", text: "Défi « " + ch.name + " »", ref: "challenges/" + ch.id }); b.textContent = "Signalé ✓"; b.disabled = true; }
    catch (x) { toast("Signalement impossible. Réessaie."); }
    return;
  }
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

export { acceptedFriends, activityList, bannedStop, bestLifts, commentsHTML, loadFeed, monthShare, myCommentsHTML, newChallenges,
  renderChallenge, renderChallenges, renderMessages, renderRanks, renderSocial, seenAct, subscribeChallenges, syncChallenges,
  toggleReact, trySession };
