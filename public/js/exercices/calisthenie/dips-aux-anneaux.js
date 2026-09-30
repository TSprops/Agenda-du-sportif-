// Fiche « Comment faire » : Dips aux anneaux.
import { front, side } from "../_communs.js";
import { dipF, dipLow, dipTop } from "./_communs.js";
import { frings, rings } from "../../silhouette/index.js";

// Anneaux : descente plus verticale, buste moins penché, mains près des hanches.
export default { grip: null, views: [side([dipTop({ eq: [rings("near", { top: true })] }), dipLow({ hip: [128, 124], torso: -74, neck: -78, near: { wristAt: [127, 106], hand: 90 }, eq: [rings("near", { top: true })] })], ["Bras tendus", "Coudes à 90°"]),
      front([dipF(0, { eq: [frings()] }), dipF(1, { eq: [frings()] })], ["Bras tendus, anneaux serrés", "Coudes à 90°"])],
    cue: "Anneaux tenus bras tendus près du corps : descends jusqu’aux coudes à 90°, puis remonte en gardant les anneaux serrés.",
    tips: ["Plus instable que les barres : maîtrise d’abord les dips classiques.", "Anneaux collés au corps, bras tendus en haut.", "Descends lentement sans laisser les anneaux s’écarter."] };
