// Entraînement : « la dernière fois » (historique d'un exercice, préremplissage) et ajout d'un exercice.
import { libFind } from "./bibliotheque.js";
import { cordesOf, lastCordes } from "./cordes.js";
import { moveOf } from "../comment-faire/index.js";
import { $, S, esc, nf } from "../commun/core.js";
import { t } from "../commun/i18n.js";
import { norm } from "../pages/faq.js";
import { doneSet, shortDate } from "../idees/index.js";
import { changed, hyroxEx, hyroxStation, renderSheet, restOf } from "../seances/index.js";

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
// Suggestion de charge : si toutes les séries à la charge la plus lourde ont été réussies la dernière fois
// (répétitions prévues atteintes, ou mêmes répétitions à chaque série), on propose un peu plus lourd.
// +2,5 kg à partir de 20 kg, +1 kg en dessous (haltères légers). Rien si une série est déjà faite aujourd'hui.
export const kgStep = kg => kg >= 20 ? 2.5 : 1;
export function kgSuggestion(ex) {
  if (!S.open || ex.hold || ex.kind || ex.mode === "dep" || !String(ex.name || "").trim()) return null;
  if ((ex.sets || []).some(st => st.done)) return null;
  const h = exHistory(ex.name, S.open); if (!h || h.ex.hold) return null;
  const sets = h.ex.sets.filter(doneSet).filter(st => +st.kg > 0); if (!sets.length) return null;
  const max = Math.max(...sets.map(st => +st.kg)), top = sets.filter(st => +st.kg === max);
  const ok = top.every(st => st.target !== undefined && st.target !== "" ? +st.reps >= +st.target : +st.reps >= +top[0].reps);
  if (!ok) return null;
  const next = Math.round((max + kgStep(max)) * 100) / 100;
  if ((ex.sets || []).some(st => +st.kg >= next)) return null;
  return { from: max, kg: next, reps: top[0].reps };
}
export function kgSuggestHTML(ex, i) {
  const g = kgSuggestion(ex); if (!g) return "";
  return `<span class="kg-tip-t">${t("derniereFois.suggestion", { de: esc(nf.format(g.from)), kg: `<b>${esc(nf.format(g.kg))} kg</b>` })}</span>`
    + `<button class="kg-tip-b" data-a="kg-up" data-ex="${i}" data-kg="${g.kg}" data-from="${g.from}">${t("derniereFois.appliquer")}</button>`;
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
  if (c.disc === "hyrox") {
    const st = hyroxStation(name), h = Object.keys(S.days).filter(x => x < S.open).sort().reverse().map(x => (S.days[x].exercises || []).find(e => e.kind === "hyrox" && exKey(e.name || "") === exKey(name))).find(Boolean);
    Object.assign(ex, hyroxEx(name, h ? h.amt : st ? st[2] : "", h ? h.kg : ""), h && h.cal ? { cal: h.cal } : {});
  } else if (c.disc === "cordes") {
    const h = lastCordes(name, S.open);
    Object.assign(ex, { kind: "cordes", sets: [], ropes: "", every: "", unit: "s", lest: false, kg: "" }, h ? cordesOf(h.ex) : {});
  } else prefillFromLast(ex, S.open);
  c.exercises.push(ex); changed(); renderSheet();
  const el = $("exn-" + (c.exercises.length - 1)); if (el) el.closest(".ex").scrollIntoView({ block: "start", behavior: "smooth" });
}
// Nom tapé à la main : si l'exercice est connu et encore vide, on reprend la dernière fois.
$("sheet").addEventListener("change", e => {
  if (e.target.dataset.f !== "ex-name" || !S.cur) return;
  const i = +e.target.dataset.ex, ex = S.cur.exercises[i]; if (!ex || ex.lock || ex.kind) return;
  const blank = (ex.sets || []).every(st => (st.reps === "" || st.reps == null) && (st.kg === "" || st.kg == null) && !st.done);
  if (blank && prefillFromLast(ex, S.open)) { changed(); renderSheet(); }
  else if (!!moveOf(ex.name) !== !!document.querySelector(`[data-how="${i}"]`)) renderSheet(); // bouton « ? » à ajouter ou retirer
  else { const el = $("el-" + i); if (el) el.innerHTML = lastLineHTML(ex); const sg = $("sg-" + i); if (sg) sg.innerHTML = kgSuggestHTML(ex, i); }
});
