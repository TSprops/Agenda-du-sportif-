// Fiche « Comment faire » : Squat goblet.
import { t } from "../../commun/i18n.js";
import { ANK, front, side, stand } from "../_communs.js";
import { squatF } from "./_communs.js";
import { add, db } from "../../silhouette/index.js";

export default { views: [
      side([stand({ near: { wristAt: [136, 96], hand: -80 }, eq: [db(P => [add(P.near.grip, [3, 0]), 0], "side", { top: true })] }),
        { hip: [104, 166], torso: -66, neck: -80, near: { ankleAt: [124, ANK], ft: 0, wristAt: [140, 128], hand: -80 }, eq: [db(P => [add(P.near.grip, [3, 0]), 0], "side", { top: true })] }], [t("fiches.squat-goblet.legende1"), t("fiches.squat-goblet.legende2")]),
      front([squatF(0, { R: { wristAt: [128, 96], hand: 180, ls: {} }, eq: [db(P => [[120, P.R.grip[1]], 90], "side", { top: true })] }),
        squatF(1, { R: { wristAt: [128, 140], hand: 180 }, eq: [db(P => [[120, P.R.grip[1]], 90], "side", { top: true })] })], [t("fiches.squat-goblet.legende3"), t("fiches.squat-goblet.legende4")])],
    cue: t("fiches.squat-goblet.consigne"),
    tips: [t("fiches.squat-goblet.conseil1"), t("fiches.squat-goblet.conseil2"), t("fiches.squat-goblet.conseil3")] };
