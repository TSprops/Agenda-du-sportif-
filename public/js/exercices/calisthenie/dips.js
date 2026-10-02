// Fiche « Comment faire » : Dips.
import { t } from "../../commun/i18n.js";
import { front, side } from "../_communs.js";
import { dipF, dipLow, dipTop } from "./_communs.js";
import { dipbars, fdips } from "../../silhouette/index.js";

export default { grip: "dips", views: [side([dipTop({ eq: [dipbars(96, 176, 110)] }), dipLow({ eq: [dipbars(96, 176, 110)] })], [t("fiches.dips.legende1"), t("fiches.dips.legende2")]),
      front([dipF(0, { eq: [fdips(110)] }), dipF(1, { eq: [fdips(110)] })], [t("fiches.dips.legende1"), t("fiches.dips.legende2")])],
    cue: t("fiches.dips.consigne"), tips: [t("fiches.dips.conseil1"), t("fiches.dips.conseil2"), t("fiches.dips.conseil3")] };
