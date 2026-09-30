// Fonctions communes du groupe Jambes / fessiers : positions et matériel partagés par ses fiches.
// Ce fichier n'importe que la silhouette et d'autres fichiers communs : il peut être évalué à tout moment.
import { ANK, HIPY, onToes, stand } from "../_communs.js";
import { GROUND, add, bar, bench, box, db, line, raw, roller, seat } from "../../figure.js";

export const rad = d => d * Math.PI / 180, dirA = d => [Math.cos(rad(d)), Math.sin(rad(d))];
export const shOf = (hip, torso) => add(hip, [52 * Math.cos(rad(torso)), 52 * Math.sin(rad(torso))]);
// Barre posée sur le haut du dos : un peu derrière et au-dessus de l'épaule.
export const backBarAt = (hip, torso) => add(shOf(hip, torso), add([9 * Math.cos(rad(torso - 90)), 9 * Math.sin(rad(torso - 90))], [2 * Math.cos(rad(torso)), 2 * Math.sin(rad(torso))]));
// Mains sur la barre derrière la nuque : coude vers le bas et l'arrière, avant-bras vertical.
export const backSquat = (hip, torso, ank) => { const r = torso + 90; return { hip, torso, neck: torso > -80 ? -70 : -88, near: { ankleAt: ank, ft: 0, ua: 100 + r, fa: -88 + r, hand: -90 + r }, eq: [bar(P => backBarAt(P.hip, P.torso), 13)] }; };
// Squat vu de face : cuisses qui avancent vers nous (raccourcies), genoux au-dessus des pieds.
export const squatF = (down, o = {}) => ({ view: "front", torso: -90, neck: -90, tls: down ? 0.86 : 1, hip: [120, down ? ANK - 44 * 0.97 - 46 * 0.3 : HIPY],
  R: { th: down ? 84 : 90, sh: down ? 92 : 90, ls: down ? { th: 0.3 } : {}, ...(o.R || {}) }, ...o, R: { th: down ? 84 : 90, sh: down ? 92 : 90, ls: down ? { th: 0.3 } : {}, ...(o.R || {}) } });
// Front squat : barre posée sur l'avant des épaules (au contact des clavicules), coudes hauts devant.
export const frontRack = (hip, torso, ank) => { const sh = shOf(hip, torso), r = rad(torso + 90), w = add(sh, [6.2 * Math.cos(r) - 3.75 * Math.sin(r), 6.2 * Math.sin(r) + 3.75 * Math.cos(r)]);
  return { hip, torso, neck: torso + (torso > -80 ? -14 : 0), near: { ankleAt: ank, ft: 0, wristAt: w, elbowBend: 1, hand: -30 + torso + 90 }, eq: [bar(P => P.near.grip, 13, { top: true })] }; };
export const SQUAT_TIPS = ["Pieds largeur d’épaules, pointes légèrement vers l’extérieur.", "Genoux dans l’axe des pieds : ils ne rentrent pas et ne partent pas vers l’extérieur.", "Descends au moins jusqu’aux cuisses parallèles au sol, dos droit, talons au sol.", "Pousse dans les talons pour remonter."];
// Pied posé par la plante (bord d'une marche) : cheville placée pour que la plante reste au point « ball ».
export const ankleFromBall = (ball, ft) => add(ball, [-(18 * Math.cos(rad(ft)) - 7.2 * Math.sin(rad(ft))), -(18 * Math.sin(rad(ft)) + 7.2 * Math.cos(rad(ft)))]);
export const calfStand = ft => { const a = ankleFromBall([132, 188], ft); return stand({ hip: [a[0], a[1] - 90], near: { ft, ua: 93, fa: 84 }, eq: [box(128, 188, 40, 22), db(P => [P.near.grip, 90], "side", { mid: true })] }); };
export const hackEq = [
  raw(P => { const b = dirA(P.torso - 90), p1 = add(P.hip, [b[0] * 13, b[1] * 13]), p2 = add(P.sh, [b[0] * 13, b[1] * 13]); return `<line class="fg-padline" x1="${p1[0].toFixed(1)}" y1="${p1[1].toFixed(1)}" x2="${p2[0].toFixed(1)}" y2="${p2[1].toFixed(1)}"/>`; }),
  line([60, 4], [172, 214], "fg-rail"), line([150, 212], [196, 170], "fg-plat"),
  roller(P => add(P.sh, [-2, -9]), 6, { top: true })];
export const pressEq = ank => [line([30, 202], [196, 36], "fg-rail"), raw(() => `<rect class="fg-pad" x="30" y="150" width="70" height="8" rx="3.5"/><rect class="fg-pad" x="18" y="118" width="46" height="8" rx="3.5" transform="rotate(32 64 122)"/><rect class="fg-frame" x="56" y="158" width="4" height="${GROUND - 158}"/><rect class="fg-frame" x="30" y="${GROUND - 3}" width="60" height="4" rx="1.5"/>`),
  // Plateforme sous la semelle (pied à plat, orteils vers le haut de la plateforme), chariot derrière elle.
  raw(P => { const a = add(P.near.ankle, [0.5, -14.6]); return `<g transform="translate(${a[0].toFixed(1)} ${a[1].toFixed(1)}) rotate(45)"><rect class="fg-plate" x="-26" y="-3.5" width="52" height="7" rx="2"/><rect class="fg-frame" x="-6" y="-19.5" width="12" height="16"/></g>`; })];
export const legExt = ext => ({ hip: [100, 142], torso: -95, neck: -90, near: { th: -4, sh: ext ? -8 : 92, ft: ext ? -20 : 10, wristAt: [104, 150], hand: 0 },
  // Boudin sur l'avant du bas du tibia, juste au-dessus de la cheville, pendant tout le mouvement.
  eq: [seat(86, 150, 1, 8), roller(P => { const a = rad(P.near.sh); return add(P.near.ankle, [-6 * Math.cos(a) + 6.5 * Math.sin(a), -6 * Math.sin(a) - 6.5 * Math.cos(a)]); }, 6, { top: true })] });
export const legCurl = up => ({ hip: [100, 150], torso: 0, neck: 4, near: { th: 180, sh: up ? -60 : 180, ft: up ? -60 : 180, wristAt: [168, 166], hand: 90 },
  eq: [bench(30, 176, 163), roller(P => add(P.near.ankle, up ? [4, -6] : [0, -8]), 6, { top: true })] });
// Assis, cuisses à l'horizontale, coussin sur le bas des cuisses près des genoux, avant du pied sur la cale :
// seules les chevilles bougent (le talon monte et descend, le genou suit un peu).
export const seatCalf = ft => { const a = ankleFromBall([166, 190], ft); return { hip: [100, 142], torso: -88, neck: -88, near: { ankleAt: a, ft, kneeBend: 1, wristAt: [134, 130], hand: 0 },
  eq: [seat(86, 150, 0), box(150, 190, 40, 20), roller(P => add(P.near.knee, [-8, -10]), 6.5, { top: true }), roller(P => add(P.near.knee, [-18, -10]), 6.5, { top: true })] }; };
export const lunge = (front, o = {}) => stand({ hip: [118, 150], ...o, near: front === "near" ? { ankleAt: [160, ANK], ft: 0, ua: 92, fa: 88, hand: 90 } : { ankleAt: onToes(72, 62), ft: 62, ua: 92, fa: 88, hand: 90 },
  far: front === "near" ? { ankleAt: onToes(72, 62), ft: 62 } : { ankleAt: [160, ANK], ft: 0 }, eq: [db(P => [P.near.grip, 90], "side", { mid: true })] });
export const BENCH_HT = 163;
export const ht = (sh, hipUp) => { const hip = hipUp ? add(sh, [52, 0]) : add(sh, [52 * Math.cos(rad(33.7)), 52 * Math.sin(rad(33.7))]), b = add(hip, [4, -13]);
  return { hip, torso: hipUp ? 180 : -146.3, neck: hipUp ? 200 : -150, near: { ankleAt: [150, ANK], ft: 0, kneeBend: 1, wristAt: add(b, [-4, -4]), hand: -60 }, eq: [bench(10, 72, BENCH_HT), bar(P => add(P.hip, [4, -13]), 13, { top: true })] }; };
