// Social : défis entre amis.
import { acceptedFriends, bannedStop, markChallengesSeen } from "./accueil.js";
import { myCommentsHTML } from "./commentaires.js";
import { $, S, addDoc, armed, arrayRemove, collection, dayOf, dayVolume, db, deleteDoc, doc, esc, key, limit, nf, onSnapshot, orderBy, parse, query, runKm, show, todayK, updateDoc, where } from "../commun/core.js";
import { toast } from "../entrainement/index.js";
import { SOC, dirOf, refreshSocial, reportContent } from "../amis/index.js";
import { addDays, counts } from "../pages/accueil.js";
import { shortDate } from "../idees/index.js";
import { go } from "../commun/store.js";

/* ---------- Défis entre amis ---------- */
const METRICS = { seances: ["Séances", v => v > 1 ? "séances" : "séance", v => String(v)], jours: ["Jours actifs", v => v > 1 ? "jours" : "jour", v => String(v)], km: ["Km courus", () => "km", v => nf.format(v)], volume: ["Volume soulevé", () => "t", v => nf.format(Math.round(v / 100) / 10)] };
function myScore(ch) {
  const ks = Object.keys(S.days).filter(k => dayOf(k) >= ch.start && dayOf(k) <= ch.end && counts(S.days[k]));
  if (ch.metric === "seances") return ks.length;
  if (ch.metric === "jours") return new Set(ks.map(dayOf)).size;
  if (ch.metric === "km") return Math.round(ks.reduce((a, k) => a + runKm(S.days[k]), 0) * 10) / 10;
  return Math.round(ks.reduce((a, k) => a + dayVolume(S.days[k]), 0));
}
let chTimer = null;
export function syncChallenges() {
  if (!S.oldReady) return;
  clearTimeout(chTimer);
  chTimer = setTimeout(() => (SOC.challenges || []).forEach(ch => {
    if (ch.end < key(addDays(new Date(), -2))) return;
    const v = myScore(ch);
    if ((ch.scores || {})[S.uid] !== v) updateDoc(doc(db, "challenges", ch.id), { ["scores." + S.uid]: v }).catch(() => {});
  }), 1500);
}
export function subscribeChallenges() {
  S.unsubs.push(onSnapshot(query(collection(db, "challenges"), where("members", "array-contains", S.uid)), snap => {
    SOC.challenges = snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => a.end < b.end ? 1 : -1);
    syncChallenges(); refreshSocial();
    if (S.screen === "challenges") renderChallenges();
    if (S.screen === "challenge") renderChallenge();
  }, () => {}));
  S.unsubs.push(onSnapshot(query(collection(db, "comments", S.uid, "items"), orderBy("at", "desc"), limit(100)), snap => {
    SOC.myComments = snap.docs.map(d => ({ id: d.id, owner: S.uid, ...d.data() }));
    SOC.myComments.forEach(c => dirOf(c.from));
    refreshSocial(); if (S.open) { const el = $("myComments"); if (el) el.innerHTML = myCommentsHTML(S.open); }
  }, () => {}));
}
const daysLeft = ch => Math.round((parse(ch.end) - parse(todayK())) / 864e5);
function ranking(ch) { return (ch.members || []).map(u => ({ u, v: (ch.scores || {})[u] || 0, name: u === S.uid ? "Toi" : (SOC.dir[u] || {}).pseudo || (ch.names || {})[u] || "Ami" })).sort((a, b) => b.v - a.v); }
export function renderChallenges() {
  markChallengesSeen();
  const all = SOC.challenges || [], live = all.filter(c => c.end >= todayK()), done = all.filter(c => c.end < todayK()), fr = acceptedFriends(), NC = SOC.newCh;
  const card = ch => { const r = ranking(ch), me = r.findIndex(x => x.u === S.uid), m = METRICS[ch.metric] || METRICS.seances, dl = daysLeft(ch);
    return `<button class="menu-card" data-chopen="${ch.id}"><span class="mark${me === 0 ? " ok" : ""}">${me === 0 ? "🥇" : me + 1}</span><span class="mc"><b>${esc(ch.name)}</b><span class="s">${esc(m[0])} · ${r.length} participant${r.length > 1 ? "s" : ""} · ${dl > 0 ? dl + " jour" + (dl > 1 ? "s" : "") + " restant" + (dl > 1 ? "s" : "") : dl === 0 ? "dernier jour !" : "terminé"}</span></span><span class="arrow" aria-hidden="true">›</span></button>`; };
  $("chBody").innerHTML = `${NC ? `<form class="card" id="chForm" autocomplete="off">
      <div class="lbl">Nouveau défi</div>
      <div class="field"><span>Ce qu’on compte</span><div class="chips">${Object.entries(METRICS).map(([id, m]) => `<button type="button" class="chip" data-chm="${id}" style="--tc:var(--red)" aria-pressed="${NC.metric === id}">${m[0]}</button>`).join("")}</div></div>
      <div class="field"><span>Durée (à partir d’aujourd’hui)</span><div class="chips">${[[7, "1 semaine"], [14, "2 semaines"], [30, "1 mois"]].map(([d, n]) => `<button type="button" class="chip" data-chd="${d}" style="--tc:var(--red)" aria-pressed="${NC.days === d}">${n}</button>`).join("")}</div></div>
      <label class="field"><span>Nom du défi</span><input id="chName" maxlength="60" value="${esc(NC.name)}" placeholder="${esc(chPlaceholder(NC))}"></label>
      <div class="field"><span>Amis invités</span>${fr.length ? `<div class="chips">${fr.map(u => `<button type="button" class="chip" data-chf="${u}" style="--tc:var(--red)" aria-pressed="${NC.friends.includes(u)}">${esc((SOC.dir[u] || {}).pseudo || "…")}</button>`).join("")}</div>` : `<p class="hint">Ajoute d’abord des amis pour les défier.</p>`}</div>
      <p class="err" id="chErr" hidden></p>
      <div class="grid2"><button type="button" class="btn" data-chcancel="1">Annuler</button><button class="btn primary" type="submit">Lancer le défi</button></div>
    </form>` : `<button class="btn primary" data-chnew="1">+ Nouveau défi</button>`}
    <section><h2 class="h2">En cours</h2>${live.length ? `<div class="menu">${live.map(card).join("")}</div>` : `<div class="empty">Aucun défi en cours. Lance-en un contre tes amis : séances, km, volume…</div>`}</section>
    ${done.length ? `<section><h2 class="h2">Terminés</h2><div class="menu">${done.slice(0, 10).map(card).join("")}</div></section>` : ""}`;
}
function chPlaceholder(nc) { return { seances: "Le plus de séances", jours: "Le plus de jours actifs", km: "Le plus de km", volume: "Le plus gros volume" }[nc.metric] + (nc.days === 7 ? " de la semaine" : nc.days === 30 ? " du mois" : " en 2 semaines"); }
$("chBody").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  const NC = SOC.newCh;
  if (b.dataset.chnew) { SOC.newCh = { metric: "seances", days: 7, name: "", friends: [] }; renderChallenges(); return; }
  if (b.dataset.chcancel) { SOC.newCh = null; renderChallenges(); return; }
  if (NC && b.dataset.chm) { NC.name = $("chName").value; NC.metric = b.dataset.chm; renderChallenges(); return; }
  if (NC && b.dataset.chd) { NC.name = $("chName").value; NC.days = +b.dataset.chd; renderChallenges(); return; }
  if (NC && b.dataset.chf) { NC.name = $("chName").value; const u = b.dataset.chf; NC.friends = NC.friends.includes(u) ? NC.friends.filter(x => x !== u) : [...NC.friends, u]; renderChallenges(); return; }
  if (b.dataset.chopen) { SOC.chId = b.dataset.chopen; go("challenge"); }
});
$("chBody").addEventListener("submit", async e => {
  e.preventDefault(); const NC = SOC.newCh; if (!NC) return;
  if (bannedStop()) return;
  if (!NC.friends.length) { show($("chErr"), "Invite au moins un ami."); return; }
  const members = [S.uid, ...NC.friends].slice(0, 20), names = {};
  members.forEach(u => { names[u] = u === S.uid ? S.profile.pseudo : (SOC.dir[u] || {}).pseudo || "Ami"; });
  const data = { name: ($("chName").value.trim() || chPlaceholder(NC)).slice(0, 60), metric: NC.metric, start: todayK(), end: key(addDays(new Date(), NC.days - 1)), owner: S.uid, members, names, scores: {}, at: Date.now() };
  data.scores[S.uid] = myScore(data);
  try { const ref = await addDoc(collection(db, "challenges"), data); SOC.newCh = null; SOC.chId = ref.id; toast("🏁 Défi lancé !"); go("challenge"); }
  catch (x) { show($("chErr"), "Impossible de créer le défi. Vérifie ta connexion."); }
});
export function renderChallenge() {
  const ch = (SOC.challenges || []).find(c => c.id === SOC.chId); if (!ch) { $("chdBody").innerHTML = `<p class="hint">Chargement…</p>`; return; }
  const m = METRICS[ch.metric] || METRICS.seances, r = ranking(ch), max = Math.max(1, ...r.map(x => x.v)), dl = daysLeft(ch);
  $("chdTitle").textContent = ch.name;
  $("chdBody").innerHTML = `<p class="hint" style="margin-top:-10px">${esc(m[0])} · du ${esc(shortDate(ch.start))} au ${esc(shortDate(ch.end))} · ${dl > 0 ? dl + " jour" + (dl > 1 ? "s" : "") + " restant" + (dl > 1 ? "s" : "") : dl === 0 ? "dernier jour !" : "terminé"}</p>
    <section class="card"><div class="lbl">Classement</div>
      ${r.map((x, i) => `<div class="rank-row${x.u === S.uid ? " me" : ""}"><span class="rk">${["🥇", "🥈", "🥉"][i] || i + 1}</span><span class="main"><b>${esc(x.name)}</b><span class="track"><span class="fill" style="width:${x.v / max * 100}%"></span></span></span><b class="rv">${esc(m[2](x.v))} <small>${esc(m[1](x.v))}</small></b></div>`).join("")}
      <p class="hint">Les scores se mettent à jour quand chacun ouvre l’app.</p>
    </section>
    ${ch.owner === S.uid ? `<button class="danger" data-chdel="1">Supprimer le défi</button>` : `<div class="grid2"><button class="btn ghost-danger" data-chrep="1">⚑ Signaler</button><button class="btn ghost-danger" data-chleave="1">Quitter le défi</button></div>`}`;
  (ch.members || []).forEach(u => { if (!SOC.dir[u] && u !== S.uid) dirOf(u).then(() => { if (S.screen === "challenge") renderChallenge(); }); });
}
$("chdBody").addEventListener("click", async e => {
  const b = e.target.closest("button"); if (!b) return;
  const ch = (SOC.challenges || []).find(c => c.id === SOC.chId); if (!ch) return;
  if (b.dataset.chdel) { if (!armed(b, "Toucher à nouveau pour supprimer")) return; await deleteDoc(doc(db, "challenges", ch.id)).catch(() => {}); go("challenges"); }
  if (b.dataset.chrep) {
    if (!armed(b, "Confirmer")) return;
    try { await reportContent({ target: ch.owner, targetPseudo: (ch.names || {})[ch.owner] || "", kind: "challenge", text: "Défi « " + ch.name + " »", ref: "challenges/" + ch.id }); b.textContent = "Signalé ✓"; b.disabled = true; }
    catch (x) { toast("Signalement impossible. Réessaie."); }
    return;
  }
  if (b.dataset.chleave) { if (!armed(b, "Toucher à nouveau pour quitter")) return; await updateDoc(doc(db, "challenges", ch.id), { members: arrayRemove(S.uid) }).catch(() => {}); go("challenges"); }
});
