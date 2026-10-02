// Fiche « Comment faire » : Montée de corde départ assis.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { GROUND, climbRope } from "../../silhouette/index.js";

// Départ assis au sol, jambes tendues devant : on décolle et on monte avec les bras seuls.
export default { views: [side([
      { hip: [114, GROUND - 12], torso: -90, neck: -94, near: { wristAt: [117, 92], hand: -90, th: 0, sh: 0, ft: -60 }, far: { wristAt: [117, 112] }, eq: [climbRope(120)] },
      { hip: [114, 150], torso: -90, neck: -94, near: { wristAt: [117, 66], hand: -90, th: 4, sh: 4, ft: -40 }, far: { wristAt: [117, 88] }, eq: [climbRope(120)] }],
      [t("fiches.montee-de-corde-depart-assis.legende1"), t("fiches.montee-de-corde-depart-assis.legende2")])],
    cue: t("fiches.montee-de-corde-depart-assis.consigne"),
    tips: [t("fiches.montee-de-corde-depart-assis.conseil1"), t("fiches.montee-de-corde-depart-assis.conseil2"), t("fiches.montee-de-corde-depart-assis.conseil3")] };
