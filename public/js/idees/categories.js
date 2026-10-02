// Pages « catégories » : idées, records, progression, et page des séances types.
import { hyroxExercises, hyroxIdeasHTML, hyroxName } from "./hyrox.js";
import { CALIS_IDEAS, MUSCU_IDEAS, RUN_IDEAS, ideaCard, ideaExercises, tryIdea } from "./idees-seances.js";
import { $, DEFAULT_TYPES, DISC, MAIN_DISC, RUN_TYPES, S, esc, typeOf } from "../commun/core.js";
import { go } from "../commun/store.js";
import { t } from "../commun/i18n.js";

/* ---------- Pages « catégories » (idées, records, progression) ---------- */
// Sous-titre de chaque activité : « categories.<page>.<activité> ».
// Hyrox : seulement dans les idées (pas encore de records ni de progression).
function discGrid(mode) {
  const list = mode === "ideas" ? [...MAIN_DISC, "hyrox"] : MAIN_DISC;
  return Object.entries(DISC).filter(([id]) => list.includes(id)).map(([id, x]) => `<button class="disc-card" data-cat="${mode}:${id}" style="--tc:${x.color}"><span class="disc-ico" aria-hidden="true"><svg viewBox="0 0 24 24">${x.icon}</svg></span><b>${x.name}</b><span>${t(`categories.${mode}.${id}`)}</span></button>`).join("");
}
export function renderTypesHub() { $("typesGrid").innerHTML = discGrid("ideas"); }
export function renderRecordsHub() { $("recGrid").innerHTML = discGrid("rec"); }
export function renderProgHub() { $("progGrid").innerHTML = discGrid("prog"); }
document.addEventListener("click", e => {
  const b = e.target.closest("[data-cat]"); if (!b) return;
  const [mode, d] = b.dataset.cat.split(":");
  if (d === "crossfit" && mode !== "prog") { S.cfMode = mode === "rec" ? "records" : "ideas"; S.cfOpen = null; go("crossfit"); return; }
  if (mode === "ideas") { S.hub = d; S.hubTab = null; go("hub"); }
  else if (mode === "rec") { S.rec = d; S.recOpen = null; go("rec"); }
  else { S.prog = d; S.progTab = null; go("prog"); }
});
function catColor(id) { return (typeOf(id) || DEFAULT_TYPES.find(ty => ty.id === id) || {}).color || "#8A847E"; }
export function renderHub() {
  const d = S.hub, x = DISC[d]; if (!x) return;
  $("hubTitle").textContent = t("idees.titreActivite", { activite: x.name }); $("v-hub").style.setProperty("--tc", x.color);
  let h = "";
  if (d === "muscu") {
    const types = ["push", "pull", "jambes", "haut", "bas"].map(id => [id, t("valeurs.types." + id)]);
    const tab = S.hubTab && MUSCU_IDEAS[S.hubTab] ? S.hubTab : "push";
    h += `<div class="chips">${types.map(([id, n]) => `<button class="chip" data-tab="${id}" style="--tc:${catColor(id)}" aria-pressed="${id === tab}"><i class="dot"></i>${n}</button>`).join("")}</div>
      <div class="list">${MUSCU_IDEAS[tab].map((idea, i) => ideaCard(idea, "muscu", tab, i, catColor(tab))).join("")}</div>`;
  } else if (d === "course") {
    const tab = S.hubTab && RUN_IDEAS[S.hubTab] ? S.hubTab : "ef", rt = RUN_TYPES.find(r => r.id === tab);
    h += `<div class="chips">${RUN_TYPES.map(r => `<button class="chip" data-tab="${r.id}" style="--tc:${r.color}" aria-pressed="${r.id === tab}"><i class="dot"></i>${r.name}</button>`).join("")}</div>
      <p class="hint" style="margin:-10px 0 0">${esc(rt.hint)}</p>
      <div class="list">${RUN_IDEAS[tab].map((idea, i) => ideaCard(idea, "course", tab, i, rt.color)).join("")}</div>`;
  } else if (d === "hyrox") {
    h += hyroxIdeasHTML(S.hubTab, S.hubSub, x.color);
  } else if (d === "calis") {
    h += `<div class="list">${CALIS_IDEAS.map((idea, i) => ideaCard(idea, "calis", "all", i, DISC.calis.color)).join("")}</div>`;
  }
  $("hubBody").innerHTML = h;
}
$("v-hub").addEventListener("click", e => {
  const tb = e.target.closest("[data-tab]"); if (tb) { S.hubTab = tb.dataset.tab; renderHub(); return; }
  const sb = e.target.closest("[data-sub]"); if (sb) { S.hubSub = sb.dataset.sub; renderHub(); return; }
  const go2 = e.target.closest("[data-try]"); if (!go2) return;
  const [disc, key, idx] = go2.dataset.try.split(":");
  if (disc === "muscu") {
    const idea = MUSCU_IDEAS[key][+idx];
    tryIdea(go2, "muscu", c => { c.typeId = S.types.some(ty => ty.id === key) ? key : null; c.title = idea.name; c.exercises = ideaExercises(idea.ex); });
  } else if (disc === "hyrox") {
    const [fmt, cat] = key.split("-");
    tryIdea(go2, "hyrox", c => { c.title = hyroxName(fmt, cat); c.exercises = hyroxExercises(key); });
  } else if (disc === "calis") {
    const idea = CALIS_IDEAS[+idx];
    tryIdea(go2, "calis", c => { c.title = idea.name; c.exercises = ideaExercises(idea.ex); });
  } else if (disc === "course") {
    const idea = RUN_IDEAS[key][+idx];
    tryIdea(go2, "course", c => {
      c.runType = key; c.title = idea.name; c.note = idea.note || "";
      c.run = { blocks: (idea.blocks || []).map(([rep, eff, unit, pace, rec]) => ({ rep, eff, unit, pace, rec, fini: false })), h: idea.h || "", m: idea.m || "", s: "" };
    });
  }
});
