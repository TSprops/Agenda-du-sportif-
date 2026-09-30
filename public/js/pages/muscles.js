// Carte musculaire.
import { $, MUSCLES, S, dayOf, discOf, esc, isEmpty, key, nf } from "../commun/core.js";
import { doneSet } from "../idees/index.js";
import { musclesOf } from "../entrainement/index.js";
import { addDays } from "./accueil.js";

/* ============================================================
   Carte musculaire
   ============================================================ */
// Séries par muscle sur une liste de séances : 1 par série pour les muscles principaux, 0,5 pour les secondaires.
function muscleLoad(ks) {
  const out = {};
  const add = (mu, v) => { if (!mu) return; mu.p.forEach(m => { out[m] = (out[m] || 0) + v; }); (mu.s || []).forEach(m => { out[m] = (out[m] || 0) + v / 2; }); };
  ks.forEach(k => {
    const s = S.days[k]; if (!s || isEmpty(s)) return;
    const disc = discOf(s);
    if (disc === "muscu" || disc === "calis" || disc === "cordes") (s.exercises || []).forEach(ex => {
      const n = ex.kind === "cordes" ? Math.ceil((+ex.ropes || 0) / 2) : (ex.sets || []).filter(st => st.done === true || doneSet(st)).length; if (n) add(musclesOf(ex.name), n);
    });
    else if (disc === "crossfit") ((s.wod || {}).moves || []).forEach(m => { if (m.name) add(musclesOf(m.name), 2); });
    else if (disc === "course" && +((s.run || {}).dist)) add({ p: ["quadriceps", "mollets"], s: ["ischios", "fessiers"] }, 3);
  });
  return out;
}
// Formes du corps (moitié gauche : la droite est dessinée en miroir). [muscle, forme SVG]
const BODY = {
  front: {
    mid: [["", '<ellipse cx="60" cy="18" rx="11" ry="13"/>'], ["", '<path d="M54 29h12v8H54z"/>'], ["trapezes", '<path d="M52 35q8-2 16 0l10 7q-18-3-36 0z"/>'],
      ["abdos", '<rect x="50" y="65" width="20" height="38" rx="5"/>'], ["", '<path d="M44 104h32l1 12-17 8-17-8z"/>']],
    side: [["epaules", '<ellipse cx="36" cy="49" rx="9" ry="9"/>'], ["pecs", '<path d="M44 43q8-2 15 0v19q-9 4-16-1-3-9 1-18z"/>'],
      ["biceps", '<ellipse cx="31" cy="66" rx="6" ry="12"/>'], ["avantbras", '<ellipse cx="27" cy="91" rx="5.5" ry="13"/>'], ["", '<circle cx="25" cy="110" r="5"/>'],
      ["obliques", '<path d="M43 64q4 2 6 4v34q-5-2-7-10z"/>'], ["quadriceps", '<path d="M43 118q9 4 15 8l-2 42q-8 4-12-2-5-26-1-48z"/>'],
      ["", '<circle cx="50" cy="175" r="5"/>'], ["mollets", '<ellipse cx="49" cy="200" rx="6" ry="19"/>'], ["", '<ellipse cx="48" cy="225" rx="7" ry="4"/>']]
  },
  back: {
    mid: [["", '<ellipse cx="60" cy="18" rx="11" ry="13"/>'], ["", '<path d="M54 29h12v6H54z"/>'], ["trapezes", '<path d="M50 33q10-3 20 0l10 10-12 17-8 4-8-4-12-17z"/>'],
      ["lombaires", '<path d="M53 88h14l1 16H52z"/>']],
    side: [["epaules", '<ellipse cx="36" cy="49" rx="9" ry="9"/>'], ["dorsaux", '<path d="M42 50l10 10 6 8-2 24q-8-4-12-14-4-14-2-28z"/>'],
      ["triceps", '<ellipse cx="31" cy="66" rx="6" ry="12"/>'], ["avantbras", '<ellipse cx="27" cy="91" rx="5.5" ry="13"/>'], ["", '<circle cx="25" cy="110" r="5"/>'],
      ["fessiers", '<path d="M44 105q8-2 15 2v17q-9 4-15-2z"/>'], ["ischios", '<path d="M44 126q8 4 14 4l-2 38q-8 4-11-2-4-20-1-40z"/>'],
      ["", '<circle cx="50" cy="175" r="5"/>'], ["mollets", '<ellipse cx="49" cy="198" rx="7" ry="17"/>'], ["", '<ellipse cx="48" cy="225" rx="7" ry="4"/>']]
  }
};
const BACK_ONLY = ["dorsaux", "lombaires", "triceps", "fessiers", "ischios"];
function bodySVG(view, lv, opt) {
  const b = BODY[view], o = opt || {};
  const shape = ([m, d]) => {
    const l = m ? (lv[m] || 0) : -1;
    return d.replace(/^<(\w+)/, `<$1 class="mu l${l}"${m && o.tap ? ` data-mu="${m}"` : ""}`);
  };
  return `<svg viewBox="0 0 120 232" class="body${o.cls ? " " + o.cls : ""}" role="img" aria-label="${view === "front" ? "Vue de face" : "Vue de dos"}">
    ${b.mid.map(shape).join("")}${b.side.map(shape).join("")}<g transform="translate(120 0) scale(-1 1)">${b.side.map(shape).join("")}</g></svg>`;
}
// Petite silhouette pour la bibliothèque : muscles principaux en couleur, secondaires en clair.
function muscleMini(p, s) {
  const lv = {}; (s || []).forEach(m => { lv[m] = 1; }); (p || []).forEach(m => { lv[m] = 4; });
  const view = (p || []).some(m => BACK_ONLY.includes(m)) ? "back" : "front";
  return bodySVG(view, lv, { cls: "mini" });
}
const LOAD_LEVELS = [[0, "Pas travaillé"], [1, "Un peu"], [2, "Bien"], [3, "Beaucoup"], [4, "Énormément"]];
function levelOf(v, days) { const f = days > 7 ? 3 : 1; return v <= 0 ? 0 : v < 4 * f ? 1 : v < 8 * f ? 2 : v < 14 * f ? 3 : 4; }
function renderMuscles() {
  const days = S.musDays || 7, from = key(addDays(new Date(), -(days - 1)));
  const ks = Object.keys(S.days).filter(k => dayOf(k) >= from), load = muscleLoad(ks), lv = {};
  Object.keys(MUSCLES).forEach(m => { lv[m] = levelOf(load[m] || 0, days); });
  const rows = Object.keys(MUSCLES).map(m => [m, Math.round((load[m] || 0) * 2) / 2]).sort((a, b) => b[1] - a[1]);
  const max = Math.max(1, ...rows.map(r => r[1])), rest = rows.filter(r => !r[1]).map(r => MUSCLES[r[0]]);
  $("musBody").innerHTML = `<div class="chips">${[[7, "7 derniers jours"], [30, "30 derniers jours"]].map(([d, n]) => `<button type="button" class="chip" data-mdays="${d}" style="--tc:var(--red)" aria-pressed="${d === days}">${n}</button>`).join("")}</div>
    <section class="card mus-card">
      <div class="bodies"><figure>${bodySVG("front", lv, { tap: 1 })}<figcaption>Face</figcaption></figure><figure>${bodySVG("back", lv, { tap: 1 })}<figcaption>Dos</figcaption></figure></div>
      <p class="mus-tip" id="musTip">Touche un muscle pour voir son nombre de séries.</p>
      <div class="mus-legend">${LOAD_LEVELS.map(([l, n]) => `<span><i class="mu l${l}"></i>${n}</span>`).join("")}</div>
    </section>
    ${ks.length ? "" : `<div class="empty">Aucune séance sur cette période : tes muscles s’allumeront au fil de tes séances.</div>`}
    ${rest.length && ks.length ? `<section class="card"><div class="lbl">À travailler</div><p style="margin:0">${esc(rest.join(", "))}</p><p class="hint">Aucune série pour ces muscles sur les ${days} derniers jours.</p></section>` : ""}
    <section><h2 class="h2">Séries par muscle</h2><div class="card"><div class="bars">${rows.map(([m, v]) => `<div class="barrow"><span>${esc(MUSCLES[m])}</span><span class="track"><span class="fill" style="width:${v / max * 100}%;--tc:var(--red-hi)"></span></span><b>${nf.format(v)}</b></div>`).join("")}</div>
      <p class="hint">Une série compte pour 1 sur les muscles principaux de l’exercice et 0,5 sur les muscles qui aident.</p></div></section>`;
  S.musLoad = load;
}
$("musBody").addEventListener("click", e => {
  const d = e.target.closest("[data-mdays]"); if (d) { S.musDays = +d.dataset.mdays; renderMuscles(); return; }
  const m = e.target.closest("[data-mu]"); if (!m) return;
  const mu = m.dataset.mu, v = Math.round(((S.musLoad || {})[mu] || 0) * 2) / 2;
  $("musTip").innerHTML = `<b>${esc(MUSCLES[mu])}</b> · ${nf.format(v)} série${v > 1 ? "s" : ""} sur les ${S.musDays || 7} derniers jours`;
  document.querySelectorAll("#musBody .mu.on").forEach(x => x.classList.remove("on"));
  document.querySelectorAll(`#musBody [data-mu="${mu}"]`).forEach(x => x.classList.add("on"));
});

export { bodySVG, muscleLoad, muscleMini, renderMuscles };
