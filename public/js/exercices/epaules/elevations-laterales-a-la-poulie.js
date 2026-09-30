// Fiche « Comment faire » : Élévations latérales à la poulie.
import { front } from "../_communs.js";
import { cableLat } from "./_communs.js";

export default { views: [front([cableLat(0), cableLat(1)], ["Poignée devant la hanche opposée", "Bras à l’horizontale"])],
    cue: "Poulie basse à côté de toi, poignée tenue avec la main opposée : monte le bras sur le côté jusqu’à l’horizontale, puis redescends lentement.",
    tips: ["Le câble passe devant le corps.", "Bras presque tendu, monte jusqu’à l’horizontale.", "Fais toutes les répétitions d’un côté, puis change."] };
