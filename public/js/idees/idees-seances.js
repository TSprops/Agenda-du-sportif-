// Idées de séances par activité (muscu, calisthénie, course) et bouton « Essayer ».
import { $, S, clone, esc, isEmpty, nomEx, pad, sessionsOn, todayK } from "../commun/core.js";
import { t } from "../commun/i18n.js";
import { freshKey, prefillKg, toast } from "../entrainement/index.js";
import { EMPTY_DAY, fmtRest, forceFlush, normCordes, openDay, renderMain, renderSheet, setDisc } from "../seances/index.js";
import { go } from "../commun/store.js";

/* ============================================================
   Séances types : idées de séances et records par activité
   ============================================================ */
// Exercice d'une idée : [nom (identifiant), séries, répétitions (nombre, liste par série, ou { s: secondes }), repos en s, tenue ?]
// Nom, niveau et note de chaque idée : « idees.<activité>.<id> » ; durée en minutes.
const idee = (grp, id, level, dur, rest) => ({ id, name: t(`idees.${grp}.${id}.nom`), level: t("niveaux." + level), dur: fmtMinutes(dur), ...rest });
const fmtMinutes = m => m < 60 ? m + " min" : t("commun.dureeHeures", { h: String(Math.floor(m / 60)), m: pad(m % 60) });
export const MUSCU_IDEAS = {
  push: [
    idee("muscu", "pushForce", "intermediaire", 60, { ex: [["Développé couché", 5, 5, 180], ["Développé militaire", 4, 6, 150], ["Dips lestés", 3, 8, 120], ["Développé incliné haltères", 3, 10, 90], ["Extensions triceps poulie", 3, 12, 60]] }),
    idee("muscu", "pushVolume", "tous", 55, { ex: [["Développé incliné haltères", 4, 10, 90], ["Développé couché machine", 3, 12, 90], ["Écartés poulie", 3, 15, 60], ["Élévations latérales", 4, 15, 60], ["Barre au front", 3, 12, 60], ["Extensions triceps corde", 3, 15, 45]] })
  ],
  pull: [
    idee("muscu", "pullForce", "intermediaire", 60, { ex: [["Soulevé de terre", 4, 5, 180], ["Tractions lestées", 4, 6, 150], ["Rowing barre", 4, 8, 120], ["Curl barre", 3, 10, 60]] }),
    idee("muscu", "pullDos", "tous", 55, { ex: [["Tractions", 4, 8, 120], ["Tirage vertical", 3, 12, 90], ["Rowing haltère", 3, 10, 90], ["Face pull", 3, 15, 60], ["Curl incliné", 3, 12, 60], ["Curl marteau", 3, 12, 60]] })
  ],
  jambes: [
    idee("muscu", "jambesCompletes", "intermediaire", 65, { ex: [["Squat", 5, 5, 180], ["Presse à cuisses", 4, 10, 120], ["Fentes marchées", 3, 12, 90], ["Leg curl", 3, 12, 60], ["Mollets debout", 4, 15, 45]] }),
    idee("muscu", "quadsFessiers", "tous", 55, { ex: [["Front squat", 4, 8, 150], ["Hip thrust", 4, 10, 120], ["Leg extension", 3, 15, 60], ["Soulevé de terre roumain", 3, 10, 90], ["Mollets assis", 4, 15, 45]] })
  ],
  haut: [
    idee("muscu", "hautComplet", "intermediaire", 60, { ex: [["Développé couché", 4, 8, 120], ["Tractions", 4, 8, 120], ["Développé militaire", 3, 10, 90], ["Rowing haltère", 3, 10, 90], ["Curl barre", 3, 12, 60], ["Extensions triceps poulie", 3, 12, 60]] }),
    idee("muscu", "hautExpress", "debutant", 40, { ex: [["Développé incliné haltères", 3, 10, 90], ["Tirage vertical", 3, 10, 90], ["Élévations latérales", 3, 15, 60], ["Dips", 3, 10, 90], ["Curl haltères", 3, 12, 60]] })
  ],
  bas: [
    idee("muscu", "basForce", "intermediaire", 60, { ex: [["Squat", 4, 6, 180], ["Soulevé de terre roumain", 4, 8, 120], ["Fentes bulgares", 3, 10, 90], ["Leg curl", 3, 12, 60], ["Gainage", 3, { s: 45 }, 45]] }),
    idee("muscu", "fessiersIschios", "tous", 50, { ex: [["Hip thrust", 4, 10, 120], ["Soulevé de terre sumo", 4, 8, 150], ["Fentes arrière", 3, 12, 90], ["Abduction machine", 3, 15, 60], ["Kickback poulie", 3, 15, 45]] })
  ]
};
export const CALIS_IDEAS = [
  idee("calis", "debutant", "debutant", 40, { ex: [["Tractions australiennes", 3, 10, 90], ["Pompes", 3, 12, 90], ["Squats", 3, 20, 60], ["Dips", 3, 8, 90], ["Gainage", 3, 30, 60, 1]] }),
  idee("calis", "tiragePoussee", "intermediaire", 50, { ex: [["Tractions", 5, 6, 120], ["Dips", 5, 8, 120], ["Pompes pieds surélevés", 3, 12, 90], ["Tractions australiennes", 3, 12, 60], ["Handstand push-up", 3, 5, 120]] }),
  idee("calis", "skills", "avance", 45, { ex: [["Handstand", 6, 20, 60, 1], ["Front lever", 5, 10, 90, 1], ["Planche", 5, 10, 90, 1], ["L-sit", 4, 15, 60, 1]] }),
  idee("calis", "pyramide", "tous", 35, { ex: [["Tractions", 9, [1, 2, 3, 4, 5, 4, 3, 2, 1], 45], ["Pompes", 9, [2, 4, 6, 8, 10, 8, 6, 4, 2], 45], ["Squats", 3, 25, 60]] }),
  idee("calis", "muscleUp", "avance", 45, { ex: [["Tractions", 4, 5, 150], ["Muscle-up", 5, 2, 150], ["Dips", 4, 10, 90], ["L-sit", 3, 15, 60, 1]] })
];
// Course : blocs [répétitions, effort, unité, allure (« idees.allures.<id> »), récup] ; note : « idees.course.<id>.note ».
const run = (id, level, dur, rest) => idee("course", id, level, dur, { note: t(`idees.course.${id}.note`), ...rest });
const allure = id => t("idees.allures." + id);
export const RUN_IDEAS = {
  ef: [
    run("footing", "tous", 45, { m: 45 }),
    run("sortieLongue", "intermediaire", 75, { h: 1, m: 15 }),
    run("lignesDroites", "tous", 45, { m: 45 })
  ],
  seuil: [
    run("seuil3x10", "intermediaire", 55, { blocks: [[3, 10, "min", allure("semi"), "2:00"]] }),
    run("seuil2x15", "confirme", 60, { blocks: [[2, 15, "min", allure("semi"), "3:00"]] }),
    run("tempo20", "tous", 45, { blocks: [[1, 20, "min", allure("dixKm"), ""]] })
  ],
  frac: [
    run("vma400", "intermediaire", 50, { blocks: [[10, 400, "m", allure("vma95"), "1:15"]] }),
    run("trenteTrente", "tous", 45, { blocks: [[10, 30, "s", allure("vma"), "0:30"], [10, 30, "s", allure("vma"), "0:30"]] }),
    run("pyramide", "confirme", 55, { blocks: [[1, 200, "m", allure("vma"), "0:45"], [1, 400, "m", allure("vma"), "1:30"], [1, 600, "m", allure("vma95"), "2:15"], [1, 800, "m", allure("vma90"), "3:00"], [1, 600, "m", allure("vma95"), "2:15"], [1, 400, "m", allure("vma"), "1:30"], [1, 200, "m", allure("vma"), "0:45"]] }),
    run("cotes", "tous", 45, { blocks: [[8, 30, "s", allure("cote"), "1:30"]] })
  ]
};
// Records : [id, nom (« records.<activité>.<id> »)…]
export const MUSCU_LIFTS = ["bench", "squat", "dl", "ohp", "pullw", "row"].map(id => [id, t("records.muscu." + id)]);
export const RUN_PRS = [["5k", 5], ["10k", 10], ["semi", 21.0975], ["marathon", 42.195]].map(([id, km]) => [id, t("records.course." + id), km, "time"]);
export const CALIS_PRS = [["pullups", "reps"], ["dips", "reps"], ["pushups", "reps"], ["muscleup", "reps"], ["frontlever", "sec"], ["planche", "sec"], ["handstand", "sec"], ["lsit", "sec"]]
  .map(([id, m]) => [id, t("records.calis." + id), 0, m]);
export function prsData() { const p = clone((S.profile && S.profile.prs) || {}); p.muscu = p.muscu || {}; p.course = p.course || {}; p.calis = p.calis || {}; return p; }
export function fmtTime(t) { const h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), s = Math.round(t % 60); return h ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`; }
export function repsText(r, hold) { return Array.isArray(r) ? r.join("-") : r && typeof r === "object" ? r.s + " s" : (typeof r === "number" && hold ? r + " s" : String(r)); }
export function ideaExercises(ex) {
  return ex.map(([name, sets, reps, rest, hold]) => ({
    name, hold: !!hold, rpe: 0, note: "", rest,
    sets: Array.from({ length: sets }, (_, j) => ({ reps: "", kg: "", target: Array.isArray(reps) ? reps[j] : typeof reps === "number" ? reps : "" })),
    ...(typeof reps === "string" || (reps && reps.s) ? { note: t("idees.objectif", { reps: repsText(reps) }) } : {})
  }));
}
export function ideaCard(idea, disc, key, idx, extra) {
  let lines;
  if (disc === "course") {
    lines = (idea.blocks || []).map(b => `${b[0]} × ${b[1]} ${b[2]}${b[3] ? " · " + b[3] : ""}${b[4] ? " · " + t("idees.recupDe", { duree: b[4] }) : ""}`);
    if (!lines.length) lines = [idea.note];
  } else lines = idea.ex.map(([n, s, r, rest, hold]) => `${nomEx(n)} — ${Array.isArray(r) ? repsText(r) : s + " × " + repsText(r, hold)} · ${t("idees.reposDe", { duree: fmtRest(rest) })}`);
  return `<article class="idea" style="--tc:${extra || "var(--red-hi)"}">
    <div class="idea-top"><b>${esc(idea.name)}</b><span class="tag">${esc(idea.level)}</span></div>
    <span class="idea-meta">⏱ ${esc(idea.dur)}${disc !== "course" ? " · " + t("seances.exercices", { n: idea.ex.length }) : ""}</span>
    <ul>${lines.map(l => `<li>${esc(l)}</li>`).join("")}</ul>
    ${disc === "course" && idea.blocks ? `<p class="hint">${esc(idea.note)}</p>` : ""}
    <button class="btn primary idea-go" data-try="${disc}:${key}:${idx}">${t("idees.essayer")}</button>
  </article>`;
}
// Ouvre la séance du jour dans la bonne activité, pré-remplie avec l'idée choisie.
// S'il y a déjà une séance aujourd'hui, l'idée devient une séance de plus (rien n'est remplacé).
export function tryIdea(btn, disc, fill) {
  const d = todayK(), k = freshKey(d), extra = sessionsOn(d).filter(x => x !== k && !isEmpty(S.days[x])).length;
  go("seances"); const now = new Date(); S.view = new Date(now.getFullYear(), now.getMonth(), 1); renderMain();
  openDay(k);
  S.cur = EMPTY_DAY(); setDisc(S.cur, disc); fill(S.cur); normCordes(S.cur);
  if (S.cur.exercises) { S.cur.exercises.forEach(e => { if (String(e.name || "").trim()) e.lock = true; }); prefillKg(S.cur.exercises, k); }
  forceFlush(); renderSheet(); $("sheet").scrollTop = 0;
  if (extra) toast(t("idees.ajouteeComme", { n: extra + 1 }));
}
