// Fiche « Comment faire » : Hack squat.
import { side } from "../_communs.js";
import { hackEq } from "./_communs.js";

export default { views: [side([
      { hip: [118, 108], torso: -115, neck: -100, near: { ankleAt: [168, 184], ft: -45, wristAt: [104, 70], hand: -60 }, eq: hackEq },
      { hip: [137, 145], torso: -115, neck: -100, near: { ankleAt: [168, 184], ft: -45, wristAt: [123, 107], hand: -60 }, eq: hackEq }], ["Jambes presque tendues", "Cuisses parallèles à la plateforme"])],
    cue: "Dos collé au dossier, épaules sous les coussins, pieds sur la plateforme : descends le chariot en pliant les genoux, puis pousse.",
    tips: ["Dos et bassin collés au dossier.", "Pieds largeur d’épaules au milieu de la plateforme.", "Ne verrouille pas les genoux en haut."] };
