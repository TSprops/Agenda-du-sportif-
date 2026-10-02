// Fiche « Comment faire » : Développé couché haltères.
import { t } from "../../commun/i18n.js";
import { front, side } from "../_communs.js";
import { benchEq, benchF, benchLie, pressArms } from "./_communs.js";

export default { views: [side([benchLie(0, pressArms(1), benchEq(0, "db")), benchLie(0, pressArms(0), benchEq(0, "db"))], [t("fiches.developpe-couche-halteres.legende1"), t("fiches.developpe-couche-halteres.legende2")]),
      front([benchF(1, 150, "db"), benchF(0, 142, "db")], [t("fiches.developpe-couche-halteres.legende3"), t("fiches.developpe-couche-halteres.legende4")])],
    cue: t("fiches.developpe-couche-halteres.consigne"),
    tips: [t("fiches.developpe-couche-halteres.conseil1"), t("fiches.developpe-couche-halteres.conseil2"), t("fiches.developpe-couche-halteres.conseil3"), t("fiches.developpe-couche-halteres.conseil4")] };
