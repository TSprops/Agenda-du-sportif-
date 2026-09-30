// Fiche « Comment faire » : Développé Arnold.
import { front, side } from "../_communs.js";
import { arnoldF, arnoldS, fixLegsSeated } from "./_communs.js";

export default { views: [side([0, 1, 2].map(k => fixLegsSeated(arnoldS(k))), ["Paumes vers toi, coudes devant", "Bras ouverts sur les côtés", "Paumes vers l’avant, bras tendus"], [0, 1, 2, 1]),
      front([0, 1, 2].map(arnoldF), ["Paumes vers toi, coudes devant", "Bras ouverts en tournant les poignets", "Poussée : paumes vers l’avant, bras tendus"], [0, 1, 2, 1])],
    cue: "Assis, haltères devant le visage paumes vers toi : pousse vers le haut en tournant les poignets pour finir paumes vers l’avant, puis redescends en tournant dans l’autre sens.",
    tips: ["Assis sur un banc, dossier droit.", "En bas : paumes vers toi, coudes devant le corps.", "La rotation se fait pendant la montée : en haut, paumes vers l’avant."] };
