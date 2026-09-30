// Séances : calendrier du mois, liste, glisser pour supprimer, enregistrement en quittant l'app.
import { flush, openDay } from "./feuille.js";
import { dropPhoto } from "./photos.js";
import { renderTypes } from "./types.js";
import { $, DAYS, DISC, MONTHS, RUN_TYPES, S, cap, dayMeta, dayVolume, esc, fmtDur, key, nf, pad, parse, runKm, runPace, runSecs, sessionsOn, titleOf, todayK, wodScore } from "../commun/core.js";
import { persistDay } from "../commun/store.js";
import { toast } from "../entrainement/index.js";

/* ============================================================
   Séances : calendrier
   ============================================================ */
export function renderMain() {
  const y = S.view.getFullYear(), m = S.view.getMonth();
  $("monthTitle").innerHTML = cap(MONTHS[m]) + " <small>" + y + "</small>";
  const first = (new Date(y, m, 1).getDay() + 6) % 7, count = new Date(y, m + 1, 0).getDate(), tk = todayK();
  let h = "";
  for (let i = 0; i < first; i++) h += '<span class="day pad" aria-hidden="true"></span>';
  for (let d = 1; d <= count; d++) {
    const k = key(new Date(y, m, d)), ks = sessionsOn(k), s = ks.length && S.days[ks[0]], mt = s && dayMeta(s);
    h += `<button class="day${s ? " has" : ""}${k === tk ? " today" : ""}" data-k="${k}" style="--tc:${mt ? mt.color : "#8A847E"}" aria-label="${d} ${MONTHS[m]}${s ? ", " + esc(ks.map(x => titleOf(S.days[x])).join(" et ")) : ""}"><span class="n">${d}</span>${s ? `<span class="t">${esc(mt.short)}</span>` : ""}${ks.length > 1 ? `<span class="more">+${ks.length - 1}</span>` : ""}</button>`;
  }
  $("grid").innerHTML = h;
  $("legend").innerHTML = S.types.filter(t => t.id !== "cordes").map(t => `<span style="--tc:${t.color}"><i class="dot"></i>${esc(t.name)}</span>`).join("")
    + `<span class="legend-sep">Autres activités</span>`
    + [["CrossFit", DISC.crossfit.color], ["Callisthénie", DISC.calis.color], ["Cordes", DISC.cordes.color], ...RUN_TYPES.map(r => [r.name, r.color])]
      .map(([n, c]) => `<span style="--tc:${c}"><i class="dot"></i>${esc(n)}</span>`).join("");
  const ks = Object.keys(S.days).filter(k => k.startsWith(y + "-" + pad(m + 1))).sort().reverse();
  const vol = ks.reduce((a, k) => a + dayVolume(S.days[k]), 0);
  const km = ks.reduce((a, k) => a + runKm(S.days[k]), 0);
  $("sumTitle").textContent = cap(MONTHS[m]) + " en chiffres";
  $("stats").innerHTML = `<div class="stat"><b>${ks.length}</b><span>séance${ks.length > 1 ? "s" : ""}</span></div><div class="stat"><b>${vol >= 10000 ? nf.format(vol / 1000) + " t" : nf.format(vol)}</b><span>${vol >= 10000 ? "soulevées" : "kg soulevés"}</span></div><div class="stat"><b>${nf.format(km)}</b><span>km courus</span></div>`;
  $("list").innerHTML = ks.length ? ks.map(k => {
    const s = S.days[k], mt = dayMeta(s), d = parse(k), ph = (s.photos || []).length;
    return `<div class="swipe"><div class="swipe-bg" aria-hidden="true">🗑 Supprimer</div><button class="row" data-k="${k}" style="--tc:${mt.color}"><i class="bar"></i><span class="d">${DAYS[d.getDay()].slice(0, 3)}<b>${d.getDate()}</b></span><span class="main"><div class="ti">${esc(titleOf(s))}</div><div class="me">${esc(sessionSummary(s))}${ph ? " · " + ph + " photo" + (ph > 1 ? "s" : "") : ""}</div></span><span aria-hidden="true" style="color:var(--red-hi)">›</span></button></div>`;
  }).join("") + `<p class="hint swipe-hint">Astuce : fais glisser une séance vers la droite pour la supprimer.</p>` : `<div class="empty">Aucune séance en ${MONTHS[m]}. Touche un jour du calendrier pour noter ton entraînement.</div>`;
}
// Résumé d'une séance sur une ligne (liste du mois, administration).
export function sessionSummary(s, types) {
  const mt = dayMeta(s, types), disc = mt.disc;
  if (disc === "course") {
    const r = s.run || {}, parts = [mt.name];
    if (r.dist) parts.push(nf.format(r.dist) + " km");
    if (runSecs(r)) parts.push(fmtDur(runSecs(r)));
    if (runPace(r)) parts.push(runPace(r) + " /km");
    return parts.join(" · ");
  }
  if (disc === "crossfit") {
    const w = s.wod || {}, parts = ["CrossFit"];
    if (w.format) parts.push(w.format);
    const sc = wodScore(w); if (sc) parts.push(sc + (w.rx === false ? " (Scaled)" : w.rx ? " (Rx)" : ""));
    return parts.join(" · ");
  }
  const n = (s.exercises || []).length;
  return `${disc === "calis" ? "Callisthénie" : mt.name} · ${n} exercice${n > 1 ? "s" : ""}${dayVolume(s) ? " · " + nf.format(dayVolume(s)) + " kg" : ""}`;
}
$("grid").addEventListener("click", e => { const b = e.target.closest("[data-k]"); if (b) openDay(sessionsOn(b.dataset.k)[0] || b.dataset.k); });
$("list").addEventListener("click", e => { if (SW.moved) { SW.moved = false; return; } const b = e.target.closest("[data-k]"); b && openDay(b.dataset.k); });
// Glisser une séance vers la droite : demande de confirmation puis suppression.
const SW = { row: null, x0: 0, y0: 0, dx: 0, on: false, moved: false };
$("list").addEventListener("pointerdown", e => {
  const row = e.target.closest(".row"); if (!row || (e.pointerType === "mouse" && e.button !== 0)) return;
  Object.assign(SW, { row, x0: e.clientX, y0: e.clientY, dx: 0, on: false, moved: false });
});
$("list").addEventListener("pointermove", e => {
  if (!SW.row) return;
  const dx = e.clientX - SW.x0, dy = e.clientY - SW.y0;
  if (!SW.on) { if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) { SW.row = null; return; } if (dx > 12) { SW.on = true; SW.row.classList.add("dragging"); try { SW.row.setPointerCapture(e.pointerId); } catch (x) { /* rien */ } } else return; }
  SW.dx = Math.max(0, dx); SW.row.style.transform = `translateX(${SW.dx}px)`;
  SW.row.parentElement.classList.toggle("armed", SW.dx > 110);
});
function swipeEnd() {
  const r = SW.row; SW.row = null; if (!r || !SW.on) return;
  SW.moved = true; setTimeout(() => { SW.moved = false; }, 350);
  r.classList.remove("dragging"); r.parentElement.classList.remove("armed");
  const go2 = SW.dx > 110; r.style.transform = "";
  if (go2) askDelete(r.dataset.k);
}
$("list").addEventListener("pointerup", swipeEnd);
$("list").addEventListener("pointercancel", () => { if (SW.row) { SW.row.style.transform = ""; SW.row.classList.remove("dragging"); SW.row.parentElement.classList.remove("armed"); } SW.row = null; });
function askDelete(k) {
  const s = S.days[k]; if (!s) return;
  const d = parse(k);
  $("confirmText").textContent = `« ${titleOf(s)} » du ${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} sera supprimée, avec ses photos. Cette action est définitive.`;
  $("confirmGo").onclick = () => { closeConfirm(); deleteSession(k); };
  $("confirmBackdrop").hidden = false; $("confirmSheet").hidden = false;
}
function closeConfirm() { $("confirmBackdrop").hidden = true; $("confirmSheet").hidden = true; }
$("confirmCancel").onclick = closeConfirm;
$("confirmBackdrop").onclick = closeConfirm;
function deleteSession(k) {
  const s = S.days[k]; if (!s) return;
  (s.photos || []).map(p => p.pid).filter(Boolean).forEach(dropPhoto);
  delete S.days[k]; persistDay(k, null); renderMain();
  toast("🗑 Séance supprimée");
}
$("prev").onclick = () => { S.view = new Date(S.view.getFullYear(), S.view.getMonth() - 1, 1); renderMain(); };
$("next").onclick = () => { S.view = new Date(S.view.getFullYear(), S.view.getMonth() + 1, 1); renderMain(); };
$("today").onclick = () => { const t = new Date(); S.view = new Date(t.getFullYear(), t.getMonth(), 1); renderMain(); openDay(sessionsOn(key(t))[0] || key(t)); };
$("types").onclick = () => { renderTypes(); $("typesSheet").scrollTop = 0; $("typesSheet").classList.add("open"); document.body.style.overflow = "hidden"; document.body.classList.add("sheet-open"); };
let sx = null;
$("seancesCal").addEventListener("touchstart", e => { sx = e.touches[0].clientX; }, { passive: true });
$("seancesCal").addEventListener("touchend", e => {
  if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; sx = null;
  if (Math.abs(dx) > 60) (dx < 0 ? $("next") : $("prev")).click();
}, { passive: true });
window.addEventListener("pagehide", flush);
document.addEventListener("visibilitychange", () => { if (document.hidden) flush(); });
