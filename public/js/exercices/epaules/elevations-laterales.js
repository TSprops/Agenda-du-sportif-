// Fiche « Comment faire » : Élévations latérales.
import { t } from "../../commun/i18n.js";
import { front, side } from "../_communs.js";
import { latF, latS } from "./_communs.js";

export default { views: [side([latS(0), latS(1)], [t("fiches.elevations-laterales.legende1"), t("fiches.elevations-laterales.legende2")]), front([latF(0), latF(1)], [t("fiches.elevations-laterales.legende1"), t("fiches.elevations-laterales.legende3")])],
    cue: t("fiches.elevations-laterales.consigne"),
    tips: [t("fiches.elevations-laterales.conseil1"), t("fiches.elevations-laterales.conseil2"), t("fiches.elevations-laterales.conseil3")], anim: "De face" };
