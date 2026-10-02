// Fiche « Comment faire » : Abducteurs machine.
import { t } from "../../commun/i18n.js";
import { front } from "../_communs.js";
import { add, fbench, roller } from "../../silhouette/index.js";

export default { views: [front([
      { view: "front", hip: [120, 142], torso: -90, neck: -90, R: { th: 90, sh: 90, ls: { th: 0.3 }, ua: 80, fa: 90, hand: 90 }, eq: [fbench(150), roller(P => add(P.R.knee, [9, 0]), 6, { top: true }), roller(P => add(P.L.knee, [-9, 0]), 6, { top: true })] },
      { view: "front", hip: [120, 142], torso: -90, neck: -90, R: { th: 40, sh: 84, ls: { th: 0.45 }, ua: 80, fa: 90, hand: 90 }, eq: [fbench(150), roller(P => add(P.R.knee, [9, 0]), 6, { top: true }), roller(P => add(P.L.knee, [-9, 0]), 6, { top: true })] }], [t("fiches.abducteurs-machine.legende1"), t("fiches.abducteurs-machine.legende2")])],
    cue: t("fiches.abducteurs-machine.consigne"),
    tips: [t("fiches.abducteurs-machine.conseil1"), t("fiches.abducteurs-machine.conseil2")] };
