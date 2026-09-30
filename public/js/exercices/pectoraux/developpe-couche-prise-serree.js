// Fiche « Comment faire » : Développé couché prise serrée.
import { front, side } from "../_communs.js";
import { benchEq, benchF, benchLie, closeArms } from "./_communs.js";

export default { grip: "close", views: [side([benchLie(0, closeArms(1), benchEq(0)), benchLie(0, closeArms(0), benchEq(0))], ["Barre au bas des pectoraux, coudes le long du buste", "Bras tendus"]),
      front([benchF(1, 138, "bar", { R: { wristAt: [138, 122], hand: -90, elbowBend: -1, ls: { ua: 0.5 } } }), benchF(0, 146)], ["Mains à largeur d’épaules, coudes serrés", "Bras tendus"])],
    cue: "Mains à largeur d’épaules sur la barre : descends au bas des pectoraux en gardant les coudes près du corps, puis pousse.",
    tips: ["Mains à largeur d’épaules, pas plus serré.", "Coudes près du corps pendant la descente.", "Travaille surtout les triceps."], anim: "De profil" };
