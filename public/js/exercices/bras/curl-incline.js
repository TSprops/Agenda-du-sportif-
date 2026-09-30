// Fiche « Comment faire » : Curl incliné.
import { side } from "../_communs.js";
import { inclCurl } from "./_communs.js";

export default { views: [side([inclCurl(0), inclCurl(1)], ["Bras qui pendent derrière le buste", "Haltères vers les épaules"])],
    cue: "Assis sur un banc incliné, bras qui pendent derrière le buste : monte les haltères sans avancer les coudes, puis redescends lentement.",
    tips: ["Banc incliné à 45–60°, dos et tête collés au dossier.", "Bras verticaux au départ, derrière le buste : les coudes ne bougent pas.", "Charge plus légère qu’au curl debout."] };
