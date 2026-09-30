// Trophées : badges débloqués selon les séances (nombre, série de semaines, records, variété, course, volume),
// page « Mes trophées » (vitrine par famille, badges hexagonaux aux couleurs du thème), bandeau sur Let's go,
// et grand badge au centre de l'écran quand un trophée tombe ou que l'objectif de la semaine est atteint.
// Un trophée gagné reste gagné : il est mémorisé dans le profil (profile.trophies = { id: date }).
import { $, DISC, S, dayVolume, discOf, esc, key, nf, runKm } from "../commun/core.js";
import { saveProfile } from "../commun/store.js";
import { showBadge } from "../commun/fete.js";
import { counts, streakInfo } from "./accueil.js";

// Icônes au trait (même style que les tuiles de Let's go).
const ICO = {
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  dumbbell: '<path d="M6 7v10M18 7v10M3 9.5v5M21 9.5v5M6 12h12"/>',
  flame: '<path d="M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-3 2-4 2-6 1 1 1.5 2 1.5 3 1-2 1.5-4 1.5-7z"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  crown: '<path d="M3 8l4 4 5-7 5 7 4-4-2 11H5z"/>',
  calCheck: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4M9 15l2 2 4-4"/>',
  calLines: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4M8 14h8M8 17.5h5"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>',
  rocket: '<path d="M14 4c3-1 5-1 6 0 1 1 1 3 0 6l-7 7-6-6z"/><path d="M7 11l-3 1 3 3M13 17l-1 3-3-3M15 9h.01"/>',
  trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.2"/>',
  gem: '<path d="M6 3h12l3 6-9 12L3 9z"/><path d="M3 9h18M9 3l3 18 3-18"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  star: '<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4l-5.3 3 1.2-6-4.5-4.1 6-.7z"/>',
  runner: '<circle cx="14.5" cy="4.5" r="2"/><path d="M7 21l3.5-6 3 2.5V22M5.5 11.5l3.5-3 4 1 2.5 3.5h3.5M10.5 15l-1.5-4"/>',
  road: '<path d="M8 3L4 21M16 3l4 18M12 5v2M12 11v2M12 17v2"/>',
  plate: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1.2"/>',
  mountain: '<path d="M3 20l6-10 4 6 3-4 5 8z"/>'
};
const svg = (ico, cls = "hex-ic") => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICO[ico]}</svg>`;
const NDISC = Object.keys(DISC).length;
// Familles : [nom, trophées [id, icône, nom, description, mesure, objectif]]
const FAMILIES = [
  ["Séances", [["s1", "flag", "Premier pas", "Ta première séance notée", "sessions", 1], ["s10", "dumbbell", "Habitué", "10 séances", "sessions", 10],
    ["s25", "flame", "Assidu", "25 séances", "sessions", 25], ["s50", "bolt", "Machine", "50 séances", "sessions", 50], ["s100", "crown", "Légende", "100 séances", "sessions", 100]]],
  ["Régularité", [["w2", "calCheck", "C'est lancé", "Objectif de la semaine atteint 2 semaines d'affilée", "streak", 2], ["w4", "calLines", "Un mois", "4 semaines d'affilée", "streak", 4],
    ["w8", "shield", "Discipline", "8 semaines d'affilée", "streak", 8], ["w12", "rocket", "Inarrêtable", "12 semaines d'affilée", "streak", 12]]],
  ["Records", [["r1", "trophy", "Premier record", "Un record battu pendant une séance", "records", 1], ["r10", "target", "Chasseur", "10 records battus", "records", 10],
    ["r25", "gem", "Collectionneur", "25 records battus", "records", 25]]],
  ["Variété", [["d3", "compass", "Touche-à-tout", "3 activités différentes pratiquées", "disc", 3], ["d5", "star", "Complet", `Les ${NDISC} activités de l'app pratiquées`, "disc", NDISC]]],
  ["Course", [["k10", "runner", "Premiers km", "10 km courus au total", "km", 10], ["k100", "road", "Centurion", "100 km courus au total", "km", 100]]],
  ["Volume", [["t10", "plate", "10 tonnes", "10 tonnes soulevées au total en musculation", "tons", 10], ["t100", "mountain", "Titan", "100 tonnes soulevées au total", "tons", 100]]]
].map(([name, list]) => ({ name, list: list.map(([id, ico, n, desc, m, goal]) => ({ id, ico, name: n, desc, m, goal })) }));
const TROPHIES = FAMILIES.flatMap(f => f.list);

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
function statusMap() {
  const m = measures(), g = got(), out = {};
  TROPHIES.forEach(t => { out[t.id] = { ...t, v: m[t.m], on: !!g[t.id] || m[t.m] >= t.goal, at: g[t.id] || 0 }; });
  return out;
}
const mondayKey = () => { const d = new Date(); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return key(d); };

// À appeler quand les données changent. save = true après une saisie : les nouveautés sont fêtées ;
// sinon (chargement, autre appareil) elles sont seulement mémorisées. Tout premier passage : mémorisé sans fête.
export function checkTrophies(save) {
  if (!S.profile || !S.oldReady || !S.recentReady) return;
  const first = !S.profile.trophies, g = got(), now = Date.now();
  const fresh = Object.values(statusMap()).filter(t => t.v >= t.goal && !g[t.id]);
  const st = streakInfo(), wk = mondayKey(), goalNew = st.thisWeek >= st.G && S.profile.goalWeek !== wk;
  if (!fresh.length && !goalNew && !first) return;
  const patch = {};
  if (fresh.length || first) patch.trophies = { ...g, ...Object.fromEntries(fresh.map(t => [t.id, now])) };
  if (goalNew) patch.goalWeek = wk;
  saveProfile(patch);
  if (!save || first) return;
  if (goalNew) showBadge({ ico: ICO.target, kicker: "Objectif de la semaine", title: "Atteint !", sub: `${st.thisWeek} séance${st.thisWeek > 1 ? "s" : ""} cette semaine, bravo.` });
  fresh.forEach(t => showBadge({ ico: ICO[t.ico], kicker: "Trophée débloqué", title: t.name, sub: t.desc }));
}

const fmtV = (t, v) => t.m === "km" || t.m === "tons" ? nf.format(Math.floor(v * 10) / 10) : String(Math.floor(v));
const unit = t => t.m === "km" ? " km" : t.m === "tons" ? " t" : t.m === "streak" ? " sem." : "";
const date = ms => new Date(ms).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
// Bandeau de Let's go : trophées débloqués et le prochain à portée.
export function trophyStripHTML() {
  const list = Object.values(statusMap()), n = list.filter(t => t.on).length;
  const next = list.filter(t => !t.on).sort((a, b) => b.v / b.goal - a.v / a.goal)[0];
  return `<button class="trophy-strip" data-go="trophees"><span class="hex on sm" aria-hidden="true">${svg("trophy")}</span>
    <span class="ts-main"><b>Mes trophées · ${n}/${list.length}</b><span>${next ? `Prochain : ${esc(next.name)} (${fmtV(next, next.v)}/${next.goal}${unit(next)})` : "Tous débloqués, respect !"}</span></span>
    <span class="arrow" aria-hidden="true">›</span></button>`;
}
// Page « Mes trophées » : une vitrine par famille. Toucher un badge affiche son détail sous la rangée.
export function renderTrophees() {
  const st = statusMap(), n = Object.values(st).filter(t => t.on).length;
  $("trophyBody").innerHTML = `<p class="hint" style="margin-top:-10px">${n} débloqué${n > 1 ? "s" : ""} sur ${TROPHIES.length}, rangés par famille. Touche un badge pour le détail.</p>
    ${FAMILIES.map((f, fi) => {
      const l = f.list.map(t => st[t.id]), k = l.filter(t => t.on).length, next = l.find(t => !t.on);
      const sel = st[(S.trSel || {})[fi]] || next || l[l.length - 1];
      const detail = sel.on ? `<b>${esc(sel.name)}</b> · ${esc(sel.desc)}<span class="tf-ok">Obtenu${sel.at ? " le " + esc(date(sel.at)) : ""}</span>`
        : `<b>${esc(sel.name)}</b> · ${esc(sel.desc)}<span>${fmtV(sel, sel.v)} / ${sel.goal}${unit(sel)}</span>`;
      return `<section class="tfam"><div class="tfam-top"><span class="lbl">${esc(f.name)}</span><em>${k}/${l.length}</em></div>
        <div class="tfam-row">${l.map(t => `<button type="button" class="tbadge${t.on ? " on" : ""}${t === sel ? " sel" : ""}" data-trsel="${fi}:${t.id}" aria-label="${esc(t.name)} : ${t.on ? "obtenu" : "à débloquer"}">
          <span class="hex${t.on ? " on" : ""}">${svg(t.ico)}</span><span class="tb-n">${esc(t.name)}</span></button>`).join("")}</div>
        <div class="tfam-detail">${detail}</div>
        ${!sel.on ? `<div class="tfam-bar" role="img" aria-label="${fmtV(sel, sel.v)} sur ${sel.goal}"><i style="width:${Math.min(100, Math.round(sel.v / sel.goal * 100))}%"></i></div>` : ""}
      </section>`;
    }).join("")}`;
}
$("trophyBody").addEventListener("click", e => {
  const b = e.target.closest("[data-trsel]"); if (!b) return;
  const [fi, id] = b.dataset.trsel.split(":"); S.trSel = { ...(S.trSel || {}), [fi]: id }; renderTrophees();
});
