// Silhouettes des exercices (« Comment faire ») : un mannequin gris articulé, dessiné en SVG.
// Chaque partie du corps a une LONGUEUR FIXE et une forme dessinée une seule fois (avec ses lignes de muscles) ;
// une pose ne donne que des ANGLES, donc les proportions restent humaines et le corps ne peut pas se déformer.
// Angles en degrés à l'écran : 0 = vers la droite, 90 = vers le bas, -90 = vers le haut, 180 = vers la gauche.
// Profil : le mannequin regarde toujours vers la droite. Repère local d'un segment : x le long du segment,
// +y côté dos, -y côté ventre. Seuls les muscles travaillés (principaux) sont colorés, aux couleurs du thème.
// Ce fichier n'utilise que ses propres valeurs : il peut être importé par n'importe quel autre.

export const LEN = { torso: 52, neck: 9, ua: 31, fa: 27, th: 46, sh: 44, torsoF: 56 };
const rad = d => d * Math.PI / 180;
export const dir = d => [Math.cos(rad(d)), Math.sin(rad(d))];
export const add = (a, b) => [a[0] + b[0], a[1] + b[1]], sub = (a, b) => [a[0] - b[0], a[1] - b[1]], mul = (a, k) => [a[0] * k, a[1] * k];
const r1 = n => Math.round(n * 10) / 10, pt = p => `${r1(p[0])} ${r1(p[1])}`;
const at = (p, d, flip) => `translate(${pt(p)}) rotate(${r1(d)})${flip ? " scale(1 -1)" : ""}`;
export const rot = (v, d) => { const c = Math.cos(rad(d)), s = Math.sin(rad(d)); return [v[0] * c - v[1] * s, v[0] * s + v[1] * c]; };
export const angleOf = (a, b) => Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI;

/* ---------- Formes du profil ---------- */
const SIDE = {
  ua: { open: 1, d: "M0 -7.5Q14 -9.8 31 -4.6A4.7 4.7 0 0 1 31 4.8Q10 10.8 0 8.5A8 8 0 0 1 0 -7.5Z",
    lines: ["M9 3.2Q19 6.2 27 4.2", "M7 -4Q18 -6 26 -3.2"],
    mus: { triceps: "M2 1.2Q16 2.8 30 2.2L33 6Q10 12 0 9Z", biceps: "M3 -1Q16 -1 30 -1.2L33 -6Q14 -11 0 -8Z" } },
  delt: { d: "M-7 -8Q6 -12 15 -4Q13 3 15 8Q4 11.5 -7 8A8 8 0 0 1 -7 -8Z", lines: ["M11 -6Q8 0 12 7"], mus: { epaules: "M-8 -13H17V13H-8Z" } },
  fa: { open: 1, d: "M0 -4.9Q8 -6.6 27 -2.8A2.8 2.8 0 0 1 27 2.8Q8 5.9 0 4.9A4.9 4.9 0 0 1 0 -4.9Z",
    lines: ["M2 -1.4Q12 0.2 23 -0.4"], mus: { avantbras: "M-5 -8H30V8H-5Z" } },
  th: { open: 1, d: "M0 -9.6Q22 -11.8 46 -5.6A5.6 5.6 0 0 1 46 5.6Q18 10.8 0 10A9.8 9.8 0 0 1 0 -9.6Z",
    lines: ["M6 -4Q24 -2.6 40 -3", "M29 -9Q38 -6.5 42.5 -2", "M8 5Q24 5.4 42 3.6"],
    mus: { quadriceps: "M-2 -13Q22 -14 49 -7L49 -0.5Q24 -1.5 -2 -2.5Z", ischios: "M-2 3.5Q24 4 49 2.5L49 8Q18 13 -2 12Z" } },
  sh: { open: 1, d: "M0 -5.4Q22 -4.8 44 -3.2A3.2 3.2 0 0 1 44 3.2Q30 3.8 20 6.6Q8 9.2 0 5.6A5.5 5.5 0 0 1 0 -5.4Z",
    lines: ["M3 3.4Q12 7.6 24 4.9", "M6 -2.4Q22 -1.4 38 -1.6"], mus: { mollets: "M0 1.6Q12 1.2 27 3.4Q18 9 6 10Q0 9 0 1.6Z" } },
  torso: { sy: 1.2, d: "M0 -10Q12 -16 22 -11.6Q36 -9.2 52 -11A11 11 0 0 1 52 11Q38 12.4 30 10.2Q14 14.8 0 11A10.5 10.5 0 0 1 0 -10Z",
    lines: ["M3 -9.5Q14 -15 21.5 -11", "M20 -5.5Q23 -9 22.5 -11.5", "M25.5 -10.6V-6.2", "M32.5 -9.8V-5.6", "M39.5 -10.2V-6", "M24 -7.8Q36 -7.6 48 -9", "M28 -3.8Q38 0 46 4", "M5 8.6Q18 5.8 30 7.4", "M36 8.6Q44 7 50 8"],
    mus: { pecs: "M-2 -18Q12 -19 23 -13L22 -4.5Q10 -3.5 -2 -5Z", abdos: "M23 -14Q36 -12 55 -14L55 -5.5Q36 -4.5 23 -5.5Z", obliques: "M26 -5Q40 -3 50 5L42 7Q34 1 24 0Z",
      dorsaux: "M2 5Q16 2 33 5L33 16Q14 18 -2 14Z", lombaires: "M33 5Q43 4 56 6L56 16Q38 16 31 13Z", trapezes: "M-8 3Q2 2 8 5L8 16H-8Z" } },
  neck: { d: "M-1 -4.2L10 -3.6A3.6 3.6 0 0 1 10 3.6L-1 4.6Z", lines: ["M1 -2.4L9 1.5"] },
  head: { d: "M-9 -4Q-10 -17 1 -17Q11 -17 11 -6L12.6 0.4L10.6 2Q11 6 9 8.6Q5 11.2 0 9.6Q-6 9 -8 4Q-10 0 -9 -4Z",
    lines: ["M5 -2.6L8 -2.6", "M8.6 5.4Q7 6.8 5.6 6.4", "M-3.4 -3.4Q0 -3.8 -0.2 0Q0 3.2 -3 2.6"] },
  hair: "M-9 -4Q-10 -17 1 -17Q9 -17 10.6 -9.4Q2 -12.6 -4 -9Q-7 -6.4 -9 -4Z",
  // Pied : repère de la cheville, x vers les orteils, +y vers la semelle.
  foot: { d: "M-4 -4Q6 -4.4 14 -0.4Q22 1.6 24.4 4.6Q24.6 7.2 20.4 7.2L-3 7.2Q-7.4 6.4 -6.2 1Q-6 -2.6 -4 -4Z", lines: ["M17 2.6L18.2 7"] },
  // Main fermée : repère du poignet, x vers les doigts ; les doigts entourent ce qui est tenu au point (6, 0).
  fist: { d: "M-1 -3.6L7 -4Q11.4 -3.8 11.4 0Q11.4 4 7 4.2L-1 3.6Z", lines: ["M7.2 -3.8Q9.6 0 7.2 4", "M3.6 -3.7V3.8"] },
  // Main à plat (appui au sol ou sur un banc) : x vers les doigts, +y côté paume.
  flat: { d: "M-1.2 -2.8L11 -2.2Q14.4 -1.4 14.4 1Q14.4 2.8 11 2.8L-1.2 3Z", lines: ["M8 -2.3V2.8"] },
  // Main ouverte, doigts tendus (saut, équilibre).
  open: { d: "M-1 -3.2L9 -2.8Q15 -2.4 15.4 0Q15 2.4 9 2.8L-1 3.2Z", lines: ["M9 -1V1"] }
};

/* ---------- Formes de face (symétriques ; côté gauche de l'image = miroir) ---------- */
const FRONT = {
  ua: { open: 1, d: "M0 -7.8Q16 -8.8 31 -5A5 5 0 0 1 31 5Q16 8.8 0 7.8A7.8 7.8 0 0 1 0 -7.8Z",
    lines: ["M7 -1.5Q17 -5.5 27 -1.5", "M8 2Q18 4.5 27 2"], mus: { biceps: "M5 -4Q17 -8 29 -3L29 3Q17 7 5 4Z" } },
  delt: { d: "M-4 -8Q5 -9.6 11 -4.4Q12 0 11 4.4Q5 9.6 -4 8A8 8 0 0 1 -4 -8Z", lines: ["M8 -5.6Q10 0 8 5.6"], mus: { epaules: "M-8 -13H17V13H-8Z" } },
  fa: { open: 1, d: "M0 -5.2Q6 -6.4 27 -3A3 3 0 0 1 27 3Q6 6.2 0 5.2A5.2 5.2 0 0 1 0 -5.2Z", lines: ["M3 -2Q14 0 24 0"], mus: { avantbras: "M-5 -8H30V8H-5Z" } },
  th: { open: 1, d: "M0 -10.5Q16 -12 46 -6A6 6 0 0 1 46 6Q20 9.4 0 10.5A10.5 10.5 0 0 1 0 -10.5Z",
    lines: ["M4 -1Q24 -2 40 -1", "M30 6Q38 7.4 43 3", "M8 -6Q26 -7.5 42 -4"], mus: { quadriceps: "M-2 -13Q20 -14 49 -7L49 5Q30 7 -2 2Z" } },
  sh: { open: 1, d: "M0 -5.6Q14 -6.6 44 -3.4A3.4 3.4 0 0 1 44 3.4Q14 7.4 0 5.6A5.6 5.6 0 0 1 0 -5.6Z",
    lines: ["M4 0.4L40 0.4", "M4 3Q12 7 22 4"], mus: { mollets: "M1 1.5Q12 2 24 3L24 9H1Z" } },
  torso: { d: "M0 -6Q2 -16 4 -19Q10 -19.8 12 -17.6Q26 -16.6 38 -13.6Q46 -13 52 -15.6Q56 -10 58 0Q56 10 52 15.6Q46 13 38 13.6Q26 16.6 12 17.6Q10 19.8 4 19Q2 16 0 6Z",
    lines: ["M9 -1Q18 -2 20.5 -14", "M9 1Q18 2 20.5 14", "M6 0L20 0", "M20 0L51 0", "M26 -6.4L26 6.4", "M33 -6.8L33 6.8", "M40 -6.8L40 6.8", "M22 -7Q36 -7.6 50 -6.4", "M22 7Q36 7.6 50 6.4",
      "M13 -17Q22 -15.2 28 -13.4", "M13 17Q22 15.2 28 13.4", "M44 -12Q52 -6 56 -2", "M44 12Q52 6 56 2", "M3 -6Q2.6 -12 4.4 -17", "M3 6Q2.6 12 4.4 17"],
    mus: { pecs: "M3 -20Q18 -21 21 -14Q21 -3 20 0Q21 3 21 14Q18 21 3 20Z", abdos: "M21 -7.4H52V7.4H21Z", obliques: "M24 -7Q38 -7.6 52 -6L52 -18L24 -18ZM24 7Q38 7.6 52 6L52 18L24 18Z",
      dorsaux: "M12 -30L30 -30L30 -14.6Q22 -16 12 -17.4ZM12 30L30 30L30 14.6Q22 16 12 17.4Z", trapezes: "M-4 -20L6 -20Q3 -12 3 -5L-4 -5ZM-4 20L6 20Q3 12 3 5L-4 5Z" } },
  neck: { d: "M-1 -5L10 -4.4A4.4 4.4 0 0 1 10 4.4L-1 5Z", lines: ["M1 -3L8 -1", "M1 3L8 1"] },
  head: { d: "M0 -12.6Q10 -12.6 10 0Q10 9 5 12Q2.6 13.6 0 13.6Q-2.6 13.6 -5 12Q-10 9 -10 0Q-10 -12.6 0 -12.6Z",
    lines: ["M-5.4 -0.6H-2.4", "M2.4 -0.6H5.4", "M0 1L-0.8 5H0.8", "M-2.6 8.4Q0 9.6 2.6 8.4"] },
  hair: "M-10 -1Q-10.6 -12.6 0 -12.8Q10.6 -12.6 10 -1Q8 -7.4 0 -7.6Q-8 -7.4 -10 -1Z",
  // Tête penchée vers le sol, vue de face (pompes) : on voit le dessus du crâne (cheveux), le front juste en bas.
  crown: "M-10 0Q-10 -12.6 0 -12.6Q10 -12.6 10 0Q10 6.4 7.6 9Q0 6.2 -7.6 9Q-10 6.4 -10 0Z", crownLines: ["M0 -12.4Q-1.4 -3 0.6 5.6", "M-6.6 -8Q-4 -1 -5.4 6", "M6.6 -8Q4 -1 5.4 6"],
  fist: SIDE.fist, flat: SIDE.flat, open: SIDE.open,
  // Main posée à plat au sol, vue de face : doigts vers nous (paume raccourcie, doigts écartés côte à côte).
  palm: { d: "M-1 -6.2Q3 -6.8 6 -5.6L6.6 5.6Q3 6.8 -1 6.2Z", lines: ["M3 -3.1L6.3 -3.1", "M3 0L6.4 0", "M3 3.1L6.3 3.1"] }
};

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
function limbAngles(o, shoulder, hip) {
  const ls = o.ls || {}, q = { ...o };
  if (o.wristAt) [q.ua, q.fa] = ik(shoulder, o.wristAt, LEN.ua * (ls.ua ?? 1), LEN.fa * (ls.fa ?? 1), o.elbowBend || -1);
  if (o.ankleAt) [q.th, q.sh] = ik(hip, o.ankleAt, LEN.th * (ls.th ?? 1), LEN.sh * (ls.sh ?? 1), o.kneeBend || 1);
  if (q.hand == null && q.fa != null) q.hand = q.fa;   // main dans l'axe de l'avant-bras par défaut
  return q;
}

/* ---------- Dessin d'un segment ---------- */
let uid = 0;
function seg(S, p, d, target, cls, flip, sx = 1) {
  const id = "fg" + (++uid);
  const red = Object.entries(S.mus || {}).filter(([m]) => target.includes(m)).map(([, r]) => `<path class="fg-mu" d="${r}"/>`).join("");
  return `<g transform="${at(p, d, flip)}${S.sy || sx !== 1 ? ` scale(${sx} ${S.sy || 1})` : ""}"${cls ? ` class="${cls}"` : ""}><path class="fg-sk" d="${S.d}"/>`
    + (red ? `<clipPath id="${id}"><path d="${S.d}"/></clipPath><g clip-path="url(#${id})">${red}</g>` : "")
    + (S.lines || []).map(l => `<path class="fg-ln" d="${l}"/>`).join("") + `<path class="fg-ol" d="${S.open ? S.d.replace(/A[^A]*Z$/, "") : S.d}"/></g>`;
}
// Short foncé dessiné à l'intérieur d'une forme (bassin, haut des cuisses).
function shorts(S, p, d, rect, flip, sx = 1) {
  const id = "fs" + (++uid);
  return `<g transform="${at(p, d, flip)}${S.sy || sx !== 1 ? ` scale(${sx} ${S.sy || 1})` : ""}"><clipPath id="${id}"><path d="${S.d}"/></clipPath><g clip-path="url(#${id})"><path class="fg-short" d="${rect}"/></g><path class="fg-ol" d="${S.open ? S.d.replace(/A[^A]*Z$/, "") : S.d}"/></g>`;
}

/* ---------- Mannequin de profil ---------- */
// pose = { hip:[x,y], torso (hanche → épaule), neck, head? (inclinaison), near:{ua,fa,hand,th,sh,ft,h?}, far:{…} (par défaut = near) }
// h : "fist" (main fermée, par défaut), "flat" (à plat), "open" (ouverte).
export function solveSide(pose) {
  // shrug : épaules haussées (la tête ne bouge pas, le cou raccourcit).
  // curl : le haut du dos s'enroule à partir de la taille (crunch) ; le bas du buste garde l'angle « torso ».
  const hip = pose.hip, waist = add(hip, mul(dir(pose.torso), LEN.torso / 2));
  const sh = pose.curl ? curlPts(waist, pose.torso, pose.curl).at(-1) : add(hip, mul(dir(pose.torso), LEN.torso + (pose.shrug || 0)));
  const side = o0 => {
    const o = limbAngles(o0, sh, hip), ls = o.ls || {};
    const elbow = add(sh, mul(dir(o.ua), LEN.ua * (ls.ua ?? 1))), wrist = add(elbow, mul(dir(o.fa), LEN.fa * (ls.fa ?? 1)));
    const knee = add(hip, mul(dir(o.th), LEN.th * (ls.th ?? 1))), ankle = add(knee, mul(dir(o.sh), LEN.sh * (ls.sh ?? 1)));
    // grip : point tenu par la main (centre du poing), toe : bout du pied, sole : dessous du talon.
    return { ...o, elbow, wrist, knee, ankle, grip: add(wrist, mul(dir(o.hand), 5.5)), toe: add(ankle, rot([23, 5], o.ft)), heel: add(ankle, rot([-4, 7], o.ft)) };
  };
  // Côté éloigné : reprend le côté proche, sauf ce qui est redonné (un angle redonné remplace la cible héritée).
  const fo = { ...pose.near, ...(pose.far || {}) }, pf = pose.far || {};
  if (pf.th != null && !pf.ankleAt) delete fo.ankleAt;
  if (pf.ua != null && !pf.wristAt) delete fo.wristAt;
  const near = side(pose.near), far = side(fo);
  const neckEnd = add(sh, mul(dir(pose.neck), LEN.neck - (pose.shrug || 0))), headRot = pose.neck + 90 + (pose.head || 0);
  return { ...pose, sh, waist, neckEnd, headRot, head: add(neckEnd, rot([2, -9.4], headRot)), near, far };
}
function sideBody(P, target) {
  const t = target, none = [];
  const L = (o, k) => (o.ls || {})[k] ?? 1;
  const leg = (o, cls, tt) => `${seg(SIDE.th, P.hip, o.th, tt, cls, 0, L(o, "th"))}${seg(SIDE.sh, o.knee, o.sh, tt, cls, 0, L(o, "sh"))}${seg(SIDE.foot, o.ankle, o.ft, none, cls)}`;
  const arm = (o, cls, tt) => `${seg(SIDE.delt, P.sh, o.ua, tt, cls)}${seg(SIDE.ua, P.sh, o.ua, tt, cls, 0, L(o, "ua"))}${seg(SIDE.fa, o.elbow, o.fa, tt, cls, 0, L(o, "fa"))}${seg(SIDE[o.h || "fist"], o.wrist, o.hand, none, cls)}`;
  const farT = P.farWorks === false ? none : t;
  return {
    back: `${arm(P.far, "fg-far", farT)}${leg(P.far, "fg-far", farT)}`,
    body: `${leg(P.near, "", t)}${shorts(SIDE.th, P.hip, P.near.th, "M-12 -15H16Q17 0 16 15H-12Z", 0, L(P.near, "th"))}
      ${P.curl ? curledTorso(P, t) : `${seg(SIDE.torso, P.sh, P.torso + 180, t, "", 0, 1 + (P.shrug || 0) / LEN.torso)}${shorts(SIDE.torso, P.sh, P.torso + 180, "M42 -22H66V22H42Z", 0, 1 + (P.shrug || 0) / LEN.torso)}`}
      ${seg(SIDE.neck, P.sh, P.neck, none, "")}
      <g transform="${at(P.head, P.headRot)}"><path class="fg-sk" d="${SIDE.head.d}"/><path class="fg-hair" d="${SIDE.hair}"/>${SIDE.head.lines.map(l => `<path class="fg-ln" d="${l}"/>`).join("")}<path class="fg-ol" d="${SIDE.head.d}"/></g>`,
    arm: arm(P.near, "", t)
  };
}

// Buste enroulé : moitié basse (taille → hanche) posée selon « torso » ; moitié haute enroulée progressivement,
// en CURL_N tranches dont l'angle augmente peu à peu (une colonne qui s'arrondit, pas un buste plié en deux).
const CURL_N = 7;
function curlPts(waist, torso, curl) {
  const h = LEN.torso / 2 / CURL_N, pts = [waist];
  for (let j = 0; j < CURL_N; j++) pts.push(add(pts[j], mul(dir(torso + curl * (j + 0.5) / CURL_N), h)));
  return pts;
}
function curledTorso(P, t) {
  const half = LEN.torso / 2, h = half / CURL_N, lowSh = add(P.waist, mul(dir(P.torso), half)), loA = P.torso + 180, pts = curlPts(P.waist, P.torso, P.curl);
  // Tranche [a, b] du buste (repère du buste : x depuis l'épaule), posée avec son point x0 en p.
  const slice = (p, d, x0, a, b, inner) => { const id = "fc" + (++uid);
    return `<g transform="${at(p, d)} translate(${r1(-x0)} 0)"><clipPath id="${id}"><rect x="${r1(a - 0.7)}" y="-40" width="${r1(b - a + 1.4)}" height="80"/></clipPath><g clip-path="url(#${id})">${inner}</g></g>`; };
  let up = "";
  for (let j = CURL_N - 1; j >= 0; j--) { const x0 = half - (j + 1) * h; up += slice(pts[j + 1], P.torso + P.curl * (j + 0.5) / CURL_N + 180, x0, j === CURL_N - 1 ? -30 : x0, x0 + h, seg(SIDE.torso, [0, 0], 0, t, "").replace(/<path class="fg-(ol|ln)"[^>]*\/>/g, "")); }
  // Tranche du haut : elle garde tout ce qui dépasse côté épaule (x < 0). Pas de contour par tranche (sinon des « dents »).
  // Fond continu le long de l'arc : comble les petits écarts entre tranches côté dos quand l'enroulement est fort.
  // (décalé vers le dos, là où le buste est le plus épais)
  const arc = `M${pts.map((p, j) => pt(add(p, mul(dir(P.torso + P.curl * Math.min(j, CURL_N - 0.5) / CURL_N - 90), 2.8)))).join("L")}`;
  return `<path class="fg-spine-o" d="${arc}"/><path class="fg-spine" d="${arc}"/>${slice(lowSh, loA, 0, half, 80, seg(SIDE.torso, [0, 0], 0, t, "") + shorts(SIDE.torso, [0, 0], 0, "M42 -22H66V22H42Z"))}${up}`;
}

/* ---------- Mannequin de face ---------- */
// pose = { view:"front", hip:[x,y] (milieu du bassin), torso (-90 = droit), neck, R:{ua,fa,hand,th,sh,h?}, L:{…}, crown? (dessus du crâne) }
// R : côté droit de l'image. L (côté gauche) est par défaut le miroir de R ; ses angles se donnent tels qu'à l'écran.
const mirrorA = a => 180 - a;
export function solveFront(pose) {
  // shrug : le haut du tronc monte avec les épaules (le cou raccourcit, la tête ne bouge pas).
  const up = dir(pose.torso), across = dir(pose.torso + 90), tl = LEN.torsoF * (pose.tls || 1) + (pose.shrug || 0), neckBase = add(pose.hip, mul(up, tl));
  const cx = pose.hip[0], mx = p => p && [2 * cx - p[0], p[1]], R = pose.R;
  const L = { ua: R.ua != null ? mirrorA(R.ua) : null, fa: R.fa != null ? mirrorA(R.fa) : null, hand: mirrorA(R.hand || 90), th: R.th != null ? mirrorA(R.th) : null, sh: R.sh != null ? mirrorA(R.sh) : null,
    h: R.h, ls: R.ls, wristAt: mx(R.wristAt), ankleAt: mx(R.ankleAt), elbowBend: -(R.elbowBend ?? 1), kneeBend: -(R.kneeBend ?? -1), ...(pose.L || {}) };
  const side = (o0, k) => {
    const shoulder = add(add(neckBase, mul(across, 18 * k)), mul(up, -4)), hipJ = add(pose.hip, mul(across, 9 * k));
    const o = limbAngles(o0, shoulder, hipJ);
    const ls = o.ls || {}, elbow = add(shoulder, mul(dir(o.ua), LEN.ua * (ls.ua ?? 1))), wrist = add(elbow, mul(dir(o.fa), LEN.fa * (ls.fa ?? 1)));
    const knee = add(hipJ, mul(dir(o.th), LEN.th * (ls.th ?? 1))), ankle = add(knee, mul(dir(o.sh), LEN.sh * (ls.sh ?? 1)));
    return { ...o, k, shoulder, hipJ, elbow, wrist, knee, ankle, grip: add(wrist, mul(dir(o.hand), 5.5)) };
  };
  const neckEnd = add(neckBase, mul(dir(pose.neck), LEN.neck - (pose.shrug || 0)));
  return { ...pose, front: true, tsc: tl / LEN.torsoF, neckBase, neckEnd, head: add(neckEnd, mul(dir(pose.neck), 11)), R: side({ elbowBend: 1, kneeBend: -1, ...R }, 1), L: side(L, -1) };
}
function frontBody(P, target) {
  const t = target, none = [];
  // Côté gauche : repère retourné pour que +y reste « vers l'intérieur » des deux côtés.
  const L = (o, k) => (o.ls || {})[k] ?? 1;
  const leg = o => o.th == null || P.nolegs ? "" : `${seg(FRONT.th, o.hipJ, o.th, t, "", o.k < 0, L(o, "th"))}${seg(FRONT.sh, o.knee, o.sh, t, "", o.k < 0, L(o, "sh"))}
    <path class="fg-sk fg-shoe" d="M${pt(add(o.ankle, [-4.4 * o.k, -1]))}L${pt(add(o.ankle, [4.2 * o.k, -1]))}L${pt(add(o.ankle, [7.4 * o.k, 7.4]))}Q${pt(add(o.ankle, [1 * o.k, 9.4]))} ${pt(add(o.ankle, [-4.2 * o.k, 7.4]))}Z"/>`;
  const legShort = o => o.th == null || P.nolegs ? "" : shorts(FRONT.th, o.hipJ, o.th, "M-12 -15H17Q18 0 17 15H-12Z", o.k < 0, L(o, "th"));
  // fore : bras tendu vers nous (écarté à la poulie) : il passe devant l'épaule, dessinée alors en premier.
  const arm = o => { const d = seg(FRONT.delt, o.shoulder, o.ua, t, "", o.k < 0), a = `${seg(FRONT.ua, o.shoulder, o.ua, t, "", o.k < 0, L(o, "ua"))}${seg(FRONT.fa, o.elbow, o.fa, t, "", o.k < 0, L(o, "fa"))}${seg(FRONT[o.h || "fist"], o.wrist, o.hand, none, "", o.k < 0)}`; return o.fore ? d + a : a + d; };
  const face = P.crown ? `<path class="fg-hair" d="${FRONT.crown}"/>${FRONT.crownLines.map(l => `<path class="fg-ln" d="${l}"/>`).join("")}` : `<path class="fg-hair" d="${FRONT.hair}"/>${FRONT.head.lines.map(l => `<path class="fg-ln" d="${l}"/>`).join("")}`;
  const tr = P.torso + 180, head = `<g transform="${at(P.head, P.neck + 90)}"><path class="fg-sk" d="${FRONT.head.d}"/>${face}<path class="fg-ol" d="${FRONT.head.d}"/></g>`;
  return {
    back: P.headBehind ? head : "",
    body: `${leg(P.L)}${leg(P.R)}${legShort(P.L)}${legShort(P.R)}
      ${seg(FRONT.torso, P.neckBase, tr, t, "", 0, P.tsc)}${shorts(FRONT.torso, P.neckBase, tr, "M47 -22H64V22H47Z", 0, P.tsc)}
      ${seg(FRONT.neck, P.neckBase, P.neck, none, "")}${P.headBehind ? "" : head}`,
    arm: `${arm(P.L)}${arm(P.R)}`
  };
}

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

/* ---------- Matériel (profil) ---------- */
const E = (f, o = {}) => ({ f, ...o });
const BB = (e, bb) => ({ ...e, bb });
const G = GROUND;
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
export const medball = (at, o) => E(P => { const c = typeof at === "function" ? at(P) : at; return `<g class="fg-eq"><circle class="fg-ball" cx="${r1(c[0])}" cy="${r1(c[1])}" r="9"/><path class="fg-ballln" d="M${r1(c[0] - 9)} ${r1(c[1])}Q${r1(c[0])} ${r1(c[1] + 5)} ${r1(c[0] + 9)} ${r1(c[1])}M${r1(c[0])} ${r1(c[1] - 9)}Q${r1(c[0] - 4)} ${r1(c[1])} ${r1(c[0])} ${r1(c[1] + 9)}"/></g>`; }, o);
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

/* ---------- Matériel (face) ---------- */
export const fbar = (y, o) => E(P => { const cx = P.front ? P.hip[0] : 120, yy = r1(y(P)); return `<g class="fg-eq">${o && o.ez
    ? `<path class="fg-barline" d="M${cx - 64} ${yy}H${cx - 22}L${cx - 16} ${yy - 4}L${cx - 8} ${yy + 3}L${cx} ${yy - 3}L${cx + 8} ${yy + 3}L${cx + 16} ${yy - 4}L${cx + 22} ${yy}H${cx + 64}"/>`
    : `<line class="fg-barline" x1="${cx - 64}" y1="${yy}" x2="${cx + 64}" y2="${yy}"/>`}${[-1, 1].map(k => `<rect class="fg-plate" x="${cx + k * 56 - 3}" y="${r1(y(P) - 14)}" width="6" height="28" rx="2"/><rect class="fg-plate" x="${cx + k * 49 - 2.5}" y="${r1(y(P) - 10)}" width="5" height="20" rx="1.6"/>`).join("")}</g>`; }, o);
// Haltères vues de face : "across" = poignée gauche-droite (disques de chaque côté), "end" = poignée vers nous.
export const fdb = (mode = "across", o) => E(P => [P.R.grip, P.L.grip].map(c => mode === "end"
  ? `<g class="fg-eq"><circle class="fg-plate" cx="${r1(c[0])}" cy="${r1(c[1])}" r="8"/><circle class="fg-hub" cx="${r1(c[0])}" cy="${r1(c[1])}" r="2.2"/></g>`
  : `<g class="fg-eq"><line class="fg-handle" x1="${r1(c[0] - 10)}" y1="${r1(c[1])}" x2="${r1(c[0] + 10)}" y2="${r1(c[1])}"/><rect class="fg-plate" x="${r1(c[0] - 13)}" y="${r1(c[1] - 9)}" width="6" height="18" rx="2"/><rect class="fg-plate" x="${r1(c[0] + 7)}" y="${r1(c[1] - 9)}" width="6" height="18" rx="2"/></g>`).join(""), o);
export const fpullbar = y => E(P => { const cx = P.hip[0]; return `<g class="fg-eq"><rect class="fg-frame" x="${cx - 58}" y="${y}" width="4" height="${G - y}"/><rect class="fg-frame" x="${cx + 54}" y="${y}" width="4" height="${G - y}"/><line class="fg-barline" x1="${cx - 60}" y1="${y}" x2="${cx + 60}" y2="${y}"/></g>`; });
export const fdips = y => E(P => [P.R.grip, P.L.grip].map(c => `<g class="fg-eq"><rect class="fg-frame" x="${r1(c[0] - 2)}" y="${y}" width="4" height="${G - y}"/><circle class="fg-barcut" cx="${r1(c[0])}" cy="${y}" r="3.4"/></g>`).join(""));
export const frings = () => E(P => [P.R.grip, P.L.grip].map(c => `<g class="fg-eq"><line class="fg-strap" x1="${r1(c[0])}" y1="${r1(c[1] - 7)}" x2="${r1(c[0])}" y2="-40"/><circle class="fg-ring" cx="${r1(c[0])}" cy="${r1(c[1])}" r="6.5"/></g>`).join(""), { top: true });
export const fcables = (py) => E(P => { const cx = P.hip[0]; return `<g class="fg-eq">${[-1, 1].map(k => { const x = cx + k * 70, g = k > 0 ? P.R.grip : P.L.grip, px = x - k * 6; return `<rect class="fg-frame" x="${x - 5}" y="-30" width="10" height="${G + 30}"/><rect class="fg-stack" x="${x - 3.5}" y="${G - 58}" width="7" height="50"/><circle class="fg-pulley" cx="${px}" cy="${py}" r="4.4"/><line class="fg-cable" x1="${px}" y1="${py}" x2="${r1(g[0])}" y2="${r1(g[1])}"/>`; }).join("")}</g>`; });
export const fcableTop = () => E(P => { const cx = P.hip[0], y = P.R.grip[1]; return `<g class="fg-eq"><line class="fg-cable" x1="${cx}" y1="-40" x2="${cx}" y2="${r1(y)}"/><path class="fg-barline" d="M${r1(P.L.grip[0] - 12)} ${r1(y + 6)}Q${r1(P.L.grip[0] - 8)} ${r1(y)} ${r1(P.L.grip[0])} ${r1(y)}H${r1(P.R.grip[0])}Q${r1(P.R.grip[0] + 8)} ${r1(y)} ${r1(P.R.grip[0] + 12)} ${r1(y + 6)}"/></g>`; });
export const fbench = (y, backTop) => E(P => { const cx = P.hip[0]; return `<g class="fg-eq"><rect class="fg-frame" x="${cx - 2}" y="${y + 6}" width="4" height="${G - y - 6}"/><rect class="fg-frame" x="${cx - 16}" y="${G - 3}" width="32" height="4" rx="1.5"/>${backTop != null ? `<rect class="fg-pad" x="${cx - 14}" y="${backTop}" width="28" height="${y - backTop + 4}" rx="5"/>` : ""}<rect class="fg-pad" x="${cx - 16}" y="${y}" width="32" height="8" rx="3.5"/></g>`; });
export const bench = (x1, x2, top, deg = 0, pivot) => BB(bench_(x1, x2, top, deg, pivot), [x1, top - (deg > 0 ? (pivot || x1 + (x2 - x1) * 0.55) - x1 : 0), x2, GROUND]);
export const pullbar = (x, y) => BB(pullbar_(x, y), [x - 12, y - 4, x + 12, GROUND]);
export const dipbars = (x1, x2, y) => BB(dipbars_(x1, x2, y), [x1 - 6, y - 3, x2 + 6, GROUND]);
export const seat = (x, y, back = 1, deg = 12) => BB(seat_(x, y, back, deg), [x - 12, y - (back ? 46 : 0), x + 28, GROUND]);
export const box = (x, y, w, h) => BB(box_(x, y, w, h), [x, y, x + w, y + h]);
export const wall = (x, targetY) => BB(wall_(x, targetY), [x - 2, targetY != null ? targetY - 10 : GROUND - 20, x + 8, GROUND]);
// Poteau vertical (drapeau) et ceinture de lest (chaîne + disque qui pend entre les jambes).
export const pole = x => BB(E(() => `<g class="fg-eq"><rect class="fg-frame" x="${x - 3}" y="-60" width="6" height="${G + 60}"/><rect class="fg-frame" x="${x - 14}" y="${G - 3}" width="28" height="4" rx="1.5"/></g>`), [x - 14, GROUND - 10, x + 14, GROUND]);
export const beltSide = () => E(P => { const a = add(P.hip, [7, 9]), b = add(P.hip, [9, 36]); return `<g class="fg-eq"><line class="fg-chain" x1="${r1(a[0])}" y1="${r1(a[1])}" x2="${r1(b[0])}" y2="${r1(b[1])}"/><rect class="fg-plate" x="${r1(b[0] - 3)}" y="${r1(b[1])}" width="6" height="24" rx="2"/></g>`; }, { top: true });
export const beltFront = () => E(P => { const a = add(P.hip, [0, 6]), b = add(P.hip, [0, 30]); return `<g class="fg-eq"><line class="fg-chain" x1="${r1(a[0])}" y1="${r1(a[1])}" x2="${r1(b[0])}" y2="${r1(b[1])}"/><circle class="fg-plate" cx="${r1(b[0])}" cy="${r1(b[1] + 11)}" r="11"/><circle class="fg-hub" cx="${r1(b[0])}" cy="${r1(b[1] + 11)}" r="2.6"/></g>`; }, { top: true });

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
    // Pour le pied, un petit glissement (moins de 12) est suivi en ligne droite.
    const near12 = a.an && b.an && Math.hypot(a.an[0] - b.an[0], a.an[1] - b.an[1]) < 12;
    // Pied qui passe d'un appui au sol à un autre (pas, saut vers l'arrière) : ligne droite un peu levée au milieu,
    // pour qu'il ne passe jamais sous le sol.
    const low = q => q && q[1] > GROUND - 32;
    if (!noStep && !same(a.ankleAt, b.ankleAt) && !near12 && low(a.an) && low(b.an) && a.th != null && b.th != null) {
      const d = Math.hypot(a.an[0] - b.an[0], a.an[1] - b.an[1]), o2 = bent(a, "th", "sh") >= bent(b, "th", "sh") ? a : b;
      r.ankleAt = [num(a.an[0], b.an[0]), num(a.an[1], b.an[1]) - Math.min(22, d * 0.3) * Math.sin(Math.PI * t)];
      r.kneeBend = o2.kneeBend && o2.ankleAt ? o2.kneeBend : side(o2, "th", "sh");
    }
    if (!same(a.ankleAt, b.ankleAt) && near12 && a.th != null && b.th != null) { const o2 = bent(a, "th", "sh") >= bent(b, "th", "sh") ? a : b; r.ankleAt = [num(a.an[0], b.an[0]), num(a.an[1], b.an[1])]; r.kneeBend = o2.kneeBend && o2.ankleAt ? o2.kneeBend : side(o2, "th", "sh"); }
    if (!r.wristAt && same(a.wr, b.wr) && a.ua != null && b.ua != null) { const o2 = bent(a, "ua", "fa") >= bent(b, "ua", "fa") ? a : b; r.wristAt = a.wr; r.elbowBend = o2.elbowBend && o2.wristAt ? o2.elbowBend : side(o2, "ua", "fa"); }
    return r;
  };
  const o = { ...(t < 0.5 ? A : B), hip: [num(A.hip[0], B.hip[0]), num(A.hip[1], B.hip[1])], torso: turn(A.torso, B.torso, t), neck: turn(A.neck, B.neck, t),
    shrug: num(A.shrug, B.shrug), tls: num(A.tls, B.tls, 1), curl: num(A.curl, B.curl), spin: num(A.spin, B.spin) };
  if (A.head != null || B.head != null) o.head = num(A.head, B.head);
  // Marche (pieds à plat qui échangent leur place, un pas puis le suivant) : pas de pied levé, sinon le corps « s'assoit ».
  const cross = (p, q) => { const c = (u, v) => u && v && Math.hypot(u[0] - v[0], u[1] - v[1]) < 12; const flat = u => u && u[1] > GROUND - 14;
    return c(p.a.an, q.b.an) && c(q.a.an, p.b.an) && !c(p.a.an, p.b.an) && [p.a.an, p.b.an, q.a.an, q.b.an].every(flat); };
  if (A.view === "front") { o.R = limb(A.R, B.R); o.L = limb(A.L, B.L); }
  else { const x = cross({ a: A.near || {}, b: B.near || {} }, { a: A.far || {}, b: B.far || {} }); o.near = limb(A.near, B.near, x); o.far = limb(A.far, B.far, x); }
  return o;
}
