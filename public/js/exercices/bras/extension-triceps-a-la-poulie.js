// Fiche « Comment faire » : Extension triceps à la poulie.
import { front, side } from "../_communs.js";
import { pushdownF, pushdownS } from "./_communs.js";

export default { views: [side([pushdownS(0), pushdownS(1)], ["Avant-bras remontés", "Bras tendus"]), front([pushdownF(0), pushdownF(1)], ["Coudes collés au corps", "Bras tendus"])],
    cue: "Face à la poulie haute, coudes collés au corps : tends complètement les bras vers le bas, puis remonte en contrôlant.",
    tips: ["Coudes fixes le long du corps.", "Tends complètement les bras en bas.", "Remonte lentement jusqu’aux avant-bras à l’horizontale."], anim: "De profil" };
