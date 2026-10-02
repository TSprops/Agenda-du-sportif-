// Séances, fiche du jour : course à pied (blocs fractionné, seuil…).
import { effortCard } from "./fiche-muscu-calis.js";
import { RUN_TYPES, esc, pad, runCalcHTML } from "../commun/core.js";

// Unités d'un bloc, toujours visibles (distance ou durée).
const UNITS = [["m", "Mètres"], ["km", "Kilomètres"], ["min", "Minutes"], ["s", "Secondes"]];
export function courseHTML(c) {
  const r = c.run || {}, rt = RUN_TYPES.find(x => x.id === c.runType), blocks = r.blocks || [];
  const val = v => v === undefined || v === null ? "" : esc(v);
  return `<div class="chips" role="group" aria-label="Type de sortie">${RUN_TYPES.map(x => `<button class="chip" data-a="runtype" data-id="${x.id}" style="--tc:${x.color}" aria-pressed="${x.id === c.runType}"><i class="dot"></i>${esc(x.name)}</button>`).join("")}</div>
    ${rt ? `<p class="hint" style="margin-top:-6px">${esc(rt.hint)}</p>` : ""}
    <section class="card"><div class="lbl">Ma sortie</div>
      <div class="grid2">
        <label class="field"><span>Distance (km)</span><input id="rn-dist" data-f="run-dist" inputmode="decimal" placeholder="ex. 8,5" value="${val(r.dist)}"></label>
        <div class="field"><span>Durée (h : min : s)</span><div class="dur"><input id="rn-h" data-f="run-h" inputmode="numeric" placeholder="0" value="${val(r.h)}" aria-label="Heures"><i>:</i><input id="rn-m" data-f="run-m" inputmode="numeric" placeholder="45" value="${val(r.m)}" aria-label="Minutes"><i>:</i><input id="rn-s" data-f="run-s" inputmode="numeric" placeholder="00" value="${val(r.s)}" aria-label="Secondes"></div></div>
      </div>
      <div class="run-calc" id="runCalc">${runCalcHTML(r)}</div>
      <div class="grid2">
        <label class="field"><span>FC moyenne (bpm)</span><input id="rn-fc" data-f="run-fc" inputmode="numeric" placeholder="ex. 145" value="${val(r.fc)}"></label>
        <label class="field"><span>Dénivelé + (m)</span><input id="rn-dplus" data-f="run-dplus" inputmode="numeric" placeholder="ex. 120" value="${val(r.dplus)}"></label>
      </div>
    </section>
    ${rt && rt.id !== "ef" ? `<section class="card"><div class="lbl">${rt.id === "seuil" ? "Blocs au seuil" : "Fractions"}</div>
      <p class="hint" style="margin-top:-4px">Ex. : ${rt.id === "seuil" ? "3 × 10 min à allure seuil, récup 2:00" : "10 × 400 m à 3:45 /km, récup 1:00"}</p>
      ${blocks.map((b, j) => `<div class="bloc">
        <div class="bloc-top"><span class="ex-num">${pad(j + 1)}</span>
          <input class="num bl-rep" id="bl-rep-${j}" data-f="bl-rep" data-b="${j}" inputmode="numeric" placeholder="10" value="${val(b.rep)}" aria-label="Répétitions du bloc ${j + 1}"><span class="times">×</span>
          <input class="num" id="bl-eff-${j}" data-f="bl-eff" data-b="${j}" inputmode="decimal" placeholder="${rt.id === "seuil" ? "10" : "400"}" value="${val(b.eff)}" aria-label="Effort du bloc ${j + 1}">
</div>
        <div class="seg bl-units" role="group" aria-label="Unité du bloc ${j + 1}">${UNITS.map(([u, l]) => `<button type="button" data-a="bl-unit" data-b="${j}" data-u="${u}" aria-pressed="${u === (b.unit || (rt.id === "seuil" ? "min" : "m"))}" aria-label="${l}">${u}</button>`).join("")}</div>
        <div class="grid2"><label class="field"><span>Allure cible</span><input id="bl-pace-${j}" data-f="bl-pace" data-b="${j}" placeholder="3:45 /km" value="${val(b.pace)}"></label><label class="field"><span>Récup</span><input id="bl-rec-${j}" data-f="bl-rec" data-b="${j}" placeholder="1:00" value="${val(b.rec)}"></label></div>
        <div class="bloc-foot"><button class="rest-go" data-a="bl-go" data-b="${j}" style="margin-left:0">⏱ Lancer la récup</button>
          <button class="bl-del" data-a="bl-del" data-b="${j}" aria-label="Supprimer le bloc ${j + 1}">Supprimer</button></div>
      </div>`).join("")}
      <button class="add-set" data-a="bl-add">+ Ajouter un bloc</button></section>` : ""}
    ${effortCard(c, "Effort ressenti")}`;
}
