// Fiche « Comment faire » : Planche.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { plank } from "./_communs.js";

// Bras tendus dans le plan : mains à plat et pointes de pieds sur la même ligne de sol.
export default { views: [side([plank(140, 156, 120, { near: { ls: {} } })], [t("fiches.planche.legende1")])],
    cue: t("fiches.planche.consigne"),
    tips: [t("fiches.planche.conseil1"), t("fiches.planche.conseil2"), t("fiches.planche.conseil3")] };
