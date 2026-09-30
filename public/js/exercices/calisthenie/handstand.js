// Fiche « Comment faire » : Handstand.
import { side } from "../_communs.js";
import { GROUND } from "../../silhouette/index.js";

export default { views: [side([{ hip: [118, 99], torso: 91, neck: 78, near: { wristAt: [121, GROUND - 3], h: "flat", hand: 0, th: -90, sh: -90, ft: -90 } }], ["Position à tenir"])],
    cue: "Mains à largeur d’épaules, corps gainé et aligné, regard entre les mains.", tips: ["Commence contre un mur, ventre face au mur.", "Bras tendus, épaules qui poussent vers le haut.", "Corps aligné : mains, épaules, hanches, pieds."] };
