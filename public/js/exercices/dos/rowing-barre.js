// Fiche « Comment faire » : Rowing barre.
import { t } from "../../commun/i18n.js";
import { front, side } from "../_communs.js";
import { bentF, rowSide } from "./_communs.js";
import { bar, fbar } from "../../silhouette/index.js";

export default { grip: "row", views: [
      side([rowSide(0, { eq: [bar(P => P.near.grip, 13, { top: true })] }), rowSide(1, { eq: [bar(P => P.near.grip, 13, { top: true })] })], [t("fiches.rowing-barre.legende1"), t("fiches.rowing-barre.legende2")]),
      front([bentF(0.55, { R: { wristAt: [138, 151], hand: 90 }, eq: [fbar(P => P.R.grip[1], { top: true })] }), bentF(0.55, { R: { wristAt: [138, 118], hand: 90, ls: { ua: 0.28, th: 0.85 } }, eq: [fbar(P => P.R.grip[1], { top: true })] })], [t("fiches.rowing-barre.legende1"), t("fiches.rowing-barre.legende3")])],
    cue: t("fiches.rowing-barre.consigne"),
    tips: [t("fiches.rowing-barre.conseil1"), t("fiches.rowing-barre.conseil2"), t("fiches.rowing-barre.conseil3")], anim: "De profil" };
