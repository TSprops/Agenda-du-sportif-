// Séances : calendrier du mois, liste, glisser pour supprimer, enregistrement en quittant l'app.
import { flush, openDay } from "./feuille.js";
import { dropPhoto } from "./photos.js";
import { renderTypes } from "./types.js";
import { hyroxTotal } from "./fiche-hyrox.js";
import { $, DISC, RUN_TYPES, S, dayMeta, dayVolume, esc, fmtDur, fmtJour, fmtJourMois, fmtMois, fmtKm, jourCourt, key, nf, nomFormat, nomType, pad, parse, runKm, runPace, runSecs, sessionsOn, sortieKm, titleOf, todayK, wodScore } from "../commun/core.js";
import { liste, majuscule, t } from "../commun/i18n.js";
import { persistDay } from "../commun/store.js";
import { toast } from "../entrainement/index.js";

/* ============================================================
   Séances : calendrier
   ============================================================ */
export function renderMain() {
  const y = S.view.getFullYear(), m = S.view.getMonth();
  $("monthTitle").innerHTML = esc(majuscule(fmtMois(S.view))) + " <small>" + y + "</small>";
  const first = (new Date(y, m, 1).getDay() + 6) % 7, count = new Date(y, m + 1, 0).getDate(), tk = todayK();
  let h = "";
  for (let i = 0; i < first; i++) h += '<span class="day pad" aria-hidden="true"></span>';
  for (let d = 1; d <= count; d++) {
    const k = key(new Date(y, m, d)), ks = sessionsOn(k), s = ks.length && S.days[ks[0]], mt = s && dayMeta(s);
    h += `<button class="day${s ? " has" : ""}${k === tk ? " today" : ""}" data-k="${k}" style="--tc:${mt ? mt.color : "#8A847E"}" aria-label="${esc(fmtJourMois(new Date(y, m, d)) + (s ? ", " + liste(ks.map(x => titleOf(S.days[x]))) : ""))}"><span class="n">${d}</span>${s ? `<span class="t">${esc(mt.short)}</span>` : ""}${ks.length > 1 ? `<span class="more">+${ks.length - 1}</span>` : ""}</button>`;
  }
  $("grid").innerHTML = h;
  $("legend").innerHTML = S.types.filter(ty => ty.id !== "cordes").map(ty => `<span style="--tc:${ty.color}"><i class="dot"></i>${esc(nomType(ty.name))}</span>`).join("")
    + `<span class="legend-sep">${t("seances.autresActivites")}</span>`
    + [...["crossfit", "calis", "cordes", "hyrox"].map(id => [DISC[id].name, DISC[id].color]), ...RUN_TYPES.map(r => [r.name, r.color])]
      .map(([n, c]) => `<span style="--tc:${c}"><i class="dot"></i>${esc(n)}</span>`).join("");
  const ks = Object.keys(S.days).filter(k => k.startsWith(y + "-" + pad(m + 1))).sort().reverse();
  const vol = ks.reduce((a, k) => a + dayVolume(S.days[k]), 0);
  const km = ks.reduce((a, k) => a + runKm(S.days[k]), 0);
  $("sumTitle").textContent = t("seances.enChiffres", { mois: majuscule(fmtMois(S.view)) });
  $("stats").innerHTML = `<div class="stat"><b>${ks.length}</b><span>${t("bilan.seances", { n: ks.length })}</span></div><div class="stat"><b>${vol >= 10000 ? nf.format(vol / 1000) + " t" : nf.format(vol)}</b><span>${t(vol >= 10000 ? "bilan.tonnesSoulevees" : "bilan.kgSouleves")}</span></div><div class="stat"><b>${nf.format(km)}</b><span>${t("bilan.kmCourus")}</span></div>`;
  $("list").innerHTML = ks.length ? ks.map(k => {
    const s = S.days[k], mt = dayMeta(s), d = parse(k), ph = (s.photos || []).length;
    return `<div class="swipe"><div class="swipe-bg" aria-hidden="true">${t("seances.glisserSupprimer")}</div><button class="row" data-k="${k}" style="--tc:${mt.color}"><i class="bar"></i><span class="d">${esc(jourCourt(d))}<b>${d.getDate()}</b></span><span class="main"><div class="ti">${esc(titleOf(s))}</div><div class="me">${esc(sessionSummary(s))}${ph ? " · " + esc(t("seances.photos", { n: ph })) : ""}</div></span><span aria-hidden="true" style="color:var(--red-hi)">›</span></button></div>`;
  }).join("") + `<p class="hint swipe-hint">${t("seances.astuceGlisser")}</p>` : `<div class="empty">${esc(t("seances.aucuneMois", { mois: fmtMois(S.view) }))}</div>`;
}
// Résumé d'une séance sur une ligne (liste du mois, administration).
export function sessionSummary(s, types) {
  const mt = dayMeta(s, types), disc = mt.disc;
  if (disc === "course") {
    const r = s.run || {}, parts = [mt.name];
    if (runKm(s)) parts.push(fmtKm(runKm(s)));
    if (runSecs(r)) parts.push(fmtDur(runSecs(r)));
    if (sortieKm(s) && runPace(r)) parts.push(runPace(r) + " /km");
    return parts.join(" · ");
  }
  if (disc === "crossfit") {
    const w = s.wod || {}, parts = [DISC.crossfit.name];
    if (w.format) parts.push(nomFormat(w.format));
    const sc = wodScore(w); if (sc) parts.push(sc + (w.rx === false ? " (Scaled)" : w.rx ? " (Rx)" : ""));
    return parts.join(" · ");
  }
  if (disc === "hyrox") {
    const n = (s.exercises || []).filter(x => String(x.name || "").trim()).length, tot = hyroxTotal(s);
    return `${DISC.hyrox.name} · ${t("seances.ateliers", { n })}${tot ? " · " + fmtDur(tot) : ""}`;
  }
  const n = (s.exercises || []).length;
  return `${disc === "calis" ? DISC.calis.name : mt.name} · ${t("seances.exercices", { n })}${dayVolume(s) ? " · " + nf.format(dayVolume(s)) + " kg" : ""}`;
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
  $("confirmText").textContent = t("confirmation.texte", { titre: titleOf(s), date: fmtJour(d) });
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
  toast(t("seances.supprimee"));
}
$("prev").onclick = () => { S.view = new Date(S.view.getFullYear(), S.view.getMonth() - 1, 1); renderMain(); };
$("next").onclick = () => { S.view = new Date(S.view.getFullYear(), S.view.getMonth() + 1, 1); renderMain(); };
$("today").onclick = () => { const d = new Date(); S.view = new Date(d.getFullYear(), d.getMonth(), 1); renderMain(); openDay(sessionsOn(key(d))[0] || key(d)); };
$("types").onclick = () => { renderTypes(); $("typesSheet").scrollTop = 0; $("typesSheet").classList.add("open"); document.body.style.overflow = "hidden"; document.body.classList.add("sheet-open"); };
let sx = null;
$("seancesCal").addEventListener("touchstart", e => { sx = e.touches[0].clientX; }, { passive: true });
$("seancesCal").addEventListener("touchend", e => {
  if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; sx = null;
  if (Math.abs(dx) > 60) (dx < 0 ? $("next") : $("prev")).click();
}, { passive: true });
window.addEventListener("pagehide", flush);
document.addEventListener("visibilitychange", () => { if (document.hidden) flush(); });
