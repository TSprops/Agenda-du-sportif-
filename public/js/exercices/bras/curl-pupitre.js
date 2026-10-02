// Fiche « Comment faire » : Curl pupitre.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { preacher } from "./_communs.js";

export default { views: [side([preacher(0), preacher(1)], [t("fiches.curl-pupitre.legende1"), t("fiches.curl-pupitre.legende2")])],
    cue: t("fiches.curl-pupitre.consigne"),
    tips: [t("fiches.curl-pupitre.conseil1"), t("fiches.curl-pupitre.conseil2"), t("fiches.curl-pupitre.conseil3")] };
