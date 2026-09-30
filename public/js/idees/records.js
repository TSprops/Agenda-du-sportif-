// Records par activité (liste, ajout, suppression).
import { benchEntries, cfData, shortDate } from "./crossfit.js";
import { CALIS_PRS, MUSCU_LIFTS, RUN_PRS, fmtTime, prsData } from "./idees-seances.js";
import { $, BENCH, DISC, S, armed, esc, nf, numOr, runPace, todayK } from "../commun/core.js";
import { intOr } from "../seances/index.js";
import { saveProfile } from "../commun/store.js";

/* ---------- Records ---------- */
// items : [id, nom, distance (course), type : kg | time | reps | sec]
export const prBest = (kind, list) => kind === "time" ? list.slice().sort((a, b) => a.t - b.t)[0] : kind === "kg" ? list.slice().sort((a, b) => b.kg - a.kg)[0] : list.slice().sort((a, b) => b.v - a.v)[0];
export const prText = (kind, e) => kind === "time" ? fmtTime(e.t) : kind === "kg" ? nf.format(e.kg) + " kg" : kind === "sec" ? e.v + " s" : e.v + " reps";
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
export function renderRec() {
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
