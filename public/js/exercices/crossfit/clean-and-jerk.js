// Fiche « Comment faire » : Clean & jerk.
import { t } from "../../commun/i18n.js";
import { ANK, HIPY, onToes, side, stand } from "../_communs.js";
import { liftBar, pullExt, pullFloor, pullKnee } from "./_communs.js";

// Barre sur les épaules (fin du clean), petite flexion (dip), puis jerk en fente : pied avant à plat, pied arrière sur la pointe.
const rackStand = o => liftBar(stand({ near: { wristAt: [131, 60], elbowBend: -1, hand: -30, ...o } }));
const dip = o => liftBar({ hip: [117, 126], torso: -88, neck: -88, near: { ankleAt: [124, ANK], ft: 0, kneeBend: 1, wristAt: [130, 73], elbowBend: -1, hand: -30, ...o } });
const split = o => liftBar({ hip: [118, 128], torso: -90, neck: -90, near: { ankleAt: [148, ANK], ft: 0, wristAt: [117, 9.5 + 128 - HIPY], hand: -92, ls: { ua: 0.9, fa: 0.9 }, ...o }, far: { ankleAt: onToes(80, 50), ft: 50 } });
const overhead = o => liftBar(stand({ neck: -92, near: { wristAt: [115, 9.5], hand: -92, ls: { ua: 0.9, fa: 0.9 }, ...o } }));
export default { views: [side([rackStand(), split()], [t("fiches.clean-and-jerk.legende1"), t("fiches.clean-and-jerk.legende2")])],
    animViews: [side([pullFloor(130), pullKnee(), pullExt(),
      liftBar({ hip: [114, 128], torso: -84, neck: -88, near: { ankleAt: [124, ANK], ft: 0, kneeBend: 1, wristAt: [130.4, 75.3], elbowBend: -1, hand: -30, track: 1 } }),
      rackStand({ track: 1 }), dip({ track: 1 }), split({ track: 1 }), overhead({ track: 1 })],
      [t("fiches.clean-and-jerk.legende3"), t("fiches.clean-and-jerk.legende4"), t("fiches.clean-and-jerk.legende5"), t("fiches.clean-and-jerk.legende6"), t("fiches.clean-and-jerk.legende7"), t("fiches.clean-and-jerk.legende8"), t("fiches.clean-and-jerk.legende9"), t("fiches.clean-and-jerk.legende10")])],
    cue: t("fiches.clean-and-jerk.consigne"),
    tips: [t("fiches.clean-and-jerk.conseil1"), t("fiches.clean-and-jerk.conseil2"), t("fiches.clean-and-jerk.conseil3")] };
