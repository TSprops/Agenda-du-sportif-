// Progression : courbes SVG par exercice et par activité.
import { benchEntries, cfData, shortDate } from "./crossfit.js";
import { fmtTime } from "./idees-seances.js";
import { $, BENCH, DISC, LIFTS, RUN_TYPES, S, discOf, esc, nf, runSecs, typeOf } from "../core.js";
import { norm } from "../faq.js";

/* ---------- Graphiques de progression (courbes SVG) ---------- */
const CHARTS = {};
function niceStep(raw, time) {
  if (time) { const opts = [5, 10, 15, 30, 60, 120, 300, 600]; return opts.find(o => o >= raw) || Math.ceil(raw / 600) * 600; }
  const p = Math.pow(10, Math.floor(Math.log10(raw || 1))), f = raw / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
}
// pts : [{ k: "AAAA-MM-JJ", v: nombre }] triés par date. fmt : texte d'une valeur. better : "up" ou "down".
function lineChart(id, pts, { fmt, color, better = "up", time = false, tickFmt }) {
  const W = 340, H = 168, L = 46, R = 16, T = 22, B = 26, n = pts.length;
  const vals = pts.map(p => p.v);
  let lo = Math.min(...vals), hi = Math.max(...vals);
  if (lo === hi) { const d = Math.abs(lo) * 0.1 || 1; lo -= d; hi += d; }
  const step = niceStep((hi - lo) / 3, time);
  lo = Math.floor(lo / step) * step; hi = Math.ceil(hi / step) * step;
  if (!time && lo < 0 && Math.min(...vals) >= 0) lo = 0;
  const ticks = []; for (let t = lo; t <= hi + step / 1000; t += step) ticks.push(t);
  const X = i => n === 1 ? L + (W - L - R) / 2 : L + i * (W - L - R) / (n - 1);
  const Y = v => T + (hi - v) / (hi - lo || 1) * (H - T - B);
  const tf = tickFmt || fmt;
  const bestV = better === "down" ? Math.min(...vals) : Math.max(...vals), bestI = vals.lastIndexOf(bestV), lastI = n - 1;
  // Étiquette placée du côté libre du point (au-dessus d'un sommet, en dessous d'un creux), toujours dans le cadre.
  const lab = (i) => {
    const y0 = Y(pts[i].v), isMax = pts[i].v >= Math.max(...vals), isMin = pts[i].v <= Math.min(...vals);
    let above = isMax || (!isMin && better === "up");
    if (isMin && !isMax) above = false;
    let y = y0 + (above ? -11 : 19), side = false;
    if (y < 10) y = y0 + 19;
    if (y > H - B - 2) { y = y0 + 4; side = true; } // pas de place en dessous : à côté du point
    let anchor = X(i) > W - R - 40 ? "end" : X(i) < L + 40 ? "start" : "middle";
    let x = anchor === "end" ? X(i) + 4 : anchor === "start" ? X(i) - 4 : X(i);
    if (side) { anchor = X(i) > W / 2 ? "end" : "start"; x = anchor === "end" ? X(i) - 10 : X(i) + 10; }
    return `<text class="c-lab" x="${x}" y="${y}" text-anchor="${anchor}">${esc(fmt(pts[i].v))}</text>`;
  };
  CHARTS[id] = { pts, X, Y, fmt, W };
  return `<div class="chart" data-chart="${id}" style="--cc:${color}">
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Courbe de progression, ${n} séances">
      ${ticks.map(t => `<line class="c-grid" x1="${L}" x2="${W - R}" y1="${Y(t)}" y2="${Y(t)}"/><text class="c-tick" x="${L - 6}" y="${Y(t) + 3.5}" text-anchor="end">${esc(tf(t))}</text>`).join("")}
      <text class="c-tick" x="${X(0)}" y="${H - 6}" text-anchor="${n === 1 ? "middle" : "start"}">${esc(shortDate(pts[0].k))}</text>
      ${n > 1 ? `<text class="c-tick" x="${X(lastI)}" y="${H - 6}" text-anchor="end">${esc(shortDate(pts[lastI].k))}</text>` : ""}
      <line class="c-xh" x1="0" x2="0" y1="${T - 6}" y2="${H - B}" style="opacity:0"/>
      ${n > 1 ? `<path class="c-line" d="${pts.map((p, i) => (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(p.v).toFixed(1)).join(" ")}"/>` : ""}
      ${pts.map((p, i) => `<circle class="c-pt${i === bestI ? " best" : ""}" cx="${X(i).toFixed(1)}" cy="${Y(p.v).toFixed(1)}" r="${i === lastI || i === bestI ? 5 : 4}"/>`).join("")}
      ${lab(bestI)}${lastI !== bestI && pts[lastI].v !== bestV ? lab(lastI) : ""}
      <rect class="c-hit" x="${L - 10}" y="0" width="${W - L - R + 20}" height="${H}"/>
    </svg>
    <div class="c-tip" hidden></div>
  </div>`;
}
function chartPoint(el, clientX) {
  const c = CHARTS[el.dataset.chart]; if (!c) return;
  const svg = el.querySelector("svg"), r = svg.getBoundingClientRect(), x = (clientX - r.left) / r.width * c.W;
  let bi = 0, bd = 1e9; c.pts.forEach((p, i) => { const d = Math.abs(c.X(i) - x); if (d < bd) { bd = d; bi = i; } });
  const px = c.X(bi), xh = el.querySelector(".c-xh"), tip = el.querySelector(".c-tip");
  xh.setAttribute("x1", px); xh.setAttribute("x2", px); xh.style.opacity = 1;
  el.querySelectorAll(".c-pt").forEach((ci, i) => ci.classList.toggle("on", i === bi));
  tip.hidden = false; tip.innerHTML = `<b>${esc(c.fmt(c.pts[bi].v))}</b><span>${esc(shortDate(c.pts[bi].k))}${c.pts[bi].note ? " · " + esc(c.pts[bi].note) : ""}</span>`;
  const pct = px / c.W * 100; tip.style.left = `clamp(0px, calc(${pct}% - 60px), calc(100% - 120px))`;
}
document.addEventListener("pointermove", e => { const el = e.target.closest && e.target.closest(".chart"); if (el && e.pointerType === "mouse") chartPoint(el, e.clientX); });
document.addEventListener("pointerdown", e => { const el = e.target.closest && e.target.closest(".chart"); if (el) chartPoint(el, e.clientX); });
// Carte d'un graphique : titre, meilleur résultat, évolution, courbe et tableau des valeurs.
function chartCard(id, title, pts, opt) {
  const first = pts[0].v, last = pts[pts.length - 1].v, diff = last - first, better = opt.better || "up";
  const good = better === "up" ? diff > 0 : diff < 0;
  const best = better === "down" ? Math.min(...pts.map(p => p.v)) : Math.max(...pts.map(p => p.v));
  const evo = pts.length < 2 || !diff ? `<span class="evo">${pts.length < 2 ? "1 séance pour l’instant" : "stable"}</span>`
    : `<span class="evo ${good ? "up" : "down"}">${good ? "▲" : "▼"} ${esc(opt.diffFmt ? opt.diffFmt(Math.abs(diff)) : opt.fmt(Math.abs(diff)))} depuis le ${esc(shortDate(pts[0].k))}</span>`;
  return `<article class="prog-card" style="--cc:${opt.color}">
    <div class="prog-top"><b>${esc(title)}</b><span class="prog-best"><small>${opt.bestLabel || "Record"}</small>${esc(opt.fmt(best))}</span></div>
    ${evo}
    ${lineChart(id, pts, opt)}
    <details class="prog-tab"><summary>Voir les valeurs</summary><table><tbody>${pts.slice().reverse().map(p => `<tr><td>${esc(shortDate(p.k))}</td><td>${esc(opt.fmt(p.v))}</td></tr>`).join("")}</tbody></table></details>
  </article>`;
}
const emptyProg = txt => `<div class="empty">${txt}</div>`;
// Regroupe les séances par exercice (nom sans accents ni majuscules) : un point par séance.
function exerciseSeries(days, valueOf) {
  const map = new Map();
  days.forEach(k => (S.days[k].exercises || []).forEach(ex => {
    const name = String(ex.name || "").trim(); if (!name) return;
    const v = valueOf(ex); if (!v) return;
    const key = norm(name).replace(/\s+/g, " ").trim() + (ex.hold ? "#t" : "");
    const it = map.get(key) || { name, hold: !!ex.hold, pts: [] };
    it.name = name; const prev = it.pts.find(p => p.k === k);
    if (prev) prev.v = Math.max(prev.v, v); else it.pts.push({ k, v });
    map.set(key, it);
  }));
  return [...map.values()].sort((a, b) => b.pts.length - a.pts.length || a.name.localeCompare(b.name));
}
export const doneSet = st => st.reps !== "" && st.reps != null;
export function renderProg() {
  const d = S.prog, x = DISC[d]; if (!x) return;
  $("progTitle").textContent = "Progression · " + x.name; $("v-prog").style.setProperty("--tc", x.color);
  const days = Object.keys(S.days).filter(k => discOf(S.days[k]) === d).sort();
  let h = "";
  if (d === "muscu") {
    const used = S.types.filter(t => days.some(k => S.days[k].typeId === t.id));
    const tab = S.progTab && used.some(t => t.id === S.progTab) ? S.progTab : (used[0] && used[0].id);
    if (!used.length) h = emptyProg("Pas encore de séance de musculation. Note tes séances avec leurs poids : ta progression s’affichera ici, exercice par exercice.");
    else {
      const t = typeOf(tab), series = exerciseSeries(days.filter(k => S.days[k].typeId === tab),
        ex => Math.max(0, ...(ex.sets || []).filter(doneSet).map(st => +st.kg || 0)));
      h = `<div class="chips">${used.map(u => `<button class="chip" data-ptab="${u.id}" style="--tc:${u.color}" aria-pressed="${u.id === tab}"><i class="dot"></i>${esc(u.name)}</button>`).join("")}</div>
        <p class="hint" style="margin:-10px 0 0">Charge maximale soulevée à chaque séance ${esc(t.name)}. Touche une courbe pour voir le détail.</p>
        ${series.length ? `<div class="list">${series.slice(0, 15).map((s, i) => chartCard("m" + i, s.name, s.pts, { fmt: v => nf.format(v) + " kg", tickFmt: v => nf.format(v), color: t.color })).join("")}</div>`
          : emptyProg("Aucun poids noté dans tes séances " + esc(t.name) + " pour l’instant.")}`;
    }
  } else if (d === "calis") {
    const series = exerciseSeries(days, ex => Math.max(0, ...(ex.sets || []).map(st => +st.reps || 0)));
    h = series.length ? `<p class="hint" style="margin-top:-10px">Ton meilleur résultat par séance : répétitions, ou secondes pour les figures tenues.</p>
      <div class="list">${series.slice(0, 15).map((s, i) => chartCard("c" + i, s.name, s.pts, { fmt: v => v + (s.hold ? " s" : " reps"), tickFmt: v => String(v), color: DISC.calis.color, bestLabel: "Max" })).join("")}</div>`
      : emptyProg("Pas encore de séance de callisthénie notée. Ta progression s’affichera ici, exercice par exercice.");
  } else if (d === "course") {
    const tab = S.progTab || "all";
    const sel = days.filter(k => tab === "all" || S.days[k].runType === tab);
    const col = tab === "all" ? DISC.course.color : RUN_TYPES.find(r => r.id === tab).color;
    const pace = sel.map(k => { const r = S.days[k].run || {}, t = runSecs(r), dist = +r.dist || 0; return t && dist ? { k, v: Math.round(t / dist) } : null; }).filter(Boolean);
    const dist = sel.map(k => { const r = S.days[k].run || {}; return +r.dist ? { k, v: +r.dist } : null; }).filter(Boolean);
    h = `<div class="chips"><button class="chip" data-ptab="all" style="--tc:${DISC.course.color}" aria-pressed="${tab === "all"}">Toutes</button>${RUN_TYPES.map(r => `<button class="chip" data-ptab="${r.id}" style="--tc:${r.color}" aria-pressed="${r.id === tab}"><i class="dot"></i>${r.name}</button>`).join("")}</div>
      ${pace.length ? `<div class="list">
        ${chartCard("rp", "Allure moyenne", pace, { fmt: v => fmtTime(v) + " /km", tickFmt: v => fmtTime(v), diffFmt: v => fmtTime(v) + " /km", color: col, better: "down", time: true, bestLabel: "Meilleure" })}
        ${chartCard("rd", "Distance", dist, { fmt: v => nf.format(v) + " km", tickFmt: v => nf.format(v), color: col, bestLabel: "Plus longue" })}
      </div><p class="hint">Pour l’allure, plus la courbe descend, plus tu cours vite.</p>`
        : emptyProg("Pas encore de sortie avec distance et durée. Entre-les dans tes séances de course : ton allure et tes distances s’afficheront ici.")}`;
  } else if (d === "crossfit") {
    const cf = cfData();
    const benches = BENCH.map(bm => ({ bm, ents: benchEntries(bm).slice().sort((a, b) => a.date < b.date ? -1 : 1) })).filter(o => o.ents.length);
    const lifts = LIFTS.map(([id, name]) => ({ id, name, pts: (cf.prs[id] || []).slice().sort((a, b) => a.date < b.date ? -1 : 1).map(e => ({ k: e.date, v: e.kg })) })).filter(o => o.pts.length);
    h = `${benches.length ? `<h2 class="h2">WOD de référence</h2><div class="list">${benches.map((o, i) => o.bm.type === "amrap"
        ? chartCard("b" + i, o.bm.name, o.ents.map(e => ({ k: e.date, v: e.r + (e.reps || 0) / 100, note: e.rx === false ? "Scaled" : "Rx" })), { fmt: v => `${Math.floor(v)} tours + ${Math.round((v % 1) * 100)}`, tickFmt: v => String(Math.round(v)), diffFmt: v => nf.format(v) + " tour(s)", color: DISC.crossfit.color, bestLabel: "Record" })
        : chartCard("b" + i, o.bm.name, o.ents.map(e => ({ k: e.date, v: e.t, note: e.rx === false ? "Scaled" : "Rx" })), { fmt: fmtTime, color: DISC.crossfit.color, better: "down", time: true, bestLabel: "Record" })).join("")}</div>` : ""}
      ${lifts.length ? `<h2 class="h2">Records 1RM</h2><div class="list">${lifts.map((o, i) => chartCard("l" + i, o.name, o.pts, { fmt: v => nf.format(v) + " kg", tickFmt: v => nf.format(v), color: DISC.crossfit.color })).join("")}</div>` : ""}
      ${!benches.length && !lifts.length ? emptyProg("Note tes résultats sur les WOD de référence (Fran, Murph…) et tes 1RM dans « Mes records » : leur évolution s’affichera ici.") : ""}
      ${benches.length ? `<p class="hint">Pour un WOD en temps, plus la courbe descend, plus tu es rapide.</p>` : ""}`;
  }
  $("progBody").innerHTML = h;
}
$("v-prog").addEventListener("click", e => { const t = e.target.closest("[data-ptab]"); if (t) { S.progTab = t.dataset.ptab; renderProg(); } });
