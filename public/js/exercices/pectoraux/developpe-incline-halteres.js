// Fiche « Comment faire » : Développé incliné haltères.
import { front, side } from "../_communs.js";
import { benchEq, benchLie, incF, inclineArms } from "./_communs.js";

export default { views: [side([benchLie(35, inclineArms(1), benchEq(35, "db")), benchLie(35, inclineArms(0), benchEq(35, "db"))], ["Haltères en haut des pectoraux", "Bras tendus"]),
      front([incF(1, "db"), incF(0, "db")], ["Coudes à 90°", "Bras tendus"])],
    cue: "Sur un banc incliné à 30–45°, un haltère dans chaque main : descends-les au niveau du haut des pectoraux, puis pousse vers le haut.",
    tips: ["Dossier relevé à 30–45°.", "Paumes vers tes pieds, coudes à environ 45° du buste.", "Descends jusqu’aux coudes à 90°, remonte en rapprochant les haltères."], anim: "De profil" };
