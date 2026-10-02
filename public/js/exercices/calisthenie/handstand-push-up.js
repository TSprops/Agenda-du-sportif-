// Fiche « Comment faire » : Handstand push-up.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { GROUND, wall } from "../../silhouette/index.js";

export default { views: [side([
      { hip: [118, 99], torso: 91, neck: 90, near: { wristAt: [110, GROUND - 3], h: "flat", hand: 180, th: -90, sh: -90, ft: -90 }, eq: [wall(132)] },
      { hip: [118, 126], torso: 93, neck: 92, near: { wristAt: [110, GROUND - 3], h: "flat", hand: 180, th: -90, sh: -90, ft: -90 }, eq: [wall(132)] }], [t("fiches.handstand-push-up.legende1"), t("fiches.handstand-push-up.legende2")])],
    cue: t("fiches.handstand-push-up.consigne"), tips: [t("fiches.handstand-push-up.conseil1"), t("fiches.handstand-push-up.conseil2"), t("fiches.handstand-push-up.conseil3")] };
