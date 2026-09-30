// Fiche « Comment faire » : Soulevé de terre roumain.
import { ANK, HIPY, side } from "../_communs.js";
import { bar } from "../../silhouette/index.js";

export default { views: [side([
      // En haut, jambes tendues ; les genoux se fléchissent un peu pendant la descente (hanche à 87 de la cheville en bas).
      // La barre descend en ligne droite le long des cuisses puis des tibias (track).
      { hip: [121, HIPY], torso: -90, neck: -90, near: { ankleAt: [122, ANK], ft: 0, wristAt: [128.5, 118], hand: 90, track: 1 }, eq: [bar(P => P.near.grip, 13, { top: true })] },
      { hip: [84, 124.5], torso: -20, neck: -20, near: { ankleAt: [122, ANK], ft: 0, wristAt: [132, 164.7], hand: 90, track: 1 }, eq: [bar(P => P.near.grip, 13, { top: true })] }], ["Debout, jambes tendues", "Hanches en arrière, genoux un peu fléchis"])],
    cue: "Jambes presque tendues : pousse les hanches vers l’arrière en gardant le dos plat, descends la barre le long des cuisses jusque sous les genoux, puis remonte.",
    tips: ["Genoux légèrement fléchis et fixes.", "Ce sont les hanches qui reculent : la barre glisse le long des cuisses.", "Arrête-toi quand tu sens l’étirement derrière les cuisses, dos toujours plat."] };
