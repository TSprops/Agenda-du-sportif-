// Fiche « Comment faire » : Snatch.
import { t } from "../../commun/i18n.js";
import { HIPY, side, stand } from "../_communs.js";
import { liftBar, pullExt, pullFloor, pullKnee, snatchStart } from "./_communs.js";
import { bar } from "../../silhouette/index.js";

export default { views: [side([snatchStart, stand({ neck: -92, near: { ua: -96, fa: -94, hand: -92, ls: { ua: 0.9, fa: 0.9 } }, eq: [bar(P => P.near.grip, 13, { top: true })] })], [t("fiches.snatch.legende1"), t("fiches.snatch.legende2")])],
    // Tirage : coudes hauts, la barre passe devant le visage puis au-dessus de la tête (jamais dans la tête).
    animViews: [side([pullFloor(128), pullKnee(), pullExt(),
      liftBar(stand({ hip: [120, HIPY - 6], shrug: 4, neck: -92, near: { ft: 20, wristAt: [140, 50], hand: -60, elbowBend: 1, track: 1 } })),
      liftBar(stand({ neck: -92, near: { wristAt: [138, 22], hand: -80, elbowBend: 1, track: 1 } })),
      liftBar(stand({ neck: -92, near: { wristAt: [115, 9.5], hand: -92, ls: { ua: 0.9, fa: 0.9 }, track: 1 } }))],
      [t("fiches.snatch.legende1"), t("fiches.snatch.legende3"), t("fiches.snatch.legende4"), t("fiches.snatch.legende5"), t("fiches.snatch.legende6"), t("fiches.snatch.legende7")], [0, 1, 2, 3, 4, 5, 4, 3, 2, 1])],
    cue: t("fiches.snatch.consigne"),
    tips: [t("fiches.snatch.conseil1"), t("fiches.snatch.conseil2"), t("fiches.snatch.conseil3")] };
