// Fiche « Comment faire » : Montée de corde avec jambes.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { climbRope } from "../../silhouette/index.js";

export default { views: [side([
      { hip: [112, 142], torso: -90, neck: -94, near: { wristAt: [117, 42], hand: -90, ankleAt: [116, 176], ft: 20 }, far: { wristAt: [117, 60] }, eq: [climbRope(120)] },
      { hip: [114, 104], torso: -92, neck: -92, near: { wristAt: [117, 60], hand: -90, ankleAt: [117, 190], ft: 20 }, far: { wristAt: [117, 44] }, eq: [climbRope(120)] }],
      [t("fiches.montee-de-corde-avec-jambes.legende1"), t("fiches.montee-de-corde-avec-jambes.legende2")])],
    cue: t("fiches.montee-de-corde-avec-jambes.consigne"),
    tips: [t("fiches.montee-de-corde-avec-jambes.conseil1"), t("fiches.montee-de-corde-avec-jambes.conseil2"), t("fiches.montee-de-corde-avec-jambes.conseil3")] };
