// Fiche « Comment faire » : Pont fessier.
import { ANK, side } from "../_communs.js";
import { GROUND } from "../../figure.js";

export default { views: [side([
      { hip: [124, GROUND - 13], torso: 180, neck: 182, near: { ankleAt: [162, ANK], ft: 0, kneeBend: 1, ua: 8, fa: 2, hand: 0, h: "flat" } },
      { hip: [117.9, 170.6], torso: 152, neck: 170, near: { ankleAt: [162, ANK], ft: 0, kneeBend: 1, ua: 14, fa: 6, hand: 0, h: "flat" } }], ["Allongé, épaules au sol", "Hanches levées"])],
    cue: "Allongé sur le dos, épaules au sol, pieds à plat : monte les hanches en serrant les fessiers, puis redescends.",
    tips: ["Épaules et tête restent au sol (sans banc, contrairement au hip thrust).", "Pieds à plat, talons près des fesses.", "En haut, genoux–hanches–épaules alignés, fessiers serrés 1 seconde."] };
