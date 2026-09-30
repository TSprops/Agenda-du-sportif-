// « Comment faire » : lecture animée des vues (« Voir le mouvement »).
import { anglesOf, figure, frameBox, lerpPose } from "../silhouette/index.js";

// Animation : le mannequin passe d'une image clé à la suivante (ordre « seq »), avec une pause sur chacune.
let live = null;
const MOVE_MS = 950, HOLD_MS = 350;
const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
export function playViews(views, target) {
  stopLive();
  const tracks = views.map((v, k) => {
    const el = $h("howStage").querySelector(`[data-live="${k}"]`); if (!el) return null;
    const seq = v.seq || v.frames.map((_, i) => i), caps = v.caps || (v.frames.length === 2 ? ["Départ", "Arrivée"] : []);
    return { el: el.querySelector(".how-live-fig"), cap: el.querySelector("figcaption"), box: frameBox(v.frames), seq, caps, poses: v.frames.map(anglesOf), eq: v.frames.map(p => p.eq) };
  }).filter(Boolean);
  const t0 = performance.now();
  const tick = now => {
    tracks.forEach(tr => {
      // L'heure passée par le navigateur peut précéder t0 de quelques ms : on garde un temps toujours positif.
      const seg = MOVE_MS + HOLD_MS, total = tr.seq.length * seg, e = (((now - t0) % total) + total) % total, i = Math.floor(e / seg), f = e - i * seg;
      const a = tr.seq[i], b = tr.seq[(i + 1) % tr.seq.length], t = f < HOLD_MS ? 0 : ease((f - HOLD_MS) / MOVE_MS);
      // Matériel de l'image de départ pendant tout le trajet : il est accroché aux mains / au bassin, il suit le corps.
      const pose = { ...lerpPose(tr.poses[a], tr.poses[b], t), eq: tr.eq[a] };
      tr.el.innerHTML = figure(pose, target, tr.box);
      const c = t < 0.5 ? tr.caps[a] : tr.caps[b]; if (tr.cap.textContent !== (c || "")) tr.cap.textContent = c || "";
    });
    live = requestAnimationFrame(tick);
  };
  live = requestAnimationFrame(tick);
}
export function stopLive() {
  if (live) cancelAnimationFrame(live); live = null;
  $h("howStage").querySelectorAll(".how-live-fig").forEach(el => { el.innerHTML = ""; });
}
export const $h = id => document.getElementById(id);
