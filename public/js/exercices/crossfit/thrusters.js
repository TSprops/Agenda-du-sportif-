// Fiche « Comment faire » : Thrusters.
import { ANK, HIPY, front, side, stand, standF } from "../_communs.js";
import { rack } from "./_communs.js";
import { bar, fbar } from "../../silhouette/index.js";

export default { views: [
      side([{ hip: [108, 165], torso: -70, neck: -84, near: { ankleAt: [124, ANK], ft: 0, ...rack }, eq: [bar(P => P.near.grip, 13, { top: true })] },
        stand({ near: { ua: -88, fa: -88, hand: -90 }, eq: [bar(P => P.near.grip, 13, { top: true })] })], ["Squat, barre sur les épaules", "Barre au-dessus de la tête"]),
      front([standF({ hip: [120, HIPY + 40], R: { th: 84, sh: 92, ua: 60, fa: -100, hand: -90, ls: { ua: 0.45, th: 0.2, sh: 0.93 } }, eq: [fbar(P => P.R.grip[1], { top: true })] }),
        standF({ R: { ua: -70, fa: -84, hand: -90 }, eq: [fbar(P => P.R.grip[1], { top: true })] })], ["Squat, genoux dans l’axe des pieds", "Bras tendus"])],
    cue: "Barre posée devant les épaules : descends en squat, puis remonte et pousse la barre au-dessus de la tête d’un seul mouvement.",
    tips: ["Coudes hauts devant toi pendant le squat.", "Genoux dans l’axe des pieds, talons au sol.", "Utilise l’élan des jambes pour pousser la barre."], anim: "De profil" };
