// Fiche « Comment faire » : Kettlebell swings.
import { ANK, DA, side, stand } from "../_communs.js";
import { add, kb } from "../../silhouette/index.js";

export default { views: [side([
      { hip: [100, 120], torso: -35, neck: -20, near: { ankleAt: [124, ANK], ft: 0, wristAt: [122, 142], hand: 110 }, eq: [kb(P => P.near.grip, { mid: true })] },
      stand({ torso: -92, near: { ua: -4, fa: -4, hand: -4 }, eq: [kb(P => add(P.near.grip, [4, -4]), { top: true })] })], DA)],
    cue: "Mouvement des hanches, pas des bras : kettlebell entre les jambes, projette les hanches vers l’avant pour la lancer à hauteur des épaules.",
    tips: ["Dos plat, hanches en arrière comme pour fermer une porte avec les fesses.", "Les bras restent tendus : ce sont les fessiers qui lancent.", "En haut, corps droit et gainé, sans te pencher en arrière."] };
