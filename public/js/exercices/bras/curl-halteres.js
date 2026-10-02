// Fiche « Comment faire » : Curl haltères.
import { t } from "../../commun/i18n.js";
import { front, side } from "../_communs.js";
import { curlF, curlS } from "./_communs.js";
import { db, fdb } from "../../silhouette/index.js";

export default { views: [side([curlS(0, [db(P => [P.near.grip, 90], "side", { mid: true })]), curlS(1, [db(P => [P.near.grip, 0], "end", { top: true })])], [t("fiches.curl-halteres.legende1"), t("fiches.curl-halteres.legende2")]),
      front([curlF(0, [fdb("end", { top: true })]), curlF(1, [fdb("across", { top: true })])], [t("fiches.curl-halteres.legende3"), t("fiches.curl-halteres.legende4")])],
    cue: t("fiches.curl-halteres.consigne"),
    tips: [t("fiches.curl-halteres.conseil1"), t("fiches.curl-halteres.conseil2"), t("fiches.curl-halteres.conseil3")], anim: "De profil" };
