// Fiche « Comment faire » : Box jumps.
import { ANK, onToes, side } from "../_communs.js";
import { boxAt } from "./_communs.js";

// Élan, impulsion (jambes tendues, bras vers l'avant), saut genoux groupés au-dessus de la box, réception pieds posés
// sur la box. Les pieds suivent une ligne droite (track) qui passe au-dessus du bord. L'animation revient en arrière.
export default { views: [side([
      { hip: [98, 142], torso: -52, neck: -40, near: { ankleAt: [112, ANK], ft: 0, ua: 118, fa: 122, hand: 122, h: "open" }, eq: [boxAt] },
      { hip: [112, 114], torso: -65, neck: -72, near: { ankleAt: onToes(122, 45), ft: 45, kneeBend: 1, ua: -38, fa: -42, hand: -42, h: "open", track: 1 }, eq: [boxAt] },
      { hip: [140, 92], torso: -70, neck: -78, near: { ankleAt: [150, 122], ft: 20, kneeBend: 1, ua: -20, fa: -24, hand: -24, h: "open", track: 1 }, eq: [boxAt] },
      { hip: [168, 116], torso: -62, neck: -75, near: { ankleAt: [182, 150 - 7.2], ft: 0, ua: 10, fa: 0, hand: 0, h: "open", track: 1 }, eq: [boxAt] }],
      ["Élan : bras en arrière", "Impulsion : jambes tendues", "Saut : genoux groupés", "Réception sur la box"], [0, 1, 2, 3, 2, 1])],
    cue: "Élan des bras vers l’arrière, saute à pieds joints en lançant les bras devant, et réceptionne-toi en douceur sur la box, genoux fléchis.",
    tips: ["Les bras accompagnent le saut : arrière à l’élan, avant au décollage.", "Réception pieds entiers sur la box, genoux dans l’axe.", "Redescends en marchant plutôt qu’en sautant."] };
