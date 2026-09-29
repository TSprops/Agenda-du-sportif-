// Séances : calendrier, fiche d'une séance, photos, types de séance.
import { $, BENCH, CALIS_MOVES, CF_MOVES, DAYS, DEFAULT_TYPES, DISC, MONTHS, MOODS, PALETTE, RUN_TYPES, S, WOD_FORMATS,
  WOD_HINTS, armed, cap, clone, dayMeta, dayOf, dayVolume, deleteDoc, discOf, doc, esc, exVolume, fmtDur, getDoc, isEmpty, key,
  nf, numOr, pad, parse, parseClock, runCalcHTML, runKm, runPace, runSecs, sessionsOn, setDoc, titleOf, todayK, typeOf, wodScore } from "./core.js";
import { persistDay, persistTypes, subCol, subDoc } from "./store.js";
import { renderCrossfit } from "./ideas.js";
import { RT, startIntervals, startRest } from "./timer.js";
import { norm } from "./faq.js";
import { myReactsHTML } from "./friends.js";
import { addExercise, announcePRs, cordesExHTML, cordesOf, freshKey, lastLineHTML, openLib, saveRoutineFromSession, sessTabsHTML,
  sessionPRs, toast } from "./workout.js";
import { myCommentsHTML } from "./social.js";
import { howBtnHTML } from "./howto.js";

/* ============================================================
   Séances : calendrier
   ============================================================ */
function renderMain() {
  const y = S.view.getFullYear(), m = S.view.getMonth();
  $("monthTitle").innerHTML = cap(MONTHS[m]) + " <small>" + y + "</small>";
  const first = (new Date(y, m, 1).getDay() + 6) % 7, count = new Date(y, m + 1, 0).getDate(), tk = todayK();
  let h = "";
  for (let i = 0; i < first; i++) h += '<span class="day pad" aria-hidden="true"></span>';
  for (let d = 1; d <= count; d++) {
    const k = key(new Date(y, m, d)), ks = sessionsOn(k), s = ks.length && S.days[ks[0]], mt = s && dayMeta(s);
    h += `<button class="day${s ? " has" : ""}${k === tk ? " today" : ""}" data-k="${k}" style="--tc:${mt ? mt.color : "#8A847E"}" aria-label="${d} ${MONTHS[m]}${s ? ", " + esc(ks.map(x => titleOf(S.days[x])).join(" et ")) : ""}"><span class="n">${d}</span>${s ? `<span class="t">${esc(mt.short)}</span>` : ""}${ks.length > 1 ? `<span class="more">+${ks.length - 1}</span>` : ""}</button>`;
  }
  $("grid").innerHTML = h;
  $("legend").innerHTML = S.types.filter(t => t.id !== "cordes").map(t => `<span style="--tc:${t.color}"><i class="dot"></i>${esc(t.name)}</span>`).join("")
    + `<span class="legend-sep">Autres activités</span>`
    + [["CrossFit", DISC.crossfit.color], ["Callisthénie", DISC.calis.color], ["Cordes", DISC.cordes.color], ...RUN_TYPES.map(r => [r.name, r.color])]
      .map(([n, c]) => `<span style="--tc:${c}"><i class="dot"></i>${esc(n)}</span>`).join("");
  const ks = Object.keys(S.days).filter(k => k.startsWith(y + "-" + pad(m + 1))).sort().reverse();
  const vol = ks.reduce((a, k) => a + dayVolume(S.days[k]), 0);
  const km = ks.reduce((a, k) => a + runKm(S.days[k]), 0);
  $("sumTitle").textContent = cap(MONTHS[m]) + " en chiffres";
  $("stats").innerHTML = `<div class="stat"><b>${ks.length}</b><span>séance${ks.length > 1 ? "s" : ""}</span></div><div class="stat"><b>${vol >= 10000 ? nf.format(vol / 1000) + " t" : nf.format(vol)}</b><span>${vol >= 10000 ? "soulevées" : "kg soulevés"}</span></div><div class="stat"><b>${nf.format(km)}</b><span>km courus</span></div>`;
  $("list").innerHTML = ks.length ? ks.map(k => {
    const s = S.days[k], mt = dayMeta(s), d = parse(k), ph = (s.photos || []).length;
    return `<div class="swipe"><div class="swipe-bg" aria-hidden="true">🗑 Supprimer</div><button class="row" data-k="${k}" style="--tc:${mt.color}"><i class="bar"></i><span class="d">${DAYS[d.getDay()].slice(0, 3)}<b>${d.getDate()}</b></span><span class="main"><div class="ti">${esc(titleOf(s))}</div><div class="me">${esc(sessionSummary(s))}${ph ? " · " + ph + " photo" + (ph > 1 ? "s" : "") : ""}</div></span><span aria-hidden="true" style="color:var(--red-hi)">›</span></button></div>`;
  }).join("") + `<p class="hint swipe-hint">Astuce : fais glisser une séance vers la droite pour la supprimer.</p>` : `<div class="empty">Aucune séance en ${MONTHS[m]}. Touche un jour du calendrier pour noter ton entraînement.</div>`;
}
// Résumé d'une séance sur une ligne (liste du mois, administration).
function sessionSummary(s, types) {
  const mt = dayMeta(s, types), disc = mt.disc;
  if (disc === "course") {
    const r = s.run || {}, parts = [mt.name];
    if (r.dist) parts.push(nf.format(r.dist) + " km");
    if (runSecs(r)) parts.push(fmtDur(runSecs(r)));
    if (runPace(r)) parts.push(runPace(r) + " /km");
    return parts.join(" · ");
  }
  if (disc === "crossfit") {
    const w = s.wod || {}, parts = ["CrossFit"];
    if (w.format) parts.push(w.format);
    const sc = wodScore(w); if (sc) parts.push(sc + (w.rx === false ? " (Scaled)" : w.rx ? " (Rx)" : ""));
    return parts.join(" · ");
  }
  const n = (s.exercises || []).length;
  return `${disc === "calis" ? "Callisthénie" : mt.name} · ${n} exercice${n > 1 ? "s" : ""}${dayVolume(s) ? " · " + nf.format(dayVolume(s)) + " kg" : ""}`;
}

/* ============================================================
   Séances : fiche du jour
   ============================================================ */
function rpeColor(v) { return v <= 6 ? "#2FBF71" : v <= 8 ? "#FF9F0A" : "#FF3B30"; }
function rpeLabel(v) { return !v ? "Non notée" : v <= 5 ? "Facile" : v === 6 ? "Modérée" : v === 7 ? "3 reps en réserve" : v === 8 ? "2 reps en réserve" : v === 9 ? "1 rep en réserve" : "Échec"; }
function effortLabel(v) { return !v ? "Non noté" : v <= 3 ? "Très facile" : v <= 5 ? "Facile" : v <= 7 ? "Soutenu" : v <= 9 ? "Très dur" : "Maximal"; }
function restOf(ex) { return typeof ex.rest === "number" ? ex.rest : 90; }
function fmtRest(v) { if (!v) return "Aucun"; const m = Math.floor(v / 60), sec = v % 60; return m ? m + " min" + (sec ? " " + pad(sec) : "") : sec + " s"; }
function exStats(ex, disc) {
  const s = (ex.sets || []).filter(x => x.reps !== "" || x.kg !== "");
  if (!s.length) return "Aucune série remplie";
  const best = Math.max(0, ...s.map(x => +x.kg || 0));
  if (disc === "calis") {
    const tot = s.reduce((a, x) => a + (+x.reps || 0), 0);
    return `${s.length} série${s.length > 1 ? "s" : ""} · ${ex.hold ? "total " + tot + " s de tenue" : "total " + tot + " reps"}${best ? " · lest max " + nf.format(best) + " kg" : ""}`;
  }
  const v = exVolume(ex);
  return `${s.length} série${s.length > 1 ? "s" : ""}${best ? " · max " + nf.format(best) + " kg" : ""}${v ? " · volume " + nf.format(v) + " kg" : ""}`;
}
// Dernière séance comparable, pour la reprendre (musculation : même type ; callisthénie : n'importe laquelle).
function lastComparable(c, before) {
  const disc = c.disc;
  if (disc !== "muscu" && disc !== "calis" && disc !== "cordes") return null;
  if (disc === "muscu" && !c.typeId) return null;
  const same = k => disc === "cordes" ? dayMeta(S.days[k]).disc === "cordes" : discOf(S.days[k]) === disc && (disc === "calis" || S.days[k].typeId === c.typeId);
  return Object.keys(S.days).filter(k => k < before && same(k) && (S.days[k].exercises || []).length).sort().pop();
}
// Progression des séries : une série est « faite » si elle est cochée ou si ses répétitions sont remplies.
// Une série n'est « faite » que si on la valide (bouton « Série finie » ou toucher sur son numéro).
// Pour les séances des jours passés notées avant cette règle, une série remplie compte comme faite.
function isDone(st) {
  if (st.done === true) return true;
  if (st.done === false) return false;
  return !!(S.open && dayOf(S.open) < todayK() && st.reps !== "" && st.reps != null);
}
const resting = i => !!(RT.tick && RT.ex === i && RT.day === S.open);
function activeSet(ex, i) {
  if (resting(i)) return -1;
  const sets = ex.sets || [];
  if (typeof ex.cur === "number" && sets[ex.cur] && !isDone(sets[ex.cur])) return ex.cur;
  return sets.findIndex(st => !isDone(st));
}
// Exercice en cours : celui choisi en dernier s'il reste des séries, sinon le premier non terminé.
function focusEx() {
  const L = (S.cur && S.cur.exercises) || [];
  if (RT.tick && RT.day === S.open && RT.ex != null && L[RT.ex]) return RT.ex;
  if (typeof S.cur.focus === "number" && L[S.cur.focus] && (L[S.cur.focus].sets || []).some(st => !isDone(st))) return S.cur.focus;
  return L.findIndex(ex => (ex.sets || []).some(st => !isDone(st)));
}
function setState(ex, j, i) {
  if (isDone(ex.sets[j])) return "done";
  if (j === activeSet(ex, i) && i === focusEx()) return "cur";
  if (resting(i) && j === (ex.sets || []).findIndex(st => !isDone(st))) return "next";
  return "";
}
function setNowText(ex, i) {
  const sets = ex.sets || [], n = sets.length; if (!n) return "";
  if (resting(i)) { const nx = sets.findIndex(st => !isDone(st)); return nx === -1 ? `<span class="ok">✓ Dernière série faite · repos</span>` : `⏸ Repos · série <b>${nx + 1}</b> ensuite`; }
  const a = activeSet(ex, i);
  if (a === -1) return `<span class="ok">✓ Toutes les séries sont faites</span>`;
  return i === focusEx() ? `<span class="dot-live"></span>Série en cours : <b>${a + 1}</b> / ${n}` : `À faire · ${sets.filter(isDone).length} / ${n} séries`;
}
function goLabel(ex, i) {
  const a = activeSet(ex, i);
  if (resting(i)) return "⏸ Repos en cours…";
  return a === -1 ? "⏱ Lancer un repos" : `✓ Série ${a + 1} finie · repos ${fmtRest(restOf(ex))}`;
}
function refreshAllSets() { ((S.cur && S.cur.exercises) || []).forEach((_, k) => refreshSets(k)); }
function refreshSets(i) {
  const ex = S.cur && S.cur.exercises && S.cur.exercises[i]; if (!ex) return;
  ex.sets.forEach((_, j) => { const r = $("row-" + i + "-" + j); if (r) r.className = setState(ex, j, i); });
  const sn = $("sn-" + i); if (sn) sn.innerHTML = setNowText(ex, i);
  const g = $("go-" + i); if (g) { g.textContent = goLabel(ex, i); g.disabled = resting(i); }
}
// Fin du repos : la série suivante s'allume et l'écran défile jusqu'à elle (ou jusqu'à l'exercice suivant).
function advanceAfterRest(i) {
  if (!S.cur || !S.cur.exercises || i == null) return;
  let ei = i, a = activeSet(S.cur.exercises[i], i);
  if (a === -1) { ei = S.cur.exercises.findIndex((ex, k) => k > i && activeSet(ex, k) !== -1); if (ei === -1) ei = S.cur.exercises.findIndex((ex, k) => activeSet(ex, k) !== -1); }
  S.cur.focus = ei === -1 ? null : ei; changed(); refreshAllSets();
  if (ei === -1) return;
  a = activeSet(S.cur.exercises[ei], ei);
  const row = $("row-" + ei + "-" + a);
  if (row) { row.classList.add("flash"); row.scrollIntoView({ block: "center", behavior: "smooth" }); setTimeout(() => row.classList.remove("flash"), 1600); }
}
function exHTML(ex, i, disc) {
  const r = ex.rpe || 0, calis = disc === "calis";
  const col1 = calis ? (ex.hold ? "Tenue (s)" : "Reps") : "Reps", col2 = calis ? "Lest (kg)" : "Poids (kg)";
  return `<article class="ex">
  <div class="ex-head"><span class="ex-num">${pad(i + 1)}</span><input id="exn-${i}" class="ex-name${ex.lock ? " locked" : ""}" data-f="ex-name" data-ex="${i}" placeholder="${calis ? "ex. Tractions" : "Nom de l’exercice"}" value="${esc(ex.name)}" autocomplete="off"${ex.lock ? ' readonly aria-readonly="true"' : ""}>${howBtnHTML(ex.name, i)}${calis ? `<button class="icon-btn" data-a="hold" data-ex="${i}" aria-label="Changer répétitions ou tenue">${ex.hold ? "Tenue" : "Reps"} ⇄</button>` : ""}<button class="icon-btn" data-a="del-ex" data-ex="${i}" aria-label="Supprimer l’exercice">Retirer</button></div>
  <div class="ex-last" id="el-${i}">${lastLineHTML(ex)}</div>
  <div class="ex-stats" id="st-${i}">${exStats(ex, disc)}</div>
  <div class="set-now" id="sn-${i}">${setNowText(ex, i)}</div>
  <table class="sets"><thead><tr><th style="text-align:center">Série</th><th>${col1}</th><th>${col2}</th><th></th></tr></thead><tbody>
  ${(ex.sets || []).map((s, j) => `<tr id="row-${i}-${j}" class="${setState(ex, j, i)}"><td class="n"><button class="set-n" data-a="set-toggle" data-ex="${i}" data-s="${j}" aria-label="Cocher ou décocher la série ${j + 1}">${j + 1}</button></td><td><input id="r-${i}-${j}" class="num" inputmode="numeric" data-f="reps" data-ex="${i}" data-s="${j}" value="${esc(s.reps)}" placeholder="${s.target !== undefined && s.target !== "" ? esc(s.target) : "–"}" aria-label="${col1} série ${j + 1}"></td><td><input id="k-${i}-${j}" class="num" inputmode="decimal" data-f="kg" data-ex="${i}" data-s="${j}" value="${esc(s.kg)}" placeholder="${calis ? "0" : "–"}" aria-label="${col2} série ${j + 1}"></td><td class="x"><button class="icon-btn" data-a="del-set" data-ex="${i}" data-s="${j}" aria-label="Supprimer la série ${j + 1}">−</button></td></tr>`).join("")}
  </tbody></table>
  <button class="btn primary set-go" id="go-${i}" data-a="set-go" data-ex="${i}"${resting(i) ? " disabled" : ""}>${goLabel(ex, i)}</button>
  <button class="add-set" data-a="add-set" data-ex="${i}">+ Ajouter une série</button>
  <div class="rest-row"><div class="lbl">Repos entre les séries</div><div class="rest-ctl"><button class="step" data-a="rest-dec" data-ex="${i}" aria-label="Moins de repos">−</button><span class="rest-val" id="rv-${i}">${fmtRest(restOf(ex))}</span><button class="step" data-a="rest-inc" data-ex="${i}" aria-label="Plus de repos">+</button></div></div>
  <div><div class="lbl">Difficulté (RPE) <em>${r ? r + "/10 · " : ""}${rpeLabel(r)}</em></div>
  <div class="rpe-row" role="group" aria-label="Difficulté de 1 à 10">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => `<button data-a="rpe" data-ex="${i}" data-v="${v}" class="${r && v < r ? "lit" : ""}" style="--rc:${rpeColor(r || v)}" aria-pressed="${v === r}">${v}</button>`).join("")}</div></div>
  <textarea id="exr-${i}" data-f="ex-note" data-ex="${i}" placeholder="Ressenti : technique, sensations, douleurs…" rows="2">${esc(ex.note)}</textarea>
  </article>`;
}
function photoTile(p, i) {
  const src = S.photoCache[p.pid];
  return src
    ? `<button class="ph" data-a="photo" data-i="${i}" aria-label="Voir la photo ${i + 1}"><img src="${esc(src)}" alt="" loading="lazy"></button>`
    : `<div class="ph wait">…</div>`;
}
function effortCard(c, label) {
  const r = c.rpe || 0;
  return `<section class="card"><div class="lbl">${label} <em>${r ? r + "/10 · " : ""}${effortLabel(r)}</em></div>
  <div class="rpe-row" role="group" aria-label="Effort de 1 à 10">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => `<button data-a="srpe" data-v="${v}" class="${r && v < r ? "lit" : ""}" style="--rc:${rpeColor(r || v)}" aria-pressed="${v === r}">${v}</button>`).join("")}</div></section>`;
}
function choiceHTML() {
  return `<h2 class="title-in" style="margin:0">Quelle activité ?</h2>
  <p class="hint" style="margin-top:-8px">Choisis ton sport du jour : chaque activité a sa propre fiche.</p>
  <div class="disc-grid">${Object.entries(DISC).map(([id, x]) => `<button class="disc-card" data-a="disc" data-id="${id}" style="--tc:${x.color}"><span class="disc-ico" aria-hidden="true"><svg viewBox="0 0 24 24">${x.icon}</svg></span><b>${x.name}</b><span>${x.desc}</span></button>`).join("")}</div>`;
}
function muscuHTML(c, k) {
  const t = typeOf(c.typeId), last = !(c.exercises || []).length ? lastComparable(c, k) : null;
  return `<div class="chips" role="group" aria-label="Type de séance">${S.types.filter(x => x.id !== "cordes" || c.typeId === "cordes").map(x => `<button class="chip" data-a="type" data-id="${x.id}" style="--tc:${x.color}" aria-pressed="${x.id === c.typeId}"><i class="dot"></i>${esc(x.name)}</button>`).join("")}</div>
    ${last ? `<button class="suggest" data-a="copy" data-k="${last}"><span style="flex:1"><b>Reprendre la dernière séance ${esc(t.name)}</b><span>${parse(last).getDate()} ${MONTHS[parse(last).getMonth()]} · ${(S.days[last].exercises || []).length} exercices, poids pré-remplis</span></span><span aria-hidden="true">›</span></button>` : ""}
    ${(c.exercises || []).map((ex, i) => exHTML(ex, i, "muscu")).join("")}
    <button class="add-ex" data-a="add-ex">+ Ajouter un exercice</button>
    ${(c.exercises || []).some(x => String(x.name || "").trim()) ? `<button class="btn" data-a="save-routine">☆ Enregistrer comme routine</button>` : ""}`;
}
function calisHTML(c, k) {
  const last = !(c.exercises || []).length ? lastComparable(c, k) : null;
  return `<section><div class="lbl" style="margin-bottom:8px">Ajout rapide</div>
    <div class="chips">${CALIS_MOVES.map(([n, hold]) => `<button class="chip" data-a="calis-add" data-name="${esc(n)}" data-hold="${hold ? 1 : ""}">+ ${esc(n)}</button>`).join("")}</div></section>
    ${last ? `<button class="suggest" data-a="copy" data-k="${last}"><span style="flex:1"><b>Reprendre ta dernière séance</b><span>${parse(last).getDate()} ${MONTHS[parse(last).getMonth()]} · ${(S.days[last].exercises || []).length} exercices</span></span><span aria-hidden="true">›</span></button>` : ""}
    ${(c.exercises || []).map((ex, i) => exHTML(ex, i, "calis")).join("")}
    <button class="add-ex" data-a="add-ex">+ Ajouter un exercice</button>
    ${(c.exercises || []).some(x => String(x.name || "").trim()) ? `<button class="btn" data-a="save-routine">☆ Enregistrer comme routine</button>` : ""}`;
}
// Les anciennes séances « Musculation · Cordes » deviennent des séances Cordes.
function normCordes(c) { if (c && c.disc === "muscu" && c.typeId === "cordes") { c.disc = "cordes"; c.typeId = null; } return c; }
function cordesHTML(c, k) {
  const last = !(c.exercises || []).length ? lastComparable(c, k) : null;
  return `<p class="hint" style="margin-top:-6px">Pour chaque exercice : nombre de cordes, départ toutes les X secondes ou minutes, avec ou sans lest.</p>
    ${last ? `<button class="suggest" data-a="copy" data-k="${last}"><span style="flex:1"><b>Reprendre ta dernière séance Cordes</b><span>${parse(last).getDate()} ${MONTHS[parse(last).getMonth()]} · ${(S.days[last].exercises || []).length} exercice${(S.days[last].exercises || []).length > 1 ? "s" : ""}</span></span><span aria-hidden="true">›</span></button>` : ""}
    ${(c.exercises || []).length ? "" : `<div class="chips">${["Montée de corde", "Montée de corde sans jambes"].map(n => `<button class="chip" data-a="cd-add" data-name="${esc(n)}">+ ${esc(n)}</button>`).join("")}</div>`}
    ${(c.exercises || []).map((ex, i) => cordesExHTML(ex, i)).join("")}
    <button class="add-ex" data-a="add-ex">+ Ajouter un exercice</button>
    ${(c.exercises || []).some(x => String(x.name || "").trim()) ? `<button class="btn" data-a="save-routine">☆ Enregistrer comme routine</button>` : ""}`;
}
function courseHTML(c) {
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
          <button class="unit" data-a="bl-unit" data-b="${j}" aria-label="Changer l’unité">${esc(b.unit || (rt.id === "seuil" ? "min" : "m"))}</button>
          <button class="icon-btn" data-a="bl-del" data-b="${j}" aria-label="Supprimer le bloc ${j + 1}">−</button></div>
        <div class="grid2"><label class="field"><span>Allure cible</span><input id="bl-pace-${j}" data-f="bl-pace" data-b="${j}" placeholder="3:45 /km" value="${val(b.pace)}"></label><label class="field"><span>Récup</span><input id="bl-rec-${j}" data-f="bl-rec" data-b="${j}" placeholder="1:00" value="${val(b.rec)}"></label></div>
        <button class="rest-go" data-a="bl-go" data-b="${j}" style="align-self:flex-start;margin-left:0">⏱ Lancer la récup</button>
      </div>`).join("")}
      <button class="add-set" data-a="bl-add">+ Ajouter un bloc</button></section>` : ""}
    ${effortCard(c, "Effort ressenti")}`;
}
function crossfitHTML(c) {
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
function renderSheet() {
  const c = S.cur, k = S.open, d = parse(k), disc = c.disc;
  const mt = disc ? dayMeta(c) : null;
  const el = $("sheet"), y = el.scrollTop;
  const dateTxt = `${cap(DAYS[d.getDay()])} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  let body;
  if (!disc) body = `${sessTabsHTML(c, k)}<p class="eyebrow">${dateTxt}</p>${choiceHTML()}`;
  else {
    const specific = disc === "muscu" ? muscuHTML(c, k) : disc === "calis" ? calisHTML(c, k) : disc === "cordes" ? cordesHTML(c, k) : disc === "course" ? courseHTML(c) : crossfitHTML(c);
    const ph = disc === "muscu" && mt && typeOf(c.typeId) ? mt.name : disc === "course" && c.runType ? mt.name : disc === "crossfit" ? "WOD du jour" : DISC[disc].name;
    body = `${sessTabsHTML(c, k)}<div class="disc-line"><p class="eyebrow">${dateTxt} · ${DISC[disc].name}</p><button class="linkish" data-a="change-disc">Changer d’activité</button></div>
    <div class="my-reacts" id="myReacts">${myReactsHTML(k)}</div>
    <input id="f-title" class="title-in" data-f="title" placeholder="${esc(ph)}" value="${esc(c.title)}" autocomplete="off" aria-label="Titre de la séance">
    ${specific}
    <section class="card"><div class="lbl">Ressenti général</div>
      <div class="chips">${MOODS.map(m => `<button class="chip" data-a="mood" data-v="${m}" style="--tc:var(--red)" aria-pressed="${c.mood === m}">${m}</button>`).join("")}</div>
      <textarea id="f-note" data-f="note" placeholder="Sommeil, énergie, ce qu’il faut changer la prochaine fois…" rows="3">${esc(c.note)}</textarea>
    </section>
    <section class="card"><div class="lbl">Photos <em>${(c.photos || []).length || ""}</em></div>
      <div class="photos">${(c.photos || []).map(photoTile).join("")}${'<div class="ph loading">Envoi…</div>'.repeat(S.uploading || 0)}
      <label class="ph-add" for="phIn"><span class="plus">+</span>Prendre une photo<input id="phIn" type="file" accept="image/*" multiple data-f="photo"></label></div>
      ${S.photoErr ? `<p class="err">${esc(S.photoErr)}</p>` : ""}
    </section>
    <section class="card" id="myComments">${myCommentsHTML(k)}</section>
    ${isEmpty(c) ? "" : `<button class="danger" data-a="del-session">Supprimer la séance</button>`}`;
  }
  el.innerHTML = `<div class="bar-top"><button class="link" data-a="close">‹ Calendrier</button><span class="save" id="saveState">${esc(S.saveMsg || "")}</span></div>
  <div class="sheet-body" style="--tc:${mt ? mt.color : "var(--red-hi)"}">${body}</div>`;
  el.scrollTop = y;
  if (disc) loadPhotos(c.photos || []);
}
const EMPTY_DAY = () => ({ disc: null, title: "", typeId: null, exercises: [], mood: null, note: "", photos: [] });
function setDisc(c, disc) {
  c.disc = disc;
  if (disc === "course") c.run = c.run || { blocks: [] };
  if (disc === "crossfit") c.wod = c.wod || { moves: [] };
  if (!c.exercises) c.exercises = [];
}
function openDay(k, preset) {
  S.open = k;
  const existing = S.days[k];
  S.cur = existing ? clone(existing) : EMPTY_DAY();
  if (existing && !S.cur.disc) S.cur.disc = "muscu"; // anciennes séances = musculation
  normCordes(S.cur);
  if (!existing && preset) setDisc(S.cur, preset);
  if (!S.cur.photos) S.cur.photos = [];
  S.saveMsg = ""; S.photoErr = "";
  S.prSeen = new Set(sessionPRs(S.cur, k).map(p => k + "|" + p.ex));
  renderSheet(); $("sheet").scrollTop = 0; $("sheet").classList.add("open"); document.body.style.overflow = "hidden"; document.body.classList.add("sheet-open");
}
function closeSheet() { flush(); $("sheet").classList.remove("open"); document.body.style.overflow = ""; document.body.classList.remove("sheet-open"); S.open = null; S.cur = null; S.photoErr = ""; renderMain(); if (S.screen === "crossfit") renderCrossfit(); }
function setSave(m) { S.saveMsg = m; const e = $("saveState"); if (e) e.textContent = m; }
let timer = null;
function changed() { clearTimeout(timer); timer = setTimeout(flush, 700); }
// Enregistre tout de suite (sans attendre la petite pause de saisie).
function forceFlush() { timer = 1; flush(); }
function flush() {
  if (!S.open || timer === null) return;
  clearTimeout(timer); timer = null;
  const k = S.open, c = S.cur;
  if (isEmpty(c)) { if (S.days[k]) { delete S.days[k]; persistDay(k, null); } }
  else {
    const prs = sessionPRs(c, k); c.prs = prs.map(p => p.ex + " · " + p.txt);
    const data = { ...clone(c), updatedAt: Date.now() }; S.days[k] = data; persistDay(k, data);
    announcePRs(prs, k);
  }
}
const intOr = v => { const n = parseInt(String(v), 10); return isFinite(n) ? n : ""; };
$("sheet").addEventListener("input", e => {
  const f = e.target.dataset.f; if (!f || !S.cur || f === "photo") return;
  const c = S.cur, i = +e.target.dataset.ex, j = +e.target.dataset.s, v = e.target.value, t = v.trim();
  if (f === "title") c.title = v; else if (f === "note") c.note = v;
  else if (f === "ex-name") { if (!c.exercises[i].lock) c.exercises[i].name = v; } else if (f === "ex-note") c.exercises[i].note = v;
  else if (f === "cd-ropes" || f === "cd-every" || f === "cd-kg") {
    const ex = c.exercises[i]; ex[f.slice(3)] = t === "" ? "" : f === "cd-ropes" ? intOr(v) : numOr(v);
    const g = $("cdgo-" + i); if (g) g.disabled = !(+ex.ropes && +ex.every);
  }
  else if (f === "reps" || f === "kg") { c.exercises[i].sets[j][f] = t === "" ? "" : numOr(v); $("st-" + i).textContent = exStats(c.exercises[i], c.disc); refreshAllSets(); }
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
  else if (a === "cd-unit") { const ex = c.exercises[i]; ex.unit = ex.unit === "min" ? "s" : "min"; }
  else if (a === "cd-lest") { c.exercises[i].lest = b.dataset.v === "1"; }
  else if (a === "cd-go") { const ex = c.exercises[i]; startIntervals((+ex.every || 0) * (ex.unit === "min" ? 60 : 1), +ex.ropes || 1, ex.name || "Corde"); return; }
  else if (a === "del-ex") { if (!armed(b, "Confirmer")) return; c.exercises.splice(i, 1); }
  else if (a === "add-set") { const s = c.exercises[i].sets, l = s[s.length - 1]; s.push(l ? { reps: "", kg: l.kg, target: l.reps !== "" && l.reps != null ? l.reps : (l.target ?? "") } : { reps: "", kg: "" }); }
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
  else if (a === "bl-del") { c.run.blocks.splice(+b.dataset.b, 1); }
  else if (a === "bl-unit") { const bl = c.run.blocks[+b.dataset.b], u = ["m", "km", "min", "s"]; bl.unit = u[(u.indexOf(bl.unit || "m") + 1) % u.length]; }
  else if (a === "bl-go") { const bl = c.run.blocks[+b.dataset.b]; startRest(parseClock(bl.rec) || 60, "Récup"); return; }
  else if (a === "wf") { c.wod.format = c.wod.format === b.dataset.v ? "" : b.dataset.v; }
  else if (a === "mv-add") { (c.wod.moves = c.wod.moves || []).push({ reps: "", name: "", kg: "" }); changed(); renderSheet(); const n = $("mv-name-" + (c.wod.moves.length - 1)); n && n.focus(); return; }
  else if (a === "mv-del") { c.wod.moves.splice(+b.dataset.m, 1); }
  else if (a === "rx") { const v = b.dataset.v === "rx"; c.wod.rx = c.wod.rx === v ? null : v; }
  else if (a === "copy") {
    const src = S.days[b.dataset.k];
    c.exercises = clone(src.exercises || []).map(x => ({ name: x.name, hold: !!x.hold, lock: true, ...cordesOf(x), sets: (x.sets || []).map(s => ({ reps: "", kg: s.kg, target: s.reps !== "" && s.reps != null ? s.reps : (s.target ?? "") })), rpe: 0, note: "", rest: restOf(x) }));
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

/* ============================================================
   Photos (stockées en JPEG compressé dans Firestore : reste gratuit)
   ============================================================ */
function compress(file, max, q) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      const r = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight)), w = Math.round(img.naturalWidth * r), h = Math.round(img.naturalHeight * r);
      const cv = document.createElement("canvas"); cv.width = w; cv.height = h; cv.getContext("2d").drawImage(img, 0, 0, w, h); URL.revokeObjectURL(url);
      cv.toBlob(b => b ? res(b) : rej(new Error("encode")), "image/jpeg", q);
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("decode")); };
    img.src = url;
  });
}
function blobToData(b) { return new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(b); }); }
const loading = new Set();
function loadPhotos(list) {
  const missing = list.map(p => p.pid).filter(id => id && !S.photoCache[id] && !loading.has(id));
  if (!missing.length) return;
  missing.forEach(id => loading.add(id));
  Promise.all(missing.map(id => getDoc(subDoc("photos", id)).then(s => { if (s.exists()) S.photoCache[id] = s.data().data; }).catch(() => {})))
    .then(() => { missing.forEach(id => loading.delete(id)); if (S.open) renderSheet(); });
}
function dropPhoto(pid) { deleteDoc(subDoc("photos", pid)).catch(() => {}); delete S.photoCache[pid]; }
async function addPhotos(files) {
  const k = S.open, target = S.cur; if (!k || !target) return;
  S.photoErr = ""; S.uploading = (S.uploading || 0) + files.length; renderSheet();
  for (const f of files) {
    try {
      let data = await blobToData(await compress(f, 1280, .72));
      if (data.length > 850000) data = await blobToData(await compress(f, 900, .6));
      // Identifiant créé tout de suite : la photo s'ajoute même sans réseau (envoyée au retour de la connexion).
      const ref = doc(subCol("photos")); setDoc(ref, { data, date: k, createdAt: Date.now() }).catch(() => {});
      S.photoCache[ref.id] = data;
      target.photos = target.photos || []; target.photos.push({ pid: ref.id });
    } catch (e) { S.photoErr = "La photo n’a pas pu être ajoutée. Réessaie."; }
    S.uploading--;
    if (S.open === k && S.cur === target) { changed(); renderSheet(); }
    else { const data = { ...clone(target), updatedAt: Date.now() }; S.days[k] = data; persistDay(k, data); renderMain(); }
  }
}
$("sheet").addEventListener("change", e => {
  if (e.target.dataset.f !== "photo") return;
  const fs = [...e.target.files]; e.target.value = ""; if (fs.length) addPhotos(fs);
});
let vIdx = -1;
function openViewer(i) { vIdx = i; $("viewerImg").src = S.photoCache[S.cur.photos[i].pid] || ""; $("viewer").hidden = false; }
$("viewer").addEventListener("click", e => {
  const b = e.target.closest("[data-a]"); if (!b) return;
  if (b.dataset.a === "vclose") { $("viewer").hidden = true; return; }
  if (b.dataset.a === "vdel") {
    if (!armed(b, "Confirmer la suppression")) return;
    const [p] = S.cur.photos.splice(vIdx, 1); $("viewer").hidden = true;
    forceFlush(); if (p && p.pid) dropPhoto(p.pid); renderSheet();
  }
});

/* ============================================================
   Types de séance
   ============================================================ */
function renderTypes() {
  $("typesSheet").innerHTML = `<div class="bar-top"><button class="link" data-a="close">‹ Calendrier</button><span class="save"></span></div>
  <div class="sheet-body"><h2 class="title-in" style="margin:0">Types de séance</h2>
  <p class="hint">Chaque type a sa couleur dans le calendrier. Touche la pastille pour changer de couleur.</p>
  <div class="card">${S.types.map((t, i) => `<div class="trow"><button class="swatch" data-a="color" data-i="${i}" style="--tc:${t.color}" aria-label="Changer la couleur de ${esc(t.name)}"></button><input id="tn-${t.id}" data-i="${i}" value="${esc(t.name)}" aria-label="Nom du type"><button class="icon-btn" data-a="del" data-i="${i}">Retirer</button></div>`).join("")}</div>
  <button class="add-ex" data-a="add">+ Nouveau type</button>
  <button class="danger" data-a="reset">Revenir aux types par défaut</button></div>`;
}
let tTimer = null;
$("typesSheet").addEventListener("input", e => {
  const i = e.target.dataset.i; if (i == null) return;
  S.types[+i].name = e.target.value; clearTimeout(tTimer); tTimer = setTimeout(persistTypes, 700);
});
$("typesSheet").addEventListener("click", e => {
  const b = e.target.closest("[data-a]"); if (!b) return;
  const a = b.dataset.a, i = +b.dataset.i;
  if (a === "close") { clearTimeout(tTimer); persistTypes(); $("typesSheet").classList.remove("open"); document.body.style.overflow = ""; document.body.classList.remove("sheet-open"); renderMain(); return; }
  if (a === "color") { const t = S.types[i]; t.color = PALETTE[(PALETTE.indexOf(t.color) + 1) % PALETTE.length]; }
  else if (a === "del") { if (!armed(b, "Confirmer")) return; S.types.splice(i, 1); }
  else if (a === "add") { const used = S.types.map(t => t.color); S.types.push({ id: "t" + Date.now().toString(36), name: "Nouveau type", color: PALETTE.find(c => !used.includes(c)) || PALETTE[0] }); }
  else if (a === "reset") { if (!armed(b, "Confirmer")) return; S.types = DEFAULT_TYPES.map(t => ({ ...t })); }
  persistTypes(); renderTypes();
});
$("grid").addEventListener("click", e => { const b = e.target.closest("[data-k]"); if (b) openDay(sessionsOn(b.dataset.k)[0] || b.dataset.k); });
$("list").addEventListener("click", e => { if (SW.moved) { SW.moved = false; return; } const b = e.target.closest("[data-k]"); b && openDay(b.dataset.k); });
// Glisser une séance vers la droite : demande de confirmation puis suppression.
const SW = { row: null, x0: 0, y0: 0, dx: 0, on: false, moved: false };
$("list").addEventListener("pointerdown", e => {
  const row = e.target.closest(".row"); if (!row || (e.pointerType === "mouse" && e.button !== 0)) return;
  Object.assign(SW, { row, x0: e.clientX, y0: e.clientY, dx: 0, on: false, moved: false });
});
$("list").addEventListener("pointermove", e => {
  if (!SW.row) return;
  const dx = e.clientX - SW.x0, dy = e.clientY - SW.y0;
  if (!SW.on) { if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) { SW.row = null; return; } if (dx > 12) { SW.on = true; SW.row.classList.add("dragging"); try { SW.row.setPointerCapture(e.pointerId); } catch (x) { /* rien */ } } else return; }
  SW.dx = Math.max(0, dx); SW.row.style.transform = `translateX(${SW.dx}px)`;
  SW.row.parentElement.classList.toggle("armed", SW.dx > 110);
});
function swipeEnd() {
  const r = SW.row; SW.row = null; if (!r || !SW.on) return;
  SW.moved = true; setTimeout(() => { SW.moved = false; }, 350);
  r.classList.remove("dragging"); r.parentElement.classList.remove("armed");
  const go2 = SW.dx > 110; r.style.transform = "";
  if (go2) askDelete(r.dataset.k);
}
$("list").addEventListener("pointerup", swipeEnd);
$("list").addEventListener("pointercancel", () => { if (SW.row) { SW.row.style.transform = ""; SW.row.classList.remove("dragging"); SW.row.parentElement.classList.remove("armed"); } SW.row = null; });
function askDelete(k) {
  const s = S.days[k]; if (!s) return;
  const d = parse(k);
  $("confirmText").textContent = `« ${titleOf(s)} » du ${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]} sera supprimée, avec ses photos. Cette action est définitive.`;
  $("confirmGo").onclick = () => { closeConfirm(); deleteSession(k); };
  $("confirmBackdrop").hidden = false; $("confirmSheet").hidden = false;
}
function closeConfirm() { $("confirmBackdrop").hidden = true; $("confirmSheet").hidden = true; }
$("confirmCancel").onclick = closeConfirm;
$("confirmBackdrop").onclick = closeConfirm;
function deleteSession(k) {
  const s = S.days[k]; if (!s) return;
  (s.photos || []).map(p => p.pid).filter(Boolean).forEach(dropPhoto);
  delete S.days[k]; persistDay(k, null); renderMain();
  toast("🗑 Séance supprimée");
}
$("prev").onclick = () => { S.view = new Date(S.view.getFullYear(), S.view.getMonth() - 1, 1); renderMain(); };
$("next").onclick = () => { S.view = new Date(S.view.getFullYear(), S.view.getMonth() + 1, 1); renderMain(); };
$("today").onclick = () => { const t = new Date(); S.view = new Date(t.getFullYear(), t.getMonth(), 1); renderMain(); openDay(sessionsOn(key(t))[0] || key(t)); };
$("types").onclick = () => { renderTypes(); $("typesSheet").scrollTop = 0; $("typesSheet").classList.add("open"); document.body.style.overflow = "hidden"; document.body.classList.add("sheet-open"); };
let sx = null;
$("seancesCal").addEventListener("touchstart", e => { sx = e.touches[0].clientX; }, { passive: true });
$("seancesCal").addEventListener("touchend", e => {
  if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; sx = null;
  if (Math.abs(dx) > 60) (dx < 0 ? $("next") : $("prev")).click();
}, { passive: true });
window.addEventListener("pagehide", flush);
document.addEventListener("visibilitychange", () => { if (document.hidden) flush(); });

export { EMPTY_DAY, advanceAfterRest, blobToData, changed, compress, fmtRest, forceFlush, intOr, isDone, normCordes, openDay,
  renderMain, renderSheet, restOf, sessionSummary, setDisc, setSave };
