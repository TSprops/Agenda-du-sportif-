// Fiche « Comment faire » : Good morning.
import { ANK, HIPY, side } from "../_communs.js";
import { backSquat } from "../jambes/_communs.js";

export default { views: [side([backSquat([120, HIPY], -90, [124, ANK]), backSquat([98, HIPY + 6], -12, [124, ANK])], ["Barre sur les épaules", "Buste penché, dos plat"])],
    cue: "Barre posée sur le haut du dos et les épaules, genoux à peine fléchis : penche le buste en avant en gardant le dos plat, puis redresse-toi.",
    tips: ["Commence léger : barre seule ou un bâton.", "Dos plat, genoux légèrement fléchis et fixes.", "Descends jusqu’à sentir l’étirement derrière les cuisses, pas plus."] };
