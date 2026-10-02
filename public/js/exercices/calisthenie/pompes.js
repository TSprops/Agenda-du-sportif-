// Fiche « Comment faire » : Pompes.
import { t } from "../../commun/i18n.js";
import { front, side } from "../_communs.js";
import { plank, pushF } from "./_communs.js";

export default { grip: "floor", views: [side([plank(122, 150, 126, { near: { ls: {} } }), plank(122, 188, 126)], [t("fiches.pompes.legende1"), t("fiches.pompes.legende2")]),
      front([pushF(142, 0), pushF(142, 1)], [t("fiches.pompes.legende1"), t("fiches.pompes.legende3")])],
    cue: t("fiches.pompes.consigne"),
    tips: [t("fiches.pompes.conseil1"), t("fiches.pompes.conseil2"), t("fiches.pompes.conseil3")], anim: "De profil" };
