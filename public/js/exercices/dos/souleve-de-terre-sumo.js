// Fiche « Comment faire » : Soulevé de terre sumo.
import { t } from "../../commun/i18n.js";
import { front, side } from "../_communs.js";
import { dlKnee, dlStart, dlTop } from "./_communs.js";
import { fbar } from "../../silhouette/index.js";

export default { animViews: [side([dlStart(126, { hip: [102, 180], torso: -62, near: { ls: { th: 0.8 } } }), dlKnee(), dlTop()], [t("fiches.souleve-de-terre-sumo.legende1"), t("fiches.souleve-de-terre-sumo.legende2"), t("fiches.souleve-de-terre-sumo.legende3")], [0, 1, 2, 1]), "De face"], views: [
      side([dlStart(126, { hip: [102, 180], torso: -62, near: { ls: { th: 0.8 } } }), dlTop()], [t("fiches.souleve-de-terre-sumo.legende1"), t("fiches.souleve-de-terre-sumo.legende3")]),
      front([{ view: "front", torso: -90, neck: -90, tls: 0.35, hip: [120, 150], R: { th: 40, sh: 95, ls: { th: 0.8, sh: 0.65 }, wristAt: [132, 190.5], hand: 90 }, eq: [fbar(P => P.R.grip[1], { top: true })] },
        { view: "front", torso: -90, neck: -90, hip: [120, 116], R: { th: 70, sh: 95, wristAt: [133, 120], hand: 90 }, eq: [fbar(P => P.R.grip[1], { top: true })] }], [t("fiches.souleve-de-terre-sumo.legende4"), t("fiches.souleve-de-terre-sumo.legende3")])],
    cue: t("fiches.souleve-de-terre-sumo.consigne"),
    tips: [t("fiches.souleve-de-terre-sumo.conseil1"), t("fiches.souleve-de-terre-sumo.conseil2"), t("fiches.souleve-de-terre-sumo.conseil3")] };
