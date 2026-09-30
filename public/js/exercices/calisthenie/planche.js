// Fiche « Comment faire » : Planche.
import { side } from "../_communs.js";
import { plank } from "./_communs.js";

// Bras tendus dans le plan : mains à plat et pointes de pieds sur la même ligne de sol.
export default { views: [side([plank(140, 156, 120, { near: { ls: {} } })], ["Position à tenir : épaules devant les mains"])],
    cue: "Version pieds au sol (planche penchée) : en appui sur les mains, bras tendus, avance les épaules devant les mains en gardant le corps gainé.",
    tips: ["Bras bien tendus, épaules qui poussent le sol.", "Doigts tournés vers l’extérieur ou vers l’arrière pour protéger les poignets.", "Corps gainé du début à la fin, pointes de pieds au sol."] };
