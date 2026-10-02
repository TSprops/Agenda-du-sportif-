// Fiche « Comment faire » : Rowing machine.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { machineRow } from "./_communs.js";

export default { views: [side([machineRow(0), machineRow(1)], [t("fiches.rowing-machine.legende1"), t("fiches.rowing-machine.legende2")])],
    cue: t("fiches.rowing-machine.consigne"),
    tips: [t("fiches.rowing-machine.conseil1"), t("fiches.rowing-machine.conseil2"), t("fiches.rowing-machine.conseil3")] };
