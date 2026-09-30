// Séances, fiche du jour : CrossFit (WOD).
import { effortCard } from "./fiche-muscu-calis.js";
import { BENCH, CF_MOVES, DISC, WOD_FORMATS, WOD_HINTS, esc } from "../commun/core.js";

export function crossfitHTML(c) {
  const w = c.wod || {}, f = w.format, val = v => v === undefined || v === null ? "" : esc(v);
  const capLbl = f === "AMRAP" || f === "EMOM" || f === "Tabata" ? "Durée (min)" : "Time cap (min)";
  let score;
  if (f === "AMRAP") score = `<div class="grid2"><label class="field"><span>Tours complets</span><input id="sc-rounds" data-f="sc-rounds" inputmode="numeric" placeholder="ex. 12" value="${val(w.rounds)}"></label><label class="field"><span>+ Reps</span><input id="sc-reps" data-f="sc-reps" inputmode="numeric" placeholder="ex. 5" value="${val(w.reps)}"></label></div>`;
  else if (f === "EMOM" || f === "Tabata") score = `<label class="field"><span>${f === "EMOM" ? "Minutes réussies" : "Reps au total"}</span><input id="sc-rounds" data-f="sc-rounds" inputmode="numeric" value="${val(w.rounds)}"></label>`;
  else if (f === "Force") score = `<label class="field"><span>Charge max (kg)</span><input id="sc-kg" data-f="sc-kg" inputmode="decimal" placeholder="ex. 100" value="${val(w.kg)}"></label>`;
  else score = `<div class="field"><span>Temps final (min : s)</span><div class="dur dur2"><input id="sc-min" data-f="sc-min" inputmode="numeric" placeholder="8" value="${val(w.sMin)}" aria-label="Minutes"><i>:</i><input id="sc-sec" data-f="sc-sec" inputmode="numeric" placeholder="32" value="${val(w.sSec)}" aria-label="Secondes"></div></div>`;
  return `<div class="chips" role="group" aria-label="Format du WOD">${WOD_FORMATS.map(x => `<button class="chip" data-a="wf" data-v="${x}" style="--tc:${DISC.crossfit.color}" aria-pressed="${x === f}">${x}</button>`).join("")}</div>
    ${f ? `<p class="hint" style="margin-top:-6px">${esc(WOD_HINTS[f])}</p>` : ""}
    <section class="card"><div class="lbl">Le WOD</div>
      <label class="field"><span>Nom du WOD (facultatif)</span><input id="wd-name" data-f="wod-name" list="benchList" placeholder="ex. Fran, Murph, WOD du jour" value="${val(w.name)}" autocomplete="off"></label>
      <datalist id="benchList">${BENCH.map(b => `<option value="${esc(b.name)}">`).join("")}</datalist>
      <label class="field"><span>${capLbl}</span><input id="wd-cap" data-f="wod-cap" inputmode="numeric" placeholder="ex. 12" value="${val(w.cap)}"></label>
      <div class="lbl">Mouvements</div>
      ${(w.moves || []).map((m, j) => `<div class="move"><input class="num mv-reps" id="mv-reps-${j}" data-f="mv-reps" data-m="${j}" placeholder="21" value="${val(m.reps)}" aria-label="Répétitions"><input class="mv-name" id="mv-name-${j}" data-f="mv-name" data-m="${j}" list="moveList" placeholder="ex. Thrusters" value="${val(m.name)}" aria-label="Mouvement"><input class="num mv-kg" id="mv-kg-${j}" data-f="mv-kg" data-m="${j}" inputmode="decimal" placeholder="kg" value="${val(m.kg)}" aria-label="Charge en kg"><button class="icon-btn" data-a="mv-del" data-m="${j}" aria-label="Supprimer le mouvement">−</button></div>`).join("")}
      <datalist id="moveList">${CF_MOVES.map(m => `<option value="${esc(m)}">`).join("")}</datalist>
      <button class="add-set" data-a="mv-add">+ Ajouter un mouvement</button>
    </section>
    <section class="card"><div class="lbl">Mon score</div>
      ${score}
      <div class="chips"><button class="chip" data-a="rx" data-v="rx" style="--tc:${DISC.crossfit.color}" aria-pressed="${w.rx === true}">Rx (charges officielles)</button><button class="chip" data-a="rx" data-v="scaled" style="--tc:${DISC.crossfit.color}" aria-pressed="${w.rx === false}">Scaled (adapté)</button></div>
    </section>
    <section class="card"><div class="lbl">Force / technique (facultatif)</div>
      <textarea id="wd-strength" data-f="wod-strength" rows="2" placeholder="ex. Back squat 5×5 à 100 kg">${esc(w.strength)}</textarea>
    </section>
    ${effortCard(c, "Intensité ressentie")}`;
}
