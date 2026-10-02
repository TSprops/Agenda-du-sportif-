// Fiche « Comment faire » : Écarté poulie haute.
import { t } from "../../commun/i18n.js";
import { front, side } from "../_communs.js";
import { cableFly, cableFlySide } from "./_communs.js";

export default { views: [front(cableFly(8, "haute"), [t("fiches.ecarte-poulie-haute.legende1"), t("fiches.ecarte-poulie-haute.legende2")]), side(cableFlySide("haute"), [t("fiches.ecarte-poulie-haute.legende3"), t("fiches.ecarte-poulie-haute.legende4")])],
    cue: t("fiches.ecarte-poulie-haute.consigne"),
    tips: [t("fiches.ecarte-poulie-haute.conseil1"), t("fiches.ecarte-poulie-haute.conseil2"), t("fiches.ecarte-poulie-haute.conseil3")], anim: "De face" };
