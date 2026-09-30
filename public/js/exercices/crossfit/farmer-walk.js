// Fiche « Comment faire » : Farmer walk.
import { ANK, front, onToes, side, stand, standF } from "../_communs.js";
import { db, fdb } from "../../silhouette/index.js";

export default { views: [
      side([stand({ torso: -92, neck: -92, near: { ankleAt: [136, ANK], ua: 90, fa: 90, hand: 90 }, far: { ankleAt: onToes(106, 20), ft: 20 }, eq: [db(P => [P.near.grip, 90], "side", { mid: true })] }),
        stand({ torso: -92, neck: -92, near: { ankleAt: onToes(106, 20), ft: 20, ua: 90, fa: 90, hand: 90 }, far: { ankleAt: [136, ANK], ft: 0 }, eq: [db(P => [P.near.grip, 90], "side", { mid: true })] })], ["Un pas", "Le pas suivant"]),
      front([standF({ R: { ua: 86, fa: 90 }, eq: [fdb("end", { top: true })] })], ["Tête haute, buste ouvert"])],
    cue: "Une charge lourde dans chaque main, bras tendus : marche à petits pas, tête haute et buste ouvert.",
    tips: ["Tête haute, regard droit devant.", "Buste ouvert, épaules basses et tirées en arrière.", "Abdos serrés, petits pas réguliers."] };
