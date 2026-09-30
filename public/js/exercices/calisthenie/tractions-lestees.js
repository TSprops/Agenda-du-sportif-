// Fiche « Comment faire » : Tractions lestées.
import { PULL_TIPS, pullViews } from "./_communs.js";
import { beltFront, beltSide } from "../../silhouette/index.js";

export default { grip: "pro", views: pullViews(30, [beltSide()], [beltFront()]), cue: "Ceinture de lest autour des hanches, le poids pend entre les jambes : même mouvement que la traction classique.",
    tips: ["Ceinture serrée sur les hanches, disque qui pend entre les jambes sans balancer.", ...PULL_TIPS.slice(1)], anim: "De profil" };
