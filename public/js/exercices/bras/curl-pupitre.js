// Fiche « Comment faire » : Curl pupitre.
import { side } from "../_communs.js";
import { preacher } from "./_communs.js";

export default { views: [side([preacher(0), preacher(1)], ["Bras presque tendus sur le pupitre", "Barre vers les épaules"])],
    cue: "Assis, l’arrière des bras posé sur le pupitre : monte la barre vers les épaules, puis redescends lentement sans tendre brutalement.",
    tips: ["Aisselles calées en haut du pupitre.", "L’arrière des bras reste collé au coussin.", "Garde un léger pli du coude en bas."] };
