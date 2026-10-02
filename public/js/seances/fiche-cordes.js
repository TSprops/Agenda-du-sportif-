// Séances, fiche du jour : cordes.
import { lastComparable } from "./series.js";
import { S, esc, fmtJourMois, parse } from "../commun/core.js";
import { t } from "../commun/i18n.js";
import { cordesExHTML } from "../entrainement/index.js";

// Les anciennes séances « Musculation · Cordes » deviennent des séances Cordes.
export function normCordes(c) { if (c && c.disc === "muscu" && c.typeId === "cordes") { c.disc = "cordes"; c.typeId = null; } return c; }
export function cordesHTML(c, k) {
  const last = !(c.exercises || []).length ? lastComparable(c, k) : null;
  return `<p class="hint" style="margin-top:-6px">${t("cordes.aide")}</p>
    ${last ? `<button class="suggest" data-a="copy" data-k="${last}"><span style="flex:1"><b>${t("cordes.reprendre")}</b><span>${esc(fmtJourMois(parse(last)))} · ${t("seances.exercices", { n: (S.days[last].exercises || []).length })}</span></span><span aria-hidden="true">›</span></button>` : ""}
    ${(c.exercises || []).map((ex, i) => cordesExHTML(ex, i)).join("")}
    <button class="add-ex" data-a="add-ex">${t("seances.ajouterExercice")}</button>
    ${(c.exercises || []).some(x => String(x.name || "").trim()) ? `<button class="btn" data-a="save-routine">${t("seances.enregistrerRoutine")}</button>` : ""}`;
}
