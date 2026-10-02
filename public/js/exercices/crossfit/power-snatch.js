// Fiche « Comment faire » : Power snatch.
import { t } from "../../commun/i18n.js";
import { ANK, HIPY, side, stand } from "../_communs.js";
import { liftBar, pullExt, pullFloor, pullKnee, snatchStart } from "./_communs.js";
import { bar } from "../../silhouette/index.js";

// Réception en quart de squat, bras verrouillés au-dessus de la tête (barre au-dessus de la nuque).
const catchQ = o => liftBar({ hip: [114, 128], torso: -86, neck: -90, near: { ankleAt: [124, ANK], ft: 0, kneeBend: 1, wristAt: [113, 9.5 + 128 - HIPY], hand: -92, ls: { ua: 0.9, fa: 0.9 }, ...o } });
export default { views: [side([snatchStart, { ...catchQ(), eq: [bar(P => P.near.grip, 13, { top: true })] }], [t("fiches.power-snatch.legende1"), t("fiches.power-snatch.legende2")])],
    animViews: [side([pullFloor(128), pullKnee(), pullExt(),
      liftBar(stand({ hip: [120, HIPY - 6], shrug: 4, neck: -92, near: { ft: 20, wristAt: [140, 50], hand: -60, elbowBend: 1, track: 1 } })),
      catchQ({ track: 1 }),
      liftBar(stand({ neck: -92, near: { wristAt: [115, 9.5], hand: -92, ls: { ua: 0.9, fa: 0.9 }, track: 1 } }))],
      [t("fiches.power-snatch.legende1"), t("fiches.power-snatch.legende3"), t("fiches.power-snatch.legende4"), t("fiches.power-snatch.legende5"), t("fiches.power-snatch.legende6"), t("fiches.power-snatch.legende7")], [0, 1, 2, 3, 4, 5, 4, 3, 2, 1])],
    cue: t("fiches.power-snatch.consigne"),
    tips: [t("fiches.power-snatch.conseil1"), t("fiches.power-snatch.conseil2"), t("fiches.power-snatch.conseil3")] };
