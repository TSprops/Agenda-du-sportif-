// Fiche « Comment faire » : Leg curl.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { legCurl } from "./_communs.js";

export default { views: [side([legCurl(0), legCurl(1)], [t("fiches.leg-curl.legende1"), t("fiches.leg-curl.legende2")])],
    cue: t("fiches.leg-curl.consigne"),
    tips: [t("fiches.leg-curl.conseil1"), t("fiches.leg-curl.conseil2"), t("fiches.leg-curl.conseil3")] };
