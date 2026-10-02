// Séances, fiche du jour : séries, repos, état de chaque série (fait, en cours, à faire).
import { changed } from "./feuille.js";
import { $, S, dayMeta, dayOf, discOf, exVolume, nf, pad, todayK } from "../commun/core.js";
import { RT } from "../commun/timer.js";
import { t } from "../commun/i18n.js";

/* ============================================================
   Séances : fiche du jour
   ============================================================ */
export function rpeColor(v) { return v <= 6 ? "#2FBF71" : v <= 8 ? "#FF9F0A" : "#FF3B30"; }
export function rpeLabel(v) { return t("rpe." + (!v ? "aucun" : v <= 5 ? "facile" : v === 6 ? "moderee" : v === 7 ? "reserve3" : v === 8 ? "reserve2" : v === 9 ? "reserve1" : "echec")); }
export function effortLabel(v) { return t("effort." + (!v ? "aucun" : v <= 3 ? "tresFacile" : v <= 5 ? "facile" : v <= 7 ? "soutenu" : v <= 9 ? "tresDur" : "maximal")); }
export function restOf(ex) { return typeof ex.rest === "number" ? ex.rest : 90; }
export function fmtRest(v) { if (!v) return t("series.aucunRepos"); const m = Math.floor(v / 60), sec = v % 60; return m ? m + " min" + (sec ? " " + pad(sec) : "") : sec + " s"; }
export function exStats(ex, disc) {
  const s = (ex.sets || []).filter(x => x.reps !== "" || x.kg !== "");
  if (!s.length) return t("series.aucuneRemplie");
  const best = Math.max(0, ...s.map(x => +x.kg || 0));
  if (disc === "calis") {
    const tot = s.reduce((a, x) => a + (+x.reps || 0), 0);
    return [t("series.nSeries", { n: s.length }), t(ex.hold ? "series.totalTenue" : "series.totalReps", { n: tot }), best ? t("series.lestMax", { kg: nf.format(best) }) : ""].filter(Boolean).join(" · ");
  }
  const v = exVolume(ex);
  return [t("series.nSeries", { n: s.length }), best ? t("series.max", { kg: nf.format(best) }) : "", v ? t("series.volume", { kg: nf.format(v) }) : ""].filter(Boolean).join(" · ");
}
// Dernière séance comparable, pour la reprendre (musculation : même type ; callisthénie : n'importe laquelle).
export function lastComparable(c, before) {
  const disc = c.disc;
  if (disc !== "muscu" && disc !== "calis" && disc !== "cordes") return null;
  if (disc === "muscu" && !c.typeId) return null;
  const same = k => disc === "cordes" ? dayMeta(S.days[k]).disc === "cordes" : discOf(S.days[k]) === disc && (disc === "calis" || S.days[k].typeId === c.typeId);
  return Object.keys(S.days).filter(k => k < before && same(k) && (S.days[k].exercises || []).length).sort().pop();
}
// Une série n'est « faite » que si on la valide (bouton « Série finie » ou toucher sur son numéro).
// Pour les séances des jours passés notées avant cette règle, une série remplie compte comme faite.
export function isDone(st) {
  if (st.done === true) return true;
  if (st.done === false) return false;
  return !!(S.open && dayOf(S.open) < todayK() && st.reps !== "" && st.reps != null);
}
export const resting = i => !!(RT.tick && RT.ex === i && RT.day === S.open);
export function activeSet(ex, i) {
  if (resting(i) || ex.fini) return -1;
  const sets = ex.sets || [];
  if (typeof ex.cur === "number" && sets[ex.cur] && !isDone(sets[ex.cur])) return ex.cur;
  return sets.findIndex(st => !isDone(st));
}
// Exercice en cours : celui choisi en dernier s'il reste des séries, sinon le premier non terminé.
function focusEx() {
  const L = (S.cur && S.cur.exercises) || [];
  if (RT.tick && RT.day === S.open && RT.ex != null && L[RT.ex]) return RT.ex;
  const open = ex => !ex.fini && (ex.sets || []).some(st => !isDone(st));
  if (typeof S.cur.focus === "number" && L[S.cur.focus] && open(L[S.cur.focus])) return S.cur.focus;
  return L.findIndex(open);
}
// Valide une série : sans répétitions saisies, on reprend l'objectif.
export function validateSet(st) {
  st.done = true;
  if ((st.reps === "" || st.reps == null) && st.target !== undefined && st.target !== "") st.reps = st.target;
}
// Passer à la série j (toucher son numéro ou une de ses cases) : les séries d'avant se valident
// toutes seules, sans lancer de repos. Renvoie vrai si quelque chose a changé.
export function jumpToSet(ex, i, j) {
  const sets = ex.sets || []; if (!sets[j] || isDone(sets[j]) || ex.fini) return false;
  let moved = false;
  sets.forEach((st, k) => { if (k < j && !isDone(st)) { validateSet(st); moved = true; } });
  if (ex.cur !== j) { ex.cur = j; moved = true; }
  if (S.cur.focus !== i) { S.cur.focus = i; moved = true; }
  return moved;
}
// « Exercice fini » : les séries remplies sont validées, l'exercice repasse au gris.
export function finishEx(ex) {
  (ex.sets || []).forEach(st => { if (!isDone(st) && st.reps !== "" && st.reps != null) validateSet(st); });
  ex.fini = true; ex.cur = null;
}
export const canFinish = ex => !ex.fini && (ex.sets || []).length > 0;
export function setState(ex, j, i) {
  if (ex.fini) return "";
  if (isDone(ex.sets[j])) return "done";
  if (j === activeSet(ex, i) && i === focusEx()) return "cur";
  if (resting(i) && j === (ex.sets || []).findIndex(st => !isDone(st))) return "next";
  return "";
}
export function setNowText(ex, i) {
  const sets = ex.sets || [], n = sets.length; if (!n) return "";
  if (ex.fini) return `<span class="ok">${t("series.toutesFaites")}</span>`;
  if (resting(i)) { const nx = sets.findIndex(st => !isDone(st)); return nx === -1 ? `<span class="ok">${t("series.derniereFaite")}</span>` : t("series.reposEnsuite", { n: `<b>${nx + 1}</b>` }); }
  const a = activeSet(ex, i);
  if (a === -1) return `<span class="ok">${t("series.toutesFaites")}</span>`;
  return i === focusEx() ? `<span class="dot-live"></span>${t("series.enCours", { i: `<b>${a + 1}</b>`, n })}` : t("series.aFaire", { fait: sets.filter(isDone).length, n });
}
export function goLabel(ex, i) {
  const a = activeSet(ex, i);
  if (resting(i)) return t("series.reposEnCours");
  return a === -1 ? t("series.lancerRepos") : t("series.serieFinie", { n: a + 1, repos: fmtRest(restOf(ex)) });
}
export function refreshAllSets() { ((S.cur && S.cur.exercises) || []).forEach((_, k) => refreshSets(k)); }
export function refreshSets(i) {
  const ex = S.cur && S.cur.exercises && S.cur.exercises[i]; if (!ex) return;
  ex.sets.forEach((_, j) => { const r = $("row-" + i + "-" + j); if (r) r.className = setState(ex, j, i); });
  const sn = $("sn-" + i); if (sn) sn.innerHTML = setNowText(ex, i);
  const g = $("go-" + i); if (g) { g.textContent = goLabel(ex, i); g.disabled = resting(i); g.hidden = !!ex.fini; }
  const f = $("fini-" + i); if (f) f.hidden = !canFinish(ex);
}
// Fin du repos : la série suivante s'allume et l'écran défile jusqu'à elle (ou jusqu'à l'exercice suivant).
export function advanceAfterRest(i) {
  if (!S.cur || !S.cur.exercises || i == null) return;
  let ei = i, a = activeSet(S.cur.exercises[i], i);
  if (a === -1) { ei = S.cur.exercises.findIndex((ex, k) => k > i && activeSet(ex, k) !== -1); if (ei === -1) ei = S.cur.exercises.findIndex((ex, k) => activeSet(ex, k) !== -1); }
  S.cur.focus = ei === -1 ? null : ei; changed(); refreshAllSets();
  if (ei === -1) return;
  a = activeSet(S.cur.exercises[ei], ei);
  const row = $("row-" + ei + "-" + a);
  if (row) { row.classList.add("flash"); row.scrollIntoView({ block: "center", behavior: "smooth" }); setTimeout(() => row.classList.remove("flash"), 1600); }
}
