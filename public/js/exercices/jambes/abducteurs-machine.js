// Fiche « Comment faire » : Abducteurs machine.
import { front } from "../_communs.js";
import { add, fbench, roller } from "../../figure.js";

export default { views: [front([
      { view: "front", hip: [120, 142], torso: -90, neck: -90, R: { th: 90, sh: 90, ls: { th: 0.3 }, ua: 80, fa: 90, hand: 90 }, eq: [fbench(150), roller(P => add(P.R.knee, [9, 0]), 6, { top: true }), roller(P => add(P.L.knee, [-9, 0]), 6, { top: true })] },
      { view: "front", hip: [120, 142], torso: -90, neck: -90, R: { th: 40, sh: 84, ls: { th: 0.45 }, ua: 80, fa: 90, hand: 90 }, eq: [fbench(150), roller(P => add(P.R.knee, [9, 0]), 6, { top: true }), roller(P => add(P.L.knee, [-9, 0]), 6, { top: true })] }], ["Genoux serrés", "Genoux écartés"])],
    cue: "Assis, coussins contre l’extérieur des genoux : écarte les jambes, puis ramène-les lentement.",
    tips: ["Dos collé au dossier, mains sur les poignées.", "Écarte sans à-coups, garde 1 seconde, ramène lentement."] };
