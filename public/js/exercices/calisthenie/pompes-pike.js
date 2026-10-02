// Fiche « Comment faire » : Pompes pike.
import { t } from "../../commun/i18n.js";
import { onToes, side } from "../_communs.js";
import { GROUND } from "../../silhouette/index.js";

export default { views: [side([
      { hip: [88, 126], torso: 33.7, neck: 50, near: { ankleAt: onToes(44, 70), ft: 70, wristAt: [134, GROUND - 3], h: "flat", hand: 0 } },
      { hip: [96, 130], torso: 58, neck: 70, near: { ankleAt: onToes(44, 70), ft: 70, wristAt: [134, GROUND - 3], h: "flat", hand: 0 } }], [t("fiches.pompes-pike.legende1"), t("fiches.pompes-pike.legende2")])],
    cue: t("fiches.pompes-pike.consigne"),
    tips: [t("fiches.pompes-pike.conseil1"), t("fiches.pompes-pike.conseil2"), t("fiches.pompes-pike.conseil3")] };
