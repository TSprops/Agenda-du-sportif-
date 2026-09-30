// Fiche « Comment faire » : Front lever.
import { side } from "../_communs.js";
import { BY } from "./_communs.js";
import { pullbar } from "../../silhouette/index.js";

export default { views: [side([{ hip: [150, 82], torso: 180, neck: 172, near: { wristAt: [120, BY + 5.5], hand: -70, th: 0, sh: 0, ft: 0 }, eq: [pullbar(120, BY)] }], ["Position à tenir"])],
    cue: "Suspendu bras tendus : corps gainé à l’horizontale, face vers le plafond.", tips: ["Bras tendus, tire la barre vers les hanches.", "Corps droit : ni fesses qui tombent, ni dos creux.", "Progression : genoux groupés, puis une jambe tendue."] };
