// Entraînement : séance « Cordes » (nombre de cordes, départ toutes les X, lest).
import { exKey } from "./derniere-fois.js";
import { howBtnHTML } from "../comment-faire/index.js";
import { S, esc, nf, pad, plural } from "../core.js";
import { shortDate } from "../idees/index.js";

/* ============================================================
   Séance « Cordes » : nombre de cordes, départ toutes les X, lest
   ============================================================ */
const CORDES_KEYS = ["ropes", "every", "unit", "lest", "kg"];
export function cordesOf(x) { return x && x.kind === "cordes" ? { kind: "cordes", ...Object.fromEntries(CORDES_KEYS.map(k => [k, x[k] ?? (k === "unit" ? "s" : k === "lest" ? false : "")])) } : {}; }
export function cordesText(x) {
  const p = [];
  if (x.ropes) p.push(plural(+x.ropes, "corde"));
  if (x.every) p.push("départ toutes les " + nf.format(x.every) + (x.unit === "min" ? " min" : " s"));
  p.push(x.lest ? "lesté" + (x.kg ? " " + nf.format(x.kg) + " kg" : "") : "sans lest");
  return p.join(" · ");
}
export function lastCordes(name, before) {
  const nk = exKey(name || ""); if (!nk) return null;
  const k = Object.keys(S.days).filter(x => x < before).sort().reverse().find(x => (S.days[x].exercises || []).some(e => e.kind === "cordes" && exKey(e.name || "") === nk && +e.ropes));
  return k ? { k, ex: S.days[k].exercises.find(e => e.kind === "cordes" && exKey(e.name || "") === nk && +e.ropes) } : null;
}
export function cordesExHTML(ex, i) {
  const h = S.open && lastCordes(ex.name, S.open), val = v => v === undefined || v === null ? "" : esc(v);
  return `<article class="ex cordes">
  <div class="ex-head"><span class="ex-num">${pad(i + 1)}</span><input id="exn-${i}" class="ex-name${ex.lock ? " locked" : ""}" data-f="ex-name" data-ex="${i}" placeholder="ex. Montée de corde" value="${esc(ex.name)}" autocomplete="off"${ex.lock ? ' readonly aria-readonly="true"' : ""}>${howBtnHTML(ex.name, i)}<button class="icon-btn" data-a="del-ex" data-ex="${i}" aria-label="Supprimer l’exercice">Retirer</button></div>
  ${h ? `<div class="ex-last"><span class="ll-k">↺ ${esc(shortDate(h.k))}</span> ${esc(cordesText(h.ex))}</div>` : ""}
  <div class="grid2">
    <label class="field"><span>Nombre de cordes</span><input id="cd-ropes-${i}" class="num" data-f="cd-ropes" data-ex="${i}" inputmode="numeric" placeholder="ex. 10" value="${val(ex.ropes)}"></label>
    <div class="field"><span>Départ toutes les</span><div class="cd-every"><input id="cd-every-${i}" class="num" data-f="cd-every" data-ex="${i}" inputmode="decimal" placeholder="${ex.unit === "min" ? "1" : "60"}" value="${val(ex.every)}"><button type="button" class="unit" data-a="cd-unit" data-ex="${i}" aria-label="Changer secondes ou minutes">${ex.unit === "min" ? "min" : "s"}</button></div></div>
  </div>
  <div class="field"><span>Lest</span><div class="chips">
    <button type="button" class="chip" data-a="cd-lest" data-ex="${i}" data-v="0" style="--tc:var(--tc)" aria-pressed="${!ex.lest}">Sans lest</button>
    <button type="button" class="chip" data-a="cd-lest" data-ex="${i}" data-v="1" style="--tc:var(--tc)" aria-pressed="${!!ex.lest}">Lesté</button>
  </div></div>
  ${ex.lest ? `<label class="field"><span>Poids du lest (kg)</span><input id="cd-kg-${i}" class="num" data-f="cd-kg" data-ex="${i}" inputmode="decimal" placeholder="ex. 5" value="${val(ex.kg)}"></label>` : ""}
  <button class="btn primary set-go" id="cdgo-${i}" data-a="cd-go" data-ex="${i}"${+ex.ropes && +ex.every ? "" : " disabled"}>⏱ Lancer les départs</button>
  <textarea id="exr-${i}" data-f="ex-note" data-ex="${i}" placeholder="Ressenti : prise, technique, fatigue…" rows="2">${esc(ex.note)}</textarea>
  </article>`;
}
