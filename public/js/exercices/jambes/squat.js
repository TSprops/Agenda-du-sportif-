// Fiche « Comment faire » : Squat.
import { t } from "../../commun/i18n.js";
import { ANK, HIPY, front, side } from "../_communs.js";
import { SQUAT_TIPS, backSquat, squatF } from "./_communs.js";
import { fbar } from "../../silhouette/index.js";

export default { views: [
      side([backSquat([120, HIPY], -90, [124, ANK]), backSquat([104, 166], -58, [124, ANK])], [t("fiches.squat.legende1"), t("fiches.squat.legende2")]),
      // Coudes vers le bas, sous la barre ; la barre repose sur le haut du dos (derrière la nuque).
      front([squatF(0, { R: { ua: 75, fa: -70, hand: -90, ls: { ua: 0.6 } }, eq: [fbar(P => P.R.grip[1])] }), squatF(1, { R: { ua: 75, fa: -70, hand: -90, ls: { ua: 0.6, th: 0.3 } }, eq: [fbar(P => P.R.grip[1])] })], [t("fiches.squat.legende3"), t("fiches.squat.legende4")])],
    cue: t("fiches.squat.consigne"), tips: SQUAT_TIPS };
