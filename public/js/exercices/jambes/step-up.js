// Fiche « Comment faire » : Step-up.
import { ANK, side, stand } from "../_communs.js";
import { box, db } from "../../silhouette/index.js";

export default { views: [side([
      stand({ hip: [108, 112], torso: -84, near: { ankleAt: [152, 150.8], ft: 0 }, far: { ankleAt: [104, ANK], ft: 0 }, eq: [box(130, 158, 56, 52), db(P => [P.near.grip, 90], "side", { mid: true })] }),
      stand({ hip: [150, 60.8], near: { ankleAt: [152, 150.8], ft: 0 }, far: { th: 40, sh: 110, ft: 30 }, eq: [box(130, 158, 56, 52), db(P => [P.near.grip, 90], "side", { mid: true })] })], ["Un pied sur la box", "Debout au-dessus du genou"])],
    cue: "Pose un pied entier sur la box : monte en poussant sur ce pied jusqu’à être debout au-dessus de ce genou, puis redescends en contrôlant.",
    tips: ["Box à hauteur de genou environ, pied entier posé dessus.", "Pousse sur le talon du pied posé sur la box, sans t’aider de l’autre jambe.", "Monte jusqu’à être bien droit, puis redescends lentement."] };
