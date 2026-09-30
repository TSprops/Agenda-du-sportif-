// Fiche « Comment faire » : Shrugs.
import { front, side, standF } from "../_communs.js";
import { shrugStand } from "./_communs.js";
import { fdb } from "../../figure.js";

export default { views: [side([shrugStand(0), shrugStand(1)], ["Épaules basses", "Épaules haussées"]),
      front([standF({ R: { ua: 86, fa: 90 }, eq: [fdb("end", { top: true })] }), standF({ shrug: 7, R: { ua: 86, fa: 90 }, eq: [fdb("end", { top: true })] })], ["Bras tendus", "Épaules vers les oreilles"])],
    cue: "Bras tendus, charges en main : monte les épaules vers les oreilles, marque une pause, puis redescends lentement.",
    tips: ["Bras tendus : ce ne sont pas les bras qui tirent.", "Monte droit vers les oreilles, sans rouler les épaules.", "Pause d’une seconde en haut."] };
