// Accueil (tableau de bord), page Séances, série de semaines, objectif et bilan du mois.
import { $, DISC, MUSCLES, S, dayMeta, dayOf, dayVolume, discOf, esc, fmtDur, fmtJourMois, fmtMois, fmtMoisAn, isEmpty, key, nf, nomEx,
  pad, parse, runKm, runSecs, sessionsOn, titleOf, todayK } from "../commun/core.js";
import { dateFormat, majuscule, t } from "../commun/i18n.js";
import { go, refresh, saveProfile } from "../commun/store.js";
import { openDay } from "../seances/index.js";
import { nutOf } from "./nutrition.js";
import { refreshInstallBtn } from "../commun/install.js";
import { refreshSocial } from "../amis/index.js";
import { freshKey, programCardHTML, programState, routines, startWorkout, toTuple } from "../entrainement/index.js";
import { bodySVG, levelOf, muscleLoad } from "./muscles.js";
import { doneSet } from "../idees/index.js";
import { trophyStripHTML } from "./trophees.js";

/* ============================================================
   Série de semaines 🔥 et objectif de la semaine
   ============================================================ */
const mondayOf = d => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - (x.getDay() + 6) % 7); return x; };
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const counts = s => s && !isEmpty(s) && s.typeId !== "repos";
function weekCounts() {
  const m = new Map();
  Object.keys(S.days).forEach(k => { if (!counts(S.days[k])) return; const w = key(mondayOf(parse(k))); m.set(w, (m.get(w) || 0) + 1); });
  return m;
}
function weeklyGoal() { return Math.min(7, Math.max(1, +((S.profile && S.profile.goal) || 3))); }
// Série = semaines d'affilée où l'objectif est atteint. La semaine en cours compte dès qu'elle est réussie.
function streakInfo() {
  const m = weekCounts(), G = weeklyGoal(), cur = mondayOf(new Date()), thisWeek = m.get(key(cur)) || 0;
  let n = thisWeek >= G ? 1 : 0, d = addDays(cur, -7);
  while ((m.get(key(d)) || 0) >= G) { n++; d = addDays(d, -7); }
  let best = 0, run = 0;
  const first = [...m.keys()].sort()[0];
  if (first) for (let w = parse(first); w <= cur; w = addDays(w, 7)) { if ((m.get(key(w)) || 0) >= G) { run++; best = Math.max(best, run); } else run = 0; }
  return { n, best, thisWeek, G, left: Math.max(0, G - thisWeek), daysLeft: 7 - ((new Date().getDay() + 6) % 7) };
}
function ringSVG(v, max, size) {
  const r = 26, c = 2 * Math.PI * r, p = Math.min(1, max ? v / max : 0);
  return `<svg viewBox="0 0 64 64" width="${size || 64}" height="${size || 64}" aria-hidden="true" class="ring"><circle cx="32" cy="32" r="${r}" class="ring-bg"/><circle cx="32" cy="32" r="${r}" class="ring-fg" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - p)).toFixed(1)}" transform="rotate(-90 32 32)"/></svg>`;
}
function streakCardHTML() {
  const st = streakInfo(), done = st.thisWeek >= st.G;
  const msg = done ? t(st.thisWeek > st.G ? "accueil.serie.depasse" : "accueil.serie.atteint")
    : t(st.n ? "accueil.serie.garder" : "accueil.serie.lancer", { n: st.left });
  return `<button type="button" class="streak-card${done ? " done" : ""}" id="goalBtn" aria-label="${esc(t("accueil.serie.aria", { fait: st.thisWeek, objectif: st.G }))}">
    <span class="ring-wrap">${ringSVG(st.thisWeek, st.G)}<span class="ring-txt"><b>${st.thisWeek}</b>/${st.G}</span></span>
    <span class="sc-main"><span class="sc-lbl">${t("accueil.serie.objectif")}</span><b>${esc(msg)}</b><span class="sc-sub">${st.best > st.n ? t("accueil.serie.record", { n: st.best }) : done ? t("accueil.serie.continue") : t("accueil.serie.joursRestants", { n: st.daysLeft })}</span></span>
    <span class="flame${st.n ? " on" : ""}"><span aria-hidden="true">🔥</span><b>${st.n}</b><small>${t("accueil.serie.semaines", { n: st.n })}</small></span>
  </button>
  <div class="goal-pick card" id="goalPick" hidden><div class="lbl">${t("accueil.serie.combien")}</div>
    <div class="chips">${[1, 2, 3, 4, 5, 6, 7].map(n => `<button type="button" class="chip" data-goal="${n}" style="--tc:var(--red)" aria-pressed="${n === st.G}">${n}</button>`).join("")}</div>
    <p class="hint">${t("accueil.serie.aide")}</p></div>`;
}
document.addEventListener("click", e => {
  if (e.target.closest("#goalBtn")) { const p = $("goalPick"); if (p) p.hidden = !p.hidden; return; }
  const g = e.target.closest("[data-goal]"); if (g) { saveProfile({ goal: +g.dataset.goal }); refresh(); }
});

/* ============================================================
   Accueil, « Let's go » et « Social »
   ============================================================ */
function todaySummary() {
  const ks = sessionsOn(todayK()).filter(k => !isEmpty(S.days[k]));
  return ks.map(k => titleOf(S.days[k])).join(" + ");
}
// Petite courbe pour les aperçus de l'accueil.
function sparkSVG(vals) {
  if (vals.length < 2) return "";
  const mn = Math.min(...vals), mx = Math.max(...vals), W = 120, H = 44, sp = mx - mn || 1;
  const pts = vals.map((v, i) => [(i / (vals.length - 1) * W).toFixed(1), (H - 4 - (v - mn) / sp * (H - 10)).toFixed(1)]);
  const line = pts.map(p => p.join(",")).join(" ");
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><polygon points="0,${H} ${line} ${W},${H}"/><polyline points="${line}"/></svg>`;
}
// Aperçu de la progression : l'exercice de muscu le plus suivi (charge max par séance), sinon les séances par semaine.
function progPreview() {
  const map = new Map();
  Object.keys(S.days).filter(k => discOf(S.days[k]) === "muscu").sort().forEach(k => (S.days[k].exercises || []).forEach(ex => {
    const n = String(ex.name || "").trim(), v = ex.hold ? 0 : Math.max(0, ...(ex.sets || []).filter(doneSet).map(st => +st.kg || 0));
    if (!n || !v) return;
    const id = n.toLowerCase(), it = map.get(id) || { n, pts: [] }, last = it.pts[it.pts.length - 1];
    if (last && last.k === dayOf(k)) last.v = Math.max(last.v, v); else it.pts.push({ k: dayOf(k), v });
    map.set(id, it);
  }));
  const best = [...map.values()].filter(x => x.pts.length > 1).sort((a, b) => b.pts.length - a.pts.length)[0];
  if (best) { const v = best.pts.slice(-10).map(p => p.v); return { svg: sparkSVG(v), txt: t("accueil.progEx", { nom: nomEx(best.n), de: nf.format(v[0]), a: nf.format(v[v.length - 1]) }) }; }
  const m = weekCounts(), mon = mondayOf(new Date()), v = [];
  for (let i = 7; i >= 0; i--) v.push(m.get(key(addDays(mon, -7 * i))) || 0);
  return { svg: v.some(Boolean) ? sparkSVG(v) : "", txt: t(v.some(Boolean) ? "accueil.seancesParSemaine" : "accueil.courbesBientot") };
}
function lastRecord() {
  const ks = Object.keys(S.days).filter(k => (S.days[k].prs || []).length).sort();
  const n = ks.reduce((a, k) => a + S.days[k].prs.length, 0), k = ks[ks.length - 1];
  return k ? { n, txt: S.days[k].prs[S.days[k].prs.length - 1], k } : { n: 0 };
}
const dashTop = (titre, extra) => `<span class="dc-top"><b>${titre}</b>${extra || ""}<span class="arrow" aria-hidden="true">›</span></span>`;
function renderHome() {
  refreshInstallBtn(); refreshSocial();
  const now = new Date(), tk = key(now);
  $("homeDate").innerHTML = `<span>${esc(majuscule(dateFormat(now, { weekday: "long" })))}</span>${esc(dateFormat(now, { day: "numeric", month: "long", year: "numeric" }))}`;
  $("homeStreak").innerHTML = streakCardHTML();
  // Carte musculaire : 7 derniers jours.
  const from = key(addDays(now, -6)), load = muscleLoad(Object.keys(S.days).filter(k => dayOf(k) >= from)), lv = {};
  Object.keys(MUSCLES).forEach(m => { lv[m] = levelOf(load[m] || 0, 7); });
  const topMu = Object.entries(load).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([m]) => MUSCLES[m]);
  // Semaine en cours (calendrier).
  const mon = mondayOf(now);
  let wk = "";
  for (let i = 0; i < 7; i++) {
    const k = key(addDays(mon, i)), ks = sessionsOn(k).filter(x => counts(S.days[x])), ty = ks.length && dayMeta(S.days[ks[0]]);
    wk += `<span class="${ks.length ? "on" : ""}${k === tk ? " now" : ""}" style="--tc:${ty ? ty.color : "#8A847E"}">${esc(dateFormat(addDays(mon, i), { weekday: "narrow" }))}${ks.length > 1 ? "<sup>" + ks.length + "</sup>" : ""}</span>`;
  }
  const today = todaySummary(), ps = programState(), pg = progPreview(), rec = lastRecord();
  const n = nutOf(tk), c = (n.complements || []).length, ms = monthStats(tk.slice(0, 7));
  $("homeDash").innerHTML = `
    <button class="dash-card dash-mus" data-go="muscles">${dashTop(t("muscles.titre"), `<em>${t("accueil.septJours")}</em>`)}
      <span class="dc-bodies">${bodySVG("front", lv, { cls: "dash-body" })}${bodySVG("back", lv, { cls: "dash-body" })}</span>
      <span class="dc-sub">${topMu.length ? esc(t("accueil.plusTravailles", { muscles: topMu.join(", ") })) : t("accueil.aucuneSeance7j")}</span></button>
    <div class="dash-row">
      <button class="dash-card dash-prog" data-go="progress">${dashTop(t("accueil.progression"))}${pg.svg || `<span class="dc-empty">📈</span>`}<span class="dc-sub">${esc(pg.txt)}</span></button>
      <button class="dash-card" data-go="nutrition">${dashTop(t("nutrition.titre"))}
        <span class="dc-nut"><span class="${n.creatine ? "ok" : ""}">${n.creatine ? "✓" : "○"} ${t("creatine.titre")}</span><span class="${c ? "ok" : ""}">${t("accueil.complements", { n: c, nb: `<b>${c}</b>` })}</span></span>
        <span class="dc-sub">${t("commun.aujourdhui")}</span></button>
    </div>
    ${trophyStripHTML()}
    <div class="dash-row">
      <button class="dash-card" data-go="records">${dashTop(t("accueil.records"))}<span class="dc-big">${rec.n}</span><span class="dc-sub">${rec.n ? esc(t("accueil.dernierRecord", { record: rec.txt })) : t("accueil.premierRecord")}</span></button>
      <button class="dash-card" data-go="recap">${dashTop(t("bilan.titre"))}<span class="dc-big">${ms.n}</span><span class="dc-sub">${t("accueil.seancesEnMois", { n: ms.n, mois: fmtMois(now) })}${ms.km ? " · " + nf.format(Math.round(ms.km * 10) / 10) + " km" : ms.vol ? " · " + (ms.vol >= 10000 ? nf.format(Math.round(ms.vol / 100) / 10) + " t" : nf.format(Math.round(ms.vol)) + " kg") : ""}</span></button>
    </div>
    <button class="dash-card" data-go="seances">${dashTop(t("seances.calendrier"))}<span class="week">${wk}</span>
      <span class="dc-sub">${today ? esc(t("accueil.aujourdhuiSeance", { seance: today })) : ps && !ps.finished ? esc(t("accueil.prochaineSeance", { seance: ps.next.name })) : t("accueil.toutesSeances")}</span></button>`;
}
const SEANCE_TILES = [
  ["seances", '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>'],
  ["routines", '<path d="M5 4h14v17l-7-4-7 4z"/>'],
  ["programs", '<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>'],
  ["types", '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.4 1 2.5h6c0-1.1.4-1.9 1-2.5A6 6 0 0 0 12 3z"/>']
];
function renderGo() {
  const ks = sessionsOn(todayK()).filter(k => !isEmpty(S.days[k])), ps = programState(), rs = routines();
  const sub = { routines: rs.length ? t("go.routinesEnregistrees", { n: rs.length }) : "", programs: ps && !ps.finished ? t("go.enCours", { seance: ps.next.name }) : "" };
  $("goBody").innerHTML = `
    ${ks.length ? `<section class="go-hero"><span class="sc-lbl">${t("commun.aujourdhui")}</span><b class="go-today">${esc(todaySummary())}</b>
        <div class="grid2"><button class="btn" data-goopen="${ks[ks.length - 1]}">${t("fete.continuer")}</button><button class="btn primary" data-gonew="1">${t("go.nouvelle")}</button></div></section>` : ""}
    <div class="seance-list">${SEANCE_TILES.map(([v, ic], i) => `<button class="seance-tile${i ? "" : " hl"}" data-go="${v}"><span class="disc-ico" aria-hidden="true" style="--tc:var(--red-hi)"><svg viewBox="0 0 24 24">${ic}</svg></span><span class="mc"><b>${t(`go.tuiles.${v}.nom`)}</b><span>${esc(sub[v] || t(`go.tuiles.${v}.texte`))}</span></span><span class="arrow" aria-hidden="true">›</span></button>`).join("")}</div>
    ${programCardHTML(ps, true)}
    ${rs.length ? `<section><h2 class="h2">${t("go.lancerRoutine")}</h2><div class="chips">${rs.slice(0, 6).map(r => `<button class="chip" data-rgo2="${r.id}" style="--tc:var(--red)">▶ ${esc(r.name)}</button>`).join("")}</div></section>` : ""}`;
}
$("goBody").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  if (b.dataset.goopen) { go("seances"); openDay(b.dataset.goopen); return; }
  if (b.dataset.gonew) { go("seances"); openDay(freshKey(todayK())); return; }
  if (b.dataset.rgo2) { const r = routines().find(x => x.id === b.dataset.rgo2); if (r) startWorkout({ name: r.name, disc: r.disc, typeId: r.typeId, ex: (r.ex || []).map(toTuple) }); }
});

/* ============================================================
   Bilan du mois (et image à partager en story)
   ============================================================ */
function monthStats(mk) {
  const ks = Object.keys(S.days).filter(k => k.startsWith(mk) && !isEmpty(S.days[k]) && S.days[k].typeId !== "repos").sort();
  const disc = {}, exCount = {}, mus = {};
  let vol = 0, km = 0, runT = 0, prs = 0;
  ks.forEach(k => {
    const s = S.days[k], dn = DISC[discOf(s)].name; disc[dn] = (disc[dn] || 0) + 1;
    vol += dayVolume(s); km += runKm(s); if (discOf(s) === "course") runT += runSecs(s.run); prs += (s.prs || []).length;
    (s.exercises || []).forEach(ex => { const n = String(ex.name || "").trim(); if (!n) return; exCount[n] = (exCount[n] || 0) + 1; });
  });
  Object.entries(muscleLoad(ks)).forEach(([m, v]) => { mus[m] = v; });
  const top = o => Object.entries(o).sort((a, b) => b[1] - a[1])[0];
  return { ks, n: ks.length, days: new Set(ks.map(dayOf)).size, vol, km, runT, prs, disc: top(disc), ex: top(exCount), mus: top(mus) };
}
function renderRecap() {
  const d = S.recapMonth || (S.recapMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const mk = d.getFullYear() + "-" + pad(d.getMonth() + 1), st = monthStats(mk);
  const pm = new Date(d.getFullYear(), d.getMonth() - 1, 1), prev = monthStats(pm.getFullYear() + "-" + pad(pm.getMonth() + 1));
  const diff = st.n - prev.n, streak = streakInfo();
  $("recapMonth").textContent = fmtMoisAn(d);
  $("recapNext").disabled = d >= new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const big = (v, l) => `<div class="stat"><b>${v}</b><span>${l}</span></div>`;
  $("recapBody").innerHTML = !st.n ? `<div class="empty">${esc(t("bilan.vide", { mois: fmtMois(d) }))}</div>` : `
    <div class="stats">${big(st.n, t("bilan.seances", { n: st.n }))}${big(st.days, t("bilan.joursActifs", { n: st.days }))}${big(st.prs, t("bilan.recordsBattus", { n: st.prs }))}</div>
    <div class="stats">${big(st.vol >= 10000 ? nf.format(st.vol / 1000) + " t" : nf.format(st.vol), t(st.vol >= 10000 ? "bilan.tonnesSoulevees" : "bilan.kgSouleves"))}${big(nf.format(st.km), t("bilan.kmCourus"))}${big(streak.best, t("bilan.semainesRecord"))}</div>
    <section class="card"><dl class="kv">
      <dt>${t("bilan.moisAvant")}</dt><dd>${diff > 0 ? "▲ " + t("bilan.dePlus", { n: diff }) : diff < 0 ? "▼ " + t("bilan.deMoins", { n: -diff }) : t("bilan.autant")}</dd>
      ${st.disc ? `<dt>${t("bilan.activiteFavorite")}</dt><dd>${esc(st.disc[0])} (${st.disc[1]})</dd>` : ""}
      ${st.ex ? `<dt>${t("bilan.exercicePlusFait")}</dt><dd>${esc(t("bilan.fois", { nom: nomEx(st.ex[0]), n: st.ex[1] }))}</dd>` : ""}
      ${st.mus ? `<dt>${t("bilan.musclePlusTravaille")}</dt><dd>${esc(MUSCLES[st.mus[0]])}</dd>` : ""}
      ${st.runT ? `<dt>${t("bilan.tempsCourse")}</dt><dd>${esc(fmtDur(st.runT))}</dd>` : ""}
    </dl></section>
    <button class="btn primary" id="recapShare">${t("bilan.partager")}</button>
    <p class="hint" id="recapMsg" style="text-align:center">${t("bilan.partagerAide")}</p>
    <img id="recapImg" class="recap-img" alt="${esc(t("bilan.apercu"))}" hidden>`;
}
$("recapPrev").onclick = () => { const d = S.recapMonth; S.recapMonth = new Date(d.getFullYear(), d.getMonth() - 1, 1); renderRecap(); };
$("recapNext").onclick = () => { const d = S.recapMonth; S.recapMonth = new Date(d.getFullYear(), d.getMonth() + 1, 1); renderRecap(); };
async function recapImage() {
  const d = S.recapMonth, mk = d.getFullYear() + "-" + pad(d.getMonth() + 1), st = monthStats(mk);
  try { await Promise.all([document.fonts.load('italic 800 120px "Barlow Condensed"'), document.fonts.load('800 120px "Barlow Condensed"'), document.fonts.load('600 40px "Figtree"')]); } catch (e) { /* police système */ }
  const W = 1080, H = 1920, cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const g = cv.getContext("2d"), red = getComputedStyle(document.documentElement).getPropertyValue("--red").trim() || "#E3161F";
  g.fillStyle = "#0A0A0B"; g.fillRect(0, 0, W, H);
  const grd = g.createRadialGradient(W / 2, 260, 40, W / 2, 260, 900); grd.addColorStop(0, red + "55"); grd.addColorStop(1, "transparent");
  g.fillStyle = grd; g.fillRect(0, 0, W, H);
  g.textAlign = "center"; g.fillStyle = "#9C9690"; g.font = '600 44px "Figtree", sans-serif';
  g.fillText(t("bilan.image.titre"), W / 2, 200);
  g.fillStyle = "#F4F1EE"; g.font = 'italic 800 150px "Barlow Condensed", sans-serif';
  g.fillText(fmtMois(d).toLocaleUpperCase(), W / 2, 350, W - 120);
  g.fillStyle = red; g.fillText(String(d.getFullYear()), W / 2, 490);
  const tiles = [[st.n, t("bilan.image.seances")], [st.days, t("bilan.image.joursActifs")], [st.vol >= 10000 ? nf.format(st.vol / 1000) + " t" : nf.format(st.vol) + " kg", t("bilan.image.souleves")],
    [nf.format(st.km) + " km", t("bilan.image.courus")], [st.prs, t("bilan.image.records")], [streakInfo().n, t("bilan.image.semaines")]];
  tiles.forEach(([v, l], i) => {
    const x = 90 + (i % 2) * 470, y = 600 + Math.floor(i / 2) * 330;
    g.fillStyle = "#141416"; g.strokeStyle = "#2B2B2F"; g.lineWidth = 3;
    g.beginPath(); g.roundRect ? g.roundRect(x, y, 430, 290, 36) : g.rect(x, y, 430, 290); g.fill(); g.stroke();
    g.textAlign = "left"; g.fillStyle = "#F4F1EE"; g.font = '800 120px "Barlow Condensed", sans-serif'; g.fillText(String(v), x + 40, y + 160, 350);
    g.fillStyle = "#9C9690"; g.font = '600 34px "Figtree", sans-serif'; g.fillText(l, x + 40, y + 230, 350);
  });
  g.textAlign = "center";
  if (st.ex) { g.fillStyle = "#9C9690"; g.font = '600 36px "Figtree", sans-serif'; g.fillText(t("bilan.image.favori", { nom: nomEx(st.ex[0]) }), W / 2, 1640, W - 120); }
  g.font = 'italic 800 76px "Barlow Condensed", sans-serif'; g.textAlign = "left";
  const m1 = t("bilan.image.devise1"), m2 = t("bilan.image.devise2"), w1 = g.measureText(m1).width, w2 = g.measureText(m2).width, x0 = (W - w1 - w2) / 2;
  g.fillStyle = "#F4F1EE"; g.fillText(m1, x0, 1800); g.fillStyle = red; g.fillText(m2, x0 + w1, 1800);
  return new Promise(r => cv.toBlob(r, "image/png"));
}
$("recapBody").addEventListener("click", async e => {
  if (!e.target.closest("#recapShare")) return;
  const btn = $("recapShare"); btn.disabled = true; btn.textContent = t("bilan.creation");
  try {
    const blob = await recapImage(), name = t("bilan.fichier", { mois: fmtMois(S.recapMonth) }) + ".png", file = new File([blob], name, { type: "image/png" });
    const img = $("recapImg"); img.src = URL.createObjectURL(blob); img.hidden = false;
    if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: t("bilan.titrePartage") }).catch(() => {}); $("recapMsg").textContent = t("bilan.appuiLong"); }
    else { const a = document.createElement("a"); a.href = img.src; a.download = name; document.body.appendChild(a); a.click(); a.remove(); $("recapMsg").textContent = t("bilan.telechargee"); }
  } catch (x) { $("recapMsg").textContent = t("bilan.impossible"); }
  btn.disabled = false; btn.textContent = t("bilan.partager");
});

export { addDays, counts, renderGo, renderHome, renderRecap, streakInfo };
