// Séances, fiche du jour : séries, repos, état de chaque série (fait, en cours, à faire).
import { changed } from "./feuille.js";
import { $, S, dayMeta, dayOf, discOf, exVolume, nf, pad, todayK } from "../core.js";
import { RT } from "../timer.js";

/* ============================================================
   Séances : fiche du jour
   ============================================================ */
export function rpeColor(v) { return v <= 6 ? "#2FBF71" : v <= 8 ? "#FF9F0A" : "#FF3B30"; }
export function rpeLabel(v) { return !v ? "Non notée" : v <= 5 ? "Facile" : v === 6 ? "Modérée" : v === 7 ? "3 reps en réserve" : v === 8 ? "2 reps en réserve" : v === 9 ? "1 rep en réserve" : "Échec"; }
export function effortLabel(v) { return !v ? "Non noté" : v <= 3 ? "Très facile" : v <= 5 ? "Facile" : v <= 7 ? "Soutenu" : v <= 9 ? "Très dur" : "Maximal"; }
export function restOf(ex) { return typeof ex.rest === "number" ? ex.rest : 90; }
export function fmtRest(v) { if (!v) return "Aucun"; const m = Math.floor(v / 60), sec = v % 60; return m ? m + " min" + (sec ? " " + pad(sec) : "") : sec + " s"; }
export function exStats(ex, disc) {
  const s = (ex.sets || []).filter(x => x.reps !== "" || x.kg !== "");
  if (!s.length) return "Aucune série remplie";
  const best = Math.max(0, ...s.map(x => +x.kg || 0));
  if (disc === "calis") {
    const tot = s.reduce((a, x) => a + (+x.reps || 0), 0);
    return `${s.length} série${s.length > 1 ? "s" : ""} · ${ex.hold ? "total " + tot + " s de tenue" : "total " + tot + " reps"}${best ? " · lest max " + nf.format(best) + " kg" : ""}`;
  }
  const v = exVolume(ex);
  return `${s.length} série${s.length > 1 ? "s" : ""}${best ? " · max " + nf.format(best) + " kg" : ""}${v ? " · volume " + nf.format(v) + " kg" : ""}`;
}
// Dernière séance comparable, pour la reprendre (musculation : même type ; callisthénie : n'importe laquelle).
export function lastComparable(c, before) {
  const disc = c.disc;
  if (disc !== "muscu" && disc !== "calis" && disc !== "cordes") return null;
  if (disc === "muscu" && !c.typeId) return null;
  const same = k => disc === "cordes" ? dayMeta(S.days[k]).disc === "cordes" : discOf(S.days[k]) === disc && (disc === "calis" || S.days[k].typeId === c.typeId);
  return Object.keys(S.days).filter(k => k < before && same(k) && (S.days[k].exercises || []).length).sort().pop();
}
// Progression des séries : une série est « faite » si elle est cochée ou si ses répétitions sont remplies.
// Une série n'est « faite » que si on la valide (bouton « Série finie » ou toucher sur son numéro).
// Pour les séances des jours passés notées avant cette règle, une série remplie compte comme faite.
export function isDone(st) {
  if (st.done === true) return true;
  if (st.done === false) return false;
  return !!(S.open && dayOf(S.open) < todayK() && st.reps !== "" && st.reps != null);
}
export const resting = i => !!(RT.tick && RT.ex === i && RT.day === S.open);
export function activeSet(ex, i) {
  if (resting(i)) return -1;
  const sets = ex.sets || [];
  if (typeof ex.cur === "number" && sets[ex.cur] && !isDone(sets[ex.cur])) return ex.cur;
  return sets.findIndex(st => !isDone(st));
}
// Exercice en cours : celui choisi en dernier s'il reste des séries, sinon le premier non terminé.
function focusEx() {
  const L = (S.cur && S.cur.exercises) || [];
  if (RT.tick && RT.day === S.open && RT.ex != null && L[RT.ex]) return RT.ex;
  if (typeof S.cur.focus === "number" && L[S.cur.focus] && (L[S.cur.focus].sets || []).some(st => !isDone(st))) return S.cur.focus;
  return L.findIndex(ex => (ex.sets || []).some(st => !isDone(st)));
}
export function setState(ex, j, i) {
  if (isDone(ex.sets[j])) return "done";
  if (j === activeSet(ex, i) && i === focusEx()) return "cur";
  if (resting(i) && j === (ex.sets || []).findIndex(st => !isDone(st))) return "next";
  return "";
}
export function setNowText(ex, i) {
  const sets = ex.sets || [], n = sets.length; if (!n) return "";
  if (resting(i)) { const nx = sets.findIndex(st => !isDone(st)); return nx === -1 ? `<span class="ok">✓ Dernière série faite · repos</span>` : `⏸ Repos · série <b>${nx + 1}</b> ensuite`; }
  const a = activeSet(ex, i);
  if (a === -1) return `<span class="ok">✓ Toutes les séries sont faites</span>`;
  return i === focusEx() ? `<span class="dot-live"></span>Série en cours : <b>${a + 1}</b> / ${n}` : `À faire · ${sets.filter(isDone).length} / ${n} séries`;
}
export function goLabel(ex, i) {
  const a = activeSet(ex, i);
  if (resting(i)) return "⏸ Repos en cours…";
  return a === -1 ? "⏱ Lancer un repos" : `✓ Série ${a + 1} finie · repos ${fmtRest(restOf(ex))}`;
}
export function refreshAllSets() { ((S.cur && S.cur.exercises) || []).forEach((_, k) => refreshSets(k)); }
export function refreshSets(i) {
  const ex = S.cur && S.cur.exercises && S.cur.exercises[i]; if (!ex) return;
  ex.sets.forEach((_, j) => { const r = $("row-" + i + "-" + j); if (r) r.className = setState(ex, j, i); });
  const sn = $("sn-" + i); if (sn) sn.innerHTML = setNowText(ex, i);
  const g = $("go-" + i); if (g) { g.textContent = goLabel(ex, i); g.disabled = resting(i); }
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
