// Fiche « Comment faire » : Mollets debout.
import { side } from "../_communs.js";
import { calfStand } from "./_communs.js";

export default { views: [side([calfStand(-22), calfStand(38)], ["Talons sous la marche", "Sur la pointe des pieds"])],
    cue: "Plante des pieds sur le bord d’une marche, talons dans le vide : monte sur la pointe des pieds le plus haut possible, puis redescends lentement.",
    tips: ["Seule la plante du pied est sur la marche.", "Descends les talons sous le niveau de la marche avant de remonter.", "Tiens-toi à un support pour l’équilibre."] };
