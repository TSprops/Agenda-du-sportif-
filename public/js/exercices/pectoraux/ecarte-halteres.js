// Fiche « Comment faire » : Écarté haltères.
import { front, side, view } from "../_communs.js";
import { benchEq, benchF, benchLie, flyArms, flyTop } from "./_communs.js";

export default { animViews: ["De profil", view("Vue de dessus", [flyTop(1), flyTop(0)], ["Bras ouverts", "Haltères au-dessus de la poitrine"])], views: [side([benchLie(0, flyArms(1), benchEq(0, "db")), benchLie(0, flyArms(0), benchEq(0, "db"))], ["Bras ouverts", "Haltères au-dessus de la poitrine"]),
      front([benchF(1, 150, "db", { R: { ua: 4, fa: -12, hand: -12 } }), benchF(0, 128, "db", { R: { wristAt: [128, 92], hand: -90, elbowBend: -1 } })], ["Bras ouverts, coudes légèrement pliés", "Mains qui se rejoignent"])],
    cue: "Allongé, coudes légèrement fléchis : ouvre les bras sur les côtés sans descendre plus bas que le banc, puis referme au-dessus de la poitrine.",
    tips: ["Coudes légèrement fléchis et fixes.", "Ouvre jusqu’à sentir l’étirement des pectoraux, pas plus bas que le banc.", "Referme comme pour faire un câlin à un tronc d’arbre."] };
