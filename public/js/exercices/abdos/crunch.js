// Fiche « Comment faire » : Crunch.
import { side } from "../_communs.js";
import { backLie } from "./_communs.js";

// Seul le haut du dos s'enroule (curl) : le bas du dos et le bassin restent au sol.
// Mains sur les côtés de la tête, coudes orientés vers les hanches (jamais au-dessus de la tête) : le bras garde
// le même angle par rapport au haut du dos pendant l'enroulement (haut du dos = 180 puis 214).
export default { views: [side([backLie(0, { near: { ua: -45, fa: 160, hand: 160, ls: { ua: 0.6 } } }), backLie(0, { curl: 34, neck: 222, near: { ua: -11, fa: 194, hand: 194, ls: { ua: 0.6 } } })], ["Allongé, genoux pliés", "Haut du dos enroulé, bas du dos au sol"])],
    cue: "Allongé sur le dos, genoux pliés et pieds à plat : enroule le haut du dos en soufflant, sans tirer sur la nuque, puis redescends.",
    tips: ["Pieds à plat au sol, talons près des fesses.", "Le bas du dos reste collé au sol : seules les épaules décollent.", "Mains contre les tempes, sans tirer sur la tête."] };
