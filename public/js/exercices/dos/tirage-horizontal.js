// Fiche « Comment faire » : Tirage horizontal.
import { side } from "../_communs.js";
import { seatedRow } from "./_communs.js";

export default { views: [side([seatedRow(0), seatedRow(1)], ["Bras tendus", "Poignée au ventre"])],
    cue: "Assis, pieds sur la plateforme, dos droit : tire la poignée vers le ventre en serrant les omoplates, sans basculer en arrière.",
    tips: ["Genoux légèrement fléchis, dos droit.", "Coudes près du corps, poignée vers le nombril.", "Le buste reste presque immobile : ce sont les bras et le dos qui tirent."] };
