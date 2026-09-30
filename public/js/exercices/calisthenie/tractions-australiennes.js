// Fiche « Comment faire » : Tractions australiennes.
import { side } from "../_communs.js";
import { pullbar } from "../../figure.js";

export default { grip: "row", views: [side([
      // Talons au même point. En haut, la barre arrive au milieu de la poitrine (épaules au-delà de la barre) :
      // le coude part vers les hanches, le long du corps, avant-bras vertical sous la barre.
      { hip: [88.2, 173.5], torso: -161, neck: -164, near: { wristAt: [80, 115.5], hand: -90, elbowBend: -1, th: 19, sh: 19, ft: -71 }, eq: [pullbar(80, 110)] },
      { hip: [99.4, 151.6], torso: -145.3, neck: -150, near: { wristAt: [80, 115.5], hand: -90, elbowBend: -1, th: 34.7, sh: 34.7, ft: -55 }, eq: [pullbar(80, 110)] }], ["Bras tendus", "Poitrine à la barre"])],
    cue: "Sous une barre basse, corps gainé et droit, talons au sol : tire la poitrine jusqu’à la barre, coudes près du corps, puis redescends.",
    tips: ["Corps droit des épaules aux talons.", "Coudes près du corps, poitrine vers la barre.", "Plus les pieds sont loin, plus c’est dur."] };
