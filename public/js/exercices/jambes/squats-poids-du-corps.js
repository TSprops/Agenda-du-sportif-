// Fiche « Comment faire » : Squats (poids du corps).
import { t } from "../../commun/i18n.js";
import { ANK, front, side, stand } from "../_communs.js";
import { SQUAT_TIPS, squatF } from "./_communs.js";

export default { views: [
      side([stand({ near: { ua: -2, fa: -2, hand: -2, h: "open" } }), { hip: [104, 166], torso: -58, neck: -76, near: { ankleAt: [124, ANK], ft: 0, ua: -2, fa: -2, hand: -2, h: "open" } }], [t("fiches.squats-poids-du-corps.legende1"), t("fiches.squats-poids-du-corps.legende2")]),
      front([squatF(0, { R: { ua: 86, fa: 90 } }), squatF(1, { R: { ua: -80, fa: -80, ls: { ua: 0.25, fa: 0.25, th: 0.3 }, h: "open" } })], [t("fiches.squats-poids-du-corps.legende3"), t("fiches.squats-poids-du-corps.legende4")])],
    cue: t("fiches.squats-poids-du-corps.consigne"), tips: SQUAT_TIPS, anim: "De profil" };
