// Fiche « Comment faire » : Squat.
import { ANK, HIPY, front, side } from "../_communs.js";
import { SQUAT_TIPS, backSquat, squatF } from "./_communs.js";
import { fbar } from "../../silhouette/index.js";

export default { views: [
      side([backSquat([120, HIPY], -90, [124, ANK]), backSquat([104, 166], -58, [124, ANK])], ["Debout, barre sur le haut du dos", "Cuisses parallèles au sol"]),
      // Coudes vers le bas, sous la barre ; la barre repose sur le haut du dos (derrière la nuque).
      front([squatF(0, { R: { ua: 75, fa: -70, hand: -90, ls: { ua: 0.6 } }, eq: [fbar(P => P.R.grip[1])] }), squatF(1, { R: { ua: 75, fa: -70, hand: -90, ls: { ua: 0.6, th: 0.3 } }, eq: [fbar(P => P.R.grip[1])] })], ["Debout, coudes sous la barre", "Genoux dans l’axe des pieds"])],
    cue: "Barre sur le haut du dos, dos droit : descends les hanches jusqu’aux cuisses parallèles au sol, genoux dans l’axe des pieds, puis pousse dans les talons.", tips: SQUAT_TIPS };
