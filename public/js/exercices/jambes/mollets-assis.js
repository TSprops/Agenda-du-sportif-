// Fiche « Comment faire » : Mollets assis.
import { side } from "../_communs.js";
import { seatCalf } from "./_communs.js";

export default { views: [side([seatCalf(-18), seatCalf(34)], ["Talons en bas", "Talons levés"])],
    cue: "Assis, coussin sur les genoux, plante des pieds sur la marche : monte les talons le plus haut possible, puis redescends lentement.",
    tips: ["Seule la plante du pied est sur la marche, talons dans le vide.", "Coussin bien calé sur le bas des cuisses.", "Mouvement lent, pause en haut."] };
