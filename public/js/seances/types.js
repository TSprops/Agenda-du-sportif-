// Séances : types de séance (nom, couleur).
import { renderMain } from "./calendrier.js";
import { $, DEFAULT_TYPES, PALETTE, S, armed, esc } from "../commun/core.js";
import { persistTypes } from "../commun/store.js";
import { canon, t, valeur } from "../commun/i18n.js";

/* ============================================================
   Types de séance
   ============================================================ */
export function renderTypes() {
  // Types par défaut : nom de référence en français enregistré, affiché traduit.
  $("typesSheet").innerHTML = `<div class="bar-top"><button class="link" data-a="close">‹ ${t("seances.calendrier")}</button><span class="save"></span></div>
  <div class="sheet-body"><h2 class="title-in" style="margin:0">${t("types.titre")}</h2>
  <p class="hint">${t("types.aide")}</p>
  <div class="card">${S.types.map((ty, i) => `<div class="trow"><button class="swatch" data-a="color" data-i="${i}" style="--tc:${ty.color}" aria-label="${esc(t("types.changerCouleur", { nom: valeur("valeurs.types", ty.name) }))}"></button><input id="tn-${ty.id}" data-i="${i}" value="${esc(valeur("valeurs.types", ty.name))}" aria-label="${esc(t("types.nom"))}"><button class="icon-btn" data-a="del" data-i="${i}">${t("complements.retirer")}</button></div>`).join("")}</div>
  <button class="add-ex" data-a="add">${t("types.nouveau")}</button>
  <button class="danger" data-a="reset">${t("types.reinitialiser")}</button></div>`;
}
let tTimer = null;
$("typesSheet").addEventListener("input", e => {
  const i = e.target.dataset.i; if (i == null) return;
  S.types[+i].name = canon("valeurs.types", e.target.value) === e.target.value.trim() ? e.target.value : canon("valeurs.types", e.target.value); clearTimeout(tTimer); tTimer = setTimeout(persistTypes, 700);
});
$("typesSheet").addEventListener("click", e => {
  const b = e.target.closest("[data-a]"); if (!b) return;
  const a = b.dataset.a, i = +b.dataset.i;
  if (a === "close") { clearTimeout(tTimer); persistTypes(); $("typesSheet").classList.remove("open"); document.body.style.overflow = ""; document.body.classList.remove("sheet-open"); renderMain(); return; }
  if (a === "color") { const ty = S.types[i]; ty.color = PALETTE[(PALETTE.indexOf(ty.color) + 1) % PALETTE.length]; }
  else if (a === "del") { if (!armed(b, t("commun.confirmer"))) return; S.types.splice(i, 1); }
  else if (a === "add") { const used = S.types.map(ty => ty.color); S.types.push({ id: "t" + Date.now().toString(36), name: t("types.nomNouveau"), color: PALETTE.find(c => !used.includes(c)) || PALETTE[0] }); }
  else if (a === "reset") { if (!armed(b, t("commun.confirmer"))) return; S.types = DEFAULT_TYPES.map(ty => ({ ...ty })); }
  persistTypes(); renderTypes();
});
