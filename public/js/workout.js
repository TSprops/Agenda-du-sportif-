// Saisie : plusieurs séances par jour, « dernière fois », cordes, bibliothèque, records en direct, routines et programmes.
import { $, DISC, EQUIP, EXERCISES, GROUPS, KEYWORDS, MUSCLES, PROGRAMS, S, armed, clone, dayMeta, dayOf, discOf, esc, isEmpty,
  nf, pad, plural, runPace, runSecs, sessionsOn, show, todayK, typeOf } from "./core.js";
import { go, refresh, saveProfile } from "./store.js";
import { EMPTY_DAY, changed, fmtRest, forceFlush, isDone, normCordes, openDay, renderMain, renderSheet, restOf, setDisc } from "./seances.js";
import { doneSet, ideaExercises, repsText, shortDate } from "./ideas.js";
import { norm } from "./faq.js";
import { muscleMini } from "./muscles.js";
import { howBtnHTML, moveOf } from "./howto.js";

/* ============================================================
   Plusieurs séances par jour
   ============================================================ */
function newSessionKey(d) {
  if (!S.days[d] && S.open !== d) return d;
  let n = 2; while (S.days[d + "~" + n] || S.open === d + "~" + n) n++;
  return d + "~" + n;
}
// Une séance vide du jour si elle existe, sinon une nouvelle.
function freshKey(d) {
  const ks = sessionsOn(d), empty = ks.find(k => isEmpty(S.days[k]));
  return empty || (ks.length ? newSessionKey(d) : d);
}
function sessTabsHTML(c, k) {
  const list = [...new Set([...sessionsOn(dayOf(k)), k])].sort();
  const others = list.filter(x => x !== k && S.days[x] && !isEmpty(S.days[x]));
  if (!others.length && isEmpty(c)) return "";
  return `<div class="sess-tabs" role="tablist" aria-label="Séances du jour">${list.filter(x => x === k || (S.days[x] && !isEmpty(S.days[x]))).map((x, i) => {
    const d = x === k ? c : S.days[x], mt = d && d.disc ? dayMeta(d) : null;
    return `<button type="button" role="tab" data-a="sess" data-k="${x}" aria-selected="${x === k}" style="--tc:${mt ? mt.color : "var(--muted)"}"><i class="dot"></i>Séance ${i + 1}${mt ? " · " + esc(mt.short) : ""}</button>`;
  }).join("")}${isEmpty(c) ? "" : `<button type="button" class="sess-add" data-a="sess-new">+ Autre séance</button>`}</div>`;
}

/* ============================================================
   « La dernière fois » : historique d'un exercice
   ============================================================ */
const exKey = n => norm(n).replace(/\s+/g, " ").trim();
// Séance la plus récente (avant « before ») où l'exercice a des séries remplies.
function exHistory(name, before) {
  const nk = exKey(name || ""); if (!nk) return null;
  const ks = Object.keys(S.days).filter(k => k < before).sort().reverse();
  for (const k of ks) {
    const ex = (S.days[k].exercises || []).find(x => exKey(x.name || "") === nk && (x.sets || []).some(doneSet));
    if (ex) return { k, ex };
  }
  return null;
}
const setTxt = (st, hold) => (hold ? st.reps + " s" : st.reps) + (+st.kg ? " × " + nf.format(st.kg) + " kg" : "");
function lastLineHTML(ex) {
  if (!S.open || !String(ex.name || "").trim()) return "";
  const h = exHistory(ex.name, S.open); if (!h) return "";
  const sets = h.ex.sets.filter(doneSet);
  return `<span class="ll-k">↺ ${esc(shortDate(h.k))}</span> ${esc(sets.map(st => setTxt(st, h.ex.hold)).join(" · "))}`;
}
// Pré-remplit les séries avec celles de la dernière fois (poids repris, répétitions en objectif).
function prefillFromLast(ex, before) {
  const h = exHistory(ex.name, before); if (!h) return false;
  ex.sets = h.ex.sets.filter(doneSet).map(st => ({ reps: "", kg: st.kg ?? "", target: st.reps }));
  ex.rest = restOf(h.ex); ex.hold = !!h.ex.hold;
  return true;
}
// Pour une routine ou une idée : reprend seulement les poids de la dernière fois.
function prefillKg(list, before) {
  list.forEach(ex => {
    const h = exHistory(ex.name, before); if (!h) return;
    const hs = h.ex.sets.filter(doneSet); if (!hs.length) return;
    ex.sets.forEach((st, j) => { if (st.kg === "" || st.kg == null) st.kg = (hs[j] || hs[hs.length - 1]).kg ?? ""; });
  });
}
const blankSets = n => Array.from({ length: n }, () => ({ reps: "", kg: "" }));
function addExercise(name, hold) {
  const c = S.cur; if (!c) return;
  const lib = libFind(name), ex = { name, hold: !!(hold || (lib && lib.hold)), sets: blankSets(3), rpe: 0, note: "", rest: 90 };
  if (c.disc === "cordes") {
    const h = lastCordes(name, S.open);
    Object.assign(ex, { kind: "cordes", sets: [], ropes: "", every: "", unit: "s", lest: false, kg: "" }, h ? cordesOf(h.ex) : {});
  } else prefillFromLast(ex, S.open);
  c.exercises.push(ex); changed(); renderSheet();
  const el = $("exn-" + (c.exercises.length - 1)); if (el) el.closest(".ex").scrollIntoView({ block: "start", behavior: "smooth" });
}
// Nom tapé à la main : si l'exercice est connu et encore vide, on reprend la dernière fois.
$("sheet").addEventListener("change", e => {
  if (e.target.dataset.f !== "ex-name" || !S.cur) return;
  const i = +e.target.dataset.ex, ex = S.cur.exercises[i]; if (!ex || ex.lock || ex.kind === "cordes") return;
  const blank = (ex.sets || []).every(st => (st.reps === "" || st.reps == null) && (st.kg === "" || st.kg == null) && !st.done);
  if (blank && prefillFromLast(ex, S.open)) { changed(); renderSheet(); }
  else if (!!moveOf(ex.name) !== !!document.querySelector(`[data-how="${i}"]`)) renderSheet(); // bouton « ? » à ajouter ou retirer
  else { const el = $("el-" + i); if (el) el.innerHTML = lastLineHTML(ex); }
});

/* ============================================================
   Séance « Cordes » : nombre de cordes, départ toutes les X, lest
   ============================================================ */
const CORDES_KEYS = ["ropes", "every", "unit", "lest", "kg"];
function cordesOf(x) { return x && x.kind === "cordes" ? { kind: "cordes", ...Object.fromEntries(CORDES_KEYS.map(k => [k, x[k] ?? (k === "unit" ? "s" : k === "lest" ? false : "")])) } : {}; }
function cordesText(x) {
  const p = [];
  if (x.ropes) p.push(plural(+x.ropes, "corde"));
  if (x.every) p.push("départ toutes les " + nf.format(x.every) + (x.unit === "min" ? " min" : " s"));
  p.push(x.lest ? "lesté" + (x.kg ? " " + nf.format(x.kg) + " kg" : "") : "sans lest");
  return p.join(" · ");
}
function lastCordes(name, before) {
  const nk = exKey(name || ""); if (!nk) return null;
  const k = Object.keys(S.days).filter(x => x < before).sort().reverse().find(x => (S.days[x].exercises || []).some(e => e.kind === "cordes" && exKey(e.name || "") === nk && +e.ropes));
  return k ? { k, ex: S.days[k].exercises.find(e => e.kind === "cordes" && exKey(e.name || "") === nk && +e.ropes) } : null;
}
function cordesExHTML(ex, i) {
  const h = S.open && lastCordes(ex.name, S.open), val = v => v === undefined || v === null ? "" : esc(v);
  return `<article class="ex cordes">
  <div class="ex-head"><span class="ex-num">${pad(i + 1)}</span><input id="exn-${i}" class="ex-name${ex.lock ? " locked" : ""}" data-f="ex-name" data-ex="${i}" placeholder="ex. Montée de corde" value="${esc(ex.name)}" autocomplete="off"${ex.lock ? ' readonly aria-readonly="true"' : ""}>${howBtnHTML(ex.name, i)}<button class="icon-btn" data-a="del-ex" data-ex="${i}" aria-label="Supprimer l’exercice">Retirer</button></div>
  ${h ? `<div class="ex-last"><span class="ll-k">↺ ${esc(shortDate(h.k))}</span> ${esc(cordesText(h.ex))}</div>` : ""}
  <div class="grid2">
    <label class="field"><span>Nombre de cordes</span><input id="cd-ropes-${i}" class="num" data-f="cd-ropes" data-ex="${i}" inputmode="numeric" placeholder="ex. 10" value="${val(ex.ropes)}"></label>
    <div class="field"><span>Départ toutes les</span><div class="cd-every"><input id="cd-every-${i}" class="num" data-f="cd-every" data-ex="${i}" inputmode="decimal" placeholder="${ex.unit === "min" ? "1" : "60"}" value="${val(ex.every)}"><button type="button" class="unit" data-a="cd-unit" data-ex="${i}" aria-label="Changer secondes ou minutes">${ex.unit === "min" ? "min" : "s"}</button></div></div>
  </div>
  <div class="field"><span>Lest</span><div class="chips">
    <button type="button" class="chip" data-a="cd-lest" data-ex="${i}" data-v="0" style="--tc:var(--tc)" aria-pressed="${!ex.lest}">Sans lest</button>
    <button type="button" class="chip" data-a="cd-lest" data-ex="${i}" data-v="1" style="--tc:var(--tc)" aria-pressed="${!!ex.lest}">Lesté</button>
  </div></div>
  ${ex.lest ? `<label class="field"><span>Poids du lest (kg)</span><input id="cd-kg-${i}" class="num" data-f="cd-kg" data-ex="${i}" inputmode="decimal" placeholder="ex. 5" value="${val(ex.kg)}"></label>` : ""}
  <button class="btn primary set-go" id="cdgo-${i}" data-a="cd-go" data-ex="${i}"${+ex.ropes && +ex.every ? "" : " disabled"}>⏱ Lancer les départs</button>
  <textarea id="exr-${i}" data-f="ex-note" data-ex="${i}" placeholder="Ressenti : prise, technique, fatigue…" rows="2">${esc(ex.note)}</textarea>
  </article>`;
}

/* ============================================================
   Bibliothèque d'exercices
   ============================================================ */
const LIB_ALL = EXERCISES.map(([name, m, sec, eq, hold]) => ({ name, m, s: sec, eq, hold: !!hold }));
function libList() { return [...((S.profile && S.profile.customEx) || []).map(x => ({ name: x.name, m: x.m || [], s: x.s || [], eq: "", hold: !!x.hold, custom: true })), ...LIB_ALL]; }
function libFind(name) { const k = exKey(name || ""); return libList().find(x => exKey(x.name) === k); }
// Muscles d'un exercice : bibliothèque, sinon mots-clés du nom.
function musclesOf(name) {
  const f = libFind(name); if (f && f.m.length) return { p: f.m, s: f.s || [] };
  const n = norm(name || "");
  const kw = KEYWORDS.find(([re]) => re.test(n));
  return kw ? { p: kw[1], s: kw[2] } : null;
}
const LIB = { cb: null, q: "", g: null, disc: "muscu" };
function openLib(cb, disc) {
  Object.assign(LIB, { cb, q: "", g: null, disc: disc || "muscu" });
  $("libQ").value = ""; renderLibChips(); renderLib();
  $("libSheet").scrollTop = 0; $("libSheet").classList.add("open"); document.body.classList.add("sheet-open");
}
function closeLib() { $("libSheet").classList.remove("open"); if (!$("sheet").classList.contains("open")) document.body.classList.remove("sheet-open"); }
function renderLibChips() {
  $("libChips").innerHTML = `<button type="button" class="chip" data-lg="" aria-pressed="${!LIB.g}" style="--tc:var(--red)">Tous</button>` +
    GROUPS.map(([id, n]) => `<button type="button" class="chip" data-lg="${id}" aria-pressed="${LIB.g === id}" style="--tc:var(--red)">${n}</button>`).join("");
}
function usedNames() {
  const seen = new Map();
  Object.keys(S.days).sort().reverse().forEach(k => (S.days[k].exercises || []).forEach(ex => { const n = String(ex.name || "").trim(); if (n && !seen.has(exKey(n))) seen.set(exKey(n), n); }));
  return seen;
}
function libRow(x, before) {
  const h = exHistory(x.name, before || "9999"), mus = (x.m || []).map(m => MUSCLES[m]).join(", ");
  return `<div class="lib-item"><button type="button" class="lib-row" data-lib="${esc(x.name)}" data-hold="${x.hold ? 1 : ""}">${muscleMini(x.m || [], x.s || [])}
    <span class="main"><b>${esc(x.name)}</b><span>${esc([mus, EQUIP[x.eq]].filter(Boolean).join(" · ") || "Exercice perso")}</span>
    ${h ? `<span class="lib-last">↺ ${esc(h.ex.sets.filter(doneSet).map(st => setTxt(st, h.ex.hold)).slice(0, 3).join(" · "))}</span>` : ""}</span><span class="plus" aria-hidden="true">+</span></button>${howBtnHTML(x.name, "lib")}</div>`;
}
function renderLib() {
  const q = exKey(LIB.q), grp = GROUPS.find(g => g[0] === LIB.g), all = libList(), before = S.open || "9999";
  const byKey = new Map(all.map(x => [exKey(x.name), x]));
  // Exercices déjà faits mais absents de la bibliothèque (noms tapés à la main).
  usedNames().forEach((n, k) => { if (!byKey.has(k)) { const mu = musclesOf(n); const x = { name: n, m: mu ? mu.p : [], s: mu ? mu.s : [], eq: "", hold: false, custom: true }; all.unshift(x); byKey.set(k, x); } });
  let list = all.filter(x => (!q || exKey(x.name).includes(q)) && (!grp || (x.m || []).some(m => grp[2].includes(m))));
  if (LIB.disc === "calis" && !q && !grp) list = list.filter(x => x.eq === "C" || x.custom);
  const recent = !q && !grp ? [...usedNames().keys()].slice(0, 8).map(k => byKey.get(k)).filter(Boolean) : [];
  const exact = q && all.some(x => exKey(x.name) === q);
  $("libList").innerHTML = `${q && !exact ? `<button type="button" class="lib-row lib-new" data-libnew="1"><span class="plus-big">+</span><span class="main"><b>Créer « ${esc(LIB.q.trim())} »</b><span>Ajouter ton propre exercice</span></span></button>` : ""}
    ${recent.length ? `<h3 class="h2">Tes exercices récents</h3><div class="lib-group">${recent.map(x => libRow(x, before)).join("")}</div>` : ""}
    ${list.length ? `<h3 class="h2">${q || grp ? list.length + " exercice" + (list.length > 1 ? "s" : "") : "Tous les exercices"}</h3><div class="lib-group">${list.filter(x => !recent.includes(x)).map(x => libRow(x, before)).join("")}</div>`
      : q ? "" : `<p class="hint">Aucun exercice dans ce groupe.</p>`}`;
}
$("libQ").addEventListener("input", e => { LIB.q = e.target.value; renderLib(); });
$("libSheet").addEventListener("click", e => {
  if (e.target.closest("#libClose")) { closeLib(); return; }
  const g = e.target.closest("[data-lg]"); if (g) { LIB.g = g.dataset.lg || null; renderLibChips(); renderLib(); return; }
  const n = e.target.closest("[data-libnew]");
  if (n) {
    const name = LIB.q.trim().slice(0, 60); if (!name) return;
    const mu = musclesOf(name), list = ((S.profile && S.profile.customEx) || []).filter(x => exKey(x.name) !== exKey(name));
    list.unshift({ name, m: mu ? mu.p : [], s: mu ? mu.s : [] }); saveProfile({ customEx: list.slice(0, 80) });
    closeLib(); LIB.cb && LIB.cb(name, false); return;
  }
  const r = e.target.closest("[data-lib]"); if (r) { closeLib(); LIB.cb && LIB.cb(r.dataset.lib, !!r.dataset.hold); }
});

/* ============================================================
   Records battus en direct
   ============================================================ */
// Meilleure série d'un exercice : charge max (et reps à cette charge), reps max.
function bestSets(sets, doneFn) {
  let kg = 0, rk = 0, reps = 0;
  (sets || []).filter(doneFn).forEach(st => { const k = +st.kg || 0, r = +st.reps || 0; if (!r) return; if (k > kg || (k === kg && r > rk)) { kg = k; rk = r; } if (r > reps) reps = r; });
  return { kg, rk, reps };
}
function exBestBefore(name, before) {
  const nk = exKey(name); let kg = 0, rk = 0, reps = 0, n = 0;
  Object.keys(S.days).forEach(k => { if (k >= before) return; (S.days[k].exercises || []).forEach(ex => {
    if (exKey(ex.name || "") !== nk) return; const b = bestSets(ex.sets, doneSet); if (!b.reps) return; n++;
    if (b.kg > kg || (b.kg === kg && b.rk > rk)) { kg = b.kg; rk = b.rk; } if (b.reps > reps) reps = b.reps;
  }); });
  return { kg, rk, reps, n };
}
// Records de la séance (par rapport à toutes les séances d'avant). Il faut au moins une séance d'avant pour comparer.
function sessionPRs(c, k) {
  const out = [], disc = c && c.disc;
  if (!c || !k) return out;
  if (disc === "muscu" || disc === "calis") {
    const seen = new Set();
    (c.exercises || []).forEach(ex => {
      const name = String(ex.name || "").trim(), nk = exKey(name); if (!name || seen.has(nk)) return;
      const cur = bestSets(ex.sets, st => isDone(st) && doneSet(st)); if (!cur.reps) return;
      const h = exBestBefore(name, k); if (!h.n) return;
      if (cur.kg > 0 && (cur.kg > h.kg || (cur.kg === h.kg && cur.rk > h.rk))) { seen.add(nk); out.push({ ex: name, txt: nf.format(cur.kg) + " kg × " + cur.rk }); }
      else if (!cur.kg && !h.kg && cur.reps > h.reps) { seen.add(nk); out.push({ ex: name, txt: cur.reps + (ex.hold ? " s" : " reps") }); }
    });
  } else if (disc === "course") {
    const r = c.run || {}, dist = +r.dist || 0, t = runSecs(r); if (!dist) return out;
    const prev = Object.keys(S.days).filter(x => x < k && discOf(S.days[x]) === "course" && S.days[x].run && +S.days[x].run.dist);
    if (!prev.length) return out;
    const maxD = Math.max(...prev.map(x => +S.days[x].run.dist));
    if (dist > maxD) out.push({ ex: "Plus longue sortie", txt: nf.format(dist) + " km" });
    if (t && dist >= 3) {
      const paces = prev.map(x => S.days[x].run).filter(p => +p.dist >= 3 && runSecs(p)).map(p => runSecs(p) / +p.dist);
      if (paces.length && t / dist < Math.min(...paces)) out.push({ ex: "Meilleure allure", txt: runPace(r) + " /km" });
    }
  }
  return out;
}
function announcePRs(prs, k) {
  if (!S.prSeen) S.prSeen = new Set();
  const fresh = prs.filter(p => !S.prSeen.has(k + "|" + p.ex));
  prs.forEach(p => S.prSeen.add(k + "|" + p.ex));
  if (!fresh.length) return;
  const p = fresh[0];
  toast(`<b>🏆 Nouveau record !</b><span>${esc(p.ex)} · ${esc(p.txt)}</span>`, "pr");
  if (navigator.vibrate) navigator.vibrate([80, 60, 160]);
}
let toastTimer = null;
function toast(html, kind) {
  const t = $("toast"); t.innerHTML = html; t.className = "toast" + (kind ? " " + kind : ""); t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, kind === "pr" ? 4200 : 2600);
}
$("toast").onclick = () => { $("toast").hidden = true; };

/* ============================================================
   Routines et programmes
   ============================================================ */
// Stockage : { n: nom, s: séries, r: reps, rest, h: tenue } (Firestore n'accepte pas les tableaux de tableaux).
const toTuple = e => [e.n, e.s, e.r, e.rest, e.h, e.c || null];
function routines() { return ((S.profile && S.profile.routines) || []).slice(); }
function saveRoutines(list) { return saveProfile({ routines: list }); }
function saveRoutineFromSession(c) {
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
function startWorkout(w, extra) {
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
function renderRoutines() {
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
function renderRoutine() {
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

// Programme suivi : { id, start, done } dans le profil.
function programState() {
  const p = S.profile && S.profile.program; if (!p) return null;
  const pg = PROGRAMS.find(x => x.id === p.id); if (!pg) return null;
  const done = p.done || 0, week = Math.floor(done / pg.perWeek) + 1, finished = week > pg.weeks;
  const plan = pg.plan(Math.min(week, pg.weeks)), next = plan[done % plan.length];
  return { p, pg, done, week, finished, next, total: pg.weeks * pg.perWeek, inWeek: done % pg.perWeek + 1 };
}
function programCardHTML(ps, compact) {
  if (!ps) return "";
  const pct = Math.min(100, Math.round(ps.done / ps.total * 100));
  return `<section class="prog-now" style="--tc:${ps.pg.color}">
    <div class="pn-top"><span class="tag">Mon programme</span><b>${esc(ps.pg.name)}</b></div>
    <div class="pn-bar"><i style="width:${pct}%"></i></div>
    <span class="hint">${ps.finished ? "Programme terminé, bravo ! 🎉" : `Semaine ${ps.week} / ${ps.pg.weeks} · séance ${ps.inWeek} / ${ps.pg.perWeek}`}</span>
    ${ps.finished ? `<button class="btn" data-pgstop="1">Choisir un autre programme</button>` : `<button class="btn primary" data-pgnext="1">▶ Lancer : ${esc(ps.next.name)}</button>`}
    ${compact ? "" : `<p class="hint">${esc(ps.pg.tip)}</p>`}
  </section>`;
}
function launchProgram() {
  const ps = programState(); if (!ps || ps.finished) return;
  startWorkout(ps.next, { program: { id: ps.pg.id, n: ps.done + 1 } });
  saveProfile({ program: { ...ps.p, done: ps.done + 1, last: todayK() } });
}
function renderPrograms() {
  const ps = programState();
  $("programsBody").innerHTML = `${programCardHTML(ps)}
    ${ps ? `<button class="linkish" data-pgstop="1">Arrêter ce programme</button>` : `<p class="hint" style="margin-top:-8px">Choisis un programme : l’app te propose la bonne séance à chaque fois, avec tes poids de la dernière fois.</p>`}
    <div class="list">${PROGRAMS.map(pg => {
      const cur = ps && ps.pg.id === pg.id, names = [...new Set(pg.plan(1).map(w => w.name))];
      return `<article class="idea" style="--tc:${pg.color}">
        <div class="idea-top"><b>${esc(pg.name)}</b><span class="tag">${esc(pg.level)}</span></div>
        <span class="idea-meta">${pg.weeks} semaines · ${pg.perWeek} séances par semaine</span>
        <p style="margin:0;font-size:14px">${esc(pg.desc)}</p>
        <ul>${names.map(n => `<li>${esc(n)}</li>`).join("")}</ul>
        ${cur ? `<span class="tag done" style="align-self:flex-start">Programme en cours</span>` : `<button class="btn primary idea-go" data-pgstart="${pg.id}">Suivre ce programme</button>`}
      </article>`; }).join("")}</div>`;
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-pgstart],[data-pgnext],[data-pgstop]"); if (!b) return;
  if (b.dataset.pgstart) {
    if (S.profile.program && !armed(b, "Remplacer ton programme actuel ?")) return;
    saveProfile({ program: { id: b.dataset.pgstart, start: todayK(), done: 0 } }); toast("✓ Programme choisi : c’est parti !"); refresh(); window.scrollTo(0, 0); return;
  }
  if (b.dataset.pgnext) { launchProgram(); return; }
  if (b.dataset.pgstop) { if (!armed(b, "Toucher à nouveau pour arrêter")) return; saveProfile({ program: null }); refresh(); }
});

export { addExercise, announcePRs, bestSets, cordesExHTML, cordesOf, cordesText, exKey, freshKey, lastLineHTML, musclesOf,
  openLib, prefillKg, programCardHTML, programState, renderPrograms, renderRoutine, renderRoutines, routines,
  saveRoutineFromSession, sessTabsHTML, sessionPRs, startWorkout, toTuple, toast };
