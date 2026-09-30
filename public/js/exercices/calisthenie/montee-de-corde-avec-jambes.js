// Fiche « Comment faire » : Montée de corde avec jambes.
import { side } from "../_communs.js";
import { climbRope } from "../../silhouette/index.js";

export default { views: [side([
      { hip: [112, 142], torso: -90, neck: -94, near: { wristAt: [117, 42], hand: -90, ankleAt: [116, 176], ft: 20 }, far: { wristAt: [117, 60] }, eq: [climbRope(120)] },
      { hip: [114, 104], torso: -92, neck: -92, near: { wristAt: [117, 60], hand: -90, ankleAt: [117, 190], ft: 20 }, far: { wristAt: [117, 44] }, eq: [climbRope(120)] }],
      ["Mains en haut, pieds qui serrent la corde", "Jambes qui poussent, une main puis l’autre"])],
    cue: "Mains serrées en haut, pieds qui bloquent la corde : pousse sur les jambes, puis avance une main après l’autre plus haut.",
    tips: ["Les pieds pincent la corde (une cheville sur l’autre).", "Ce sont les jambes qui font monter, les bras tiennent.", "Redescends main après main, jamais en glissant."] };
