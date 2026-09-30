// Fiche « Comment faire » : Développé militaire.
import { front, side } from "../_communs.js";
import { ohpF, ohpS } from "./_communs.js";

export default { views: [side([ohpS(0), ohpS(1)], ["Haltères à hauteur des épaules", "Bras tendus au-dessus de la tête"]), front([ohpF(0), ohpF(1)], ["Coudes sous les poignets", "Bras tendus"])],
    cue: "Debout, un haltère dans chaque main à hauteur des épaules, paumes vers l’avant : pousse au-dessus de la tête sans cambrer le dos, puis redescends.",
    tips: ["Départ : haltères à hauteur des oreilles, coudes sous les poignets.", "Monte jusqu’aux bras presque tendus, sans cogner les haltères.", "Abdos et fessiers serrés : le dos ne se creuse pas."], anim: "De face" };
