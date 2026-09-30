// Fiche « Comment faire » : Développé couché haltères.
import { front, side } from "../_communs.js";
import { benchEq, benchF, benchLie, pressArms } from "./_communs.js";

export default { views: [side([benchLie(0, pressArms(1), benchEq(0, "db")), benchLie(0, pressArms(0), benchEq(0, "db"))], ["Haltères au niveau de la poitrine", "Bras tendus"]),
      front([benchF(1, 150, "db"), benchF(0, 142, "db")], ["Coudes à 90°", "Haltères au-dessus des épaules"])],
    cue: "Allongé sur un banc plat, un haltère dans chaque main : descends-les sur les côtés de la poitrine, puis pousse vers le haut.",
    tips: ["Banc à plat, pieds bien à plat au sol.", "Pars bras tendus, paumes tournées vers tes pieds.", "Descends jusqu’aux coudes à 90°, coudes à environ 45° du buste.", "Remonte en rapprochant les haltères, sans les cogner."] };
