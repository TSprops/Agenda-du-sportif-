// Administration : statistiques, utilisateurs, messages, signalements et modération.
import { $, DAYS, DEFAULT_TYPES, S, TYPES_V, ago, armed, avatarHTML, dayMeta, db, deleteDoc, doc, esc, fmtDate, getDocs,
  nameColor, nf, parse, plural, setDoc, titleOf, updateDoc } from "./core.js";
import { go, subCol } from "./store.js";
import { sessionSummary } from "./seances/index.js";
import { MONTHS_S } from "./ideas.js";
import { lsGet } from "./install.js";
import { toast } from "./entrainement/index.js";
import { adminBackup } from "./extras.js";

/* ============================================================
   Administration
   ============================================================ */
function renderAdmin() {
  if (!S.admin) { $("adminBody").innerHTML = `<p class="hint">Accès réservé à l’administrateur.</p>`; return; }
  const M = Object.values(S.members).filter(m => m.pseudo).sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0));
  const week = Date.now() - 7 * 864e5, active = M.filter(m => (m.lastSeen || 0) >= week).length;
  const totalS = M.reduce((a, m) => a + ((m.stats && m.stats.seances) || 0), 0), totalV = M.reduce((a, m) => a + (m.visits || 0), 0);
  const byType = {}; M.forEach(m => Object.entries((m.stats && m.stats.byType) || {}).forEach(([k, v]) => { byType[k] = (byType[k] || 0) + v; }));
  const maxT = Math.max(1, ...Object.values(byType));
  const colorOf = nameColor;
  const msgs = S.messages, unread = msgs.filter(m => !m.lu).length;
  const lb = +(lsGet("last-backup") || 0);
  $("adminBody").innerHTML = `<div style="display:flex;flex-direction:column;gap:22px">
  <section class="card"><div class="lbl">Sauvegarde</div>
    <p class="hint">Télécharge une copie de toute la base (profils, séances, nutrition, sans les photos). À faire environ une fois par mois et à garder dans Fichiers ou iCloud. ${lb ? "Dernière sauvegarde : " + esc(fmtDate(lb)) + "." : "Aucune sauvegarde faite depuis cet appareil."}</p>
    <button class="btn" data-backup="1">💾 Sauvegarde complète</button></section>
  <div class="stats" style="grid-template-columns:repeat(2,1fr)">
    <div class="stat"><b>${M.length}</b><span>utilisateurs inscrits</span></div>
    <div class="stat"><b>${active}</b><span>actifs ces 7 derniers jours</span></div>
    <div class="stat"><b>${totalS}</b><span>séances enregistrées</span></div>
    <div class="stat"><b>${totalV}</b><span>visites au total</span></div>
  </div>
  <section><h2 class="h2">Séances par type</h2><div class="card bars">${Object.keys(byType).length ? Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([n, v]) => `<div class="barrow" style="--tc:${colorOf(n)}"><span>${esc(n)}</span><span class="track"><span class="fill" style="display:block;width:${Math.round(v / maxT * 100)}%"></span></span><b>${v}</b></div>`).join("") : `<p class="hint">Aucune séance enregistrée pour l’instant.</p>`}</div></section>
  <section><h2 class="h2">Utilisateurs · ${M.length}</h2><div class="card" style="gap:0;padding-block:4px">${M.length ? M.map(m => `<button class="urow" data-uid="${esc(m.id)}">${avatarHTML(m, 42)}<span class="main"><b>${esc(m.pseudo)}${m.id === S.uid ? ' <span class="tag done">toi</span>' : ""}</b><span>Vu ${esc(ago(m.lastSeen))} · ${plural((m.stats && m.stats.seances) || 0, "séance")} · ${plural(m.visits || 0, "visite")}</span></span><span class="arrow" aria-hidden="true">›</span></button>`).join("") : `<p class="hint" style="padding-block:12px">Personne ne s’est encore inscrit.</p>`}</div></section>
  <section><h2 class="h2">Signalements · ${(S.reports || []).length}</h2><div class="card" style="gap:0;padding-block:4px">${(S.reports || []).length ? S.reports.map(reportHTML).join("") : `<p class="hint" style="padding-block:12px">Aucun signalement.</p>`}</div></section>
  <section><h2 class="h2">Messages reçus · ${unread} non lu${unread > 1 ? "s" : ""}</h2><div class="card" style="gap:0;padding-block:4px">${msgs.length ? msgs.map(m => `<div class="msg"><div class="msg-top"><span class="tag${m.lu ? " done" : ""}">${esc(m.objet)}</span><b>${esc(m.pseudo || "Utilisateur")}</b><small>${esc(fmtDate(m.at))}</small></div><p>${esc(m.texte)}</p>${m.email ? `<small>Répondre à : <span style="user-select:all;color:var(--ink)">${esc(m.email)}</span></small>` : ""}<button class="icon-btn" style="align-self:flex-start" data-mid="${esc(m.id)}">${m.lu ? "Marquer non lu" : "Marquer comme lu"}</button></div>`).join("") : `<p class="hint" style="padding-block:12px">Aucun message pour l’instant.</p>`}</div></section>
  </div>`;
}
const REPORT_KINDS = { message: "Message", conversation: "Conversation", comment: "Commentaire", profile: "Profil", challenge: "Défi" };
function reportHTML(r) {
  const banned = !!(S.bans || {})[r.target], canDel = r.ref && ["message", "comment", "challenge"].includes(r.kind);
  return `<div class="msg"><div class="msg-top"><span class="tag">${esc(REPORT_KINDS[r.kind] || "Signalement")}</span><b>${esc(r.targetPseudo || "?")}</b>${banned ? '<span class="tag done">Banni</span>' : ""}<small>signalé par ${esc(r.fromPseudo || "?")} · ${esc(fmtDate(r.at))}</small></div><p>${esc(r.text)}</p>
    <div class="mod-actions">${canDel ? `<button class="icon-btn" data-repdel="${esc(r.id)}">🗑 Supprimer le contenu</button>` : ""}${r.kind === "profile" && r.target ? `<button class="icon-btn" data-dirdel="${esc(r.target)}">Retirer de la recherche</button>` : ""}${r.target ? `<button class="icon-btn" data-ban="${esc(r.target)}" data-banp="${esc(r.targetPseudo || "")}">${banned ? "Débannir" : "⛔ Bannir"}</button>` : ""}<button class="icon-btn" data-repdone="${esc(r.id)}">✓ Traité</button></div></div>`;
}
// Bannir : l'utilisateur ne peut plus rien publier (amis, messages, commentaires, réactions, défis).
async function toggleBan(uid, pseudo) {
  try {
    if ((S.bans || {})[uid]) await deleteDoc(doc(db, "bans", uid));
    else await setDoc(doc(db, "bans", uid), { at: Date.now(), by: S.uid, pseudo: pseudo || (S.members[uid] || {}).pseudo || "" });
  } catch (x) { toast("Action impossible. Vérifie les règles Firebase."); }
}
document.addEventListener("click", async e => {
  const b = e.target.closest("[data-ban]"); if (!b || !S.admin) return;
  if (!armed(b, "Confirmer")) return;
  await toggleBan(b.dataset.ban, b.dataset.banp); if (S.screen === "auser") openUser(b.dataset.ban);
});
$("adminBody").addEventListener("click", async e => {
  const u = e.target.closest("[data-uid]"); if (u) { openUser(u.dataset.uid); return; }
  const bk = e.target.closest("[data-backup]"); if (bk) { adminBackup(bk); return; }
  const rdel = e.target.closest("[data-repdel]");
  if (rdel) {
    if (!armed(rdel, "Confirmer")) return;
    const r = (S.reports || []).find(x => x.id === rdel.dataset.repdel); if (!r || !r.ref) return;
    try { await deleteDoc(doc(db, ...r.ref.split("/"))); await deleteDoc(doc(db, "reports", r.id)); toast("🗑 Contenu supprimé"); } catch (x) { toast("Suppression impossible. Vérifie les règles Firebase."); }
    return;
  }
  const dd = e.target.closest("[data-dirdel]");
  if (dd) { if (!armed(dd, "Confirmer")) return; deleteDoc(doc(db, "directory", dd.dataset.dirdel)).then(() => toast("Profil retiré de la recherche"), () => toast("Action impossible.")); return; }
  const rd = e.target.closest("[data-repdone]"); if (rd) { if (!armed(rd, "Confirmer")) return; deleteDoc(doc(db, "reports", rd.dataset.repdone)).catch(() => {}); return; }
  const r = e.target.closest("[data-mid]"); if (!r) return;
  const m = S.messages.find(x => x.id === r.dataset.mid); if (!m) return;
  updateDoc(doc(db, "messages", m.id), { lu: !m.lu }).catch(() => {});
});
async function openUser(uid) {
  go("auser");
  const m = S.members[uid] || {};
  $("auserBody").innerHTML = `<p class="hint">Chargement…</p>`;
  let seances = [], nut = 0;
  try {
    const [ss, ns] = await Promise.all([getDocs(subCol("seances", uid)), getDocs(subCol("nutrition", uid))]);
    seances = ss.docs.map(d => ({ k: d.id, ...d.data() })).sort((a, b) => a.k < b.k ? 1 : -1); nut = ns.size;
  } catch (x) { /* affichage partiel */ }
  const types = (m.typesV === TYPES_V && Array.isArray(m.types)) ? m.types : DEFAULT_TYPES, st = m.stats || {};
  const kv = [["Pseudo", m.pseudo], ["E-mail", m.email], ["Prénom", m.prenom], ["Nom", m.nom], ["Âge", m.age ? m.age + " ans" : ""], ["Taille", m.taille ? m.taille + " cm" : ""], ["Poids", m.poids ? m.poids + " kg" : ""], ["Objectif", m.objectif], ["Inscrit le", m.createdAt ? fmtDate(m.createdAt) : ""], ["Dernière visite", ago(m.lastSeen)], ["Visites", m.visits], ["Volume total", st.volume ? nf.format(st.volume) + " kg" : ""], ["Distance courue", st.km ? nf.format(st.km) + " km" : ""], ["Photos", st.photos]].filter(x => x[1] !== undefined && x[1] !== "" && x[1] !== null);
  $("auserBody").innerHTML = `<div style="display:flex;flex-direction:column;gap:20px">
   <div style="display:flex;align-items:center;gap:14px">${avatarHTML(m, 64)}<h1 class="vtitle" style="margin:0;font-size:34px">${esc(m.pseudo || "Utilisateur")}</h1></div>
   <div class="stats"><div class="stat"><b>${seances.length}</b><span>séance${seances.length > 1 ? "s" : ""}</span></div><div class="stat"><b>${st.creatineDays || 0}</b><span>jours créatine</span></div><div class="stat"><b>${st.complements || 0}</b><span>compléments notés</span></div></div>
   <section class="card"><div class="lbl">Informations</div><dl class="kv">${kv.map(([a, b]) => `<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join("")}</dl></section>
   <section><h2 class="h2">Dernières séances</h2><div class="list">${seances.length ? seances.slice(0, 30).map(s => {
     const mt = dayMeta(s, types), d = parse(s.k);
     return `<div class="row" style="--tc:${mt.color}"><i class="bar"></i><span class="d">${DAYS[d.getDay()].slice(0, 3)}<b>${d.getDate()}</b></span><span class="main"><div class="ti">${esc(titleOf(s, types))}</div><div class="me">${esc(MONTHS_S[d.getMonth()])} ${d.getFullYear()} · ${esc(sessionSummary(s, types))}</div></span></div>`;
   }).join("") : `<div class="empty">Aucune séance enregistrée.</div>`}</div></section>
   <p class="hint">${nut} jour${nut > 1 ? "s" : ""} de nutrition renseigné${nut > 1 ? "s" : ""}.</p>
   ${uid !== S.uid ? `<button class="btn ghost-danger" data-ban="${esc(uid)}" data-banp="${esc(m.pseudo || "")}">${(S.bans || {})[uid] ? "Débannir " : "⛔ Bannir "}${esc(m.pseudo || "")}</button>` : ""}
  </div>`;
}

export { renderAdmin };
