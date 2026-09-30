// Fiche « Comment faire » : Développé couché.
import { front, side } from "../_communs.js";
import { BENCH_TIPS, benchEq, benchF, benchLie, pressArms } from "./_communs.js";

export default { grip: "bench", views: [side([benchLie(0, pressArms(1), benchEq(0)), benchLie(0, pressArms(0), benchEq(0))], ["Barre au bas des pectoraux", "Bras tendus"]),
      front([benchF(1), benchF(0)], ["Avant-bras verticaux, coudes à 90°", "Bras tendus"])],
    cue: "Allongé sur un banc plat, omoplates serrées, pieds au sol : descends la barre au bas des pectoraux, puis pousse vers le haut.", tips: BENCH_TIPS, anim: "De profil" };
