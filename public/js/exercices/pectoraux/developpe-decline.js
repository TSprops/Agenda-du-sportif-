// Fiche « Comment faire » : Développé décliné.
import { side } from "../_communs.js";
import { benchEq, benchLie, pressArms } from "./_communs.js";

export default { grip: "bench", views: [side([benchLie(-18, pressArms(1), benchEq(-18)), benchLie(-18, pressArms(0), benchEq(-18))], ["Barre au bas des pectoraux", "Bras tendus"])],
    cue: "Sur un banc décliné, pieds bloqués sous les boudins : descends la barre au bas des pectoraux, puis pousse vers le haut.",
    tips: ["Tête plus basse que les hanches (15–30°), pieds bloqués.", "Barre descendue sur le bas des pectoraux.", "Fais-toi aider pour prendre et reposer la barre."] };
