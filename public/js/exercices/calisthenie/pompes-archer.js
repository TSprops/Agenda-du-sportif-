// Fiche « Comment faire » : Pompes archer.
import { t } from "../../commun/i18n.js";
import { front } from "../_communs.js";
import { pushF } from "./_communs.js";
import { GROUND } from "../../silhouette/index.js";

export default { grip: "wide", views: [front([
      pushF(164, 0),
      // Descente d'un côté : ce bras plie (coude près du corps, avant-bras vertical), l'autre reste tendu sur le côté.
      pushF(164, 1, { hip: [146, 190], R: { wristAt: [164, GROUND - 4], hand: 90, h: "palm", ls: { ua: 0.2 } }, L: { wristAt: [76, GROUND - 4], hand: 90, h: "palm", ls: {} } }),
      pushF(164, 1, { hip: [94, 190], R: { wristAt: [164, GROUND - 4], hand: 90, h: "palm" }, L: { wristAt: [76, GROUND - 4], hand: 90, h: "palm", ls: { ua: 0.2 } } })],
      [t("fiches.pompes-archer.legende1"), t("fiches.pompes-archer.legende2"), t("fiches.pompes-archer.legende3")], [0, 1, 0, 2])],
    cue: t("fiches.pompes-archer.consigne"),
    tips: [t("fiches.pompes-archer.conseil1"), t("fiches.pompes-archer.conseil2"), t("fiches.pompes-archer.conseil3")] };
