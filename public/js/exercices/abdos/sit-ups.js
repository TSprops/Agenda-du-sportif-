// Fiche « Comment faire » : Sit-ups.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { backLie } from "./_communs.js";

// Mains sur les côtés de la tête, coudes orientés vers les hanches (comme au crunch) : le bras garde le même angle
// par rapport au buste pendant toute la montée (buste = 180 puis 252).
export default { views: [side([backLie(0, { near: { ua: -45, fa: 160, hand: 160, ls: { ua: 0.6 } } }), backLie(72, { neck: 250, near: { ua: 27, fa: 232, hand: 232, ls: { ua: 0.6 } } })], [t("fiches.sit-ups.legende1"), t("fiches.sit-ups.legende2")])],
    cue: t("fiches.sit-ups.consigne"),
    tips: [t("fiches.sit-ups.conseil1"), t("fiches.sit-ups.conseil2"), t("fiches.sit-ups.conseil3")] };
