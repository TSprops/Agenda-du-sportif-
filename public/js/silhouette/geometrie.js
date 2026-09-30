// Silhouette : longueurs des os, calculs d'angles et cinématique inverse.

export const LEN = { torso: 52, neck: 9, ua: 31, fa: 27, th: 46, sh: 44, torsoF: 56 };
const rad = d => d * Math.PI / 180;
export const dir = d => [Math.cos(rad(d)), Math.sin(rad(d))];
export const add = (a, b) => [a[0] + b[0], a[1] + b[1]], sub = (a, b) => [a[0] - b[0], a[1] - b[1]], mul = (a, k) => [a[0] * k, a[1] * k];
export const r1 = n => Math.round(n * 10) / 10, pt = p => `${r1(p[0])} ${r1(p[1])}`;
export const at = (p, d, flip) => `translate(${pt(p)}) rotate(${r1(d)})${flip ? " scale(1 -1)" : ""}`;
export const rot = (v, d) => { const c = Math.cos(rad(d)), s = Math.sin(rad(d)); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; };
export const angleOf = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;
/* ---------- Cinématique inverse ---------- */
// Deux os (l1, l2) de « from » vers « to » : renvoie [angle1, angle2]. bend = +1 ou -1 (côté de la pliure).
export function ik(from, to, l1, l2, bend) {
  l1 = Math.max(l1, 0.5); l2 = Math.max(l2, 0.5);   // os presque vu de bout : jamais de longueur nulle
  const v = sub(to, from), d = Math.min(Math.max(Math.hypot(v[0], v[1]), Math.abs(l1 - l2) + 0.01), l1 + l2 - 0.01);
  const base = Math.atan2(v[1], v[0]) * 180 / Math.PI, a = Math.acos((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)) * 180 / Math.PI;
  const a1 = base - bend * a, j = add(from, mul(dir(a1), l1));
  return [a1, angleOf(j, to)];
}
// Membre : angles donnés (ua/fa, th/sh) ou cibles (wristAt, ankleAt) résolues par cinématique inverse.
// ls : raccourcissement apparent d'un os qui sort du plan (ex. { ua: 0.7 } = bras écarté du corps).
export function limbAngles(o, shoulder, hip) {
  const ls = o.ls || {}, q = { ...o };
  if (o.wristAt) [q.ua, q.fa] = ik(shoulder, o.wristAt, LEN.ua * (ls.ua ?? 1), LEN.fa * (ls.fa ?? 1), o.elbowBend || -1);
  if (o.ankleAt) [q.th, q.sh] = ik(hip, o.ankleAt, LEN.th * (ls.th ?? 1), LEN.sh * (ls.sh ?? 1), o.kneeBend || 1);
  if (q.hand == null && q.fa != null) q.hand = q.fa;   // main dans l'axe de l'avant-bras par défaut
  return q;
}
