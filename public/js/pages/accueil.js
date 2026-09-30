// Accueil, Let's go, série de semaines, objectif et bilan du mois.
import { $, DAYS, DISC, MONTHS, MUSCLES, S, avatarHTML, cap, dayMeta, dayOf, dayVolume, discOf, esc, fmtDur, isEmpty, key, nf,
  pad, parse, runKm, runSecs, sessionsOn, titleOf, todayK } from "../commun/core.js";
import { go, refresh, saveProfile } from "../commun/store.js";
import { openDay } from "../seances/index.js";
import { nutOf } from "./nutrition.js";
import { refreshInstallBtn } from "../commun/install.js";
import { refreshSocial } from "../amis/index.js";
import { freshKey, programCardHTML, programState, routines, startWorkout, toTuple } from "../entrainement/index.js";
import { muscleLoad } from "./muscles.js";

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
  const msg = done ? (st.thisWeek > st.G ? "Objectif dépassé, énorme 💪" : "Objectif de la semaine atteint ✓")
    : st.n ? `Encore ${st.left} séance${st.left > 1 ? "s" : ""} pour garder ta série` : `Encore ${st.left} séance${st.left > 1 ? "s" : ""} pour lancer ta série`;
  return `<button type="button" class="streak-card${done ? " done" : ""}" id="goalBtn" aria-label="Objectif de la semaine : ${st.thisWeek} sur ${st.G}. Toucher pour le changer.">
    <span class="ring-wrap">${ringSVG(st.thisWeek, st.G)}<span class="ring-txt"><b>${st.thisWeek}</b>/${st.G}</span></span>
    <span class="sc-main"><span class="sc-lbl">Objectif de la semaine</span><b>${esc(msg)}</b><span class="sc-sub">${st.best > st.n ? "Record : " + st.best + " semaine" + (st.best > 1 ? "s" : "") : done ? "Tu bats ta série, continue !" : st.daysLeft + " jour" + (st.daysLeft > 1 ? "s" : "") + " restant" + (st.daysLeft > 1 ? "s" : "")}</span></span>
    <span class="flame${st.n ? " on" : ""}"><span aria-hidden="true">🔥</span><b>${st.n}</b><small>semaine${st.n > 1 ? "s" : ""}</small></span>
  </button>
  <div class="goal-pick card" id="goalPick" hidden><div class="lbl">Combien de séances par semaine ?</div>
    <div class="chips">${[1, 2, 3, 4, 5, 6, 7].map(n => `<button type="button" class="chip" data-goal="${n}" style="--tc:var(--red)" aria-pressed="${n === st.G}">${n}</button>`).join("")}</div>
    <p class="hint">Ta série 🔥 compte les semaines d’affilée où tu atteins cet objectif. Les jours « Repos » ne comptent pas.</p></div>`;
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
function renderHome() {
  refreshInstallBtn(); refreshSocial();
  const t = new Date(), tk = key(t);
  $("homeDate").innerHTML = `<span>${cap(DAYS[t.getDay()])}</span>${t.getDate()} ${MONTHS[t.getMonth()]} ${t.getFullYear()}`;
  $("homeAvatar").innerHTML = avatarHTML(S.profile, 34);
  $("homeStreak").innerHTML = streakCardHTML();
  const mon = mondayOf(t);
  let h = "";
  for (let i = 0; i < 7; i++) {
    const k = key(addDays(mon, i)), ks = sessionsOn(k).filter(x => counts(S.days[x])), ty = ks.length && dayMeta(S.days[ks[0]]);
    h += `<span class="${ks.length ? "on" : ""}${k === tk ? " now" : ""}" style="--tc:${ty ? ty.color : "#8A847E"}">${"LMMJVSD"[i]}${ks.length > 1 ? "<sup>" + ks.length + "</sup>" : ""}</span>`;
  }
  $("homeWeek").innerHTML = h;
  const today = todaySummary(), ps = programState();
  $("homeGoSub").textContent = today ? "Aujourd’hui : " + today : ps && !ps.finished ? "Prochaine séance : " + ps.next.name : "Lance ta séance";
  const n = nutOf(tk), c = (n.complements || []).length;
  $("homeNut").innerHTML = `<span class="pill${n.creatine ? " ok" : ""}">${n.creatine ? "✓ Créatine prise" : "Créatine à prendre"}</span><span class="pill${c ? " ok" : ""}">${c} complément${c > 1 ? "s" : ""} aujourd’hui</span>`;
}
const GO_TILES = [
  ["seances", "Calendrier", "Toutes tes séances, jour par jour", '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>'],
  ["routines", "Mes routines", "Tes séances enregistrées, prêtes à lancer", '<path d="M5 4h14v17l-7-4-7 4z"/>'],
  ["programs", "Programmes", "Des plans sur plusieurs semaines", '<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/>'],
  ["types", "Idées de séances", "Muscu, CrossFit, callisthénie, course", '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.6.6 1 1.4 1 2.5h6c0-1.1.4-1.9 1-2.5A6 6 0 0 0 12 3z"/>'],
  ["records", "Mes records", "Tes meilleures perfs", '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>'],
  ["progress", "Ma progression", "Tes courbes séance après séance", '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>'],
  ["muscles", "Carte musculaire", "Les muscles travaillés cette semaine", '<circle cx="12" cy="4.5" r="2"/><path d="M7 21l2-8-3-4 6-2 6 2-3 4 2 8M9 13h6"/>'],
  ["recap", "Bilan du mois", "Tes chiffres à partager en story", '<rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 18h4M9 12l2-3 2 2 2-3"/>']
];
function renderGo() {
  const ks = sessionsOn(todayK()).filter(k => !isEmpty(S.days[k])), ps = programState(), rs = routines();
  $("goBody").innerHTML = `
    <section class="go-hero">
      ${ks.length ? `<span class="sc-lbl">Aujourd’hui</span><b class="go-today">${esc(todaySummary())}</b>
        <div class="grid2"><button class="btn" data-goopen="${ks[ks.length - 1]}">Continuer</button><button class="btn primary" data-gonew="1">+ Nouvelle</button></div>`
      : `<span class="sc-lbl">Pas encore de séance aujourd’hui</span><button class="btn primary go-start" data-gonew="1">▶ Démarrer ma séance</button>`}
    </section>
    ${programCardHTML(ps, true)}
    ${rs.length ? `<section><h2 class="h2">Lancer une routine</h2><div class="chips">${rs.slice(0, 6).map(r => `<button class="chip" data-rgo2="${r.id}" style="--tc:var(--red)">▶ ${esc(r.name)}</button>`).join("")}</div></section>` : ""}
    <div class="go-grid">${GO_TILES.map(([v, n, d, ic]) => `<button class="go-tile" data-go="${v}"><span class="disc-ico" aria-hidden="true" style="--tc:var(--red-hi)"><svg viewBox="0 0 24 24">${ic}</svg></span><b>${n}</b><span>${d}</span></button>`).join("")}</div>`;
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
  $("recapMonth").textContent = cap(MONTHS[d.getMonth()]) + " " + d.getFullYear();
  $("recapNext").disabled = d >= new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const big = (v, l) => `<div class="stat"><b>${v}</b><span>${l}</span></div>`;
  $("recapBody").innerHTML = !st.n ? `<div class="empty">Aucune séance en ${MONTHS[d.getMonth()]}. Ton bilan apparaîtra ici dès ta première séance.</div>` : `
    <div class="stats">${big(st.n, "séance" + (st.n > 1 ? "s" : ""))}${big(st.days, "jour" + (st.days > 1 ? "s" : "") + " actif" + (st.days > 1 ? "s" : ""))}${big(st.prs, "record" + (st.prs > 1 ? "s" : "") + " battu" + (st.prs > 1 ? "s" : ""))}</div>
    <div class="stats">${big(st.vol >= 10000 ? nf.format(st.vol / 1000) + " t" : nf.format(st.vol), st.vol >= 10000 ? "soulevées" : "kg soulevés")}${big(nf.format(st.km), "km courus")}${big(streak.best, "semaines 🔥 (record)")}</div>
    <section class="card"><dl class="kv">
      <dt>Par rapport au mois d’avant</dt><dd>${diff > 0 ? "▲ " + diff + " séance" + (diff > 1 ? "s" : "") + " de plus" : diff < 0 ? "▼ " + (-diff) + " séance" + (diff < -1 ? "s" : "") + " de moins" : "Autant de séances"}</dd>
      ${st.disc ? `<dt>Activité favorite</dt><dd>${esc(st.disc[0])} (${st.disc[1]})</dd>` : ""}
      ${st.ex ? `<dt>Exercice le plus fait</dt><dd>${esc(st.ex[0])} (${st.ex[1]} fois)</dd>` : ""}
      ${st.mus ? `<dt>Muscle le plus travaillé</dt><dd>${esc(MUSCLES[st.mus[0]])}</dd>` : ""}
      ${st.runT ? `<dt>Temps de course</dt><dd>${esc(fmtDur(st.runT))}</dd>` : ""}
    </dl></section>
    <button class="btn primary" id="recapShare">📲 Partager en story</button>
    <p class="hint" id="recapMsg" style="text-align:center">Une image de ton bilan est créée : partage-la sur Insta, Snap ou WhatsApp.</p>
    <img id="recapImg" class="recap-img" alt="Aperçu de l’image du bilan" hidden>`;
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
  g.fillText("MON BILAN DU MOIS", W / 2, 200);
  g.fillStyle = "#F4F1EE"; g.font = 'italic 800 150px "Barlow Condensed", sans-serif';
  g.fillText(MONTHS[d.getMonth()].toUpperCase(), W / 2, 350, W - 120);
  g.fillStyle = red; g.fillText(String(d.getFullYear()), W / 2, 490);
  const tiles = [[st.n, "SÉANCES"], [st.days, "JOURS ACTIFS"], [st.vol >= 10000 ? nf.format(st.vol / 1000) + " t" : nf.format(st.vol) + " kg", "SOULEVÉS"], [nf.format(st.km) + " km", "COURUS"], [st.prs, "RECORDS BATTUS"], [streakInfo().n, "SEMAINES 🔥"]];
  tiles.forEach(([v, l], i) => {
    const x = 90 + (i % 2) * 470, y = 600 + Math.floor(i / 2) * 330;
    g.fillStyle = "#141416"; g.strokeStyle = "#2B2B2F"; g.lineWidth = 3;
    g.beginPath(); g.roundRect ? g.roundRect(x, y, 430, 290, 36) : g.rect(x, y, 430, 290); g.fill(); g.stroke();
    g.textAlign = "left"; g.fillStyle = "#F4F1EE"; g.font = '800 120px "Barlow Condensed", sans-serif'; g.fillText(String(v), x + 40, y + 160, 350);
    g.fillStyle = "#9C9690"; g.font = '600 34px "Figtree", sans-serif'; g.fillText(l, x + 40, y + 230, 350);
  });
  g.textAlign = "center";
  if (st.ex) { g.fillStyle = "#9C9690"; g.font = '600 36px "Figtree", sans-serif'; g.fillText("Exercice favori : " + st.ex[0], W / 2, 1640, W - 120); }
  g.font = 'italic 800 76px "Barlow Condensed", sans-serif'; g.textAlign = "left";
  const w1 = g.measureText("L’AGENDA ").width, w2 = g.measureText("DU SPORTIF").width, x0 = (W - w1 - w2) / 2;
  g.fillStyle = "#F4F1EE"; g.fillText("L’AGENDA ", x0, 1800); g.fillStyle = red; g.fillText("DU SPORTIF", x0 + w1, 1800);
  return new Promise(r => cv.toBlob(r, "image/png"));
}
$("recapBody").addEventListener("click", async e => {
  if (!e.target.closest("#recapShare")) return;
  const btn = $("recapShare"); btn.disabled = true; btn.textContent = "Création de l’image…";
  try {
    const blob = await recapImage(), name = "bilan-" + MONTHS[S.recapMonth.getMonth()] + ".png", file = new File([blob], name, { type: "image/png" });
    const img = $("recapImg"); img.src = URL.createObjectURL(blob); img.hidden = false;
    if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: "Mon bilan du mois" }).catch(() => {}); $("recapMsg").textContent = "Tu peux aussi appuyer longuement sur l’image pour l’enregistrer."; }
    else { const a = document.createElement("a"); a.href = img.src; a.download = name; document.body.appendChild(a); a.click(); a.remove(); $("recapMsg").textContent = "Image téléchargée. Sur iPhone, appuie longuement sur l’image pour l’enregistrer."; }
  } catch (x) { $("recapMsg").textContent = "Impossible de créer l’image. Réessaie."; }
  btn.disabled = false; btn.textContent = "📲 Partager en story";
});

export { addDays, counts, renderGo, renderHome, renderRecap, streakInfo };
