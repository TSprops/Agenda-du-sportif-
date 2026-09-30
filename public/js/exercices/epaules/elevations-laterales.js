// Fiche « Comment faire » : Élévations latérales.
import { front, side } from "../_communs.js";
import { latF, latS } from "./_communs.js";

export default { views: [side([latS(0), latS(1)], ["Bras le long du corps", "Bras à l’horizontale sur les côtés"]), front([latF(0), latF(1)], ["Bras le long du corps", "Bras à l’horizontale"])],
    cue: "Bras presque tendus : monte les haltères sur les côtés jusqu’à l’horizontale, sans hausser les épaules, puis redescends lentement.",
    tips: ["Charges légères, coudes légèrement fléchis.", "Monte jusqu’à l’horizontale, pas plus haut.", "Épaules basses : ce ne sont pas les trapèzes qui travaillent."], anim: "De face" };
