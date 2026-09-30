// Fiche « Comment faire » : Oiseau (arrière d’épaule).
import { front, side } from "../_communs.js";
import { rearF, rearS } from "./_communs.js";

export default { views: [side([rearS(0), rearS(1)], ["Assis penché, bras pendants", "Bras ouverts sur les côtés"]), front([rearF(0), rearF(1)], ["Bras pendants", "Bras à l’horizontale"])],
    cue: "Assis au bout d’un banc, buste penché en avant sur les cuisses, dos plat : ouvre les bras sur les côtés jusqu’à l’horizontale, puis redescends.",
    tips: ["Buste penché presque sur les cuisses (ou appuyé sur un banc incliné).", "Coudes légèrement fléchis et fixes.", "Charges légères : pense « écarter », pas « tirer »."] };
