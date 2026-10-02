// Fiche « Comment faire » : Clean.
import { t } from "../../commun/i18n.js";
import { ANK, side, stand } from "../_communs.js";
import { liftBar, pullExt, pullFloor, pullKnee, snatchStart } from "./_communs.js";
import { GROUND, bar } from "../../silhouette/index.js";

// Réception : les coudes passent vers l'avant, sous la barre (plus de rotation de l'avant-bras vers l'arrière).
export default { views: [side([{ ...snatchStart, near: { ...snatchStart.near, wristAt: [130, GROUND - 18.5] } },
      stand({ near: { wristAt: [131, 60], elbowBend: -1, hand: -30 }, eq: [bar(P => P.near.grip, 13, { top: true })] })], [t("fiches.clean.legende1"), t("fiches.clean.legende2")])],
    animViews: [side([pullFloor(130), pullKnee(), pullExt(),
      liftBar({ hip: [114, 128], torso: -84, neck: -88, near: { ankleAt: [124, ANK], ft: 0, kneeBend: 1, wristAt: [130.4, 75.3], elbowBend: -1, hand: -30, track: 1 } }),
      liftBar(stand({ near: { wristAt: [131, 60], elbowBend: -1, hand: -30, track: 1 } }))],
      [t("fiches.clean.legende1"), t("fiches.clean.legende3"), t("fiches.clean.legende4"), t("fiches.clean.legende5"), t("fiches.clean.legende6")], [0, 1, 2, 3, 4, 3, 2, 1])],
    cue: t("fiches.clean.consigne"),
    tips: [t("fiches.clean.conseil1"), t("fiches.clean.conseil2"), t("fiches.clean.conseil3")] };
