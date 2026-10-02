// Séances, fiche du jour : exercices de musculation et de calisthénie, photos, ressenti, choix de l'activité.
import { canFinish, effortLabel, exStats, fmtRest, goLabel, lastComparable, restOf, resting, rpeColor, rpeLabel, setNowText, setState } from "./series.js";
import { howBtnHTML } from "../comment-faire/index.js";
import { CALIS_MOVES, DISC, S, esc, fmtJourMois, nomEx, nomType, pad, parse, typeOf } from "../commun/core.js";
import { t } from "../commun/i18n.js";
import { calisPlan, departFields, departSummary, kgSuggestHTML, lastLineHTML } from "../entrainement/index.js";

function exHTML(ex, i, disc) {
  const r = ex.rpe || 0, calis = disc === "calis", dep = calis && !ex.hold && ex.mode === "dep";
  const col1 = t(calis && ex.hold ? "series.tenueS" : "series.reps"), col2 = t(calis ? "series.lestKg" : "series.poidsKg");
  return `<article class="ex">
  <div class="ex-head"><span class="ex-num">${pad(i + 1)}</span><input id="exn-${i}" class="ex-name${ex.lock ? " locked" : ""}" data-f="ex-name" data-ex="${i}" placeholder="${esc(t(calis ? "series.exempleCalis" : "series.nomExercice"))}" value="${esc(nomEx(ex.name))}" autocomplete="off"${ex.lock ? ' readonly aria-readonly="true"' : ""}>${howBtnHTML(ex.name, i)}${calis ? `<button class="icon-btn" data-a="hold" data-ex="${i}" aria-label="${esc(t("series.changerTenue"))}">${t(ex.hold ? "series.tenue" : "series.reps")} ⇄</button>` : ""}<button class="icon-btn" data-a="del-ex" data-ex="${i}" aria-label="${esc(t("series.supprimerExercice"))}">${t("complements.retirer")}</button></div>
  <div class="ex-last" id="el-${i}">${lastLineHTML(ex)}</div>
  ${disc === "muscu" ? `<div class="kg-tip" id="sg-${i}">${kgSuggestHTML(ex, i)}</div>` : ""}
  ${calis && !ex.hold ? `<div class="seg" role="group" aria-label="${esc(t("series.facon"))}"><button type="button" data-a="dp-mode" data-ex="${i}" data-v="" aria-pressed="${!dep}">${t("series.series")}</button><button type="button" data-a="dp-mode" data-ex="${i}" data-v="dep" aria-pressed="${dep}">${t("series.departs")}</button></div>` : ""}
  ${dep ? departsCalisHTML(ex, i) : `<div class="ex-stats" id="st-${i}">${exStats(ex, disc)}</div>
  <div class="set-now" id="sn-${i}">${setNowText(ex, i)}</div>
  <table class="sets"><thead><tr><th style="text-align:center">${t("series.serie")}</th><th>${col1}</th><th>${col2}</th><th></th></tr></thead><tbody>
  ${(ex.sets || []).map((s, j) => `<tr id="row-${i}-${j}" class="${setState(ex, j, i)}"><td class="n"><button class="set-n" data-a="set-toggle" data-ex="${i}" data-s="${j}" aria-label="${esc(t("series.passerA", { n: j + 1 }))}">${j + 1}</button></td><td><input id="r-${i}-${j}" class="num" inputmode="numeric" data-f="reps" data-ex="${i}" data-s="${j}" value="${esc(s.reps)}" placeholder="${s.target !== undefined && s.target !== "" ? esc(s.target) : "–"}" aria-label="${esc(t("series.champSerie", { champ: col1, n: j + 1 }))}"></td><td><input id="k-${i}-${j}" class="num" inputmode="decimal" data-f="kg" data-ex="${i}" data-s="${j}" value="${esc(s.kg)}" placeholder="${calis ? "0" : "–"}" aria-label="${esc(t("series.champSerie", { champ: col2, n: j + 1 }))}"></td><td class="x"><button class="icon-btn" data-a="del-set" data-ex="${i}" data-s="${j}" aria-label="${esc(t("series.supprimerSerie", { n: j + 1 }))}">−</button></td></tr>`).join("")}
  </tbody></table>
  <button class="btn primary set-go" id="go-${i}" data-a="set-go" data-ex="${i}"${resting(i) ? " disabled" : ""}${ex.fini ? " hidden" : ""}>${goLabel(ex, i)}</button>
  <button class="btn ex-fini" id="fini-${i}" data-a="ex-fini" data-ex="${i}"${canFinish(ex) ? "" : " hidden"}>${t("series.exerciceFini")}</button>
  <button class="add-set" data-a="add-set" data-ex="${i}">${t("series.ajouterSerie")}</button>
  <div class="rest-row"><div class="lbl">${t("series.reposEntre")}</div><div class="rest-ctl"><button class="step" data-a="rest-dec" data-ex="${i}" aria-label="${esc(t("series.moinsRepos"))}">−</button><span class="rest-val" id="rv-${i}">${fmtRest(restOf(ex))}</span><button class="step" data-a="rest-inc" data-ex="${i}" aria-label="${esc(t("series.plusRepos"))}">+</button></div></div>`}
  <div><div class="lbl">${t("series.difficulte")} <em>${r ? r + "/10 · " : ""}${rpeLabel(r)}</em></div>
  <div class="rpe-row" role="group" aria-label="${esc(t("series.difficulteAria"))}">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => `<button data-a="rpe" data-ex="${i}" data-v="${v}" class="${r && v < r ? "lit" : ""}" style="--rc:${rpeColor(r || v)}" aria-pressed="${v === r}">${v}</button>`).join("")}</div></div>
  <textarea id="exr-${i}" data-f="ex-note" data-ex="${i}" placeholder="${esc(t("series.notePlaceholder"))}" rows="2">${esc(ex.note)}</textarea>
  </article>`;
}
// Callisthénie en « départs » (comme les cordes) : X reps toutes les Y, pendant Z.
function departsCalisHTML(ex, i) {
  const d = ex.dep || {}, pl = calisPlan(d), val = v => v === undefined || v === null ? "" : esc(v);
  return `<p class="hint">${t("departs.aideCalis")}</p>
  ${departFields(d, i, "dp", t("departs.repsParDepart"), "reps", t("departs.exemple5"))}
  <div class="dep-sum" id="dp-sum-${i}">${departSummary(pl, "reps")}</div>
  <div class="field"><span>${t("departs.lest")}</span><div class="chips">
    <button type="button" class="chip" data-a="dp-lest" data-ex="${i}" data-v="0" style="--tc:var(--tc)" aria-pressed="${!d.lest}">${t("departs.sansLest")}</button>
    <button type="button" class="chip" data-a="dp-lest" data-ex="${i}" data-v="1" style="--tc:var(--tc)" aria-pressed="${!!d.lest}">${t("departs.leste")}</button>
  </div></div>
  ${d.lest ? `<label class="field"><span>${t("departs.poidsLest")}</span><input id="dp-kg-${i}" class="num" data-f="dp-kg" data-ex="${i}" inputmode="decimal" placeholder="${esc(t("departs.exemple5"))}" value="${val(d.kg)}"></label>` : ""}
  <label class="field"><span>${t("departs.reussis")}</span><input id="dp-ok-${i}" class="num" data-f="dp-ok" data-ex="${i}" inputmode="numeric" placeholder="${pl ? esc(t("departs.surN", { n: pl.n })) : "–"}" value="${val(d.ok)}"></label>
  <button class="btn primary set-go" id="dpgo-${i}" data-a="dp-go" data-ex="${i}"${pl ? "" : " disabled"}>${t("departs.lancer")}</button>`;
}
export function photoTile(p, i) {
  const src = S.photoCache[p.pid];
  return src
    ? `<button class="ph" data-a="photo" data-i="${i}" aria-label="${esc(t("photos.voir", { n: i + 1 }))}"><img src="${esc(src)}" alt="" loading="lazy"></button>`
    : `<div class="ph wait">…</div>`;
}
export function effortCard(c, label) {
  const r = c.rpe || 0;
  return `<section class="card"><div class="lbl">${label} <em>${r ? r + "/10 · " : ""}${effortLabel(r)}</em></div>
  <div class="rpe-row" role="group" aria-label="${esc(t("series.effortAria"))}">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => `<button data-a="srpe" data-v="${v}" class="${r && v < r ? "lit" : ""}" style="--rc:${rpeColor(r || v)}" aria-pressed="${v === r}">${v}</button>`).join("")}</div></section>`;
}
export function choiceHTML() {
  return `<h2 class="title-in" style="margin:0">${t("seances.quelleActivite")}</h2>
  <p class="hint" style="margin-top:-8px">${t("seances.choisisSport")}</p>
  <div class="disc-grid">${Object.entries(DISC).map(([id, x]) => `<button class="disc-card" data-a="disc" data-id="${id}" style="--tc:${x.color}"><span class="disc-ico" aria-hidden="true"><svg viewBox="0 0 24 24">${x.icon}</svg></span><b>${x.name}</b><span>${x.desc}</span></button>`).join("")}</div>`;
}
export function muscuHTML(c, k) {
  const ty = typeOf(c.typeId), last = !(c.exercises || []).length ? lastComparable(c, k) : null;
  return `<div class="chips" role="group" aria-label="${esc(t("types.titre"))}">${S.types.filter(x => x.id !== "cordes" || c.typeId === "cordes").map(x => `<button class="chip" data-a="type" data-id="${x.id}" style="--tc:${x.color}" aria-pressed="${x.id === c.typeId}"><i class="dot"></i>${esc(nomType(x.name))}</button>`).join("")}</div>
    ${last ? `<button class="suggest" data-a="copy" data-k="${last}"><span style="flex:1"><b>${esc(t("seances.reprendreType", { type: nomType(ty.name) }))}</b><span>${esc(fmtJourMois(parse(last)))} · ${t("seances.exercicesPreremplis", { n: (S.days[last].exercises || []).length })}</span></span><span aria-hidden="true">›</span></button>` : ""}
    ${(c.exercises || []).map((ex, i) => exHTML(ex, i, "muscu")).join("")}
    <button class="add-ex" data-a="add-ex">${t("seances.ajouterExercice")}</button>
    ${(c.exercises || []).some(x => String(x.name || "").trim()) ? `<button class="btn" data-a="save-routine">${t("seances.enregistrerRoutine")}</button>` : ""}`;
}
export function calisHTML(c, k) {
  const last = !(c.exercises || []).length ? lastComparable(c, k) : null;
  return `<section><div class="lbl" style="margin-bottom:8px">${t("complements.ajoutRapide")}</div>
    <div class="chips">${CALIS_MOVES.map(([n, hold]) => `<button class="chip" data-a="calis-add" data-name="${esc(n)}" data-hold="${hold ? 1 : ""}">+ ${esc(nomEx(n))}</button>`).join("")}</div></section>
    ${last ? `<button class="suggest" data-a="copy" data-k="${last}"><span style="flex:1"><b>${t("seances.reprendreDerniere")}</b><span>${esc(fmtJourMois(parse(last)))} · ${t("seances.exercices", { n: (S.days[last].exercises || []).length })}</span></span><span aria-hidden="true">›</span></button>` : ""}
    ${(c.exercises || []).map((ex, i) => exHTML(ex, i, "calis")).join("")}
    <button class="add-ex" data-a="add-ex">${t("seances.ajouterExercice")}</button>
    ${(c.exercises || []).some(x => String(x.name || "").trim()) ? `<button class="btn" data-a="save-routine">${t("seances.enregistrerRoutine")}</button>` : ""}`;
}
