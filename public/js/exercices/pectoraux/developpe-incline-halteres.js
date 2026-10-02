// Fiche « Comment faire » : Développé incliné haltères.
import { t } from "../../commun/i18n.js";
import { front, side } from "../_communs.js";
import { benchEq, benchLie, incF, inclineArms } from "./_communs.js";

export default { views: [side([benchLie(35, inclineArms(1), benchEq(35, "db")), benchLie(35, inclineArms(0), benchEq(35, "db"))], [t("fiches.developpe-incline-halteres.legende1"), t("fiches.developpe-incline-halteres.legende2")]),
      front([incF(1, "db"), incF(0, "db")], [t("fiches.developpe-incline-halteres.legende3"), t("fiches.developpe-incline-halteres.legende2")])],
    cue: t("fiches.developpe-incline-halteres.consigne"),
    tips: [t("fiches.developpe-incline-halteres.conseil1"), t("fiches.developpe-incline-halteres.conseil2"), t("fiches.developpe-incline-halteres.conseil3")], anim: "De profil" };
