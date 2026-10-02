// Fiche « Comment faire » : Human flag.
import { t } from "../../commun/i18n.js";
import { front } from "../_communs.js";
import { pole } from "../../silhouette/index.js";

export default { views: [front([{ view: "front", torso: 0, neck: 0, hip: [52, 118],
      // Les deux coudes orientés de la même façon (miroir) : vers l'extérieur, jamais vers l'intérieur du corps.
      R: { wristAt: [144, 176], hand: 0, th: 180, sh: 180, elbowBend: -1 }, L: { wristAt: [144, 64], hand: 0, th: 180, sh: 180, elbowBend: 1 }, eq: [pole(152)] }], [t("fiches.human-flag.legende1")])],
    cue: t("fiches.human-flag.consigne"),
    tips: [t("fiches.human-flag.conseil1"), t("fiches.human-flag.conseil2"), t("fiches.human-flag.conseil3")] };
