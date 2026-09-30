// Fiche « Comment faire » : Squats (poids du corps).
import { ANK, front, side, stand } from "../_communs.js";
import { SQUAT_TIPS, squatF } from "./_communs.js";

export default { views: [
      side([stand({ near: { ua: -2, fa: -2, hand: -2, h: "open" } }), { hip: [104, 166], torso: -58, neck: -76, near: { ankleAt: [124, ANK], ft: 0, ua: -2, fa: -2, hand: -2, h: "open" } }], ["Debout, bras devant", "Cuisses parallèles au sol"]),
      front([squatF(0, { R: { ua: 86, fa: 90 } }), squatF(1, { R: { ua: -80, fa: -80, ls: { ua: 0.25, fa: 0.25, th: 0.3 }, h: "open" } })], ["Debout", "Genoux dans l’axe des pieds"])],
    cue: "Bras devant pour l’équilibre : descends les hanches jusqu’aux cuisses parallèles au sol, genoux dans l’axe des pieds, talons au sol, puis remonte.", tips: SQUAT_TIPS, anim: "De profil" };
