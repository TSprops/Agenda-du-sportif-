// Fiche « Comment faire » : Curl barre.
import { t } from "../../commun/i18n.js";
import { front, side } from "../_communs.js";
import { curlF, curlS } from "./_communs.js";
import { bar, fbar } from "../../silhouette/index.js";

export default { views: [side([curlS(0, [bar(P => P.near.grip, 11, { top: true })]), curlS(1, [bar(P => P.near.grip, 11, { top: true })])], [t("fiches.curl-barre.legende1"), t("fiches.curl-barre.legende2")]),
      front([curlF(0, [fbar(P => P.R.grip[1], { top: true, ez: 1 })]), curlF(1, [fbar(P => P.R.grip[1], { top: true, ez: 1 })])], [t("fiches.curl-barre.legende3"), t("fiches.curl-barre.legende4")])],
    cue: t("fiches.curl-barre.consigne"),
    tips: [t("fiches.curl-barre.conseil1"), t("fiches.curl-barre.conseil2"), t("fiches.curl-barre.conseil3")], anim: "De profil" };
