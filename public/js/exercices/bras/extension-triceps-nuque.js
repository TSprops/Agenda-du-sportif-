// Fiche « Comment faire » : Extension triceps nuque.
import { front, side } from "../_communs.js";
import { ohExt, ohExtF } from "./_communs.js";

export default { views: [side([ohExt(0), ohExt(1)], ["Haltère derrière la tête", "Bras tendus vers le haut"]), front([ohExtF(0), ohExtF(1)], ["Coudes vers le haut", "Bras tendus"])],
    cue: "Haltère tenu à deux mains au-dessus de la tête : descends-le derrière la nuque en pliant les coudes, puis tends les bras vers le haut.",
    tips: ["Coudes pointés vers le haut, près de la tête.", "Seuls les avant-bras bougent.", "Abdos serrés pour ne pas cambrer (ou assis, dos calé)."], anim: "De profil" };
