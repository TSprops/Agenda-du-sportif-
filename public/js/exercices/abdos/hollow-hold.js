// Fiche « Comment faire » : Hollow hold.
import { side } from "../_communs.js";
import { GROUND } from "../../silhouette/index.js";

export default { views: [side([{ hip: [124, GROUND - 13], torso: -172, neck: -170, near: { ua: -168, fa: -170, hand: -170, th: -12, sh: -12, ft: -12 } }], ["Position à tenir"])],
    cue: "Allongé sur le dos, bas du dos plaqué au sol : bras tendus derrière la tête et jambes tendues, décollés du sol.",
    tips: ["Le bas du dos reste collé au sol.", "Épaules et pieds décollés de quelques centimètres.", "Trop dur ? Genoux pliés ou bras le long du corps."] };
