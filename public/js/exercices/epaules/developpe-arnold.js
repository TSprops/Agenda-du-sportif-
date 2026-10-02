// Fiche « Comment faire » : Développé Arnold.
import { t } from "../../commun/i18n.js";
import { front, side } from "../_communs.js";
import { arnoldF, arnoldS, fixLegsSeated } from "./_communs.js";

export default { views: [side([0, 1, 2].map(k => fixLegsSeated(arnoldS(k))), [t("fiches.developpe-arnold.legende1"), t("fiches.developpe-arnold.legende2"), t("fiches.developpe-arnold.legende3")], [0, 1, 2, 1]),
      front([0, 1, 2].map(arnoldF), [t("fiches.developpe-arnold.legende1"), t("fiches.developpe-arnold.legende4"), t("fiches.developpe-arnold.legende5")], [0, 1, 2, 1])],
    cue: t("fiches.developpe-arnold.consigne"),
    tips: [t("fiches.developpe-arnold.conseil1"), t("fiches.developpe-arnold.conseil2"), t("fiches.developpe-arnold.conseil3")] };
