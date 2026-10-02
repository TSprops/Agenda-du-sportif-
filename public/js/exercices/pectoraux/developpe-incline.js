// Fiche « Comment faire » : Développé incliné.
import { t } from "../../commun/i18n.js";
import { front, side } from "../_communs.js";
import { benchEq, benchLie, incF, inclineArms } from "./_communs.js";

export default { grip: "bench", views: [side([benchLie(35, inclineArms(1), benchEq(35)), benchLie(35, inclineArms(0), benchEq(35))], [t("fiches.developpe-incline.legende1"), t("fiches.developpe-incline.legende2")]),
      front([incF(1), incF(0)], [t("fiches.developpe-incline.legende3"), t("fiches.developpe-incline.legende2")])],
    cue: t("fiches.developpe-incline.consigne"),
    tips: [t("fiches.developpe-incline.conseil1"), t("fiches.developpe-incline.conseil2"), t("fiches.developpe-incline.conseil3")], anim: "De profil" };
