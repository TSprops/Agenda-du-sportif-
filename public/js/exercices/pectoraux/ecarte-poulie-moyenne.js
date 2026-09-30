// Fiche « Comment faire » : Écarté poulie moyenne.
import { front, side } from "../_communs.js";
import { SH_Y } from "../epaules/_communs.js";
import { cableFly, cableFlySide } from "./_communs.js";

export default { views: [front(cableFly(SH_Y + 16, "moyenne"), ["Bras ouverts à hauteur d’épaules", "Mains qui se rejoignent devant la poitrine"]), side(cableFlySide("moyenne"), ["Bras ouverts", "Mains devant la poitrine"])],
    cue: "Poulies à hauteur d’épaules : ramène les mains devant la poitrine en gardant les bras à l’horizontale. Cible le milieu des pectoraux.",
    tips: ["Bras à hauteur d’épaules pendant tout le mouvement.", "Coudes légèrement fléchis et fixes.", "Poulie moyenne = milieu des pectoraux."] };
