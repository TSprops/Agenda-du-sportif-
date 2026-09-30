// Fiche « Comment faire » : Écarté poulie basse.
import { front, side } from "../_communs.js";
import { cableFly, cableFlySide } from "./_communs.js";
import { GROUND } from "../../figure.js";

export default { views: [front(cableFly(GROUND - 10, "basse"), ["Bras ouverts vers les poulies basses", "Mains qui se rejoignent à hauteur du visage"]), side(cableFlySide("basse"), ["Bras en bas", "Mains devant le visage"])],
    cue: "Poulies réglées en bas : ramène les mains vers le haut et l’avant jusqu’à ce qu’elles se rejoignent à hauteur du menton. Cible le haut des pectoraux.",
    tips: ["Buste droit, un pied devant l’autre.", "Coudes légèrement fléchis, monte en arc de cercle.", "Poulie basse = haut des pectoraux."] };
