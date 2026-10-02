// Fiche « Comment faire » : Good morning.
import { t } from "../../commun/i18n.js";
import { ANK, HIPY, side } from "../_communs.js";
import { backSquat } from "../jambes/_communs.js";

export default { views: [side([backSquat([120, HIPY], -90, [124, ANK]), backSquat([98, HIPY + 6], -12, [124, ANK])], [t("fiches.good-morning.legende1"), t("fiches.good-morning.legende2")])],
    cue: t("fiches.good-morning.consigne"),
    tips: [t("fiches.good-morning.conseil1"), t("fiches.good-morning.conseil2"), t("fiches.good-morning.conseil3")] };
