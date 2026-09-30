// Fiche « Comment faire » : Barre au front.
import { side } from "../_communs.js";
import { skull } from "./_communs.js";

export default { views: [side([skull(0), skull(1)], ["Barre près du front", "Bras tendus"])],
    cue: "Allongé sur un banc, barre tenue bras tendus au-dessus du visage : plie les coudes pour descendre la barre vers le front, puis tends les bras.",
    tips: ["Mains à largeur d’épaules (barre droite ou EZ).", "Les coudes restent fixes, pointés vers le plafond.", "Descends lentement vers le front, sans le toucher."] };
