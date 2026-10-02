// Fiche « Comment faire » : Écarté poulie basse.
import { t } from "../../commun/i18n.js";
import { front, side } from "../_communs.js";
import { cableFly, cableFlySide } from "./_communs.js";
import { GROUND } from "../../silhouette/index.js";

export default { views: [front(cableFly(GROUND - 10, "basse"), [t("fiches.ecarte-poulie-basse.legende1"), t("fiches.ecarte-poulie-basse.legende2")]), side(cableFlySide("basse"), [t("fiches.ecarte-poulie-basse.legende3"), t("fiches.ecarte-poulie-basse.legende4")])],
    cue: t("fiches.ecarte-poulie-basse.consigne"),
    tips: [t("fiches.ecarte-poulie-basse.conseil1"), t("fiches.ecarte-poulie-basse.conseil2"), t("fiches.ecarte-poulie-basse.conseil3")] };
