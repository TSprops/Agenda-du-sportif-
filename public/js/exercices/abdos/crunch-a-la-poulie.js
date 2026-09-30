// Fiche « Comment faire » : Crunch à la poulie.
import { side } from "../_communs.js";
import { cable } from "../../silhouette/index.js";

export default { views: [side([
      // Hanches fixes au-dessus des genoux ; le dos s'enroule (curl). Mains contre la tête, coudes toujours vers le bas :
      // le bras garde le même angle par rapport au haut du dos pendant tout le mouvement.
      { hip: [110, 158], torso: -80, neck: -70, near: { th: 90, sh: 180, ft: 180, ua: 60, fa: -110, hand: -110 }, eq: [cable(186, 16, "rope")] },
      { hip: [110, 158], torso: -45, curl: 95, neck: 60, near: { th: 90, sh: 180, ft: 180, ua: 190, fa: 20, hand: 20 }, eq: [cable(186, 16, "rope")] }],
      ["À genoux, corde derrière la tête", "Dos enroulé vers le sol"])],
    cue: "À genoux face à la poulie haute, corde tenue derrière la tête : enroule le dos vers le sol en contractant les abdos, puis remonte lentement.",
    tips: ["Les hanches restent au-dessus des genoux et ne bougent pas.", "Mains fixes contre la tête : c’est le dos qui s’enroule.", "Souffle en descendant."] };
