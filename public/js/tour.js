// Tutoriel guidé, page par page : la première fois qu'on ouvre une page, un élément est mis en évidence
// (le reste de l'écran assombri) avec une bulle courte. Une fois terminé ou passé, il ne revient plus
// pour cette page : suivi enregistré sur le compte (profil.tours), donc aussi sur les autres appareils.
// La page « Tutoriel » (accueil ou profil) permet de revoir chaque partie, sans toucher à ce suivi.
// Pour tout remettre à zéro : ouvrir l'app avec « ?reset-tutoriels » à la fin de l'adresse.
import { $, S, esc, todayK } from "./core.js";
import { go, saveProfile } from "./store.js";
import { lsGet } from "./install.js";
import { newsPending, termsPending } from "./friends.js";
import { openDay } from "./seances.js";
import { freshKey, toast } from "./workout.js";

// sel : sélecteur CSS (ou fonction qui renvoie l'élément). Une étape dont l'élément est absent est sautée.
// Le fil rouge : une séance libre = Let's go › Calendrier › le jour › choisir son sport › ajouter ses exercices.
const TOURS = {
  home: { name: "Accueil", sub: "Ta semaine et les grandes parties de l’app", steps: [
    ["#homeStreak", "Choisis combien de séances tu veux faire par semaine : chaque semaine réussie fait grandir ta série 🔥."],
    ["#v-home .go-item", "Let’s go : c’est ici que tu crées tes séances et que tu t’entraînes."],
    ["#v-home .toc-item[data-go=social]", "Social : tes amis, leurs séances, les défis et les classements."],
    ["#v-home .toc-item[data-go=nutrition]", "Nutrition : coche ta créatine et tes compléments du jour."],
    ["#homeLinks", "Revois ces explications quand tu veux avec « Tutoriel ». Une question ? « Contact »."]] },
  go: { name: "Let’s go", sub: "Lancer une séance, routines, programmes…", steps: [
    ["#goBody .go-hero", "Ta séance du jour en un toucher : tu choisis ton sport et tu ajoutes tes exercices."],
    ["#goBody .go-tile[data-go=types]", "Des séances toutes prêtes si tu manques d’idées. C’est facultatif !"],
    ["#goBody .go-grid", "Routines, programmes, records, progression, carte musculaire : tout est ici."],
    ["#goBody .go-tile[data-go=seances]", "Crée ta propre séance, n’importe quel jour : touche « Calendrier », puis le jour, puis ajoute tes exercices."]] },
  seances: { name: "Calendrier", sub: "Créer une séance libre, n’importe quel jour", steps: [
    ["#grid", "Touche le jour de ta séance : aujourd’hui, un jour passé ou à venir."],
    ["#today", "Ou ce raccourci pour la séance d’aujourd’hui."],
    ["#list .row", "Pour supprimer une séance, glisse-la vers la droite."]] },
  "seance-choix": { name: "Créer une séance", sub: "Choisir son sport et ajouter ses exercices", steps: [
    ["#sheet .disc-grid", "Choisis ton sport. Pas besoin d’idée toute faite : tu construis ta séance toi-même."]] },
  seance: { steps: [
    ["#sheet [data-a=add-ex]", "Ajoute tes exercices un par un, avec tes séries et tes poids : c’est ta séance, à ta façon."],
    [() => { const c = document.querySelector("#sheet [data-a=type]"); return c && c.parentElement; }, "Choisis le type (Push, Pull, Jambes…) pour t’y retrouver dans le calendrier."],
    ["#sheet [data-a=change-disc]", "Pas le bon sport ? Reviens au choix de l’activité ici."],
    ["#sheet [data-a=close]", "Tout s’enregistre tout seul. Pour effacer la séance : « Supprimer la séance », tout en bas."]] },
  routines: { name: "Mes routines", sub: "Tes séances enregistrées, prêtes à lancer", steps: [
    ["#routinesBody [data-rnew]", "Enregistre tes séances préférées pour les relancer en un toucher."],
    ["#routinesBody [data-rgo]", "Lance une routine : tes poids de la dernière fois sont déjà remplis."]] },
  programs: { name: "Programmes", sub: "Des plans sur plusieurs semaines", steps: [
    ["#programsBody .list .idea", "Un plan sur plusieurs semaines : l’app te propose la bonne séance à chaque fois."],
    ["#programsBody [data-pgstart]", "Choisis-en un pour commencer."]] },
  types: { name: "Idées de séances", sub: "Des séances toutes prêtes (facultatif)", steps: [
    ["#typesGrid", "Des séances toutes prêtes, par activité. C’est facultatif : tu peux créer les tiennes depuis le Calendrier."]] },
  hub: { steps: [
    ["#hubBody [data-try]", "« Essayer aujourd’hui » copie cette séance dans ton calendrier du jour."]] },
  records: { name: "Mes records", sub: "Tes meilleures perfs", steps: [
    ["#recGrid", "Choisis une catégorie pour voir et ajouter tes records."]] },
  progress: { name: "Ma progression", sub: "Tes courbes séance après séance", steps: [
    ["#progGrid", "Choisis une catégorie pour voir tes courbes, séance après séance."]] },
  muscles: { name: "Carte musculaire", sub: "Les muscles travaillés", steps: [
    ["#musBody .chips", "Regarde les 7 ou les 30 derniers jours."],
    ["#musBody .bodies", "Plus c’est rouge, plus le muscle a travaillé. Touche un muscle pour voir ses séries."]] },
  recap: { name: "Bilan du mois", sub: "Tes chiffres à partager", steps: [
    ["#recapBody", "Ton mois en chiffres."],
    ["#recapShare", "Crée une image à partager en story."]] },
  social: { name: "Social", sub: "Fil d’actu, amis, messages, défis", steps: [
    ["#socialBody .menu", "Fil d’actu, amis, messages, défis et classements : tout le social est ici."],
    ["#socialBody [data-go=friends]", "Commence par ajouter tes amis."]] },
  friends: { name: "Amis", sub: "Ajouter des amis avec leur code", steps: [
    ["#friendsBody .code-card", "Donne ton code ami pour qu’on t’ajoute."],
    ["#friendSearch", "Ou entre le code d’un ami pour l’ajouter."]] },
  challenges: { name: "Défis", sub: "Se lancer des défis entre amis", steps: [
    ["#chBody [data-chnew]", "Lance un défi à tes amis : séances, km, volume…"]] },
  nutrition: { name: "Nutrition", sub: "Compléments et créatine", steps: [
    ["#v-nutrition .menu", "Note tes compléments et coche ta créatine."]] },
  creatine: { name: "Créatine", sub: "Cocher sa prise du jour", steps: [
    ["#creaBtn", "Touche ce bouton quand tu as pris ta créatine du jour."],
    ["#creaGrid", "Oublié un jour ? Touche la date pour la cocher."]] },
  complements: { name: "Compléments", sub: "Noter ce que tu prends", steps: [
    ["#cpChips", "Un toucher pour ajouter un complément."],
    ["#cpForm", "Ou ajoute-en un autre, avec sa dose."]] },
  contact: { name: "Contact", sub: "M’écrire une idée, un bug…", steps: [
    ["#v-contact [data-go=contactform]", "Une idée, un bug, une question : écris-moi ici."]] },
  profile: { name: "Profil", sub: "Tes infos, couleurs et réglages", steps: [
    ["#pfView", "Tes infos : pseudo, photo…"],
    ["#themeCard", "Choisis ta couleur et le mode d’affichage."],
    ["#tutoAgain", "Revois les tutoriels quand tu veux."]] }
};
// Ordre de la page « Tutoriel » ; « seance-choix » ouvre la séance du jour (fiche vide) puis enchaîne sur « seance ».
const LIST = ["home", "go", "seances", "seance-choix", "routines", "programs", "types", "records", "progress", "muscles", "recap",
  "social", "friends", "challenges", "nutrition", "creatine", "complements", "contact", "profile"];

const off = () => !!lsGet("tours-off");           // tests automatiques uniquement
// tours[id] = heure où le tutoriel a été vu ; une remise à zéro (toursReset) rend tout « pas encore vu ».
const seen = id => { const p = S.profile || {}, t = (p.tours || {})[id]; return !!t && (t === true ? 1 : t) > (p.toursReset || 0); };
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
  const t = TOURS[id]; if (!t || T || !S.profile || off()) return false;
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
  // Espaces insécables : un guillemet ou un « ! » ne se retrouve jamais seul en début de ligne.
  $("tourText").textContent = st.text.replace(/« /g, "«\u00a0").replace(/ ([»!?:;])/g, "\u00a0$1");
  $("tourPrev").style.visibility = T.i ? "visible" : "hidden";
  $("tourNext").textContent = T.i === T.steps.length - 1 ? "Terminer" : "Suivant";
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
  $("tutosList").innerHTML = LIST.map(id => { const t = TOURS[id];
    return `<button class="menu-card" data-tour="${id}"><span class="mark${seen(id) ? " ok" : ""}">${seen(id) ? "✓" : "?"}</span><span class="mc"><b>${esc(t.name)}</b><span class="s">${esc(t.sub)}</span></span><span class="arrow" aria-hidden="true">›</span></button>`; }).join("");
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
  toast("✓ Tutoriels remis à zéro");
}

export { maybeResetTours, renderTutos, tourCheck };
