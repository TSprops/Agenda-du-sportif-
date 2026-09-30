// Fiche « Comment faire » : Back lever.
import { side } from "../_communs.js";
import { BY } from "./_communs.js";
import { pullbar } from "../../silhouette/index.js";

export default { views: [side([{ hip: [96, 80], torso: 0, neck: 2, near: { wristAt: [120, BY + 4], hand: -140, th: 180, sh: 180, ft: 180 }, eq: [pullbar(120, BY)] }], ["Position à tenir"])],
    cue: "Suspendu, bras tendus derrière le dos : corps gainé à l’horizontale, face vers le sol.", tips: ["Face vers le sol, corps droit des épaules aux pieds.", "Bras tendus, épaules vers l’avant.", "Progression : jambes groupées, puis une jambe tendue."] };
