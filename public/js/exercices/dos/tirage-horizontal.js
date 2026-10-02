// Fiche « Comment faire » : Tirage horizontal.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { seatedRow } from "./_communs.js";

export default { views: [side([seatedRow(0), seatedRow(1)], [t("fiches.tirage-horizontal.legende1"), t("fiches.tirage-horizontal.legende2")])],
    cue: t("fiches.tirage-horizontal.consigne"),
    tips: [t("fiches.tirage-horizontal.conseil1"), t("fiches.tirage-horizontal.conseil2"), t("fiches.tirage-horizontal.conseil3")] };
