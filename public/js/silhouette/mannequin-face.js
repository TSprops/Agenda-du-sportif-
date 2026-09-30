// Silhouette : mannequin vu de face (placement des articulations et dessin).
import { FRONT } from "./formes.js";
import { LEN, add, at, dir, limbAngles, mul, pt } from "./geometrie.js";
import { seg, shorts } from "./segments.js";

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
export function frontBody(P, target) {
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
