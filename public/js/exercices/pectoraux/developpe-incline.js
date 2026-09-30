// Fiche « Comment faire » : Développé incliné.
import { front, side } from "../_communs.js";
import { benchEq, benchLie, incF, inclineArms } from "./_communs.js";

export default { grip: "bench", views: [side([benchLie(35, inclineArms(1), benchEq(35)), benchLie(35, inclineArms(0), benchEq(35))], ["Barre en haut des pectoraux", "Bras tendus"]),
      front([incF(1), incF(0)], ["Coudes à 90°", "Bras tendus"])],
    cue: "Sur un banc incliné à 30–45° : descends la barre sur le haut des pectoraux, puis pousse vers le haut.",
    tips: ["Dossier relevé à 30–45° (2 ou 3 crans).", "Barre descendue sur le haut des pectoraux, sous les clavicules.", "Coudes à environ 45° du buste ; en bas, coudes à 90°."], anim: "De profil" };
