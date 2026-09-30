// Fiche « Comment faire » : Élévations frontales.
import { front, side, stand, standF } from "../_communs.js";
import { db, fdb } from "../../silhouette/index.js";

export default { views: [side([stand({ near: { ua: 92, fa: 88, hand: 88 }, eq: [db(P => [P.near.grip, 0], "end", { top: true })] }), stand({ near: { ua: -4, fa: -4, hand: -4 }, eq: [db(P => [P.near.grip, 0], "end", { top: true })] })], ["Haltères devant les cuisses", "Bras devant, à hauteur des épaules"]),
      front([standF({ R: { wristAt: [134, 128], hand: 90 }, eq: [fdb("across", { top: true })] }), standF({ R: { ua: -80, fa: -80, hand: -80, ls: { ua: 0.25, fa: 0.25 } }, eq: [fdb("across", { top: true })] })], ["Haltères à l’horizontale", "Bras devant"])],
    cue: "Haltères tenues à l’horizontale devant les cuisses : monte les bras presque tendus devant toi jusqu’à hauteur des épaules, puis redescends lentement.",
    tips: ["Haltères tenues à l’horizontale, paumes vers le sol.", "Monte jusqu’à hauteur des yeux maximum.", "Sans élan : le buste ne bouge pas."], anim: "De profil" };
