// Fiche « Comment faire » : Presse pectoraux.
import { front, side } from "../_communs.js";
import { chestPressF, chestPressS } from "./_communs.js";

export default { views: [side([chestPressS(0), chestPressS(1)], ["Poignées à la poitrine", "Bras tendus devant"]), front([chestPressF(0), chestPressF(1)], ["Coudes à hauteur de poitrine", "Bras tendus vers l’avant"])],
    cue: "Assis sur la machine, dos collé, poignées à hauteur de poitrine : pousse devant toi sans verrouiller les coudes, puis reviens lentement.",
    tips: ["Règle le siège : poignées à hauteur du milieu de la poitrine.", "Dos et tête collés au dossier.", "Pousse jusqu’aux bras presque tendus."], anim: "De profil" };
