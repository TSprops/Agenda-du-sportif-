// Entraînement : bibliothèque d'exercices (recherche, filtres, muscles).
import { exHistory, exKey, setTxt } from "./derniere-fois.js";
import { CORDES_EX, HYROX_EX, LEGACY_EX } from "../../data.js";
import { howBtnHTML } from "../comment-faire/index.js";
import { $, EQUIP, EXERCISES, GROUPS, KEYWORDS, MUSCLES, S, esc } from "../commun/core.js";
import { norm } from "../pages/faq.js";
import { doneSet } from "../idees/index.js";
import { muscleMini } from "../pages/muscles.js";
import { saveProfile } from "../commun/store.js";

/* ============================================================
   Bibliothèque d'exercices
   ============================================================ */
const LIB_ALL = EXERCISES.map(([name, m, sec, eq, hold]) => ({ name, m, s: sec, eq, hold: !!hold }));
function libList() { return [...((S.profile && S.profile.customEx) || []).map(x => ({ name: x.name, m: x.m || [], s: x.s || [], eq: "", hold: !!x.hold, custom: true })), ...LIB_ALL]; }
export function libFind(name) {
  const k = exKey(name || ""), f = libList().find(x => exKey(x.name) === k); if (f) return f;
  const hx = HYROX_EX.find(([n]) => exKey(n) === k); if (hx) return { name: hx[0], m: hx[3], s: hx[4], eq: "", hold: false };
  const old = LEGACY_EX.find(([n]) => exKey(n) === k);
  return old ? { name: old[0], m: old[1], s: old[2], eq: "C", hold: false } : undefined;
}
// Muscles d'un exercice : bibliothèque, sinon mots-clés du nom.
export function musclesOf(name) {
  const f = libFind(name); if (f && f.m.length) return { p: f.m, s: f.s || [] };
  const n = norm(name || "");
  const kw = KEYWORDS.find(([re]) => re.test(n));
  return kw ? { p: kw[1], s: kw[2] } : null;
}
const LIB = { cb: null, q: "", g: null, disc: "muscu" };
export function openLib(cb, disc) {
  Object.assign(LIB, { cb, q: "", g: null, disc: disc || "muscu" });
  $("libQ").value = ""; renderLibChips(); renderLib();
  $("libSheet").scrollTop = 0; $("libSheet").classList.add("open"); document.body.classList.add("sheet-open");
}
function closeLib() { $("libSheet").classList.remove("open"); if (!$("sheet").classList.contains("open")) document.body.classList.remove("sheet-open"); }
function renderLibChips() {
  // Corde : uniquement les montées de corde, pas de filtre par muscle.
  $("libChips").hidden = LIB.disc === "cordes" || LIB.disc === "hyrox";
  $("libChips").innerHTML = `<button type="button" class="chip" data-lg="" aria-pressed="${!LIB.g}" style="--tc:var(--red)">Tous</button>` +
    GROUPS.map(([id, n]) => `<button type="button" class="chip" data-lg="${id}" aria-pressed="${LIB.g === id}" style="--tc:var(--red)">${n}</button>`).join("");
}
function usedNames() {
  const seen = new Map();
  Object.keys(S.days).sort().reverse().forEach(k => (S.days[k].exercises || []).forEach(ex => { const n = String(ex.name || "").trim(); if (n && !seen.has(exKey(n))) seen.set(exKey(n), n); }));
  return seen;
}
function libRow(x, before) {
  const h = exHistory(x.name, before || "9999"), mus = (x.m || []).map(m => MUSCLES[m]).join(", ");
  return `<div class="lib-item"><button type="button" class="lib-row" data-lib="${esc(x.name)}" data-hold="${x.hold ? 1 : ""}">${muscleMini(x.m || [], x.s || [])}
    <span class="main"><b>${esc(x.name)}</b><span>${esc([mus, EQUIP[x.eq]].filter(Boolean).join(" · ") || "Exercice perso")}</span>
    ${h ? `<span class="lib-last">↺ ${esc(h.ex.sets.filter(doneSet).map(st => setTxt(st, h.ex.hold)).slice(0, 3).join(" · "))}</span>` : ""}</span><span class="plus" aria-hidden="true">+</span></button>${howBtnHTML(x.name, "lib")}</div>`;
}
function renderLib() {
  const q = exKey(LIB.q), grp = GROUPS.find(g => g[0] === LIB.g), all = libList(), before = S.open || "9999";
  const byKey = new Map(all.map(x => [exKey(x.name), x]));
  // Exercices déjà faits mais absents de la bibliothèque (noms tapés à la main).
  usedNames().forEach((n, k) => { if (!byKey.has(k)) { const mu = musclesOf(n); const x = { name: n, m: mu ? mu.p : [], s: mu ? mu.s : [], eq: "", hold: false, custom: true }; all.unshift(x); byKey.set(k, x); } });
  let list = all.filter(x => (!q || exKey(x.name).includes(q)) && (!grp || (x.m || []).some(m => grp[2].includes(m))));
  if (LIB.disc === "calis" && !q && !grp) list = list.filter(x => x.eq === "C" || x.custom);
  // Corde : exactement les trois montées de corde (sans « récents » ni autres exercices) ; la recherche reste possible.
  const cordes = LIB.disc === "cordes" && !q;
  if (cordes) list = CORDES_EX.map(n => byKey.get(exKey(n))).filter(Boolean);
  // Hyrox : les ateliers de la course, dans l'ordre (la recherche permet un exercice libre).
  const hyrox = LIB.disc === "hyrox" && !q;
  if (hyrox) list = HYROX_EX.map(([name, , , m, s]) => ({ name, m, s, eq: "", hold: false }));
  const recent = !q && !grp && !cordes && !hyrox ? [...usedNames().keys()].slice(0, 8).map(k => byKey.get(k)).filter(Boolean) : [];
  const exact = q && all.some(x => exKey(x.name) === q);
  $("libList").innerHTML = `${q && !exact ? `<button type="button" class="lib-row lib-new" data-libnew="1"><span class="plus-big">+</span><span class="main"><b>Créer « ${esc(LIB.q.trim())} »</b><span>Ajouter ton propre exercice</span></span></button>` : ""}
    ${recent.length ? `<h3 class="h2">Tes exercices récents</h3><div class="lib-group">${recent.map(x => libRow(x, before)).join("")}</div>` : ""}
    ${list.length ? `<h3 class="h2">${q || grp ? list.length + " exercice" + (list.length > 1 ? "s" : "") : hyrox ? "Ateliers Hyrox" : "Tous les exercices"}</h3><div class="lib-group">${list.filter(x => !recent.includes(x)).map(x => libRow(x, before)).join("")}</div>`
      : q ? "" : `<p class="hint">Aucun exercice dans ce groupe.</p>`}`;
}
$("libQ").addEventListener("input", e => { LIB.q = e.target.value; renderLib(); });
$("libSheet").addEventListener("click", e => {
  if (e.target.closest("#libClose")) { closeLib(); return; }
  const g = e.target.closest("[data-lg]"); if (g) { LIB.g = g.dataset.lg || null; renderLibChips(); renderLib(); return; }
  const n = e.target.closest("[data-libnew]");
  if (n) {
    const name = LIB.q.trim().slice(0, 60); if (!name) return;
    const mu = musclesOf(name), list = ((S.profile && S.profile.customEx) || []).filter(x => exKey(x.name) !== exKey(name));
    list.unshift({ name, m: mu ? mu.p : [], s: mu ? mu.s : [] }); saveProfile({ customEx: list.slice(0, 80) });
    closeLib(); LIB.cb && LIB.cb(name, false); return;
  }
  const r = e.target.closest("[data-lib]"); if (r) { closeLib(); LIB.cb && LIB.cb(r.dataset.lib, !!r.dataset.hold); }
});
