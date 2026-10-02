// Fiche « Comment faire » : Front squat.
import { t } from "../../commun/i18n.js";
import { ANK, HIPY, front, side } from "../_communs.js";
import { frontRack, squatF } from "./_communs.js";
import { fbar } from "../../silhouette/index.js";

export default { views: [
      side([frontRack([120, HIPY], -90, [124, ANK]), frontRack([106, 166], -72, [124, ANK])], [t("fiches.front-squat.legende1"), t("fiches.front-squat.legende2")]),
      front([squatF(0, { R: { ua: 60, fa: -100, hand: -90, ls: { ua: 0.45, fa: 0.3 } }, eq: [fbar(P => P.R.shoulder[1] + 2, { top: true })] }), squatF(1, { R: { ua: 60, fa: -100, hand: -90, ls: { ua: 0.45, fa: 0.3, th: 0.3 } }, eq: [fbar(P => P.R.shoulder[1] + 2, { top: true })] })], [t("fiches.front-squat.legende3"), t("fiches.front-squat.legende4")])],
    cue: t("fiches.front-squat.consigne"),
    tips: [t("fiches.front-squat.conseil1"), t("fiches.front-squat.conseil2"), t("fiches.front-squat.conseil3")] };
