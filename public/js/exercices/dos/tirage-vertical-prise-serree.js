// Fiche « Comment faire » : Tirage vertical prise serrée.
import { t } from "../../commun/i18n.js";
import { front, side } from "../_communs.js";
import { pulldown, pulldownF } from "./_communs.js";

export default { grip: null, views: [side([pulldown(0), pulldown(1)], [t("fiches.tirage-vertical-prise-serree.legende1"), t("fiches.tirage-vertical-prise-serree.legende2")]), front([pulldownF(6, 0), pulldownF(6, 1)], [t("fiches.tirage-vertical-prise-serree.legende3"), t("fiches.tirage-vertical-prise-serree.legende4")])],
    cue: t("fiches.tirage-vertical-prise-serree.consigne"),
    tips: [t("fiches.tirage-vertical-prise-serree.conseil1"), t("fiches.tirage-vertical-prise-serree.conseil2"), t("fiches.tirage-vertical-prise-serree.conseil3")] };
