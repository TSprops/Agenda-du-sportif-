// Fiche « Comment faire » : Mollets debout.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { calfStand } from "./_communs.js";

export default { views: [side([calfStand(-22), calfStand(38)], [t("fiches.mollets-debout.legende1"), t("fiches.mollets-debout.legende2")])],
    cue: t("fiches.mollets-debout.consigne"),
    tips: [t("fiches.mollets-debout.conseil1"), t("fiches.mollets-debout.conseil2"), t("fiches.mollets-debout.conseil3")] };
