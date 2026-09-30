// Fiche « Comment faire » : Curl à la poulie.
import { side } from "../_communs.js";
import { curlS } from "./_communs.js";
import { GROUND, cable } from "../../figure.js";

export default { views: [side([curlS(0, [cable(186, GROUND - 8, "bar")], { near: { ua: 92, fa: 76, hand: 76 } }), curlS(1, [cable(186, GROUND - 8, "bar")])], ["Bras tendus vers la poulie", "Barre aux épaules"])],
    cue: "Face à la poulie basse, barre en main : monte la barre vers les épaules en gardant les coudes fixes, puis redescends lentement.",
    tips: ["Un pas en arrière pour que le câble reste tendu en bas.", "Coudes collés au corps.", "La tension du câble reste constante : descends lentement."] };
