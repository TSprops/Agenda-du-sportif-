// Fiche « Comment faire » : Roue abdominale.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { wheel } from "../../silhouette/index.js";

export default { views: [side([
      { hip: [78, 158], torso: -30, neck: -20, near: { th: 102, sh: 180, ft: 180, wristAt: [126, 190], hand: 90 }, eq: [wheel()] },
      { hip: [94.4, 165.3], torso: -5, neck: 0, near: { th: 125, sh: 180, ft: 180, wristAt: [196, 192], hand: 90 }, eq: [wheel()] }],
      [t("fiches.roue-abdominale.legende1"), t("fiches.roue-abdominale.legende2")])],
    cue: t("fiches.roue-abdominale.consigne"),
    tips: [t("fiches.roue-abdominale.conseil1"), t("fiches.roue-abdominale.conseil2"), t("fiches.roue-abdominale.conseil3")] };
