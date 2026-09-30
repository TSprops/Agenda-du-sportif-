// Entraînement : « la dernière fois » (historique d'un exercice, préremplissage) et ajout d'un exercice.
import { libFind } from "./bibliotheque.js";
import { cordesOf, lastCordes } from "./cordes.js";
import { moveOf } from "../comment-faire/index.js";
import { $, S, esc, nf } from "../commun/core.js";
import { norm } from "../pages/faq.js";
import { doneSet, shortDate } from "../idees/index.js";
import { changed, renderSheet, restOf } from "../seances/index.js";

/* ============================================================
   « La dernière fois » : historique d'un exercice
   ============================================================ */
export const exKey = n => norm(n).replace(/\s+/g, " ").trim();
// Séance la plus récente (avant « before ») où l'exercice a des séries remplies.
export function exHistory(name, before) {
  const nk = exKey(name || ""); if (!nk) return null;
  const ks = Object.keys(S.days).filter(k => k < before).sort().reverse();
  for (const k of ks) {
    const ex = (S.days[k].exercises || []).find(x => exKey(x.name || "") === nk && (x.sets || []).some(doneSet));
    if (ex) return { k, ex };
  }
  return null;
}
export const setTxt = (st, hold) => (hold ? st.reps + " s" : st.reps) + (+st.kg ? " × " + nf.format(st.kg) + " kg" : "");
export function lastLineHTML(ex) {
  if (!S.open || !String(ex.name || "").trim()) return "";
  const h = exHistory(ex.name, S.open); if (!h) return "";
  const sets = h.ex.sets.filter(doneSet);
  return `<span class="ll-k">↺ ${esc(shortDate(h.k))}</span> ${esc(sets.map(st => setTxt(st, h.ex.hold)).join(" · "))}`;
}
// Pré-remplit les séries avec celles de la dernière fois (poids repris, répétitions en objectif).
function prefillFromLast(ex, before) {
  const h = exHistory(ex.name, before); if (!h) return false;
  ex.sets = h.ex.sets.filter(doneSet).map(st => ({ reps: "", kg: st.kg ?? "", target: st.reps }));
  ex.rest = restOf(h.ex); ex.hold = !!h.ex.hold;
  return true;
}
// Pour une routine ou une idée : reprend seulement les poids de la dernière fois.
export function prefillKg(list, before) {
  list.forEach(ex => {
    const h = exHistory(ex.name, before); if (!h) return;
    const hs = h.ex.sets.filter(doneSet); if (!hs.length) return;
    ex.sets.forEach((st, j) => { if (st.kg === "" || st.kg == null) st.kg = (hs[j] || hs[hs.length - 1]).kg ?? ""; });
  });
}
const blankSets = n => Array.from({ length: n }, () => ({ reps: "", kg: "" }));
export function addExercise(name, hold) {
  const c = S.cur; if (!c) return;
  const lib = libFind(name), ex = { name, hold: !!(hold || (lib && lib.hold)), sets: blankSets(3), rpe: 0, note: "", rest: 90 };
  if (c.disc === "cordes") {
    const h = lastCordes(name, S.open);
    Object.assign(ex, { kind: "cordes", sets: [], ropes: "", every: "", unit: "s", lest: false, kg: "" }, h ? cordesOf(h.ex) : {});
  } else prefillFromLast(ex, S.open);
  c.exercises.push(ex); changed(); renderSheet();
  const el = $("exn-" + (c.exercises.length - 1)); if (el) el.closest(".ex").scrollIntoView({ block: "start", behavior: "smooth" });
}
// Nom tapé à la main : si l'exercice est connu et encore vide, on reprend la dernière fois.
$("sheet").addEventListener("change", e => {
  if (e.target.dataset.f !== "ex-name" || !S.cur) return;
  const i = +e.target.dataset.ex, ex = S.cur.exercises[i]; if (!ex || ex.lock || ex.kind === "cordes") return;
  const blank = (ex.sets || []).every(st => (st.reps === "" || st.reps == null) && (st.kg === "" || st.kg == null) && !st.done);
  if (blank && prefillFromLast(ex, S.open)) { changed(); renderSheet(); }
  else if (!!moveOf(ex.name) !== !!document.querySelector(`[data-how="${i}"]`)) renderSheet(); // bouton « ? » à ajouter ou retirer
  else { const el = $("el-" + i); if (el) el.innerHTML = lastLineHTML(ex); }
});
