// Fiche « Comment faire » : Front lever.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { BY } from "./_communs.js";
import { pullbar } from "../../silhouette/index.js";

export default { views: [side([{ hip: [150, 82], torso: 180, neck: 172, near: { wristAt: [120, BY + 5.5], hand: -70, th: 0, sh: 0, ft: 0 }, eq: [pullbar(120, BY)] }], [t("fiches.front-lever.legende1")])],
    cue: t("fiches.front-lever.consigne"), tips: [t("fiches.front-lever.conseil1"), t("fiches.front-lever.conseil2"), t("fiches.front-lever.conseil3")] };
