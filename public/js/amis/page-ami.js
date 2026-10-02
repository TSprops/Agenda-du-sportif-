// Amis : page d'un ami (records, séances, réactions).
import { openChat, reportContent } from "./conversation.js";
import { REACTS, SOC, dirOf } from "./etat.js";
import { blockUser } from "./liste.js";
import { $, DAYS, DEFAULT_TYPES, S, armed, avatarHTML, collection, dayMeta, dayOf, db, discOf, doc, esc, fmtDur, fmtKm, getDoc, getDocs, isEmpty, limit, nf, orderBy, parse, query, runKm, runPace, runSecs, sortieKm, titleOf, where, wodScore } from "../commun/core.js";
import { calisDepText, cordesText, toast } from "../entrainement/index.js";
import { MONTHS_S } from "../idees/index.js";
import { hyroxText, sessionSummary } from "../seances/index.js";
import { commentsHTML, toggleReact, trySession } from "../social/index.js";
import { go } from "../commun/store.js";

/* ---------- Page d'un ami : records, séances, réactions ---------- */
export async function openFriend(uid) {
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
export function friendSessionDetail(s, types) {
  const disc = discOf(s);
  if (disc === "course") {
    const r = s.run || {};
    const km = runKm(s), sk = sortieKm(s);
    return `<ul class="fs-list">${km ? `<li>${fmtKm(km)}${sk && runSecs(r) ? " en " + fmtDur(runSecs(r)) : ""}${sk && runPace(r) ? " · " + runPace(r) + " /km" : ""}</li>` : ""}${(r.blocks || []).filter(b => b.rep || b.eff).map(b => `<li>${esc(b.rep || 1)} × ${esc(b.eff)} ${esc(b.unit || "")}${b.pace ? " · " + esc(b.pace) : ""}${b.rec ? " · récup " + esc(b.rec) : ""}</li>`).join("")}</ul>`;
  }
  if (disc === "crossfit") {
    const w = s.wod || {};
    return `<ul class="fs-list">${w.format ? `<li>${esc(w.format)}${w.cap ? " · " + esc(w.cap) + " min" : ""}</li>` : ""}${(w.moves || []).filter(m => m.name).map(m => `<li>${esc(m.reps || "")} ${esc(m.name)}${m.kg ? " · " + esc(m.kg) + " kg" : ""}</li>`).join("")}${wodScore(w) ? `<li>Score : <b>${esc(wodScore(w))}</b>${w.rx ? " (Rx)" : w.rx === false ? " (Scaled)" : ""}</li>` : ""}</ul>`;
  }
  return `<ul class="fs-list">${(s.exercises || []).filter(x => x.name).map(x => {
    if (x.kind === "cordes") return `<li><b>${esc(x.name)}</b> — ${esc(cordesText(x))}</li>`;
    if (x.kind === "hyrox") return `<li><b>${esc(x.name)}</b> — ${esc(hyroxText(x))}</li>`;
    if (x.mode === "dep") return `<li><b>${esc(x.name)}</b> — ${esc(calisDepText(x))}</li>`;
    const sets = (x.sets || []).filter(st => st.reps !== "" && st.reps != null);
    return `<li><b>${esc(x.name)}</b> — ${sets.length ? sets.map(st => esc(st.reps) + (x.hold ? " s" : "") + (st.kg ? " × " + nf.format(st.kg) + " kg" : "")).join(", ") : (x.sets || []).length + " séries"}</li>`;
  }).join("")}</ul>`;
}
export function renderFriend() {
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
export function myReactsHTML(k) {
  const list = SOC.myReacts.filter(r => r.date === k); if (!list.length) return "";
  return REACTS.map(([id, em]) => { const n = list.filter(r => r.emoji === id).length; return n ? `<span class="react on">${em} ${n}</span>` : ""; }).join("") + `<span class="hint">de tes amis</span>`;
}
