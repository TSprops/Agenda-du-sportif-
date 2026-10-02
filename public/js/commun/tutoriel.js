// Tutoriel guidé, page par page : la première fois qu'on ouvre une page, un élément est mis en évidence
// (le reste de l'écran assombri) avec une bulle courte. Une fois terminé ou passé, il ne revient plus
// pour cette page : suivi enregistré sur le compte (profil.tours), donc aussi sur les autres appareils.
// La page « Tutoriel » (accueil ou profil) permet de revoir chaque partie, sans toucher à ce suivi.
// Pour tout remettre à zéro : ouvrir l'app avec « ?reset-tutoriels » à la fin de l'adresse.
import { $, S, esc, todayK } from "./core.js";
import { go, saveProfile } from "./store.js";
import { lsGet } from "./install.js";
import { newsPending, termsPending } from "../amis/index.js";
import { openDay } from "../seances/index.js";
import { freshKey, toast } from "../entrainement/index.js";
import { LANGUE, t } from "./i18n.js";

// sel : sélecteur CSS (ou fonction qui renvoie l'élément). Une étape dont l'élément est absent est sautée.
// Le fil rouge : une séance libre = Séances › Séance libre › le jour › choisir son sport › ajouter ses exercices.
const TOURS = {
  home: { name: t("tutoriel.pages.home.nom"), sub: t("tutoriel.pages.home.sous"), steps: [
    ["#homeStreak", t("tutoriel.pages.home.e1")],
    ["#homeDash .dash-mus", t("tutoriel.pages.home.e2")],
    ["#tabbar .tab-go", t("tutoriel.pages.home.e3")],
    ["#tabbar", t("tutoriel.pages.home.e4")],
    ["#homeLinks", t("tutoriel.pages.home.e5")]] },
  go: { name: t("tutoriel.pages.go.nom"), sub: t("tutoriel.pages.go.sous"), steps: [
    ["#goBody .seance-tile[data-go=seances]", t("tutoriel.pages.go.e1")],
    ["#goBody .seance-tile[data-go=routines]", t("tutoriel.pages.go.e2")],
    ["#goBody .seance-tile[data-go=programs]", t("tutoriel.pages.go.e3")],
    ["#goBody .seance-tile[data-go=types]", t("tutoriel.pages.go.e4")]] },
  seances: { name: t("tutoriel.pages.seances.nom"), sub: t("tutoriel.pages.seances.sous"), steps: [
    ["#grid", t("tutoriel.pages.seances.e1")],
    ["#today", t("tutoriel.pages.seances.e2")],
    ["#list .row", t("tutoriel.pages.seances.e3")]] },
  "seance-choix": { name: t("tutoriel.pages.seance-choix.nom"), sub: t("tutoriel.pages.seance-choix.sous"), steps: [
    ["#sheet .disc-grid", t("tutoriel.pages.seance-choix.e1")]] },
  seance: { steps: [
    ["#sheet [data-a=add-ex]", t("tutoriel.pages.seance.e1")],
    [() => { const c = document.querySelector("#sheet [data-a=type]"); return c && c.parentElement; }, t("tutoriel.pages.seance.e2")],
    ["#sheet [data-a=change-disc]", t("tutoriel.pages.seance.e3")],
    ["#sheet [data-a=close]", t("tutoriel.pages.seance.e4")]] },
  routines: { name: t("tutoriel.pages.routines.nom"), sub: t("tutoriel.pages.routines.sous"), steps: [
    ["#routinesBody [data-rnew]", t("tutoriel.pages.routines.e1")],
    ["#routinesBody [data-rgo]", t("tutoriel.pages.routines.e2")]] },
  programs: { name: t("tutoriel.pages.programs.nom"), sub: t("tutoriel.pages.programs.sous"), steps: [
    ["#programsBody .list .idea", t("tutoriel.pages.programs.e1")],
    ["#programsBody [data-pgstart]", t("tutoriel.pages.programs.e2")]] },
  types: { name: t("tutoriel.pages.types.nom"), sub: t("tutoriel.pages.types.sous"), steps: [
    ["#typesGrid", t("tutoriel.pages.types.e1")]] },
  hub: { steps: [
    ["#hubBody [data-try]", t("tutoriel.pages.hub.e1")]] },
  records: { name: t("tutoriel.pages.records.nom"), sub: t("tutoriel.pages.records.sous"), steps: [
    ["#recGrid", t("tutoriel.pages.records.e1")]] },
  progress: { name: t("tutoriel.pages.progress.nom"), sub: t("tutoriel.pages.progress.sous"), steps: [
    ["#progGrid", t("tutoriel.pages.progress.e1")]] },
  muscles: { name: t("tutoriel.pages.muscles.nom"), sub: t("tutoriel.pages.muscles.sous"), steps: [
    ["#musBody .chips", t("tutoriel.pages.muscles.e1")],
    ["#musBody .bodies", t("tutoriel.pages.muscles.e2")]] },
  recap: { name: t("tutoriel.pages.recap.nom"), sub: t("tutoriel.pages.recap.sous"), steps: [
    ["#recapBody", t("tutoriel.pages.recap.e1")],
    ["#recapShare", t("tutoriel.pages.recap.e2")]] },
  social: { name: t("tutoriel.pages.social.nom"), sub: t("tutoriel.pages.social.sous"), steps: [
    ["#socialBody .soc-pills", t("tutoriel.pages.social.e1")],
    ["#v-social .soc-head", t("tutoriel.pages.social.e2")],
    ["#feedBody", t("tutoriel.pages.social.e3")]] },
  friends: { name: t("tutoriel.pages.friends.nom"), sub: t("tutoriel.pages.friends.sous"), steps: [
    ["#friendsBody .code-card", t("tutoriel.pages.friends.e1")],
    ["#friendSearch", t("tutoriel.pages.friends.e2")]] },
  challenges: { name: t("tutoriel.pages.challenges.nom"), sub: t("tutoriel.pages.challenges.sous"), steps: [
    ["#chBody [data-chnew]", t("tutoriel.pages.challenges.e1")]] },
  nutrition: { name: t("tutoriel.pages.nutrition.nom"), sub: t("tutoriel.pages.nutrition.sous"), steps: [
    ["#v-nutrition .menu", t("tutoriel.pages.nutrition.e1")]] },
  creatine: { name: t("tutoriel.pages.creatine.nom"), sub: t("tutoriel.pages.creatine.sous"), steps: [
    ["#creaBtn", t("tutoriel.pages.creatine.e1")],
    ["#creaGrid", t("tutoriel.pages.creatine.e2")]] },
  complements: { name: t("tutoriel.pages.complements.nom"), sub: t("tutoriel.pages.complements.sous"), steps: [
    ["#cpChips", t("tutoriel.pages.complements.e1")],
    ["#cpForm", t("tutoriel.pages.complements.e2")]] },
  contact: { name: t("tutoriel.pages.contact.nom"), sub: t("tutoriel.pages.contact.sous"), steps: [
    ["#v-contact [data-go=contactform]", t("tutoriel.pages.contact.e1")]] },
  profile: { name: t("tutoriel.pages.profile.nom"), sub: t("tutoriel.pages.profile.sous"), steps: [
    ["#pfView", t("tutoriel.pages.profile.e1")],
    ["#themeCard", t("tutoriel.pages.profile.e2")],
    ["#langCard", t("tutoriel.pages.profile.langue")],
    ["#tutoAgain", t("tutoriel.pages.profile.e3")]] }
};
// Ordre de la page « Tutoriel » ; « seance-choix » ouvre la séance du jour (fiche vide) puis enchaîne sur « seance ».
const LIST = ["home", "go", "seances", "seance-choix", "routines", "programs", "types", "records", "progress", "muscles", "recap",
  "social", "friends", "challenges", "nutrition", "creatine", "complements", "contact", "profile"];

const off = () => !!lsGet("tours-off");           // tests automatiques uniquement
// tours[id] = heure où le tutoriel a été vu ; une remise à zéro (toursReset) rend tout « pas encore vu ».
const seen = id => { const p = S.profile || {}, vu = (p.tours || {})[id]; return !!vu && (vu === true ? 1 : vu) > (p.toursReset || 0); };
let T = null, waitTimer = null, replay = new Set();

// Une autre fenêtre est ouverte (Nouveautés, conditions, installation, assistant…) : on attend qu'elle se ferme.
function busy(id) {
  if (document.querySelector(".install:not([hidden])") || !$("helpPanel").hidden || !$("viewer").hidden) return true;
  if (id === "home" && (newsPending() || termsPending())) return true;
  const sheet = $("sheet").classList.contains("open"), other = ["libSheet", "typesSheet"].some(x => $(x).classList.contains("open"));
  if (id === "seance" || id === "seance-choix") return !sheet || other;
  return sheet || other;
}
// Le bon moment : la page (ou la fiche) est toujours celle du tutoriel, rien d'autre ne s'affiche.
function stillHere(id) {
  if (id === "seance-choix") return $("sheet").classList.contains("open") && !!document.querySelector("#sheet .disc-grid");
  if (id === "seance") return $("sheet").classList.contains("open") && !!document.querySelector("#sheet [data-a=change-disc]");
  return S.screen === id;
}
function want(id) {
  const tour = TOURS[id]; if (!tour || T || !S.profile || off()) return false;
  return replay.has(id) || !seen(id);
}
// Appelé à chaque ouverture de page et à chaque affichage de la fiche séance.
function tourCheck(id) {
  if (!want(id)) return;
  clearTimeout(waitTimer);
  let tries = 0;
  const attempt = () => {
    if (!want(id) || !stillHere(id)) return;
    if (busy(id)) { if (++tries < 60) waitTimer = setTimeout(attempt, 700); return; }
    start(id);
  };
  waitTimer = setTimeout(attempt, 650);
}
function start(id) {
  const steps = TOURS[id].steps.map(([sel, text]) => ({ sel, text })).filter(st => target(st));
  if (!steps.length) { finish(id, false); return; }
  T = { id, steps, i: 0, forced: replay.has(id) };
  replay.delete(id);
  $("tour").hidden = false; document.body.classList.add("tour-on");
  document.addEventListener("keydown", onKey);
  show();
}
function target(st) {
  const el = typeof st.sel === "function" ? st.sel() : document.querySelector(st.sel);
  return el && el.getClientRects().length ? el : null;
}
function show() {
  const st = T.steps[T.i], el = target(st);
  if (!el) { if (T.i < T.steps.length - 1) { T.steps.splice(T.i, 1); show(); } else end(); return; }
  el.scrollIntoView({ block: "center", inline: "nearest" });
  $("tourStep").textContent = `${T.i + 1}/${T.steps.length}`;
  // Français : espaces insécables, un guillemet ou un « ! » ne se retrouve jamais seul en début de ligne.
  $("tourText").textContent = LANGUE === "fr" ? st.text.replace(/« /g, "«\u00a0").replace(/ ([»!?:;])/g, "\u00a0$1") : st.text;
  $("tourPrev").style.visibility = T.i ? "visible" : "hidden";
  $("tourNext").textContent = t(T.i === T.steps.length - 1 ? "tutoriel.terminer" : "commun.suivant");
  place();
  $("tourNext").focus({ preventScroll: true });
}
// Cadre autour de l'élément et bulle juste en dessous (ou au-dessus s'il n'y a pas la place).
function place() {
  if (!T) return;
  const el = target(T.steps[T.i]); if (!el) return;
  const r = el.getBoundingClientRect(), vw = innerWidth, vh = innerHeight, pad = 6;
  const top = Math.max(4, r.top - pad), bottom = Math.min(vh - 4, r.bottom + pad), left = Math.max(4, r.left - pad), right = Math.min(vw - 4, r.right + pad);
  Object.assign($("tourHole").style, { top: top + "px", left: left + "px", width: Math.max(0, right - left) + "px", height: Math.max(0, bottom - top) + "px" });
  const b = $("tourBubble"), w = Math.min(360, vw - 24), h = b.offsetHeight;
  b.style.width = w + "px";
  const below = vh - bottom - 12, above = top - 12;
  let y = below >= h ? bottom + 10 : above >= h ? top - h - 10 : vh - h - 12;
  y = Math.max(12, Math.min(vh - h - 12, y));
  const x = Math.max(12, Math.min(vw - w - 12, (left + right) / 2 - w / 2));
  b.style.top = y + "px"; b.style.left = x + "px";
}
function end() { if (T) finish(T.id, !T.forced); }
function finish(id, save) {
  T = null; $("tour").hidden = true; document.body.classList.remove("tour-on");
  document.removeEventListener("keydown", onKey);
  // Revu depuis la page « Tutoriel » : le suivi « déjà vu » ne change pas.
  if (save && S.profile && !seen(id)) saveProfile({ tours: { ...(S.profile.tours || {}), [id]: Date.now() } });
}
function onKey(e) {
  if (!T) return;
  if (e.key === "Escape") { e.preventDefault(); end(); }
  else if (e.key === "ArrowRight") next();
  else if (e.key === "ArrowLeft") prev();
}
function next() { if (T.i === T.steps.length - 1) end(); else { T.i++; show(); } }
function prev() { if (T.i) { T.i--; show(); } }
$("tourNext").onclick = next;
$("tourPrev").onclick = prev;
$("tourSkip").onclick = end;
addEventListener("resize", () => requestAnimationFrame(place));
addEventListener("scroll", () => requestAnimationFrame(place), true);

/* ---------- Page « Tutoriel » : revoir une partie ---------- */
function renderTutos() {
  $("tutosList").innerHTML = LIST.map(id => { const tour = TOURS[id];
    return `<button class="menu-card" data-tour="${id}"><span class="mark${seen(id) ? " ok" : ""}">${seen(id) ? "✓" : "?"}</span><span class="mc"><b>${esc(tour.name)}</b><span class="s">${esc(tour.sub)}</span></span><span class="arrow" aria-hidden="true">›</span></button>`; }).join("");
}
$("tutosList").addEventListener("click", e => {
  const b = e.target.closest("[data-tour]"); if (!b) return;
  const id = b.dataset.tour;
  if (id === "seance-choix") { replay.add("seance-choix"); replay.add("seance"); go("seances"); openDay(freshKey(todayK())); return; }
  replay.add(id); go(id);
});

// Remise à zéro (pour tester) : « ?reset-tutoriels » à la fin de l'adresse.
function maybeResetTours() {
  if (!new URLSearchParams(location.search).has("reset-tutoriels") || !S.profile) return;
  saveProfile({ toursReset: Date.now() });
  history.replaceState(null, "", location.pathname);
  toast(t("tutoriel.remisAZero"));
}

export { maybeResetTours, renderTutos, tourCheck };
