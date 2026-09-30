// Entraînement : records battus en direct et petit message (toast).
import { exKey } from "./derniere-fois.js";
import { $, S, discOf, esc, nf, runPace, runSecs } from "../core.js";
import { doneSet } from "../idees/index.js";
import { isDone } from "../seances/index.js";

/* ============================================================
   Records battus en direct
   ============================================================ */
// Meilleure série d'un exercice : charge max (et reps à cette charge), reps max.
export function bestSets(sets, doneFn) {
  let kg = 0, rk = 0, reps = 0;
  (sets || []).filter(doneFn).forEach(st => { const k = +st.kg || 0, r = +st.reps || 0; if (!r) return; if (k > kg || (k === kg && r > rk)) { kg = k; rk = r; } if (r > reps) reps = r; });
  return { kg, rk, reps };
}
function exBestBefore(name, before) {
  const nk = exKey(name); let kg = 0, rk = 0, reps = 0, n = 0;
  Object.keys(S.days).forEach(k => { if (k >= before) return; (S.days[k].exercises || []).forEach(ex => {
    if (exKey(ex.name || "") !== nk) return; const b = bestSets(ex.sets, doneSet); if (!b.reps) return; n++;
    if (b.kg > kg || (b.kg === kg && b.rk > rk)) { kg = b.kg; rk = b.rk; } if (b.reps > reps) reps = b.reps;
  }); });
  return { kg, rk, reps, n };
}
// Records de la séance (par rapport à toutes les séances d'avant). Il faut au moins une séance d'avant pour comparer.
export function sessionPRs(c, k) {
  const out = [], disc = c && c.disc;
  if (!c || !k) return out;
  if (disc === "muscu" || disc === "calis") {
    const seen = new Set();
    (c.exercises || []).forEach(ex => {
      const name = String(ex.name || "").trim(), nk = exKey(name); if (!name || seen.has(nk)) return;
      const cur = bestSets(ex.sets, st => isDone(st) && doneSet(st)); if (!cur.reps) return;
      const h = exBestBefore(name, k); if (!h.n) return;
      if (cur.kg > 0 && (cur.kg > h.kg || (cur.kg === h.kg && cur.rk > h.rk))) { seen.add(nk); out.push({ ex: name, txt: nf.format(cur.kg) + " kg × " + cur.rk }); }
      else if (!cur.kg && !h.kg && cur.reps > h.reps) { seen.add(nk); out.push({ ex: name, txt: cur.reps + (ex.hold ? " s" : " reps") }); }
    });
  } else if (disc === "course") {
    const r = c.run || {}, dist = +r.dist || 0, t = runSecs(r); if (!dist) return out;
    const prev = Object.keys(S.days).filter(x => x < k && discOf(S.days[x]) === "course" && S.days[x].run && +S.days[x].run.dist);
    if (!prev.length) return out;
    const maxD = Math.max(...prev.map(x => +S.days[x].run.dist));
    if (dist > maxD) out.push({ ex: "Plus longue sortie", txt: nf.format(dist) + " km" });
    if (t && dist >= 3) {
      const paces = prev.map(x => S.days[x].run).filter(p => +p.dist >= 3 && runSecs(p)).map(p => runSecs(p) / +p.dist);
      if (paces.length && t / dist < Math.min(...paces)) out.push({ ex: "Meilleure allure", txt: runPace(r) + " /km" });
    }
  }
  return out;
}
export function announcePRs(prs, k) {
  if (!S.prSeen) S.prSeen = new Set();
  const fresh = prs.filter(p => !S.prSeen.has(k + "|" + p.ex));
  prs.forEach(p => S.prSeen.add(k + "|" + p.ex));
  if (!fresh.length) return;
  const p = fresh[0];
  toast(`<b>🏆 Nouveau record !</b><span>${esc(p.ex)} · ${esc(p.txt)}</span>`, "pr");
  if (navigator.vibrate) navigator.vibrate([80, 60, 160]);
}
let toastTimer = null;
export function toast(html, kind) {
  const t = $("toast"); t.innerHTML = html; t.className = "toast" + (kind ? " " + kind : ""); t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, kind === "pr" ? 4200 : 2600);
}
$("toast").onclick = () => { $("toast").hidden = true; };
