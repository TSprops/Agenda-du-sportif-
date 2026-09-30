// Fiche « Comment faire » : Écarté poulie haute.
import { front, side } from "../_communs.js";
import { cableFly, cableFlySide } from "./_communs.js";

export default { views: [front(cableFly(8, "haute"), ["Bras ouverts vers les poulies hautes", "Mains qui se rejoignent devant les hanches"]), side(cableFlySide("haute"), ["Bras en haut", "Mains devant les hanches"])],
    cue: "Poulies réglées en haut : ramène les mains vers le bas et l’avant jusqu’à ce qu’elles se rejoignent devant les hanches. Cible le bas des pectoraux.",
    tips: ["Un pied devant l’autre, buste légèrement penché.", "Coudes légèrement fléchis et fixes.", "Poulie haute = bas des pectoraux."], anim: "De face" };
