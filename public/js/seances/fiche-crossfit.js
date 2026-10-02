// Séances, fiche du jour : CrossFit (WOD).
import { effortCard } from "./fiche-muscu-calis.js";
import { howBtnHTML } from "../comment-faire/index.js";
import { BENCH, DISC, WOD_FORMATS, WOD_HINTS, esc, nomEx, nomFormat } from "../commun/core.js";
import { t } from "../commun/i18n.js";

export function crossfitHTML(c) {
  const w = c.wod || {}, f = w.format, val = v => v === undefined || v === null ? "" : esc(v);
  const capLbl = t(f === "AMRAP" || f === "EMOM" || f === "Tabata" ? "crossfit.dureeMin" : "crossfit.timeCap");
  let score;
  if (f === "AMRAP") score = `<div class="grid2"><label class="field"><span>${t("crossfit.toursComplets")}</span><input id="sc-rounds" data-f="sc-rounds" inputmode="numeric" placeholder="${esc(t("crossfit.ex12"))}" value="${val(w.rounds)}"></label><label class="field"><span>${t("crossfit.plusReps")}</span><input id="sc-reps" data-f="sc-reps" inputmode="numeric" placeholder="${esc(t("departs.exemple5"))}" value="${val(w.reps)}"></label></div>`;
  else if (f === "EMOM" || f === "Tabata") score = `<label class="field"><span>${t(f === "EMOM" ? "crossfit.minutesReussies" : "crossfit.repsTotal")}</span><input id="sc-rounds" data-f="sc-rounds" inputmode="numeric" value="${val(w.rounds)}"></label>`;
  else if (f === "Force") score = `<label class="field"><span>${t("crossfit.chargeMax")}</span><input id="sc-kg" data-f="sc-kg" inputmode="decimal" placeholder="${esc(t("crossfit.ex100"))}" value="${val(w.kg)}"></label>`;
  else score = `<div class="field"><span>${t("crossfit.tempsFinal")}</span><div class="dur dur2"><input id="sc-min" data-f="sc-min" inputmode="numeric" placeholder="8" value="${val(w.sMin)}" aria-label="${esc(t("course.unites.min"))}"><i>:</i><input id="sc-sec" data-f="sc-sec" inputmode="numeric" placeholder="32" value="${val(w.sSec)}" aria-label="${esc(t("course.unites.s"))}"></div></div>`;
  return `<div class="chips" role="group" aria-label="${esc(t("crossfit.formatWod"))}">${WOD_FORMATS.map(x => `<button class="chip" data-a="wf" data-v="${x}" style="--tc:${DISC.crossfit.color}" aria-pressed="${x === f}">${esc(nomFormat(x))}</button>`).join("")}</div>
    ${f ? `<p class="hint" style="margin-top:-6px">${esc(WOD_HINTS[f])}</p>` : ""}
    <section class="card"><div class="lbl">${t("crossfit.leWod")}</div>
      <label class="field"><span>${t("crossfit.nomWod")}</span><input id="wd-name" data-f="wod-name" list="benchList" placeholder="${esc(t("crossfit.nomWodExemple"))}" value="${val(w.name)}" autocomplete="off"></label>
      <datalist id="benchList">${BENCH.map(b => `<option value="${esc(b.name)}">`).join("")}</datalist>
      <label class="field"><span>${capLbl}</span><input id="wd-cap" data-f="wod-cap" inputmode="numeric" placeholder="ex. 12" value="${val(w.cap)}"></label>
      <div class="lbl">${t("crossfit.mouvements")}</div>
      ${(w.moves || []).map((m, j) => `<div class="move"><input class="num mv-reps" id="mv-reps-${j}" data-f="mv-reps" data-m="${j}" placeholder="21" value="${val(m.reps)}" aria-label="${esc(t("crossfit.repetitions"))}"><div class="mv-name${m.name ? "" : " empty"}"><button type="button" class="mv-pick" id="mv-name-${j}" data-a="mv-pick" data-m="${j}" aria-label="${esc(m.name ? t("crossfit.changerMouvement", { nom: nomEx(m.name) }) : t("crossfit.choisirMouvement"))}"><b>${m.name ? esc(nomEx(m.name)) : t("crossfit.choisir")}</b>${m.name ? "" : '<span aria-hidden="true">›</span>'}</button>${howBtnHTML(m.name, "mv" + j)}</div><input class="num mv-kg" id="mv-kg-${j}" data-f="mv-kg" data-m="${j}" inputmode="decimal" placeholder="kg" value="${val(m.kg)}" aria-label="${esc(t("crossfit.chargeKg"))}"><button class="icon-btn" data-a="mv-del" data-m="${j}" aria-label="${esc(t("crossfit.supprimerMouvement"))}">−</button></div>`).join("")}
      <button class="add-set" data-a="mv-add">${t("crossfit.ajouterMouvement")}</button>
    </section>
    <section class="card"><div class="lbl">${t("crossfit.monScore")}</div>
      ${score}
      <div class="chips"><button class="chip" data-a="rx" data-v="rx" style="--tc:${DISC.crossfit.color}" aria-pressed="${w.rx === true}">${t("crossfit.rx")}</button><button class="chip" data-a="rx" data-v="scaled" style="--tc:${DISC.crossfit.color}" aria-pressed="${w.rx === false}">${t("crossfit.scaled")}</button></div>
    </section>
    <section class="card"><div class="lbl">${t("crossfit.forceTechnique")}</div>
      <textarea id="wd-strength" data-f="wod-strength" rows="2" placeholder="${esc(t("crossfit.forceExemple"))}">${esc(w.strength)}</textarea>
    </section>
    ${effortCard(c, t("crossfit.intensite"))}`;
}
