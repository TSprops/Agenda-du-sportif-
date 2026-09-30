// Silhouette : dessin d'un segment du corps (avec ses muscles), du short et du buste enroulé.
// Le compteur uid rend chaque identifiant SVG unique.
import { SIDE } from "./formes.js";
import { LEN, add, at, dir, mul, pt, r1 } from "./geometrie.js";

/* ---------- Dessin d'un segment ---------- */
let uid = 0;
export function seg(S, p, d, target, cls, flip, sx = 1) {
  const id = "fg" + (++uid);
  const red = Object.entries(S.mus || {}).filter(([m]) => target.includes(m)).map(([, r]) => `<path class="fg-mu" d="${r}"/>`).join("");
  return `<g transform="${at(p, d, flip)}${S.sy || sx !== 1 ? ` scale(${sx} ${S.sy || 1})` : ""}"${cls ? ` class="${cls}"` : ""}><path class="fg-sk" d="${S.d}"/>`
    + (red ? `<clipPath id="${id}"><path d="${S.d}"/></clipPath><g clip-path="url(#${id})">${red}</g>` : "")
    + (S.lines || []).map(l => `<path class="fg-ln" d="${l}"/>`).join("") + `<path class="fg-ol" d="${S.open ? S.d.replace(/A[^A]*Z$/, "") : S.d}"/></g>`;
}
// Short foncé dessiné à l'intérieur d'une forme (bassin, haut des cuisses).
export function shorts(S, p, d, rect, flip, sx = 1) {
  const id = "fs" + (++uid);
  return `<g transform="${at(p, d, flip)}${S.sy || sx !== 1 ? ` scale(${sx} ${S.sy || 1})` : ""}"><clipPath id="${id}"><path d="${S.d}"/></clipPath><g clip-path="url(#${id})"><path class="fg-short" d="${rect}"/></g><path class="fg-ol" d="${S.open ? S.d.replace(/A[^A]*Z$/, "") : S.d}"/></g>`;
}
// Buste enroulé : moitié basse (taille → hanche) posée selon « torso » ; moitié haute enroulée progressivement,
// en CURL_N tranches dont l'angle augmente peu à peu (une colonne qui s'arrondit, pas un buste plié en deux).
const CURL_N = 7;
export function curlPts(waist, torso, curl) {
  const h = LEN.torso / 2 / CURL_N, pts = [waist];
  for (let j = 0; j < CURL_N; j++) pts.push(add(pts[j], mul(dir(torso + curl * (j + 0.5) / CURL_N), h)));
  return pts;
}
export function curledTorso(P, t) {
  const half = LEN.torso / 2, h = half / CURL_N, lowSh = add(P.waist, mul(dir(P.torso), half)), loA = P.torso + 180, pts = curlPts(P.waist, P.torso, P.curl);
  // Tranche [a, b] du buste (repère du buste : x depuis l'épaule), posée avec son point x0 en p.
  const slice = (p, d, x0, a, b, inner) => { const id = "fc" + (++uid);
    return `<g transform="${at(p, d)} translate(${r1(-x0)} 0)"><clipPath id="${id}"><rect x="${r1(a - 0.7)}" y="-40" width="${r1(b - a + 1.4)}" height="80"/></clipPath><g clip-path="url(#${id})">${inner}</g></g>`; };
  let up = "";
  for (let j = CURL_N - 1; j >= 0; j--) { const x0 = half - (j + 1) * h; up += slice(pts[j + 1], P.torso + P.curl * (j + 0.5) / CURL_N + 180, x0, j === CURL_N - 1 ? -30 : x0, x0 + h, seg(SIDE.torso, [0, 0], 0, t, "").replace(/<path class="fg-(ol|ln)"[^>]*\/>/g, "")); }
  // Tranche du haut : elle garde tout ce qui dépasse côté épaule (x < 0). Pas de contour par tranche (sinon des « dents »).
  // Fond continu le long de l'arc : comble les petits écarts entre tranches côté dos quand l'enroulement est fort.
  // (décalé vers le dos, là où le buste est le plus épais)
  // Épaisseur et décalage proportionnels à l'enroulement : discret pour un crunch, plus large pour un dos très arrondi.
  const k = Math.min(1, Math.abs(P.curl) / 90), w = 22 + 6 * k;
  const arc = `M${pts.map((p, j) => pt(add(p, mul(dir(P.torso + P.curl * Math.min(j, CURL_N - 0.5) / CURL_N - 90), 2.8 * k)))).join("L")}`;
  return `<path class="fg-spine-o" d="${arc}" stroke-width="${r1(w + 2.2)}"/><path class="fg-spine" d="${arc}" stroke-width="${r1(w)}"/>${slice(lowSh, loA, 0, half, 80, seg(SIDE.torso, [0, 0], 0, t, "") + shorts(SIDE.torso, [0, 0], 0, "M42 -22H66V22H42Z"))}${up}`;
}
