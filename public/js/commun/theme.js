// Apparence : couleur principale, modes sombre / anthracite / clair. Langue de l'app.
import { $, S } from "./core.js";
import { LANGUE, LANGUES, changerLangue, t } from "./i18n.js";
import { saveProfile } from "./store.js";

/* ============================================================
   Apparence (couleur principale et mode clair / sombre)
   ============================================================ */
const ACCENTS = [
  { id: "rouge", c: "#E3161F", hi: "#FF2B34", on: "#FFFFFF" },
  { id: "bleu", c: "#1F6FEB", hi: "#4C8DFF", on: "#FFFFFF" },
  { id: "vert", c: "#16A34A", hi: "#2FD073", on: "#FFFFFF" },
  { id: "violet", c: "#7C3AED", hi: "#A07BFF", on: "#FFFFFF" },
  { id: "orange", c: "#EA6A12", hi: "#FF8A3D", on: "#FFFFFF" },
  { id: "rose", c: "#DB2777", hi: "#FF5E9A", on: "#FFFFFF" },
  { id: "or", c: "#D4A017", hi: "#F5C542", on: "#111111" },
  { id: "argent", c: "#D9D6D2", hi: "#FFFFFF", on: "#111111", light: "#3A3A40" }
];
const BGS = [
  { id: "noir", ground: "#0A0A0B", ink: "#F4F1EE" },
  { id: "anthracite", ground: "#16171A", ink: "#F4F1EE" },
  { id: "clair", ground: "#F3F1EE", ink: "#171514" }
];
function applyTheme(t) {
  t = t || {};
  const a = ACCENTS.find(x => x.id === t.accent) || ACCENTS[0], bg = BGS.find(x => x.id === t.bg) || BGS[0], light = bg.id === "clair";
  const r = document.documentElement, c = light && a.light ? a.light : a.c;
  r.dataset.bg = bg.id;
  r.style.setProperty("--red", c);
  r.style.setProperty("--red-hi", light ? `color-mix(in srgb, ${c} 85%, #000)` : a.hi);
  r.style.setProperty("--on-red", light && a.light ? "#FFFFFF" : a.on);
  const m = document.querySelector('meta[name="theme-color"]'); if (m) m.setAttribute("content", bg.ground);
  try { localStorage.setItem("theme", JSON.stringify({ accent: a.id, bg: bg.id })); } catch (e) { /* stockage bloqué */ }
}
try { applyTheme(JSON.parse(localStorage.getItem("theme") || "{}")); } catch (e) { applyTheme({}); }
function currentTheme() { try { return JSON.parse(localStorage.getItem("theme") || "{}"); } catch (e) { return {}; } }
function renderTheme() {
  const th = currentTheme();
  $("accentList").innerHTML = ACCENTS.map(a => `<button type="button" class="swatch-btn" data-accent="${a.id}" style="--sw:${th.bg === "clair" && a.light ? a.light : a.c}" aria-pressed="${(th.accent || "rouge") === a.id}"><i></i>${t("profil.couleurs." + a.id)}</button>`).join("");
  $("bgList").innerHTML = BGS.map(b => `<button type="button" class="mode-btn" data-bg="${b.id}" aria-pressed="${(th.bg || "noir") === b.id}"><span class="mode-prev" style="--pg:${b.ground};--pi:${b.ink}"><b></b><u></u></span>${t("profil.modes." + b.id)}</button>`).join("");
  renderLangue();
}
function setTheme(patch) {
  const th = { ...currentTheme(), ...patch };
  applyTheme(th); renderTheme();
  if (S.profile) saveProfile({ theme: { accent: th.accent || "rouge", bg: th.bg || "noir" } });
}
/* Langue : enregistrée sur le compte (la même sur tous les appareils), puis l'app se recharge. */
function renderLangue() {
  $("langList").innerHTML = LANGUES.map(l => `<button type="button" class="chip" data-lang="${l.code}" lang="${l.code}" aria-pressed="${l.code === LANGUE}">${l.nom}</button>`).join("");
}
$("langList").addEventListener("click", async e => {
  const b = e.target.closest("[data-lang]"); if (!b || b.dataset.lang === LANGUE) return;
  const code = b.dataset.lang;
  $("langList").querySelectorAll("button").forEach(x => { x.disabled = true; x.setAttribute("aria-pressed", String(x === b)); });
  // Hors connexion, l'enregistrement part au retour du réseau : on n'attend pas plus d'une seconde et demie.
  if (S.profile) await Promise.race([saveProfile({ lang: code }).catch(() => {}), new Promise(r => setTimeout(r, 1500))]);
  changerLangue(code);
});
$("themeCard").addEventListener("click", e => {
  const a = e.target.closest("[data-accent]"); if (a) { setTheme({ accent: a.dataset.accent }); return; }
  const b = e.target.closest("[data-bg]"); if (b) setTheme({ bg: b.dataset.bg });
});

export { applyTheme, currentTheme, renderTheme };
