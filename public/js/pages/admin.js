// Administration : statistiques, utilisateurs, messages, signalements et modération.
import { $, DEFAULT_TYPES, S, TYPES_V, ago, armed, avatarHTML, dayMeta, db, deleteDoc, doc, esc, fmtCourt, fmtDate, getDocs,
  jourCourt, nameColor, nf, nomRef, parse, setDoc, titleOf, updateDoc } from "../commun/core.js";
import { t, valeur } from "../commun/i18n.js";
import { go, subCol } from "../commun/store.js";
import { sessionSummary } from "../seances/index.js";
import { lsGet } from "../commun/install.js";
import { toast } from "../entrainement/index.js";
import { adminBackup } from "../commun/extras.js";

/* ============================================================
   Administration
   ============================================================ */
function renderAdmin() {
  if (!S.admin) { $("adminBody").innerHTML = `<p class="hint">${t("admin.reserve")}</p>`; return; }
  const M = Object.values(S.members).filter(m => m.pseudo).sort((a, b) => (b.lastSeen || 0) - (a.lastSeen || 0));
  const week = Date.now() - 7 * 864e5, active = M.filter(m => (m.lastSeen || 0) >= week).length;
  const totalS = M.reduce((a, m) => a + ((m.stats && m.stats.seances) || 0), 0), totalV = M.reduce((a, m) => a + (m.visits || 0), 0);
  const byType = {}; M.forEach(m => Object.entries((m.stats && m.stats.byType) || {}).forEach(([k, v]) => { byType[k] = (byType[k] || 0) + v; }));
  const maxT = Math.max(1, ...Object.values(byType));
  const colorOf = nameColor;
  const msgs = S.messages, unread = msgs.filter(m => !m.lu).length;
  const lb = +(lsGet("last-backup") || 0);
  $("adminBody").innerHTML = `<div style="display:flex;flex-direction:column;gap:22px">
  <section class="card"><div class="lbl">${t("admin.sauvegarde")}</div>
    <p class="hint">${t("admin.sauvegardeAide")} ${esc(lb ? t("admin.derniereSauvegarde", { date: fmtDate(lb) }) : t("admin.aucuneSauvegarde"))}</p>
    <button class="btn" data-backup="1">${t("admin.sauvegardeComplete")}</button></section>
  <div class="stats" style="grid-template-columns:repeat(2,1fr)">
    <div class="stat"><b>${M.length}</b><span>${t("admin.inscrits")}</span></div>
    <div class="stat"><b>${active}</b><span>${t("admin.actifs")}</span></div>
    <div class="stat"><b>${totalS}</b><span>${t("admin.seancesEnregistrees")}</span></div>
    <div class="stat"><b>${totalV}</b><span>${t("admin.visites")}</span></div>
  </div>
  <section><h2 class="h2">${t("admin.parType")}</h2><div class="card bars">${Object.keys(byType).length ? Object.entries(byType).sort((a, b) => b[1] - a[1]).map(([n, v]) => `<div class="barrow" style="--tc:${colorOf(n)}"><span>${esc(nomRef(n))}</span><span class="track"><span class="fill" style="display:block;width:${Math.round(v / maxT * 100)}%"></span></span><b>${v}</b></div>`).join("") : `<p class="hint">${t("admin.aucuneSeance")}</p>`}</div></section>
  <section><h2 class="h2">${t("admin.utilisateurs", { n: M.length })}</h2><div class="card" style="gap:0;padding-block:4px">${M.length ? M.map(m => `<button class="urow" data-uid="${esc(m.id)}">${avatarHTML(m, 42)}<span class="main"><b>${esc(m.pseudo)}${m.id === S.uid ? ` <span class="tag done">${t("admin.toi")}</span>` : ""}</b><span>${esc(t("admin.ligneUtilisateur", { vu: ago(m.lastSeen), seances: t("admin.nSeances", { n: (m.stats && m.stats.seances) || 0 }), visites: t("admin.nVisites", { n: m.visits || 0 }) }))}</span></span><span class="arrow" aria-hidden="true">›</span></button>`).join("") : `<p class="hint" style="padding-block:12px">${t("admin.personne")}</p>`}</div></section>
  <section><h2 class="h2">${t("admin.signalements", { n: (S.reports || []).length })}</h2><div class="card" style="gap:0;padding-block:4px">${(S.reports || []).length ? S.reports.map(reportHTML).join("") : `<p class="hint" style="padding-block:12px">${t("admin.aucunSignalement")}</p>`}</div></section>
  <section><h2 class="h2">${t("admin.messagesRecus", { n: unread })}</h2><div class="card" style="gap:0;padding-block:4px">${msgs.length ? msgs.map(m => `<div class="msg"><div class="msg-top"><span class="tag${m.lu ? " done" : ""}">${esc(valeur("valeurs.objets", m.objet))}</span><b>${esc(m.pseudo || t("admin.utilisateur"))}</b><small>${esc(fmtDate(m.at))}</small></div><p>${esc(m.texte)}</p>${m.email ? `<small>${t("admin.repondreA")} <span style="user-select:all;color:var(--ink)">${esc(m.email)}</span></small>` : ""}<button class="icon-btn" style="align-self:flex-start" data-mid="${esc(m.id)}">${t(m.lu ? "admin.marquerNonLu" : "admin.marquerLu")}</button></div>`).join("") : `<p class="hint" style="padding-block:12px">${t("admin.aucunMessage")}</p>`}</div></section>
  </div>`;
}
const REPORT_KINDS = ["message", "conversation", "comment", "profile", "challenge"];
function reportHTML(r) {
  const banned = !!(S.bans || {})[r.target], canDel = r.ref && ["message", "comment", "challenge"].includes(r.kind);
  return `<div class="msg"><div class="msg-top"><span class="tag">${t("admin.signalement." + (REPORT_KINDS.includes(r.kind) ? r.kind : "autre"))}</span><b>${esc(r.targetPseudo || "?")}</b>${banned ? `<span class="tag done">${t("admin.banni")}</span>` : ""}<small>${esc(t("admin.signalePar", { pseudo: r.fromPseudo || "?", date: fmtDate(r.at) }))}</small></div><p>${esc(r.text)}</p>
    <div class="mod-actions">${canDel ? `<button class="icon-btn" data-repdel="${esc(r.id)}">${t("admin.supprimerContenu")}</button>` : ""}${r.kind === "profile" && r.target ? `<button class="icon-btn" data-dirdel="${esc(r.target)}">${t("admin.retirerRecherche")}</button>` : ""}${r.target ? `<button class="icon-btn" data-ban="${esc(r.target)}" data-banp="${esc(r.targetPseudo || "")}">${t(banned ? "admin.debannir" : "admin.bannir")}</button>` : ""}<button class="icon-btn" data-repdone="${esc(r.id)}">${t("admin.traite")}</button></div></div>`;
}
// Bannir : l'utilisateur ne peut plus rien publier (amis, messages, commentaires, réactions, défis).
async function toggleBan(uid, pseudo) {
  try {
    if ((S.bans || {})[uid]) await deleteDoc(doc(db, "bans", uid));
    else await setDoc(doc(db, "bans", uid), { at: Date.now(), by: S.uid, pseudo: pseudo || (S.members[uid] || {}).pseudo || "" });
  } catch (x) { toast(t("admin.actionImpossibleRegles")); }
}
document.addEventListener("click", async e => {
  const b = e.target.closest("[data-ban]"); if (!b || !S.admin) return;
  if (!armed(b, t("commun.confirmer"))) return;
  await toggleBan(b.dataset.ban, b.dataset.banp); if (S.screen === "auser") openUser(b.dataset.ban);
});
$("adminBody").addEventListener("click", async e => {
  const u = e.target.closest("[data-uid]"); if (u) { openUser(u.dataset.uid); return; }
  const bk = e.target.closest("[data-backup]"); if (bk) { adminBackup(bk); return; }
  const rdel = e.target.closest("[data-repdel]");
  if (rdel) {
    if (!armed(rdel, t("commun.confirmer"))) return;
    const r = (S.reports || []).find(x => x.id === rdel.dataset.repdel); if (!r || !r.ref) return;
    try { await deleteDoc(doc(db, ...r.ref.split("/"))); await deleteDoc(doc(db, "reports", r.id)); toast(t("admin.contenuSupprime")); } catch (x) { toast(t("admin.suppressionImpossible")); }
    return;
  }
  const dd = e.target.closest("[data-dirdel]");
  if (dd) { if (!armed(dd, t("commun.confirmer"))) return; deleteDoc(doc(db, "directory", dd.dataset.dirdel)).then(() => toast(t("admin.profilRetire")), () => toast(t("admin.actionImpossible"))); return; }
  const rd = e.target.closest("[data-repdone]"); if (rd) { if (!armed(rd, t("commun.confirmer"))) return; deleteDoc(doc(db, "reports", rd.dataset.repdone)).catch(() => {}); return; }
  const r = e.target.closest("[data-mid]"); if (!r) return;
  const m = S.messages.find(x => x.id === r.dataset.mid); if (!m) return;
  updateDoc(doc(db, "messages", m.id), { lu: !m.lu }).catch(() => {});
});
async function openUser(uid) {
  go("auser");
  const m = S.members[uid] || {};
  $("auserBody").innerHTML = `<p class="hint">${t("commun.chargementPoints")}</p>`;
  let seances = [], nut = 0;
  try {
    const [ss, ns] = await Promise.all([getDocs(subCol("seances", uid)), getDocs(subCol("nutrition", uid))]);
    seances = ss.docs.map(d => ({ k: d.id, ...d.data() })).sort((a, b) => a.k < b.k ? 1 : -1); nut = ns.size;
  } catch (x) { /* affichage partiel */ }
  const types = (m.typesV === TYPES_V && Array.isArray(m.types)) ? m.types : DEFAULT_TYPES, st = m.stats || {};
  const kv = [["pseudo", m.pseudo], ["email", m.email], ["prenom", m.prenom], ["nom", m.nom], ["age", m.age ? t("profil.age", { n: +m.age || 0 }) : ""], ["taille", m.taille ? m.taille + " cm" : ""], ["poids", m.poids ? m.poids + " kg" : ""],
    ["objectif", m.objectif && valeur("valeurs.objectifs", m.objectif)], ["inscritLe", m.createdAt ? fmtDate(m.createdAt) : ""], ["derniereVisite", ago(m.lastSeen)], ["visitesN", m.visits],
    ["volumeTotal", st.volume ? nf.format(st.volume) + " kg" : ""], ["distance", st.km ? nf.format(st.km) + " km" : ""], ["photos", st.photos]].filter(x => x[1] !== undefined && x[1] !== "" && x[1] !== null);
  $("auserBody").innerHTML = `<div style="display:flex;flex-direction:column;gap:20px">
   <div style="display:flex;align-items:center;gap:14px">${avatarHTML(m, 64)}<h1 class="vtitle" style="margin:0;font-size:34px">${esc(m.pseudo || t("admin.utilisateur"))}</h1></div>
   <div class="stats"><div class="stat"><b>${seances.length}</b><span>${t("bilan.seances", { n: seances.length })}</span></div><div class="stat"><b>${st.creatineDays || 0}</b><span>${t("admin.joursCreatine")}</span></div><div class="stat"><b>${st.complements || 0}</b><span>${t("admin.complementsNotes")}</span></div></div>
   <section class="card"><div class="lbl">${t("admin.informations")}</div><dl class="kv">${kv.map(([a, b]) => `<dt>${t("admin.fiche." + a)}</dt><dd>${esc(b)}</dd>`).join("")}</dl></section>
   <section><h2 class="h2">${t("admin.dernieresSeances")}</h2><div class="list">${seances.length ? seances.slice(0, 30).map(s => {
     const mt = dayMeta(s, types), d = parse(s.k);
     return `<div class="row" style="--tc:${mt.color}"><i class="bar"></i><span class="d">${esc(jourCourt(d))}<b>${d.getDate()}</b></span><span class="main"><div class="ti">${esc(titleOf(s, types))}</div><div class="me">${esc(fmtCourt(d, true))} · ${esc(sessionSummary(s, types))}</div></span></div>`;
   }).join("") : `<div class="empty">${t("admin.aucuneSeanceUtilisateur")}</div>`}</div></section>
   <p class="hint">${t("admin.joursNutrition", { n: nut })}</p>
   ${uid !== S.uid ? `<button class="btn ghost-danger" data-ban="${esc(uid)}" data-banp="${esc(m.pseudo || "")}">${esc(t((S.bans || {})[uid] ? "admin.debannirPseudo" : "admin.bannirPseudo", { pseudo: m.pseudo || "" }))}</button>` : ""}
  </div>`;
}

export { renderAdmin };
