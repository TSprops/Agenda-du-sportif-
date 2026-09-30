// Entraînement : routines (enregistrer, lancer, modifier).
import { openLib } from "./bibliotheque.js";
import { cordesOf, cordesText } from "./cordes.js";
import { prefillKg } from "./derniere-fois.js";
import { freshKey } from "./plusieurs-seances.js";
import { toast } from "./records.js";
import { $, DISC, S, armed, clone, dayMeta, esc, show, todayK, typeOf } from "../commun/core.js";
import { doneSet, ideaExercises, repsText } from "../idees/index.js";
import { EMPTY_DAY, fmtRest, forceFlush, normCordes, openDay, renderMain, renderSheet, restOf, setDisc } from "../seances/index.js";
import { go, saveProfile } from "../commun/store.js";

/* ============================================================
   Routines et programmes
   ============================================================ */
// Stockage : { n: nom, s: séries, r: reps, rest, h: tenue } (Firestore n'accepte pas les tableaux de tableaux).
export const toTuple = e => [e.n, e.s, e.r, e.rest, e.h, e.c || null];
export function routines() { return ((S.profile && S.profile.routines) || []).slice(); }
function saveRoutines(list) { return saveProfile({ routines: list }); }
export function saveRoutineFromSession(c) {
  const ex = (c.exercises || []).filter(x => String(x.name || "").trim()).map(x => {
    const sets = x.sets || [], last = sets.filter(doneSet).pop() || sets[sets.length - 1] || {};
    const r = sets.find(doneSet) ? sets.find(doneSet).reps : last.target ?? "";
    const out = { n: x.name.trim(), s: sets.length || 3, r: r === "" ? 10 : r, rest: restOf(x), h: !!x.hold };
    if (x.kind === "cordes") { const { kind, ...cd } = cordesOf(x); out.c = cd; out.s = 1; out.r = x.ropes || ""; }
    return out;
  });
  const name = String(c.title || "").trim() || (c.disc === "calis" || c.disc === "cordes" ? DISC[c.disc].name : dayMeta(c).name);
  const list = routines(); list.unshift({ id: "r" + Date.now().toString(36), name: name.slice(0, 40), disc: c.disc, typeId: c.typeId || null, ex });
  saveRoutines(list.slice(0, 40));
  toast("☆ Routine « " + esc(name) + " » enregistrée");
}
// Lance une séance (routine, programme) aujourd'hui : poids de la dernière fois déjà remplis.
export function startWorkout(w, extra) {
  const d = todayK(), k = freshKey(d);
  go("seances"); const t = new Date(); S.view = new Date(t.getFullYear(), t.getMonth(), 1); renderMain();
  openDay(k);
  S.cur = EMPTY_DAY(); setDisc(S.cur, w.disc || "muscu"); S.cur.title = w.name || "";
  if (w.disc === "course") {
    S.cur.runType = w.runType || null; S.cur.note = w.note || "";
    S.cur.run = { blocks: (w.blocks || []).map(([rep, eff, unit, pace, rec]) => ({ rep, eff, unit, pace, rec })), h: "", m: w.m || "", s: "" };
  } else {
    if (w.disc === "muscu") S.cur.typeId = S.types.some(x => x.id === w.typeId) ? w.typeId : null;
    S.cur.exercises = ideaExercises(w.ex).map((e, j) => ({ ...e, lock: true, ...(w.ex[j][5] ? { ...w.ex[j][5], kind: "cordes", sets: [] } : {}) }));
    prefillKg(S.cur.exercises, k);
  }
  if (extra) Object.assign(S.cur, extra);
  normCordes(S.cur);
  forceFlush(); renderSheet(); $("sheet").scrollTop = 0;
}
export function renderRoutines() {
  const list = routines();
  $("routinesBody").innerHTML = `<button class="btn primary" data-rnew="1">+ Créer une routine</button>
    <p class="hint">Astuce : dans une séance, touche « ☆ Enregistrer comme routine » pour la refaire en un toucher.</p>
    ${list.length ? `<div class="list">${list.map(r => {
      const col = r.disc === "calis" || r.disc === "cordes" ? DISC[r.disc].color : (typeOf(r.typeId) || {}).color || "var(--red-hi)";
      return `<article class="idea" style="--tc:${col}">
        <div class="idea-top"><b>${esc(r.name)}</b><span class="tag">${r.disc === "calis" || r.disc === "cordes" ? DISC[r.disc].name : esc((typeOf(r.typeId) || {}).name || "Musculation")}</span></div>
        <ul>${(r.ex || []).map(e => `<li>${esc(e.n)} — ${e.c ? esc(cordesText(e.c)) : esc(e.s) + " × " + esc(repsText(e.r, e.h))}</li>`).join("")}</ul>
        <div class="grid2"><button class="btn" data-redit="${r.id}">Modifier</button><button class="btn primary" data-rgo="${r.id}">Lancer</button></div>
      </article>`; }).join("")}</div>` : `<div class="empty">Pas encore de routine. Crée ta première : tes exercices, tes séries et tes temps de repos, prêts à lancer.</div>`}`;
}
$("routinesBody").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  if (b.dataset.rnew) { S.rEdit = { id: null, name: "", disc: "muscu", typeId: null, ex: [] }; go("routine"); return; }
  if (b.dataset.redit) { S.rEdit = clone(routines().find(r => r.id === b.dataset.redit)); go("routine"); return; }
  if (b.dataset.rgo) { const r = routines().find(x => x.id === b.dataset.rgo); if (r) startWorkout({ name: r.name, disc: r.disc, typeId: r.typeId, ex: (r.ex || []).map(toTuple) }); }
});
export function renderRoutine() {
  const r = S.rEdit; if (!r) { go("routines"); return; }
  $("routineTitle").textContent = r.id ? "Modifier" : "Nouvelle routine";
  $("routineBody").innerHTML = `<label class="field"><span>Nom de la routine</span><input id="rtn-name" value="${esc(r.name)}" placeholder="ex. Push du lundi" maxlength="40"></label>
    <div class="chips">${["muscu", "calis", "cordes"].map(d => `<button type="button" class="chip" data-rdisc="${d}" style="--tc:${DISC[d].color}" aria-pressed="${r.disc === d}">${DISC[d].name}</button>`).join("")}</div>
    ${r.disc === "muscu" ? `<div class="chips">${S.types.filter(t => t.id !== "repos" && t.id !== "cordes").map(t => `<button type="button" class="chip" data-rtype="${t.id}" style="--tc:${t.color}" aria-pressed="${r.typeId === t.id}"><i class="dot"></i>${esc(t.name)}</button>`).join("")}</div>` : ""}
    <div class="list">${r.ex.map((e, i) => `<div class="rt-ex card">
      <div class="rt-ex-top"><b>${esc(e.n)}</b><button type="button" class="icon-btn" data-rdel="${i}">Retirer</button></div>
      ${e.c ? `<p class="hint">${esc(cordesText(e.c))}</p>` : `<div class="grid3">
        <div class="field"><span>Séries</span><div class="rest-ctl"><button type="button" class="step" data-rset="${i}:-1" aria-label="Moins de séries">−</button><span class="rest-val">${e.s}</span><button type="button" class="step" data-rset="${i}:1" aria-label="Plus de séries">+</button></div></div>
        <label class="field"><span>${e.h ? "Secondes" : "Reps"}</span><input data-rreps="${i}" value="${esc(e.r)}" inputmode="text" placeholder="10"></label>
        <div class="field"><span>Repos</span><div class="rest-ctl"><button type="button" class="step" data-rrest="${i}:-15" aria-label="Moins de repos">−</button><span class="rest-val sm">${fmtRest(e.rest)}</span><button type="button" class="step" data-rrest="${i}:15" aria-label="Plus de repos">+</button></div></div>
      </div>`}</div>`).join("")}</div>
    <button type="button" class="add-ex" data-radd="1">+ Ajouter un exercice</button>
    <p class="err" id="rtnErr" hidden></p>
    <button type="button" class="btn primary" data-rsave="1">Enregistrer la routine</button>
    ${r.id ? `<button type="button" class="danger" data-rremove="1">Supprimer la routine</button>` : ""}`;
}
$("routineBody").addEventListener("input", e => {
  const r = S.rEdit; if (!r) return;
  if (e.target.id === "rtn-name") r.name = e.target.value;
  if (e.target.dataset.rreps) { const v = e.target.value.trim(), i = +e.target.dataset.rreps; r.ex[i].r = /^\d+$/.test(v) ? +v : v; }
});
$("routineBody").addEventListener("click", e => {
  const b = e.target.closest("button"), r = S.rEdit; if (!b || !r) return;
  if (b.dataset.rdisc) { r.disc = b.dataset.rdisc; renderRoutine(); return; }
  if (b.dataset.rtype) { r.typeId = r.typeId === b.dataset.rtype ? null : b.dataset.rtype; renderRoutine(); return; }
  if (b.dataset.rdel) { r.ex.splice(+b.dataset.rdel, 1); renderRoutine(); return; }
  if (b.dataset.rset) { const [i, d] = b.dataset.rset.split(":").map(Number); r.ex[i].s = Math.min(10, Math.max(1, r.ex[i].s + d)); renderRoutine(); return; }
  if (b.dataset.rrest) { const [i, d] = b.dataset.rrest.split(":").map(Number); r.ex[i].rest = Math.min(600, Math.max(0, r.ex[i].rest + d)); renderRoutine(); return; }
  if (b.dataset.radd) { openLib((name, hold) => { r.ex.push({ n: name, s: 3, r: hold ? 30 : 10, rest: 90, h: !!hold }); renderRoutine(); }, r.disc); return; }
  if (b.dataset.rsave) {
    if (!r.name.trim()) { show($("rtnErr"), "Donne un nom à ta routine."); return; }
    if (!r.ex.length) { show($("rtnErr"), "Ajoute au moins un exercice."); return; }
    const list = routines(), data = { ...r, name: r.name.trim().slice(0, 40), id: r.id || "r" + Date.now().toString(36) };
    const i = list.findIndex(x => x.id === data.id); if (i >= 0) list[i] = data; else list.unshift(data);
    saveRoutines(list.slice(0, 40)); S.rEdit = null; go("routines"); toast("✓ Routine enregistrée"); return;
  }
  if (b.dataset.rremove) { if (!armed(b, "Toucher à nouveau pour supprimer")) return; saveRoutines(routines().filter(x => x.id !== r.id)); S.rEdit = null; go("routines"); }
});
