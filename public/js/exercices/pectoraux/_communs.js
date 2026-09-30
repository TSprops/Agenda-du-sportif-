// Fonctions communes du groupe Pectoraux : positions et matériel partagés par ses fiches.
// Ce fichier n'importe que la silhouette et d'autres fichiers communs : il peut être évalué à tout moment.
import { ANK, HIPY, merge, onToes, stand, standF } from "../_communs.js";
import { rad, shOf } from "../jambes/_communs.js";
import { GROUND, add, bar, bench, db, fbar, fbench, fcables, fdb, raw, roller, seat } from "../../figure.js";

export const BT = 163;   // dessus du banc
export const lieHip = [114, BT - 13];
// Couché sur le banc (tête à gauche), pieds au sol. deg > 0 : incliné, deg < 0 : décliné.
export const benchLie = (deg, arms, eq, o = {}) => {
  const t = 180 + deg, sh = shOf(lieHip, t);
  const legs = deg < 0 ? { th: -35, sh: 70, ft: 20, ankleAt: null } : { ankleAt: [152, ANK], ft: 0, kneeBend: 1 };
  return merge({ hip: lieHip, torso: t, neck: t + (deg > 0 ? -8 : 2), near: { ...legs, ...arms(sh, t) } }, { eq, ...o });
};
// Point au-dessus de la poitrine (côté ventre) à la distance k de l'épaule, décalé de « along » vers les hanches.
export const overChest = (sh, t, k, along = 6) => add(add(sh, [-Math.sin(rad(t)) * k, Math.cos(rad(t)) * k]), [Math.cos(rad(t + 180)) * along, Math.sin(rad(t + 180)) * along]);
// Incliné : barre posée sur le haut de la poitrine, puis poussée verticale jusqu'à l'aplomb des épaules.
export const inclineArms = down => sh => ({ wristAt: add(sh, down ? [8, -6.5] : [8, -52]), hand: -90, elbowBend: -1, ls: { ua: down ? 0.72 : 1 }, track: 1 });
export const pressArms = (down, grip = 0) => (sh, t) => { const b = overChest(sh, t, down ? 15 : 58, down ? 8 : 4); return { wristAt: add(b, [0, 5.5]), hand: -90, elbowBend: -1, ls: { ua: down ? 0.72 - grip : 1 } }; };
// Prise serrée : coudes serrés qui descendent vers le bas du corps, le long du buste (et non vers la tête) ; poussée verticale.
export const closeArms = down => (sh, t) => { const b = overChest(sh, t, down ? 15 : 58, down ? 14 : 4); return { wristAt: add(b, [0, 5.5]), hand: -90, elbowBend: -1, ls: { ua: down ? 0.78 : 1 }, track: 1 }; };
export const benchEq = (deg, tool) => [bench(18, 150, BT, deg, 118), ...(deg < 0 ? [roller(P => add(P.near.ankle, [-2, -7]), 5.5, { top: true })] : []),
  tool === "db" ? db(P => [P.near.grip, 0], "end", { top: true }) : bar(P => P.near.grip, 13, { top: true })];
// Vue depuis les pieds : buste raccourci, tête derrière, bras vers le plafond.
export const benchF = (down, x = 150, tool = "bar", o = {}) => ({ view: "front", nolegs: true, headBehind: true, torso: -90, neck: -90, tls: 0.3, hip: [120, 158],
  R: { wristAt: down ? [x, 122] : [x - 8, 90], hand: -90, elbowBend: -1, ls: { ua: down ? 0.85 : 1 } }, ...o,
  eq: [fbench(160, o.back), tool === "db" ? fdb("across", { top: true }) : fbar(P => P.R.grip[1], { top: true })] });
export const incF = (down, tool) => benchF(down, 150, tool, { hip: [120, 158], tls: 0.62, back: 118 });
export const BENCH_TIPS = ["Pieds à plat au sol, fesses et omoplates collées au banc.", "Coudes à environ 45° du buste, pas écartés à 90°.", "En bas, avant-bras verticaux et coudes à angle droit (90°).", "Débutant : commence avec la barre seule et fais-toi surveiller."];
// Écarté : en haut, bras quasi tendus au-dessus de la poitrine (légère flexion fixe des coudes).
// De profil, les bras s'ouvrent sur les côtés (hors du plan) : ils paraissent seulement plus courts en bas.
export const flyArms = open => () => open ? { ua: -86, fa: -94, hand: -92, ls: { ua: 0.12, fa: 0.12 } } : { ua: -86, fa: -94, hand: -92 };
// Écarté vu de dessus (animation) : allongé sur le banc, tête en haut. Bras ouverts sur les côtés, puis levés vers
// le plafond : vus d'en haut ils raccourcissent jusqu'à se rejoindre au-dessus de la poitrine (sans tourner).
export const flyTop = open => ({ view: "front", noShadow: true, torso: -90, neck: -90, hip: [120, HIPY], R: { th: 88, sh: 90, ua: 2, fa: -6, hand: 90, ls: open ? {} : { ua: -0.2, fa: -0.2 }, fore: 1 },
  eq: [raw(P => `<rect class="fg-pad" x="104" y="${(P.head[1] - 14).toFixed(1)}" width="32" height="${(P.hip[1] + 18 - P.head[1] + 14).toFixed(1)}" rx="6"/>`),
    raw(P => [P.R, P.L].map(q => { const c = q.wrist; return `<g class="fg-eq"><line class="fg-handle" x1="${c[0].toFixed(1)}" y1="${(c[1] - 9).toFixed(1)}" x2="${c[0].toFixed(1)}" y2="${(c[1] + 9).toFixed(1)}"/><rect class="fg-plate" x="${(c[0] - 8).toFixed(1)}" y="${(c[1] - 14).toFixed(1)}" width="16" height="6" rx="2"/><rect class="fg-plate" x="${(c[0] - 8).toFixed(1)}" y="${(c[1] + 8).toFixed(1)}" width="16" height="6" rx="2"/></g>`; }).join(""), { top: true })] });
export const cableFly = (py, level) => {
  const endY = { haute: 136, moyenne: 88, basse: 62 }[level], startY = { haute: 40, moyenne: 80, basse: 150 }[level];
  // Poulies moyenne et basse : bras quasi tendus (légère flexion constante), mains qui se rejoignent devant la poitrine
  // (bras dirigés vers nous, donc raccourcis sur le dessin).
  // (un raccourci négatif = le bras passe devant le corps : la main arrive à l'intérieur de l'épaule, sans jamais descendre).
  // Poulie basse : les mains montent devant le corps et se rejoignent sous le menton, sans se croiser.
  const arms = { moyenne: [{ ua: 4, fa: -4, fore: 1 }, { ua: -20, fa: -26, ls: { ua: -0.33, fa: -0.33 }, fore: 1 }], basse: [{ ua: 62, fa: 56, fore: 1 }, { ua: 36, fa: 42, hand: -90, ls: { ua: -0.33, fa: -0.33 }, fore: 1 }] }[level];
  if (arms) return arms.map(r => standF({ box: [40, -10, 200, GROUND], R: { hand: r.fa, ...r }, eq: [fcables(py)] }));
  return [
    standF({ box: [40, -10, 200, GROUND], R: { wristAt: [180, startY], hand: 0, elbowBend: 1 }, eq: [fcables(py)] }),
    standF({ box: [40, -10, 200, GROUND], R: { wristAt: [127, endY], hand: 90, elbowBend: 1 }, eq: [fcables(py)] })];
};
export const cableFlySide = level => {
  const a = { haute: [-40, 60], moyenne: [180, 0], basse: [150, -10] }[level];
  // Poulie moyenne : le bras reste à hauteur d'épaule, de l'arrière (raccourci négatif) vers l'avant.
  const back = level === "moyenne" ? { ua: 0, fa: -6, hand: -6, ls: { ua: -0.45, fa: -0.45 } } : { ua: a[0], fa: a[0] - 10, hand: a[0] - 10, ls: { ua: 0.5, fa: 0.5 } };
  return [stand({ torso: -84, near: { ...back, ankleAt: [138, ANK] }, far: { ankleAt: onToes(104, 20), ft: 20 } }),
    stand({ torso: -84, near: { ua: a[1], fa: a[1] - 6, hand: a[1] - 6, ankleAt: [138, ANK] }, far: { ankleAt: onToes(104, 20), ft: 20 } })];
};
// Bras fermés : le haut du bras vient vers nous (raccourci négatif = il passe devant), sans tourner sur lui-même.
export const pecDeckF = close => ({ view: "front", torso: -90, neck: -90, hip: [120, 150], R: { th: 90, sh: 90, ls: { th: 0.3, sh: 0.86, ...(close ? { ua: -0.3 } : {}) }, ua: 0, fa: -90, hand: -90, fore: 1 },
  eq: [fbench(158), raw(P => [P.R, P.L].map(s => `<rect class="fg-pad" x="${(s.wrist[0] - (s.k > 0 ? -3 : 9)).toFixed(1)}" y="${(s.wrist[1] - 4).toFixed(1)}" width="6" height="30" rx="3"/>`).join(""))] });
export const chestPressS = out => ({ hip: [100, 142], torso: -92, neck: -90, near: { th: 0, sh: 92, ft: 0, wristAt: out ? [156, 88] : [112, 92], hand: -90, ls: { ua: out ? 1 : 0.8 } },
  eq: [seat(86, 150, 1, 4), raw(P => { const g = P.near.grip; return `<line class="fg-rail" x1="${g[0].toFixed(1)}" y1="${(g[1] - 8).toFixed(1)}" x2="${g[0].toFixed(1)}" y2="${(g[1] + 8).toFixed(1)}"/>`; }, { top: true })] });
export const chestPressF = out => ({ view: "front", torso: -90, neck: -90, hip: [120, 150], R: { th: 90, sh: 90, ls: { th: 0.3, sh: 0.86, ...(out ? { ua: 0.3, fa: 0.3 } : {}) }, ...(out ? { ua: 170, fa: 170, hand: -90 } : { ua: 40, fa: -80, hand: -90 }) }, eq: [fbench(158)] });
