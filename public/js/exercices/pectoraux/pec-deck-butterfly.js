// Fiche « Comment faire » : Pec deck (butterfly).
import { front } from "../_communs.js";
import { pecDeckF } from "./_communs.js";

export default { views: [front([pecDeckF(0), pecDeckF(1)], ["Avant-bras contre les coussins", "Coussins qui se touchent"])],
    cue: "Assis sur la machine, dos collé, avant-bras contre les coussins : ramène les bras devant toi jusqu’à ce que les coussins se touchent, puis rouvre lentement.",
    tips: ["Règle le siège pour avoir les coudes à hauteur des épaules.", "Bras pliés à 90° contre les coussins.", "Rouvre lentement sans aller trop loin en arrière."] };
