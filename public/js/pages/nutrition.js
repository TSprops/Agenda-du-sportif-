// Nutrition : compléments et créatine.
import { $, DAYS, DEFAULT_SUPPS, MONTHS, S, armed, cap, clone, deleteDoc, esc, hm, key, nf, numOr, parse, setDoc, todayK } from "../commun/core.js";
import { savePrefs, subDoc, syncStats } from "../commun/store.js";

/* ============================================================
   Nutrition
   ============================================================ */
function nutOf(k) { return S.nut[k] || { complements: [], creatine: null }; }
let nChain = Promise.resolve();
function saveNut(k, n) {
  if (!(n.complements || []).length && !n.creatine) delete S.nut[k]; else S.nut[k] = { ...n, updatedAt: Date.now() };
  const data = S.nut[k], ref = subDoc("nutrition", k);
  if (S.old && S.split && k < S.split) { if (data) S.old.nutrition[k] = data; else delete S.old.nutrition[k]; }
  nChain = nChain.then(() => data ? setDoc(ref, data) : deleteDoc(ref)).catch(() => {});
  syncStats(); renderNutrition();
}
function suppCatalog() { const m = new Map(DEFAULT_SUPPS); Object.keys(S.nut).sort().forEach(k => (S.nut[k].complements || []).forEach(c => m.set(c.name, c.dose || ""))); return m; }
function fmtDay(k) { const d = parse(k); return (k === todayK() ? "aujourd’hui, " : "") + DAYS[d.getDay()] + " " + d.getDate() + " " + MONTHS[d.getMonth()]; }
function renderComplements() {
  const k = S.cpDay, n = nutOf(k), cat = suppCatalog(), L = n.complements || [], taken = new Set(L.map(c => c.name));
  $("cpDate").textContent = cap(fmtDay(k)); $("cpNext").disabled = k >= todayK();
  $("cpChips").innerHTML = [...cat].map(([name, dose]) => `<button class="chip" data-name="${esc(name)}" data-dose="${esc(dose)}" style="--tc:var(--red)" aria-pressed="${taken.has(name)}">${taken.has(name) ? "✓" : "+"} ${esc(name)}${dose ? ` <span style="opacity:.7;font-weight:500">${esc(dose)}</span>` : ""}</button>`).join("");
  $("cpList").innerHTML = [...cat.keys()].map(x => `<option value="${esc(x)}">`).join("");
  $("cpListTitle").textContent = L.length ? "Pris ce jour · " + L.length : "Pris ce jour";
  $("cpItems").innerHTML = L.length ? L.map((c, i) => `<div class="intake"><i class="dot" style="--tc:var(--red)"></i><span class="main"><b>${esc(c.name)}</b><span>${[c.dose, c.time && ("à " + c.time)].filter(Boolean).map(esc).join(" · ") || "Dose non précisée"}</span></span><button class="icon-btn" data-del="${i}">Retirer</button></div>`).join("") : `<p class="hint">Rien de noté ce jour. Touche un complément ci-dessus pour l’ajouter.</p>`;
}
function addSupp(name, dose) { const k = S.cpDay, n = clone(nutOf(k)); n.complements = n.complements || []; n.complements.push({ name, dose, time: k === todayK() ? hm() : "" }); saveNut(k, n); }
$("cpChips").addEventListener("click", e => {
  const b = e.target.closest("[data-name]"); if (!b) return;
  const k = S.cpDay, n = clone(nutOf(k)), nm = b.dataset.name;
  if ((n.complements || []).some(c => c.name === nm)) { n.complements = n.complements.filter(c => c.name !== nm); saveNut(k, n); }
  else addSupp(nm, b.dataset.dose);
});
$("cpForm").addEventListener("submit", e => {
  e.preventDefault(); const nm = $("cpName").value.trim(); if (!nm) return;
  addSupp(nm, $("cpDose").value.trim()); $("cpName").value = ""; $("cpDose").value = "";
});
$("cpName").addEventListener("change", () => { const d = suppCatalog().get($("cpName").value.trim()); if (d && !$("cpDose").value) $("cpDose").value = d; });
$("cpItems").addEventListener("click", e => {
  const b = e.target.closest("[data-del]"); if (!b || !armed(b, "Confirmer")) return;
  const k = S.cpDay, n = clone(nutOf(k)); n.complements.splice(+b.dataset.del, 1); saveNut(k, n);
});
$("cpPrev").onclick = () => { const d = parse(S.cpDay); d.setDate(d.getDate() - 1); S.cpDay = key(d); renderComplements(); };
$("cpNext").onclick = () => { const d = parse(S.cpDay); d.setDate(d.getDate() + 1); if (key(d) <= todayK()) { S.cpDay = key(d); renderComplements(); } };
function creaStreak() { let n = 0; const d = new Date(); if (!nutOf(key(d)).creatine) d.setDate(d.getDate() - 1); while (nutOf(key(d)).creatine && n < 3660) { n++; d.setDate(d.getDate() - 1); } return n; }
function toggleCrea(k) { const n = clone(nutOf(k)); n.creatine = n.creatine ? null : { time: k === todayK() ? hm() : "", dose: S.prefs.creaDose }; saveNut(k, n); }
function renderCreatine() {
  const tk = todayK(), c = nutOf(tk).creatine, b = $("creaBtn");
  b.classList.toggle("ok", !!c); b.setAttribute("aria-pressed", String(!!c));
  b.innerHTML = c
    ? `<span class="crea-check" aria-hidden="true">✓</span><b>Prise</b><span>${c.time ? "à " + esc(c.time) + " · " : ""}${nf.format(c.dose || S.prefs.creaDose)} g</span>`
    : `<b>À prendre</b><span>Touche pour confirmer<br>${nf.format(S.prefs.creaDose)} g aujourd’hui</span>`;
  $("creaHint").textContent = c ? "Touche à nouveau pour annuler." : "";
  const y = S.crView.getFullYear(), m = S.crView.getMonth(), count = new Date(y, m + 1, 0).getDate(), first = (new Date(y, m, 1).getDay() + 6) % 7;
  $("creaMonth").textContent = cap(MONTHS[m]) + " " + y;
  let h = "", done = 0, elapsed = 0, grams = 0;
  for (let i = 0; i < first; i++) h += '<span class="day pad" aria-hidden="true"></span>';
  for (let d = 1; d <= count; d++) {
    const k = key(new Date(y, m, d)), cr = nutOf(k).creatine, fut = k > tk;
    if (!fut) { elapsed++; if (cr) { done++; grams += +cr.dose || 0; } }
    h += `<button class="day${cr ? " crea-on" : ""}${k === tk ? " today" : ""}" data-k="${k}"${fut ? " disabled" : ""} aria-pressed="${!!cr}" aria-label="${d} ${MONTHS[m]}${cr ? ", prise" : ""}"><span class="n">${d}</span></button>`;
  }
  $("creaGrid").innerHTML = h;
  const st = creaStreak();
  $("creaStats").innerHTML = `<div class="stat"><b>${st}</b><span>jour${st > 1 ? "s" : ""} d’affilée</span></div><div class="stat"><b>${done}<small style="font-size:.55em;color:var(--muted)">/${elapsed}</small></b><span>jours ce mois</span></div><div class="stat"><b>${nf.format(grams)}</b><span>g ce mois</span></div>`;
  if (document.activeElement !== $("creaDose")) $("creaDose").value = S.prefs.creaDose;
}
$("creaBtn").onclick = () => toggleCrea(todayK());
$("creaGrid").addEventListener("click", e => { const b = e.target.closest("[data-k]"); if (b && !b.disabled) toggleCrea(b.dataset.k); });
$("crPrev").onclick = () => { S.crView = new Date(S.crView.getFullYear(), S.crView.getMonth() - 1, 1); renderCreatine(); };
$("crNext").onclick = () => { S.crView = new Date(S.crView.getFullYear(), S.crView.getMonth() + 1, 1); renderCreatine(); };
$("creaDose").addEventListener("change", () => {
  const v = numOr($("creaDose").value);
  if (v === "" || v <= 0) { $("creaDose").value = S.prefs.creaDose; return; }
  S.prefs.creaDose = v; savePrefs(); renderCreatine();
});
function renderNutrition() {
  const n = nutOf(todayK()), L = n.complements || [];
  $("nutCpMark").textContent = L.length; $("nutCpMark").classList.toggle("ok", L.length > 0);
  $("nutCpSub").textContent = L.length ? L.map(c => c.name).join(", ") : "Rien de noté aujourd’hui";
  $("nutCrMark").textContent = n.creatine ? "✓" : "–"; $("nutCrMark").classList.toggle("ok", !!n.creatine);
  $("nutCrSub").textContent = n.creatine ? "Prise aujourd’hui" + (n.creatine.time ? " à " + n.creatine.time : "") : "Pas encore prise aujourd’hui";
  if (S.screen === "complements") renderComplements();
  if (S.screen === "creatine") renderCreatine();
}

export { nutOf, renderNutrition };
