// Fiche « Comment faire » : Gainage.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { forearmPlank } from "./_communs.js";

export default { views: [side([forearmPlank()], [t("fiches.gainage.legende1")])],
    cue: t("fiches.gainage.consigne"),
    tips: [t("fiches.gainage.conseil1"), t("fiches.gainage.conseil2"), t("fiches.gainage.conseil3")] };
