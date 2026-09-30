// CrossFit, idées de séances, records et courbes de progression.
import { $, BENCH, DEFAULT_TYPES, DISC, LIFTS, MAIN_DISC, RUN_TYPES, S, armed, clone, discOf, esc, fmtDur, isEmpty, key, nf,
  numOr, pad, parse, runPace, runSecs, sessionsOn, todayK, typeOf } from "./core.js";
import { go, saveProfile } from "./store.js";
import { EMPTY_DAY, fmtRest, forceFlush, intOr, normCordes, openDay, renderMain, renderSheet, setDisc } from "./seances/index.js";
import { norm } from "./faq.js";
import { freshKey, prefillKg, toast } from "./entrainement/index.js";

/* ============================================================
   CrossFit : records (1RM) et WOD de référence
   ============================================================ */
function cfData() { const cf = clone((S.profile && S.profile.cf) || {}); cf.prs = cf.prs || {}; cf.bench = cf.bench || {}; return cf; }
const MONTHS_S = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
function shortDate(k) { const d = parse(k); return d.getDate() + " " + MONTHS_S[d.getMonth()] + (d.getFullYear() !== new Date().getFullYear() ? " " + d.getFullYear() : ""); }
// Résultats d'un WOD de référence : ceux notés ici + ceux des séances du calendrier portant le même nom.
function benchEntries(bm) {
  const manual = (cfData().bench[bm.id] || []).map((e, idx) => ({ ...e, idx, manual: true }));
  const fromDays = Object.keys(S.days).filter(k => discOf(S.days[k]) === "crossfit" && S.days[k].wod && norm(S.days[k].wod.name || "").trim() === norm(bm.name).trim())
    .map(k => {
      const w = S.days[k].wod;
      if (bm.type === "amrap") return w.rounds !== "" && w.rounds != null ? { date: k, r: +w.rounds || 0, reps: +w.reps || 0, rx: w.rx } : null;
      const t = (+w.sMin || 0) * 60 + (+w.sSec || 0); return t ? { date: k, t, rx: w.rx } : null;
    }).filter(Boolean);
  return [...manual, ...fromDays].sort((a, b) => a.date < b.date ? 1 : -1);
}
function benchValue(bm, e) { return bm.type === "amrap" ? e.r * 1000 + (e.reps || 0) : -e.t; }
function benchText(bm, e) { return bm.type === "amrap" ? `${e.r} tours${e.reps ? " + " + e.reps : ""}` : fmtDur(e.t); }
function renderCrossfit() {
  const rec = S.cfMode === "records", cf = cfData(), tk = todayK(), ym = tk.slice(0, 7);
  $("cfTitle").textContent = rec ? "Records · CrossFit" : "Idées · CrossFit";
  $("cfBack").dataset.go = rec ? "records" : "types"; $("cfBack").textContent = rec ? "‹ Mes records" : "‹ Séances types";
  $("cfToday").hidden = rec; $("cfStats").hidden = !rec; $("cfPrSec").hidden = !rec;
  $("cfBenchTitle").textContent = rec ? "Mes temps sur les WOD de référence" : "WOD de référence à essayer";
  const cfDays = Object.keys(S.days).filter(k => discOf(S.days[k]) === "crossfit");
  const nPr = Object.values(cf.prs).filter(l => l.length).length;
  $("cfStats").innerHTML = `<div class="stat"><b>${cfDays.filter(k => k.startsWith(ym)).length}</b><span>WOD ce mois</span></div><div class="stat"><b>${cfDays.length}</b><span>WOD au total</span></div><div class="stat"><b>${nPr}</b><span>record${nPr > 1 ? "s" : ""}</span></div>`;
  $("cfPrs").innerHTML = LIFTS.map(([id, name]) => {
    const list = (cf.prs[id] || []).slice().sort((a, b) => b.kg - a.kg), best = list[0], open = S.cfOpen === "pr:" + id;
    return `<div class="pr${open ? " open" : ""}">
      <button class="pr-row" data-cf="pr:${id}"><span class="main"><b>${esc(name)}</b><span>${best ? "le " + esc(shortDate(best.date)) : "Pas encore de record"}</span></span><span class="pr-kg">${best ? nf.format(best.kg) + "<small> kg</small>" : "–"}</span><span class="arrow" aria-hidden="true">${open ? "−" : "+"}</span></button>
      ${open ? `<form class="pr-form" data-pr="${id}"><label class="field"><span>Nouvelle charge (kg)</span><input id="pr-kg" inputmode="decimal" placeholder="ex. 100" required></label><button class="btn primary" type="submit">Ajouter</button></form>
        ${list.length ? `<ul class="hist">${(cf.prs[id] || []).map((e, idx) => ({ ...e, idx })).sort((a, b) => a.date < b.date ? 1 : -1).map(e => `<li><span>${esc(shortDate(e.date))}</span><b>${nf.format(e.kg)} kg</b><button class="icon-btn" data-prdel="${id}:${e.idx}">Retirer</button></li>`).join("")}</ul>` : ""}` : ""}
    </div>`;
  }).join("");
  $("cfBench").innerHTML = BENCH.map(bm => {
    const ents = benchEntries(bm), best = ents.slice().sort((a, b) => benchValue(bm, b) - benchValue(bm, a))[0], open = rec && S.cfOpen === "bm:" + bm.id;
    if (!rec) return `<div class="bench"><div class="bench-top"><span class="main"><b>${esc(bm.name)}</b><span class="tag cf">${bm.type === "amrap" ? "AMRAP " + bm.cap + " min" : "For Time"}</span><span class="desc">${esc(bm.desc)}</span></span>
        <span class="bench-best">${best ? `<b>${esc(benchText(bm, best))}</b><small>ton record</small>` : ""}</span></div>
        <button class="btn primary idea-go cf-btn" data-bmwod="${bm.id}" style="margin-bottom:14px">Essayer aujourd’hui</button></div>`;
    return `<div class="bench${open ? " open" : ""}">
      <button class="bench-top" data-cf="bm:${bm.id}"><span class="main"><b>${esc(bm.name)}</b><span class="tag cf">${bm.type === "amrap" ? "AMRAP " + bm.cap + " min" : "For Time"}</span><span class="desc">${esc(bm.desc)}</span></span>
        <span class="bench-best">${best ? `<b>${esc(benchText(bm, best))}</b><small>${best.rx === false ? "Scaled" : best.rx ? "Rx" : "record"}</small>` : `<small>À tenter</small>`}</span></button>
      ${open ? `<form class="pr-form" data-bm="${bm.id}">
          ${bm.type === "amrap"
            ? `<div class="grid2"><label class="field"><span>Tours</span><input id="bm-r" inputmode="numeric" required></label><label class="field"><span>+ Reps</span><input id="bm-reps" inputmode="numeric"></label></div>`
            : `<div class="field"><span>Ton temps (min : s)</span><div class="dur dur2"><input id="bm-m" inputmode="numeric" placeholder="4" required aria-label="Minutes"><i>:</i><input id="bm-s" inputmode="numeric" placeholder="35" aria-label="Secondes"></div></div>`}
          <div class="chips"><button type="button" class="chip" data-bmrx="1" aria-pressed="${S.bmRx !== false}" style="--tc:${DISC.crossfit.color}">Rx</button><button type="button" class="chip" data-bmrx="0" aria-pressed="${S.bmRx === false}" style="--tc:${DISC.crossfit.color}">Scaled</button></div>
          <button class="btn primary" type="submit">Enregistrer mon résultat</button>
        </form>
        ${ents.length ? `<ul class="hist">${ents.slice(0, 8).map(e => `<li><span>${esc(shortDate(e.date))}</span><b>${esc(benchText(bm, e))}</b><small>${e.rx === false ? "Scaled" : e.rx ? "Rx" : ""}</small>${e.manual ? `<button class="icon-btn" data-bmdel="${bm.id}:${e.idx}">Retirer</button>` : `<small class="src">séance</small>`}</li>`).join("")}</ul>` : ""}
` : ""}
    </div>`;
  }).join("");
}
$("cfToday").onclick = () => { go("seances"); openDay(freshKey(todayK()), "crossfit"); };
$("v-crossfit").addEventListener("click", e => {
  const t = e.target.closest("[data-cf]");
  if (t) { S.cfOpen = S.cfOpen === t.dataset.cf ? null : t.dataset.cf; S.bmRx = true; renderCrossfit(); return; }
  const rx = e.target.closest("[data-bmrx]");
  if (rx) { S.bmRx = rx.dataset.bmrx === "1"; rx.parentElement.querySelectorAll("[data-bmrx]").forEach(x => x.setAttribute("aria-pressed", String(x === rx))); return; }
  const pd = e.target.closest("[data-prdel]");
  if (pd) { if (!armed(pd, "Confirmer")) return; const [id, idx] = pd.dataset.prdel.split(":"); const cf = cfData(); cf.prs[id].splice(+idx, 1); saveProfile({ cf }); renderCrossfit(); return; }
  const bd = e.target.closest("[data-bmdel]");
  if (bd) { if (!armed(bd, "Confirmer")) return; const [id, idx] = bd.dataset.bmdel.split(":"); const cf = cfData(); cf.bench[id].splice(+idx, 1); saveProfile({ cf }); renderCrossfit(); return; }
  const bw = e.target.closest("[data-bmwod]");
  if (bw) {
    const bm = BENCH.find(x => x.id === bw.dataset.bmwod);
    tryIdea(bw, "crossfit", c => { c.title = bm.name; Object.assign(c.wod, { name: bm.name, format: bm.type === "amrap" ? "AMRAP" : "For Time", cap: bm.cap || "", moves: clone(bm.moves) }); });
  }
});
$("v-crossfit").addEventListener("submit", e => {
  e.preventDefault();
  const f = e.target, cf = cfData(), date = todayK();
  if (f.dataset.pr) {
    const kg = numOr($("pr-kg").value); if (kg === "" || kg <= 0) return;
    (cf.prs[f.dataset.pr] = cf.prs[f.dataset.pr] || []).push({ kg, date });
  } else if (f.dataset.bm) {
    const bm = BENCH.find(x => x.id === f.dataset.bm), entry = { date, rx: S.bmRx !== false };
    if (bm.type === "amrap") { const r = intOr($("bm-r").value); if (r === "") return; entry.r = r; entry.reps = intOr($("bm-reps").value) || 0; }
    else { const t = (intOr($("bm-m").value) || 0) * 60 + (intOr($("bm-s").value) || 0); if (!t) return; entry.t = t; }
    (cf.bench[bm.id] = cf.bench[bm.id] || []).push(entry);
  }
  saveProfile({ cf }); renderCrossfit();
});

/* ============================================================
   Séances types : idées de séances et records par activité
   ============================================================ */
// Exercice d'une idée : [nom, séries, répétitions (nombre, texte ou liste par série), repos en s, tenue ?]
const MUSCU_IDEAS = {
  push: [
    { name: "Push force", level: "Intermédiaire", dur: "60 min", ex: [["Développé couché", 5, 5, 180], ["Développé militaire", 4, 6, 150], ["Dips lestés", 3, 8, 120], ["Développé incliné haltères", 3, 10, 90], ["Extensions triceps poulie", 3, 12, 60]] },
    { name: "Push volume", level: "Tous niveaux", dur: "55 min", ex: [["Développé incliné haltères", 4, 10, 90], ["Développé couché machine", 3, 12, 90], ["Écartés poulie", 3, 15, 60], ["Élévations latérales", 4, 15, 60], ["Barre au front", 3, 12, 60], ["Extensions triceps corde", 3, 15, 45]] }
  ],
  pull: [
    { name: "Pull force", level: "Intermédiaire", dur: "60 min", ex: [["Soulevé de terre", 4, 5, 180], ["Tractions lestées", 4, 6, 150], ["Rowing barre", 4, 8, 120], ["Curl barre", 3, 10, 60]] },
    { name: "Pull dos large", level: "Tous niveaux", dur: "55 min", ex: [["Tractions", 4, 8, 120], ["Tirage vertical", 3, 12, 90], ["Rowing haltère", 3, 10, 90], ["Face pull", 3, 15, 60], ["Curl incliné", 3, 12, 60], ["Curl marteau", 3, 12, 60]] }
  ],
  jambes: [
    { name: "Jambes complètes", level: "Intermédiaire", dur: "65 min", ex: [["Squat", 5, 5, 180], ["Presse à cuisses", 4, 10, 120], ["Fentes marchées", 3, 12, 90], ["Leg curl", 3, 12, 60], ["Mollets debout", 4, 15, 45]] },
    { name: "Quadriceps & fessiers", level: "Tous niveaux", dur: "55 min", ex: [["Front squat", 4, 8, 150], ["Hip thrust", 4, 10, 120], ["Leg extension", 3, 15, 60], ["Soulevé de terre roumain", 3, 10, 90], ["Mollets assis", 4, 15, 45]] }
  ],
  haut: [
    { name: "Haut du corps complet", level: "Intermédiaire", dur: "60 min", ex: [["Développé couché", 4, 8, 120], ["Tractions", 4, 8, 120], ["Développé militaire", 3, 10, 90], ["Rowing haltère", 3, 10, 90], ["Curl barre", 3, 12, 60], ["Extensions triceps poulie", 3, 12, 60]] },
    { name: "Haut du corps express", level: "Débutant", dur: "40 min", ex: [["Développé incliné haltères", 3, 10, 90], ["Tirage vertical", 3, 10, 90], ["Élévations latérales", 3, 15, 60], ["Dips", 3, 10, 90], ["Curl haltères", 3, 12, 60]] }
  ],
  bas: [
    { name: "Bas du corps force", level: "Intermédiaire", dur: "60 min", ex: [["Squat", 4, 6, 180], ["Soulevé de terre roumain", 4, 8, 120], ["Fentes bulgares", 3, 10, 90], ["Leg curl", 3, 12, 60], ["Gainage", 3, "45 s", 45]] },
    { name: "Fessiers & ischios", level: "Tous niveaux", dur: "50 min", ex: [["Hip thrust", 4, 10, 120], ["Soulevé de terre sumo", 4, 8, 150], ["Fentes arrière", 3, 12, 90], ["Abduction machine", 3, 15, 60], ["Kickback poulie", 3, 15, 45]] }
  ]
};
const CALIS_IDEAS = [
  { name: "Débutant full body", level: "Débutant", dur: "40 min", ex: [["Tractions australiennes", 3, 10, 90], ["Pompes", 3, 12, 90], ["Squats", 3, 20, 60], ["Dips", 3, 8, 90], ["Gainage", 3, 30, 60, 1]] },
  { name: "Tirage & poussée", level: "Intermédiaire", dur: "50 min", ex: [["Tractions", 5, 6, 120], ["Dips", 5, 8, 120], ["Pompes pieds surélevés", 3, 12, 90], ["Tractions australiennes", 3, 12, 60], ["Handstand push-up", 3, 5, 120]] },
  { name: "Skills : équilibres et leviers", level: "Avancé", dur: "45 min", ex: [["Handstand", 6, 20, 60, 1], ["Front lever", 5, 10, 90, 1], ["Planche", 5, 10, 90, 1], ["L-sit", 4, 15, 60, 1]] },
  { name: "Pyramide d’endurance", level: "Tous niveaux", dur: "35 min", ex: [["Tractions", 9, [1, 2, 3, 4, 5, 4, 3, 2, 1], 45], ["Pompes", 9, [2, 4, 6, 8, 10, 8, 6, 4, 2], 45], ["Squats", 3, 25, 60]] },
  { name: "Muscle-up : progression", level: "Avancé", dur: "45 min", ex: [["Tractions", 4, 5, 150], ["Muscle-up", 5, 2, 150], ["Dips", 4, 10, 90], ["L-sit", 3, 15, 60, 1]] }
];
// Course : [répétitions, effort, unité, allure, récup]
const RUN_IDEAS = {
  ef: [
    { name: "Footing en endurance", level: "Tous niveaux", dur: "45 min", note: "Allure confortable : tu dois pouvoir parler.", m: 45 },
    { name: "Sortie longue", level: "Intermédiaire", dur: "1 h 15", note: "Allure EF, régulière du début à la fin. Hydrate-toi.", h: 1, m: 15 },
    { name: "EF + lignes droites", level: "Tous niveaux", dur: "45 min", note: "40 min en EF, puis 5 accélérations progressives de 100 m, retour en marchant.", m: 45 }
  ],
  seuil: [
    { name: "Seuil 3 × 10 min", level: "Intermédiaire", dur: "55 min", note: "Échauffement 15 min EF, retour au calme 10 min.", blocks: [[3, 10, "min", "allure semi", "2:00"]] },
    { name: "Seuil 2 × 15 min", level: "Confirmé", dur: "60 min", note: "Échauffement 15 min EF, retour au calme 10 min.", blocks: [[2, 15, "min", "allure semi", "3:00"]] },
    { name: "Tempo 20 min", level: "Tous niveaux", dur: "45 min", note: "Échauffement 15 min, 20 min en continu à allure soutenue, 10 min au calme.", blocks: [[1, 20, "min", "allure 10 km +10 s", ""]] }
  ],
  frac: [
    { name: "VMA 10 × 400 m", level: "Intermédiaire", dur: "50 min", note: "Échauffement 20 min EF + gammes. Récup en trottinant.", blocks: [[10, 400, "m", "VMA 95 %", "1:15"]] },
    { name: "30/30 × 2 séries", level: "Tous niveaux", dur: "45 min", note: "2 séries de 10 × 30 s vite / 30 s lent, 3 min de récup entre les séries.", blocks: [[10, 30, "s", "VMA", "0:30"], [10, 30, "s", "VMA", "0:30"]] },
    { name: "Pyramide 200 à 800 m", level: "Confirmé", dur: "55 min", note: "Récup = temps de l’effort, en trottinant.", blocks: [[1, 200, "m", "VMA", "0:45"], [1, 400, "m", "VMA", "1:30"], [1, 600, "m", "VMA 95 %", "2:15"], [1, 800, "m", "VMA 90 %", "3:00"], [1, 600, "m", "VMA 95 %", "2:15"], [1, 400, "m", "VMA", "1:30"], [1, 200, "m", "VMA", "0:45"]] },
    { name: "Côtes 8 × 30 s", level: "Tous niveaux", dur: "45 min", note: "Pente moyenne, montée dynamique, récup en descendant au trot.", blocks: [[8, 30, "s", "fort en côte", "1:30"]] }
  ]
};
const MUSCU_LIFTS = [["bench", "Développé couché"], ["squat", "Squat"], ["dl", "Soulevé de terre"], ["ohp", "Développé militaire"], ["pullw", "Traction lestée (lest)"], ["row", "Rowing barre"]];
const RUN_PRS = [["5k", "5 km", 5, "time"], ["10k", "10 km", 10, "time"], ["semi", "Semi-marathon", 21.0975, "time"], ["marathon", "Marathon", 42.195, "time"]];
const CALIS_PRS = [["pullups", "Tractions", 0, "reps"], ["dips", "Dips", 0, "reps"], ["pushups", "Pompes", 0, "reps"], ["muscleup", "Muscle-up", 0, "reps"],
  ["frontlever", "Front lever", 0, "sec"], ["planche", "Planche", 0, "sec"], ["handstand", "Handstand", 0, "sec"], ["lsit", "L-sit", 0, "sec"]];

function prsData() { const p = clone((S.profile && S.profile.prs) || {}); p.muscu = p.muscu || {}; p.course = p.course || {}; p.calis = p.calis || {}; return p; }
function fmtTime(t) { const h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), s = Math.round(t % 60); return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`; }
function repsText(r, hold) { return Array.isArray(r) ? r.join("-") : (typeof r === "number" && hold ? r + " s" : String(r)); }
function ideaExercises(ex) {
  return ex.map(([name, sets, reps, rest, hold]) => ({
    name, hold: !!hold, rpe: 0, note: "", rest,
    sets: Array.from({ length: sets }, (_, j) => ({ reps: "", kg: "", target: Array.isArray(reps) ? reps[j] : typeof reps === "number" ? reps : "" })),
    ...(typeof reps === "string" ? { note: "Objectif : " + reps } : {})
  }));
}
function ideaCard(idea, disc, key, idx, extra) {
  let lines;
  if (disc === "course") {
    lines = (idea.blocks || []).map(b => `${b[0]} × ${b[1]} ${b[2]}${b[3] ? " · " + b[3] : ""}${b[4] ? " · récup " + b[4] : ""}`);
    if (!lines.length) lines = [idea.note];
  } else lines = idea.ex.map(([n, s, r, rest, hold]) => `${n} — ${Array.isArray(r) ? repsText(r) : s + " × " + repsText(r, hold)} · repos ${fmtRest(rest)}`);
  return `<article class="idea" style="--tc:${extra || "var(--red-hi)"}">
    <div class="idea-top"><b>${esc(idea.name)}</b><span class="tag">${esc(idea.level)}</span></div>
    <span class="idea-meta">⏱ ${esc(idea.dur)}${disc !== "course" ? " · " + idea.ex.length + " exercices" : ""}</span>
    <ul>${lines.map(l => `<li>${esc(l)}</li>`).join("")}</ul>
    ${disc === "course" && idea.blocks ? `<p class="hint">${esc(idea.note)}</p>` : ""}
    <button class="btn primary idea-go" data-try="${disc}:${key}:${idx}">Essayer aujourd’hui</button>
  </article>`;
}
// Ouvre la séance du jour dans la bonne activité, pré-remplie avec l'idée choisie.
// S'il y a déjà une séance aujourd'hui, l'idée devient une séance de plus (rien n'est remplacé).
function tryIdea(btn, disc, fill) {
  const d = todayK(), k = freshKey(d), extra = sessionsOn(d).filter(x => x !== k && !isEmpty(S.days[x])).length;
  go("seances"); const t = new Date(); S.view = new Date(t.getFullYear(), t.getMonth(), 1); renderMain();
  openDay(k);
  S.cur = EMPTY_DAY(); setDisc(S.cur, disc); fill(S.cur); normCordes(S.cur);
  if (S.cur.exercises) { S.cur.exercises.forEach(e => { if (String(e.name || "").trim()) e.lock = true; }); prefillKg(S.cur.exercises, k); }
  forceFlush(); renderSheet(); $("sheet").scrollTop = 0;
  if (extra) toast(`Ajoutée comme ${extra + 1}<sup>e</sup> séance du jour`);
}

/* ---------- Records ---------- */
// items : [id, nom, distance (course), type : kg | time | reps | sec]
const prBest = (kind, list) => kind === "time" ? list.slice().sort((a, b) => a.t - b.t)[0] : kind === "kg" ? list.slice().sort((a, b) => b.kg - a.kg)[0] : list.slice().sort((a, b) => b.v - a.v)[0];
const prText = (kind, e) => kind === "time" ? fmtTime(e.t) : kind === "kg" ? nf.format(e.kg) + " kg" : kind === "sec" ? e.v + " s" : e.v + " reps";
function prRows(items, data, defKind) {
  return items.map(([id, name, km, k]) => {
    const kind = k || defKind, list = data[id] || [], open = S.recOpen === id, best = prBest(kind, list);
    const bestTxt = !best ? "–" : kind === "kg" ? `${nf.format(best.kg)}<small> kg</small>` : kind === "time" ? fmtTime(best.t) : `${best.v}<small>${kind === "sec" ? " s" : " reps"}</small>`;
    const sub = !best ? "Pas encore de record" : "le " + shortDate(best.date) + (kind === "time" ? " · " + runPace({ dist: km, s: best.t }) + " /km" : "");
    const input = kind === "kg" ? `<label class="field"><span>Nouvelle charge (kg)</span><input id="rp-v" inputmode="decimal" placeholder="ex. 100" required></label>`
      : kind === "time" ? `<div class="field"><span>Ton temps (h : min : s)</span><div class="dur"><input id="rp-h" inputmode="numeric" placeholder="0" aria-label="Heures"><i>:</i><input id="rp-m" inputmode="numeric" placeholder="25" aria-label="Minutes" required><i>:</i><input id="rp-s" inputmode="numeric" placeholder="00" aria-label="Secondes"></div></div>`
      : `<label class="field"><span>${kind === "sec" ? "Durée de tenue (secondes)" : "Répétitions d’affilée"}</span><input id="rp-v" inputmode="numeric" placeholder="${kind === "sec" ? "ex. 15" : "ex. 12"}" required></label>`;
    return `<div class="pr${open ? " open" : ""}">
      <button class="pr-row" data-ropen="${id}"><span class="main"><b>${esc(name)}</b><span>${esc(sub)}</span></span><span class="pr-kg">${bestTxt}</span><span class="arrow" aria-hidden="true">${open ? "−" : "+"}</span></button>
      ${open ? `<form class="pr-form" data-rpr="${id}" data-kind="${kind}">${input}<button class="btn primary" type="submit">Ajouter</button></form>
        ${list.length ? `<ul class="hist">${list.map((e, idx) => ({ ...e, idx })).sort((a, b) => a.date < b.date ? 1 : -1).map(e => `<li><span>${esc(shortDate(e.date))}</span><b>${prText(kind, e)}</b><button class="icon-btn" data-rdel="${id}:${e.idx}">Retirer</button></li>`).join("")}</ul>` : ""}` : ""}
    </div>`;
  }).join("");
}
function countRecords() {
  const pd = prsData(), cf = cfData();
  return [pd.muscu, pd.course, pd.calis, cf.prs].reduce((a, o) => a + Object.values(o).filter(l => l.length).length, 0)
    + BENCH.filter(bm => benchEntries(bm).length).length;
}

/* ---------- Pages « catégories » (idées, records, progression) ---------- */
const HUB_DESC = {
  ideas: { muscu: "Push, Pull, Jambes, Haut et Bas du corps", crossfit: "Les WOD de référence à essayer", calis: "Du débutant aux figures", course: "Endurance, seuil et fractionné" },
  rec: { muscu: "Développé couché, squat, soulevé de terre…", crossfit: "1RM et temps sur les WOD de référence", calis: "Max de tractions, dips, tenues…", course: "5 km, 10 km, semi et marathon" },
  prog: { muscu: "Tes charges exercice par exercice", crossfit: "Tes WOD de référence et tes 1RM", calis: "Tes répétitions et tes tenues", course: "Ton allure et tes distances" }
};
function discGrid(mode) {
  return Object.entries(DISC).filter(([id]) => MAIN_DISC.includes(id)).map(([id, x]) => `<button class="disc-card" data-cat="${mode}:${id}" style="--tc:${x.color}"><span class="disc-ico" aria-hidden="true"><svg viewBox="0 0 24 24">${x.icon}</svg></span><b>${x.name}</b><span>${HUB_DESC[mode][id]}</span></button>`).join("");
}
function renderTypesHub() { $("typesGrid").innerHTML = discGrid("ideas"); }
function renderRecordsHub() { $("recGrid").innerHTML = discGrid("rec"); }
function renderProgHub() { $("progGrid").innerHTML = discGrid("prog"); }
document.addEventListener("click", e => {
  const b = e.target.closest("[data-cat]"); if (!b) return;
  const [mode, d] = b.dataset.cat.split(":");
  if (d === "crossfit" && mode !== "prog") { S.cfMode = mode === "rec" ? "records" : "ideas"; S.cfOpen = null; go("crossfit"); return; }
  if (mode === "ideas") { S.hub = d; S.hubTab = null; go("hub"); }
  else if (mode === "rec") { S.rec = d; S.recOpen = null; go("rec"); }
  else { S.prog = d; S.progTab = null; go("prog"); }
});
function catColor(id) { return (typeOf(id) || DEFAULT_TYPES.find(t => t.id === id) || {}).color || "#8A847E"; }
function renderHub() {
  const d = S.hub, x = DISC[d]; if (!x) return;
  $("hubTitle").textContent = "Idées · " + x.name; $("v-hub").style.setProperty("--tc", x.color);
  let h = "";
  if (d === "muscu") {
    const types = [["push", "Push"], ["pull", "Pull"], ["jambes", "Jambes"], ["haut", "Haut du corps"], ["bas", "Bas du corps"]];
    const tab = S.hubTab && MUSCU_IDEAS[S.hubTab] ? S.hubTab : "push";
    h += `<div class="chips">${types.map(([id, n]) => `<button class="chip" data-tab="${id}" style="--tc:${catColor(id)}" aria-pressed="${id === tab}"><i class="dot"></i>${n}</button>`).join("")}</div>
      <div class="list">${MUSCU_IDEAS[tab].map((idea, i) => ideaCard(idea, "muscu", tab, i, catColor(tab))).join("")}</div>`;
  } else if (d === "course") {
    const tab = S.hubTab && RUN_IDEAS[S.hubTab] ? S.hubTab : "ef", rt = RUN_TYPES.find(r => r.id === tab);
    h += `<div class="chips">${RUN_TYPES.map(r => `<button class="chip" data-tab="${r.id}" style="--tc:${r.color}" aria-pressed="${r.id === tab}"><i class="dot"></i>${r.name}</button>`).join("")}</div>
      <p class="hint" style="margin:-10px 0 0">${esc(rt.hint)}</p>
      <div class="list">${RUN_IDEAS[tab].map((idea, i) => ideaCard(idea, "course", tab, i, rt.color)).join("")}</div>`;
  } else if (d === "calis") {
    h += `<div class="list">${CALIS_IDEAS.map((idea, i) => ideaCard(idea, "calis", "all", i, DISC.calis.color)).join("")}</div>`;
  }
  $("hubBody").innerHTML = h;
}
$("v-hub").addEventListener("click", e => {
  const tb = e.target.closest("[data-tab]"); if (tb) { S.hubTab = tb.dataset.tab; renderHub(); return; }
  const go2 = e.target.closest("[data-try]"); if (!go2) return;
  const [disc, key, idx] = go2.dataset.try.split(":");
  if (disc === "muscu") {
    const idea = MUSCU_IDEAS[key][+idx];
    tryIdea(go2, "muscu", c => { c.typeId = S.types.some(t => t.id === key) ? key : null; c.title = idea.name; c.exercises = ideaExercises(idea.ex); });
  } else if (disc === "calis") {
    const idea = CALIS_IDEAS[+idx];
    tryIdea(go2, "calis", c => { c.title = idea.name; c.exercises = ideaExercises(idea.ex); });
  } else if (disc === "course") {
    const idea = RUN_IDEAS[key][+idx];
    tryIdea(go2, "course", c => {
      c.runType = key; c.title = idea.name; c.note = idea.note || "";
      c.run = { blocks: (idea.blocks || []).map(([rep, eff, unit, pace, rec]) => ({ rep, eff, unit, pace, rec })), h: idea.h || "", m: idea.m || "", s: "" };
    });
  }
});
function renderRec() {
  const d = S.rec, x = DISC[d]; if (!x) return;
  $("recTitle").textContent = "Records · " + x.name; $("v-rec").style.setProperty("--tc", x.color);
  const pd = prsData();
  const items = d === "muscu" ? MUSCU_LIFTS : d === "course" ? RUN_PRS : CALIS_PRS;
  const hint = d === "muscu" ? "Ta charge maximale sur une répétition (ou ta meilleure série lourde)." : d === "course" ? "Ton meilleur temps sur chaque distance. L’allure se calcule toute seule." : "Ton maximum de répétitions d’affilée, ou ta plus longue tenue.";
  $("recBody").innerHTML = `<p class="hint" style="margin-top:-10px">${hint} Touche + pour ajouter un record.</p>
    <div class="card" style="gap:0;padding-block:4px">${prRows(items, pd[d], d === "muscu" ? "kg" : "time")}</div>`;
}
$("v-rec").addEventListener("click", e => {
  const op = e.target.closest("[data-ropen]"); if (op) { S.recOpen = S.recOpen === op.dataset.ropen ? null : op.dataset.ropen; renderRec(); return; }
  const del = e.target.closest("[data-rdel]");
  if (del) { if (!armed(del, "Confirmer")) return; const [id, idx] = del.dataset.rdel.split(":"), pd = prsData(); pd[S.rec][id].splice(+idx, 1); saveProfile({ prs: pd }); renderRec(); }
});
$("v-rec").addEventListener("submit", e => {
  e.preventDefault();
  const f = e.target, id = f.dataset.rpr, kind = f.dataset.kind, pd = prsData(), date = todayK(); if (!id) return;
  let entry;
  if (kind === "kg") { const kg = numOr($("rp-v").value); if (kg === "" || kg <= 0) return; entry = { kg, date }; }
  else if (kind === "time") { const t = (intOr($("rp-h").value) || 0) * 3600 + (intOr($("rp-m").value) || 0) * 60 + (intOr($("rp-s").value) || 0); if (!t) return; entry = { t, date }; }
  else { const v = intOr($("rp-v").value); if (v === "" || v <= 0) return; entry = { v, date }; }
  (pd[S.rec][id] = pd[S.rec][id] || []).push(entry);
  saveProfile({ prs: pd }); renderRec();
});

/* ---------- Graphiques de progression (courbes SVG) ---------- */
const CHARTS = {};
function niceStep(raw, time) {
  if (time) { const opts = [5, 10, 15, 30, 60, 120, 300, 600]; return opts.find(o => o >= raw) || Math.ceil(raw / 600) * 600; }
  const p = Math.pow(10, Math.floor(Math.log10(raw || 1))), f = raw / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
}
// pts : [{ k: "AAAA-MM-JJ", v: nombre }] triés par date. fmt : texte d'une valeur. better : "up" ou "down".
function lineChart(id, pts, { fmt, color, better = "up", time = false, tickFmt }) {
  const W = 340, H = 168, L = 46, R = 16, T = 22, B = 26, n = pts.length;
  const vals = pts.map(p => p.v);
  let lo = Math.min(...vals), hi = Math.max(...vals);
  if (lo === hi) { const d = Math.abs(lo) * 0.1 || 1; lo -= d; hi += d; }
  const step = niceStep((hi - lo) / 3, time);
  lo = Math.floor(lo / step) * step; hi = Math.ceil(hi / step) * step;
  if (!time && lo < 0 && Math.min(...vals) >= 0) lo = 0;
  const ticks = []; for (let t = lo; t <= hi + step / 1000; t += step) ticks.push(t);
  const X = i => n === 1 ? L + (W - L - R) / 2 : L + i * (W - L - R) / (n - 1);
  const Y = v => T + (hi - v) / (hi - lo || 1) * (H - T - B);
  const tf = tickFmt || fmt;
  const bestV = better === "down" ? Math.min(...vals) : Math.max(...vals), bestI = vals.lastIndexOf(bestV), lastI = n - 1;
  // Étiquette placée du côté libre du point (au-dessus d'un sommet, en dessous d'un creux), toujours dans le cadre.
  const lab = (i) => {
    const y0 = Y(pts[i].v), isMax = pts[i].v >= Math.max(...vals), isMin = pts[i].v <= Math.min(...vals);
    let above = isMax || (!isMin && better === "up");
    if (isMin && !isMax) above = false;
    let y = y0 + (above ? -11 : 19), side = false;
    if (y < 10) y = y0 + 19;
    if (y > H - B - 2) { y = y0 + 4; side = true; } // pas de place en dessous : à côté du point
    let anchor = X(i) > W - R - 40 ? "end" : X(i) < L + 40 ? "start" : "middle";
    let x = anchor === "end" ? X(i) + 4 : anchor === "start" ? X(i) - 4 : X(i);
    if (side) { anchor = X(i) > W / 2 ? "end" : "start"; x = anchor === "end" ? X(i) - 10 : X(i) + 10; }
    return `<text class="c-lab" x="${x}" y="${y}" text-anchor="${anchor}">${esc(fmt(pts[i].v))}</text>`;
  };
  CHARTS[id] = { pts, X, Y, fmt, W };
  return `<div class="chart" data-chart="${id}" style="--cc:${color}">
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Courbe de progression, ${n} séances">
      ${ticks.map(t => `<line class="c-grid" x1="${L}" x2="${W - R}" y1="${Y(t)}" y2="${Y(t)}"/><text class="c-tick" x="${L - 6}" y="${Y(t) + 3.5}" text-anchor="end">${esc(tf(t))}</text>`).join("")}
      <text class="c-tick" x="${X(0)}" y="${H - 6}" text-anchor="${n === 1 ? "middle" : "start"}">${esc(shortDate(pts[0].k))}</text>
      ${n > 1 ? `<text class="c-tick" x="${X(lastI)}" y="${H - 6}" text-anchor="end">${esc(shortDate(pts[lastI].k))}</text>` : ""}
      <line class="c-xh" x1="0" x2="0" y1="${T - 6}" y2="${H - B}" style="opacity:0"/>
      ${n > 1 ? `<path class="c-line" d="${pts.map((p, i) => (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(p.v).toFixed(1)).join(" ")}"/>` : ""}
      ${pts.map((p, i) => `<circle class="c-pt${i === bestI ? " best" : ""}" cx="${X(i).toFixed(1)}" cy="${Y(p.v).toFixed(1)}" r="${i === lastI || i === bestI ? 5 : 4}"/>`).join("")}
      ${lab(bestI)}${lastI !== bestI && pts[lastI].v !== bestV ? lab(lastI) : ""}
      <rect class="c-hit" x="${L - 10}" y="0" width="${W - L - R + 20}" height="${H}"/>
    </svg>
    <div class="c-tip" hidden></div>
  </div>`;
}
function chartPoint(el, clientX) {
  const c = CHARTS[el.dataset.chart]; if (!c) return;
  const svg = el.querySelector("svg"), r = svg.getBoundingClientRect(), x = (clientX - r.left) / r.width * c.W;
  let bi = 0, bd = 1e9; c.pts.forEach((p, i) => { const d = Math.abs(c.X(i) - x); if (d < bd) { bd = d; bi = i; } });
  const px = c.X(bi), xh = el.querySelector(".c-xh"), tip = el.querySelector(".c-tip");
  xh.setAttribute("x1", px); xh.setAttribute("x2", px); xh.style.opacity = 1;
  el.querySelectorAll(".c-pt").forEach((ci, i) => ci.classList.toggle("on", i === bi));
  tip.hidden = false; tip.innerHTML = `<b>${esc(c.fmt(c.pts[bi].v))}</b><span>${esc(shortDate(c.pts[bi].k))}${c.pts[bi].note ? " · " + esc(c.pts[bi].note) : ""}</span>`;
  const pct = px / c.W * 100; tip.style.left = `clamp(0px, calc(${pct}% - 60px), calc(100% - 120px))`;
}
document.addEventListener("pointermove", e => { const el = e.target.closest && e.target.closest(".chart"); if (el && e.pointerType === "mouse") chartPoint(el, e.clientX); });
document.addEventListener("pointerdown", e => { const el = e.target.closest && e.target.closest(".chart"); if (el) chartPoint(el, e.clientX); });

// Carte d'un graphique : titre, meilleur résultat, évolution, courbe et tableau des valeurs.
function chartCard(id, title, pts, opt) {
  const first = pts[0].v, last = pts[pts.length - 1].v, diff = last - first, better = opt.better || "up";
  const good = better === "up" ? diff > 0 : diff < 0;
  const best = better === "down" ? Math.min(...pts.map(p => p.v)) : Math.max(...pts.map(p => p.v));
  const evo = pts.length < 2 || !diff ? `<span class="evo">${pts.length < 2 ? "1 séance pour l’instant" : "stable"}</span>`
    : `<span class="evo ${good ? "up" : "down"}">${good ? "▲" : "▼"} ${esc(opt.diffFmt ? opt.diffFmt(Math.abs(diff)) : opt.fmt(Math.abs(diff)))} depuis le ${esc(shortDate(pts[0].k))}</span>`;
  return `<article class="prog-card" style="--cc:${opt.color}">
    <div class="prog-top"><b>${esc(title)}</b><span class="prog-best"><small>${opt.bestLabel || "Record"}</small>${esc(opt.fmt(best))}</span></div>
    ${evo}
    ${lineChart(id, pts, opt)}
    <details class="prog-tab"><summary>Voir les valeurs</summary><table><tbody>${pts.slice().reverse().map(p => `<tr><td>${esc(shortDate(p.k))}</td><td>${esc(opt.fmt(p.v))}</td></tr>`).join("")}</tbody></table></details>
  </article>`;
}
const emptyProg = txt => `<div class="empty">${txt}</div>`;
// Regroupe les séances par exercice (nom sans accents ni majuscules) : un point par séance.
function exerciseSeries(days, valueOf) {
  const map = new Map();
  days.forEach(k => (S.days[k].exercises || []).forEach(ex => {
    const name = String(ex.name || "").trim(); if (!name) return;
    const v = valueOf(ex); if (!v) return;
    const key = norm(name).replace(/\s+/g, " ").trim() + (ex.hold ? "#t" : "");
    const it = map.get(key) || { name, hold: !!ex.hold, pts: [] };
    it.name = name; const prev = it.pts.find(p => p.k === k);
    if (prev) prev.v = Math.max(prev.v, v); else it.pts.push({ k, v });
    map.set(key, it);
  }));
  return [...map.values()].sort((a, b) => b.pts.length - a.pts.length || a.name.localeCompare(b.name));
}
const doneSet = st => st.reps !== "" && st.reps != null;
function renderProg() {
  const d = S.prog, x = DISC[d]; if (!x) return;
  $("progTitle").textContent = "Progression · " + x.name; $("v-prog").style.setProperty("--tc", x.color);
  const days = Object.keys(S.days).filter(k => discOf(S.days[k]) === d).sort();
  let h = "";
  if (d === "muscu") {
    const used = S.types.filter(t => days.some(k => S.days[k].typeId === t.id));
    const tab = S.progTab && used.some(t => t.id === S.progTab) ? S.progTab : (used[0] && used[0].id);
    if (!used.length) h = emptyProg("Pas encore de séance de musculation. Note tes séances avec leurs poids : ta progression s’affichera ici, exercice par exercice.");
    else {
      const t = typeOf(tab), series = exerciseSeries(days.filter(k => S.days[k].typeId === tab),
        ex => Math.max(0, ...(ex.sets || []).filter(doneSet).map(st => +st.kg || 0)));
      h = `<div class="chips">${used.map(u => `<button class="chip" data-ptab="${u.id}" style="--tc:${u.color}" aria-pressed="${u.id === tab}"><i class="dot"></i>${esc(u.name)}</button>`).join("")}</div>
        <p class="hint" style="margin:-10px 0 0">Charge maximale soulevée à chaque séance ${esc(t.name)}. Touche une courbe pour voir le détail.</p>
        ${series.length ? `<div class="list">${series.slice(0, 15).map((s, i) => chartCard("m" + i, s.name, s.pts, { fmt: v => nf.format(v) + " kg", tickFmt: v => nf.format(v), color: t.color })).join("")}</div>`
          : emptyProg("Aucun poids noté dans tes séances " + esc(t.name) + " pour l’instant.")}`;
    }
  } else if (d === "calis") {
    const series = exerciseSeries(days, ex => Math.max(0, ...(ex.sets || []).map(st => +st.reps || 0)));
    h = series.length ? `<p class="hint" style="margin-top:-10px">Ton meilleur résultat par séance : répétitions, ou secondes pour les figures tenues.</p>
      <div class="list">${series.slice(0, 15).map((s, i) => chartCard("c" + i, s.name, s.pts, { fmt: v => v + (s.hold ? " s" : " reps"), tickFmt: v => String(v), color: DISC.calis.color, bestLabel: "Max" })).join("")}</div>`
      : emptyProg("Pas encore de séance de callisthénie notée. Ta progression s’affichera ici, exercice par exercice.");
  } else if (d === "course") {
    const tab = S.progTab || "all";
    const sel = days.filter(k => tab === "all" || S.days[k].runType === tab);
    const col = tab === "all" ? DISC.course.color : RUN_TYPES.find(r => r.id === tab).color;
    const pace = sel.map(k => { const r = S.days[k].run || {}, t = runSecs(r), dist = +r.dist || 0; return t && dist ? { k, v: Math.round(t / dist) } : null; }).filter(Boolean);
    const dist = sel.map(k => { const r = S.days[k].run || {}; return +r.dist ? { k, v: +r.dist } : null; }).filter(Boolean);
    h = `<div class="chips"><button class="chip" data-ptab="all" style="--tc:${DISC.course.color}" aria-pressed="${tab === "all"}">Toutes</button>${RUN_TYPES.map(r => `<button class="chip" data-ptab="${r.id}" style="--tc:${r.color}" aria-pressed="${r.id === tab}"><i class="dot"></i>${r.name}</button>`).join("")}</div>
      ${pace.length ? `<div class="list">
        ${chartCard("rp", "Allure moyenne", pace, { fmt: v => fmtTime(v) + " /km", tickFmt: v => fmtTime(v), diffFmt: v => fmtTime(v) + " /km", color: col, better: "down", time: true, bestLabel: "Meilleure" })}
        ${chartCard("rd", "Distance", dist, { fmt: v => nf.format(v) + " km", tickFmt: v => nf.format(v), color: col, bestLabel: "Plus longue" })}
      </div><p class="hint">Pour l’allure, plus la courbe descend, plus tu cours vite.</p>`
        : emptyProg("Pas encore de sortie avec distance et durée. Entre-les dans tes séances de course : ton allure et tes distances s’afficheront ici.")}`;
  } else if (d === "crossfit") {
    const cf = cfData();
    const benches = BENCH.map(bm => ({ bm, ents: benchEntries(bm).slice().sort((a, b) => a.date < b.date ? -1 : 1) })).filter(o => o.ents.length);
    const lifts = LIFTS.map(([id, name]) => ({ id, name, pts: (cf.prs[id] || []).slice().sort((a, b) => a.date < b.date ? -1 : 1).map(e => ({ k: e.date, v: e.kg })) })).filter(o => o.pts.length);
    h = `${benches.length ? `<h2 class="h2">WOD de référence</h2><div class="list">${benches.map((o, i) => o.bm.type === "amrap"
        ? chartCard("b" + i, o.bm.name, o.ents.map(e => ({ k: e.date, v: e.r + (e.reps || 0) / 100, note: e.rx === false ? "Scaled" : "Rx" })), { fmt: v => `${Math.floor(v)} tours + ${Math.round((v % 1) * 100)}`, tickFmt: v => String(Math.round(v)), diffFmt: v => nf.format(v) + " tour(s)", color: DISC.crossfit.color, bestLabel: "Record" })
        : chartCard("b" + i, o.bm.name, o.ents.map(e => ({ k: e.date, v: e.t, note: e.rx === false ? "Scaled" : "Rx" })), { fmt: fmtTime, color: DISC.crossfit.color, better: "down", time: true, bestLabel: "Record" })).join("")}</div>` : ""}
      ${lifts.length ? `<h2 class="h2">Records 1RM</h2><div class="list">${lifts.map((o, i) => chartCard("l" + i, o.name, o.pts, { fmt: v => nf.format(v) + " kg", tickFmt: v => nf.format(v), color: DISC.crossfit.color })).join("")}</div>` : ""}
      ${!benches.length && !lifts.length ? emptyProg("Note tes résultats sur les WOD de référence (Fran, Murph…) et tes 1RM dans « Mes records » : leur évolution s’affichera ici.") : ""}
      ${benches.length ? `<p class="hint">Pour un WOD en temps, plus la courbe descend, plus tu es rapide.</p>` : ""}`;
  }
  $("progBody").innerHTML = h;
}
$("v-prog").addEventListener("click", e => { const t = e.target.closest("[data-ptab]"); if (t) { S.progTab = t.dataset.ptab; renderProg(); } });

export { CALIS_PRS, MONTHS_S, MUSCU_LIFTS, RUN_PRS, benchEntries, benchText, benchValue, cfData, doneSet, ideaExercises, prBest,
  prText, prsData, renderCrossfit, renderHub, renderProg, renderProgHub, renderRec, renderRecordsHub, renderTypesHub, repsText,
  shortDate, tryIdea };
