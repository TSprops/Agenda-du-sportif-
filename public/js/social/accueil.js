// Social : page d'accueil (activité, réactions reçues, nouveaux défis).
import { $, S, ago, esc, parse, plural, titleOf, todayK } from "../commun/core.js";
import { toast } from "../entrainement/index.js";
import { REACTS, SOC, dirOf, otherOf, socialCounts, who } from "../amis/index.js";
import { lsGet, lsSet } from "../commun/install.js";
import { openDay, renderMain } from "../seances/index.js";
import { go, saveProfile } from "../commun/store.js";

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
function sessLabel(k) { const s = S.days[k]; return s ? titleOf(s) : "ta séance"; }
const BANNED_MSG = "Ton compte est suspendu des fonctions sociales suite à des signalements. Pour en parler, écris depuis la page Contact.";
export function bannedStop() { if (!S.banned) return false; toast("⛔ Compte suspendu des fonctions sociales"); return true; }
export function renderSocial() {
  const c = socialCounts(), act = activityList().slice(0, 8), seen = seenAct(), nf2 = acceptedFriends().length;
  const live = (SOC.challenges || []).filter(ch => ch.end >= todayK()).length, newCh = newChallenges().length;
  const em = id => (REACTS.find(r => r[0] === id) || [, "👍"])[1];
  $("socialBody").innerHTML = `${S.banned ? `<div class="card ban-card"><b>⛔ Compte suspendu</b><p class="hint">${BANNED_MSG}</p></div>` : ""}<div class="menu">
      <button class="menu-card" data-go="feed"><span class="mark ok">≡</span><span class="mc"><b>Fil d’actu</b><span class="s">Les dernières séances de tes amis</span></span><span class="arrow" aria-hidden="true">›</span></button>
      <button class="menu-card${c.requests ? " hot" : ""}" data-go="friends"><span class="mark${c.requests ? " ok" : ""}">${nf2}</span><span class="mc"><b>Amis ${c.requests ? '<i class="dot-new"></i>' : ""}</b><span class="s">${c.requests ? plural(c.requests, "demande") + " d’ami en attente" : "Ajoute tes potes, vois leurs séances"}</span></span><span class="arrow" aria-hidden="true">›</span></button>
      <button class="menu-card${c.unread ? " hot" : ""}" data-go="messages"><span class="mark${c.unread ? " ok" : ""}">${c.unread || "✉"}</span><span class="mc"><b>Messages ${c.unread ? '<i class="dot-new"></i>' : ""}</b><span class="s">${c.unread ? plural(c.unread, "conversation") + " en attente de réponse" : "Tes conversations avec tes amis"}</span></span><span class="arrow" aria-hidden="true">›</span></button>
      <button class="menu-card${newCh ? " hot" : ""}" data-go="challenges"><span class="mark${live ? " ok" : ""}">${live}</span><span class="mc"><b>Défis ${newCh ? '<i class="dot-new"></i>' : ""}</b><span class="s">${newCh ? plural(newCh, "nouveau défi") + " pour toi !" : live ? plural(live, "défi") + " en cours" : "Qui fera le plus de séances ce mois-ci ?"}</span></span><span class="arrow" aria-hidden="true">›</span></button>
      <button class="menu-card" data-go="ranks"><span class="mark">🏆</span><span class="mc"><b>Classements</b><span class="s">Records et chiffres du mois entre amis</span></span><span class="arrow" aria-hidden="true">›</span></button>
    </div>
    <section><h2 class="h2">Activité sur tes séances</h2>
    ${act.length ? `<div class="card" style="gap:0;padding-block:4px">${act.map(a => { const w = who(a.from, 36); return `<button type="button" class="frow act${a.at > seen ? " new" : ""}" data-actk="${esc(a.date)}">${w.av}<span class="main"><b>${esc(w.d.pseudo !== "…" ? w.d.pseudo : a.pseudo || "Un ami")}</b><span>${a.kind === "react" ? "a réagi " + em(a.emoji) + " à " + esc(sessLabel(a.date)) : "a commenté : « " + esc(a.text) + " »"}</span></span><small>${esc(ago(a.at))}</small></button>`; }).join("")}</div>`
      : `<div class="empty">Quand tes amis réagiront ou commenteront tes séances, tu le verras ici.</div>`}</section>`;
  act.forEach(a => dirOf(a.from));
  if (act.length && act[0].at > seen) saveProfile({ seenAct: Date.now() });
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
