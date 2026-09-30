// Fiche « Comment faire » : L-sit.
import { side } from "../_communs.js";
import { dipbars } from "../../figure.js";

export default { views: [side([{ hip: [120, 118], torso: -90, neck: -90, near: { wristAt: [121, 122], hand: 0, th: 0, sh: 0, ft: 0 }, eq: [dipbars(96, 150, 127.5)] }], ["Position à tenir"])],
    cue: "Bras tendus en appui sur des barres, épaules basses : jambes tendues à l’horizontale.", tips: ["Épaules basses, loin des oreilles.", "Jambes serrées et tendues, pointes de pieds tirées.", "Progression : un genou plié, puis les deux jambes tendues."] };
