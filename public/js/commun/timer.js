// Minuteur de repos et départs réguliers, sons.
import { $, S, pad } from "./core.js";
import { savePrefs } from "./store.js";
import { advanceAfterRest } from "../seances/index.js";
import { toast } from "../entrainement/index.js";
import { nombre, t } from "./i18n.js";

/* ============================================================
   Minuteur de repos
   ============================================================ */
const RT = { end: 0, total: 0, tick: null, ctx: null, lastLeft: null };
const SOUNDS = ["bip", "alarme", "sifflet", "gong"];
function soundPrefs() { return { vol: 80, type: "bip", countdown: true, ...((S.prefs && S.prefs.sound) || {}) }; }
function audioReady() {
  try { RT.ctx = RT.ctx || new (window.AudioContext || window.webkitAudioContext)(); if (RT.ctx.state === "suspended") RT.ctx.resume(); } catch (e) { RT.ctx = null; }
  return RT.ctx;
}
// Une note : fréquence (ou [début, fin] pour un glissement), début, durée, forme d'onde, volume relatif.
function tone(ctx, master, f, t0, dur, wave, rel) {
  const o = ctx.createOscillator(), g = ctx.createGain(), at = ctx.currentTime + t0;
  o.type = wave;
  if (Array.isArray(f)) { o.frequency.setValueAtTime(f[0], at); o.frequency.exponentialRampToValueAtTime(f[1], at + dur); } else o.frequency.setValueAtTime(f, at);
  g.gain.setValueAtTime(0.0001, at); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, master * rel), at + 0.015);
  g.gain.setValueAtTime(Math.max(0.0002, master * rel), at + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
  o.connect(g); g.connect(ctx.destination); o.start(at); o.stop(at + dur + 0.02);
}
function playSound(kind) {
  const ctx = audioReady(); if (!ctx) return;
  const p = soundPrefs(), master = Math.min(1, Math.max(0, p.vol / 100));
  if (!master) return;
  try {
    if (kind === "tick") { tone(ctx, master, 1046, 0, 0.09, "square", 0.45); return; }
    if (kind === "fete") { [523, 659, 784, 1046].forEach((f, i) => tone(ctx, master, f, i * 0.09, i === 3 ? 0.4 : 0.14, "triangle", 0.8)); return; }
    const type = kind || p.type;
    if (type === "alarme") for (let i = 0; i < 6; i++) tone(ctx, master, i % 2 ? 740 : 988, i * 0.18, 0.16, "sawtooth", 0.8);
    else if (type === "sifflet") { tone(ctx, master, [1400, 2600], 0, 0.28, "sine", 1); tone(ctx, master, [1400, 2600], 0.36, 0.28, "sine", 1); tone(ctx, master, 2600, 0.72, 0.5, "sine", 1); }
    else if (type === "gong") { tone(ctx, master, 196, 0, 1.6, "sine", 1); tone(ctx, master, 392, 0, 1.2, "triangle", 0.6); tone(ctx, master, 587, 0, 0.9, "sine", 0.35); }
    else [0, 0.28, 0.56].forEach(t0 => tone(ctx, master, 880, t0, 0.2, "square", 0.9));
  } catch (e) { /* son indisponible */ }
}
function startRest(seconds, name, ctx) {
  if (!seconds) seconds = 90;
  if (RT.tick && RT.ex != null) { const prev = RT.ex; RT.tick = (clearInterval(RT.tick), null); RT.ex = null; advanceAfterRest(prev); }
  RT.day = ctx ? ctx.day : null; RT.ex = ctx ? ctx.ex : null; RT.iv = null;
  audioReady(); // débloque le son (il faut un toucher de l'utilisateur sur iPhone)
  RT.total = seconds; RT.end = Date.now() + seconds * 1000; RT.lastLeft = null;
  $("rtLbl").textContent = name ? t("minuteur.reposNom", { nom: name }) : t("minuteur.repos");
  $("restTimer").classList.remove("done"); $("restTimer").hidden = false; $("rtSkip").textContent = t("commun.passer");
  clearInterval(RT.tick); RT.tick = setInterval(drawRest, 200); drawRest();
}
function drawRest() {
  const left = Math.max(0, Math.ceil((RT.end - Date.now()) / 1000));
  $("rtTime").textContent = Math.floor(left / 60) + ":" + pad(left % 60);
  $("rtFill").style.width = (RT.total ? left / RT.total * 100 : 0) + "%";
  if (left !== RT.lastLeft && left > 0 && left <= 3 && soundPrefs().countdown) playSound("tick");
  RT.lastLeft = left;
  // Avec une durée (« pendant ») : le dernier départ a lui aussi son intervalle, et le temps restant s'affiche.
  if (RT.iv && RT.iv.full && left > 0) {
    const rest = Math.max(0, Math.ceil(((RT.iv.n - RT.iv.rep) * RT.total * 1000 + RT.end - Date.now()) / 1000));
    $("rtLbl").textContent = t("minuteur.departReste", { i: RT.iv.rep, n: RT.iv.n, reste: Math.floor(rest / 60) + ":" + pad(rest % 60) });
  }
  if (left <= 0 && RT.iv && RT.iv.rep + (RT.iv.full ? 0 : 1) < RT.iv.n) {
    // Départ suivant (cordes, callisthénie) : on relance tout de suite le même intervalle.
    RT.iv.rep++; RT.end = Date.now() + RT.total * 1000; RT.lastLeft = null;
    $("rtLbl").textContent = t("minuteur.departNom", { i: RT.iv.rep, n: RT.iv.n, nom: RT.iv.name });
    playSound(); if (navigator.vibrate) navigator.vibrate([200, 80, 200]);
    return;
  }
  if (left <= 0) {
    clearInterval(RT.tick); RT.tick = null;
    $("restTimer").classList.add("done"); $("rtLbl").textContent = RT.iv ? (RT.iv.full ? t("minuteur.termine", { n: RT.iv.n }) : t("minuteur.dernier", { n: RT.iv.n })) : t("minuteur.reparti"); RT.iv = null; $("rtTime").textContent = "0:00"; $("rtSkip").textContent = t("commun.ok");
    playSound(); if (navigator.vibrate) navigator.vibrate([300, 120, 300, 120, 300]);
    const ei = RT.ex; RT.ex = null; if (S.open && S.open === RT.day) advanceAfterRest(ei);
    setTimeout(() => { if (!RT.tick) $("restTimer").hidden = true; }, 6000);
  }
}
// Départs réguliers (ex. 1 corde toutes les 5 s pendant 1 min) : le minuteur se relance à chaque départ.
// « full » : le minuteur tourne jusqu'au bout de la durée (sinon il s'arrête au dernier départ).
function startIntervals(every, n, name, full) {
  if (!every) { toast(t("minuteur.indiqueTemps")); return; }
  startRest(every, name);
  if (n < 2 && !full) { $("rtLbl").textContent = t("minuteur.departSeul", { nom: name }); return; }
  RT.iv = { rep: 1, n, name, full: !!full };
  $("rtLbl").textContent = t("minuteur.departNom", { i: 1, n, nom: name });
}
$("rtPlus").onclick = () => { if (RT.tick) { RT.end += 15000; RT.total += 15; drawRest(); } else startRest(15); };
$("rtSkip").onclick = () => {
  const running = !!RT.tick; clearInterval(RT.tick); RT.tick = null; $("restTimer").hidden = true;
  if (running) { const ei = RT.ex; RT.ex = null; if (S.open && S.open === RT.day) advanceAfterRest(ei); }
};

// Réglages du son (page Profil)
function renderSound() {
  const p = soundPrefs();
  $("sndVol").value = p.vol; $("sndVolTxt").textContent = nombre(p.vol / 100, { style: "percent" });
  $("sndTypes").innerHTML = SOUNDS.map(id => `<button type="button" class="chip" data-snd="${id}" style="--tc:var(--red)" aria-pressed="${p.type === id}">${t("minuteur.sons." + id)}</button>`).join("");
  $("sndCount").setAttribute("aria-pressed", String(!!p.countdown));
}
let sndTimer = null;
function saveSound(patch, silent) {
  S.prefs.sound = { ...soundPrefs(), ...patch };
  clearTimeout(sndTimer); sndTimer = setTimeout(savePrefs, 400);
  renderSound(); if (!silent) playSound();
}
$("sndVol").addEventListener("input", e => { S.prefs.sound = { ...soundPrefs(), vol: +e.target.value }; $("sndVolTxt").textContent = nombre(e.target.value / 100, { style: "percent" }); });
$("sndVol").addEventListener("change", e => saveSound({ vol: +e.target.value }));
$("sndTypes").addEventListener("click", e => { const b = e.target.closest("[data-snd]"); if (b) saveSound({ type: b.dataset.snd }); });
$("sndCount").onclick = () => saveSound({ countdown: !soundPrefs().countdown }, true);
$("sndTest").onclick = () => playSound();

export { RT, playSound, renderSound, startIntervals, startRest };
