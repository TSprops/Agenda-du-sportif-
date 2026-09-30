// Fiche « Comment faire » : Kickback triceps.
import { side } from "../_communs.js";
import { kickback } from "./_communs.js";

export default { views: [side([kickback(0), kickback(1)], ["Coude à 90°", "Bras tendu vers l’arrière"])],
    cue: "Un genou et une main en appui sur un banc, dos plat, bras collé au corps : tends l’avant-bras vers l’arrière, puis reviens lentement.",
    tips: ["Genou et main du même côté posés sur le banc, dos parallèle au sol.", "Le haut du bras reste collé au corps et immobile.", "Charge légère, mouvement lent."] };
