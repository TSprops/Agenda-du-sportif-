// Trophées : badges débloqués selon les séances (nombre, série de semaines, records, variété, course, volume),
// page « Mes trophées », bandeau sur Let's go, et célébration quand un trophée tombe ou que l'objectif de la semaine est atteint.
// Un trophée gagné reste gagné : il est mémorisé dans le profil (profile.trophies = { id: date }).
import { $, DISC, S, dayVolume, discOf, esc, key, nf, runKm } from "../commun/core.js";
import { saveProfile } from "../commun/store.js";
import { celebrate } from "../commun/fete.js";
import { counts, streakInfo } from "./accueil.js";

// [id, emoji, nom, description, mesure, objectif]
const TROPHIES = [
  ["s1", "👟", "Premier pas", "Ta première séance notée", "sessions", 1],
  ["s10", "💪", "Habitué", "10 séances", "sessions", 10],
  ["s25", "🔥", "Assidu", "25 séances", "sessions", 25],
  ["s50", "⚙️", "Machine", "50 séances", "sessions", 50],
  ["s100", "👑", "Légende", "100 séances", "sessions", 100],
  ["w2", "📅", "C'est lancé", "Objectif de la semaine atteint 2 semaines d'affilée", "streak", 2],
  ["w4", "🗓️", "Un mois sans lâcher", "4 semaines d'affilée", "streak", 4],
  ["w8", "🧱", "Discipline", "8 semaines d'affilée", "streak", 8],
  ["w12", "🚀", "Inarrêtable", "12 semaines d'affilée", "streak", 12],
  ["r1", "🏆", "Premier record", "Un record battu pendant une séance", "records", 1],
  ["r10", "🎯", "Chasseur de records", "10 records battus", "records", 10],
  ["r25", "💎", "Collectionneur", "25 records battus", "records", 25],
  ["d3", "🧭", "Touche-à-tout", "3 activités différentes pratiquées", "disc", 3],
  ["d5", "🌈", "Complet", `Les ${Object.keys(DISC).length} activités de l'app pratiquées`, "disc", Object.keys(DISC).length],
  ["k10", "🏃", "Premiers kilomètres", "10 km courus au total", "km", 10],
  ["k100", "🛣️", "Centurion", "100 km courus au total", "km", 100],
  ["t10", "🏋️", "10 tonnes", "10 tonnes soulevées au total en musculation", "tons", 10],
  ["t100", "🦍", "Titan", "100 tonnes soulevées au total", "tons", 100]
].map(([id, ico, name, desc, m, goal]) => ({ id, ico, name, desc, m, goal }));

function measures() {
  const ks = Object.keys(S.days).filter(k => counts(S.days[k]));
  return {
    sessions: ks.length,
    streak: streakInfo().best,
    records: ks.reduce((a, k) => a + (S.days[k].prs || []).length, 0),
    disc: new Set(ks.map(k => discOf(S.days[k]))).size,
    km: ks.reduce((a, k) => a + runKm(S.days[k]), 0),
    tons: ks.reduce((a, k) => a + dayVolume(S.days[k]), 0) / 1000
  };
}
const got = () => (S.profile && S.profile.trophies) || {};
function status() {
  const m = measures(), g = got();
  return TROPHIES.map(t => ({ ...t, v: m[t.m], on: !!g[t.id] || m[t.m] >= t.goal, at: g[t.id] || 0 }));
}
const mondayKey = () => { const d = new Date(); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return key(d); };

// À appeler quand les données changent. save = true après une saisie : les nouveautés sont fêtées ;
// sinon (chargement, autre appareil) elles sont seulement mémorisées. Tout premier passage : mémorisé sans fête.
export function checkTrophies(save) {
  if (!S.profile || !S.oldReady || !S.recentReady) return;
  const first = !S.profile.trophies, g = got(), now = Date.now();
  const fresh = status().filter(t => t.v >= t.goal && !g[t.id]);
  const st = streakInfo(), wk = mondayKey(), goalNew = st.thisWeek >= st.G && S.profile.goalWeek !== wk;
  if (!fresh.length && !goalNew && !first) return;
  const patch = {};
  if (fresh.length || first) patch.trophies = { ...g, ...Object.fromEntries(fresh.map(t => [t.id, now])) };
  if (goalNew) patch.goalWeek = wk;
  saveProfile(patch);
  if (!save || first) return;
  if (goalNew) celebrate(`<b>🎯 Objectif atteint !</b><span>${st.thisWeek} séance${st.thisWeek > 1 ? "s" : ""} cette semaine, bravo</span>`, "pr");
  fresh.forEach(t => celebrate(`<b>${t.ico} Trophée débloqué !</b><span>${esc(t.name)} · ${esc(t.desc)}</span>`, "pr"));
}

const fmtV = (t, v) => t.m === "km" || t.m === "tons" ? nf.format(Math.floor(v * 10) / 10) : String(Math.floor(v));
const unit = t => t.m === "km" ? " km" : t.m === "tons" ? " t" : t.m === "streak" ? " sem." : "";
// Bandeau de Let's go : trophées débloqués et le prochain à portée.
export function trophyStripHTML() {
  const list = status(), n = list.filter(t => t.on).length;
  const next = list.filter(t => !t.on).sort((a, b) => b.v / b.goal - a.v / a.goal)[0];
  return `<button class="trophy-strip" data-go="trophees"><span class="ts-ico" aria-hidden="true">🏅</span>
    <span class="ts-main"><b>Mes trophées · ${n}/${list.length}</b><span>${next ? `Prochain : ${next.ico} ${esc(next.name)} (${fmtV(next, next.v)}/${next.goal}${unit(next)})` : "Tous débloqués, respect !"}</span></span>
    <span class="arrow" aria-hidden="true">›</span></button>`;
}
export function renderTrophees() {
  const list = status(), n = list.filter(t => t.on).length;
  const date = ms => { const d = new Date(ms); return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }); };
  $("trophyBody").innerHTML = `<p class="hint" style="margin-top:-10px">${n} trophée${n > 1 ? "s" : ""} débloqué${n > 1 ? "s" : ""} sur ${list.length}. Chaque séance notée te rapproche du suivant.</p>
    <div class="trophy-grid">${list.map(t => `<div class="trophy${t.on ? " on" : ""}">
      <span class="tr-ico" aria-hidden="true">${t.ico}</span><b>${esc(t.name)}</b><span class="tr-desc">${esc(t.desc)}</span>
      ${t.on ? `<span class="tr-ok">✓ ${t.at ? "Débloqué le " + date(t.at) : "Débloqué"}</span>`
        : `<span class="tr-bar" role="img" aria-label="${fmtV(t, t.v)} sur ${t.goal}"><i style="width:${Math.min(100, Math.round(t.v / t.goal * 100))}%"></i></span><span class="tr-left">${fmtV(t, t.v)}/${t.goal}${unit(t)}</span>`}
    </div>`).join("")}</div>`;
}
