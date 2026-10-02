// Entraînement : séance « Cordes » (nombre de cordes, départ toutes les X, lest).
import { exKey } from "./derniere-fois.js";
import { howBtnHTML } from "../comment-faire/index.js";
import { S, esc, nf, nomEx, pad } from "../commun/core.js";
import { t } from "../commun/i18n.js";
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
  if (d.reps) p.push(t("departs.repsParDepartN", { n: +d.reps || 0 }));
  if (d.every) p.push(t("departs.toutesLes", { duree: unitTxt(d.every, d.unit) }));
  if (d.dur) p.push(t("departs.pendant", { duree: unitTxt(d.dur, d.durUnit || "min") }));
  if (pl) p.push(d.ok !== "" && d.ok != null ? t("departs.reussisSur", { ok: d.ok, n: pl.n }) : t("departs.nDeparts", { n: pl.n }));
  if (d.lest && d.kg) p.push(t("departs.lestKg", { kg: nf.format(d.kg) }));
  return p.join(" · ");
}
export const cordesTotal = x => { const p = cordesPlan(x); return p ? p.total : +x.ropes || 0; };
const unitTxt = (v, u) => nf.format(v) + (u === "min" ? " min" : " s");
// quoi : « cordes » ou « reps » (ce que l'on compte au total).
export function departSummary(p, quoi) {
  if (!p) return "";
  return `<b>${t("departs.nDeparts", { n: p.n })}</b> · ${t(quoi === "cordes" ? "departs.totalCordes" : "departs.totalReps", { n: p.total })}${p.dur ? " · " + Math.floor(p.dur / 60) + ":" + pad(p.dur % 60) : ""}`;
}
export function cordesText(x) {
  const p = [];
  if (x.dur) {
    if (x.ropes) p.push(t("departs.cordesParDepart", { n: +x.ropes }));
    if (x.every) p.push(t("departs.toutesLes", { duree: unitTxt(x.every, x.unit) }));
    p.push(t("departs.pendant", { duree: unitTxt(x.dur, x.durUnit || "min") }));
    const pl = cordesPlan(x); if (pl) p.push(t("departs.nDeparts", { n: pl.n }) + ", " + t("departs.nCordes", { n: pl.total }));
  } else {
    if (x.ropes) p.push(t("departs.nCordes", { n: +x.ropes }));
    if (x.every) p.push(t("departs.departToutesLes", { duree: unitTxt(x.every, x.unit) }));
  }
  p.push(x.lest ? (x.kg ? t("departs.lesteKg", { kg: nf.format(x.kg) }) : t("departs.lesteMin")) : t("departs.sansLestMin"));
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
    <div class="field"><span>${t("departs.toutesLesTitre")}</span><div class="cd-every"><input id="${p}-every-${i}" class="num" data-f="${p}-every" data-ex="${i}" inputmode="decimal" placeholder="${ex.unit === "min" ? "1" : "30"}" value="${val(ex.every)}"><button type="button" class="unit" data-a="${p}-unit" data-ex="${i}" aria-label="${esc(t("departs.changerUnite"))}">${ex.unit === "min" ? "min" : "s"}</button></div></div>
    <div class="field"><span>${t("departs.pendantTitre")}</span><div class="cd-every"><input id="${p}-dur-${i}" class="num" data-f="${p}-dur" data-ex="${i}" inputmode="decimal" placeholder="${du === "min" ? "10" : "60"}" value="${val(ex.dur)}"><button type="button" class="unit" data-a="${p}-durunit" data-ex="${i}" aria-label="${esc(t("departs.changerUnite"))}">${du === "min" ? "min" : "s"}</button></div></div>
  </div>`;
}
export function cordesExHTML(ex, i) {
  const h = S.open && lastCordes(ex.name, S.open), val = v => v === undefined || v === null ? "" : esc(v);
  return `<article class="ex cordes">
  <div class="ex-head"><span class="ex-num">${pad(i + 1)}</span><input id="exn-${i}" class="ex-name${ex.lock ? " locked" : ""}" data-f="ex-name" data-ex="${i}" placeholder="${esc(t("cordes.exemple"))}" value="${esc(nomEx(ex.name))}" autocomplete="off"${ex.lock ? ' readonly aria-readonly="true"' : ""}>${howBtnHTML(ex.name, i)}<button class="icon-btn" data-a="del-ex" data-ex="${i}" aria-label="${esc(t("series.supprimerExercice"))}">${t("complements.retirer")}</button></div>
  ${h ? `<div class="ex-last"><span class="ll-k">↺ ${esc(shortDate(h.k))}</span> ${esc(cordesText(h.ex))}</div>` : ""}
  ${departFields(ex, i, "cd", t("cordes.parDepart"), "ropes", t("cordes.ex1"))}
  <div class="dep-sum" id="cd-sum-${i}">${departSummary(cordesPlan(ex), "cordes")}</div>
  <div class="field"><span>${t("departs.lest")}</span><div class="chips">
    <button type="button" class="chip" data-a="cd-lest" data-ex="${i}" data-v="0" style="--tc:var(--tc)" aria-pressed="${!ex.lest}">${t("departs.sansLest")}</button>
    <button type="button" class="chip" data-a="cd-lest" data-ex="${i}" data-v="1" style="--tc:var(--tc)" aria-pressed="${!!ex.lest}">${t("departs.leste")}</button>
  </div></div>
  ${ex.lest ? `<label class="field"><span>${t("departs.poidsLest")}</span><input id="cd-kg-${i}" class="num" data-f="cd-kg" data-ex="${i}" inputmode="decimal" placeholder="${esc(t("departs.exemple5"))}" value="${val(ex.kg)}"></label>` : ""}
  <button class="btn primary set-go" id="cdgo-${i}" data-a="cd-go" data-ex="${i}"${cordesPlan(ex) ? "" : " disabled"}>${t("departs.lancer")}</button>
  <textarea id="exr-${i}" data-f="ex-note" data-ex="${i}" placeholder="${esc(t("cordes.notePlaceholder"))}" rows="2">${esc(ex.note)}</textarea>
  </article>`;
}
