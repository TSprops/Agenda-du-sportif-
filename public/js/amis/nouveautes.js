// Fenêtre « Nouveautés » (une seule fois par utilisateur) et acceptation des conditions.
import { $, S, TERMS_V } from "../core.js";
import { HOW } from "../exercices/index.js";
import { closeInstall, lsGet, lsSet, maybeWelcomeInstall } from "../install.js";
import { figure, frameBox } from "../silhouette/index.js";
import { saveProfile } from "../store.js";

/* ---------- Nouveautés (une seule fois par utilisateur) ---------- */
// Deux diapositives : « Comment faire », puis où trouver le bouton Contact. Vue une fois = plus jamais
// (mémorisé sur l'appareil ET dans le profil, donc aussi après rechargement ou sur un autre appareil).
// Pour la revoir (test) : ouvrir l'app avec « ?nouveautes » à la fin de l'adresse.
const NEWS_ID = "v3";
const NEWS_FORCE = new URLSearchParams(location.search).has("nouveautes");
let newsClosed = false, newsI = 0;
export function termsPending() { return !!(S.profile && (S.profile.termsV || 0) < TERMS_V); }
export function maybeTerms() { if (termsPending()) { $("termsBackdrop").hidden = false; $("termsSheet").hidden = false; return true; } return false; }
$("termsOk").onclick = () => {
  saveProfile({ termsV: TERMS_V, termsAt: Date.now() });
  $("termsBackdrop").hidden = true; $("termsSheet").hidden = true; maybeNews(); if (!newsPending()) maybeWelcomeInstall();
};
export function newsPending() {
  if (newsClosed || !S.profile) return false;
  return NEWS_FORCE || (!((S.profile.seen || {})[NEWS_ID]) && !lsGet("seen-" + NEWS_ID));
}
let newsTimer = null;
export function maybeNews() {
  clearTimeout(newsTimer);
  if (!newsPending()) return;
  newsTimer = setTimeout(() => { if (S.screen === "home" && newsPending() && !document.body.classList.contains("sheet-open") && !document.body.classList.contains("tour-on") && $("newsSheet").hidden) openNews(); }, 1200);
}
function openNews() {
  closeInstall();
  // Illustration de la diapo 1 : le vrai bouton « ? » et le mannequin de « Comment faire » (départ / arrivée).
  const v = HOW["Squats (poids du corps)"].views[0], box = frameBox(v.frames);
  $("newsHow").innerHTML = `<div class="nh-row"><span class="nh-name">Squat</span><span class="how-btn nh-q"><span>?</span></span></div>
    <div class="nh-figs">${v.frames.map((f, i) => `<figure>${figure(f, ["quadriceps", "fessiers"], box)}<figcaption>${["Départ", "Arrivée"][i]}</figcaption></figure>`).join("")}</div>
    <span class="nh-play">▶ Voir le mouvement</span>`;
  newsGoTo(0);
  $("newsBackdrop").hidden = false; $("newsSheet").hidden = false;
  document.addEventListener("keydown", newsKey);
  $("newsNext").focus();
}
function newsGoTo(i) {
  const slides = [...$("newsTrack").children];
  newsI = Math.max(0, Math.min(slides.length - 1, i));
  $("newsTrack").style.transform = `translateX(${-100 * newsI}%)`;
  slides.forEach((el, k) => { el.inert = k !== newsI; el.setAttribute("aria-hidden", k !== newsI); });
  [...$("newsDots").children].forEach((d, k) => d.classList.toggle("on", k === newsI));
  $("newsSheet").setAttribute("aria-labelledby", "newsTitle" + (newsI + 1));
  const last = newsI === slides.length - 1;
  $("newsPrev").style.visibility = newsI ? "visible" : "hidden";
  $("newsNext").textContent = last ? "C’est parti\u00a0!" : "Suivant";
}
function closeNews() {
  newsClosed = true;
  document.removeEventListener("keydown", newsKey);
  $("newsBackdrop").hidden = true; $("newsSheet").hidden = true; $("newsHow").innerHTML = "";
  lsSet("seen-" + NEWS_ID, 1); saveProfile({ seen: { ...((S.profile && S.profile.seen) || {}), [NEWS_ID]: true } });
}
function newsKey(e) {
  if (e.key === "Escape") closeNews();
  else if (e.key === "ArrowRight") newsGoTo(newsI + 1);
  else if (e.key === "ArrowLeft") newsGoTo(newsI - 1);
}
$("newsSkip").onclick = closeNews;
$("newsPrev").onclick = () => newsGoTo(newsI - 1);
$("newsNext").onclick = () => { if (newsI === $("newsTrack").children.length - 1) closeNews(); else newsGoTo(newsI + 1); };
// Glisser le doigt vers la gauche / la droite pour changer de diapositive.
let newsX = null, newsY = null;
$("newsViewport").addEventListener("touchstart", e => { newsX = e.touches[0].clientX; newsY = e.touches[0].clientY; }, { passive: true });
$("newsViewport").addEventListener("touchend", e => {
  if (newsX == null) return;
  const dx = e.changedTouches[0].clientX - newsX, dy = e.changedTouches[0].clientY - newsY; newsX = null;
  if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) newsGoTo(newsI + (dx < 0 ? 1 : -1));
}, { passive: true });
