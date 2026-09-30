// Fiche « Comment faire » : Curl barre.
import { front, side } from "../_communs.js";
import { curlF, curlS } from "./_communs.js";
import { bar, fbar } from "../../silhouette/index.js";

export default { views: [side([curlS(0, [bar(P => P.near.grip, 11, { top: true })]), curlS(1, [bar(P => P.near.grip, 11, { top: true })])], ["Bras tendus", "Barre aux épaules, coudes fixes"]),
      front([curlF(0, [fbar(P => P.R.grip[1], { top: true, ez: 1 })]), curlF(1, [fbar(P => P.R.grip[1], { top: true, ez: 1 })])], ["Barre EZ, mains à largeur d’épaules", "Coudes le long du corps"])],
    cue: "Barre EZ en main, paumes vers l’avant, coudes collés au corps : monte la barre sans balancer, puis redescends lentement.",
    tips: ["Barre EZ (coudée) : plus confortable pour les poignets.", "Seuls les avant-bras bougent, les coudes restent le long du corps.", "Pas d’élan avec le dos."], anim: "De profil" };
