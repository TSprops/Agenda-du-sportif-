// Fiche « Comment faire » : Hip thrust.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { ht } from "./_communs.js";

export default { views: [side([ht([66, 152], 0), ht([66, 152], 1)], [t("fiches.hip-thrust.legende1"), t("fiches.hip-thrust.legende2")])],
    cue: t("fiches.hip-thrust.consigne"),
    tips: [t("fiches.hip-thrust.conseil1"), t("fiches.hip-thrust.conseil2"), t("fiches.hip-thrust.conseil3"), t("fiches.hip-thrust.conseil4")] };
