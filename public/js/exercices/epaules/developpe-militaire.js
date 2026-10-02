// Fiche « Comment faire » : Développé militaire.
import { t } from "../../commun/i18n.js";
import { front, side } from "../_communs.js";
import { ohpF, ohpS } from "./_communs.js";

export default { views: [side([ohpS(0), ohpS(1)], [t("fiches.developpe-militaire.legende1"), t("fiches.developpe-militaire.legende2")]), front([ohpF(0), ohpF(1)], [t("fiches.developpe-militaire.legende3"), t("fiches.developpe-militaire.legende4")])],
    cue: t("fiches.developpe-militaire.consigne"),
    tips: [t("fiches.developpe-militaire.conseil1"), t("fiches.developpe-militaire.conseil2"), t("fiches.developpe-militaire.conseil3")], anim: "De face" };
