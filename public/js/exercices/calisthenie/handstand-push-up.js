// Fiche « Comment faire » : Handstand push-up.
import { side } from "../_communs.js";
import { GROUND, wall } from "../../silhouette/index.js";

export default { views: [side([
      { hip: [118, 99], torso: 91, neck: 90, near: { wristAt: [110, GROUND - 3], h: "flat", hand: 180, th: -90, sh: -90, ft: -90 }, eq: [wall(132)] },
      { hip: [118, 126], torso: 93, neck: 92, near: { wristAt: [110, GROUND - 3], h: "flat", hand: 180, th: -90, sh: -90, ft: -90 }, eq: [wall(132)] }], ["Bras tendus contre le mur", "Tête près du sol"])],
    cue: "En équilibre, pieds contre le mur : descends la tête près du sol en pliant les bras, puis pousse bras tendus.", tips: ["Mains à 20–30 cm du mur, largeur d’épaules.", "Descends lentement, la tête frôle le sol.", "Progression : pompes pike sur un banc."] };
