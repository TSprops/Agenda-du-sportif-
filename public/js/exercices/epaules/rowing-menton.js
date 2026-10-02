// Fiche « Comment faire » : Rowing menton.
import { t } from "../../commun/i18n.js";
import { front, side } from "../_communs.js";
import { uprowF, uprowS } from "./_communs.js";

export default { views: [side([uprowS(0), uprowS(1)], [t("fiches.rowing-menton.legende1"), t("fiches.rowing-menton.legende2")]), front([uprowF(0), uprowF(1)], [t("fiches.rowing-menton.legende3"), t("fiches.rowing-menton.legende4")])],
    cue: t("fiches.rowing-menton.consigne"),
    tips: [t("fiches.rowing-menton.conseil1"), t("fiches.rowing-menton.conseil2"), t("fiches.rowing-menton.conseil3")], anim: "De face" };
