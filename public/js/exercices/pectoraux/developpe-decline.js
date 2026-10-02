// Fiche « Comment faire » : Développé décliné.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { benchEq, benchLie, pressArms } from "./_communs.js";

export default { grip: "bench", views: [side([benchLie(-18, pressArms(1), benchEq(-18)), benchLie(-18, pressArms(0), benchEq(-18))], [t("fiches.developpe-decline.legende1"), t("fiches.developpe-decline.legende2")])],
    cue: t("fiches.developpe-decline.consigne"),
    tips: [t("fiches.developpe-decline.conseil1"), t("fiches.developpe-decline.conseil2"), t("fiches.developpe-decline.conseil3")] };
