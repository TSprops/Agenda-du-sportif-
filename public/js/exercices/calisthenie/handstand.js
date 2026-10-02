// Fiche « Comment faire » : Handstand.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { GROUND } from "../../silhouette/index.js";

export default { views: [side([{ hip: [118, 99], torso: 91, neck: 78, near: { wristAt: [121, GROUND - 3], h: "flat", hand: 0, th: -90, sh: -90, ft: -90 } }], [t("fiches.handstand.legende1")])],
    cue: t("fiches.handstand.consigne"), tips: [t("fiches.handstand.conseil1"), t("fiches.handstand.conseil2"), t("fiches.handstand.conseil3")] };
