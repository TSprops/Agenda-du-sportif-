// Fiche « Comment faire » : Presse à cuisses.
import { side } from "../_communs.js";
import { pressEq } from "./_communs.js";

export default { views: [side([
      { hip: [92, 150], torso: -148, neck: -148, near: { ankleAt: [134, 104], ft: -135, kneeBend: 1, wristAt: [100, 158], hand: 0 }, eq: pressEq() },
      { hip: [92, 150], torso: -148, neck: -148, near: { ankleAt: [158, 80], ft: -135, kneeBend: 1, wristAt: [100, 158], hand: 0 }, eq: pressEq() }], ["Genoux pliés", "Jambes presque tendues"])],
    cue: "Dos et bassin collés au siège, pieds sur la plateforme : pousse sans verrouiller les genoux, puis redescends lentement.",
    tips: ["Pieds largeur de hanches au milieu de la plateforme.", "Descends jusqu’à avoir les genoux à 90°, sans décoller le bassin.", "Ne verrouille pas les genoux en haut."] };
