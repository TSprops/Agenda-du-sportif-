// Fiche « Comment faire » : Front squat.
import { ANK, HIPY, front, side } from "../_communs.js";
import { frontRack, squatF } from "./_communs.js";
import { fbar } from "../../figure.js";

export default { views: [
      side([frontRack([120, HIPY], -90, [124, ANK]), frontRack([106, 166], -72, [124, ANK])], ["Barre sur l’avant des épaules", "Buste droit, cuisses parallèles"]),
      front([squatF(0, { R: { ua: 60, fa: -100, hand: -90, ls: { ua: 0.45, fa: 0.3 } }, eq: [fbar(P => P.R.shoulder[1] + 2, { top: true })] }), squatF(1, { R: { ua: 60, fa: -100, hand: -90, ls: { ua: 0.45, fa: 0.3, th: 0.3 } }, eq: [fbar(P => P.R.shoulder[1] + 2, { top: true })] })], ["Barre sur l’avant des épaules, coudes hauts", "Genoux dans l’axe des pieds"])],
    cue: "Barre posée devant, sur le haut des épaules et les clavicules, coudes hauts : descends en gardant le buste droit, puis remonte.",
    tips: ["La barre repose sur l’avant des épaules, contre la gorge, pas dans les mains.", "Coudes hauts et pointés devant toi pendant toute la descente.", "Genoux dans l’axe des pieds, buste plus droit qu’au squat classique."] };
