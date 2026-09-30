// Fiche « Comment faire » : Snatch.
import { HIPY, side, stand } from "../_communs.js";
import { liftBar, pullExt, pullFloor, pullKnee, snatchStart } from "./_communs.js";
import { bar } from "../../silhouette/index.js";

export default { views: [side([snatchStart, stand({ neck: -92, near: { ua: -96, fa: -94, hand: -92, ls: { ua: 0.9, fa: 0.9 } }, eq: [bar(P => P.near.grip, 13, { top: true })] })], ["Barre au sol, prise large", "Barre au-dessus de la tête, bras tendus"])],
    // Tirage : coudes hauts, la barre passe devant le visage puis au-dessus de la tête (jamais dans la tête).
    animViews: [side([pullFloor(128), pullKnee(), pullExt(),
      liftBar(stand({ hip: [120, HIPY - 6], shrug: 4, neck: -92, near: { ft: 20, wristAt: [140, 50], hand: -60, elbowBend: 1, track: 1 } })),
      liftBar(stand({ neck: -92, near: { wristAt: [138, 22], hand: -80, elbowBend: 1, track: 1 } })),
      liftBar(stand({ neck: -92, near: { wristAt: [115, 9.5], hand: -92, ls: { ua: 0.9, fa: 0.9 }, track: 1 } }))],
      ["Barre au sol, prise large", "Barre devant les genoux", "Extension, sur la pointe des pieds", "Tirage, coudes hauts", "La barre passe devant le visage", "Bras tendus au-dessus de la tête"], [0, 1, 2, 3, 4, 5, 4, 3, 2, 1])],
    cue: "Prise très large : arrache la barre du sol d’un seul mouvement et reçois-la bras tendus au-dessus de la tête.",
    tips: ["Mouvement technique : apprends-le avec un bâton ou une barre à vide.", "Barre toujours près du corps pendant la montée.", "À l’arrivée, bras verrouillés, barre au-dessus de la nuque."] };
