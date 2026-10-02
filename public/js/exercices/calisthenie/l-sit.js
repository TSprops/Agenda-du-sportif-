// Fiche « Comment faire » : L-sit.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { dipbars } from "../../silhouette/index.js";

export default { views: [side([{ hip: [120, 118], torso: -90, neck: -90, near: { wristAt: [121, 122], hand: 0, th: 0, sh: 0, ft: 0 }, eq: [dipbars(96, 150, 127.5)] }], [t("fiches.l-sit.legende1")])],
    cue: t("fiches.l-sit.consigne"), tips: [t("fiches.l-sit.conseil1"), t("fiches.l-sit.conseil2"), t("fiches.l-sit.conseil3")] };
