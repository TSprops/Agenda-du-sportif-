// Fiche « Comment faire » : Tirage vertical prise serrée.
import { front, side } from "../_communs.js";
import { pulldown, pulldownF } from "./_communs.js";

export default { grip: null, views: [side([pulldown(0), pulldown(1)], ["Bras tendus", "Poignée en haut de la poitrine"]), front([pulldownF(6, 0), pulldownF(6, 1)], ["Mains serrées", "Coudes le long du corps"])],
    cue: "Assis sous la poulie, poignée serrée en main : tire jusqu’au haut de la poitrine en gardant les coudes près du corps, puis remonte.",
    tips: ["Mains rapprochées sur la poignée en V.", "La poulie est au-dessus de toi, le câble descend droit.", "Coudes le long du corps, poitrine sortie."] };
