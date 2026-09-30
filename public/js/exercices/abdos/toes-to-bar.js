// Fiche « Comment faire » : Toes to bar.
import { side } from "../_communs.js";
import { hangLeg } from "./_communs.js";
import { BY, onBar } from "../calisthenie/_communs.js";
import { pullbar } from "../../silhouette/index.js";

// Les jambes montent par l'avant (étape « à l'horizontale ») jusqu'à toucher la barre, pointes de pieds vers la barre.
export default { views: [side([hangLeg({ eq: [pullbar(120, BY)] }), hangLeg({ near: { th: -2, sh: -2, ft: -20 }, eq: [pullbar(120, BY)] }),
      { hip: [148, BY + 93], torso: -140, neck: -140, near: { wristAt: onBar, hand: -90, ankleAt: [140, BY + 12], ft: -150 }, eq: [pullbar(120, BY)] }], ["Suspendu", "Jambes à l’horizontale", "Pointes de pieds à la barre"], [0, 1, 2, 1])],
    cue: "Suspendu à la barre : monte les pieds jusqu’à toucher la barre, jambes tendues, puis redescends en contrôlant.",
    tips: ["Les pointes de pieds touchent la barre, entre les mains.", "Bras tendus, épaules qui tirent vers le bas.", "Contrôle la descente pour ne pas te balancer."] };
