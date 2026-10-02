// Fiche « Comment faire » : Hollow hold.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { GROUND } from "../../silhouette/index.js";

export default { views: [side([{ hip: [124, GROUND - 13], torso: -172, neck: -170, near: { ua: -168, fa: -170, hand: -170, th: -12, sh: -12, ft: -12 } }], [t("fiches.hollow-hold.legende1")])],
    cue: t("fiches.hollow-hold.consigne"),
    tips: [t("fiches.hollow-hold.conseil1"), t("fiches.hollow-hold.conseil2"), t("fiches.hollow-hold.conseil3")] };
