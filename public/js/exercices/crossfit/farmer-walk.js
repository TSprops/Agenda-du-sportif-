// Fiche « Comment faire » : Farmer walk.
import { t } from "../../commun/i18n.js";
import { ANK, front, onToes, side, stand, standF } from "../_communs.js";
import { db, fdb } from "../../silhouette/index.js";

export default { views: [
      side([stand({ torso: -92, neck: -92, near: { ankleAt: [136, ANK], ua: 90, fa: 90, hand: 90 }, far: { ankleAt: onToes(106, 20), ft: 20 }, eq: [db(P => [P.near.grip, 90], "side", { mid: true })] }),
        stand({ torso: -92, neck: -92, near: { ankleAt: onToes(106, 20), ft: 20, ua: 90, fa: 90, hand: 90 }, far: { ankleAt: [136, ANK], ft: 0 }, eq: [db(P => [P.near.grip, 90], "side", { mid: true })] })], [t("fiches.farmer-walk.legende1"), t("fiches.farmer-walk.legende2")]),
      front([standF({ R: { ua: 86, fa: 90 }, eq: [fdb("end", { top: true })] })], [t("fiches.farmer-walk.legende3")])],
    cue: t("fiches.farmer-walk.consigne"),
    tips: [t("fiches.farmer-walk.conseil1"), t("fiches.farmer-walk.conseil2"), t("fiches.farmer-walk.conseil3")] };
