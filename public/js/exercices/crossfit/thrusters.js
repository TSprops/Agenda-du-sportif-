// Fiche « Comment faire » : Thrusters.
import { t } from "../../commun/i18n.js";
import { ANK, HIPY, front, side, stand, standF } from "../_communs.js";
import { rack } from "./_communs.js";
import { bar, fbar } from "../../silhouette/index.js";

export default { views: [
      side([{ hip: [108, 165], torso: -70, neck: -84, near: { ankleAt: [124, ANK], ft: 0, ...rack }, eq: [bar(P => P.near.grip, 13, { top: true })] },
        stand({ near: { ua: -88, fa: -88, hand: -90 }, eq: [bar(P => P.near.grip, 13, { top: true })] })], [t("fiches.thrusters.legende1"), t("fiches.thrusters.legende2")]),
      front([standF({ hip: [120, HIPY + 40], R: { th: 84, sh: 92, ua: 60, fa: -100, hand: -90, ls: { ua: 0.45, th: 0.2, sh: 0.93 } }, eq: [fbar(P => P.R.grip[1], { top: true })] }),
        standF({ R: { ua: -70, fa: -84, hand: -90 }, eq: [fbar(P => P.R.grip[1], { top: true })] })], [t("fiches.thrusters.legende3"), t("fiches.thrusters.legende4")])],
    cue: t("fiches.thrusters.consigne"),
    tips: [t("fiches.thrusters.conseil1"), t("fiches.thrusters.conseil2"), t("fiches.thrusters.conseil3")], anim: "De profil" };
