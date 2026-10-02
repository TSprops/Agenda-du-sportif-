// Fiche « Comment faire » : Hack squat.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { hackEq } from "./_communs.js";

export default { views: [side([
      { hip: [118, 108], torso: -115, neck: -100, near: { ankleAt: [168, 184], ft: -45, wristAt: [104, 70], hand: -60 }, eq: hackEq },
      { hip: [137, 145], torso: -115, neck: -100, near: { ankleAt: [168, 184], ft: -45, wristAt: [123, 107], hand: -60 }, eq: hackEq }], [t("fiches.hack-squat.legende1"), t("fiches.hack-squat.legende2")])],
    cue: t("fiches.hack-squat.consigne"),
    tips: [t("fiches.hack-squat.conseil1"), t("fiches.hack-squat.conseil2"), t("fiches.hack-squat.conseil3")] };
