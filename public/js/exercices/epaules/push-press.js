// Fiche « Comment faire » : Push press.
import { t } from "../../commun/i18n.js";
import { ANK, side, stand } from "../_communs.js";
import { rack } from "../crossfit/_communs.js";
import { bar } from "../../silhouette/index.js";

export default { views: [side([stand({ near: rack, eq: [bar(P => P.near.grip, 13, { top: true })] }), { hip: [114, 124], torso: -88, neck: -88, near: { ankleAt: [124, ANK], ft: 0, ...rack }, eq: [bar(P => P.near.grip, 13, { top: true })] },
      stand({ near: { ua: -88, fa: -88, hand: -90 }, eq: [bar(P => P.near.grip, 13, { top: true })] })], [t("fiches.push-press.legende1"), t("fiches.push-press.legende2"), t("fiches.push-press.legende3")], [0, 1, 2, 1])],
    cue: t("fiches.push-press.consigne"),
    tips: [t("fiches.push-press.conseil1"), t("fiches.push-press.conseil2"), t("fiches.push-press.conseil3")] };
