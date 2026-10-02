// Fiche « Comment faire » : Pec deck (butterfly).
import { t } from "../../commun/i18n.js";
import { front } from "../_communs.js";
import { pecDeckF } from "./_communs.js";

export default { views: [front([pecDeckF(0), pecDeckF(1)], [t("fiches.pec-deck-butterfly.legende1"), t("fiches.pec-deck-butterfly.legende2")])],
    cue: t("fiches.pec-deck-butterfly.consigne"),
    tips: [t("fiches.pec-deck-butterfly.conseil1"), t("fiches.pec-deck-butterfly.conseil2"), t("fiches.pec-deck-butterfly.conseil3")] };
