// Fiche « Comment faire » : Soulevé de terre.
import { front, side, standF } from "../_communs.js";
import { bentF, dlKnee, dlStart, dlTop } from "./_communs.js";
import { fbar } from "../../silhouette/index.js";

export default { animViews: [side([dlStart(), dlKnee(), dlTop()], ["Barre au sol, dos plat", "Barre devant les genoux", "Debout, barre contre les cuisses"], [0, 1, 2, 1]), "De face"], views: [
      side([dlStart(), dlTop()], ["Barre au sol, dos plat", "Debout, barre contre les cuisses"]),
      front([bentF(0.3, { hip: [120, 150], R: { ls: { th: 0.2 }, wristAt: [141, 190.5], hand: 90 }, eq: [fbar(P => P.R.grip[1], { top: true })] }), standF({ R: { wristAt: [141, 124], hand: 90 }, eq: [fbar(P => P.R.grip[1], { top: true })] })], ["Mains juste à l’extérieur des genoux", "Debout"])],
    cue: "Barre au-dessus du milieu des pieds, dos plat : pousse dans le sol avec les jambes en gardant la barre collée aux jambes, jusqu’à être debout.",
    tips: ["Pieds largeur de hanches, barre au-dessus du milieu du pied.", "Dos plat du début à la fin, jamais arrondi.", "Barre collée aux jambes pendant toute la montée.", "En haut, serre les fessiers sans te pencher en arrière."] };
