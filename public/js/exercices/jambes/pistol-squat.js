// Fiche « Comment faire » : Pistol squat.
import { ANK, side, stand } from "../_communs.js";

export default { views: [side([
      stand({ near: { ua: -2, fa: -2, hand: -2, h: "open" }, far: { th: 70, sh: 90, ft: 0 } }),
      { hip: [100, 170], torso: -52, neck: -70, near: { ankleAt: [120, ANK], ft: 0, ua: -4, fa: -4, hand: -4, h: "open" }, far: { th: -6, sh: -6, ft: -20 } }], ["Sur une jambe, l’autre devant", "Descente sur une jambe, l’autre tendue"])],
    cue: "Sur une jambe, l’autre tendue devant : descends le plus bas possible en gardant le talon au sol, puis remonte.",
    tips: ["Bras tendus devant pour l’équilibre.", "Talon de la jambe d’appui au sol, genou dans l’axe du pied.", "Pour apprendre : descends sur un banc ou tiens-toi à un support."] };
