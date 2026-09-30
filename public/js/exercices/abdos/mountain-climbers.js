// Fiche « Comment faire » : Mountain climbers.
import { side } from "../_communs.js";
import { MC_TUCK, mcTuck } from "./_communs.js";
import { plank } from "../calisthenie/_communs.js";

// Animation : une jambe à la fois (genou vers la poitrine puis retour en planche), l'autre reste tendue au sol.
export default { animViews: [side([
      mcTuck("near"), plank(122, 150, 126, { near: { ls: {} } }), mcTuck("far")], ["Genou droit vers la poitrine", "Planche", "Genou gauche vers la poitrine"], [0, 1, 2, 1])],
    views: [side([
      // Genou vers la poitrine, pied juste au-dessus du sol (jamais dedans) ; l'autre jambe tendue, sur la pointe.
      plank(122, 150, 126, { near: { ls: {}, ankleAt: MC_TUCK, ft: 70, kneeBend: 1 }, far: { th: 165.5, sh: 165.5, ft: 75 } }),
      plank(122, 150, 126, { near: { ls: {} }, far: { ankleAt: MC_TUCK, ft: 70, kneeBend: 1 } })], ["Genou droit vers la poitrine", "Genou gauche vers la poitrine"])],
    cue: "En planche, bras tendus : ramène un genou vers la poitrine, puis l’autre, en alternant vite sans lever les fesses.",
    tips: ["Un genou après l’autre, jamais les deux en même temps.", "Mains sous les épaules, bras tendus.", "Fesses basses, dos plat."] };
