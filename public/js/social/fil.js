// Social : fil d'actualité des amis et réactions.
import { acceptedFriends, bannedStop } from "./accueil.js";
import { commentsHTML } from "./commentaires.js";
import { $, DAYS, DEFAULT_TYPES, S, cap, clone, collection, dayMeta, dayOf, db, deleteDoc, discOf, doc, esc, getDoc, getDocs, isEmpty, limit, orderBy, parse, query, setDoc, titleOf, where } from "../commun/core.js";
import { cordesOf, toast } from "../entrainement/index.js";
import { REACTS, SOC, dirOf, friendSessionDetail, who } from "../amis/index.js";
import { MONTHS_S, tryIdea } from "../idees/index.js";
import { restOf, sessionSummary } from "../seances/index.js";

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
export async function loadFeed(force) {
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
export function renderFeed() {
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
export async function toggleReact(uid, k, id, holder) {
  if (bannedStop()) return;
  const ref = doc(db, "reacts", uid, "items", k + "__" + S.uid), mine = holder.reacts.find(r => r.date === k && r.from === S.uid);
  try {
    if (mine && mine.emoji === id) { await deleteDoc(ref); holder.reacts = holder.reacts.filter(r => r !== mine); }
    else { const r = { date: k, from: S.uid, emoji: id, at: Date.now() }; await setDoc(ref, r); holder.reacts = holder.reacts.filter(x => x !== mine).concat(r); }
  } catch (x) { toast("Réaction impossible (connexion ?)"); }
}
export function trySession(btn, uid, s, types) {
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
