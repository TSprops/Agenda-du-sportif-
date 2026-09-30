// Célébration : message en haut de l'écran (record) ou grand badge au centre (trophée, objectif), avec confettis
// (sauf « animations réduites ») et petit son joyeux. Plusieurs célébrations passent l'une après l'autre.
import { $, esc } from "./core.js";
import { lsGet } from "./install.js";
import { playSound } from "./timer.js";
import { toast } from "../entrainement/index.js";

const Q = [];
let busy = false;
// Message en haut de l'écran (disparaît tout seul).
export function celebrate(html, kind = "pr") { push({ html, kind }); }
// Grand badge hexagonal au centre : { ico (svg), kicker, title, sub }. Se ferme avec « Continuer ».
export function showBadge(b) { if (!lsGet("fete-off")) push({ badge: b }); } // « fete-off » : tests automatiques uniquement
function push(it) { Q.push(it); if (!busy) next(); }
function next() {
  const it = Q.shift(); if (!it) { busy = false; return; }
  busy = true; confetti(); playSound("fete");
  if (it.badge) openBadge(it.badge);
  else { toast(it.html, it.kind); setTimeout(next, 3400); }
}
let opener = null;
function openBadge(b) {
  let el = $("feteBadge");
  if (!el) {
    el = document.createElement("div"); el.id = "feteBadge"; el.className = "fete-veil"; el.setAttribute("role", "dialog"); el.setAttribute("aria-modal", "true"); el.setAttribute("aria-labelledby", "feteTitle");
    document.body.appendChild(el);
    el.addEventListener("click", e => { if (e.target.closest("[data-fete-ok]")) closeBadge(); });
    document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("feteBadge").hidden) closeBadge(); });
  }
  el.innerHTML = `<div class="fete-card"><div class="hex on big" aria-hidden="true"><svg class="hex-ic" viewBox="0 0 24 24">${b.ico}</svg></div>
    <span class="lbl fete-k">${esc(b.kicker)}</span><h2 id="feteTitle" class="fete-t">${esc(b.title)}</h2><p class="hint">${esc(b.sub)}</p>
    <button type="button" class="btn primary fete-ok" data-fete-ok>Continuer</button></div>`;
  opener = document.activeElement; el.hidden = false;
  const ok = el.querySelector("[data-fete-ok]"); if (ok) ok.focus({ preventScroll: true });
}
function closeBadge() {
  const el = $("feteBadge"); if (!el || el.hidden) return;
  el.hidden = true; if (opener && opener.isConnected && opener.focus) opener.focus({ preventScroll: true }); opener = null;
  setTimeout(next, 250);
}
function confetti() {
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const W = innerWidth, H = innerHeight, dpr = Math.min(2, window.devicePixelRatio || 1);
  const c = document.createElement("canvas"); c.className = "confetti"; c.setAttribute("aria-hidden", "true");
  c.width = W * dpr; c.height = H * dpr; document.body.appendChild(c);
  const g = c.getContext("2d"); if (!g) { c.remove(); return; }
  g.scale(dpr, dpr);
  const css = getComputedStyle(document.documentElement), red = css.getPropertyValue("--red").trim() || "#E3161F", hi = css.getPropertyValue("--red-hi").trim() || red;
  const cols = [red, hi, css.getPropertyValue("--ink").trim() || "#FFFFFF", css.getPropertyValue("--muted").trim() || "#9C9690"];
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
