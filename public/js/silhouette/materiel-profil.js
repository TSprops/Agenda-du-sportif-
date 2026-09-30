// Silhouette : matériel dessiné de profil (barre, haltères, bancs, poulies…).
import { add, at, dir, mul, r1, rot } from "./geometrie.js";
import { GROUND } from "./image.js";

/* ---------- Matériel (profil) ---------- */
export const E = (f, o = {}) => ({ f, ...o });
const BB = (e, bb) => ({ ...e, bb });
export const G = GROUND;
// Barre vue en coupe (bout de la barre avec ses disques) ; r = rayon du disque.
export const bar = (at, r = 13, o) => E(P => { const c = typeof at === "function" ? at(P) : at; return `<g class="fg-eq${o && o.top ? " fg-ghost" : ""}"><circle class="fg-plate" cx="${r1(c[0])}" cy="${r1(c[1])}" r="${r}"/><circle class="fg-plate-in" cx="${r1(c[0])}" cy="${r1(c[1])}" r="${r * 0.62}"/><circle class="fg-hub" cx="${r1(c[0])}" cy="${r1(c[1])}" r="2.6"/></g>`; }, o);
// Haltère. mode "end" : poignée vers nous (on voit un disque) ; "side" : poignée dans le plan, perpendiculaire à l'avant-bras.
export const db = (at, mode = "end", o) => E(P => {
  const [c, a] = typeof at === "function" ? at(P) : at;
  if (mode === "end") return `<g class="fg-eq"><circle class="fg-plate" cx="${r1(c[0])}" cy="${r1(c[1])}" r="8.5"/><circle class="fg-plate-in" cx="${r1(c[0])}" cy="${r1(c[1])}" r="5"/><circle class="fg-hub" cx="${r1(c[0])}" cy="${r1(c[1])}" r="2.2"/></g>`;
  const n = dir(a + 90), p1 = add(c, mul(n, -12)), p2 = add(c, mul(n, 12));
  const plate = k => `<g transform="${at_(add(c, mul(n, k)), a)}"><rect class="fg-plate" x="-10" y="-3.2" width="20" height="6.4" rx="2.4"/></g>`;
  return `<g class="fg-eq"><line class="fg-handle" x1="${r1(p1[0])}" y1="${r1(p1[1])}" x2="${r1(p2[0])}" y2="${r1(p2[1])}"/>${plate(-9.5)}${plate(9.5)}</g>`;
}, o);
const at_ = (p, d) => at(p, d);
export const kb = (at, o) => E(P => { const c = typeof at === "function" ? at(P) : at; return `<g class="fg-eq"><path class="fg-kbh" d="M${r1(c[0] - 5)} ${r1(c[1] + 4)}Q${r1(c[0] - 5)} ${r1(c[1] - 3)} ${r1(c[0])} ${r1(c[1] - 3)}Q${r1(c[0] + 5)} ${r1(c[1] - 3)} ${r1(c[0] + 5)} ${r1(c[1] + 4)}"/><circle class="fg-plate" cx="${r1(c[0])}" cy="${r1(c[1] + 11)}" r="9"/></g>`; }, o);
export const medball = (at, o, r = 9) => E(P => { const c = typeof at === "function" ? at(P) : at; return `<g class="fg-eq"><circle class="fg-ball" cx="${r1(c[0])}" cy="${r1(c[1])}" r="${r}"/><path class="fg-ballln" d="M${r1(c[0] - r)} ${r1(c[1])}Q${r1(c[0])} ${r1(c[1] + r * 0.55)} ${r1(c[0] + r)} ${r1(c[1])}M${r1(c[0])} ${r1(c[1] - r)}Q${r1(c[0] - r * 0.45)} ${r1(c[1])} ${r1(c[0])} ${r1(c[1] + r)}"/></g>`; }, o);
// Banc : plat (deg 0), incliné (deg > 0, dossier relevé côté gauche) ou décliné (deg < 0). pivot = jonction assise / dossier.
const bench_ = (x1, x2, top, deg = 0, pivot) => E(() => {
  const legs = `<rect class="fg-frame" x="${x1 + 8}" y="${top + 5}" width="4" height="${G - top - 7}"/><rect class="fg-frame" x="${x2 - 12}" y="${top + 5}" width="4" height="${G - top - 7}"/>
    <rect class="fg-frame" x="${x1}" y="${G - 3}" width="22" height="4" rx="1.5"/><rect class="fg-frame" x="${x2 - 22}" y="${G - 3}" width="22" height="4" rx="1.5"/>`;
  if (!deg) return `<g class="fg-eq">${legs}<rect class="fg-frame" x="${x1 + 10}" y="${top + 20}" width="${x2 - x1 - 20}" height="3"/><rect class="fg-pad" x="${x1}" y="${top}" width="${x2 - x1}" height="8" rx="3.5"/><path class="fg-padhi" d="M${x1 + 4} ${top + 2}H${x2 - 4}"/></g>`;
  const px = pivot || x1 + (x2 - x1) * 0.55, backLen = px - x1 + 6;
  const back = `<rect class="fg-pad" x="${px - backLen}" y="${top}" width="${backLen}" height="8" rx="3.5" transform="rotate(${deg} ${px} ${top + 4})"/>`;
  const tip = add([px, top + 4], rot([-backLen * 0.72, 4], deg));
  return `<g class="fg-eq">${legs}<rect class="fg-frame" x="${x1 + 10}" y="${top + 20}" width="${x2 - x1 - 20}" height="3"/><line class="fg-frame-l" x1="${r1(tip[0])}" y1="${r1(tip[1])}" x2="${r1(tip[0] + (deg > 0 ? 6 : 0))}" y2="${top + 21}"/>
    ${deg < 0 ? `<rect class="fg-pad" x="${x1}" y="${top}" width="${x2 - x1}" height="8" rx="3.5" transform="rotate(${deg} ${px} ${top + 4})"/>` : `<rect class="fg-pad" x="${px - 2}" y="${top}" width="${x2 - px + 2}" height="8" rx="3.5"/>${back}`}</g>`;
});
// Boudin (coussin rond) : blocage des pieds, des genoux, des cuisses.
export const roller = (at, r = 5.5, o) => E(P => { const c = typeof at === "function" ? at(P) : at; return `<g class="fg-eq"><circle class="fg-pad" cx="${r1(c[0])}" cy="${r1(c[1])}" r="${r}"/></g>`; }, o);
// Barre fixe vue en coupe, avec son montant.
const pullbar_ = (x, y) => E(() => `<g class="fg-eq"><rect class="fg-frame fg-dim" x="${x - 2}" y="${y}" width="4" height="${G - y}"/><rect class="fg-frame" x="${x - 12}" y="${G - 3}" width="24" height="4" rx="1.5"/><circle class="fg-barcut" cx="${x}" cy="${y}" r="3.6"/></g>`);
// Barres parallèles (dips) vues de profil : la barre va d'avant en arrière.
const dipbars_ = (x1, x2, y) => E(() => `<g class="fg-eq"><rect class="fg-frame" x="${x1}" y="${y}" width="4" height="${G - y}"/><rect class="fg-frame" x="${x2 - 4}" y="${y}" width="4" height="${G - y}"/><rect class="fg-frame" x="${x1 - 6}" y="${G - 3}" width="16" height="4" rx="1.5"/><rect class="fg-frame" x="${x2 - 10}" y="${G - 3}" width="16" height="4" rx="1.5"/><rect class="fg-grip" x="${x1 - 2}" y="${y - 2.5}" width="${x2 - x1 + 4}" height="5" rx="2.5"/></g>`);
// Anneaux : sangle depuis le haut, anneau tenu dans la main.
export const rings = (who = "near", o) => E(P => { const c = P[who].grip; return `<g class="fg-eq"><line class="fg-strap" x1="${r1(c[0])}" y1="${r1(c[1] - 7)}" x2="${r1(c[0])}" y2="-40"/><circle class="fg-ring" cx="${r1(c[0])}" cy="${r1(c[1])}" r="6.5"/></g>`; }, o);
// Colonne de poulie : montant, pile de poids, poulie à la hauteur py, câble jusqu'à la poignée.
export const cable = (x, py, handle = "bar", who = "near", o) => BB(E(P => {
  const g = typeof who === "function" ? who(P) : P[who].grip, px = x - 4;
  const hd = handle === "rope" ? `<path class="fg-rope" d="M${r1(g[0])} ${r1(g[1])}l-2 7M${r1(g[0])} ${r1(g[1])}l3 6.4"/>` : handle === "bar" ? `<circle class="fg-barcut" cx="${r1(g[0])}" cy="${r1(g[1])}" r="3"/>` : `<path class="fg-dhandle" d="M${r1(g[0] - 4)} ${r1(g[1] - 3)}h8v6h-8Z"/>`;
  return `<g class="fg-eq"><rect class="fg-frame" x="${x}" y="${Math.min(py, 40) - 14}" width="10" height="${G - Math.min(py, 40) + 14}"/><rect class="fg-stack" x="${x + 1.5}" y="${G - 58}" width="7" height="50"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path class="fg-stackln" d="M${x + 1.5} ${G - 52 + i * 6}h7"/>`).join("")}<rect class="fg-frame" x="${x - 12}" y="${G - 3}" width="34" height="4" rx="1.5"/>
    <circle class="fg-pulley" cx="${px}" cy="${py}" r="4.4"/><line class="fg-cable" x1="${px}" y1="${py}" x2="${r1(g[0])}" y2="${r1(g[1])}"/>${hd}</g>`;
}, o), [x - 12, py - 6, x + 22, GROUND]);
// Poulie au-dessus de la personne (tirage vertical) : poutre en haut, câble vertical jusqu'à la barre.
export const cableTop = (x, topY, towerX, who = "near") => E(P => {
  const g = P[who].grip;
  return `<g class="fg-eq"><rect class="fg-frame" x="${towerX}" y="${topY - 10}" width="10" height="${G - topY + 10}"/><rect class="fg-frame" x="${Math.min(x, towerX) - 6}" y="${topY - 10}" width="${Math.abs(towerX - x) + 16}" height="6"/>
    <rect class="fg-stack" x="${towerX + 1.5}" y="${G - 58}" width="7" height="50"/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<path class="fg-stackln" d="M${towerX + 1.5} ${G - 52 + i * 6}h7"/>`).join("")}
    <circle class="fg-pulley" cx="${x}" cy="${topY}" r="4.4"/><line class="fg-cable" x1="${x}" y1="${topY}" x2="${r1(g[0])}" y2="${r1(g[1])}"/><circle class="fg-barcut" cx="${r1(g[0])}" cy="${r1(g[1])}" r="3"/></g>`;
});
// Siège de machine avec dossier (deg : inclinaison du dossier vers l'arrière).
const seat_ = (x, y, back = 1, deg = 12) => E(() => `<g class="fg-eq"><rect class="fg-frame" x="${x + 10}" y="${y + 6}" width="4" height="${G - y - 6}"/><rect class="fg-frame" x="${x - 4}" y="${G - 3}" width="32" height="4" rx="1.5"/>
  <rect class="fg-pad" x="${x - 4}" y="${y}" width="30" height="8" rx="3.5"/>${back ? `<rect class="fg-pad" x="${x - 8}" y="${y - 44}" width="8" height="48" rx="3.5" transform="rotate(${-deg} ${x - 4} ${y + 2})"/>` : ""}</g>`);
const box_ = (x, y, w, h) => E(() => `<g class="fg-eq"><rect class="fg-box" x="${x}" y="${y}" width="${w}" height="${h}" rx="2.5"/><path class="fg-boxln" d="M${x + 4} ${y + 5}H${x + w - 4}"/></g>`);
const wall_ = (x, targetY) => E(() => `<g class="fg-eq"><rect class="fg-wall" x="${x}" y="-60" width="8" height="${G + 60}"/>${targetY != null ? `<circle class="fg-target" cx="${x - 1}" cy="${targetY}" r="7"/><circle class="fg-target-in" cx="${x - 1}" cy="${targetY}" r="3"/>` : ""}</g>`);
export const climbRope = x => E(() => `<g class="fg-eq"><line class="fg-climb" x1="${x}" y1="-60" x2="${x}" y2="${G}"/></g>`);
export const wheel = (who = "near") => E(P => { const c = add(P[who].grip, [0, 3]); return `<g class="fg-eq"><circle class="fg-plate" cx="${r1(c[0])}" cy="${r1(c[1])}" r="8.5"/><circle class="fg-hub" cx="${r1(c[0])}" cy="${r1(c[1])}" r="2.4"/></g>`; }, { top: true });
export const line = (a, b, cls = "fg-frame-l") => E(() => `<line class="${cls}" x1="${a[0]}" y1="${a[1]}" x2="${b[0]}" y2="${b[1]}"/>`);
export const pad = (x, y, w, h, deg = 0) => E(() => `<rect class="fg-pad" x="${x}" y="${y}" width="${w}" height="${h}" rx="${Math.min(w, h) / 2.2}" transform="rotate(${deg} ${x + w / 2} ${y + h / 2})"/>`);
export const raw = (f, o) => E(f, o);
export const bench = (x1, x2, top, deg = 0, pivot) => BB(bench_(x1, x2, top, deg, pivot), [x1, top - (deg > 0 ? (pivot || x1 + (x2 - x1) * 0.55) - x1 : 0), x2, GROUND]);
export const pullbar = (x, y) => BB(pullbar_(x, y), [x - 12, y - 4, x + 12, GROUND]);
export const dipbars = (x1, x2, y) => BB(dipbars_(x1, x2, y), [x1 - 6, y - 3, x2 + 6, GROUND]);
export const seat = (x, y, back = 1, deg = 12) => BB(seat_(x, y, back, deg), [x - 12, y - (back ? 46 : 0), x + 28, GROUND]);
export const box = (x, y, w, h) => BB(box_(x, y, w, h), [x, y, x + w, y + h]);
export const wall = (x, targetY) => BB(wall_(x, targetY), [x - 2, targetY != null ? targetY - 10 : GROUND - 20, x + 8, GROUND]);
// Poteau vertical (drapeau) et ceinture de lest (chaîne + disque qui pend entre les jambes).
export const pole = x => BB(E(() => `<g class="fg-eq"><rect class="fg-frame" x="${x - 3}" y="-60" width="6" height="${G + 60}"/><rect class="fg-frame" x="${x - 14}" y="${G - 3}" width="28" height="4" rx="1.5"/></g>`), [x - 14, GROUND - 10, x + 14, GROUND]);
export const beltSide = () => E(P => { const a = add(P.hip, [7, 9]), b = add(P.hip, [9, 36]); return `<g class="fg-eq"><line class="fg-chain" x1="${r1(a[0])}" y1="${r1(a[1])}" x2="${r1(b[0])}" y2="${r1(b[1])}"/><rect class="fg-plate" x="${r1(b[0] - 3)}" y="${r1(b[1])}" width="6" height="24" rx="2"/></g>`; }, { top: true });
