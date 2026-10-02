// Pages légales (conditions.html, confidentialite.html) : textes dans langues/<code>.json (section « pagesLegales »).
// i18n.js remplit les éléments data-i18n ; ici : titre de l'onglet, date de mise à jour et note de traduction.
import { LANGUE, dateLongue, t } from "../commun/i18n.js";

const { page, maj } = document.body.dataset;
document.title = t("pagesLegales." + page + ".titre") + " · AS Sport";
document.getElementById("upd").textContent = t("pagesLegales.maj", { date: dateLongue(maj + "T12:00:00") });
// Seule la version française fait foi.
document.getElementById("note").hidden = LANGUE === "fr";
