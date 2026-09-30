// Social : classements entre amis et bilan du mois partageable.
import { acceptedFriends } from "./accueil.js";
import { $, S, avatarHTML, dayOf, dayVolume, db, doc, esc, getDoc, nf, runKm, todayK } from "../core.js";
import { bestSets, exKey } from "../entrainement/index.js";
import { SOC, dirOf } from "../amis/index.js";
import { counts, streakInfo } from "../home.js";
import { doneSet } from "../idees/index.js";

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
export function bestLifts() {
  const m = {};
  Object.keys(S.days).forEach(k => (S.days[k].exercises || []).forEach(ex => {
    const n = String(ex.name || "").trim(); if (!n) return; const b = bestSets(ex.sets, doneSet); if (!b.reps) return;
    const id = exKey(n), cur = m[id] || { n, kg: 0, r: 0, c: 0 }; cur.c++;
    if (b.kg > cur.kg || (b.kg === cur.kg && (b.kg ? b.rk : b.reps) > cur.r)) { cur.kg = b.kg; cur.r = b.kg ? b.rk : b.reps; cur.n = n; }
    m[id] = cur;
  }));
  return Object.fromEntries(Object.entries(m).sort((a, b) => b[1].c - a[1].c).slice(0, 40).map(([id, v]) => [id, { n: v.n, kg: v.kg, r: v.r }]));
}
export function monthShare() {
  const mk = todayK().slice(0, 7), ks = Object.keys(S.days).filter(k => k.startsWith(mk) && counts(S.days[k]));
  return { mk, seances: ks.length, jours: new Set(ks.map(dayOf)).size, km: Math.round(ks.reduce((a, k) => a + runKm(S.days[k]), 0) * 10) / 10, volume: Math.round(ks.reduce((a, k) => a + dayVolume(S.days[k]), 0)) };
}
export function renderRanks() {
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
