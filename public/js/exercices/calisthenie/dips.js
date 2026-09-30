// Fiche « Comment faire » : Dips.
import { front, side } from "../_communs.js";
import { dipF, dipLow, dipTop } from "./_communs.js";
import { dipbars, fdips } from "../../figure.js";

export default { grip: "dips", views: [side([dipTop({ eq: [dipbars(96, 176, 110)] }), dipLow({ eq: [dipbars(96, 176, 110)] })], ["Bras tendus", "Coudes à 90°"]),
      front([dipF(0, { eq: [fdips(110)] }), dipF(1, { eq: [fdips(110)] })], ["Bras tendus", "Coudes à 90°"])],
    cue: "Mains qui serrent les barres, bras tendus : descends jusqu’à avoir les coudes à 90°, puis remonte.", tips: ["Les mains entourent les barres, poignets droits.", "Épaules basses, loin des oreilles.", "Buste penché en avant = plus de pectoraux ; buste droit = plus de triceps."] };
