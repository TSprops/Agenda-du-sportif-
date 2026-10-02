// Fiche « Comment faire » : Kettlebell swings.
import { t } from "../../commun/i18n.js";
import { ANK, DA, side, stand } from "../_communs.js";
import { add, kb } from "../../silhouette/index.js";

export default { views: [side([
      { hip: [100, 120], torso: -35, neck: -20, near: { ankleAt: [124, ANK], ft: 0, wristAt: [122, 142], hand: 110 }, eq: [kb(P => P.near.grip, { mid: true })] },
      stand({ torso: -92, near: { ua: -4, fa: -4, hand: -4 }, eq: [kb(P => add(P.near.grip, [4, -4]), { top: true })] })], DA)],
    cue: t("fiches.kettlebell-swings.consigne"),
    tips: [t("fiches.kettlebell-swings.conseil1"), t("fiches.kettlebell-swings.conseil2"), t("fiches.kettlebell-swings.conseil3")] };
