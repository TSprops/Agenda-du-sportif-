// Fiche « Comment faire » : Shrugs.
import { t } from "../../commun/i18n.js";
import { front, side, standF } from "../_communs.js";
import { shrugStand } from "./_communs.js";
import { fdb } from "../../silhouette/index.js";

export default { views: [side([shrugStand(0), shrugStand(1)], [t("fiches.shrugs.legende1"), t("fiches.shrugs.legende2")]),
      front([standF({ R: { ua: 86, fa: 90 }, eq: [fdb("end", { top: true })] }), standF({ shrug: 7, R: { ua: 86, fa: 90 }, eq: [fdb("end", { top: true })] })], [t("fiches.shrugs.legende3"), t("fiches.shrugs.legende4")])],
    cue: t("fiches.shrugs.consigne"),
    tips: [t("fiches.shrugs.conseil1"), t("fiches.shrugs.conseil2"), t("fiches.shrugs.conseil3")] };
