// Fiche « Comment faire » : Face pull.
import { t } from "../../commun/i18n.js";
import { front, side, standF } from "../_communs.js";
import { facepullS } from "./_communs.js";

export default { views: [side([facepullS(0), facepullS(1)], [t("fiches.face-pull.legende1"), t("fiches.face-pull.legende2")]),
      front([standF({ R: { ua: -20, fa: -60, hand: -60, ls: { ua: 0.12, fa: 0.2 } } }), standF({ R: { ua: 0, fa: -135, hand: -120 } })], [t("fiches.face-pull.legende1"), t("fiches.face-pull.legende3")])],
    cue: t("fiches.face-pull.consigne"),
    tips: [t("fiches.face-pull.conseil1"), t("fiches.face-pull.conseil2"), t("fiches.face-pull.conseil3")], anim: "De profil" };
