// Fiche « Comment faire » : Fentes bulgares.
import { ANK, side, stand } from "../_communs.js";
import { bench, db } from "../../figure.js";

export default { views: [side([
      stand({ hip: [114, 126], near: { ankleAt: [150, ANK], ft: 0 }, far: { ankleAt: [46, 156], ft: 170, kneeBend: 1 }, eq: [bench(0, 58, 163), db(P => [P.near.grip, 90], "side", { mid: true })] }),
      stand({ hip: [108, 150], near: { ankleAt: [150, ANK], ft: 0 }, far: { ankleAt: [46, 156], ft: 170, kneeBend: 1 }, eq: [bench(0, 58, 163), db(P => [P.near.grip, 90], "side", { mid: true })] })], ["Pied arrière sur le banc", "Genou arrière vers le sol"])],
    cue: "Dessus du pied arrière posé sur un banc : descends le genou arrière vers le sol, genou avant au-dessus de la cheville, puis remonte.",
    tips: ["Banc à hauteur de genou, dessus du pied arrière posé dessus.", "Pied avant assez loin du banc pour garder le genou au-dessus de la cheville.", "Buste droit, descends à la verticale."] };
