// Fiche « Comment faire » : Pompes diamant.
import { front, side } from "../_communs.js";
import { plank, pushF } from "./_communs.js";
import { GROUND } from "../../figure.js";

export default { grip: "diamond", views: [side([plank(122, 150, 124, { near: { ls: {} } }), plank(122, 190, 124)], ["Bras tendus", "Poitrine près des mains"]),
      front([pushF(124, 0), pushF(124, 1, { R: { wristAt: [126, GROUND - 4], hand: 90, h: "palm", ls: { ua: 0.2 } } })], ["Mains en losange", "Coudes serrés le long du corps"])],
    cue: "Mains collées sous la poitrine en forme de losange : descends en gardant les coudes serrés le long du corps, puis pousse.",
    tips: ["Pouces et index se touchent sous la poitrine.", "Coudes collés au corps, encore plus qu’aux pompes classiques.", "Plus dur : commence sur les genoux si besoin."] };
