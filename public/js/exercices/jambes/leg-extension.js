// Fiche « Comment faire » : Leg extension.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { legExt } from "./_communs.js";

export default { views: [side([legExt(0), legExt(1)], [t("fiches.leg-extension.legende1"), t("fiches.leg-extension.legende2")])],
    cue: t("fiches.leg-extension.consigne"),
    tips: [t("fiches.leg-extension.conseil1"), t("fiches.leg-extension.conseil2"), t("fiches.leg-extension.conseil3")] };
