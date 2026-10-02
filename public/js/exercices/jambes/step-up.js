// Fiche « Comment faire » : Step-up.
import { t } from "../../commun/i18n.js";
import { ANK, side, stand } from "../_communs.js";
import { box, db } from "../../silhouette/index.js";

export default { views: [side([
      stand({ hip: [108, 112], torso: -84, near: { ankleAt: [152, 150.8], ft: 0 }, far: { ankleAt: [104, ANK], ft: 0 }, eq: [box(130, 158, 56, 52), db(P => [P.near.grip, 90], "side", { mid: true })] }),
      stand({ hip: [150, 60.8], near: { ankleAt: [152, 150.8], ft: 0 }, far: { th: 40, sh: 110, ft: 30 }, eq: [box(130, 158, 56, 52), db(P => [P.near.grip, 90], "side", { mid: true })] })], [t("fiches.step-up.legende1"), t("fiches.step-up.legende2")])],
    cue: t("fiches.step-up.consigne"),
    tips: [t("fiches.step-up.conseil1"), t("fiches.step-up.conseil2"), t("fiches.step-up.conseil3")] };
