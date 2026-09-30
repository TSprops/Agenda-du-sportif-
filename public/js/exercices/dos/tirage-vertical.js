// Fiche « Comment faire » : Tirage vertical.
import { front, side } from "../_communs.js";
import { pulldown, pulldownF } from "./_communs.js";

export default { grip: "pro", views: [side([pulldown(0), pulldown(1)], ["Bras tendus", "Barre en haut de la poitrine"]), front([pulldownF(40, 0), pulldownF(40, 1)], ["Prise large", "Coudes vers le bas"])],
    cue: "Assis, cuisses calées sous les boudins : tire la barre jusqu’au haut de la poitrine en serrant les omoplates, puis remonte bras tendus.",
    tips: ["La poulie est juste au-dessus de toi : le câble descend droit.", "Poitrine sortie, léger recul du buste.", "Tire les coudes vers le bas, pas vers l’arrière."] };
