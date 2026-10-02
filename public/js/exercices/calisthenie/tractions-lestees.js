// Fiche « Comment faire » : Tractions lestées.
import { t } from "../../commun/i18n.js";
import { PULL_TIPS, pullViews } from "./_communs.js";
import { beltFront, beltSide } from "../../silhouette/index.js";

export default { grip: "pro", views: pullViews(30, [beltSide()], [beltFront()]), cue: t("fiches.tractions-lestees.consigne"),
    tips: [t("fiches.tractions-lestees.conseil1"), ...PULL_TIPS.slice(1)], anim: "De profil" };
