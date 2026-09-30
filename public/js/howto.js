// « Comment faire » : bouton « ? » et fenêtre qui montre le mouvement (mannequin de figure.js, positions de moves.js).
// Départ et arrivée côte à côte, bouton « Voir le mouvement » pour l'animation, repères pour débuter, placement des mains.
import { esc } from "./core.js";
import { norm } from "./faq.js";
import { musclesOf } from "./workout.js";
import { bodySVG } from "./muscles.js";
import { figure, frameBox } from "./figure.js";
import { HOW } from "./moves.js";

// Noms tapés à la main : on retrouve la fiche grâce à quelques mots-clés.
const MOVE_WORDS = [
  [/diamant|diamond/, "Pompes diamant"], [/archer/, "Pompes archer"], [/pike/, "Pompes pike"], [/pompe|push ?up/, "Pompes"], [/anneau/, "Dips aux anneaux"], [/dips/, "Dips"],
  [/incline.*haltere|haltere.*incline/, "Développé incliné haltères"], [/incline/, "Développé incliné"], [/decline/, "Développé décliné"], [/couche.*serre|serre.*couche/, "Développé couché prise serrée"],
  [/couche.*haltere|haltere.*couche/, "Développé couché haltères"], [/presse pec|chest press/, "Presse pectoraux"], [/couche|bench/, "Développé couché"],
  [/poulie basse.*ecarte|ecarte.*poulie basse/, "Écarté poulie basse"], [/poulie moyenne.*ecarte|ecarte.*poulie moyenne/, "Écarté poulie moyenne"], [/poulie.*ecarte|ecarte.*poulie|vis a vis|crossover/, "Écarté poulie haute"],
  [/butterfly|pec deck/, "Pec deck (butterfly)"], [/ecarte|fly/, "Écarté haltères"], [/pull ?over/, "Pull-over"],
  [/tirage vertical.*serre/, "Tirage vertical prise serrée"], [/tirage vertical|pulldown/, "Tirage vertical"], [/muscle ?up/, "Muscle-up"], [/leste/, "Tractions lestées"], [/chin|supination.*traction|traction.*supination/, "Tractions supination (chin-up)"],
  [/australien|inverted/, "Tractions australiennes"], [/traction|pull ?up/, "Tractions"], [/face ?pull/, "Face pull"], [/tirage horizontal|tirage assis|rowing assis/, "Tirage horizontal"], [/rowing machine/, "Rowing machine"],
  [/t ?bar/, "Rowing T-bar"], [/rowing haltere|haltere.*rowing/, "Rowing haltère"], [/menton|upright/, "Rowing menton"], [/rowing|row\b|tirage/, "Rowing barre"],
  [/roumain|rdl/, "Soulevé de terre roumain"], [/sumo/, "Soulevé de terre sumo"], [/terre|deadlift/, "Soulevé de terre"], [/good morning/, "Good morning"], [/lombaire/, "Extension lombaire"],
  [/arnold/, "Développé Arnold"], [/push press/, "Push press"], [/militaire|epaule|overhead/, "Développé militaire"], [/elevation.*poulie|poulie.*elevation/, "Élévations latérales à la poulie"],
  [/elevations? frontale/, "Élévations frontales"], [/oiseau|arriere d.?epaule/, "Oiseau (arrière d’épaule)"], [/elevation/, "Élévations latérales"], [/shrug/, "Shrugs"],
  [/curl.*poulie|poulie.*curl/, "Curl à la poulie"], [/marteau|hammer/, "Curl marteau"], [/pupitre|preacher/, "Curl pupitre"], [/curl.*incline/, "Curl incliné"], [/poignet/, "Curl poignets"],
  [/curl.*barre|barre.*curl/, "Curl barre"], [/curl/, "Curl haltères"], [/barre au front|skull/, "Barre au front"], [/nuque|overhead extension/, "Extension triceps nuque"],
  [/kickback/, "Kickback triceps"], [/triceps/, "Extension triceps à la poulie"],
  [/goblet/, "Squat goblet"], [/pistol/, "Pistol squat"], [/front squat|squat avant/, "Front squat"], [/hack/, "Hack squat"], [/poids du corps/, "Squats (poids du corps)"], [/squat/, "Squat"],
  [/bulgare/, "Fentes bulgares"], [/step/, "Step-up"], [/fente|lunge/, "Fentes"], [/leg curl/, "Leg curl"], [/presse a cuisse|leg press/, "Presse à cuisses"], [/leg extension/, "Leg extension"],
  [/abduct/, "Abducteurs machine"], [/pont fessier|glute bridge/, "Pont fessier"], [/hip thrust|pont|fessier/, "Hip thrust"], [/mollet.*assis/, "Mollets assis"], [/mollet|calf/, "Mollets debout"],
  [/toes to bar/, "Toes to bar"], [/relev/, "Relevés de jambes"], [/crunch.*poulie/, "Crunch à la poulie"], [/sit ?up/, "Sit-ups"], [/twist/, "Russian twist"], [/crunch/, "Crunch"],
  [/gainage lateral|side plank/, "Gainage latéral"], [/gainage|plank/, "Gainage"], [/roue|ab wheel/, "Roue abdominale"], [/hollow/, "Hollow hold"], [/climber/, "Mountain climbers"],
  [/l ?sit/, "L-sit"], [/handstand push|hspu/, "Handstand push-up"], [/handstand|poirier/, "Handstand"], [/front lever/, "Front lever"], [/back lever/, "Back lever"], [/drapeau|human flag/, "Human flag"], [/planche/, "Planche"],
  [/corde.*sans jambe/, "Montée de corde sans jambes"], [/corde|rope/, "Montée de corde"],
  [/swing/, "Kettlebell swings"], [/wall ?ball/, "Wall balls"], [/thruster/, "Thrusters"], [/snatch|arrache/, "Snatch"], [/clean|epaule jete/, "Clean"], [/box/, "Box jumps"], [/burpee/, "Burpees"],
  [/farmer|marche/, "Farmer walk"]
];
const key = n => norm(n || "").replace(/\s+/g, " ").trim();
// Construit au premier usage (et pas au chargement du fichier : norm vient d'un autre fichier).
let HOW_KEYS = null;
export function moveOf(name) {
  const k = key(name); if (!k) return null;
  HOW_KEYS = HOW_KEYS || Object.fromEntries(Object.keys(HOW).map(n => [key(n), n]));
  const n = HOW_KEYS[k] || (MOVE_WORDS.find(([re]) => re.test(k)) || [])[1];
  return n && HOW[n] ? { name: n, ...HOW[n] } : null;
}

/* ---------- Placement des mains (vu de dessus) ---------- */
const GRIPS = {
  floor: { x: 30, txt: "Mains au sol un peu plus larges que les épaules, doigts vers l’avant, coudes à environ 45° du corps." },
  wide: { x: 44, txt: "Mains au sol bien plus larges que les épaules (environ une fois et demie)." },
  diamond: { x: 6, rot: 40, txt: "Mains collées sous la poitrine : pouces et index se touchent et forment un losange (le « diamant »). Coudes serrés le long du corps." },
  bench: { x: 34, bar: 1, txt: "Mains sur la barre un peu plus larges que les épaules : en bas du mouvement, les avant-bras sont bien verticaux." },
  close: { x: 23, bar: 1, txt: "Mains à largeur d’épaules, pas plus serré, pour protéger les poignets." },
  pro: { x: 32, bar: 1, txt: "Prise en pronation (paumes vers la barre), mains un peu plus larges que les épaules, doigts refermés autour de la barre." },
  sup: { x: 22, bar: 1, txt: "Prise en supination (paumes tournées vers toi), mains à largeur d’épaules." },
  row: { x: 25, bar: 1, txt: "Prise en pronation (dos des mains vers l’avant, pouces vers l’intérieur), mains à largeur d’épaules." },
  dips: { x: 26, par: 1, txt: "Une main sur chaque barre parallèle, bras tendus, épaules basses et loin des oreilles." }
};
const HAND = `<rect x="-5" y="-3" width="10" height="11" rx="3.5"/><rect x="-4.8" y="-10" width="2.3" height="9" rx="1.15"/><rect x="-2.3" y="-11.6" width="2.3" height="10" rx="1.15"/><rect x="0.2" y="-10.8" width="2.3" height="9" rx="1.15"/><rect x="2.7" y="-8.6" width="2.2" height="7" rx="1.1"/><line class="hg-thumb" x1="-4" y1="5" x2="-9.5" y2="0.5"/>`;
export function gripSVG(id) {
  const g = GRIPS[id]; if (!g) return "";
  const hand = sx => `<g class="hg-hand" transform="translate(${80 + sx * g.x} 64) scale(${sx} 1) rotate(${-(g.rot || 0)})">${HAND}</g>`;
  return `<svg viewBox="0 0 160 100" class="hg" aria-hidden="true" focusable="false">
    <line class="hg-guide" x1="56" y1="34" x2="56" y2="82"/><line class="hg-guide" x1="104" y1="34" x2="104" y2="82"/>
    <circle class="hg-body" cx="80" cy="15" r="8"/><path class="hg-body" d="M50 44Q51 29 66 27H94Q109 29 110 44"/>
    ${g.bar ? `<line class="hg-bar" x1="6" y1="58" x2="154" y2="58"/>` : ""}${g.par ? [-1, 1].map(k => `<line class="hg-bar" x1="${80 + k * g.x}" y1="40" x2="${80 + k * g.x}" y2="86"/>`).join("") : ""}
    ${hand(1)}${hand(-1)}
    <path class="hg-dim" d="M58 86H102M61 83.5l-3 2.5 3 2.5M99 83.5l3 2.5-3 2.5"/><text class="hg-txt" x="80" y="97" text-anchor="middle">largeur d’épaules</text>
  </svg>`;
}

/* ---------- Bouton « ? » et fenêtre ---------- */
// i : numéro de l'exercice dans la séance, ou "lib" dans la recherche d'exercices.
export function howBtnHTML(name, i) {
  if (!moveOf(name)) return "";
  return `<button type="button" class="how-btn" data-how="${i}" data-name="${esc(name)}" aria-label="Comment faire : ${esc(name)}"><span aria-hidden="true">?</span></button>`;
}
let opener = null, inerted = [];
// Une vue : les images clés côte à côte (Départ / Arrivée…) et, cachée, la même vue animée (bouton « Voir le mouvement »).
// L'animation redessine chaque image (identifiants de découpe uniques : un doublon caché casserait l'affichage).
function viewHTML(v, draw, many) {
  const n = v.frames.length, caps = v.caps || (n === 1 ? ["Position à tenir"] : n === 2 ? ["Départ", "Arrivée"] : []);
  const figs = v.frames.map(draw), seq = v.seq || v.frames.map((_, i) => i), D = seq.length * 1.1;
  return `<div class="how-view">${many ? `<p class="how-vt">${v.label}</p>` : ""}
    <div class="how-frames${n > 1 ? " multi" : ""}">${figs.map((f, i) => `<figure>${f}<figcaption>${caps[i] || ""}</figcaption></figure>`).join("")}</div>
    ${n > 1 ? `<div class="how-anim" role="img" aria-label="Animation ${v.label.toLowerCase()}, en boucle">${seq.map((k, i) => `<div class="how-f" style="animation:hs${Math.min(seq.length, 6)} ${D.toFixed(1)}s ease-in-out infinite;animation-delay:${(-((seq.length - i) % seq.length) * 1.1).toFixed(1)}s">${draw(v.frames[k])}</div>`).join("")}</div>` : ""}</div>`;
}
function openHow(name, btn) {
  const def = moveOf(name); if (!def) return;
  opener = btn;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Muscles de l'exercice (bibliothèque ou exercice perso) ; seuls les principaux sont colorés sur le mannequin.
  const found = musclesOf(name), mus = found && found.p.length ? found : { p: [], s: [] };
  const lv = {}; (mus.s || []).forEach(m => { lv[m] = 2; }); mus.p.forEach(m => { lv[m] = 4; });
  // Les silhouettes ne sont dessinées qu'ici, à l'ouverture.
  const target = def.t || mus.p, moving = def.views.some(v => v.frames.length > 1);
  const html = def.views.map(v => { const b = frameBox(v.frames); return viewHTML(v, p => figure(p, target, b), def.views.length > 1); }).join("");
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
const $h = id => document.getElementById(id);
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
  b.innerHTML = on ? `<span aria-hidden="true">■</span> Revoir départ et arrivée` : `<span aria-hidden="true">▶</span> Voir le mouvement`;
});
$h("howBackdrop").onclick = closeHow;

