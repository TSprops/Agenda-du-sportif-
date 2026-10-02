// Fiche « Comment faire » : Curl incliné.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { inclCurl } from "./_communs.js";

export default { views: [side([inclCurl(0), inclCurl(1)], [t("fiches.curl-incline.legende1"), t("fiches.curl-incline.legende2")])],
    cue: t("fiches.curl-incline.consigne"),
    tips: [t("fiches.curl-incline.conseil1"), t("fiches.curl-incline.conseil2"), t("fiches.curl-incline.conseil3")] };
