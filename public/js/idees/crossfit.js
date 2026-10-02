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
// Explications des WOD de référence : déroulé, score, charges, version adaptée, repères de niveau, conseil.
const WOD_HOW = {
  fran: { steps: ["21 thrusters, puis 21 tractions", "15 thrusters, puis 15 tractions", "9 thrusters, puis 9 tractions"],
    rx: "Barre à 43 kg pour les hommes, 29 kg pour les femmes.", scaled: "Barre à 20 ou 15 kg, tractions avec élastique ou tractions australiennes.",
    lv: ["< 4 min", "4 – 7 min", "8 – 12 min"], tip: "Découpe les tractions dès le premier tour (ex. 11 + 10) pour ne pas exploser les avant-bras." },
  grace: { steps: ["30 clean & jerks, de la façon que tu veux : à la suite, par paquets ou un par un"],
    rx: "Barre à 61 kg pour les hommes, 43 kg pour les femmes.", scaled: "Une charge que tu soulèves 10 fois d’affilée sans forcer (ex. 40 / 25 kg).",
    lv: ["< 3 min", "3 – 6 min", "7 – 10 min"], tip: "Fais des singles réguliers (une rep toutes les 5 à 10 s) plutôt que de gros paquets qui te cassent." },
  isabel: { steps: ["30 snatchs (arraché), barre du sol au-dessus de la tête en un seul mouvement"],
    rx: "Barre à 61 kg pour les hommes, 43 kg pour les femmes.", scaled: "Power snatch léger (ex. 35 / 25 kg) ou haltère alterné.",
    lv: ["< 3 min", "3 – 6 min", "7 – 10 min"], tip: "Comme Grace : des singles rapides, en gardant le dos bien gainé à chaque reprise." },
  diane: { steps: ["21 soulevés de terre, puis 21 handstand push-ups", "15 soulevés de terre, puis 15 handstand push-ups", "9 soulevés de terre, puis 9 handstand push-ups"],
    rx: "Barre à 102 kg pour les hommes, 70 kg pour les femmes. Pompes en équilibre contre le mur.", scaled: "Barre à 60 / 40 kg, pike push-ups ou développé militaire haltères.",
    lv: ["< 5 min", "5 – 9 min", "10 – 15 min"], tip: "Le soulevé de terre va vite : garde de l’énergie pour les handstand push-ups, à découper en petits paquets." },
  elizabeth: { steps: ["21 squat cleans, puis 21 dips aux anneaux", "15 squat cleans, puis 15 dips", "9 squat cleans, puis 9 dips"],
    rx: "Barre à 61 kg pour les hommes, 43 kg pour les femmes.", scaled: "Barre plus légère (40 / 25 kg), dips sur barres ou banc.",
    lv: ["< 6 min", "6 – 10 min", "11 – 15 min"], tip: "Enchaîne les cleans en touch and go tant que la technique tient, puis passe en singles." },
  helen: { steps: ["Course de 400 m", "21 kettlebell swings", "12 tractions", "Recommence : 3 tours au total"],
    rx: "Kettlebell de 24 kg pour les hommes, 16 kg pour les femmes. Swings au-dessus de la tête.", scaled: "Kettlebell de 16 / 12 kg, tractions avec élastique.",
    lv: ["< 9 min", "9 – 12 min", "13 – 16 min"], tip: "Sur la course, récupère sans ralentir : c’est là que tu gagnes du temps en enchaînant vite sur les swings." },
  karen: { steps: ["150 wall balls : squat complet avec le médecine-ball, puis lancer sur la cible"],
    rx: "Ballon de 9 kg à 3 m pour les hommes, 6 kg à 2,70 m pour les femmes.", scaled: "Ballon plus léger (6 / 4 kg) ou cible plus basse.",
    lv: ["< 7 min", "7 – 10 min", "11 – 15 min"], tip: "Fixe-toi des séries (ex. 15 reps puis 3 respirations) dès le début, avant d’être fatigué." },
  annie: { steps: ["50 double unders, puis 50 sit-ups", "40 + 40", "30 + 30", "20 + 20", "10 + 10"],
    rx: "Double unders : la corde passe deux fois sous les pieds à chaque saut.", scaled: "Simple unders (2 fois plus de sauts) ou moins de reps.",
    lv: ["< 8 min", "8 – 11 min", "12 – 15 min"], tip: "Sur les sit-ups, garde un rythme régulier : ce sont eux qui ralentissent le plus en fin de WOD." },
  jackie: { steps: ["1000 m de rameur", "50 thrusters", "30 tractions"],
    rx: "Barre à 20 kg pour les hommes, 15 kg pour les femmes.", scaled: "Barre à vide plus légère, tractions avec élastique ou australiennes.",
    lv: ["< 8 min", "8 – 11 min", "12 – 15 min"], tip: "Ne pars pas trop vite au rameur : ton souffle doit être prêt pour les 50 thrusters." },
  cindy: { steps: ["5 tractions", "10 pompes", "15 air squats", "Recommence autant de tours que possible en 20 minutes"],
    score: "Ton score : le nombre de tours complets + les reps du tour en cours.",
    rx: "Au poids du corps. Pompes poitrine au sol, squats sous la parallèle.", scaled: "Tractions avec élastique, pompes sur les genoux ou mains surélevées.",
    lv: ["25 + tours", "15 – 24 tours", "8 – 14 tours"], tip: "Garde un rythme régulier, environ un tour par minute, plutôt que de partir trop vite." },
  murph: { steps: ["Course de 1,6 km", "100 tractions, 200 pompes, 300 air squats (tu peux les découper comme tu veux, ex. 20 tours de 5-10-15)", "Course de 1,6 km"],
    rx: "Avec un gilet lesté de 9 kg pour les hommes, 6 kg pour les femmes.", scaled: "Sans gilet, la moitié des reps (« demi-Murph ») ou tractions avec élastique.",
    lv: ["< 45 min", "45 – 60 min", "60 – 80 min"], tip: "Découpe en 20 tours de 5 tractions, 10 pompes, 15 squats : c’est la façon la plus simple de tenir." }
};
function wodHowHTML(bm) {
  const w = WOD_HOW[bm.id]; if (!w) return "";
  const amrap = bm.type === "amrap";
  return `<div class="wod-how">
    <h4>Le déroulé</h4>
    ${amrap ? `<p>Pendant ${bm.cap} minutes, enchaîne :</p>` : ""}
    <${w.steps.length > 1 && !amrap ? "ol" : "ul"}>${w.steps.map(x => `<li>${esc(x)}</li>`).join("")}</${w.steps.length > 1 && !amrap ? "ol" : "ul"}>
    <p class="hint">${esc(w.score || "Le chrono part au « 3, 2, 1, go » et s’arrête à la dernière rep. Ton score, c’est ton temps.")}</p>
    <h4>Charges (Rx)</h4><p>${esc(w.rx)}</p>
    <h4>Version adaptée (Scaled)</h4><p>${esc(w.scaled)}</p>
    <h4>Repères ${amrap ? "" : "de temps"}</h4>
    <div class="wod-lv">${w.lv.map((v, i) => `<div><b>${esc(v)}</b>${["Très bon", "Confirmé", "Débutant"][i]}</div>`).join("")}</div>
    <h4>Conseil</h4><p>${esc(w.tip)}</p>
  </div>`;
}
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
        <button class="linkish wod-how-btn" data-cfhow="${bm.id}" aria-expanded="${S.cfHow === bm.id}">Comment ça marche ${S.cfHow === bm.id ? "▴" : "▾"}</button>
        ${S.cfHow === bm.id ? wodHowHTML(bm) : ""}
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
  const hw = e.target.closest("[data-cfhow]");
  if (hw) { S.cfHow = S.cfHow === hw.dataset.cfhow ? null : hw.dataset.cfhow; renderCrossfit(); return; }
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
