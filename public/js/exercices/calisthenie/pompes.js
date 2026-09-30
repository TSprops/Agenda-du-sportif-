// Fiche « Comment faire » : Pompes.
import { front, side } from "../_communs.js";
import { plank, pushF } from "./_communs.js";

export default { grip: "floor", views: [side([plank(122, 150, 126, { near: { ls: {} } }), plank(122, 188, 126)], ["Bras tendus", "Poitrine près du sol"]),
      front([pushF(142, 0), pushF(142, 1)], ["Bras tendus", "Coudes près du corps"])],
    cue: "Corps gainé en planche, mains un peu plus larges que les épaules : descends la poitrine près du sol, coudes près du corps, puis pousse.",
    tips: ["Coudes à environ 45° du corps, pas écartés.", "Corps droit comme une planche : ni fesses en l’air, ni ventre qui tombe.", "Trop dur ? Fais-les sur les genoux ou mains sur un banc."], anim: "De profil" };
