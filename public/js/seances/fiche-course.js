// Séances, fiche du jour : course à pied (blocs fractionné, seuil…).
import { effortCard } from "./fiche-muscu-calis.js";
import { $, RUN_TYPES, blocDone, blocKm, blocsLegacy, blocsRun, esc, fmtKm, pad, runCalcHTML, runSecs } from "../commun/core.js";

// Unités d'un bloc. Seuil : minutes seulement. Fractionné : mètres, secondes, minutes.
// Une ancienne unité (km, ou autre qu'en minutes au seuil) reste affichée sur son bloc.
const UNITS = { m: "Mètres", km: "Kilomètres", min: "Minutes", s: "Secondes" };
const unitOf = (b, rt) => b.unit || (rt === "seuil" ? "min" : "m");
// Séries qui restent à faire : décompte d'affichage, le format saisi ne change pas.
export const blocLeft = b => blocDone(b) ? 0 : b.left ?? Math.max(1, +b.rep || 1);
const preview = (b, rt) => `${b.rep || "?"} × ${b.eff || "?"} ${unitOf(b, rt)}`;
function distHTML(b, rt) {
  const km = blocKm(b, rt);
  return km ? `Distance parcourue <b>${fmtKm(km)}</b>` : `<span class="hint">Ajoute une allure cible (ex. 4:30) pour calculer la distance parcourue.</span>`;
}
function totalHTML(c) {
  const bl = c.run.blocks || [], done = bl.filter(blocDone);
  if (bl.length < 2 || !done.length) return "";
  return `Total parcouru <b>${fmtKm(done.reduce((a, b) => a + blocKm(b, c.runType), 0))}</b>`;
}
function countHTML(b, j) {
  const n = blocLeft(b), done = blocDone(b);
  return `<b class="bl-n">${n}</b><span class="bl-left">${done ? "exercice<br>validé ✓" : n > 1 ? "séries<br>restantes" : "série<br>restante"}</span>
    ${done ? "" : n > 1 ? `<button class="rest-go" data-a="bl-go" data-b="${j}">⏱ Lancer la récup</button>` : `<button class="rest-go bl-end" data-a="bl-go" data-b="${j}">✓ Terminer</button>`}`;
}
// Mise à jour pendant la saisie d'un bloc (aperçu, décompte, distance, total).
export function refreshBloc(c, j) {
  const b = c.run.blocks[j], rt = c.runType;
  const p = $("bl-prev-" + j); if (p) p.innerHTML = `Aperçu : <b>${esc(preview(b, rt))}</b>`;
  const n = $("bl-count-" + j); if (n) n.innerHTML = countHTML(b, j);
  const d = $("bl-dist-" + j); if (d) d.innerHTML = distHTML(b, rt);
  const t = $("bl-total"); if (t) t.innerHTML = totalHTML(c);
}
function unitHTML(b, j, rt) {
  const u = unitOf(b, rt);
  if (rt === "seuil") return `<span class="bl-fixed${u === "min" ? "" : " old"}">${esc(u)}</span>`;
  const list = ["m", "s", "min"].concat(UNITS[u] && !["m", "s", "min"].includes(u) ? [u] : []);
  return `<div class="seg bl-units" role="group" aria-label="Unité du bloc ${j + 1}">${list.map(x => `<button type="button" data-a="bl-unit" data-b="${j}" data-u="${x}" aria-pressed="${x === u}" aria-label="${UNITS[x]}"${["m", "s", "min"].includes(x) ? "" : ' class="old"'}>${x}</button>`).join("")}</div>`;
}
function blocHTML(c, b, j) {
  const rt = c.runType, val = v => v === undefined || v === null ? "" : esc(v), done = blocDone(b);
  const u = unitOf(b, rt), old = rt === "seuil" ? u !== "min" : !["m", "s", "min"].includes(u);
  return `<div class="bloc${done ? " fini" : ""}">
    <div class="bloc-top"><span class="ex-num">${pad(j + 1)}</span>${old ? `<span class="bl-old">ancienne unité</span>` : ""}</div>
    <div class="bl-fmt">
      <label class="bl-cell"><input class="num bl-rep" id="bl-rep-${j}" data-f="bl-rep" data-b="${j}" inputmode="numeric" placeholder="10" value="${val(b.rep)}"${!done && b.left != null ? " disabled" : ""}><small>séries</small></label>
      <span class="times">×</span>
      <label class="bl-cell"><input class="num" id="bl-eff-${j}" data-f="bl-eff" data-b="${j}" inputmode="decimal" placeholder="${rt === "seuil" ? "10" : "200"}" value="${val(b.eff)}"><small>${rt === "seuil" ? "durée" : "durée / distance"}</small></label>
      <div class="bl-cell">${unitHTML(b, j, rt)}<small>unité</small></div>
    </div>
    <p class="bl-prev" id="bl-prev-${j}">Aperçu : <b>${esc(preview(b, rt))}</b></p>
    <div class="grid2"><label class="field"><span>Allure cible</span><input id="bl-pace-${j}" data-f="bl-pace" data-b="${j}" placeholder="3:45 /km" value="${val(b.pace)}"></label><label class="field"><span>Récup</span><input id="bl-rec-${j}" data-f="bl-rec" data-b="${j}" placeholder="1:00" value="${val(b.rec)}"></label></div>
    <div class="bl-count" id="bl-count-${j}">${countHTML(b, j)}</div>
    ${done ? `<p class="bl-dist" id="bl-dist-${j}">${distHTML(b, rt)}</p>` : `<button class="btn ex-fini" data-a="bl-fini" data-b="${j}">✓ Valider l'exercice</button>`}
    <div class="bloc-foot">${done ? `<button class="linkish" data-a="bl-open" data-b="${j}">Rouvrir</button>` : ""}
      <button class="bl-del" data-a="bl-del" data-b="${j}" aria-label="Supprimer le bloc ${j + 1}">Supprimer</button></div>
  </div>`;
}
export function courseHTML(c) {
  const r = c.run || {}, rt = RUN_TYPES.find(x => x.id === c.runType), blocks = r.blocks || [];
  const val = v => v === undefined || v === null ? "" : esc(v);
  // « Ma sortie » : endurance fondamentale, ou ancienne séance seuil / fractionné déjà remplie.
  const sortie = !blocsRun(c) || (blocsLegacy(r) && (r.dist || runSecs(r) || r.fc || r.dplus));
  return `<div class="chips" role="group" aria-label="Type de sortie">${RUN_TYPES.map(x => `<button class="chip" data-a="runtype" data-id="${x.id}" style="--tc:${x.color}" aria-pressed="${x.id === c.runType}"><i class="dot"></i>${esc(x.name)}</button>`).join("")}</div>
    ${rt ? `<p class="hint" style="margin-top:-6px">${esc(rt.hint)}</p>` : ""}
    ${sortie ? `<section class="card"><div class="lbl">Ma sortie</div>
      <div class="grid2">
        <label class="field"><span>Distance (km)</span><input id="rn-dist" data-f="run-dist" inputmode="decimal" placeholder="ex. 8,5" value="${val(r.dist)}"></label>
        <div class="field"><span>Durée (h : min : s)</span><div class="dur"><input id="rn-h" data-f="run-h" inputmode="numeric" placeholder="0" value="${val(r.h)}" aria-label="Heures"><i>:</i><input id="rn-m" data-f="run-m" inputmode="numeric" placeholder="45" value="${val(r.m)}" aria-label="Minutes"><i>:</i><input id="rn-s" data-f="run-s" inputmode="numeric" placeholder="00" value="${val(r.s)}" aria-label="Secondes"></div></div>
      </div>
      <div class="run-calc" id="runCalc">${runCalcHTML(r)}</div>
      <div class="grid2">
        <label class="field"><span>FC moyenne (bpm)</span><input id="rn-fc" data-f="run-fc" inputmode="numeric" placeholder="ex. 145" value="${val(r.fc)}"></label>
        <label class="field"><span>Dénivelé + (m)</span><input id="rn-dplus" data-f="run-dplus" inputmode="numeric" placeholder="ex. 120" value="${val(r.dplus)}"></label>
      </div>
    </section>` : ""}
    ${rt && rt.id !== "ef" ? `<section class="card"><div class="lbl">${rt.id === "seuil" ? "Blocs au seuil" : "Fractions"}</div>
      <p class="hint" style="margin-top:-4px">Ex. : ${rt.id === "seuil" ? "3 × 10 min à allure seuil, récup 2:00" : "10 × 200 m à 3:45 /km, récup 1:00"}</p>
      ${blocks.map((b, j) => blocHTML(c, b, j)).join("")}
      <button class="add-set" data-a="bl-add">+ Ajouter un bloc</button>
      <p class="bl-total" id="bl-total">${totalHTML(c)}</p></section>` : ""}
    ${effortCard(c, "Effort ressenti")}`;
}
