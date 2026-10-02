// Fiche « Comment faire » : Presse à cuisses.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { pressEq } from "./_communs.js";

export default { views: [side([
      { hip: [92, 150], torso: -148, neck: -148, near: { ankleAt: [134, 104], ft: -135, kneeBend: 1, wristAt: [100, 158], hand: 0 }, eq: pressEq() },
      { hip: [92, 150], torso: -148, neck: -148, near: { ankleAt: [158, 80], ft: -135, kneeBend: 1, wristAt: [100, 158], hand: 0 }, eq: pressEq() }], [t("fiches.presse-a-cuisses.legende1"), t("fiches.presse-a-cuisses.legende2")])],
    cue: t("fiches.presse-a-cuisses.consigne"),
    tips: [t("fiches.presse-a-cuisses.conseil1"), t("fiches.presse-a-cuisses.conseil2"), t("fiches.presse-a-cuisses.conseil3")] };
