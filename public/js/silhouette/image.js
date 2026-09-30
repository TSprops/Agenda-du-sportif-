// Silhouette : une image complète (mannequin + matériel) et le cadre commun d'une vue.
import { r1 } from "./geometrie.js";
import { frontBody, solveFront } from "./mannequin-face.js";
import { sideBody, solveSide } from "./mannequin-profil.js";

/* ---------- Une image : mannequin + matériel ---------- */
// pose.eq : liste de fonctions (P) => svg, P étant la pose résolue (articulations placées). Chaque élément peut être
// derrière le corps (par défaut), entre le corps et le bras proche (mid: true) ou devant tout (top: true).
export function solve(pose) { return pose.view === "front" ? solveFront(pose) : solveSide(pose); }
export function figure(pose, target, box) {
  const P = solve(pose), B = P.front ? frontBody(P, target || []) : sideBody(P, target || []);
  const eq = k => (pose.eq || []).filter(e => (e.top ? "top" : e.mid ? "mid" : "back") === k).map(e => (e.f || e)(P)).join("");
  return `<svg viewBox="${box.join(" ")}" class="fg" aria-hidden="true" focusable="false">
    ${pose.noShadow ? "" : `<ellipse class="fg-shadow" cx="${r1(box[0] + box[2] / 2)}" cy="${GROUND + 1}" rx="${r1(box[2] * 0.42)}" ry="3.2"/>`}
    ${eq("back")}${B.back}${B.body}${eq("mid")}${B.arm}${eq("top")}</svg>`;
}
// Cadre commun à toutes les images d'une vue (pour que départ et arrivée se superposent pile).
export const GROUND = 210;
export function frameBox(poses) {
  let x1 = 1e9, y1 = 1e9, x2 = -1e9, y2 = GROUND + 6;
  const see = (p, m = 14) => { if (!p || isNaN(p[0]) || isNaN(p[1])) return; x1 = Math.min(x1, p[0] - m); x2 = Math.max(x2, p[0] + m); y1 = Math.min(y1, p[1] - m); y2 = Math.max(y2, p[1] + m); };
  poses.forEach(q => {
    const P = solve(q);
    if (P.front) { see(P.head, 16); ["R", "L"].forEach(s => ["shoulder", "elbow", "wrist", "knee", "ankle"].forEach(j => P[s][j] && see(P[s][j]))); }
    else { see(P.head, 16); see(P.hip); see(P.sh); ["near", "far"].forEach(s => ["elbow", "wrist", "knee", "ankle", "toe", "heel"].forEach(j => see(P[s][j]))); }
    (q.box ? [q.box] : []).concat((q.eq || []).map(e => typeof e.bb === "function" ? e.bb(P) : e.bb).filter(Boolean)).forEach(b => { see([b[0], b[1]], 0); see([b[2], b[3]], 0); });
  });
  return [r1(x1), r1(y1), r1(x2 - x1), r1(y2 - y1)];
}
