// Fiche « Comment faire » : Oiseau (arrière d’épaule).
import { t } from "../../commun/i18n.js";
import { front, side } from "../_communs.js";
import { rearF, rearS } from "./_communs.js";

export default { views: [side([rearS(0), rearS(1)], [t("fiches.oiseau-arriere-d-epaule.legende1"), t("fiches.oiseau-arriere-d-epaule.legende2")]), front([rearF(0), rearF(1)], [t("fiches.oiseau-arriere-d-epaule.legende3"), t("fiches.oiseau-arriere-d-epaule.legende4")])],
    cue: t("fiches.oiseau-arriere-d-epaule.consigne"),
    tips: [t("fiches.oiseau-arriere-d-epaule.conseil1"), t("fiches.oiseau-arriere-d-epaule.conseil2"), t("fiches.oiseau-arriere-d-epaule.conseil3")] };
