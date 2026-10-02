// Fiche « Comment faire » : Développé couché prise serrée.
import { t } from "../../commun/i18n.js";
import { front, side } from "../_communs.js";
import { benchEq, benchF, benchLie, closeArms } from "./_communs.js";

export default { grip: "close", views: [side([benchLie(0, closeArms(1), benchEq(0)), benchLie(0, closeArms(0), benchEq(0))], [t("fiches.developpe-couche-prise-serree.legende1"), t("fiches.developpe-couche-prise-serree.legende2")]),
      front([benchF(1, 138, "bar", { R: { wristAt: [138, 122], hand: -90, elbowBend: -1, ls: { ua: 0.5 } } }), benchF(0, 146)], [t("fiches.developpe-couche-prise-serree.legende3"), t("fiches.developpe-couche-prise-serree.legende2")])],
    cue: t("fiches.developpe-couche-prise-serree.consigne"),
    tips: [t("fiches.developpe-couche-prise-serree.conseil1"), t("fiches.developpe-couche-prise-serree.conseil2"), t("fiches.developpe-couche-prise-serree.conseil3")], anim: "De profil" };
