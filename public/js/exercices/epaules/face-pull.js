// Fiche « Comment faire » : Face pull.
import { front, side, standF } from "../_communs.js";
import { facepullS } from "./_communs.js";

export default { views: [side([facepullS(0), facepullS(1)], ["Bras tendus vers la poulie", "Corde vers le visage, coudes hauts"]),
      front([standF({ R: { ua: -20, fa: -60, hand: -60, ls: { ua: 0.12, fa: 0.2 } } }), standF({ R: { ua: 0, fa: -135, hand: -120 } })], ["Bras tendus vers la poulie", "Coudes hauts et écartés, mains au visage"])],
    cue: "Poulie à hauteur du visage, corde en main : tire vers les yeux en écartant les mains, coudes hauts, puis reviens bras tendus.",
    tips: ["Coudes à hauteur des épaules ou plus haut.", "Écarte les mains de chaque côté de la tête en fin de mouvement.", "Charge légère, mouvement lent."], anim: "De profil" };
