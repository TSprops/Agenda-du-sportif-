// Fiche « Comment faire » : Fentes bulgares.
import { t } from "../../commun/i18n.js";
import { ANK, side, stand } from "../_communs.js";
import { bench, db } from "../../silhouette/index.js";

export default { views: [side([
      stand({ hip: [114, 126], near: { ankleAt: [150, ANK], ft: 0 }, far: { ankleAt: [46, 156], ft: 170, kneeBend: 1 }, eq: [bench(0, 58, 163), db(P => [P.near.grip, 90], "side", { mid: true })] }),
      stand({ hip: [108, 150], near: { ankleAt: [150, ANK], ft: 0 }, far: { ankleAt: [46, 156], ft: 170, kneeBend: 1 }, eq: [bench(0, 58, 163), db(P => [P.near.grip, 90], "side", { mid: true })] })], [t("fiches.fentes-bulgares.legende1"), t("fiches.fentes-bulgares.legende2")])],
    cue: t("fiches.fentes-bulgares.consigne"),
    tips: [t("fiches.fentes-bulgares.conseil1"), t("fiches.fentes-bulgares.conseil2"), t("fiches.fentes-bulgares.conseil3")] };
