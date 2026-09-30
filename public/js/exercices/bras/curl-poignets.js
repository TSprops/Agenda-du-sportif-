// Fiche « Comment faire » : Curl poignets.
import { side } from "../_communs.js";
import { wristCurl } from "./_communs.js";

export default { views: [side([wristCurl(0), wristCurl(1)], ["Poignets vers le bas", "Poignets enroulés vers le haut"])],
    cue: "Assis, avant-bras posés sur les cuisses, poignets dans le vide, paumes vers le haut : enroule les poignets vers le haut, puis redescends.",
    tips: ["Avant-bras posés à plat sur les cuisses, poignets au-delà des genoux.", "Seuls les poignets bougent.", "Charge légère, beaucoup de répétitions."] };
