// Trophées : badges débloqués selon les séances (nombre, série de semaines, records, variété, course, volume),
// page « Mes trophées » (vitrine par famille, badges hexagonaux aux couleurs du thème), bandeau sur Let's go,
// et grand badge au centre de l'écran quand un trophée tombe ou que l'objectif de la semaine est atteint.
// Un trophée gagné reste gagné : il est mémorisé dans le profil (profile.trophies = { id: date }).
import { $, DISC, S, dayVolume, discOf, esc, key, nf, runKm } from "../commun/core.js";
import { saveProfile } from "../commun/store.js";
import { showBadge } from "../commun/fete.js";
import { counts, streakInfo } from "./accueil.js";
import { dateFormat, t } from "../commun/i18n.js";

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
  plate: '<path d="M9 8V6.5a3 3 0 0 1 6 0V8"/><path d="M6.5 8h11l2.5 13H4z"/>',
  mountain: '<path d="M3 20l6-10 4 6 3-4 5 8z"/>',
  wind: '<path d="M3 8h11a3 3 0 1 0-3-3M3 12h15a3 3 0 1 1-3 3M3 16h8"/>',
  pin: '<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  route: '<circle cx="6" cy="19" r="2"/><circle cx="18" cy="5" r="2"/><path d="M8 19h8a3 3 0 0 0 0-6H8a3 3 0 0 1 0-6h8"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  bar: '<path d="M2 12h20M5 8v8M8 6v12M16 6v12M19 8v8"/>',
  anvil: '<path d="M4 7h13a4 4 0 0 1-4 4h-2v4h2l2 4H6l2-4h1v-4H6a2 2 0 0 1-2-2z"/>',
  temple: '<path d="M4 21h16M6 21V10M10 21V10M14 21V10M18 21V10M3 10l9-6 9 6z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>'
};
const svg = (ico, cls = "hex-ic") => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICO[ico]}</svg>`;
const NDISC = Object.keys(DISC).length;
// Familles : [identifiant, trophées [id, icône, mesure, objectif]]. Noms et descriptions : « trophees.liste.<id> ».
const FAMILIES = [
  ["seances", [["s1", "flag", "sessions", 1], ["s10", "dumbbell", "sessions", 10], ["s25", "flame", "sessions", 25], ["s50", "bolt", "sessions", 50], ["s100", "crown", "sessions", 100]]],
  ["regularite", [["w2", "calCheck", "streak", 2], ["w4", "calLines", "streak", 4], ["w8", "shield", "streak", 8], ["w12", "rocket", "streak", 12]]],
  ["records", [["r1", "trophy", "records", 1], ["r10", "target", "records", 10], ["r25", "gem", "records", 25]]],
  ["variete", [["d3", "compass", "disc", 3], ["d5", "star", "disc", NDISC]]],
  ["course", [["k10", "runner", "km", 10], ["k25", "wind", "km", 25], ["k50", "pin", "km", 50], ["k100", "road", "km", 100], ["k200", "route", "km", 200], ["k500", "globe", "km", 500]]],
  ["volume", [["t10", "plate", "tons", 10], ["t25", "bar", "tons", 25], ["t50", "anvil", "tons", 50], ["t100", "mountain", "tons", 100], ["t200", "temple", "tons", 200], ["t500", "sun", "tons", 500]]]
].map(([id, list]) => ({ name: t("trophees.familles." + id), list: list.map(([tid, ico, m, goal]) => ({ id: tid, ico, name: t(`trophees.liste.${tid}.nom`), desc: t(`trophees.liste.${tid}.desc`, { n: goal }), m, goal })) }));
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
  TROPHIES.forEach(tr => { out[tr.id] = { ...tr, v: m[tr.m], on: !!g[tr.id] || m[tr.m] >= tr.goal, at: g[tr.id] || 0 }; });
  return out;
}
const mondayKey = () => { const d = new Date(); d.setDate(d.getDate() - (d.getDay() + 6) % 7); return key(d); };

// À appeler quand les données changent. save = true après une saisie : les nouveautés sont fêtées ;
// sinon (chargement, autre appareil) elles sont seulement mémorisées. Tout premier passage : mémorisé sans fête.
export function checkTrophies(save) {
  if (!S.profile || !S.oldReady || !S.recentReady) return;
  const first = !S.profile.trophies, g = got(), now = Date.now();
  const fresh = Object.values(statusMap()).filter(tr => tr.v >= tr.goal && !g[tr.id]);
  const st = streakInfo(), wk = mondayKey(), goalNew = st.thisWeek >= st.G && S.profile.goalWeek !== wk;
  if (!fresh.length && !goalNew && !first) return;
  const patch = {};
  if (fresh.length || first) patch.trophies = { ...g, ...Object.fromEntries(fresh.map(tr => [tr.id, now])) };
  if (goalNew) patch.goalWeek = wk;
  saveProfile(patch);
  if (!save || first) return;
  if (goalNew) showBadge({ ico: ICO.target, kicker: t("accueil.serie.objectif"), title: t("trophees.atteint"), sub: t("trophees.bravo", { n: st.thisWeek }) });
  fresh.forEach(tr => showBadge({ ico: ICO[tr.ico], kicker: t("trophees.debloque"), title: tr.name, sub: tr.desc }));
}

const fmtV = (tr, v) => tr.m === "km" || tr.m === "tons" ? nf.format(Math.floor(v * 10) / 10) : String(Math.floor(v));
const unit = tr => tr.m === "km" ? " km" : tr.m === "tons" ? " t" : tr.m === "streak" ? " " + t("trophees.semAbrege") : "";
const date = ms => dateFormat(ms, { day: "numeric", month: "short", year: "numeric" });
// Bandeau de Let's go : trophées débloqués et le prochain à portée.
export function trophyStripHTML() {
  const list = Object.values(statusMap()), n = list.filter(tr => tr.on).length;
  const next = list.filter(tr => !tr.on).sort((a, b) => b.v / b.goal - a.v / a.goal)[0];
  return `<button class="trophy-strip" data-go="trophees"><span class="hex on sm" aria-hidden="true">${svg("trophy")}</span>
    <span class="ts-main"><b>${t("trophees.bandeau", { n, total: list.length })}</b><span>${next ? esc(t("trophees.prochain", { nom: next.name, etat: `${fmtV(next, next.v)}/${next.goal}${unit(next)}` })) : t("trophees.tous")}</span></span>
    <span class="arrow" aria-hidden="true">›</span></button>`;
}
// Page « Mes trophées » : une vitrine par famille. Toucher un badge affiche son détail sous la rangée.
export function renderTrophees() {
  const st = statusMap(), n = Object.values(st).filter(tr => tr.on).length;
  $("trophyBody").innerHTML = `<p class="hint" style="margin-top:-10px">${t("trophees.intro", { n, total: TROPHIES.length })}</p>
    ${FAMILIES.map((f, fi) => {
      const l = f.list.map(tr => st[tr.id]), k = l.filter(tr => tr.on).length, next = l.find(tr => !tr.on);
      const sel = st[(S.trSel || {})[fi]] || next || l[l.length - 1];
      const detail = sel.on ? `<b>${esc(sel.name)}</b> · ${esc(sel.desc)}<span class="tf-ok">${esc(sel.at ? t("trophees.obtenuLe", { date: date(sel.at) }) : t("trophees.obtenu"))}</span>`
        : `<b>${esc(sel.name)}</b> · ${esc(sel.desc)}<span>${fmtV(sel, sel.v)} / ${sel.goal}${unit(sel)}</span>`;
      return `<section class="tfam"><div class="tfam-top"><span class="lbl">${esc(f.name)}</span><em>${k}/${l.length}</em></div>
        <div class="tfam-row${l.length === 6 ? " six" : ""}">${l.map(tr => `<button type="button" class="tbadge${tr.on ? " on" : ""}${tr === sel ? " sel" : ""}" data-trsel="${fi}:${tr.id}" aria-label="${esc(t(tr.on ? "trophees.ariaObtenu" : "trophees.ariaADebloquer", { nom: tr.name }))}">
          <span class="hex${tr.on ? " on" : ""}">${svg(tr.ico)}</span><span class="tb-n">${esc(tr.name)}</span></button>`).join("")}</div>
        <div class="tfam-detail">${detail}</div>
        ${!sel.on ? `<div class="tfam-bar" role="img" aria-label="${esc(t("trophees.ariaBarre", { v: fmtV(sel, sel.v), objectif: sel.goal }))}"><i style="width:${Math.min(100, Math.round(sel.v / sel.goal * 100))}%"></i></div>` : ""}
      </section>`;
    }).join("")}`;
}
$("trophyBody").addEventListener("click", e => {
  const b = e.target.closest("[data-trsel]"); if (!b) return;
  const [fi, id] = b.dataset.trsel.split(":"); S.trSel = { ...(S.trSel || {}), [fi]: id }; renderTrophees();
});
