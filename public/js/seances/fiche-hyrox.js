// Séances, fiche du jour : Hyrox (séance libre, ateliers au choix).
import { effortCard } from "./fiche-muscu-calis.js";
import { HYROX_EX } from "../../data.js";
import { howBtnHTML } from "../comment-faire/index.js";
import { esc, fmtDur, nf, nomEx, pad, parseClock } from "../commun/core.js";
import { t } from "../commun/i18n.js";
import { exKey } from "../entrainement/index.js";

export const hyroxStation = name => HYROX_EX.find(x => exKey(x[0]) === exKey(name || ""));
// Ergomètres : on note les calories à la place de la charge.
const ERGOS = ["SkiErg", "RowErg"].map(exKey);
export const hyroxCal = name => ERGOS.includes(exKey(name || ""));
// Exercice Hyrox vide : quantité (m ou reps), charge (ou calories sur ergo), temps (« 4:12 »).
export function hyroxEx(name, amt, kg) {
  const st = hyroxStation(name);
  return { name, kind: "hyrox", sets: [], unit: st ? st[1] : "m", amt: amt ?? "", kg: kg ?? "", cal: "", time: "", note: "" };
}
export function hyroxTotal(c) { return (c.exercises || []).reduce((a, x) => a + parseClock(x.time), 0); }
export function hyroxText(x) {
  return [x.amt ? nf.format(x.amt) + (x.unit === "reps" ? " " + t("series.repsCourt") : " m") : "", x.cal ? nf.format(x.cal) + " cal" : "", x.kg ? nf.format(x.kg) + " kg" : "", x.time ? x.time : ""].filter(Boolean).join(" · ");
}
// Résumé : temps total, mètres d'ergo et de course, calories, reps.
export function hyroxSumHTML(c) {
  const L = c.exercises || [], tot = hyroxTotal(c);
  const m = L.filter(x => x.unit !== "reps").reduce((a, x) => a + (+x.amt || 0), 0), reps = L.filter(x => x.unit === "reps").reduce((a, x) => a + (+x.amt || 0), 0);
  const cal = L.reduce((a, x) => a + (+x.cal || 0), 0);
  const p = [tot ? t("hyrox.total", { duree: `<b>${fmtDur(tot)}</b>` }) : "", m ? (m >= 1000 ? nf.format(m / 1000) + " km" : nf.format(m) + " m") : "", cal ? nf.format(cal) + " cal" : "", reps ? nf.format(reps) + " " + t("series.repsCourt") : ""].filter(Boolean);
  return p.join(" · ");
}
function hxExHTML(ex, i) {
  const val = v => v === undefined || v === null ? "" : esc(v), st = hyroxStation(ex.name), withKg = !st || st[5];
  return `<article class="ex hyrox">
  <div class="ex-head"><span class="ex-num">${pad(i + 1)}</span><input id="exn-${i}" class="ex-name${ex.lock ? " locked" : ""}" data-f="ex-name" data-ex="${i}" placeholder="${esc(t("hyrox.exemple"))}" value="${esc(nomEx(ex.name))}" autocomplete="off"${ex.lock ? ' readonly aria-readonly="true"' : ""}>${howBtnHTML(ex.name, i)}<button class="icon-btn" data-a="del-ex" data-ex="${i}" aria-label="${esc(t("series.supprimerExercice"))}">${t("complements.retirer")}</button></div>
  <div class="grid3 dep-grid">
    <div class="field"><span>${t(ex.unit === "reps" ? "series.reps" : "hyrox.distance")}</span><div class="cd-every"><input id="hx-amt-${i}" class="num" data-f="hx-amt" data-ex="${i}" inputmode="numeric" placeholder="${st ? st[2] : "–"}" value="${val(ex.amt)}">${st ? "" : `<button type="button" class="unit" data-a="hx-unit" data-ex="${i}" aria-label="${esc(t("hyrox.changerUnite"))}">${ex.unit === "reps" ? t("series.repsCourt") : "m"}</button>`}</div></div>
    ${hyroxCal(ex.name) ? `<label class="field"><span>${t("hyrox.calories")}</span><input id="hx-cal-${i}" class="num" data-f="hx-cal" data-ex="${i}" inputmode="numeric" placeholder="${esc(t("hyrox.ex68"))}" value="${val(ex.cal)}"></label>`
      : `<label class="field"><span>${t("hyrox.chargeKg")}</span><input id="hx-kg-${i}" class="num" data-f="hx-kg" data-ex="${i}" inputmode="decimal" placeholder="${withKg ? esc(t("hyrox.ex20")) : "—"}" value="${val(ex.kg)}"></label>`}
    <label class="field"><span>${t("hyrox.temps")}</span><input id="hx-time-${i}" class="num" data-f="hx-time" data-ex="${i}" inputmode="text" placeholder="4:12" value="${val(ex.time)}"></label>
  </div>
  <textarea id="exr-${i}" data-f="ex-note" data-ex="${i}" placeholder="${esc(t("hyrox.notePlaceholder"))}" rows="2">${esc(ex.note)}</textarea>
  </article>`;
}
export function hyroxHTML(c) {
  return `<p class="hint" style="margin-top:-6px">${t("hyrox.aide")}</p>
    ${(c.exercises || []).map((ex, i) => hxExHTML(ex, i)).join("")}
    <div class="dep-sum" id="hxSum">${hyroxSumHTML(c)}</div>
    <button class="add-ex" data-a="add-ex">${t("seances.ajouterExercice")}</button>
    ${effortCard(c, t("crossfit.intensite"))}`;
}
