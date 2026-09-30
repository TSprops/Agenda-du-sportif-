// Fiche « Comment faire » : Curl marteau.
import { front, side } from "../_communs.js";
import { HAMMER, curlF, curlS } from "./_communs.js";
import { GROUND, db, fdb } from "../../silhouette/index.js";

// Prise neutre : la poignée reste perpendiculaire à l'avant-bras (elle suit la main), l'haltère ne se retourne jamais.
export default { anim: "De profil", views: [side([curlS(0, [db(P => [P.near.grip, P.near.hand], "side", { top: true })], { box: [80, 40, 196, GROUND] }), curlS(1, [db(P => [P.near.grip, P.near.hand], "side", { top: true })])], ["Bras tendus", "Pouces vers le haut"]),
      front([curlF(0, [fdb("end", { top: true })]), curlF(1, [fdb("end", { top: true })])], ["Paumes face au corps", "Pouces vers le haut"])], ...HAMMER };
