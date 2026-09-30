// Fiche « Comment faire » : Pompes archer.
import { front } from "../_communs.js";
import { pushF } from "./_communs.js";
import { GROUND } from "../../figure.js";

export default { grip: "wide", views: [front([
      pushF(164, 0),
      // Descente d'un côté : ce bras plie (coude près du corps, avant-bras vertical), l'autre reste tendu sur le côté.
      pushF(164, 1, { hip: [146, 190], R: { wristAt: [164, GROUND - 4], hand: 90, h: "palm", ls: { ua: 0.2 } }, L: { wristAt: [76, GROUND - 4], hand: 90, h: "palm", ls: {} } }),
      pushF(164, 1, { hip: [94, 190], R: { wristAt: [164, GROUND - 4], hand: 90, h: "palm" }, L: { wristAt: [76, GROUND - 4], hand: 90, h: "palm", ls: { ua: 0.2 } } })],
      ["Mains très écartées", "Descente à droite, bras gauche tendu", "Descente à gauche, bras droit tendu"], [0, 1, 0, 2])],
    cue: "Mains très écartées : descends d’un côté en pliant ce bras, l’autre bras reste tendu, remonte, puis descends de l’autre côté.",
    tips: ["Un côté puis l’autre, jamais les deux en même temps.", "Le bras tendu glisse sur le côté et aide un peu.", "Corps gainé et droit pendant tout le mouvement."] };
