// Séances, fiche du jour : cordes.
import { lastComparable } from "./series.js";
import { MONTHS, S, parse } from "../commun/core.js";
import { cordesExHTML } from "../entrainement/index.js";

// Les anciennes séances « Musculation · Cordes » deviennent des séances Cordes.
export function normCordes(c) { if (c && c.disc === "muscu" && c.typeId === "cordes") { c.disc = "cordes"; c.typeId = null; } return c; }
export function cordesHTML(c, k) {
  const last = !(c.exercises || []).length ? lastComparable(c, k) : null;
  return `<p class="hint" style="margin-top:-6px">Pour chaque exercice : cordes par départ, départ toutes les X secondes ou minutes, pendant combien de temps, avec ou sans lest.</p>
    ${last ? `<button class="suggest" data-a="copy" data-k="${last}"><span style="flex:1"><b>Reprendre ta dernière séance Cordes</b><span>${parse(last).getDate()} ${MONTHS[parse(last).getMonth()]} · ${(S.days[last].exercises || []).length} exercice${(S.days[last].exercises || []).length > 1 ? "s" : ""}</span></span><span aria-hidden="true">›</span></button>` : ""}
    ${(c.exercises || []).map((ex, i) => cordesExHTML(ex, i)).join("")}
    <button class="add-ex" data-a="add-ex">+ Ajouter un exercice</button>
    ${(c.exercises || []).some(x => String(x.name || "").trim()) ? `<button class="btn" data-a="save-routine">☆ Enregistrer comme routine</button>` : ""}`;
}
