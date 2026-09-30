// Fiche « Comment faire » : Burpees.
import { side } from "../_communs.js";
import { burpeeFrames } from "./_communs.js";

export default { views: [side(burpeeFrames(), ["Debout", "Mains au sol", "Planche", "Pompe : poitrine près du sol", "Squat sauté, bras en l’air"], [0, 1, 2, 3, 2, 1, 4])],
    cue: "Mains au sol, pieds en arrière, poitrine au sol, puis ramène les pieds, remonte et saute bras en l’air.",
    tips: ["Le corps reste tourné du même côté pendant tout le mouvement.", "En planche, corps gainé : pas de fesses en l’air.", "Saut léger, réception souple sur l’avant du pied."] };
