// Fonctions communes du groupe Bras : positions et matériel partagés par ses fiches.
// Ce fichier n'importe que la silhouette et d'autres fichiers communs : il peut être évalué à tout moment.
import { ANK, merge, stand, standF } from "../_communs.js";
import { rad } from "../jambes/_communs.js";
import { BT, benchLie } from "../pectoraux/_communs.js";
import { GROUND, add, bar, bench, box, cable, db, raw } from "../../figure.js";

export const curlS = (up, eq, o = {}) => stand(merge({ near: up ? { ua: 86, fa: -72, hand: -62 } : { ua: 93, fa: 86, hand: 88 }, eq }, o));
export const curlF = (up, eq, o = {}) => standF({ ...o, R: up ? { ua: 88, fa: -92, hand: -90, ls: { fa: 0.35 } } : { ua: 88, fa: 90, hand: 90 }, eq });
export const inclCurl = up => ({ hip: [116, 150], torso: -125, neck: -110, near: { ankleAt: [156, ANK], ft: 0, kneeBend: 1, ua: 90, fa: up ? -60 : 90, hand: up ? -60 : 90 },
  eq: [bench(40, 156, 158, 55, 118), db(P => [P.near.grip, 0], "end", { top: true })] });
// En bas, on s'arrête un peu avant l'extension complète (avant-bras à 15° du bras, jamais au-delà).
export const preacher = up => ({ hip: [96, 150], torso: -80, neck: -80, near: { th: 0, sh: 92, ft: 0, ua: 40, fa: up ? -100 : 25, hand: up ? -100 : 30 },
  eq: [box(74, 158, 34, 52), raw(P => { const n = [Math.cos(rad(130)), Math.sin(rad(130))], a = add(P.sh, [n[0] * 10 + 3, n[1] * 10 + 3]), b = add(P.near.elbow, [n[0] * 8, n[1] * 8]);
    return `<line class="fg-padline" x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}"/><line class="fg-rail" x1="${((a[0] + b[0]) / 2).toFixed(1)}" y1="${((a[1] + b[1]) / 2 + 6).toFixed(1)}" x2="${((a[0] + b[0]) / 2).toFixed(1)}" y2="${GROUND}"/>`; }, { mid: true }),
    bar(P => P.near.grip, 10, { top: true })] });
// Avant-bras posé à plat sur la cuisse, poignet juste au-delà du genou.
export const wristCurl = up => ({ hip: [96, 158], torso: -35, neck: -20, near: { th: 0, sh: 90, ft: 0, ua: 130.9, fa: -2, hand: up ? -45 : 55 },
  eq: [bench(40, 120, 166), bar(P => P.near.grip, 9, { top: true })] });
export const skull = up => benchLie(0, () => ({ ua: -100, fa: up ? -100 : 150, hand: up ? -100 : 150 }), [bench(18, 150, BT), bar(P => P.near.grip, 13, { top: true })]);
export const ohExt = up => stand({ near: { ua: -102, fa: up ? -96 : 120, hand: up ? -96 : 120 }, eq: [db(P => [add(P.near.grip, up ? [0, -6] : [-4, 4]), (up ? -96 : 120) - 90], "side", { top: true })] });
export const ohExtF = up => standF({ R: up ? { ua: -84, fa: -96, hand: -120 } : { ua: -76, fa: 104, hand: 150, ls: { fa: 0.5 } }, eq: [db(P => [[120, P.R.grip[1] - (up ? 10 : 8)], 0], "side", { top: !!up })] });
export const pushdownS = down => stand({ torso: -86, near: { ua: 92, fa: down ? 88 : -36, hand: down ? 88 : -36 }, eq: [cable(184, 12, "rope")] });
export const pushdownF = down => standF({ R: down ? { ua: 92, fa: 96, hand: 96 } : { ua: 92, fa: -94, hand: -94, ls: { fa: 0.4 } },
  eq: [raw(P => `<line class="fg-cable" x1="120" y1="-40" x2="120" y2="${(P.R.grip[1] - 8).toFixed(1)}"/><path class="fg-rope" d="M120 ${(P.R.grip[1] - 8).toFixed(1)}L${P.R.grip[0].toFixed(1)} ${P.R.grip[1].toFixed(1)}M120 ${(P.R.grip[1] - 8).toFixed(1)}L${P.L.grip[0].toFixed(1)} ${P.L.grip[1].toFixed(1)}"/>`, { top: true })] });
export const kickback = up => ({ hip: [112, 114], torso: -10, neck: -14, near: { th: 96, sh: 88, ft: 0, ua: 172, fa: up ? 172 : 90, hand: up ? 172 : 90 },
  far: { ua: 97, fa: 93, hand: 0, h: "flat", th: 92, sh: 180, ft: 160 }, farWorks: false, eq: [bench(62, 196, 167), db(P => [P.near.grip, up ? 172 : 90], "side", { mid: true })] });
export const HAMMER = { cue: "Coudes collés au corps, pouces vers le haut : monte les haltères sans balancer, puis redescends lentement.",
  tips: ["Prise marteau : pouces vers le haut pendant tout le mouvement.", "Coudes fixes le long du corps.", "Sans élan : si tu balances, allège les charges."] };
