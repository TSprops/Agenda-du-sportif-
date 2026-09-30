// Fiche « Comment faire » : Leg curl.
import { side } from "../_communs.js";
import { legCurl } from "./_communs.js";

export default { views: [side([legCurl(0), legCurl(1)], ["Jambes tendues", "Talons vers les fesses"])],
    cue: "Allongé sur le ventre, boudin derrière les chevilles : ramène les talons vers les fesses, puis redescends lentement.",
    tips: ["Hanches collées au banc pendant tout le mouvement.", "Boudin juste au-dessus des talons.", "Redescends lentement, sans laisser tomber la charge."] };
