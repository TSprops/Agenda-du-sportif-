// Fiche « Comment faire » : Dips aux anneaux.
import { t } from "../../commun/i18n.js";
import { front, side } from "../_communs.js";
import { dipF, dipLow, dipTop } from "./_communs.js";
import { frings, rings } from "../../silhouette/index.js";

// Anneaux : descente plus verticale, buste moins penché, mains près des hanches.
export default { grip: null, views: [side([dipTop({ eq: [rings("near", { top: true })] }), dipLow({ hip: [128, 124], torso: -74, neck: -78, near: { wristAt: [127, 106], hand: 90 }, eq: [rings("near", { top: true })] })], [t("fiches.dips-aux-anneaux.legende1"), t("fiches.dips-aux-anneaux.legende2")]),
      front([dipF(0, { eq: [frings()] }), dipF(1, { eq: [frings()] })], [t("fiches.dips-aux-anneaux.legende3"), t("fiches.dips-aux-anneaux.legende2")])],
    cue: t("fiches.dips-aux-anneaux.consigne"),
    tips: [t("fiches.dips-aux-anneaux.conseil1"), t("fiches.dips-aux-anneaux.conseil2"), t("fiches.dips-aux-anneaux.conseil3")] };
