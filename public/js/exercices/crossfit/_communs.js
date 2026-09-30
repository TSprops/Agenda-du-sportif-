// Fonctions communes du groupe CrossFit / fonctionnel : positions et matériel partagés par ses fiches.
// Ce fichier n'importe que la silhouette et d'autres fichiers communs : il peut être évalué à tout moment.
import { ANK, HIPY, onToes, stand } from "../_communs.js";
import { plank } from "../calisthenie/_communs.js";
import { GROUND, add, bar, box, medball, raw, solve, wall } from "../../figure.js";

// Burpee : debout, mains au sol, pieds en arrière (planche), une pompe, retour des pieds vers les mains, squat sauté.
// Les mains restent au même endroit du sol de « mains au sol » jusqu'au retour ; les pieds sautent par-dessus le sol.
export const burpeeFrames = () => {
  const toes = onToes(6, 75), pl = y => plank(144, y, 146, { near: y < 170 ? { ls: {} } : {} }, toes);
  return [
    stand({ near: { ua: 95, fa: 88 } }),
    { hip: [104, 166], torso: -15, neck: -4, near: { ankleAt: [116, ANK], ft: 0, wristAt: [146, GROUND - 3], h: "flat", hand: 0 } },
    pl(150), pl(186),
    stand({ hip: [120, HIPY - 16], neck: -95, near: { ua: -84, fa: -88, hand: -90, h: "open", ft: 55 } })];
};
// Wall ball : personne plus loin du mur, ballon plus gros (obj = position du ballon, interpolée pendant l'animation).
// Squat ballon contre la poitrine, lancer bras tendus, ballon sur la cible (trajectoire en pointillés) ; il revient
// ensuite dans les mains pour le squat suivant.
export const WALL_X = 222, TARGET = [WALL_X - 13, -20], BALL_R = 12;
export const WB_BOX = [70, -60, WALL_X + 10, GROUND];
export const wbEq = extra => [wall(WALL_X, TARGET[1]), ...extra, medball(P => P.obj, { top: true }, BALL_R)];
export const withBall = (pose, at) => ({ box: WB_BOX, ...pose, obj: at(solve(pose)) });
export const wbThrow = stand({ neck: -100, near: { ua: -70, fa: -66, hand: -66, h: "open", ft: 40 }, hip: [120, HIPY - 12] });
export const wbRelease = add(solve(wbThrow).near.grip, [11, -18]), wbApex = [(wbRelease[0] + TARGET[0]) / 2, Math.min(wbRelease[1], TARGET[1]) - 18];
// Trajectoire en pointillés : de la main à la cible, en passant par le sommet de l'arc.
export const wbPath = raw(() => `<path class="fg-path" d="M${wbRelease[0].toFixed(1)} ${wbRelease[1].toFixed(1)}Q${(2 * wbApex[0] - (wbRelease[0] + TARGET[0]) / 2).toFixed(1)} ${(2 * wbApex[1] - (wbRelease[1] + TARGET[1]) / 2).toFixed(1)} ${TARGET[0]} ${TARGET[1]}"/>`);
export const wallball = [
  withBall({ hip: [106, 166], torso: -66, neck: -86, near: { ankleAt: [124, ANK], ft: 0, wristAt: [136, 124], hand: -40, h: "open" }, eq: wbEq([]) }, P => add(P.sh, [24, 6])),
  withBall({ ...wbThrow, eq: wbEq([]) }, () => wbRelease),
  withBall({ ...wbThrow, eq: wbEq([wbPath]) }, () => wbApex),
  withBall({ ...wbThrow, eq: wbEq([wbPath]) }, () => TARGET)
];
// Snatch et clean (animation) : la barre monte en ligne droite devant le corps (track), les mains la tiennent toujours.
export const liftBar = o => ({ eq: [bar(P => P.near.grip, 13, { top: true })], ...o });
export const pullFloor = x => liftBar({ hip: [98, 165], torso: -30, neck: -20, near: { ankleAt: [124, ANK], ft: 0, wristAt: [x, GROUND - 18.5], hand: 90, track: 1 } });
export const pullKnee = () => liftBar({ hip: [92, 128], torso: -40, neck: -28, near: { ankleAt: [124, ANK], ft: 0, wristAt: [133, 152.5], hand: 90, track: 1 } });
// Extension : debout sur la pointe des pieds, épaules haussées, bras encore tendus, barre devant les cuisses.
export const pullExt = () => liftBar(stand({ hip: [120, HIPY - 9], shrug: 4, near: { ft: 30, wristAt: [128, 104], hand: 90, track: 1 } }));
export const snatchStart = { hip: [98, 165], torso: -30, neck: -20, near: { ankleAt: [124, ANK], ft: 0, wristAt: [128, GROUND - 18.5], hand: 90 }, eq: [bar(P => P.near.grip, 13, { mid: true })] };
export const rack = { ua: 20, fa: -150, hand: -30 };
export const boxAt = box(150, 150, 58, 60);
