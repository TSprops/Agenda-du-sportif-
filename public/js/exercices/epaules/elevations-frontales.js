// Fiche « Comment faire » : Élévations frontales.
import { t } from "../../commun/i18n.js";
import { front, side, stand, standF } from "../_communs.js";
import { db, fdb } from "../../silhouette/index.js";

export default { views: [side([stand({ near: { ua: 92, fa: 88, hand: 88 }, eq: [db(P => [P.near.grip, 0], "end", { top: true })] }), stand({ near: { ua: -4, fa: -4, hand: -4 }, eq: [db(P => [P.near.grip, 0], "end", { top: true })] })], [t("fiches.elevations-frontales.legende1"), t("fiches.elevations-frontales.legende2")]),
      front([standF({ R: { wristAt: [134, 128], hand: 90 }, eq: [fdb("across", { top: true })] }), standF({ R: { ua: -80, fa: -80, hand: -80, ls: { ua: 0.25, fa: 0.25 } }, eq: [fdb("across", { top: true })] })], [t("fiches.elevations-frontales.legende3"), t("fiches.elevations-frontales.legende4")])],
    cue: t("fiches.elevations-frontales.consigne"),
    tips: [t("fiches.elevations-frontales.conseil1"), t("fiches.elevations-frontales.conseil2"), t("fiches.elevations-frontales.conseil3")], anim: "De profil" };
