// Fiche « Comment faire » : Montée de corde départ assis.
import { side } from "../_communs.js";
import { GROUND, climbRope } from "../../figure.js";

// Départ assis au sol, jambes tendues devant : on décolle et on monte avec les bras seuls.
export default { views: [side([
      { hip: [114, GROUND - 12], torso: -90, neck: -94, near: { wristAt: [117, 92], hand: -90, th: 0, sh: 0, ft: -60 }, far: { wristAt: [117, 112] }, eq: [climbRope(120)] },
      { hip: [114, 150], torso: -90, neck: -94, near: { wristAt: [117, 66], hand: -90, th: 4, sh: 4, ft: -40 }, far: { wristAt: [117, 88] }, eq: [climbRope(120)] }],
      ["Assis au sol, jambes tendues, mains sur la corde", "Décolle des fesses, bras seuls"])],
    cue: "Assis au sol, jambes tendues devant toi, mains sur la corde : tire avec les bras pour décoller, puis monte une main après l’autre sans t’aider des jambes.",
    tips: ["Départ assis : aucun élan des jambes pour décoller.", "Jambes tendues devant toi, gainées, pendant toute la montée.", "Redescends main après main jusqu’à te reposer assis."] };
