// Fiche « Comment faire » : Pont fessier.
import { t } from "../../commun/i18n.js";
import { ANK, side } from "../_communs.js";
import { GROUND } from "../../silhouette/index.js";

export default { views: [side([
      { hip: [124, GROUND - 13], torso: 180, neck: 182, near: { ankleAt: [162, ANK], ft: 0, kneeBend: 1, ua: 8, fa: 2, hand: 0, h: "flat" } },
      { hip: [117.9, 170.6], torso: 152, neck: 170, near: { ankleAt: [162, ANK], ft: 0, kneeBend: 1, ua: 14, fa: 6, hand: 0, h: "flat" } }], [t("fiches.pont-fessier.legende1"), t("fiches.pont-fessier.legende2")])],
    cue: t("fiches.pont-fessier.consigne"),
    tips: [t("fiches.pont-fessier.conseil1"), t("fiches.pont-fessier.conseil2"), t("fiches.pont-fessier.conseil3")] };
