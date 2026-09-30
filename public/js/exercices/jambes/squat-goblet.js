// Fiche « Comment faire » : Squat goblet.
import { ANK, front, side, stand } from "../_communs.js";
import { squatF } from "./_communs.js";
import { add, db } from "../../figure.js";

export default { views: [
      side([stand({ near: { wristAt: [136, 96], hand: -80 }, eq: [db(P => [add(P.near.grip, [3, 0]), 0], "side", { top: true })] }),
        { hip: [104, 166], torso: -66, neck: -80, near: { ankleAt: [124, ANK], ft: 0, wristAt: [140, 128], hand: -80 }, eq: [db(P => [add(P.near.grip, [3, 0]), 0], "side", { top: true })] }], ["Haltère contre la poitrine", "Coudes entre les genoux"]),
      front([squatF(0, { R: { wristAt: [128, 96], hand: 180, ls: {} }, eq: [db(P => [[120, P.R.grip[1]], 90], "side", { top: true })] }),
        squatF(1, { R: { wristAt: [128, 140], hand: 180 }, eq: [db(P => [[120, P.R.grip[1]], 90], "side", { top: true })] })], ["Debout", "Genoux dans l’axe des pieds"])],
    cue: "Haltère tenu à deux mains contre la poitrine : descends entre tes genoux en gardant le buste droit, genoux dans l’axe des pieds, puis remonte.",
    tips: ["Haltère tenu verticalement contre la poitrine, coudes vers le bas.", "Pieds un peu plus larges que les épaules, genoux dans l’axe des pieds.", "En bas, les coudes passent entre les genoux."] };
