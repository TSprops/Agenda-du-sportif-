// Records par activité (liste, ajout, suppression).
import { shortDate } from "./crossfit.js";
import { CALIS_PRS, MUSCU_LIFTS, RUN_PRS, fmtTime, prsData } from "./idees-seances.js";
import { $, DISC, S, armed, esc, nf, numOr, runPace, todayK } from "../commun/core.js";
import { intOr } from "../seances/index.js";
import { saveProfile } from "../commun/store.js";
import { norm } from "../pages/faq.js";
import { t } from "../commun/i18n.js";

/* ---------- 1RM estimé ---------- */
// Formule d'Epley : charge × (1 + répétitions / 30). Au-delà de 12 répétitions l'estimation n'est plus fiable : ignorée.
export const est1RM = (kg, reps) => { kg = +kg; reps = +reps; if (!(kg > 0) || !(reps >= 1) || reps > 12) return 0; return reps === 1 ? kg : Math.round(kg * (1 + reps / 30) * 2) / 2; };
const nameKey = n => norm(String(n || "")).replace(/\s+/g, " ").trim();
// Meilleur 1RM estimé d'un exercice sur toutes les séances : { v, kg, reps, k } ou null.
export function best1RM(name) {
  const nk = nameKey(name); let best = null;
  Object.keys(S.days).forEach(k => (S.days[k].exercises || []).forEach(ex => {
    if (ex.hold || nameKey(ex.name) !== nk) return;
    (ex.sets || []).forEach(st => { if (st.reps === "" || st.reps == null) return; const v = est1RM(st.kg, st.reps); if (v && (!best || v > best.v)) best = { v, kg: +st.kg, reps: +st.reps, k }; });
  }));
  return best;
}
// Nom de l'exercice (dans les séances) correspondant à chaque record de musculation.
const LIFT_EX = { bench: "Développé couché", squat: "Squat", dl: "Soulevé de terre", ohp: "Développé militaire", row: "Rowing barre" };

/* ---------- Records ---------- */
// items : [id, nom, distance (course), type : kg | time | reps | sec]
export const prBest = (kind, list) => kind === "time" ? list.slice().sort((a, b) => a.t - b.t)[0] : kind === "kg" ? list.slice().sort((a, b) => b.kg - a.kg)[0] : list.slice().sort((a, b) => b.v - a.v)[0];
export const prText = (kind, e) => kind === "time" ? fmtTime(e.t) : kind === "kg" ? nf.format(e.kg) + " kg" : kind === "sec" ? e.v + " s" : e.v + " " + t("series.repsCourt");
function prRows(items, data, defKind) {
  return items.map(([id, name, km, k]) => {
    const kind = k || defKind, list = data[id] || [], open = S.recOpen === id, best = prBest(kind, list);
    const bestTxt = !best ? "–" : kind === "kg" ? `${nf.format(best.kg)}<small> kg</small>` : kind === "time" ? fmtTime(best.t) : `${best.v}<small>${kind === "sec" ? " s" : " " + t("series.repsCourt")}</small>`;
    const sub = !best ? t("records.aucun") : t("records.leDate", { date: shortDate(best.date) }) + (kind === "time" ? " · " + runPace({ dist: km, s: best.t }) + " /km" : "");
    const est = defKind === "kg" && LIFT_EX[id] ? best1RM(LIFT_EX[id]) : null;
    const estTxt = est ? `<span class="pr-est">${t("records.estime", { rm: `<b>${nf.format(est.v)} kg</b>`, kg: nf.format(est.kg), reps: est.reps, date: esc(shortDate(est.k)) })}</span>` : "";
    const input = kind === "kg" ? `<label class="field"><span>${t("records.nouvelleCharge")}</span><input id="rp-v" inputmode="decimal" placeholder="${esc(t("crossfit.ex100"))}" required></label>`
      : kind === "time" ? `<div class="field"><span>${t("records.tonTemps")}</span><div class="dur"><input id="rp-h" inputmode="numeric" placeholder="0" aria-label="${esc(t("commun.heures"))}"><i>:</i><input id="rp-m" inputmode="numeric" placeholder="25" aria-label="${esc(t("course.unites.min"))}" required><i>:</i><input id="rp-s" inputmode="numeric" placeholder="00" aria-label="${esc(t("course.unites.s"))}"></div></div>`
      : `<label class="field"><span>${t(kind === "sec" ? "records.dureeTenue" : "records.repsAffilee")}</span><input id="rp-v" inputmode="numeric" placeholder="${esc(t(kind === "sec" ? "records.ex15" : "crossfit.ex12"))}" required></label>`;
    return `<div class="pr${open ? " open" : ""}">
      <button class="pr-row" data-ropen="${id}"><span class="main"><b>${esc(name)}</b><span>${esc(sub)}</span>${estTxt}</span><span class="pr-kg">${bestTxt}</span><span class="arrow" aria-hidden="true">${open ? "−" : "+"}</span></button>
      ${open ? `<form class="pr-form" data-rpr="${id}" data-kind="${kind}">${input}<button class="btn primary" type="submit">${t("commun.ajouter")}</button></form>
        ${list.length ? `<ul class="hist">${list.map((e, idx) => ({ ...e, idx })).sort((a, b) => a.date < b.date ? 1 : -1).map(e => `<li><span>${esc(shortDate(e.date))}</span><b>${prText(kind, e)}</b><button class="icon-btn" data-rdel="${id}:${e.idx}">${t("complements.retirer")}</button></li>`).join("")}</ul>` : ""}` : ""}
    </div>`;
  }).join("");
}
export function renderRec() {
  const d = S.rec, x = DISC[d]; if (!x) return;
  $("recTitle").textContent = t("records.titreActivite", { activite: x.name }); $("v-rec").style.setProperty("--tc", x.color);
  const pd = prsData();
  const items = d === "muscu" ? MUSCU_LIFTS : d === "course" ? RUN_PRS : CALIS_PRS;
  $("recBody").innerHTML = `<p class="hint" style="margin-top:-10px">${t("records.aide." + (d === "muscu" || d === "course" ? d : "calis"))} ${t("records.toucherPlus")}</p>
    <div class="card" style="gap:0;padding-block:4px">${prRows(items, pd[d], d === "muscu" ? "kg" : "time")}</div>`;
}
$("v-rec").addEventListener("click", e => {
  const op = e.target.closest("[data-ropen]"); if (op) { S.recOpen = S.recOpen === op.dataset.ropen ? null : op.dataset.ropen; renderRec(); return; }
  const del = e.target.closest("[data-rdel]");
  if (del) { if (!armed(del, t("commun.confirmer"))) return; const [id, idx] = del.dataset.rdel.split(":"), pd = prsData(); pd[S.rec][id].splice(+idx, 1); saveProfile({ prs: pd }); renderRec(); }
});
$("v-rec").addEventListener("submit", e => {
  e.preventDefault();
  const f = e.target, id = f.dataset.rpr, kind = f.dataset.kind, pd = prsData(), date = todayK(); if (!id) return;
  let entry;
  if (kind === "kg") { const kg = numOr($("rp-v").value); if (kg === "" || kg <= 0) return; entry = { kg, date }; }
  else if (kind === "time") { const sec = (intOr($("rp-h").value) || 0) * 3600 + (intOr($("rp-m").value) || 0) * 60 + (intOr($("rp-s").value) || 0); if (!sec) return; entry = { t: sec, date }; }
  else { const v = intOr($("rp-v").value); if (v === "" || v <= 0) return; entry = { v, date }; }
  (pd[S.rec][id] = pd[S.rec][id] || []).push(entry);
  saveProfile({ prs: pd }); renderRec();
});
