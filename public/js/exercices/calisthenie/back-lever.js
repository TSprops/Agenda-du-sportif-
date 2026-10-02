// Fiche « Comment faire » : Back lever.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { BY } from "./_communs.js";
import { pullbar } from "../../silhouette/index.js";

export default { views: [side([{ hip: [96, 80], torso: 0, neck: 2, near: { wristAt: [120, BY + 4], hand: -140, th: 180, sh: 180, ft: 180 }, eq: [pullbar(120, BY)] }], [t("fiches.back-lever.legende1")])],
    cue: t("fiches.back-lever.consigne"), tips: [t("fiches.back-lever.conseil1"), t("fiches.back-lever.conseil2"), t("fiches.back-lever.conseil3")] };
