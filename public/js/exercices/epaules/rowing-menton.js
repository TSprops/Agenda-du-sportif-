// Fiche « Comment faire » : Rowing menton.
import { front, side } from "../_communs.js";
import { uprowF, uprowS } from "./_communs.js";

export default { views: [side([uprowS(0), uprowS(1)], ["Barre contre les cuisses", "Barre sous le menton, coudes hauts"]), front([uprowF(0), uprowF(1)], ["Mains à largeur d’épaules", "Coudes plus hauts que les mains"])],
    cue: "Barre contre les cuisses : monte-la le long du corps en levant les coudes sur les côtés, jusqu’en bas de la poitrine, puis redescends.",
    tips: ["Mains à largeur d’épaules (pas collées).", "Les coudes montent plus haut que les mains.", "Arrête-toi au bas de la poitrine."], anim: "De face" };
