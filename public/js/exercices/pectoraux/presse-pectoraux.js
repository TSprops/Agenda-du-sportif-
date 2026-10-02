// Fiche « Comment faire » : Presse pectoraux.
import { t } from "../../commun/i18n.js";
import { front, side } from "../_communs.js";
import { chestPressF, chestPressS } from "./_communs.js";

export default { views: [side([chestPressS(0), chestPressS(1)], [t("fiches.presse-pectoraux.legende1"), t("fiches.presse-pectoraux.legende2")]), front([chestPressF(0), chestPressF(1)], [t("fiches.presse-pectoraux.legende3"), t("fiches.presse-pectoraux.legende4")])],
    cue: t("fiches.presse-pectoraux.consigne"),
    tips: [t("fiches.presse-pectoraux.conseil1"), t("fiches.presse-pectoraux.conseil2"), t("fiches.presse-pectoraux.conseil3")], anim: "De profil" };
