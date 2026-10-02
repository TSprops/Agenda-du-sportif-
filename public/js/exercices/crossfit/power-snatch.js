// Fiche « Comment faire » : Power snatch.
import { ANK, HIPY, side, stand } from "../_communs.js";
import { liftBar, pullExt, pullFloor, pullKnee, snatchStart } from "./_communs.js";
import { bar } from "../../silhouette/index.js";

// Réception en quart de squat, bras verrouillés au-dessus de la tête (barre au-dessus de la nuque).
const catchQ = o => liftBar({ hip: [114, 128], torso: -86, neck: -90, near: { ankleAt: [124, ANK], ft: 0, kneeBend: 1, wristAt: [113, 9.5 + 128 - HIPY], hand: -92, ls: { ua: 0.9, fa: 0.9 }, ...o } });
export default { views: [side([snatchStart, { ...catchQ(), eq: [bar(P => P.near.grip, 13, { top: true })] }], ["Barre au sol, prise large", "Réception en quart de squat, bras tendus"])],
    animViews: [side([pullFloor(128), pullKnee(), pullExt(),
      liftBar(stand({ hip: [120, HIPY - 6], shrug: 4, neck: -92, near: { ft: 20, wristAt: [140, 50], hand: -60, elbowBend: 1, track: 1 } })),
      catchQ({ track: 1 }),
      liftBar(stand({ neck: -92, near: { wristAt: [115, 9.5], hand: -92, ls: { ua: 0.9, fa: 0.9 }, track: 1 } }))],
      ["Barre au sol, prise large", "Barre devant les genoux", "Extension, sur la pointe des pieds", "Tirage, coudes hauts", "Réception en quart de squat", "Debout, bras tendus"], [0, 1, 2, 3, 4, 5, 4, 3, 2, 1])],
    cue: "Comme un snatch, mais tu reçois la barre bras tendus en quart de squat, sans descendre en squat complet.",
    tips: ["Prise large : la barre arrive au pli de la hanche quand tu es debout.", "Barre près du corps, coudes hauts pendant le tirage.", "Bras verrouillés à la réception, puis remonte debout."] };
