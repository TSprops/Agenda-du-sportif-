// Nutrition : compléments et créatine.
import { $, DEFAULT_SUPPS, S, armed, clone, deleteDoc, esc, fmtJour, fmtJourMois, fmtMoisAn, hm, key, nf, numOr, parse, setDoc, todayK } from "../commun/core.js";
import { savePrefs, subDoc, syncStats } from "../commun/store.js";
import { canon, majuscule, t, valeur } from "../commun/i18n.js";
// Noms et doses enregistrés en français pour les compléments proposés : traduits à l'affichage.
const nomSupp = n => valeur("valeurs.complements", n), doseSupp = d => valeur("valeurs.doses", d);

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
function fmtDay(k) { const d = parse(k); return k === todayK() ? t("complements.aujourdhuiDate", { date: fmtJour(d) }) : fmtJour(d); }
function renderComplements() {
  const k = S.cpDay, n = nutOf(k), cat = suppCatalog(), L = n.complements || [], taken = new Set(L.map(c => c.name));
  $("cpDate").textContent = majuscule(fmtDay(k)); $("cpNext").disabled = k >= todayK();
  $("cpChips").innerHTML = [...cat].map(([name, dose]) => `<button class="chip" data-name="${esc(name)}" data-dose="${esc(dose)}" style="--tc:var(--red)" aria-pressed="${taken.has(name)}">${taken.has(name) ? "✓" : "+"} ${esc(nomSupp(name))}${dose ? ` <span style="opacity:.7;font-weight:500">${esc(doseSupp(dose))}</span>` : ""}</button>`).join("");
  $("cpList").innerHTML = [...cat.keys()].map(x => `<option value="${esc(nomSupp(x))}">`).join("");
  $("cpListTitle").textContent = L.length ? t("complements.prisCeJourN", { n: L.length }) : t("complements.prisCeJour");
  $("cpItems").innerHTML = L.length ? L.map((c, i) => `<div class="intake"><i class="dot" style="--tc:var(--red)"></i><span class="main"><b>${esc(nomSupp(c.name))}</b><span>${[c.dose && doseSupp(c.dose), c.time && t("commun.aHeure", { heure: c.time })].filter(Boolean).map(esc).join(" · ") || t("complements.doseNonPrecisee")}</span></span><button class="icon-btn" data-del="${i}">${t("complements.retirer")}</button></div>`).join("") : `<p class="hint">${t("complements.rien")}</p>`;
}
function addSupp(name, dose) { name = canon("valeurs.complements", name); dose = canon("valeurs.doses", dose); const k = S.cpDay, n = clone(nutOf(k)); n.complements = n.complements || []; n.complements.push({ name, dose, time: k === todayK() ? hm() : "" }); saveNut(k, n); }
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
$("cpName").addEventListener("change", () => { const d = suppCatalog().get(canon("valeurs.complements", $("cpName").value)); if (d && !$("cpDose").value) $("cpDose").value = doseSupp(d); });
$("cpItems").addEventListener("click", e => {
  const b = e.target.closest("[data-del]"); if (!b || !armed(b, t("commun.confirmer"))) return;
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
    ? `<span class="crea-check" aria-hidden="true">✓</span><b>${t("creatine.prise")}</b><span>${c.time ? esc(t("commun.aHeure", { heure: c.time })) + " · " : ""}${nf.format(c.dose || S.prefs.creaDose)} g</span>`
    : `<b>${t("creatine.aPrendre")}</b><span>${t("creatine.toucherConfirmer", { dose: nf.format(S.prefs.creaDose) })}</span>`;
  $("creaHint").textContent = c ? t("creatine.annuler") : "";
  const y = S.crView.getFullYear(), m = S.crView.getMonth(), count = new Date(y, m + 1, 0).getDate(), first = (new Date(y, m, 1).getDay() + 6) % 7;
  $("creaMonth").textContent = fmtMoisAn(S.crView);
  let h = "", done = 0, elapsed = 0, grams = 0;
  for (let i = 0; i < first; i++) h += '<span class="day pad" aria-hidden="true"></span>';
  for (let d = 1; d <= count; d++) {
    const k = key(new Date(y, m, d)), cr = nutOf(k).creatine, fut = k > tk;
    if (!fut) { elapsed++; if (cr) { done++; grams += +cr.dose || 0; } }
    h += `<button class="day${cr ? " crea-on" : ""}${k === tk ? " today" : ""}" data-k="${k}"${fut ? " disabled" : ""} aria-pressed="${!!cr}" aria-label="${esc(fmtJourMois(new Date(y, m, d)) + (cr ? t("creatine.priseAria") : ""))}"><span class="n">${d}</span></button>`;
  }
  $("creaGrid").innerHTML = h;
  const st = creaStreak();
  $("creaStats").innerHTML = `<div class="stat"><b>${st}</b><span>${t("creatine.daffilee", { n: st })}</span></div><div class="stat"><b>${done}<small style="font-size:.55em;color:var(--muted)">/${elapsed}</small></b><span>${t("creatine.joursCeMois")}</span></div><div class="stat"><b>${nf.format(grams)}</b><span>${t("creatine.grammesCeMois")}</span></div>`;
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
  $("nutCpSub").textContent = L.length ? L.map(c => nomSupp(c.name)).join(", ") : t("nutrition.rienAujourdhui");
  $("nutCrMark").textContent = n.creatine ? "✓" : "–"; $("nutCrMark").classList.toggle("ok", !!n.creatine);
  $("nutCrSub").textContent = n.creatine ? (n.creatine.time ? t("nutrition.priseA", { heure: n.creatine.time }) : t("nutrition.prise")) : t("nutrition.pasPrise");
  if (S.screen === "complements") renderComplements();
  if (S.screen === "creatine") renderCreatine();
}

export { nutOf, renderNutrition };
