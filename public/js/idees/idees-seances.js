// Idées de séances par activité (muscu, calisthénie, course) et bouton « Essayer ».
import { $, S, clone, esc, isEmpty, pad, sessionsOn, todayK } from "../commun/core.js";
import { freshKey, prefillKg, toast } from "../entrainement/index.js";
import { EMPTY_DAY, fmtRest, forceFlush, normCordes, openDay, renderMain, renderSheet, setDisc } from "../seances/index.js";
import { go } from "../commun/store.js";

/* ============================================================
   Séances types : idées de séances et records par activité
   ============================================================ */
// Exercice d'une idée : [nom, séries, répétitions (nombre, texte ou liste par série), repos en s, tenue ?]
export const MUSCU_IDEAS = {
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
export const CALIS_IDEAS = [
  { name: "Débutant full body", level: "Débutant", dur: "40 min", ex: [["Tractions australiennes", 3, 10, 90], ["Pompes", 3, 12, 90], ["Squats", 3, 20, 60], ["Dips", 3, 8, 90], ["Gainage", 3, 30, 60, 1]] },
  { name: "Tirage & poussée", level: "Intermédiaire", dur: "50 min", ex: [["Tractions", 5, 6, 120], ["Dips", 5, 8, 120], ["Pompes pieds surélevés", 3, 12, 90], ["Tractions australiennes", 3, 12, 60], ["Handstand push-up", 3, 5, 120]] },
  { name: "Skills : équilibres et leviers", level: "Avancé", dur: "45 min", ex: [["Handstand", 6, 20, 60, 1], ["Front lever", 5, 10, 90, 1], ["Planche", 5, 10, 90, 1], ["L-sit", 4, 15, 60, 1]] },
  { name: "Pyramide d’endurance", level: "Tous niveaux", dur: "35 min", ex: [["Tractions", 9, [1, 2, 3, 4, 5, 4, 3, 2, 1], 45], ["Pompes", 9, [2, 4, 6, 8, 10, 8, 6, 4, 2], 45], ["Squats", 3, 25, 60]] },
  { name: "Muscle-up : progression", level: "Avancé", dur: "45 min", ex: [["Tractions", 4, 5, 150], ["Muscle-up", 5, 2, 150], ["Dips", 4, 10, 90], ["L-sit", 3, 15, 60, 1]] }
];
// Course : [répétitions, effort, unité, allure, récup]
export const RUN_IDEAS = {
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
export const MUSCU_LIFTS = [["bench", "Développé couché"], ["squat", "Squat"], ["dl", "Soulevé de terre"], ["ohp", "Développé militaire"], ["pullw", "Traction lestée (lest)"], ["row", "Rowing barre"]];
export const RUN_PRS = [["5k", "5 km", 5, "time"], ["10k", "10 km", 10, "time"], ["semi", "Semi-marathon", 21.0975, "time"], ["marathon", "Marathon", 42.195, "time"]];
export const CALIS_PRS = [["pullups", "Tractions", 0, "reps"], ["dips", "Dips", 0, "reps"], ["pushups", "Pompes", 0, "reps"], ["muscleup", "Muscle-up", 0, "reps"],
  ["frontlever", "Front lever", 0, "sec"], ["planche", "Planche", 0, "sec"], ["handstand", "Handstand", 0, "sec"], ["lsit", "L-sit", 0, "sec"]];
export function prsData() { const p = clone((S.profile && S.profile.prs) || {}); p.muscu = p.muscu || {}; p.course = p.course || {}; p.calis = p.calis || {}; return p; }
export function fmtTime(t) { const h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), s = Math.round(t % 60); return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`; }
export function repsText(r, hold) { return Array.isArray(r) ? r.join("-") : (typeof r === "number" && hold ? r + " s" : String(r)); }
export function ideaExercises(ex) {
  return ex.map(([name, sets, reps, rest, hold]) => ({
    name, hold: !!hold, rpe: 0, note: "", rest,
    sets: Array.from({ length: sets }, (_, j) => ({ reps: "", kg: "", target: Array.isArray(reps) ? reps[j] : typeof reps === "number" ? reps : "" })),
    ...(typeof reps === "string" ? { note: "Objectif : " + reps } : {})
  }));
}
export function ideaCard(idea, disc, key, idx, extra) {
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
export function tryIdea(btn, disc, fill) {
  const d = todayK(), k = freshKey(d), extra = sessionsOn(d).filter(x => x !== k && !isEmpty(S.days[x])).length;
  go("seances"); const t = new Date(); S.view = new Date(t.getFullYear(), t.getMonth(), 1); renderMain();
  openDay(k);
  S.cur = EMPTY_DAY(); setDisc(S.cur, disc); fill(S.cur); normCordes(S.cur);
  if (S.cur.exercises) { S.cur.exercises.forEach(e => { if (String(e.name || "").trim()) e.lock = true; }); prefillKg(S.cur.exercises, k); }
  forceFlush(); renderSheet(); $("sheet").scrollTop = 0;
  if (extra) toast(`Ajoutée comme ${extra + 1}<sup>e</sup> séance du jour`);
}
