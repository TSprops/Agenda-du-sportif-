// Entraînement : programmes (progression, lancement de la séance du jour).
import { toast } from "./records.js";
import { startWorkout } from "./routines.js";
import { $, PROGRAMS, S, armed, esc, todayK } from "../commun/core.js";
import { refresh, saveProfile } from "../commun/store.js";

// Programme suivi : { id, start, done } dans le profil.
export function programState() {
  const p = S.profile && S.profile.program; if (!p) return null;
  const pg = PROGRAMS.find(x => x.id === p.id); if (!pg) return null;
  const done = p.done || 0, week = Math.floor(done / pg.perWeek) + 1, finished = week > pg.weeks;
  const plan = pg.plan(Math.min(week, pg.weeks)), next = plan[done % plan.length];
  return { p, pg, done, week, finished, next, total: pg.weeks * pg.perWeek, inWeek: done % pg.perWeek + 1 };
}
export function programCardHTML(ps, compact) {
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
export function renderPrograms() {
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
