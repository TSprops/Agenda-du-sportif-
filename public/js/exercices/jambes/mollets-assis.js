// Fiche « Comment faire » : Mollets assis.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { seatCalf } from "./_communs.js";

export default { views: [side([seatCalf(-18), seatCalf(34)], [t("fiches.mollets-assis.legende1"), t("fiches.mollets-assis.legende2")])],
    cue: t("fiches.mollets-assis.consigne"),
    tips: [t("fiches.mollets-assis.conseil1"), t("fiches.mollets-assis.conseil2"), t("fiches.mollets-assis.conseil3")] };
