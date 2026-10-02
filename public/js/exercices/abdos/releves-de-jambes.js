// Fiche « Comment faire » : Relevés de jambes.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { hangLeg } from "./_communs.js";
import { BY } from "../calisthenie/_communs.js";
import { pullbar } from "../../silhouette/index.js";

export default { views: [side([hangLeg({ eq: [pullbar(120, BY)] }), hangLeg({ near: { th: -2, sh: -2, ft: -20 }, eq: [pullbar(120, BY)] })], [t("fiches.releves-de-jambes.legende1"), t("fiches.releves-de-jambes.legende2")])],
    cue: t("fiches.releves-de-jambes.consigne"),
    tips: [t("fiches.releves-de-jambes.conseil1"), t("fiches.releves-de-jambes.conseil2"), t("fiches.releves-de-jambes.conseil3")] };
