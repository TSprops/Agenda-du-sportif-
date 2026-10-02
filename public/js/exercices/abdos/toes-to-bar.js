// Fiche « Comment faire » : Toes to bar.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { hangLeg } from "./_communs.js";
import { BY, onBar } from "../calisthenie/_communs.js";
import { pullbar } from "../../silhouette/index.js";

// Les jambes montent par l'avant (étape « à l'horizontale ») jusqu'à toucher la barre, pointes de pieds vers la barre.
export default { views: [side([hangLeg({ eq: [pullbar(120, BY)] }), hangLeg({ near: { th: -2, sh: -2, ft: -20 }, eq: [pullbar(120, BY)] }),
      { hip: [148, BY + 93], torso: -140, neck: -140, near: { wristAt: onBar, hand: -90, ankleAt: [140, BY + 12], ft: -150 }, eq: [pullbar(120, BY)] }], [t("fiches.toes-to-bar.legende1"), t("fiches.toes-to-bar.legende2"), t("fiches.toes-to-bar.legende3")], [0, 1, 2, 1])],
    cue: t("fiches.toes-to-bar.consigne"),
    tips: [t("fiches.toes-to-bar.conseil1"), t("fiches.toes-to-bar.conseil2"), t("fiches.toes-to-bar.conseil3")] };
