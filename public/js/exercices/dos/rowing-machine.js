// Fiche « Comment faire » : Rowing machine.
import { side } from "../_communs.js";
import { machineRow } from "./_communs.js";

export default { views: [side([machineRow(0), machineRow(1)], ["Bras tendus, poitrine sur le coussin", "Coudes tirés vers l’arrière"])],
    cue: "Assis, poitrine contre le coussin, poignées en main : tire les coudes vers l’arrière en serrant les omoplates, puis reviens bras tendus.",
    tips: ["Règle le siège pour avoir les poignées à hauteur de poitrine.", "La poitrine reste collée au coussin.", "Coudes près du corps, serre les omoplates en fin de mouvement."] };
