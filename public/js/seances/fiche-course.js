// Séances, fiche du jour : course à pied (blocs fractionné, seuil…).
import { effortCard } from "./fiche-muscu-calis.js";
import { $, RUN_TYPES, blocDone, blocKm, blocsLegacy, blocsRun, esc, fmtKm, pad, runCalcHTML, runSecs } from "../commun/core.js";
import { t } from "../commun/i18n.js";

// Unités d'un bloc. Seuil : minutes seulement. Fractionné : mètres, secondes, minutes.
// Une ancienne unité (km, ou autre qu'en minutes au seuil) reste affichée sur son bloc.
const UNITS = ["m", "km", "min", "s"]; // noms complets : « course.unites.<u> »
const unitOf = (b, rt) => b.unit || (rt === "seuil" ? "min" : "m");
// Séries qui restent à faire : décompte d'affichage, le format saisi ne change pas.
export const blocLeft = b => blocDone(b) ? 0 : b.left ?? Math.max(1, +b.rep || 1);
const preview = (b, rt) => `${b.rep || "?"} × ${b.eff || "?"} ${unitOf(b, rt)}`;
function distHTML(b, rt) {
  const km = blocKm(b, rt);
  return km ? t("course.distanceParcourue", { km: `<b>${fmtKm(km)}</b>` }) : `<span class="hint">${t("course.ajouteAllure")}</span>`;
}
function totalHTML(c) {
  const bl = c.run.blocks || [], done = bl.filter(blocDone);
  if (bl.length < 2 || !done.length) return "";
  return t("course.totalParcouru", { km: `<b>${fmtKm(done.reduce((a, b) => a + blocKm(b, c.runType), 0))}</b>` });
}
function countHTML(b, j) {
  const n = blocLeft(b), done = blocDone(b);
  return `<b class="bl-n">${n}</b><span class="bl-left">${done ? t("course.blocValide") : t("course.seriesRestantes", { n })}</span>
    ${done ? "" : n > 1 ? `<button class="rest-go" data-a="bl-go" data-b="${j}">${t("course.lancerRecup")}</button>` : `<button class="rest-go bl-end" data-a="bl-go" data-b="${j}">${t("course.terminer")}</button>`}`;
}
// Mise à jour pendant la saisie d'un bloc (aperçu, décompte, distance, total).
export function refreshBloc(c, j) {
  const b = c.run.blocks[j], rt = c.runType;
  const p = $("bl-prev-" + j); if (p) p.innerHTML = t("course.apercu", { bloc: `<b>${esc(preview(b, rt))}</b>` });
  const n = $("bl-count-" + j); if (n) n.innerHTML = countHTML(b, j);
  const d = $("bl-dist-" + j); if (d) d.innerHTML = distHTML(b, rt);
  const tot = $("bl-total"); if (tot) tot.innerHTML = totalHTML(c);
}
function unitHTML(b, j, rt) {
  const u = unitOf(b, rt);
  if (rt === "seuil") return `<span class="bl-fixed${u === "min" ? "" : " old"}">${esc(u)}</span>`;
  const list = ["m", "s", "min"].concat(UNITS.includes(u) && !["m", "s", "min"].includes(u) ? [u] : []);
  return `<div class="seg bl-units" role="group" aria-label="${esc(t("course.uniteBloc", { n: j + 1 }))}">${list.map(x => `<button type="button" data-a="bl-unit" data-b="${j}" data-u="${x}" aria-pressed="${x === u}" aria-label="${t("course.unites." + x)}"${["m", "s", "min"].includes(x) ? "" : ' class="old"'}>${x}</button>`).join("")}</div>`;
}
function blocHTML(c, b, j) {
  const rt = c.runType, val = v => v === undefined || v === null ? "" : esc(v), done = blocDone(b);
  const u = unitOf(b, rt), old = rt === "seuil" ? u !== "min" : !["m", "s", "min"].includes(u);
  return `<div class="bloc${done ? " fini" : ""}">
    <div class="bloc-top"><span class="ex-num">${pad(j + 1)}</span>${old ? `<span class="bl-old">${t("course.ancienneUnite")}</span>` : ""}</div>
    <div class="bl-fmt">
      <label class="bl-cell"><input class="num bl-rep" id="bl-rep-${j}" data-f="bl-rep" data-b="${j}" inputmode="numeric" placeholder="10" value="${val(b.rep)}"${!done && b.left != null ? " disabled" : ""}><small>${t("course.series")}</small></label>
      <span class="times">×</span>
      <label class="bl-cell"><input class="num" id="bl-eff-${j}" data-f="bl-eff" data-b="${j}" inputmode="decimal" placeholder="${rt === "seuil" ? "10" : "200"}" value="${val(b.eff)}"><small>${t(rt === "seuil" ? "course.duree" : "course.dureeDistance")}</small></label>
      <div class="bl-cell">${unitHTML(b, j, rt)}<small>${t("course.unite")}</small></div>
    </div>
    <p class="bl-prev" id="bl-prev-${j}">${t("course.apercu", { bloc: `<b>${esc(preview(b, rt))}</b>` })}</p>
    <div class="grid2"><label class="field"><span>${t("course.allureCible")}</span><input id="bl-pace-${j}" data-f="bl-pace" data-b="${j}" placeholder="3:45 /km" value="${val(b.pace)}"></label><label class="field"><span>${t("course.recup")}</span><input id="bl-rec-${j}" data-f="bl-rec" data-b="${j}" placeholder="1:00" value="${val(b.rec)}"></label></div>
    <div class="bl-count" id="bl-count-${j}">${countHTML(b, j)}</div>
    ${done ? `<p class="bl-dist" id="bl-dist-${j}">${distHTML(b, rt)}</p>` : `<button class="btn ex-fini" data-a="bl-fini" data-b="${j}">${t("course.valider")}</button>`}
    <div class="bloc-foot">${done ? `<button class="linkish" data-a="bl-open" data-b="${j}">${t("course.rouvrir")}</button>` : ""}
      <button class="bl-del" data-a="bl-del" data-b="${j}" aria-label="${esc(t("course.supprimerBloc", { n: j + 1 }))}">${t("course.supprimer")}</button></div>
  </div>`;
}
export function courseHTML(c) {
  const r = c.run || {}, rt = RUN_TYPES.find(x => x.id === c.runType), blocks = r.blocks || [];
  const val = v => v === undefined || v === null ? "" : esc(v);
  // « Ma sortie » : endurance fondamentale, ou ancienne séance seuil / fractionné déjà remplie.
  const sortie = !blocsRun(c) || (blocsLegacy(r) && (r.dist || runSecs(r) || r.fc || r.dplus));
  return `<div class="chips" role="group" aria-label="${esc(t("course.typeSortie"))}">${RUN_TYPES.map(x => `<button class="chip" data-a="runtype" data-id="${x.id}" style="--tc:${x.color}" aria-pressed="${x.id === c.runType}"><i class="dot"></i>${esc(x.name)}</button>`).join("")}</div>
    ${rt ? `<p class="hint" style="margin-top:-6px">${esc(rt.hint)}</p>` : ""}
    ${sortie ? `<section class="card"><div class="lbl">${t("course.maSortie")}</div>
      <div class="grid2">
        <label class="field"><span>${t("course.distanceKm")}</span><input id="rn-dist" data-f="run-dist" inputmode="decimal" placeholder="${esc(t("course.exDistance"))}" value="${val(r.dist)}"></label>
        <div class="field"><span>${t("course.dureeHms")}</span><div class="dur"><input id="rn-h" data-f="run-h" inputmode="numeric" placeholder="0" value="${val(r.h)}" aria-label="${esc(t("commun.heures"))}"><i>:</i><input id="rn-m" data-f="run-m" inputmode="numeric" placeholder="45" value="${val(r.m)}" aria-label="${esc(t("course.unites.min"))}"><i>:</i><input id="rn-s" data-f="run-s" inputmode="numeric" placeholder="00" value="${val(r.s)}" aria-label="${esc(t("course.unites.s"))}"></div></div>
      </div>
      <div class="run-calc" id="runCalc">${runCalcHTML(r)}</div>
      <div class="grid2">
        <label class="field"><span>${t("course.fcMoyenne")}</span><input id="rn-fc" data-f="run-fc" inputmode="numeric" placeholder="${esc(t("course.exFc"))}" value="${val(r.fc)}"></label>
        <label class="field"><span>${t("course.denivele")}</span><input id="rn-dplus" data-f="run-dplus" inputmode="numeric" placeholder="${esc(t("course.exDenivele"))}" value="${val(r.dplus)}"></label>
      </div>
    </section>` : ""}
    ${rt && rt.id !== "ef" ? `<section class="card"><div class="lbl">${t(rt.id === "seuil" ? "course.blocsSeuil" : "course.fractions")}</div>
      <p class="hint" style="margin-top:-4px">${t(rt.id === "seuil" ? "course.exSeuil" : "course.exFractions")}</p>
      ${blocks.map((b, j) => blocHTML(c, b, j)).join("")}
      <button class="add-set" data-a="bl-add">${t("course.ajouterBloc")}</button>
      <p class="bl-total" id="bl-total">${totalHTML(c)}</p></section>` : ""}
    ${effortCard(c, t("course.effortRessenti"))}`;
}
