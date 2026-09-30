// CrossFit : records (1RM) et WOD de référence.
import { tryIdea } from "./idees-seances.js";
import { $, BENCH, DISC, LIFTS, S, armed, clone, discOf, esc, fmtDur, nf, numOr, parse, todayK } from "../commun/core.js";
import { freshKey } from "../entrainement/index.js";
import { norm } from "../pages/faq.js";
import { intOr, openDay } from "../seances/index.js";
import { go, saveProfile } from "../commun/store.js";

/* ============================================================
   CrossFit : records (1RM) et WOD de référence
   ============================================================ */
export function cfData() { const cf = clone((S.profile && S.profile.cf) || {}); cf.prs = cf.prs || {}; cf.bench = cf.bench || {}; return cf; }
export const MONTHS_S = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
export function shortDate(k) { const d = parse(k); return d.getDate() + " " + MONTHS_S[d.getMonth()] + (d.getFullYear() !== new Date().getFullYear() ? " " + d.getFullYear() : ""); }
// Résultats d'un WOD de référence : ceux notés ici + ceux des séances du calendrier portant le même nom.
export function benchEntries(bm) {
  const manual = (cfData().bench[bm.id] || []).map((e, idx) => ({ ...e, idx, manual: true }));
  const fromDays = Object.keys(S.days).filter(k => discOf(S.days[k]) === "crossfit" && S.days[k].wod && norm(S.days[k].wod.name || "").trim() === norm(bm.name).trim())
    .map(k => {
      const w = S.days[k].wod;
      if (bm.type === "amrap") return w.rounds !== "" && w.rounds != null ? { date: k, r: +w.rounds || 0, reps: +w.reps || 0, rx: w.rx } : null;
      const t = (+w.sMin || 0) * 60 + (+w.sSec || 0); return t ? { date: k, t, rx: w.rx } : null;
    }).filter(Boolean);
  return [...manual, ...fromDays].sort((a, b) => a.date < b.date ? 1 : -1);
}
export function benchValue(bm, e) { return bm.type === "amrap" ? e.r * 1000 + (e.reps || 0) : -e.t; }
export function benchText(bm, e) { return bm.type === "amrap" ? `${e.r} tours${e.reps ? " + " + e.reps : ""}` : fmtDur(e.t); }
export function renderCrossfit() {
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
