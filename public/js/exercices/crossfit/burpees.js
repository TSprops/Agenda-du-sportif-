// Fiche « Comment faire » : Burpees.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { burpeeFrames } from "./_communs.js";

export default { views: [side(burpeeFrames(), [t("fiches.burpees.legende1"), t("fiches.burpees.legende2"), t("fiches.burpees.legende3"), t("fiches.burpees.legende4"), t("fiches.burpees.legende5")], [0, 1, 2, 3, 2, 1, 4])],
    cue: t("fiches.burpees.consigne"),
    tips: [t("fiches.burpees.conseil1"), t("fiches.burpees.conseil2"), t("fiches.burpees.conseil3")] };
