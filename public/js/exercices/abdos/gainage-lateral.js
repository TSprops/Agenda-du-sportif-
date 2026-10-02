// Fiche « Comment faire » : Gainage latéral.
import { t } from "../../commun/i18n.js";
import { front } from "../_communs.js";

export default { views: [front([{ view: "front", hip: [70, 170], torso: -12, neck: -12,
      R: { ua: 90, fa: 90, hand: 90, ls: { ua: 0.8, fa: 0.3 }, th: 168, sh: 168 }, L: { ua: 170, fa: 178, hand: 178, th: 168, sh: 168 } }], [t("fiches.gainage-lateral.legende1")])],
    cue: t("fiches.gainage-lateral.consigne"),
    tips: [t("fiches.gainage-lateral.conseil1"), t("fiches.gainage-lateral.conseil2"), t("fiches.gainage-lateral.conseil3")] };
