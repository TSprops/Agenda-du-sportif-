// Fiche « Comment faire » : Pull-over.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { BT, benchLie } from "./_communs.js";
import { bench, db } from "../../silhouette/index.js";

export default { views: [side([benchLie(0, () => ({ ua: 176, fa: 188, hand: 188 }), [bench(18, 150, BT), db(P => [P.near.grip, 90], "side", { top: true })]),
      // En haut : bras quasi tendus au-dessus de la poitrine, coudes légèrement fléchis vers les pieds (jamais vers la tête).
      benchLie(0, () => ({ ua: -80, fa: -98, hand: -95 }), [bench(18, 150, BT), db(P => [P.near.grip, 0], "side", { top: true })])], [t("fiches.pull-over.legende1"), t("fiches.pull-over.legende2")])],
    cue: t("fiches.pull-over.consigne"),
    tips: [t("fiches.pull-over.conseil1"), t("fiches.pull-over.conseil2"), t("fiches.pull-over.conseil3")] };
