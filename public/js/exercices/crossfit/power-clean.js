// Fiche « Comment faire » : Power clean.
import { t } from "../../commun/i18n.js";
import { ANK, side, stand } from "../_communs.js";
import { liftBar, pullExt, pullFloor, pullKnee, snatchStart } from "./_communs.js";
import { GROUND } from "../../silhouette/index.js";

// Réception en quart de squat (hanches au-dessus des genoux), coudes devant sous la barre.
const catchQ = o => liftBar({ hip: [114, 128], torso: -84, neck: -88, near: { ankleAt: [124, ANK], ft: 0, kneeBend: 1, wristAt: [130.4, 75.3], elbowBend: -1, hand: -30, ...o } });
export default { views: [side([{ ...snatchStart, near: { ...snatchStart.near, wristAt: [130, GROUND - 18.5] } }, catchQ()], [t("fiches.power-clean.legende1"), t("fiches.power-clean.legende2")])],
    animViews: [side([pullFloor(130), pullKnee(), pullExt(), catchQ({ track: 1 }),
      liftBar(stand({ near: { wristAt: [131, 60], elbowBend: -1, hand: -30, track: 1 } }))],
      [t("fiches.power-clean.legende1"), t("fiches.power-clean.legende3"), t("fiches.power-clean.legende4"), t("fiches.power-clean.legende5"), t("fiches.power-clean.legende6")], [0, 1, 2, 3, 4, 3, 2, 1])],
    cue: t("fiches.power-clean.consigne"),
    tips: [t("fiches.power-clean.conseil1"), t("fiches.power-clean.conseil2"), t("fiches.power-clean.conseil3")] };
