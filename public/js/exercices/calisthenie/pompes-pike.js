// Fiche « Comment faire » : Pompes pike.
import { onToes, side } from "../_communs.js";
import { GROUND } from "../../silhouette/index.js";

export default { views: [side([
      { hip: [88, 126], torso: 33.7, neck: 50, near: { ankleAt: onToes(44, 70), ft: 70, wristAt: [134, GROUND - 3], h: "flat", hand: 0 } },
      { hip: [96, 130], torso: 58, neck: 70, near: { ankleAt: onToes(44, 70), ft: 70, wristAt: [134, GROUND - 3], h: "flat", hand: 0 } }], ["Corps en V, bras tendus", "Tête vers le sol devant les mains"])],
    cue: "Mains au sol, hanches hautes (corps en V à l’envers) : plie les bras pour amener la tête vers le sol devant les mains, puis pousse.",
    tips: ["Hanches hautes : le corps forme un V à l’envers.", "La tête descend devant les mains, pas entre elles.", "Plus les pieds sont proches des mains, plus c’est dur."] };
