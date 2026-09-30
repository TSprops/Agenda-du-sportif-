// Fiche « Comment faire » : Rowing haltère.
import { side } from "../_communs.js";
import { benchRow } from "./_communs.js";

export default { views: [side([benchRow(0), benchRow(1)], ["Bras tendu", "Coude tiré vers l’arrière"])],
    cue: "Une main et un genou sur le banc, dos plat : tire l’haltère vers la hanche, coude près du corps, puis redescends.",
    tips: ["Dos plat, parallèle au sol.", "Tire le coude vers la hanche, pas vers l’épaule.", "Le buste ne tourne pas pendant le mouvement."] };
