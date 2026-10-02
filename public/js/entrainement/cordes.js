// Entraînement : séance « Cordes » (nombre de cordes, départ toutes les X, lest).
import { exKey } from "./derniere-fois.js";
import { howBtnHTML } from "../comment-faire/index.js";
import { S, esc, nf, pad, plural } from "../commun/core.js";
import { shortDate } from "../idees/index.js";

/* ============================================================
   Séance « Cordes » : nombre de cordes, départ toutes les X, lest
   ============================================================ */
const CORDES_KEYS = ["ropes", "every", "unit", "dur", "durUnit", "lest", "kg"];
const CORDES_DEF = { unit: "s", durUnit: "min", lest: false };
export function cordesOf(x) { return x && x.kind === "cordes" ? { kind: "cordes", ...Object.fromEntries(CORDES_KEYS.map(k => [k, x[k] ?? (k in CORDES_DEF ? CORDES_DEF[k] : "")])) } : {}; }
/* Départs réguliers (cordes, callisthénie) : X par départ, départ toutes les Y, pendant Z.
   Sans durée (anciennes séances Cordes) : « X » est le nombre de départs, une corde à chaque fois. */
const secs = (v, u) => (+v || 0) * (u === "min" ? 60 : 1);
export function departPlan(per, every, unit, dur, durUnit) {
  const ev = secs(every, unit), d = secs(dur, durUnit || "min");
  if (!ev) return null;
  if (!d) return +per ? { every: ev, n: +per, total: +per, dur: 0 } : null;
  const n = Math.max(1, Math.floor(d / ev));
  return { every: ev, n, total: n * (+per || 1), dur: n * ev };
}
export const cordesPlan = x => departPlan(x.ropes, x.every, x.unit, x.dur, x.durUnit);
// Callisthénie : la durée est obligatoire (sinon on reste en séries classiques).
export const calisPlan = d => d && +d.dur ? departPlan(d.reps || 1, d.every, d.unit, d.dur, d.durUnit) : null;
export function calisDepText(ex) {
  const d = ex.dep || {}, pl = calisPlan(d), p = [];
  if (d.reps) p.push(d.reps + " reps par départ");
  if (d.every) p.push("toutes les " + unitTxt(d.every, d.unit));
  if (d.dur) p.push("pendant " + unitTxt(d.dur, d.durUnit || "min"));
  if (pl) p.push(d.ok !== "" && d.ok != null ? `${d.ok} / ${plural(pl.n, "départ")} réussis` : plural(pl.n, "départ"));
  if (d.lest && d.kg) p.push("lest " + nf.format(d.kg) + " kg");
  return p.join(" · ");
}
export const cordesTotal = x => { const p = cordesPlan(x); return p ? p.total : +x.ropes || 0; };
const unitTxt = (v, u) => nf.format(v) + (u === "min" ? " min" : " s");
export function departSummary(p, word) {
  if (!p) return "";
  return `<b>${plural(p.n, "départ")}</b> · ${plural(p.total, word)} au total${p.dur ? " · " + Math.floor(p.dur / 60) + ":" + pad(p.dur % 60) : ""}`;
}
export function cordesText(x) {
  const p = [];
  if (x.dur) {
    if (x.ropes) p.push(plural(+x.ropes, "corde") + " par départ");
    if (x.every) p.push("toutes les " + unitTxt(x.every, x.unit));
    p.push("pendant " + unitTxt(x.dur, x.durUnit || "min"));
    const pl = cordesPlan(x); if (pl) p.push(plural(pl.n, "départ") + ", " + plural(pl.total, "corde"));
  } else {
    if (x.ropes) p.push(plural(+x.ropes, "corde"));
    if (x.every) p.push("départ toutes les " + unitTxt(x.every, x.unit));
  }
  p.push(x.lest ? "lesté" + (x.kg ? " " + nf.format(x.kg) + " kg" : "") : "sans lest");
  return p.join(" · ");
}
export function lastCordes(name, before) {
  const nk = exKey(name || ""); if (!nk) return null;
  const k = Object.keys(S.days).filter(x => x < before).sort().reverse().find(x => (S.days[x].exercises || []).some(e => e.kind === "cordes" && exKey(e.name || "") === nk && +e.ropes));
  return k ? { k, ex: S.days[k].exercises.find(e => e.kind === "cordes" && exKey(e.name || "") === nk && +e.ropes) } : null;
}
// Trois champs : X par départ, toutes les (s / min), pendant (s / min). « p » : préfixe des champs (cd = cordes, dp = callisthénie).
export function departFields(ex, i, p, perLbl, perKey, perPh) {
  const val = v => v === undefined || v === null ? "" : esc(v), du = ex.durUnit || "min";
  return `<div class="grid3 dep-grid">
    <label class="field"><span>${perLbl}</span><input id="${p}-per-${i}" class="num" data-f="${p}-per" data-ex="${i}" inputmode="numeric" placeholder="${perPh}" value="${val(ex[perKey])}"></label>
    <div class="field"><span>Toutes les</span><div class="cd-every"><input id="${p}-every-${i}" class="num" data-f="${p}-every" data-ex="${i}" inputmode="decimal" placeholder="${ex.unit === "min" ? "1" : "30"}" value="${val(ex.every)}"><button type="button" class="unit" data-a="${p}-unit" data-ex="${i}" aria-label="Changer secondes ou minutes">${ex.unit === "min" ? "min" : "s"}</button></div></div>
    <div class="field"><span>Pendant</span><div class="cd-every"><input id="${p}-dur-${i}" class="num" data-f="${p}-dur" data-ex="${i}" inputmode="decimal" placeholder="${du === "min" ? "10" : "60"}" value="${val(ex.dur)}"><button type="button" class="unit" data-a="${p}-durunit" data-ex="${i}" aria-label="Changer secondes ou minutes">${du === "min" ? "min" : "s"}</button></div></div>
  </div>`;
}
export function cordesExHTML(ex, i) {
  const h = S.open && lastCordes(ex.name, S.open), val = v => v === undefined || v === null ? "" : esc(v);
  return `<article class="ex cordes">
  <div class="ex-head"><span class="ex-num">${pad(i + 1)}</span><input id="exn-${i}" class="ex-name${ex.lock ? " locked" : ""}" data-f="ex-name" data-ex="${i}" placeholder="ex. Montée de corde" value="${esc(ex.name)}" autocomplete="off"${ex.lock ? ' readonly aria-readonly="true"' : ""}>${howBtnHTML(ex.name, i)}<button class="icon-btn" data-a="del-ex" data-ex="${i}" aria-label="Supprimer l’exercice">Retirer</button></div>
  ${h ? `<div class="ex-last"><span class="ll-k">↺ ${esc(shortDate(h.k))}</span> ${esc(cordesText(h.ex))}</div>` : ""}
  ${departFields(ex, i, "cd", "Par départ", "ropes", "ex. 1")}
  <div class="dep-sum" id="cd-sum-${i}">${departSummary(cordesPlan(ex), "corde")}</div>
  <div class="field"><span>Lest</span><div class="chips">
    <button type="button" class="chip" data-a="cd-lest" data-ex="${i}" data-v="0" style="--tc:var(--tc)" aria-pressed="${!ex.lest}">Sans lest</button>
    <button type="button" class="chip" data-a="cd-lest" data-ex="${i}" data-v="1" style="--tc:var(--tc)" aria-pressed="${!!ex.lest}">Lesté</button>
  </div></div>
  ${ex.lest ? `<label class="field"><span>Poids du lest (kg)</span><input id="cd-kg-${i}" class="num" data-f="cd-kg" data-ex="${i}" inputmode="decimal" placeholder="ex. 5" value="${val(ex.kg)}"></label>` : ""}
  <button class="btn primary set-go" id="cdgo-${i}" data-a="cd-go" data-ex="${i}"${cordesPlan(ex) ? "" : " disabled"}>⏱ Lancer les départs</button>
  <textarea id="exr-${i}" data-f="ex-note" data-ex="${i}" placeholder="Ressenti : prise, technique, fatigue…" rows="2">${esc(ex.note)}</textarea>
  </article>`;
}
