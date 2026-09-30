// Fonctions communes du groupe Dos / lombaires : positions et matériel partagés par ses fiches.
// Ce fichier n'importe que la silhouette et d'autres fichiers communs : il peut être évalué à tout moment.
import { ANK, merge, stand } from "../_communs.js";
import { GROUND, add, bar, bench, cable, cableTop, db, fbench, fcableTop, line, pad, raw, roller, seat } from "../../silhouette/index.js";

export const dlStart = (wx = 128, o = {}) => merge({ hip: [98, 165], torso: -30, neck: -20, near: { ankleAt: [124, ANK], ft: 0, wristAt: [wx, GROUND - 18.5], hand: 90, track: 1 }, eq: [bar(P => P.near.grip, 13, { top: true })] }, o);
export const dlTop = (o = {}) => stand(merge({ near: { wristAt: [117.8, 118.7], hand: 90, track: 1 }, eq: [bar(P => P.near.grip, 13, { top: true })] }, o));
// Passage aux genoux (animation seulement) : tibias presque verticaux, la barre passe devant les genoux, bras tendus.
export const dlKnee = (o = {}) => merge({ hip: [92, 128], torso: -40, neck: -28, near: { ankleAt: [124, ANK], ft: 0, wristAt: [133, 152.5], hand: 90, track: 1 }, eq: [bar(P => P.near.grip, 13, { top: true })] }, o);
export const bentF = (tls, o = {}) => ({ view: "front", torso: -90, neck: -90, tls, hip: [120, 120], ...o, R: { th: 90, sh: 90, ls: { th: 0.85 }, ...(o.R || {}) } });
export const rowSide = (up, o = {}) => merge({ hip: [96, 120], torso: -35, neck: -24, near: { ankleAt: [120, ANK], ft: 0, wristAt: up ? [122, 113] : [136, 146], hand: 90 } }, o);
export const benchRow = up => ({ hip: [112, 112], torso: -10, neck: -14, near: { th: 96, sh: 88, ft: 0, ua: up ? -158 : 90, fa: 90, hand: 90 },
  far: { ua: 97, fa: 93, hand: 0, h: "flat", th: 92, sh: 180, ft: 160 }, eq: [bench(62, 196, 165), db(P => [P.near.grip, 90], "side", { mid: true })] });
// Assis sur le banc, pieds contre les cale-pieds, genoux légèrement fléchis vers le haut.
export const seatedRow = back => ({ hip: [84, 178], torso: back ? -96 : -70, neck: back ? -96 : -70, near: { ankleAt: [166, 176], ft: -80, kneeBend: 1, wristAt: back ? [112, 158] : [176, 150], hand: 0 },
  eq: [bench(40, 120, 186), line([175, 160], [175, 200], "fg-plat"), line([175, 200], [175, GROUND], "fg-rail"), cable(204, 150, "handle")] });
export const machineRow = back => ({ hip: [100, 142], torso: -88, neck: -88, near: { th: 0, sh: 90, ft: 0, wristAt: back ? [140, 104] : [170, 102], hand: 0 },
  // Le câble arrive de face, un peu plus bas que les mains.
  eq: [seat(86, 150, 0), pad(122, 88, 8, 40), cable(198, 114, "handle")] });
export const pulldown = (down, o = {}) => merge({ hip: [104, 150], torso: -95, neck: -92, near: { th: -4, sh: 92, ft: 0, wristAt: down ? [118, 96] : [112, 44], hand: -90, elbowBend: -1 },
  eq: [seat(88, 158, 0), roller(P => add(P.near.knee, [-6, -9]), 6, { top: true }), cableTop(113, -30, 170)] }, o);
export const pulldownF = (grip, down) => ({ view: "front", torso: -90, neck: -90, hip: [120, 150], R: { th: 90, sh: 90, ls: { th: 0.3, sh: 0.86 },
    // Prise serrée, en bas : coudes vers le bas le long des côtes, avant-bras presque verticaux.
    // Le coude descend devant, dans l'axe du corps : vu de face le haut du bras raccourcit puis s'inverse
    // (raccourci négatif), sans s'écarter sur le côté ni croiser l'autre bras.
    ...(grip < 15 ? (down ? { ua: -105, fa: -121, hand: -90, ls: { th: 0.3, sh: 0.86, ua: -1 }, fore: 1 } : { ua: -102.3, fa: -100.3, hand: -90, fore: 1 }) : { wristAt: [120 + grip, down ? 94 : 38], hand: -90, elbowBend: down ? -1 : 1 }) },
  eq: [fbench(158), fcableTop()] });
export const hyper = t => ({ hip: [100, 120], torso: t, neck: t + 4, near: { th: 180, sh: 180, ft: 180, ua: t + 70, fa: t - 160, hand: t - 160 },
  eq: [raw(() => `<rect class="fg-frame" x="96" y="132" width="5" height="${GROUND - 132}"/><rect class="fg-frame" x="18" y="132" width="5" height="${GROUND - 132}"/><rect class="fg-frame" x="10" y="${GROUND - 3}" width="100" height="4" rx="1.5"/><rect class="fg-frame" x="18" y="130" width="84" height="4"/>`),
    pad(84, 126, 30, 8), roller([12, 128], 5.5, { top: true }), roller([12, 112], 5.5, { top: true })] });
export const tbar = up => { const g = up ? [128, 128] : [134, 170]; return { hip: [96, 120], torso: -35, neck: -24, near: { ankleAt: [120, ANK], ft: 0, wristAt: add(g, [0, -5.5]), hand: 90 },
  eq: [raw(P => { const c = add(P.near.grip, [12, 0]); return `<line class="fg-barline" x1="30" y1="${GROUND - 3}" x2="${c[0].toFixed(1)}" y2="${c[1].toFixed(1)}"/>`; }), bar(P => add(P.near.grip, [12, 0]), 11, { top: true }), roller([30, GROUND - 4], 3)] }; };
export const shrugStand = up => stand({ shrug: up ? 7 : 0, near: { ua: 92, fa: 90, hand: 90 }, eq: [db(P => [P.near.grip, 90], "side", { mid: true })] });
