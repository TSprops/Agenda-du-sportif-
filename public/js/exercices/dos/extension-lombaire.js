// Fiche « Comment faire » : Extension lombaire.
import { side } from "../_communs.js";
import { hyper } from "./_communs.js";

export default { views: [side([hyper(75), hyper(0)], ["Buste vers le sol", "Corps aligné"])],
    cue: "Allongé sur le banc à lombaires, hanches sur le coussin, pieds bloqués : descends le buste dos droit, puis remonte jusqu’à être aligné.",
    tips: ["Le coussin est juste sous le haut des hanches.", "Bras croisés sur la poitrine, dos droit.", "Remonte jusqu’à l’alignement, sans te cambrer au-dessus."] };
