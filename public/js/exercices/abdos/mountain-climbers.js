// Fiche « Comment faire » : Mountain climbers.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { MC_TUCK, mcTuck } from "./_communs.js";
import { plank } from "../calisthenie/_communs.js";

// Animation : une jambe à la fois (genou vers la poitrine puis retour en planche), l'autre reste tendue au sol.
export default { animViews: [side([
      mcTuck("near"), plank(122, 150, 126, { near: { ls: {} } }), mcTuck("far")], [t("fiches.mountain-climbers.legende1"), t("fiches.mountain-climbers.legende2"), t("fiches.mountain-climbers.legende3")], [0, 1, 2, 1])],
    views: [side([
      // Genou vers la poitrine, pied juste au-dessus du sol (jamais dedans) ; l'autre jambe tendue, sur la pointe.
      plank(122, 150, 126, { near: { ls: {}, ankleAt: MC_TUCK, ft: 70, kneeBend: 1 }, far: { th: 165.5, sh: 165.5, ft: 75 } }),
      plank(122, 150, 126, { near: { ls: {} }, far: { ankleAt: MC_TUCK, ft: 70, kneeBend: 1 } })], [t("fiches.mountain-climbers.legende1"), t("fiches.mountain-climbers.legende3")])],
    cue: t("fiches.mountain-climbers.consigne"),
    tips: [t("fiches.mountain-climbers.conseil1"), t("fiches.mountain-climbers.conseil2"), t("fiches.mountain-climbers.conseil3")] };
