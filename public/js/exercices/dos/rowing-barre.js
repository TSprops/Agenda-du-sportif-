// Fiche « Comment faire » : Rowing barre.
import { front, side } from "../_communs.js";
import { bentF, rowSide } from "./_communs.js";
import { bar, fbar } from "../../silhouette/index.js";

export default { grip: "row", views: [
      side([rowSide(0, { eq: [bar(P => P.near.grip, 13, { top: true })] }), rowSide(1, { eq: [bar(P => P.near.grip, 13, { top: true })] })], ["Bras tendus", "Barre au nombril, coudes près du corps"]),
      front([bentF(0.55, { R: { wristAt: [138, 151], hand: 90 }, eq: [fbar(P => P.R.grip[1], { top: true })] }), bentF(0.55, { R: { wristAt: [138, 118], hand: 90, ls: { ua: 0.28, th: 0.85 } }, eq: [fbar(P => P.R.grip[1], { top: true })] })], ["Bras tendus", "Coudes près du corps"])],
    cue: "Buste penché à 45°, dos plat : tire la barre vers le nombril en gardant les coudes près du corps, puis redescends bras tendus.",
    tips: ["Genoux légèrement fléchis, buste penché à environ 45°, dos plat.", "Coudes près du corps (environ 45°), pas écartés.", "Serre les omoplates en haut, redescends sans arrondir le dos."], anim: "De profil" };
