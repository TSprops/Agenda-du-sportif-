// Célébration : message en haut de l'écran, confettis (sauf « animations réduites »), petit son joyeux.
// Plusieurs célébrations d'affilée (record + trophée…) passent l'une après l'autre.
import { playSound } from "./timer.js";
import { toast } from "../entrainement/index.js";

const Q = [];
let busy = false;
export function celebrate(html, kind = "pr") {
  Q.push([html, kind]);
  if (!busy) next();
}
function next() {
  const it = Q.shift(); if (!it) { busy = false; return; }
  busy = true;
  toast(it[0], it[1]); confetti(); playSound("fete");
  setTimeout(next, 3400);
}
function confetti() {
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const W = innerWidth, H = innerHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
  const c = document.createElement("canvas"); c.className = "confetti"; c.setAttribute("aria-hidden", "true");
  c.width = W * dpr; c.height = H * dpr; document.body.appendChild(c);
  const g = c.getContext("2d"); if (!g) { c.remove(); return; }
  g.scale(dpr, dpr);
  const red = getComputedStyle(document.documentElement).getPropertyValue("--red").trim() || "#FF3B30";
  const cols = [red, "#FFD60A", "#FF9F0A", "#2FBF71", "#FFFFFF"];
  const P = Array.from({ length: 110 }, (_, i) => ({
    x: W / 2 + (Math.random() - 0.5) * W * 0.4, y: H * 0.3, vx: (Math.random() - 0.5) * 10, vy: -4 - Math.random() * 11,
    r: Math.random() * 360, vr: (Math.random() - 0.5) * 16, w: 5 + Math.random() * 5, h: 8 + Math.random() * 7, c: cols[i % cols.length]
  }));
  const LIFE = 2400, t0 = performance.now();
  let last = t0;
  const step = t => {
    const k = Math.min(3, (t - last) / 16.7); last = t;
    g.clearRect(0, 0, W, H); g.globalAlpha = Math.max(0, 1 - (t - t0) / LIFE);
    P.forEach(p => {
      p.vy += 0.33 * k; p.vx *= Math.pow(0.99, k); p.x += p.vx * k; p.y += p.vy * k; p.r += p.vr * k;
      g.save(); g.translate(p.x, p.y); g.rotate(p.r * Math.PI / 180); g.fillStyle = p.c; g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); g.restore();
    });
    if (t - t0 < LIFE) requestAnimationFrame(step); else c.remove();
  };
  requestAnimationFrame(step);
}
