// Fiche « Comment faire » : Curl à la poulie.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { curlS } from "./_communs.js";
import { GROUND, cable } from "../../silhouette/index.js";

export default { views: [side([curlS(0, [cable(186, GROUND - 8, "bar")], { near: { ua: 92, fa: 76, hand: 76 } }), curlS(1, [cable(186, GROUND - 8, "bar")])], [t("fiches.curl-a-la-poulie.legende1"), t("fiches.curl-a-la-poulie.legende2")])],
    cue: t("fiches.curl-a-la-poulie.consigne"),
    tips: [t("fiches.curl-a-la-poulie.conseil1"), t("fiches.curl-a-la-poulie.conseil2"), t("fiches.curl-a-la-poulie.conseil3")] };
