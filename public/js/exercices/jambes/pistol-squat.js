// Fiche « Comment faire » : Pistol squat.
import { t } from "../../commun/i18n.js";
import { ANK, side, stand } from "../_communs.js";

export default { views: [side([
      stand({ near: { ua: -2, fa: -2, hand: -2, h: "open" }, far: { th: 70, sh: 90, ft: 0 } }),
      { hip: [100, 170], torso: -52, neck: -70, near: { ankleAt: [120, ANK], ft: 0, ua: -4, fa: -4, hand: -4, h: "open" }, far: { th: -6, sh: -6, ft: -20 } }], [t("fiches.pistol-squat.legende1"), t("fiches.pistol-squat.legende2")])],
    cue: t("fiches.pistol-squat.consigne"),
    tips: [t("fiches.pistol-squat.conseil1"), t("fiches.pistol-squat.conseil2"), t("fiches.pistol-squat.conseil3")] };
