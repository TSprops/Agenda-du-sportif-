// Fiche « Comment faire » : Tirage vertical.
import { t } from "../../commun/i18n.js";
import { front, side } from "../_communs.js";
import { pulldown, pulldownF } from "./_communs.js";

export default { grip: "pro", views: [side([pulldown(0), pulldown(1)], [t("fiches.tirage-vertical.legende1"), t("fiches.tirage-vertical.legende2")]), front([pulldownF(40, 0), pulldownF(40, 1)], [t("fiches.tirage-vertical.legende3"), t("fiches.tirage-vertical.legende4")])],
    cue: t("fiches.tirage-vertical.consigne"),
    tips: [t("fiches.tirage-vertical.conseil1"), t("fiches.tirage-vertical.conseil2"), t("fiches.tirage-vertical.conseil3")] };
