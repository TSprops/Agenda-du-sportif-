// Fiche « Comment faire » : Montée de corde.
import { side } from "../_communs.js";
import { climbRope } from "../../silhouette/index.js";

// Montée de corde : la version sans les jambes (bras seuls).
export default { views: [side([
      { hip: [114, 106], torso: -90, neck: -94, near: { wristAt: [117, 8], hand: -90, th: 60, sh: 85, ft: 20 }, far: { wristAt: [117, 34] }, eq: [climbRope(120)] },
      { hip: [114, 92], torso: -90, neck: -94, near: { wristAt: [117, 24], hand: -90, th: 60, sh: 85, ft: 20 }, far: { wristAt: [117, -2] }, eq: [climbRope(120)] }],
      ["Main droite en haut", "Main gauche en haut"])],
    cue: "Uniquement avec les bras, jambes légèrement relevées : monte une main après l’autre.",
    tips: ["Jambes relevées devant toi, sans balancer.", "Une main après l’autre, bras qui tirent.", "Redescends aussi main après main."] };
