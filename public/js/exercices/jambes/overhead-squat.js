// Fiche « Comment faire » : Overhead squat.
import { ANK, side, stand } from "../_communs.js";
import { bar } from "../../silhouette/index.js";

// Barre tenue bras tendus au-dessus de la tête, prise large ; elle reste au-dessus du milieu des pieds pendant la descente.
const ohBar = [bar(P => P.near.grip, 13, { top: true })];
export default { views: [
      side([stand({ neck: -92, near: { wristAt: [118, 9.5], hand: -92, ls: { ua: 0.9, fa: 0.9 } }, eq: ohBar }),
        { hip: [102, 164], torso: -64, neck: -78, near: { ankleAt: [124, ANK], ft: 0, wristAt: [118, 64], hand: -95, ls: { ua: 0.9, fa: 0.9 } }, eq: ohBar }],
        ["Debout, barre au-dessus de la tête", "Squat, barre au-dessus des pieds"])],
    cue: "Barre bras tendus au-dessus de la tête, prise large : descends en squat en gardant la barre à l’aplomb du milieu des pieds.",
    tips: ["Prise large, coudes verrouillés et épaules actives (pousse la barre vers le plafond).", "Buste le plus droit possible, regard devant.", "Commence avec un bâton ou une barre à vide : c’est un mouvement de mobilité autant que de force."] };
