// Fiche « Comment faire » : Clean.
import { ANK, side, stand } from "../_communs.js";
import { liftBar, pullExt, pullFloor, pullKnee, snatchStart } from "./_communs.js";
import { GROUND, bar } from "../../silhouette/index.js";

// Réception : les coudes passent vers l'avant, sous la barre (plus de rotation de l'avant-bras vers l'arrière).
export default { views: [side([{ ...snatchStart, near: { ...snatchStart.near, wristAt: [130, GROUND - 18.5] } },
      stand({ near: { wristAt: [131, 60], elbowBend: -1, hand: -30 }, eq: [bar(P => P.near.grip, 13, { top: true })] })], ["Barre au sol", "Barre reçue sur les épaules, coudes devant"])],
    animViews: [side([pullFloor(130), pullKnee(), pullExt(),
      liftBar({ hip: [114, 128], torso: -84, neck: -88, near: { ankleAt: [124, ANK], ft: 0, kneeBend: 1, wristAt: [130.4, 75.3], elbowBend: -1, hand: -30, track: 1 } }),
      liftBar(stand({ near: { wristAt: [131, 60], elbowBend: -1, hand: -30, track: 1 } }))],
      ["Barre au sol", "Barre devant les genoux", "Extension, sur la pointe des pieds", "Réception, coudes devant sous la barre", "Debout, barre sur les épaules"], [0, 1, 2, 3, 4, 3, 2, 1])],
    cue: "Barre près du corps : tire du sol avec les jambes, puis passe les coudes devant pour la recevoir sur l’avant des épaules.",
    tips: ["Prise à largeur d’épaules, dos plat au départ.", "La barre reste collée au corps pendant la montée.", "Réception coudes hauts, barre posée sur les clavicules."] };
