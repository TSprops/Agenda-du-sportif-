// Fiche « Comment faire » : Rowing haltère.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { benchRow } from "./_communs.js";

export default { views: [side([benchRow(0), benchRow(1)], [t("fiches.rowing-haltere.legende1"), t("fiches.rowing-haltere.legende2")])],
    cue: t("fiches.rowing-haltere.consigne"),
    tips: [t("fiches.rowing-haltere.conseil1"), t("fiches.rowing-haltere.conseil2"), t("fiches.rowing-haltere.conseil3")] };
