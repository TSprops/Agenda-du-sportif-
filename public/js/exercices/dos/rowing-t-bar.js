// Fiche « Comment faire » : Rowing T-bar.
import { front, side } from "../_communs.js";
import { bentF, tbar } from "./_communs.js";
import { GROUND, raw } from "../../silhouette/index.js";

export default { views: [side([tbar(0), tbar(1)], ["Barre entre les jambes, bras tendus", "Poignée à la poitrine"]),
      front([bentF(0.55, { R: { wristAt: [124, 150], hand: 90 }, eq: [raw(P => `<line class="fg-barline" x1="120" y1="${GROUND}" x2="120" y2="${(P.R.grip[1] + 8).toFixed(1)}"/>`), raw(P => `<circle class="fg-plate" cx="120" cy="${(P.R.grip[1] + 8).toFixed(1)}" r="12"/>`, { top: true })] }),
        bentF(0.55, { R: { wristAt: [124, 122], hand: 90, ls: { ua: 0.28, th: 0.85 } }, eq: [raw(P => `<line class="fg-barline" x1="120" y1="${GROUND}" x2="120" y2="${(P.R.grip[1] + 8).toFixed(1)}"/>`), raw(P => `<circle class="fg-plate" cx="120" cy="${(P.R.grip[1] + 8).toFixed(1)}" r="12"/>`, { top: true })] })], ["Barre entre les jambes", "Coudes serrés"])],
    cue: "Debout au-dessus de la barre, elle passe entre tes jambes : tire la poignée vers la poitrine en gardant les coudes près du corps, puis redescends.",
    tips: ["La barre passe entre les jambes, poignée en V dans les mains.", "Buste penché, dos plat, genoux légèrement fléchis.", "Coudes serrés le long du corps."], anim: "De face" };
