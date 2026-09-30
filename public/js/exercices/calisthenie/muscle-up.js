// Fiche « Comment faire » : Muscle-up.
import { side, stand } from "../_communs.js";
import { BY, hang, pullTop } from "./_communs.js";
import { pullbar } from "../../silhouette/index.js";

export default { grip: "pro", views: [side([
      hang({ hip: [118, BY + 112], eq: [pullbar(120, BY)] }),
      pullTop({ hip: [114, BY + 52], torso: -104, eq: [pullbar(120, BY)] }),
      stand({ hip: [121, BY - 3], torso: -96, neck: -92, near: { wristAt: [120, BY - 5.5], hand: 90, th: 96, sh: 98, ft: 40 }, eq: [pullbar(120, BY)] })],
      ["Bras tendus", "Tirage explosif, poitrine à la barre", "Corps au-dessus de la barre, bras tendus"], [0, 1, 2, 1])],
    cue: "Tire de façon explosive jusqu’à la poitrine, bascule les poignets par-dessus la barre, puis pousse jusqu’à avoir les bras tendus, corps au-dessus de la barre.",
    tips: ["Maîtrise d’abord 10 tractions strictes et des dips.", "Tire la barre vers le bas des pectoraux, pas vers le menton.", "À la fin, bras tendus et hanches au niveau de la barre."] };
