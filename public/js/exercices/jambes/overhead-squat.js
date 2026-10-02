// Fiche « Comment faire » : Overhead squat.
import { t } from "../../commun/i18n.js";
import { ANK, side, stand } from "../_communs.js";
import { bar } from "../../silhouette/index.js";

// Barre tenue bras tendus au-dessus de la tête, prise large ; elle reste au-dessus du milieu des pieds pendant la descente.
const ohBar = [bar(P => P.near.grip, 13, { top: true })];
export default { views: [
      side([stand({ neck: -92, near: { wristAt: [118, 9.5], hand: -92, ls: { ua: 0.9, fa: 0.9 } }, eq: ohBar }),
        { hip: [102, 164], torso: -64, neck: -78, near: { ankleAt: [124, ANK], ft: 0, wristAt: [118, 64], hand: -95, ls: { ua: 0.9, fa: 0.9 } }, eq: ohBar }],
        [t("fiches.overhead-squat.legende1"), t("fiches.overhead-squat.legende2")])],
    cue: t("fiches.overhead-squat.consigne"),
    tips: [t("fiches.overhead-squat.conseil1"), t("fiches.overhead-squat.conseil2"), t("fiches.overhead-squat.conseil3")] };
