// Fiche « Comment faire » : Soulevé de terre sumo.
import { front, side } from "../_communs.js";
import { dlKnee, dlStart, dlTop } from "./_communs.js";
import { fbar } from "../../figure.js";

export default { animViews: [side([dlStart(126, { hip: [102, 180], torso: -62, near: { ls: { th: 0.8 } } }), dlKnee(), dlTop()], ["Barre au sol, buste plus droit", "Barre devant les genoux", "Debout"], [0, 1, 2, 1]), "De face"], views: [
      side([dlStart(126, { hip: [102, 180], torso: -62, near: { ls: { th: 0.8 } } }), dlTop()], ["Barre au sol, buste plus droit", "Debout"]),
      front([{ view: "front", torso: -90, neck: -90, tls: 0.35, hip: [120, 150], R: { th: 40, sh: 95, ls: { th: 0.8, sh: 0.65 }, wristAt: [132, 190.5], hand: 90 }, eq: [fbar(P => P.R.grip[1], { top: true })] },
        { view: "front", torso: -90, neck: -90, hip: [120, 116], R: { th: 70, sh: 95, wristAt: [133, 120], hand: 90 }, eq: [fbar(P => P.R.grip[1], { top: true })] }], ["Pieds très écartés, mains entre les genoux", "Debout"])],
    cue: "Pieds très écartés, pointes vers l’extérieur, mains entre les genoux : pousse les genoux vers l’extérieur et remonte en gardant le dos plat.",
    tips: ["Écartement des pieds bien plus large que les épaules, pointes vers l’extérieur.", "Mains à l’intérieur des genoux, bras tendus.", "Genoux dans l’axe des pieds, buste plus droit qu’au soulevé classique."] };
