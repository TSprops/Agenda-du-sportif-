// Silhouette : animation, passage fluide d'une pose à l'autre.
import { GROUND, solve } from "./image.js";

/* ---------- Animation : passage fluide d'une pose à l'autre ---------- */
// Chaque pose est d'abord ramenée à ses angles (cibles de mains et de pieds résolues), puis on interpole
// les angles : le mannequin bouge articulation par articulation, sans jamais changer de longueur.
const LIMB = ["ua", "fa", "hand", "th", "sh", "ft"];
// On garde aussi les points d'appui (main sur la barre, pied au sol) pour les suivre pendant le mouvement.
// at : position réelle de la cheville et du poignet (même donnés par des angles) pour repérer un appui immobile.
const pick = o => { const r = { h: o.h, ls: o.ls, wristAt: o.wristAt, ankleAt: o.ankleAt, elbowBend: o.elbowBend, kneeBend: o.kneeBend, track: o.track, wr: o.wrist, an: o.ankle, fore: o.fore }; LIMB.forEach(k => { if (o[k] != null && !isNaN(o[k])) r[k] = o[k]; }); return r; };
export function anglesOf(pose) {
  const P = solve(pose), base = { ...pose, head: typeof pose.head === "number" ? pose.head : undefined };
  return P.front ? { ...base, R: pick(P.R), L: pick(P.L) } : { ...base, near: pick(P.near), far: pick(P.far) };
}
const turn = (a, b, t) => a + ((((b - a) % 360) + 540) % 360 - 180) * t;
export function lerpPose(A, B, t) {
  const num = (x, y, d = 0) => (x ?? d) + ((y ?? d) - (x ?? d)) * t;
  const limb = (a = {}, b = {}, noStep) => {
    const r = { h: t < 0.5 ? a.h : b.h, ls: {}, fore: a.fore || b.fore };
    LIMB.forEach(k => { if (a[k] != null && b[k] != null) r[k] = turn(a[k], b[k], t); else if (a[k] != null || b[k] != null) r[k] = a[k] ?? b[k]; });
    ["ua", "fa", "th", "sh"].forEach(k => { const x = (a.ls || {})[k] ?? 1, y = (b.ls || {})[k] ?? 1; if (x !== 1 || y !== 1) r.ls[k] = x + (y - x) * t; });
    // Appui présent au départ et à l'arrivée : il se déplace en ligne droite et le coude / genou est recalculé
    // (la main reste sur la barre, le pied reste au sol). Sinon on interpole les angles seuls.
    // Seulement pour un appui fixe (même point au départ et à l'arrivée) ; le pli suit l'image où le membre est le plus plié.
    const same = (p, q) => p && q && Math.hypot(p[0] - q[0], p[1] - q[1]) < 3, bent = (o, x, y) => Math.abs(((((o[x] - o[y]) % 360) + 540) % 360) - 180);
    if (same(a.wristAt, b.wristAt)) { r.wristAt = a.wristAt; r.elbowBend = bent(a, "ua", "fa") >= bent(b, "ua", "fa") ? a.elbowBend : b.elbowBend; }
    // « track » : la main (et ce qu'elle tient) suit la ligne droite entre les deux images (barre collée aux jambes).
    else if ((a.track || b.track) && a.wristAt && b.wristAt) { r.wristAt = [num(a.wristAt[0], b.wristAt[0]), num(a.wristAt[1], b.wristAt[1])]; r.elbowBend = a.elbowBend ?? b.elbowBend; r.track = 1; }
    if (same(a.ankleAt, b.ankleAt)) { r.ankleAt = a.ankleAt; r.kneeBend = bent(a, "th", "sh") >= bent(b, "th", "sh") ? a.kneeBend : b.kneeBend; }
    // Pied (ou main) au même endroit dans les deux images, même s'il est donné par des angles : il ne bouge pas
    // (sinon l'interpolation des angles ferait passer le pied sous le sol). Le pli suit l'image la plus pliée.
    const side = (o, x, y) => Math.sign((((o[y] - o[x]) % 360) + 540) % 360 - 180) || 1;
    // « track » sur les pieds (saut) : la cheville suit la ligne droite entre deux cibles (elle ne passe pas dans le matériel).
    if ((a.track || b.track) && a.ankleAt && b.ankleAt && !same(a.ankleAt, b.ankleAt)) { r.ankleAt = [num(a.ankleAt[0], b.ankleAt[0]), num(a.ankleAt[1], b.ankleAt[1])]; r.kneeBend = bent(a, "th", "sh") >= bent(b, "th", "sh") ? a.kneeBend : b.kneeBend; r.track = 1; }
    // Pour le pied, un petit glissement (moins de 12) est suivi en ligne droite.
    const near12 = a.an && b.an && Math.hypot(a.an[0] - b.an[0], a.an[1] - b.an[1]) < 12;
    // Pied qui passe d'un appui au sol à un autre (pas, saut vers l'arrière) : ligne droite un peu levée au milieu,
    // pour qu'il ne passe jamais sous le sol.
    const low = q => q && q[1] > GROUND - 32;
    if (!r.ankleAt && !noStep && !same(a.ankleAt, b.ankleAt) && !near12 && low(a.an) && low(b.an) && a.th != null && b.th != null) {
      const d = Math.hypot(a.an[0] - b.an[0], a.an[1] - b.an[1]), o2 = bent(a, "th", "sh") >= bent(b, "th", "sh") ? a : b;
      r.ankleAt = [num(a.an[0], b.an[0]), num(a.an[1], b.an[1]) - Math.min(32, d * 0.3) * Math.sin(Math.PI * t)];
      r.kneeBend = o2.kneeBend && o2.ankleAt ? o2.kneeBend : side(o2, "th", "sh");
    }
    if (!r.ankleAt && !same(a.ankleAt, b.ankleAt) && near12 && a.th != null && b.th != null) { const o2 = bent(a, "th", "sh") >= bent(b, "th", "sh") ? a : b; r.ankleAt = [num(a.an[0], b.an[0]), num(a.an[1], b.an[1])]; r.kneeBend = o2.kneeBend && o2.ankleAt ? o2.kneeBend : side(o2, "th", "sh"); }
    if (!r.wristAt && same(a.wr, b.wr) && a.ua != null && b.ua != null) { const o2 = bent(a, "ua", "fa") >= bent(b, "ua", "fa") ? a : b; r.wristAt = a.wr; r.elbowBend = o2.elbowBend && o2.wristAt ? o2.elbowBend : side(o2, "ua", "fa"); }
    return r;
  };
  const o = { ...(t < 0.5 ? A : B), hip: [num(A.hip[0], B.hip[0]), num(A.hip[1], B.hip[1])], torso: turn(A.torso, B.torso, t), neck: turn(A.neck, B.neck, t),
    shrug: num(A.shrug, B.shrug), tls: num(A.tls, B.tls, 1), curl: num(A.curl, B.curl), spin: num(A.spin, B.spin) };
  if (A.head != null || B.head != null) o.head = num(A.head, B.head);
  // obj : position d'un objet lancé (ballon), en ligne droite d'une image à l'autre.
  if (A.obj && B.obj) o.obj = [num(A.obj[0], B.obj[0]), num(A.obj[1], B.obj[1])];
  // Marche (pieds à plat qui échangent leur place, un pas puis le suivant) : pas de pied levé, sinon le corps « s'assoit ».
  const cross = (p, q) => { const c = (u, v) => u && v && Math.hypot(u[0] - v[0], u[1] - v[1]) < 12; const flat = u => u && u[1] > GROUND - 14;
    return c(p.a.an, q.b.an) && c(q.a.an, p.b.an) && !c(p.a.an, p.b.an) && [p.a.an, p.b.an, q.a.an, q.b.an].every(flat); };
  if (A.view === "front") { o.R = limb(A.R, B.R); o.L = limb(A.L, B.L); }
  else { const x = cross({ a: A.near || {}, b: B.near || {} }, { a: A.far || {}, b: B.far || {} }); o.near = limb(A.near, B.near, x); o.far = limb(A.far, B.far, x); }
  return o;
}
