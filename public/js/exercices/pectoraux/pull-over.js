// Fiche « Comment faire » : Pull-over.
import { side } from "../_communs.js";
import { BT, benchLie } from "./_communs.js";
import { bench, db } from "../../silhouette/index.js";

export default { views: [side([benchLie(0, () => ({ ua: 176, fa: 188, hand: 188 }), [bench(18, 150, BT), db(P => [P.near.grip, 90], "side", { top: true })]),
      // En haut : bras quasi tendus au-dessus de la poitrine, coudes légèrement fléchis vers les pieds (jamais vers la tête).
      benchLie(0, () => ({ ua: -80, fa: -98, hand: -95 }), [bench(18, 150, BT), db(P => [P.near.grip, 0], "side", { top: true })])], ["Haltère derrière la tête", "Haltère au-dessus de la poitrine"])],
    cue: "Allongé, un haltère tenu à deux mains, bras presque tendus : descends-le derrière la tête, puis ramène-le au-dessus de la poitrine.",
    tips: ["Coudes légèrement fléchis et fixes.", "Descends jusqu’à sentir l’étirement, sans douleur à l’épaule.", "Bassin et bas du dos restent posés sur le banc."] };
