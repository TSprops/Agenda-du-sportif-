// Fiche « Comment faire » : Barre au front.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { skull } from "./_communs.js";

export default { views: [side([skull(0), skull(1)], [t("fiches.barre-au-front.legende1"), t("fiches.barre-au-front.legende2")])],
    cue: t("fiches.barre-au-front.consigne"),
    tips: [t("fiches.barre-au-front.conseil1"), t("fiches.barre-au-front.conseil2"), t("fiches.barre-au-front.conseil3")] };
