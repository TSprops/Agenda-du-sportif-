// Fiche « Comment faire » : Curl haltères.
import { front, side } from "../_communs.js";
import { curlF, curlS } from "./_communs.js";
import { db, fdb } from "../../silhouette/index.js";

export default { views: [side([curlS(0, [db(P => [P.near.grip, 90], "side", { mid: true })]), curlS(1, [db(P => [P.near.grip, 0], "end", { top: true })])], ["Pouces vers l’avant", "Paumes vers les épaules"]),
      front([curlF(0, [fdb("end", { top: true })]), curlF(1, [fdb("across", { top: true })])], ["Paumes face au corps", "Rotation : paumes vers le haut"])],
    cue: "Haltères le long du corps, paumes face aux cuisses : monte en tournant le poignet pour finir paumes vers les épaules, puis redescends en tournant dans l’autre sens.",
    tips: ["Supination : le poignet tourne pendant la montée (paumes vers le haut en haut).", "Coudes fixes le long du corps.", "Monte et descends lentement, sans élan."], anim: "De profil" };
