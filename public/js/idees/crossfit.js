// CrossFit : records (1RM) et WOD de référence.
import { tryIdea } from "./idees-seances.js";
import { $, BENCH, DISC, LIFTS, S, armed, clone, discOf, esc, fmtCourt, fmtDur, nf, numOr, parse, todayK } from "../commun/core.js";
import { t } from "../commun/i18n.js";
import { freshKey } from "../entrainement/index.js";
import { norm } from "../pages/faq.js";
import { intOr, openDay } from "../seances/index.js";
import { go, saveProfile } from "../commun/store.js";

/* ============================================================
   CrossFit : records (1RM) et WOD de référence
   ============================================================ */
export function cfData() { const cf = clone((S.profile && S.profile.cf) || {}); cf.prs = cf.prs || {}; cf.bench = cf.bench || {}; return cf; }
// « 2 oct. », avec l'année si ce n'est pas l'année en cours.
export function shortDate(k) { const d = parse(k); return fmtCourt(d, d.getFullYear() !== new Date().getFullYear()); }
// Résultats d'un WOD de référence : ceux notés ici + ceux des séances du calendrier portant le même nom.
export function benchEntries(bm) {
  const manual = (cfData().bench[bm.id] || []).map((e, idx) => ({ ...e, idx, manual: true }));
  const fromDays = Object.keys(S.days).filter(k => discOf(S.days[k]) === "crossfit" && S.days[k].wod && norm(S.days[k].wod.name || "").trim() === norm(bm.name).trim())
    .map(k => {
      const w = S.days[k].wod;
      if (bm.type === "amrap") return w.rounds !== "" && w.rounds != null ? { date: k, r: +w.rounds || 0, reps: +w.reps || 0, rx: w.rx } : null;
      const sec = (+w.sMin || 0) * 60 + (+w.sSec || 0); return sec ? { date: k, t: sec, rx: w.rx } : null;
    }).filter(Boolean);
  return [...manual, ...fromDays].sort((a, b) => a.date < b.date ? 1 : -1);
}
export function benchValue(bm, e) { return bm.type === "amrap" ? e.r * 1000 + (e.reps || 0) : -e.t; }
export function benchText(bm, e) { return bm.type === "amrap" ? t(e.reps ? "crossfit.score.toursReps" : "crossfit.score.tours", { n: e.r, reps: e.reps }) : fmtDur(e.t); }
// Explications des WOD de référence (déroulé, score, charges, version adaptée, repères de niveau, conseil) :
// textes dans « crossfit.how.<id> » ; n = nombre d'étapes ; lv = repères de temps (identiques dans toutes les langues).
const WOD_HOW = {
  fran: { n: 3, score: false, lv: ["< 4 min", "4 – 7 min", "8 – 12 min"] },
  grace: { n: 1, score: false, lv: ["< 3 min", "3 – 6 min", "7 – 10 min"] },
  isabel: { n: 1, score: false, lv: ["< 3 min", "3 – 6 min", "7 – 10 min"] },
  diane: { n: 3, score: false, lv: ["< 5 min", "5 – 9 min", "10 – 15 min"] },
  elizabeth: { n: 3, score: false, lv: ["< 6 min", "6 – 10 min", "11 – 15 min"] },
  helen: { n: 4, score: false, lv: ["< 9 min", "9 – 12 min", "13 – 16 min"] },
  karen: { n: 1, score: false, lv: ["< 7 min", "7 – 10 min", "11 – 15 min"] },
  annie: { n: 5, score: false, lv: ["< 8 min", "8 – 11 min", "12 – 15 min"] },
  jackie: { n: 3, score: false, lv: ["< 8 min", "8 – 11 min", "12 – 15 min"] },
  cindy: { n: 4, score: true, lv: [1, 2, 3].map(i => t(`crossfit.how.cindy.lv${i}`)) },
  murph: { n: 3, score: false, lv: ["< 45 min", "45 – 60 min", "60 – 80 min"] }
};
function wodHowHTML(bm) {
  const w = WOD_HOW[bm.id]; if (!w) return "";
  const amrap = bm.type === "amrap", k = "crossfit.how." + bm.id + ".", tag = w.n > 1 && !amrap ? "ol" : "ul";
  const steps = Array.from({ length: w.n }, (_, i) => t(k + "etapes.e" + (i + 1)));
  return `<div class="wod-how">
    <h4>${t("crossfit.how.deroule")}</h4>
    ${amrap ? `<p>${t("crossfit.how.pendant", { n: bm.cap })}</p>` : ""}
    <${tag}>${steps.map(x => `<li>${esc(x)}</li>`).join("")}</${tag}>
    <p class="hint">${esc(w.score ? t(k + "score") : t("crossfit.how.chrono"))}</p>
    <h4>${t("crossfit.how.charges")}</h4><p>${esc(t(k + "rx"))}</p>
    <h4>${t("crossfit.how.adaptee")}</h4><p>${esc(t(k + "scaled"))}</p>
    <h4>${t(amrap ? "crossfit.how.reperes" : "crossfit.how.reperesTemps")}</h4>
    <div class="wod-lv">${w.lv.map((v, i) => `<div><b>${esc(v)}</b>${t("crossfit.how.niveau" + (i + 1))}</div>`).join("")}</div>
    <h4>${t("crossfit.how.conseil")}</h4><p>${esc(t(k + "tip"))}</p>
  </div>`;
}
export function renderCrossfit() {
  const rec = S.cfMode === "records", cf = cfData(), tk = todayK(), ym = tk.slice(0, 7);
  $("cfTitle").textContent = t(rec ? "records.titreActivite" : "idees.titreActivite", { activite: DISC.crossfit.name });
  $("cfBack").dataset.go = rec ? "records" : "types"; $("cfBack").textContent = "‹ " + t(rec ? "nav.records" : "nav.idees");
  $("cfToday").hidden = rec; $("cfStats").hidden = !rec; $("cfPrSec").hidden = !rec;
  $("cfBenchTitle").textContent = t(rec ? "crossfit.mesTemps" : "crossfit.aEssayer");
  const cfDays = Object.keys(S.days).filter(k => discOf(S.days[k]) === "crossfit");
  const nPr = Object.values(cf.prs).filter(l => l.length).length;
  $("cfStats").innerHTML = `<div class="stat"><b>${cfDays.filter(k => k.startsWith(ym)).length}</b><span>${t("crossfit.wodCeMois")}</span></div><div class="stat"><b>${cfDays.length}</b><span>${t("crossfit.wodTotal")}</span></div><div class="stat"><b>${nPr}</b><span>${t("crossfit.nRecords", { n: nPr })}</span></div>`;
  $("cfPrs").innerHTML = LIFTS.map(([id, name]) => {
    const list = (cf.prs[id] || []).slice().sort((a, b) => b.kg - a.kg), best = list[0], open = S.cfOpen === "pr:" + id;
    return `<div class="pr${open ? " open" : ""}">
      <button class="pr-row" data-cf="pr:${id}"><span class="main"><b>${esc(name)}</b><span>${best ? esc(t("records.leDate", { date: shortDate(best.date) })) : t("records.aucun")}</span></span><span class="pr-kg">${best ? nf.format(best.kg) + "<small> kg</small>" : "–"}</span><span class="arrow" aria-hidden="true">${open ? "−" : "+"}</span></button>
      ${open ? `<form class="pr-form" data-pr="${id}"><label class="field"><span>${t("records.nouvelleCharge")}</span><input id="pr-kg" inputmode="decimal" placeholder="${esc(t("crossfit.ex100"))}" required></label><button class="btn primary" type="submit">${t("commun.ajouter")}</button></form>
        ${list.length ? `<ul class="hist">${(cf.prs[id] || []).map((e, idx) => ({ ...e, idx })).sort((a, b) => a.date < b.date ? 1 : -1).map(e => `<li><span>${esc(shortDate(e.date))}</span><b>${nf.format(e.kg)} kg</b><button class="icon-btn" data-prdel="${id}:${e.idx}">${t("complements.retirer")}</button></li>`).join("")}</ul>` : ""}` : ""}
    </div>`;
  }).join("");
  $("cfBench").innerHTML = BENCH.map(bm => {
    const ents = benchEntries(bm), best = ents.slice().sort((a, b) => benchValue(bm, b) - benchValue(bm, a))[0], open = rec && S.cfOpen === "bm:" + bm.id;
    const fmt = bm.type === "amrap" ? "AMRAP " + bm.cap + " min" : t("crossfit.formats.fortime");
    if (!rec) return `<div class="bench"><div class="bench-top"><span class="main"><b>${esc(bm.name)}</b><span class="tag cf">${fmt}</span><span class="desc">${esc(bm.desc)}</span></span>
        <span class="bench-best">${best ? `<b>${esc(benchText(bm, best))}</b><small>${t("crossfit.tonRecord")}</small>` : ""}</span></div>
        <button class="linkish wod-how-btn" data-cfhow="${bm.id}" aria-expanded="${S.cfHow === bm.id}">${t("crossfit.commentCaMarche")} ${S.cfHow === bm.id ? "▴" : "▾"}</button>
        ${S.cfHow === bm.id ? wodHowHTML(bm) : ""}
        <button class="btn primary idea-go cf-btn" data-bmwod="${bm.id}" style="margin-bottom:14px">${t("idees.essayer")}</button></div>`;
    return `<div class="bench${open ? " open" : ""}">
      <button class="bench-top" data-cf="bm:${bm.id}"><span class="main"><b>${esc(bm.name)}</b><span class="tag cf">${fmt}</span><span class="desc">${esc(bm.desc)}</span></span>
        <span class="bench-best">${best ? `<b>${esc(benchText(bm, best))}</b><small>${best.rx === false ? "Scaled" : best.rx ? "Rx" : t("crossfit.record")}</small>` : `<small>${t("crossfit.aTenter")}</small>`}</span></button>
      ${open ? `<form class="pr-form" data-bm="${bm.id}">
          ${bm.type === "amrap"
            ? `<div class="grid2"><label class="field"><span>${t("crossfit.tours")}</span><input id="bm-r" inputmode="numeric" required></label><label class="field"><span>${t("crossfit.plusReps")}</span><input id="bm-reps" inputmode="numeric"></label></div>`
            : `<div class="field"><span>${t("crossfit.tonTemps")}</span><div class="dur dur2"><input id="bm-m" inputmode="numeric" placeholder="4" required aria-label="${esc(t("course.unites.min"))}"><i>:</i><input id="bm-s" inputmode="numeric" placeholder="35" aria-label="${esc(t("course.unites.s"))}"></div></div>`}
          <div class="chips"><button type="button" class="chip" data-bmrx="1" aria-pressed="${S.bmRx !== false}" style="--tc:${DISC.crossfit.color}">Rx</button><button type="button" class="chip" data-bmrx="0" aria-pressed="${S.bmRx === false}" style="--tc:${DISC.crossfit.color}">Scaled</button></div>
          <button class="btn primary" type="submit">${t("crossfit.enregistrerResultat")}</button>
        </form>
        ${ents.length ? `<ul class="hist">${ents.slice(0, 8).map(e => `<li><span>${esc(shortDate(e.date))}</span><b>${esc(benchText(bm, e))}</b><small>${e.rx === false ? "Scaled" : e.rx ? "Rx" : ""}</small>${e.manual ? `<button class="icon-btn" data-bmdel="${bm.id}:${e.idx}">${t("complements.retirer")}</button>` : `<small class="src">${t("crossfit.seance")}</small>`}</li>`).join("")}</ul>` : ""}
` : ""}
    </div>`;
  }).join("");
}
$("cfToday").onclick = () => { go("seances"); openDay(freshKey(todayK()), "crossfit"); };
$("v-crossfit").addEventListener("click", e => {
  const hw = e.target.closest("[data-cfhow]");
  if (hw) { S.cfHow = S.cfHow === hw.dataset.cfhow ? null : hw.dataset.cfhow; renderCrossfit(); return; }
  const tg = e.target.closest("[data-cf]");
  if (tg) { S.cfOpen = S.cfOpen === tg.dataset.cf ? null : tg.dataset.cf; S.bmRx = true; renderCrossfit(); return; }
  const rx = e.target.closest("[data-bmrx]");
  if (rx) { S.bmRx = rx.dataset.bmrx === "1"; rx.parentElement.querySelectorAll("[data-bmrx]").forEach(x => x.setAttribute("aria-pressed", String(x === rx))); return; }
  const pd = e.target.closest("[data-prdel]");
  if (pd) { if (!armed(pd, t("commun.confirmer"))) return; const [id, idx] = pd.dataset.prdel.split(":"); const cf = cfData(); cf.prs[id].splice(+idx, 1); saveProfile({ cf }); renderCrossfit(); return; }
  const bd = e.target.closest("[data-bmdel]");
  if (bd) { if (!armed(bd, t("commun.confirmer"))) return; const [id, idx] = bd.dataset.bmdel.split(":"); const cf = cfData(); cf.bench[id].splice(+idx, 1); saveProfile({ cf }); renderCrossfit(); return; }
  const bw = e.target.closest("[data-bmwod]");
  if (bw) {
    const bm = BENCH.find(x => x.id === bw.dataset.bmwod);
    tryIdea(bw, "crossfit", c => { c.title = bm.name; Object.assign(c.wod, { name: bm.name, format: bm.type === "amrap" ? "AMRAP" : "For Time", cap: bm.cap || "", moves: clone(bm.moves) }); }); // i18n-ignore (format)
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
    else { const sec = (intOr($("bm-m").value) || 0) * 60 + (intOr($("bm-s").value) || 0); if (!sec) return; entry.t = sec; }
    (cf.bench[bm.id] = cf.bench[bm.id] || []).push(entry);
  }
  saveProfile({ cf }); renderCrossfit();
});
