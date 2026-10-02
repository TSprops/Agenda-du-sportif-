// Fiche « Comment faire » : Power clean.
import { ANK, side, stand } from "../_communs.js";
import { liftBar, pullExt, pullFloor, pullKnee, snatchStart } from "./_communs.js";
import { GROUND } from "../../silhouette/index.js";

// Réception en quart de squat (hanches au-dessus des genoux), coudes devant sous la barre.
const catchQ = o => liftBar({ hip: [114, 128], torso: -84, neck: -88, near: { ankleAt: [124, ANK], ft: 0, kneeBend: 1, wristAt: [130.4, 75.3], elbowBend: -1, hand: -30, ...o } });
export default { views: [side([{ ...snatchStart, near: { ...snatchStart.near, wristAt: [130, GROUND - 18.5] } }, catchQ()], ["Barre au sol", "Réception en quart de squat, coudes devant"])],
    animViews: [side([pullFloor(130), pullKnee(), pullExt(), catchQ({ track: 1 }),
      liftBar(stand({ near: { wristAt: [131, 60], elbowBend: -1, hand: -30, track: 1 } }))],
      ["Barre au sol", "Barre devant les genoux", "Extension, sur la pointe des pieds", "Réception en quart de squat", "Debout, barre sur les épaules"], [0, 1, 2, 3, 4, 3, 2, 1])],
    cue: "Comme un clean, mais tu reçois la barre haut : jambes à peine fléchies, sans descendre en squat complet.",
    tips: ["Dos plat au départ, barre au-dessus du milieu des pieds.", "Pousse fort dans le sol et monte sur la pointe des pieds avant de tirer avec les bras.", "Réception hanches au-dessus des genoux, coudes hauts devant."] };
