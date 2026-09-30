// Fonctions communes du groupe Épaules : positions et matériel partagés par ses fiches.
// Ce fichier n'importe que la silhouette et d'autres fichiers communs : il peut être évalué à tout moment.
import { ANK, HIPY, stand, standF } from "../_communs.js";
import { GROUND, bar, bench, cable, db, fbar, fbench, fdb, raw, seat } from "../../silhouette/index.js";

export const SH_Y = HIPY - 52;   // épaule d'une personne debout (x = 120)
export const ohpS = up => stand({ near: up ? { ua: -93, fa: -91, hand: -90 } : { ua: 78, fa: -96, hand: -90 }, eq: [db(P => [P.near.grip, 0], "end", { top: true })] });
export const ohpF = up => standF({ R: up ? { ua: -68, fa: -86, hand: -90 } : { ua: 16, fa: -88, hand: -90 }, eq: [fdb("across", { top: true })] });
// Développé Arnold. spin = rotation des poignets (0 : paumes vers soi, 1 : paumes vers l'avant) ; l'haltère la montre :
// de face la poignée gauche-droite raccourcit jusqu'à pointer vers nous (paumes face à face) puis revient ; de profil c'est l'inverse.
export const spinDb = (P, c, front) => {
  const k = Math.abs(Math.cos(Math.PI * (P.spin || 0))), w = front ? k : 1 - k, h = 11 * w, r = v => v.toFixed(1);
  const end = w < 0.45 ? `<circle class="fg-plate" cx="${r(c[0])}" cy="${r(c[1])}" r="8"/><circle class="fg-hub" cx="${r(c[0])}" cy="${r(c[1])}" r="2.2"/>` : "";
  return `<g class="fg-eq">${end}${w >= 0.2 ? `<line class="fg-handle" x1="${r(c[0] - h)}" y1="${r(c[1])}" x2="${r(c[0] + h)}" y2="${r(c[1])}"/><rect class="fg-plate" x="${r(c[0] - h - 3)}" y="${r(c[1] - 9)}" width="6" height="18" rx="2"/><rect class="fg-plate" x="${r(c[0] + h - 3)}" y="${r(c[1] - 9)}" width="6" height="18" rx="2"/>` : ""}</g>`;
};
// De profil : départ coudes devant, puis bras ouverts sur le côté (haut du bras hors du plan, donc court), puis bras tendus.
export const arnoldS = k => ({ hip: [120, 150], torso: -88, neck: -88, spin: [0, 1, 1][k], near: [{ ua: 20, fa: -98, hand: -90 }, { ua: 80, fa: -92, hand: -90, ls: { ua: 0.25 } }, { ua: -93, fa: -91, hand: -90 }][k],
  eq: [seat(104, 158, 1, 4), raw(P => spinDb(P, P.near.grip, false), { top: true })] });
export const fixLegsSeated = p => ({ ...p, near: { th: 0, sh: 92, ft: 0, ...p.near } });
// De face (référence) : haltères devant le visage, coudes devant ; les bras s'ouvrent sur les côtés en tournant
// les poignets (position basse du développé militaire), puis poussée vers le haut, paumes vers l'avant.
export const arnoldF = k => ({ view: "front", torso: -90, neck: -90, hip: [120, 150], spin: [0, 1, 1][k], R: { th: 90, sh: 90, ...[{ ua: 112, fa: -96, hand: -90, ls: { ua: 0.35, th: 0.3, sh: 0.86 } }, { ua: 12, fa: -88, hand: -90, ls: { th: 0.3, sh: 0.86 } }, { ua: -68, fa: -86, hand: -90, ls: { th: 0.3, sh: 0.86 } }][k] },
  eq: [fbench(158), raw(P => spinDb(P, P.R.grip, true) + spinDb(P, P.L.grip, true), { top: true })] });
export const armsForward = (ls) => ({ ua: -4, fa: -4, hand: -4, ls });
export const latS = up => stand({ near: up ? { ua: -8, fa: -6, hand: -6, ls: { ua: 0.42, fa: 0.42 } } : { ua: 92, fa: 90, hand: 90 }, eq: [db(P => [P.near.grip, up ? 90 : 90], "side", { top: true })] });
export const latF = up => standF({ R: up ? { ua: 2, fa: -4, hand: -4 } : { ua: 86, fa: 90, hand: 90 }, eq: [fdb("end", { top: true })] });
export const cableLat = up => ({ view: "front", torso: -90, neck: -90, hip: [120, HIPY], box: [30, 30, 200, GROUND], R: { th: 90, sh: 90, ...(up ? { ua: 2, fa: -4, hand: -4 } : { ua: 110, fa: 120, hand: 120 }) }, L: { ua: 100, fa: 95, hand: 90, th: 90, sh: 90 },
  eq: [raw(P => { const g = P.R.grip; return `<g class="fg-eq"><rect class="fg-frame" x="36" y="-30" width="10" height="${GROUND + 30}"/><rect class="fg-stack" x="37.5" y="${GROUND - 58}" width="7" height="50"/><circle class="fg-pulley" cx="50" cy="${GROUND - 8}" r="4.4"/><line class="fg-cable" x1="50" y1="${GROUND - 8}" x2="${g[0].toFixed(1)}" y2="${g[1].toFixed(1)}"/></g>`; })] });
export const rearS = up => ({ hip: [92, 160], torso: -24, neck: -24, near: { ankleAt: [146, ANK], ft: 0, kneeBend: 1, ...(up ? { ua: 86, fa: 86, hand: 86, ls: { ua: 0.4, fa: 0.4 } } : { ua: 92, fa: 90, hand: 90 }) },
  eq: [bench(52, 120, 168), db(P => [P.near.grip, 90], "side", { top: true })] });
export const rearF = up => ({ view: "front", torso: -90, neck: -90, tls: 0.4, hip: [120, 162], R: { th: 70, sh: 95, ls: { th: 0.4, sh: 0.5 }, ...(up ? { ua: 4, fa: 2, hand: 2 } : { ua: 92, fa: 92, hand: 90 }) },
  eq: [fbench(168), fdb("end", { top: true })] });
export const uprowS = up => stand({ near: up ? { wristAt: [130, SH_Y + 8], hand: 0, elbowBend: 1, ls: { ua: 0.45 } } : { ua: 94, fa: 88, hand: 90 }, eq: [bar(P => P.near.grip, 13, { top: true })] });
// En haut : coudes écartés, plus hauts que les mains (au-dessus des épaules), mains sous le menton.
export const uprowF = up => standF({ R: up ? { ua: -12, fa: 150, hand: 90, ls: { ua: 0.6 } } : { wristAt: [130, 124], hand: 90 }, eq: [fbar(P => P.R.grip[1], { top: true })] });
// Fin du face pull : coude haut à hauteur d'épaule, écarté (donc raccourci de profil), mains qui tirent la corde vers le visage.
export const facepullS = back => stand({ near: back ? { ua: 0, fa: -38, hand: -30, ls: { ua: -0.3 } } : { ua: -8, fa: -8, hand: -8 }, eq: [cable(186, SH_Y - 12, "rope")] });
