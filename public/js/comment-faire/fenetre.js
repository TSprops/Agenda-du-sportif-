// « Comment faire » : bouton « ? » et fenêtre de la fiche (ouverture, fermeture, boutons).
import { $h, playViews, stopLive } from "./lecture.js";
import { GRIPS, gripSVG } from "./mains.js";
import { moveOf } from "./recherche.js";
import { esc } from "../core.js";
import { bodySVG } from "../muscles.js";
import { figure, frameBox } from "../silhouette/index.js";
import { musclesOf } from "../entrainement/index.js";

/* ---------- Bouton « ? » et fenêtre ---------- */
// i : numéro de l'exercice dans la séance, ou "lib" dans la recherche d'exercices.
export function howBtnHTML(name, i) {
  if (!moveOf(name)) return "";
  return `<button type="button" class="how-btn" data-how="${i}" data-name="${esc(name)}" aria-label="Comment faire : ${esc(name)}"><span aria-hidden="true">?</span></button>`;
}
let opener = null, inerted = [];
// Une vue : les images clés côte à côte (Départ / Arrivée…) et, cachée, la même vue animée (bouton « Voir le mouvement »).
// L'animation redessine chaque image (identifiants de découpe uniques : un doublon caché casserait l'affichage).
// Vues animées : toutes par défaut ; « anim » garde une seule vue (ex. "De profil") ; « animViews » donne la liste
// (une vue propre à l'animation, ou le nom d'une vue des images).
export function animViewsOf(def) {
  if (def.animViews) return def.animViews.map(v => typeof v === "string" ? def.views.find(w => w.label === v) : v).filter(Boolean);
  return def.anim ? def.views.filter(v => v.label === def.anim) : def.views;
}
function viewHTML(v, draw, many, k) {
  const n = v.frames.length, caps = v.caps || (n === 1 ? ["Position à tenir"] : n === 2 ? ["Départ", "Arrivée"] : []);
  return `<div class="how-view">${many ? `<p class="how-vt">${v.label}</p>` : ""}
    <div class="how-frames${n > 1 ? " multi" : ""}">${v.frames.map((p, i) => `<figure>${draw(p)}<figcaption>${caps[i] || ""}</figcaption></figure>`).join("")}</div>
    </div>`;
}
let current = null;
function openHow(name, btn) {
  const def = moveOf(name); if (!def) return;
  opener = btn;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Muscles de l'exercice (bibliothèque ou exercice perso) ; seuls les principaux sont colorés sur le mannequin.
  const found = musclesOf(name), mus = found && found.p.length ? found : { p: [], s: [] };
  const lv = {}; (mus.s || []).forEach(m => { lv[m] = 2; }); mus.p.forEach(m => { lv[m] = 4; });
  // Les silhouettes ne sont dessinées qu'ici, à l'ouverture.
  const target = def.t || mus.p;
  const anim = animViewsOf(def).filter(v => v.frames.length > 1), moving = anim.length > 0;
  const html = def.views.map((v, k) => { const b = frameBox(v.frames); return viewHTML(v, p => figure(p, target, b), def.views.length > 1, k); }).join("")
    + `<div class="how-lives">${anim.map((v, k) => `<figure class="how-live" data-live="${k}" role="img" aria-label="Animation ${v.label.toLowerCase()}, en boucle">${anim.length > 1 ? `<p class="how-vt">${v.label}</p>` : ""}<div class="how-live-fig"></div><figcaption></figcaption></figure>`).join("")}</div>`;
  current = { views: anim, target };
  const info = def;
  $h("howTitle").textContent = name;
  $h("howStage").className = "how-stage";
  $h("howStage").innerHTML = html + (moving && !reduce ? `<button type="button" class="btn how-play" id="howPlay" aria-pressed="false"><span aria-hidden="true">▶</span> Voir le mouvement</button>` : "");
  $h("howTips").hidden = !info.tips;
  $h("howTips").innerHTML = info.tips ? `<p class="how-vt">Repères pour débuter</p><ul>${info.tips.map(t => `<li>${esc(t)}</li>`).join("")}</ul>` : "";
  const grip = GRIPS[info.grip];
  $h("howGrip").hidden = !grip;
  $h("howGrip").innerHTML = grip ? `<p class="how-vt">Placement des mains</p>${gripSVG(info.grip)}<p>${grip.txt}</p>` : "";
  $h("howCue").textContent = info.cue;
  $h("howMap").innerHTML = `<figure>${bodySVG("front", lv)}<figcaption>Face</figcaption></figure><figure>${bodySVG("back", lv)}<figcaption>Dos</figcaption></figure>
    <p class="how-legend"><span><i class="lp"></i>Muscles principaux</span><span><i class="ls"></i>Muscles qui aident</span></p>`;
  // Le reste de l'app devient inerte tant que la fenêtre est ouverte.
  inerted = [...document.body.children].filter(el => el.id !== "howSheet" && el.id !== "howBackdrop" && !el.inert);
  inerted.forEach(el => { el.inert = true; });
  $h("howBackdrop").hidden = false; $h("howSheet").hidden = false;
  $h("howClose").focus();
  document.addEventListener("keydown", onKey);
}
function closeHow() {
  if ($h("howSheet").hidden) return;
  stopLive(); current = null;
  $h("howBackdrop").hidden = true; $h("howSheet").hidden = true; $h("howStage").innerHTML = ""; $h("howMap").innerHTML = ""; $h("howGrip").innerHTML = ""; $h("howTips").innerHTML = "";
  inerted.forEach(el => { el.inert = false; }); inerted = [];
  document.removeEventListener("keydown", onKey);
  // Le bouton a pu être redessiné entre-temps : on retrouve le même.
  const back = opener && opener.isConnected ? opener : opener && document.querySelector(`[data-how="${opener.dataset.how}"]`);
  if (back) back.focus();
  opener = null;
}
function onKey(e) {
  if (e.key === "Escape") { e.preventDefault(); closeHow(); return; }
  if (e.key === "Tab") { e.preventDefault(); $h("howClose").focus(); } // un seul élément actif dans la fenêtre
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-how]"); if (!b) return;
  e.stopPropagation();
  const inp = document.getElementById("exn-" + b.dataset.how);
  openHow(inp ? inp.value : b.dataset.name, b);
}, true);
$h("howClose").onclick = closeHow;
// « Voir le mouvement » : passe des images côte à côte à l'animation (et inversement).
$h("howStage").addEventListener("click", e => {
  const b = e.target.closest("#howPlay"); if (!b) return;
  const on = $h("howStage").classList.toggle("playing");
  b.setAttribute("aria-pressed", on);
  if (on && current) playViews(current.views, current.target); else stopLive();
  b.innerHTML = on ? `<span aria-hidden="true">■</span> Revoir départ et arrivée` : `<span aria-hidden="true">▶</span> Voir le mouvement`;
});
$h("howBackdrop").onclick = closeHow;
