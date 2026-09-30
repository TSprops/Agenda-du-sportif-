// Fiche « Comment faire » : Roue abdominale.
import { side } from "../_communs.js";
import { wheel } from "../../figure.js";

export default { views: [side([
      { hip: [78, 158], torso: -30, neck: -20, near: { th: 102, sh: 180, ft: 180, wristAt: [126, 190], hand: 90 }, eq: [wheel()] },
      { hip: [94.4, 165.3], torso: -5, neck: 0, near: { th: 125, sh: 180, ft: 180, wristAt: [196, 192], hand: 90 }, eq: [wheel()] }],
      ["À genoux, roue sous les épaules", "Roule devant toi, dos plat"])],
    cue: "À genoux, mains sur la roue sous les épaules : roule devant toi en gardant le dos plat, puis reviens en contractant les abdos.",
    tips: ["Dos plat, fesses serrées : le bas du dos ne se creuse jamais.", "Ne va pas plus loin que ce que tu contrôles.", "Débutant : petites amplitudes, ou contre un mur."] };
