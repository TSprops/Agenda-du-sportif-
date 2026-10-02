// Idées · Hyrox : les formats de course (Solo Open, Solo Pro, Double) et leurs charges.
import { HYROX_EX } from "../../data.js";
import { esc, nomEx } from "../commun/core.js";
import { nombre, t } from "../commun/i18n.js";
import { hyroxEx } from "../seances/index.js";

// Formats et catégories : noms dans « hyrox.formats.<id> » et « hyrox.categories.<id> ».
export const HYROX_FORMATS = [["open", ["h", "f"]], ["pro", ["h", "f"]], ["double", ["h", "f", "x"]]]
  .map(([id, cats]) => [id, t("hyrox.formats." + id), cats.map(c => [c, t("hyrox.categories." + c)])]);
// Charges officielles : sled push, sled pull (traîneau compris), farmers carry (par main), sandbag, wall ball, hauteur de la cible.
const m = v => nombre(v) + " m"; // hauteur de cible, avec la virgule ou le point selon la langue
const OPEN_F = { push: 102, pull: 78, farm: 16, bag: 10, wb: 4, wbTxt: "4 kg", cible: m(2.7) };
const OPEN_H = { push: 152, pull: 103, farm: 24, bag: 20, wb: 6, wbTxt: "6 kg", cible: m(3) };
const LOADS = {
  "open-f": OPEN_F, "open-h": OPEN_H,
  "pro-f": { push: 152, pull: 103, farm: 24, bag: 20, wb: 6, wbTxt: "6 kg", cible: m(2.7) },
  "pro-h": { push: 202, pull: 153, farm: 32, bag: 30, wb: 9, wbTxt: "9 kg", cible: m(3) },
  "double-f": OPEN_F, "double-h": OPEN_H,
  "double-x": { ...OPEN_H, wbTxt: "6 / 4 kg", cible: m(3) + " / " + m(2.7) }
};
// Présentation et durée de chaque format : « hyrox.formatsAide.<format> » et « hyrox.duree.<format> ».
export const hyroxKey = (fmt, cat) => fmt + "-" + cat;
export function hyroxName(fmt, cat) {
  const f = HYROX_FORMATS.find(x => x[0] === fmt), c = f && f[2].find(x => x[0] === cat);
  return f && c ? t("hyrox.nom", { format: f[1], categorie: c[1] }) : "Hyrox";
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
const stLabel = (n, amt, unit, key) => n === "Wall balls" ? t("hyrox.wallBalls", { n: amt, cible: (LOADS[key] || OPEN_H).cible }) : `${nomEx(n)} ${nombre(amt)} m`;
export function hyroxIdeasHTML(fmt, cat, color) {
  const f = HYROX_FORMATS.find(x => x[0] === fmt) || HYROX_FORMATS[0], c = f[2].find(x => x[0] === cat) ? cat : f[2][0][0], key = hyroxKey(f[0], c);
  return `<div class="chips">${HYROX_FORMATS.map(([id, n]) => `<button class="chip" data-tab="${id}" style="--tc:${color}" aria-pressed="${id === f[0]}">${n}</button>`).join("")}</div>
    <div class="chips">${f[2].map(([id, n]) => `<button class="chip" data-sub="${id}" style="--tc:${color}" aria-pressed="${id === c}">${n}</button>`).join("")}</div>
    <p class="hint" style="margin:-10px 0 0">${esc(t("hyrox.formatsAide." + f[0]))}</p>
    <div class="list"><article class="idea hyrox-idea" style="--tc:${color}">
      <div class="idea-top"><b>${esc(hyroxName(f[0], c))}</b><span class="tag">${t("crossfit.formats.fortime")}</span></div>
      <span class="idea-meta">⏱ ${t("hyrox.duree." + f[0])} · ${t("hyrox.huitKm")}</span>
      <ol class="hx-list">${hyroxStations(key).map(([n, amt, unit, , kgTxt]) => `<li class="hx-run">${t("hyrox.unKm")}</li><li class="hx-st"><span>${esc(stLabel(n, amt, unit, key))}</span><b>${esc(kgTxt || "—")}</b></li>`).join("")}</ol>
      ${f[0] === "double" && c === "x" ? `<p class="hint">${t("hyrox.mixte")}</p>` : ""}
      <p class="hint">${t("hyrox.precisions")}</p>
      <button class="btn primary idea-go" data-try="hyrox:${key}:0">${t("idees.essayer")}</button>
    </article></div>`;
}
