// Fiche « Comment faire » : Soulevé de terre roumain.
import { t } from "../../commun/i18n.js";
import { ANK, HIPY, side } from "../_communs.js";
import { bar } from "../../silhouette/index.js";

export default { views: [side([
      // En haut, jambes tendues ; les genoux se fléchissent un peu pendant la descente (hanche à 87 de la cheville en bas).
      // La barre descend en ligne droite le long des cuisses puis des tibias (track).
      { hip: [121, HIPY], torso: -90, neck: -90, near: { ankleAt: [122, ANK], ft: 0, wristAt: [128.5, 118], hand: 90, track: 1 }, eq: [bar(P => P.near.grip, 13, { top: true })] },
      { hip: [84, 124.5], torso: -20, neck: -20, near: { ankleAt: [122, ANK], ft: 0, wristAt: [132, 164.7], hand: 90, track: 1 }, eq: [bar(P => P.near.grip, 13, { top: true })] }], [t("fiches.souleve-de-terre-roumain.legende1"), t("fiches.souleve-de-terre-roumain.legende2")])],
    cue: t("fiches.souleve-de-terre-roumain.consigne"),
    tips: [t("fiches.souleve-de-terre-roumain.conseil1"), t("fiches.souleve-de-terre-roumain.conseil2"), t("fiches.souleve-de-terre-roumain.conseil3")] };
