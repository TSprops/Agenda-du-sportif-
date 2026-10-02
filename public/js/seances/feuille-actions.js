// Séances, fiche du jour : réactions aux saisies et aux boutons.
import { EMPTY_DAY, changed, closeSheet, flush, forceFlush, intOr, openDay, renderSheet, setDisc } from "./feuille.js";
import { hyroxSumHTML } from "./fiche-hyrox.js";
import { addPhotos, dropPhoto, openViewer } from "./photos.js";
import { activeSet, exStats, fmtRest, isDone, refreshAllSets, refreshSets, restOf } from "./series.js";
import { $, BENCH, S, armed, clone, dayOf, isEmpty, numOr, parseClock, runCalcHTML } from "../commun/core.js";
import { norm } from "../pages/faq.js";
import { startIntervals, startRest } from "../commun/timer.js";
import { addExercise, announcePRs, calisPlan, cordesOf, cordesPlan, departSummary, freshKey, openLib, saveRoutineFromSession, sessionPRs, toast } from "../entrainement/index.js";

// Résumé (nombre de départs, total) et bouton « Lancer » mis à jour pendant la saisie.
function refreshDepart(i) {
  const ex = S.cur.exercises[i], cd = ex.kind === "cordes", pl = cd ? cordesPlan(ex) : calisPlan(ex.dep);
  const sum = $((cd ? "cd" : "dp") + "-sum-" + i); if (sum) sum.innerHTML = departSummary(pl, cd ? "corde" : "rep");
  const g = $((cd ? "cd" : "dp") + "go-" + i); if (g) g.disabled = !pl;
}
$("sheet").addEventListener("input", e => {
  const f = e.target.dataset.f; if (!f || !S.cur || f === "photo") return;
  const c = S.cur, i = +e.target.dataset.ex, j = +e.target.dataset.s, v = e.target.value, t = v.trim();
  if (f === "title") c.title = v; else if (f === "note") c.note = v;
  else if (f === "ex-name") { if (!c.exercises[i].lock) c.exercises[i].name = v; } else if (f === "ex-note") c.exercises[i].note = v;
  else if (/^(cd|dp)-(per|every|dur|kg|ok)$/.test(f)) {
    // Départs réguliers : cordes (champs sur l'exercice) ou callisthénie (champs dans ex.dep).
    const ex = c.exercises[i], cd = f.startsWith("cd-"), o = cd ? ex : (ex.dep = ex.dep || {}), fld = f.slice(3);
    o[fld === "per" ? (cd ? "ropes" : "reps") : fld] = t === "" ? "" : fld === "per" || fld === "ok" ? intOr(v) : numOr(v);
    refreshDepart(i);
  }
  else if (f === "reps" || f === "kg") { c.exercises[i].sets[j][f] = t === "" ? "" : numOr(v); $("st-" + i).textContent = exStats(c.exercises[i], c.disc); refreshAllSets(); }
  else if (f === "hx-amt" || f === "hx-kg" || f === "hx-time") {
    const ex = c.exercises[i], fld = f.slice(3); ex[fld] = fld === "time" ? v : t === "" ? "" : fld === "amt" ? intOr(v) : numOr(v);
    const sm = $("hxSum"); if (sm) sm.innerHTML = hyroxSumHTML(c);
  }
  else if (f.startsWith("run-")) {
    const r = c.run = c.run || { blocks: [] }, fld = f.slice(4);
    r[fld] = t === "" ? "" : fld === "dist" ? numOr(v) : intOr(v);
    $("runCalc").innerHTML = runCalcHTML(r);
  }
  else if (f.startsWith("bl-")) {
    const b = c.run.blocks[+e.target.dataset.b], fld = f.slice(3);
    b[fld] = fld === "rep" ? (t === "" ? "" : intOr(v)) : fld === "eff" ? (t === "" ? "" : numOr(v)) : v;
  }
  else if (f.startsWith("wod-")) { c.wod[f.slice(4)] = f === "wod-cap" ? (t === "" ? "" : intOr(v)) : v; }
  else if (f.startsWith("mv-")) { const m = c.wod.moves[+e.target.dataset.m], fld = f.slice(3); m[fld] = fld === "kg" ? (t === "" ? "" : numOr(v)) : v; }
  else if (f.startsWith("sc-")) {
    const map = { "sc-min": "sMin", "sc-sec": "sSec", "sc-rounds": "rounds", "sc-reps": "reps", "sc-kg": "kg" };
    c.wod[map[f]] = t === "" ? "" : f === "sc-kg" ? numOr(v) : intOr(v);
  }
  changed();
});
$("sheet").addEventListener("click", e => {
  const b = e.target.closest("[data-a]"); if (!b) return;
  const a = b.dataset.a, c = S.cur, i = +b.dataset.ex;
  if (a === "close") return closeSheet();
  if (a === "disc") { setDisc(c, b.dataset.id); renderSheet(); $("sheet").scrollTop = 0; return; }
  if (a === "change-disc") {
    if (!isEmpty(c) && !armed(b, "Toucher à nouveau : le contenu sera effacé")) return;
    const keep = { title: c.title, mood: c.mood, note: c.note, photos: c.photos };
    S.cur = { ...EMPTY_DAY(), ...keep }; changed(); renderSheet(); $("sheet").scrollTop = 0; return;
  }
  if (a === "type") { c.typeId = c.typeId === b.dataset.id ? null : b.dataset.id; }
  else if (a === "runtype") {
    c.runType = c.runType === b.dataset.id ? null : b.dataset.id;
    const r = c.run = c.run || { blocks: [] }; r.blocks = r.blocks || [];
    if (c.runType && c.runType !== "ef" && !r.blocks.length) r.blocks.push({ rep: "", eff: "", unit: c.runType === "seuil" ? "min" : "m", pace: "", rec: "" });
  }
  else if (a === "mood") { c.mood = c.mood === b.dataset.v ? null : b.dataset.v; }
  else if (a === "add-ex") { openLib(name => addExercise(name), c.disc); return; }
  else if (a === "calis-add" || a === "cd-add") { addExercise(b.dataset.name, !!b.dataset.hold); return; }
  else if (a === "save-routine") { saveRoutineFromSession(c); b.textContent = "✓ Routine enregistrée"; b.disabled = true; return; }
  else if (a === "sess") { flush(); openDay(b.dataset.k); return; }
  else if (a === "sess-new") { flush(); openDay(freshKey(dayOf(S.open))); return; }
  else if (a === "hold") { c.exercises[i].hold = !c.exercises[i].hold; }
  else if (/^(cd|dp)-(unit|durunit|lest)$/.test(a)) {
    const ex = c.exercises[i], o = a.startsWith("cd-") ? ex : (ex.dep = ex.dep || {});
    if (a.endsWith("-lest")) o.lest = b.dataset.v === "1";
    else if (a.endsWith("-durunit")) o.durUnit = (o.durUnit || "min") === "min" ? "s" : "min";
    else o.unit = o.unit === "min" ? "s" : "min";
  }
  else if (a === "hx-unit") { const ex = c.exercises[i]; ex.unit = ex.unit === "reps" ? "m" : "reps"; }
  else if (a === "dp-mode") { const ex = c.exercises[i]; ex.mode = b.dataset.v || ""; if (ex.mode) ex.dep = ex.dep || { reps: "", every: "", unit: "min", dur: "", durUnit: "min", lest: false, kg: "", ok: "" }; }
  else if (a === "cd-go" || a === "dp-go") {
    const ex = c.exercises[i], pl = a === "cd-go" ? cordesPlan(ex) : calisPlan(ex.dep);
    if (!pl) { toast("Indique le temps entre deux départs et la durée."); return; }
    startIntervals(pl.every, pl.n, ex.name || (a === "cd-go" ? "Corde" : "Départ"), !!pl.dur); return;
  }
  else if (a === "del-ex") { if (!armed(b, "Confirmer")) return; c.exercises.splice(i, 1); }
  else if (a === "add-set") { const s = c.exercises[i].sets, l = s[s.length - 1]; s.push(l ? { reps: "", kg: l.kg, target: l.reps !== "" && l.reps != null ? l.reps : (l.target ?? "") } : { reps: "", kg: "" }); }
  else if (a === "kg-up") { const kg = +b.dataset.kg, from = +b.dataset.from; c.exercises[i].sets.forEach(st => { if (!st.done && (st.kg === "" || st.kg == null || +st.kg === from)) st.kg = kg; }); }
  else if (a === "del-set") { c.exercises[i].sets.splice(+b.dataset.s, 1); }
  else if (a === "photo") { openViewer(+b.dataset.i); return; }
  else if (a === "rest-inc" || a === "rest-dec") {
    const ex = c.exercises[i], v = Math.min(600, Math.max(0, restOf(ex) + (a === "rest-inc" ? 15 : -15)));
    ex.rest = v; $("rv-" + i).textContent = fmtRest(v); refreshSets(i); changed(); return;
  }
  else if (a === "rest-go" || a === "set-go") {
    const ex = c.exercises[i], cur = activeSet(ex, i);
    if (a === "set-go" && cur !== -1) {
      const st = ex.sets[cur]; st.done = true;
      if ((st.reps === "" || st.reps == null) && st.target !== undefined && st.target !== "") st.reps = st.target;
      const nx = ex.sets.findIndex(x => !isDone(x)); ex.cur = nx === -1 ? null : nx;
      const rIn = $("r-" + i + "-" + cur); if (rIn) rIn.value = st.reps ?? "";
      $("st-" + i).textContent = exStats(ex, c.disc); changed();
      announcePRs(sessionPRs(c, S.open), S.open);
    }
    c.focus = i; startRest(restOf(ex), ex.name, { day: S.open, ex: i }); refreshAllSets(); return;
  }
  else if (a === "set-toggle") {
    const ex = c.exercises[i], j = +b.dataset.s, st = ex.sets[j];
    st.done = !isDone(st); if (!st.done) { ex.cur = j; c.focus = i; }
    $("st-" + i).textContent = exStats(ex, c.disc); refreshAllSets(); changed(); return;
  }
  else if (a === "rpe") { const v = +b.dataset.v; c.exercises[i].rpe = c.exercises[i].rpe === v ? 0 : v; }
  else if (a === "srpe") { const v = +b.dataset.v; c.rpe = c.rpe === v ? 0 : v; }
  else if (a === "bl-add") { const bl = c.run.blocks, l = bl[bl.length - 1]; bl.push(l ? { ...l } : { rep: "", eff: "", unit: c.runType === "seuil" ? "min" : "m", pace: "", rec: "" }); }
  else if (a === "bl-del") { if (!armed(b, "Confirmer ?")) return; c.run.blocks.splice(+b.dataset.b, 1); }
  else if (a === "bl-unit") { const bl = c.run.blocks[+b.dataset.b], u = ["m", "km", "min", "s"]; bl.unit = u[(u.indexOf(bl.unit || "m") + 1) % u.length]; }
  else if (a === "bl-go") { const bl = c.run.blocks[+b.dataset.b]; startRest(parseClock(bl.rec) || 60, "Récup"); return; }
  else if (a === "wf") { c.wod.format = c.wod.format === b.dataset.v ? "" : b.dataset.v; }
  else if (a === "mv-add") { (c.wod.moves = c.wod.moves || []).push({ reps: "", name: "", kg: "" }); changed(); renderSheet(); const n = $("mv-name-" + (c.wod.moves.length - 1)); n && n.focus(); return; }
  else if (a === "mv-del") { c.wod.moves.splice(+b.dataset.m, 1); }
  else if (a === "rx") { const v = b.dataset.v === "rx"; c.wod.rx = c.wod.rx === v ? null : v; }
  else if (a === "copy") {
    const src = S.days[b.dataset.k];
    c.exercises = clone(src.exercises || []).map(x => ({ name: x.name, hold: !!x.hold, lock: true, ...cordesOf(x), ...(x.mode === "dep" && x.dep ? { mode: "dep", dep: { ...x.dep, ok: "" } } : {}), sets: (x.sets || []).map(s => ({ reps: "", kg: s.kg, target: s.reps !== "" && s.reps != null ? s.reps : (s.target ?? "") })), rpe: 0, note: "", rest: restOf(x) }));
    if (!String(c.title).trim()) c.title = src.title || "";
  }
  else if (a === "del-session") {
    if (!armed(b, "Toucher à nouveau pour supprimer")) return;
    const gone = (c.photos || []).map(p => p.pid).filter(Boolean);
    S.cur = EMPTY_DAY();
    forceFlush(); gone.forEach(dropPhoto); return closeSheet();
  }
  else return;
  changed(); renderSheet();
});
// Choisir un WOD de référence dans la liste pré-remplit le format et les mouvements.
$("sheet").addEventListener("change", e => {
  if (e.target.dataset.f !== "wod-name" || !S.cur || !S.cur.wod) return;
  const bm = BENCH.find(x => norm(x.name).trim() === norm(e.target.value).trim()); if (!bm) return;
  const w = S.cur.wod;
  if (!(w.moves || []).some(m => m.name)) w.moves = clone(bm.moves);
  if (!w.format) w.format = bm.type === "amrap" ? "AMRAP" : "For Time";
  if (!w.cap && bm.cap) w.cap = bm.cap;
  w.name = bm.name; changed(); renderSheet();
});
$("sheet").addEventListener("change", e => {
  if (e.target.dataset.f !== "photo") return;
  const fs = [...e.target.files]; e.target.value = ""; if (fs.length) addPhotos(fs);
});
