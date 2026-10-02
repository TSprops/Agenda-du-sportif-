// Fiche « Comment faire » : Élévations latérales à la poulie.
import { t } from "../../commun/i18n.js";
import { front } from "../_communs.js";
import { cableLat } from "./_communs.js";

export default { views: [front([cableLat(0), cableLat(1)], [t("fiches.elevations-laterales-a-la-poulie.legende1"), t("fiches.elevations-laterales-a-la-poulie.legende2")])],
    cue: t("fiches.elevations-laterales-a-la-poulie.consigne"),
    tips: [t("fiches.elevations-laterales-a-la-poulie.conseil1"), t("fiches.elevations-laterales-a-la-poulie.conseil2"), t("fiches.elevations-laterales-a-la-poulie.conseil3")] };
