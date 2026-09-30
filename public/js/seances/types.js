// Séances : types de séance (nom, couleur).
import { renderMain } from "./calendrier.js";
import { $, DEFAULT_TYPES, PALETTE, S, armed, esc } from "../core.js";
import { persistTypes } from "../store.js";

/* ============================================================
   Types de séance
   ============================================================ */
export function renderTypes() {
  $("typesSheet").innerHTML = `<div class="bar-top"><button class="link" data-a="close">‹ Calendrier</button><span class="save"></span></div>
  <div class="sheet-body"><h2 class="title-in" style="margin:0">Types de séance</h2>
  <p class="hint">Chaque type a sa couleur dans le calendrier. Touche la pastille pour changer de couleur.</p>
  <div class="card">${S.types.map((t, i) => `<div class="trow"><button class="swatch" data-a="color" data-i="${i}" style="--tc:${t.color}" aria-label="Changer la couleur de ${esc(t.name)}"></button><input id="tn-${t.id}" data-i="${i}" value="${esc(t.name)}" aria-label="Nom du type"><button class="icon-btn" data-a="del" data-i="${i}">Retirer</button></div>`).join("")}</div>
  <button class="add-ex" data-a="add">+ Nouveau type</button>
  <button class="danger" data-a="reset">Revenir aux types par défaut</button></div>`;
}
let tTimer = null;
$("typesSheet").addEventListener("input", e => {
  const i = e.target.dataset.i; if (i == null) return;
  S.types[+i].name = e.target.value; clearTimeout(tTimer); tTimer = setTimeout(persistTypes, 700);
});
$("typesSheet").addEventListener("click", e => {
  const b = e.target.closest("[data-a]"); if (!b) return;
  const a = b.dataset.a, i = +b.dataset.i;
  if (a === "close") { clearTimeout(tTimer); persistTypes(); $("typesSheet").classList.remove("open"); document.body.style.overflow = ""; document.body.classList.remove("sheet-open"); renderMain(); return; }
  if (a === "color") { const t = S.types[i]; t.color = PALETTE[(PALETTE.indexOf(t.color) + 1) % PALETTE.length]; }
  else if (a === "del") { if (!armed(b, "Confirmer")) return; S.types.splice(i, 1); }
  else if (a === "add") { const used = S.types.map(t => t.color); S.types.push({ id: "t" + Date.now().toString(36), name: "Nouveau type", color: PALETTE.find(c => !used.includes(c)) || PALETTE[0] }); }
  else if (a === "reset") { if (!armed(b, "Confirmer")) return; S.types = DEFAULT_TYPES.map(t => ({ ...t })); }
  persistTypes(); renderTypes();
});
