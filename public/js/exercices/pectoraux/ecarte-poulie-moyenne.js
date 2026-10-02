// Fiche « Comment faire » : Écarté poulie moyenne.
import { t } from "../../commun/i18n.js";
import { front, side } from "../_communs.js";
import { SH_Y } from "../epaules/_communs.js";
import { cableFly, cableFlySide } from "./_communs.js";

export default { views: [front(cableFly(SH_Y + 16, "moyenne"), [t("fiches.ecarte-poulie-moyenne.legende1"), t("fiches.ecarte-poulie-moyenne.legende2")]), side(cableFlySide("moyenne"), [t("fiches.ecarte-poulie-moyenne.legende3"), t("fiches.ecarte-poulie-moyenne.legende4")])],
    cue: t("fiches.ecarte-poulie-moyenne.consigne"),
    tips: [t("fiches.ecarte-poulie-moyenne.conseil1"), t("fiches.ecarte-poulie-moyenne.conseil2"), t("fiches.ecarte-poulie-moyenne.conseil3")] };
