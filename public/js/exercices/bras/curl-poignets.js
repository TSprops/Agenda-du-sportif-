// Fiche « Comment faire » : Curl poignets.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { wristCurl } from "./_communs.js";

export default { views: [side([wristCurl(0), wristCurl(1)], [t("fiches.curl-poignets.legende1"), t("fiches.curl-poignets.legende2")])],
    cue: t("fiches.curl-poignets.consigne"),
    tips: [t("fiches.curl-poignets.conseil1"), t("fiches.curl-poignets.conseil2"), t("fiches.curl-poignets.conseil3")] };
