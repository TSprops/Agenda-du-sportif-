// Fiche « Comment faire » : Pompes diamant.
import { t } from "../../commun/i18n.js";
import { front, side } from "../_communs.js";
import { plank, pushF } from "./_communs.js";
import { GROUND } from "../../silhouette/index.js";

export default { grip: "diamond", views: [side([plank(122, 150, 124, { near: { ls: {} } }), plank(122, 190, 124)], [t("fiches.pompes-diamant.legende1"), t("fiches.pompes-diamant.legende2")]),
      front([pushF(124, 0), pushF(124, 1, { R: { wristAt: [126, GROUND - 4], hand: 90, h: "palm", ls: { ua: 0.2 } } })], [t("fiches.pompes-diamant.legende3"), t("fiches.pompes-diamant.legende4")])],
    cue: t("fiches.pompes-diamant.consigne"),
    tips: [t("fiches.pompes-diamant.conseil1"), t("fiches.pompes-diamant.conseil2"), t("fiches.pompes-diamant.conseil3")] };
