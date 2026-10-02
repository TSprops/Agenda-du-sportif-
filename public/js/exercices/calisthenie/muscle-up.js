// Fiche « Comment faire » : Muscle-up.
import { t } from "../../commun/i18n.js";
import { side, stand } from "../_communs.js";
import { BY, hang, pullTop } from "./_communs.js";
import { pullbar } from "../../silhouette/index.js";

export default { grip: "pro", views: [side([
      hang({ hip: [118, BY + 112], eq: [pullbar(120, BY)] }),
      pullTop({ hip: [114, BY + 52], torso: -104, eq: [pullbar(120, BY)] }),
      stand({ hip: [121, BY - 3], torso: -96, neck: -92, near: { wristAt: [120, BY - 5.5], hand: 90, th: 96, sh: 98, ft: 40 }, eq: [pullbar(120, BY)] })],
      [t("fiches.muscle-up.legende1"), t("fiches.muscle-up.legende2"), t("fiches.muscle-up.legende3")], [0, 1, 2, 1])],
    cue: t("fiches.muscle-up.consigne"),
    tips: [t("fiches.muscle-up.conseil1"), t("fiches.muscle-up.conseil2"), t("fiches.muscle-up.conseil3")] };
