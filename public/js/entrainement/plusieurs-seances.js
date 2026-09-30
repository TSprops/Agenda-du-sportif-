// Entraînement : plusieurs séances le même jour (onglets).
import { S, dayMeta, dayOf, esc, isEmpty, sessionsOn } from "../core.js";

/* ============================================================
   Plusieurs séances par jour
   ============================================================ */
function newSessionKey(d) {
  if (!S.days[d] && S.open !== d) return d;
  let n = 2; while (S.days[d + "~" + n] || S.open === d + "~" + n) n++;
  return d + "~" + n;
}
// Une séance vide du jour si elle existe, sinon une nouvelle.
export function freshKey(d) {
  const ks = sessionsOn(d), empty = ks.find(k => isEmpty(S.days[k]));
  return empty || (ks.length ? newSessionKey(d) : d);
}
export function sessTabsHTML(c, k) {
  const list = [...new Set([...sessionsOn(dayOf(k)), k])].sort();
  const others = list.filter(x => x !== k && S.days[x] && !isEmpty(S.days[x]));
  if (!others.length && isEmpty(c)) return "";
  return `<div class="sess-tabs" role="tablist" aria-label="Séances du jour">${list.filter(x => x === k || (S.days[x] && !isEmpty(S.days[x]))).map((x, i) => {
    const d = x === k ? c : S.days[x], mt = d && d.disc ? dayMeta(d) : null;
    return `<button type="button" role="tab" data-a="sess" data-k="${x}" aria-selected="${x === k}" style="--tc:${mt ? mt.color : "var(--muted)"}"><i class="dot"></i>Séance ${i + 1}${mt ? " · " + esc(mt.short) : ""}</button>`;
  }).join("")}${isEmpty(c) ? "" : `<button type="button" class="sess-add" data-a="sess-new">+ Autre séance</button>`}</div>`;
}
