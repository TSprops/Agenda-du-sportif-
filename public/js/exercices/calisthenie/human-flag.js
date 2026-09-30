// Fiche « Comment faire » : Human flag.
import { front } from "../_communs.js";
import { pole } from "../../figure.js";

export default { views: [front([{ view: "front", torso: 0, neck: 0, hip: [52, 118],
      // Les deux coudes orientés de la même façon (miroir) : vers l'extérieur, jamais vers l'intérieur du corps.
      R: { wristAt: [144, 176], hand: 0, th: 180, sh: 180, elbowBend: -1 }, L: { wristAt: [144, 64], hand: 0, th: 180, sh: 180, elbowBend: 1 }, eq: [pole(152)] }], ["Position à tenir"])],
    cue: "Mains serrées sur une barre verticale, bras tendus : le bras du haut tire, celui du bas pousse, corps horizontal sur le côté.",
    tips: ["Mains écartées d’environ une largeur d’épaules et demie sur le poteau.", "Bras du haut qui tire, bras du bas qui pousse, tous les deux tendus.", "Progression : commence jambes groupées, puis une jambe tendue."] };
