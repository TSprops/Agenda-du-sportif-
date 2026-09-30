// Fiche « Comment faire » : Relevés de jambes.
import { side } from "../_communs.js";
import { hangLeg } from "./_communs.js";
import { BY } from "../calisthenie/_communs.js";
import { pullbar } from "../../figure.js";

export default { views: [side([hangLeg({ eq: [pullbar(120, BY)] }), hangLeg({ near: { th: -2, sh: -2, ft: -20 }, eq: [pullbar(120, BY)] })], ["Suspendu, jambes tendues", "Jambes à l’horizontale"])],
    cue: "Suspendu à la barre sans balancer : monte les jambes tendues jusqu’à l’horizontale, puis redescends lentement.",
    tips: ["Bras tendus, épaules actives.", "Pas d’élan : les jambes montent et descendent lentement.", "Trop dur ? Monte les genoux pliés."] };
