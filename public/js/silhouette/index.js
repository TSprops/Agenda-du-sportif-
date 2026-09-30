// Silhouettes des exercices (« Comment faire ») : un mannequin gris articulé, dessiné en SVG.
// Chaque partie du corps a une LONGUEUR FIXE et une forme dessinée une seule fois (avec ses lignes de muscles) ;
// une pose ne donne que des ANGLES, donc les proportions restent humaines et le corps ne peut pas se déformer.
// Angles en degrés à l'écran : 0 = vers la droite, 90 = vers le bas, -90 = vers le haut, 180 = vers la gauche.
// Profil : le mannequin regarde toujours vers la droite. Repère local d'un segment : x le long du segment,
// +y côté dos, -y côté ventre. Seuls les muscles travaillés (principaux) sont colorés, aux couleurs du thème.
// Ce dossier n'utilise que ses propres valeurs : il peut être importé par n'importe quel autre.
// Ce fichier regroupe ce que les autres modules utilisent.
export { LEN, dir, add, sub, mul, rot, angleOf, ik } from "./geometrie.js";
export { solveSide } from "./mannequin-profil.js";
export { solveFront } from "./mannequin-face.js";
export { solve, figure, GROUND, frameBox } from "./image.js";
export { bar, db, kb, medball, roller, rings, cable, cableTop, climbRope, wheel, line, pad, raw, bench, pullbar, dipbars, seat, box, wall, pole, beltSide } from "./materiel-profil.js";
export { fbar, fdb, fpullbar, fdips, frings, fcables, fcableTop, fbench, beltFront } from "./materiel-face.js";
export { anglesOf, lerpPose } from "./animation.js";
