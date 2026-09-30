// Fiche « Comment faire » : Russian twist.
import { front, side } from "../_communs.js";
import { GROUND, add, medball } from "../../silhouette/index.js";

export default { views: [
      side([{ hip: [110, GROUND - 10], torso: -125, neck: -110, near: { th: -40, sh: 25, ft: 10, wristAt: [116, 164], hand: -10 }, eq: [medball(P => add(P.near.grip, [4, 0]), { top: true })] }], ["Assis, buste penché en arrière"]),
      front([
        { view: "front", hip: [120, 184], tls: 0.75, torso: -90, neck: -90, R: { th: -70, sh: 90, ls: { th: 0.35, sh: 0.45 }, wristAt: [152, 170], hand: 0 }, L: { wristAt: [140, 176], hand: 0 }, eq: [medball(P => [(P.R.grip[0] + P.L.grip[0]) / 2 + 4, P.R.grip[1] + 2], { top: true })] },
        { view: "front", hip: [120, 184], tls: 0.75, torso: -90, neck: -90, R: { th: -70, sh: 90, ls: { th: 0.35, sh: 0.45 }, wristAt: [100, 176], hand: 180 }, L: { wristAt: [88, 170], hand: 180 }, eq: [medball(P => [(P.R.grip[0] + P.L.grip[0]) / 2 - 4, P.L.grip[1] + 2], { top: true })] }],
        ["Poids à droite", "Poids à gauche"])],
    cue: "Assis, buste penché en arrière comme en haut d’un crunch, pieds décollés : fais passer le poids d’un côté à l’autre en tournant les épaules.",
    tips: ["Dos droit (pas arrondi), buste penché à environ 45°.", "Ce sont les épaules qui tournent, le poids suit.", "Trop dur ? Garde les talons au sol."] };
