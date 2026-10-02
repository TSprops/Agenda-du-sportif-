// Séances, fiche du jour : exercices de musculation et de calisthénie, photos, ressenti, choix de l'activité.
import { canFinish, effortLabel, exStats, fmtRest, goLabel, lastComparable, restOf, resting, rpeColor, rpeLabel, setNowText, setState } from "./series.js";
import { howBtnHTML } from "../comment-faire/index.js";
import { CALIS_MOVES, DISC, MONTHS, S, esc, pad, parse, typeOf } from "../commun/core.js";
import { calisPlan, departFields, departSummary, kgSuggestHTML, lastLineHTML } from "../entrainement/index.js";

function exHTML(ex, i, disc) {
  const r = ex.rpe || 0, calis = disc === "calis", dep = calis && !ex.hold && ex.mode === "dep";
  const col1 = calis ? (ex.hold ? "Tenue (s)" : "Reps") : "Reps", col2 = calis ? "Lest (kg)" : "Poids (kg)";
  return `<article class="ex">
  <div class="ex-head"><span class="ex-num">${pad(i + 1)}</span><input id="exn-${i}" class="ex-name${ex.lock ? " locked" : ""}" data-f="ex-name" data-ex="${i}" placeholder="${calis ? "ex. Tractions" : "Nom de l’exercice"}" value="${esc(ex.name)}" autocomplete="off"${ex.lock ? ' readonly aria-readonly="true"' : ""}>${howBtnHTML(ex.name, i)}${calis ? `<button class="icon-btn" data-a="hold" data-ex="${i}" aria-label="Changer répétitions ou tenue">${ex.hold ? "Tenue" : "Reps"} ⇄</button>` : ""}<button class="icon-btn" data-a="del-ex" data-ex="${i}" aria-label="Supprimer l’exercice">Retirer</button></div>
  <div class="ex-last" id="el-${i}">${lastLineHTML(ex)}</div>
  ${disc === "muscu" ? `<div class="kg-tip" id="sg-${i}">${kgSuggestHTML(ex, i)}</div>` : ""}
  ${calis && !ex.hold ? `<div class="seg" role="group" aria-label="Façon de faire l’exercice"><button type="button" data-a="dp-mode" data-ex="${i}" data-v="" aria-pressed="${!dep}">Séries</button><button type="button" data-a="dp-mode" data-ex="${i}" data-v="dep" aria-pressed="${dep}">Départs</button></div>` : ""}
  ${dep ? departsCalisHTML(ex, i) : `<div class="ex-stats" id="st-${i}">${exStats(ex, disc)}</div>
  <div class="set-now" id="sn-${i}">${setNowText(ex, i)}</div>
  <table class="sets"><thead><tr><th style="text-align:center">Série</th><th>${col1}</th><th>${col2}</th><th></th></tr></thead><tbody>
  ${(ex.sets || []).map((s, j) => `<tr id="row-${i}-${j}" class="${setState(ex, j, i)}"><td class="n"><button class="set-n" data-a="set-toggle" data-ex="${i}" data-s="${j}" aria-label="Passer à la série ${j + 1}, ou la cocher">${j + 1}</button></td><td><input id="r-${i}-${j}" class="num" inputmode="numeric" data-f="reps" data-ex="${i}" data-s="${j}" value="${esc(s.reps)}" placeholder="${s.target !== undefined && s.target !== "" ? esc(s.target) : "–"}" aria-label="${col1} série ${j + 1}"></td><td><input id="k-${i}-${j}" class="num" inputmode="decimal" data-f="kg" data-ex="${i}" data-s="${j}" value="${esc(s.kg)}" placeholder="${calis ? "0" : "–"}" aria-label="${col2} série ${j + 1}"></td><td class="x"><button class="icon-btn" data-a="del-set" data-ex="${i}" data-s="${j}" aria-label="Supprimer la série ${j + 1}">−</button></td></tr>`).join("")}
  </tbody></table>
  <button class="btn primary set-go" id="go-${i}" data-a="set-go" data-ex="${i}"${resting(i) ? " disabled" : ""}${ex.fini ? " hidden" : ""}>${goLabel(ex, i)}</button>
  <button class="btn ex-fini" id="fini-${i}" data-a="ex-fini" data-ex="${i}"${canFinish(ex) ? "" : " hidden"}>✓ Exercice fini</button>
  <button class="add-set" data-a="add-set" data-ex="${i}">+ Ajouter une série</button>
  <div class="rest-row"><div class="lbl">Repos entre les séries</div><div class="rest-ctl"><button class="step" data-a="rest-dec" data-ex="${i}" aria-label="Moins de repos">−</button><span class="rest-val" id="rv-${i}">${fmtRest(restOf(ex))}</span><button class="step" data-a="rest-inc" data-ex="${i}" aria-label="Plus de repos">+</button></div></div>`}
  <div><div class="lbl">Difficulté (RPE) <em>${r ? r + "/10 · " : ""}${rpeLabel(r)}</em></div>
  <div class="rpe-row" role="group" aria-label="Difficulté de 1 à 10">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => `<button data-a="rpe" data-ex="${i}" data-v="${v}" class="${r && v < r ? "lit" : ""}" style="--rc:${rpeColor(r || v)}" aria-pressed="${v === r}">${v}</button>`).join("")}</div></div>
  <textarea id="exr-${i}" data-f="ex-note" data-ex="${i}" placeholder="Ressenti : technique, sensations, douleurs…" rows="2">${esc(ex.note)}</textarea>
  </article>`;
}
// Callisthénie en « départs » (comme les cordes) : X reps toutes les Y, pendant Z.
function departsCalisHTML(ex, i) {
  const d = ex.dep || {}, pl = calisPlan(d), val = v => v === undefined || v === null ? "" : esc(v);
  return `<p class="hint">Un départ toutes les X secondes ou minutes, pendant la durée choisie. Fais tes reps, puis repose-toi jusqu’au départ suivant.</p>
  ${departFields(d, i, "dp", "Reps par départ", "reps", "ex. 5")}
  <div class="dep-sum" id="dp-sum-${i}">${departSummary(pl, "rep")}</div>
  <div class="field"><span>Lest</span><div class="chips">
    <button type="button" class="chip" data-a="dp-lest" data-ex="${i}" data-v="0" style="--tc:var(--tc)" aria-pressed="${!d.lest}">Sans lest</button>
    <button type="button" class="chip" data-a="dp-lest" data-ex="${i}" data-v="1" style="--tc:var(--tc)" aria-pressed="${!!d.lest}">Lesté</button>
  </div></div>
  ${d.lest ? `<label class="field"><span>Poids du lest (kg)</span><input id="dp-kg-${i}" class="num" data-f="dp-kg" data-ex="${i}" inputmode="decimal" placeholder="ex. 5" value="${val(d.kg)}"></label>` : ""}
  <label class="field"><span>Départs réussis (à remplir après)</span><input id="dp-ok-${i}" class="num" data-f="dp-ok" data-ex="${i}" inputmode="numeric" placeholder="${pl ? "sur " + pl.n : "–"}" value="${val(d.ok)}"></label>
  <button class="btn primary set-go" id="dpgo-${i}" data-a="dp-go" data-ex="${i}"${pl ? "" : " disabled"}>⏱ Lancer les départs</button>`;
}
export function photoTile(p, i) {
  const src = S.photoCache[p.pid];
  return src
    ? `<button class="ph" data-a="photo" data-i="${i}" aria-label="Voir la photo ${i + 1}"><img src="${esc(src)}" alt="" loading="lazy"></button>`
    : `<div class="ph wait">…</div>`;
}
export function effortCard(c, label) {
  const r = c.rpe || 0;
  return `<section class="card"><div class="lbl">${label} <em>${r ? r + "/10 · " : ""}${effortLabel(r)}</em></div>
  <div class="rpe-row" role="group" aria-label="Effort de 1 à 10">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => `<button data-a="srpe" data-v="${v}" class="${r && v < r ? "lit" : ""}" style="--rc:${rpeColor(r || v)}" aria-pressed="${v === r}">${v}</button>`).join("")}</div></section>`;
}
export function choiceHTML() {
  return `<h2 class="title-in" style="margin:0">Quelle activité ?</h2>
  <p class="hint" style="margin-top:-8px">Choisis ton sport du jour : chaque activité a sa propre fiche.</p>
  <div class="disc-grid">${Object.entries(DISC).map(([id, x]) => `<button class="disc-card" data-a="disc" data-id="${id}" style="--tc:${x.color}"><span class="disc-ico" aria-hidden="true"><svg viewBox="0 0 24 24">${x.icon}</svg></span><b>${x.name}</b><span>${x.desc}</span></button>`).join("")}</div>`;
}
export function muscuHTML(c, k) {
  const t = typeOf(c.typeId), last = !(c.exercises || []).length ? lastComparable(c, k) : null;
  return `<div class="chips" role="group" aria-label="Type de séance">${S.types.filter(x => x.id !== "cordes" || c.typeId === "cordes").map(x => `<button class="chip" data-a="type" data-id="${x.id}" style="--tc:${x.color}" aria-pressed="${x.id === c.typeId}"><i class="dot"></i>${esc(x.name)}</button>`).join("")}</div>
    ${last ? `<button class="suggest" data-a="copy" data-k="${last}"><span style="flex:1"><b>Reprendre la dernière séance ${esc(t.name)}</b><span>${parse(last).getDate()} ${MONTHS[parse(last).getMonth()]} · ${(S.days[last].exercises || []).length} exercices, poids pré-remplis</span></span><span aria-hidden="true">›</span></button>` : ""}
    ${(c.exercises || []).map((ex, i) => exHTML(ex, i, "muscu")).join("")}
    <button class="add-ex" data-a="add-ex">+ Ajouter un exercice</button>
    ${(c.exercises || []).some(x => String(x.name || "").trim()) ? `<button class="btn" data-a="save-routine">☆ Enregistrer comme routine</button>` : ""}`;
}
export function calisHTML(c, k) {
  const last = !(c.exercises || []).length ? lastComparable(c, k) : null;
  return `<section><div class="lbl" style="margin-bottom:8px">Ajout rapide</div>
    <div class="chips">${CALIS_MOVES.map(([n, hold]) => `<button class="chip" data-a="calis-add" data-name="${esc(n)}" data-hold="${hold ? 1 : ""}">+ ${esc(n)}</button>`).join("")}</div></section>
    ${last ? `<button class="suggest" data-a="copy" data-k="${last}"><span style="flex:1"><b>Reprendre ta dernière séance</b><span>${parse(last).getDate()} ${MONTHS[parse(last).getMonth()]} · ${(S.days[last].exercises || []).length} exercices</span></span><span aria-hidden="true">›</span></button>` : ""}
    ${(c.exercises || []).map((ex, i) => exHTML(ex, i, "calis")).join("")}
    <button class="add-ex" data-a="add-ex">+ Ajouter un exercice</button>
    ${(c.exercises || []).some(x => String(x.name || "").trim()) ? `<button class="btn" data-a="save-routine">☆ Enregistrer comme routine</button>` : ""}`;
}
