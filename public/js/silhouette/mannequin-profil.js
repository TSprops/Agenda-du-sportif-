// Silhouette : mannequin vu de profil (placement des articulations et dessin).
import { SIDE } from "./formes.js";
import { LEN, add, at, dir, limbAngles, mul, rot } from "./geometrie.js";
import { curlPts, curledTorso, seg, shorts } from "./segments.js";

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
export function sideBody(P, target) {
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
