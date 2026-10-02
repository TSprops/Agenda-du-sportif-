// Fiche « Comment faire » : Extension lombaire.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { hyper } from "./_communs.js";

export default { views: [side([hyper(75), hyper(0)], [t("fiches.extension-lombaire.legende1"), t("fiches.extension-lombaire.legende2")])],
    cue: t("fiches.extension-lombaire.consigne"),
    tips: [t("fiches.extension-lombaire.conseil1"), t("fiches.extension-lombaire.conseil2"), t("fiches.extension-lombaire.conseil3")] };
