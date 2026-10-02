// Social : page d'accueil (rubriques, activité sur mes séances, fil d'actualité).
import { $, S, ago, esc, parse, titleOf, todayK } from "../commun/core.js";
import { toast } from "../entrainement/index.js";
import { REACTS, SOC, dirOf, otherOf, socialCounts, who } from "../amis/index.js";
import { loadFeed } from "./fil.js";
import { lsGet, lsSet } from "../commun/install.js";
import { openDay, renderMain } from "../seances/index.js";
import { go, saveProfile } from "../commun/store.js";
import { t } from "../commun/i18n.js";

/* ============================================================
   Social : page d'accueil, activité, fil, commentaires, défis, classements
   ============================================================ */
export const acceptedFriends = () => Object.values(SOC.friends).filter(f => f.status === "accepted").map(otherOf);
export const seenAct = () => (S.profile && S.profile.seenAct) || 0;
// Réactions et commentaires des amis sur mes séances, du plus récent au plus ancien.
export function activityList() {
  const r = SOC.myReacts.filter(x => x.from !== S.uid).map(x => ({ kind: "react", ...x }));
  const c = (SOC.myComments || []).filter(x => x.from !== S.uid).map(x => ({ kind: "comment", ...x }));
  return [...r, ...c].filter(x => x.at).sort((a, b) => b.at - a.at);
}
function sessLabel(k) { const s = S.days[k]; return s ? titleOf(s) : t("social.taSeance"); }
export function bannedStop() { if (!S.banned) return false; toast(t("social.suspenduToast")); return true; }
export function renderSocial() {
  const c = socialCounts(), act = activityList().slice(0, 8), seen = seenAct(), fresh = act.filter(a => a.at > seen), nf2 = acceptedFriends().length;
  const live = (SOC.challenges || []).filter(ch => ch.end >= todayK()).length, newCh = newChallenges().length;
  const em = id => (REACTS.find(r => r[0] === id) || [, "👍"])[1];
  const pill = (v, ico, name, n, hot) => `<button class="soc-pill${hot ? " hot" : ""}" data-go="${v}"><span aria-hidden="true">${ico}</span>${name}${n ? ` <small>${n}</small>` : ""}${hot ? '<i class="dot-new"></i>' : ""}</button>`;
  const actHTML = l => `<div class="card" style="gap:0;padding-block:4px">${l.map(a => { const w = who(a.from, 36); return `<button type="button" class="frow act${a.at > seen ? " new" : ""}" data-actk="${esc(a.date)}">${w.av}<span class="main"><b>${esc(w.d.pseudo !== "…" ? w.d.pseudo : a.pseudo || t("social.unAmi"))}</b><span>${a.kind === "react" ? esc(t("social.aReagi", { emoji: em(a.emoji), seance: sessLabel(a.date) })) : esc(t("social.aCommente", { texte: a.text }))}</span></span><small>${esc(ago(a.at))}</small></button>`; }).join("")}</div>`;
  $("socMsgDot").hidden = !c.unread;
  $("socialBody").innerHTML = `${S.banned ? `<div class="card ban-card"><b>${t("social.suspendu")}</b><p class="hint">${t("social.suspenduTexte")}</p></div>` : ""}
    <nav class="soc-pills" aria-label="${esc(t("social.rubriques"))}">${pill("friends", "👥", t("amis.titre"), nf2, c.requests)}${pill("challenges", "⚔️", t("defis.titre"), live, newCh)}${pill("ranks", "🏅", t("social.classement"), 0, 0)}</nav>
    ${fresh.length ? `<section><h2 class="h2">${t("social.nouveau")}</h2>${actHTML(fresh)}</section>`
      : act.length ? `<details class="soc-act"><summary>${t("social.activite")}</summary>${actHTML(act)}</details>` : ""}
    <h2 class="h2" style="margin-bottom:-8px">${t("social.fil")}</h2>`;
  act.forEach(a => dirOf(a.from));
  if (act.length && act[0].at > seen) saveProfile({ seenAct: Date.now() });
  loadFeed(false);
}
$("socialBody").addEventListener("click", e => {
  const a = e.target.closest("[data-actk]"); if (!a) return;
  const k = a.dataset.actk; if (!S.days[k]) return;
  go("seances"); const d = parse(k); S.view = new Date(d.getFullYear(), d.getMonth(), 1); renderMain(); openDay(k);
});
// Défis où on m'a invité et que je n'ai pas encore ouverts.
function seenChs() { try { return JSON.parse(lsGet("ch-seen") || "[]"); } catch (e) { return []; } }
export function newChallenges() { const seen = seenChs(); return (SOC.challenges || []).filter(ch => ch.owner !== S.uid && ch.end >= todayK() && !seen.includes(ch.id)); }
export function markChallengesSeen() { const ids = (SOC.challenges || []).map(ch => ch.id); if (newChallenges().length) lsSet("ch-seen", JSON.stringify(ids.slice(-100))); }
