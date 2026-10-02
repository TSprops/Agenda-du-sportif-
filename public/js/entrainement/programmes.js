// Entraînement : programmes (progression, lancement de la séance du jour).
import { toast } from "./records.js";
import { startWorkout } from "./routines.js";
import { $, PROGRAMS, S, armed, esc, todayK } from "../commun/core.js";
import { refresh, saveProfile } from "../commun/store.js";
import { t } from "../commun/i18n.js";

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
    <div class="pn-top"><span class="tag">${t("programmes.monProgramme")}</span><b>${esc(ps.pg.name)}</b></div>
    <div class="pn-bar"><i style="width:${pct}%"></i></div>
    <span class="hint">${ps.finished ? t("programmes.termine") : t("programmes.avancement", { semaine: ps.week, semaines: ps.pg.weeks, seance: ps.inWeek, seances: ps.pg.perWeek })}</span>
    ${ps.finished ? `<button class="btn" data-pgstop="1">${t("programmes.autre")}</button>` : `<button class="btn primary" data-pgnext="1">${esc(t("programmes.lancer", { seance: ps.next.name }))}</button>`}
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
    ${ps ? `<button class="linkish" data-pgstop="1">${t("programmes.arreter")}</button>` : `<p class="hint" style="margin-top:-8px">${t("programmes.intro")}</p>`}
    <div class="list">${PROGRAMS.map(pg => {
      const cur = ps && ps.pg.id === pg.id, names = [...new Set(pg.plan(1).map(w => w.name))];
      return `<article class="idea" style="--tc:${pg.color}">
        <div class="idea-top"><b>${esc(pg.name)}</b><span class="tag">${esc(pg.level)}</span></div>
        <span class="idea-meta">${t("programmes.duree", { n: pg.weeks })} · ${t("programmes.parSemaine", { n: pg.perWeek })}</span>
        <p style="margin:0;font-size:14px">${esc(pg.desc)}</p>
        <ul>${names.map(n => `<li>${esc(n)}</li>`).join("")}</ul>
        ${cur ? `<span class="tag done" style="align-self:flex-start">${t("programmes.enCours")}</span>` : `<button class="btn primary idea-go" data-pgstart="${pg.id}">${t("programmes.suivre")}</button>`}
      </article>`; }).join("")}</div>`;
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-pgstart],[data-pgnext],[data-pgstop]"); if (!b) return;
  if (b.dataset.pgstart) {
    if (S.profile.program && !armed(b, t("programmes.remplacer"))) return;
    saveProfile({ program: { id: b.dataset.pgstart, start: todayK(), done: 0 } }); toast(t("programmes.choisi")); refresh(); window.scrollTo(0, 0); return;
  }
  if (b.dataset.pgnext) { launchProgram(); return; }
  if (b.dataset.pgstop) { if (!armed(b, t("programmes.toucherArreter"))) return; saveProfile({ program: null }); refresh(); }
});
