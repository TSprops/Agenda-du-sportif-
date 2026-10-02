// Fiche « Comment faire » : Kickback triceps.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { kickback } from "./_communs.js";

export default { views: [side([kickback(0), kickback(1)], [t("fiches.kickback-triceps.legende1"), t("fiches.kickback-triceps.legende2")])],
    cue: t("fiches.kickback-triceps.consigne"),
    tips: [t("fiches.kickback-triceps.conseil1"), t("fiches.kickback-triceps.conseil2"), t("fiches.kickback-triceps.conseil3")] };
