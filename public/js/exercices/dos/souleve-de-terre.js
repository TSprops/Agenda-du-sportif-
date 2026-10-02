// Fiche « Comment faire » : Soulevé de terre.
import { t } from "../../commun/i18n.js";
import { front, side, standF } from "../_communs.js";
import { bentF, dlKnee, dlStart, dlTop } from "./_communs.js";
import { fbar } from "../../silhouette/index.js";

export default { animViews: [side([dlStart(), dlKnee(), dlTop()], [t("fiches.souleve-de-terre.legende1"), t("fiches.souleve-de-terre.legende2"), t("fiches.souleve-de-terre.legende3")], [0, 1, 2, 1]), "De face"], views: [
      side([dlStart(), dlTop()], [t("fiches.souleve-de-terre.legende1"), t("fiches.souleve-de-terre.legende3")]),
      front([bentF(0.3, { hip: [120, 150], R: { ls: { th: 0.2 }, wristAt: [141, 190.5], hand: 90 }, eq: [fbar(P => P.R.grip[1], { top: true })] }), standF({ R: { wristAt: [141, 124], hand: 90 }, eq: [fbar(P => P.R.grip[1], { top: true })] })], [t("fiches.souleve-de-terre.legende4"), t("fiches.souleve-de-terre.legende5")])],
    cue: t("fiches.souleve-de-terre.consigne"),
    tips: [t("fiches.souleve-de-terre.conseil1"), t("fiches.souleve-de-terre.conseil2"), t("fiches.souleve-de-terre.conseil3"), t("fiches.souleve-de-terre.conseil4")] };
