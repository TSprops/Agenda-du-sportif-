// Fiche « Comment faire » : Push press.
import { ANK, side, stand } from "../_communs.js";
import { rack } from "../crossfit/_communs.js";
import { bar } from "../../silhouette/index.js";

export default { views: [side([stand({ near: rack, eq: [bar(P => P.near.grip, 13, { top: true })] }), { hip: [114, 124], torso: -88, neck: -88, near: { ankleAt: [124, ANK], ft: 0, ...rack }, eq: [bar(P => P.near.grip, 13, { top: true })] },
      stand({ near: { ua: -88, fa: -88, hand: -90 }, eq: [bar(P => P.near.grip, 13, { top: true })] })], ["Barre sur les épaules", "Petite flexion des genoux", "Poussée au-dessus de la tête"], [0, 1, 2, 1])],
    cue: "Barre sur l’avant des épaules : fléchis un peu les genoux, puis pousse avec les jambes et termine avec les bras pour amener la barre au-dessus de la tête.",
    tips: ["Petite flexion des genoux, buste droit.", "L’élan des jambes lance la barre, les bras finissent.", "Bras verrouillés en haut, barre au-dessus de la nuque."] };
