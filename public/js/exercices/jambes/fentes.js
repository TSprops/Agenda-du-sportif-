// Fiche « Comment faire » : Fentes.
import { t } from "../../commun/i18n.js";
import { side, stand } from "../_communs.js";
import { lunge } from "./_communs.js";
import { db } from "../../silhouette/index.js";

export default { views: [side([stand({ eq: [db(P => [P.near.grip, 90], "side", { mid: true })] }), lunge("near"), lunge("far")], [t("fiches.fentes.legende1"), t("fiches.fentes.legende2"), t("fiches.fentes.legende3")], [0, 1, 0, 2])],
    cue: t("fiches.fentes.consigne"),
    tips: [t("fiches.fentes.conseil1"), t("fiches.fentes.conseil2"), t("fiches.fentes.conseil3")] };
