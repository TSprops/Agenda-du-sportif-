// Idées · Hyrox : les formats de course (Solo Open, Solo Pro, Double) et leurs charges.
import { HYROX_EX } from "../../data.js";
import { esc } from "../commun/core.js";
import { hyroxEx } from "../seances/index.js";

export const HYROX_FORMATS = [
  ["open", "Solo Open", [["h", "Homme"], ["f", "Femme"]]],
  ["pro", "Solo Pro", [["h", "Homme"], ["f", "Femme"]]],
  ["double", "Double", [["h", "Homme"], ["f", "Femme"], ["x", "Mixte"]]]
];
// Charges officielles : sled push, sled pull (traîneau compris), farmers carry (par main), sandbag, wall ball, hauteur de la cible.
const OPEN_F = { push: 102, pull: 78, farm: 16, bag: 10, wb: 4, wbTxt: "4 kg", cible: "2,70 m" };
const OPEN_H = { push: 152, pull: 103, farm: 24, bag: 20, wb: 6, wbTxt: "6 kg", cible: "3 m" };
const LOADS = {
  "open-f": OPEN_F, "open-h": OPEN_H,
  "pro-f": { push: 152, pull: 103, farm: 24, bag: 20, wb: 6, wbTxt: "6 kg", cible: "2,70 m" },
  "pro-h": { push: 202, pull: 153, farm: 32, bag: 30, wb: 9, wbTxt: "9 kg", cible: "3 m" },
  "double-f": OPEN_F, "double-h": OPEN_H,
  "double-x": { ...OPEN_H, wbTxt: "6 / 4 kg", cible: "3 m / 2,70 m" }
};
const HINT = {
  open: "La catégorie de référence, ouverte à tous. 8 × (1 km de course + 1 atelier), sans pause : le chrono tourne du début à la fin.",
  pro: "Mêmes 8 ateliers qu’en Open, avec des charges plus lourdes. Pour les athlètes confirmés.",
  double: "À deux : vous courez les 8 km ensemble. Sur chaque atelier, vous vous partagez le travail comme vous voulez, mais un seul travaille à la fois."
};
const DUR = { open: "1 h à 1 h 45", pro: "1 h à 1 h 30", double: "55 min à 1 h 30" };
export const hyroxKey = (fmt, cat) => fmt + "-" + cat;
export function hyroxName(fmt, cat) {
  const f = HYROX_FORMATS.find(x => x[0] === fmt), c = f && f[2].find(x => x[0] === cat);
  return f && c ? `Hyrox ${f[1]} · ${c[1]}` : "Hyrox";
}
// Les 8 ateliers d'une course, avec la charge de la catégorie : [nom, quantité, unité, charge (kg) ou "", texte de la charge].
export function hyroxStations(key) {
  const L = LOADS[key] || OPEN_H;
  const kg = { "Sled push": [L.push, L.push + " kg"], "Sled pull": [L.pull, L.pull + " kg"], "Farmers carry": [L.farm, "2 × " + L.farm + " kg"], "Fentes sandbag": [L.bag, L.bag + " kg"], "Wall balls": [L.wb, L.wbTxt] };
  return HYROX_EX.slice(1).map(([n, unit, amt]) => [n, amt, unit, kg[n] ? kg[n][0] : "", kg[n] ? kg[n][1] : ""]);
}
// Séance du jour : 1 km de course avant chaque atelier.
export function hyroxExercises(key) {
  return hyroxStations(key).flatMap(([n, amt, , kg]) => [hyroxEx("Course", 1000), hyroxEx(n, amt, kg)]);
}
const stLabel = (n, amt, unit, key) => n === "Wall balls" ? `Wall balls × ${amt} (cible ${(LOADS[key] || OPEN_H).cible})` : n === "Burpees sautés" ? `Burpees sautés ${amt} m` : `${n} ${amt} m`;
export function hyroxIdeasHTML(fmt, cat, color) {
  const f = HYROX_FORMATS.find(x => x[0] === fmt) || HYROX_FORMATS[0], c = f[2].find(x => x[0] === cat) ? cat : f[2][0][0], key = hyroxKey(f[0], c);
  return `<div class="chips">${HYROX_FORMATS.map(([id, n]) => `<button class="chip" data-tab="${id}" style="--tc:${color}" aria-pressed="${id === f[0]}">${n}</button>`).join("")}</div>
    <div class="chips">${f[2].map(([id, n]) => `<button class="chip" data-sub="${id}" style="--tc:${color}" aria-pressed="${id === c}">${n}</button>`).join("")}</div>
    <p class="hint" style="margin:-10px 0 0">${esc(HINT[f[0]])}</p>
    <div class="list"><article class="idea hyrox-idea" style="--tc:${color}">
      <div class="idea-top"><b>${esc(hyroxName(f[0], c))}</b><span class="tag">For Time</span></div>
      <span class="idea-meta">⏱ ${DUR[f[0]]} · 8 km de course · 8 ateliers</span>
      <ol class="hx-list">${hyroxStations(key).map(([n, amt, unit, , kgTxt]) => `<li class="hx-run">1 km de course</li><li class="hx-st"><span>${esc(stLabel(n, amt, unit, key))}</span><b>${esc(kgTxt || "—")}</b></li>`).join("")}</ol>
      ${f[0] === "double" && c === "x" ? `<p class="hint">Wall balls : 6 kg à 3 m pour l’homme, 4 kg à 2,70 m pour la femme. Traîneaux, farmers et sandbag aux charges Open Homme.</p>` : ""}
      <p class="hint">Traîneaux : poids du traîneau compris. Farmers carry : une charge dans chaque main.</p>
      <button class="btn primary idea-go" data-try="hyrox:${key}:0">Essayer aujourd’hui</button>
    </article></div>`;
}
