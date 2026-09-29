// Tutoriel, export de mes données, sauvegarde admin et état du réseau.
import { $, S, collection, db, esc, getDocs, limitToLast, orderBy, query, todayK } from "./core.js";
import { saveProfile, subCol } from "./store.js";
import { renderAdmin } from "./admin.js";
import { lsSet, maybeWelcomeInstall } from "./install.js";
import { SOC, otherOf } from "./friends.js";
import { acceptedFriends, loadFeed } from "./social.js";

/* ============================================================
   Mini tutoriel (passable) et annonce de la mise à jour
   ============================================================ */
const TUTO = [
  ["👋", "Bienvenue !", "Ton carnet d’entraînement : musculation, CrossFit, callisthénie et course à pied, au même endroit."],
  ["▶", "Let’s go", "Lance ta séance, une routine ou un programme. Tes poids de la dernière fois sont déjà remplis : tu n’as plus qu’à battre ton record."],
  ["🏆", "Valide tes séries", "Touche « Série finie » : le minuteur de repos démarre tout seul, et l’app te prévient dès que tu bats un record."],
  ["🔥", "Garde ta série", "Choisis ton objectif de séances par semaine sur l’accueil. Chaque semaine réussie fait grandir ta série."],
  ["👥", "Social", "Ajoute tes amis, suis leurs séances dans le fil d’actu, commente, et lance des défis entre potes."]
];
let tutoI = 0;
function openTuto() { tutoI = 0; renderTuto(); $("tuto").hidden = false; document.body.classList.add("sheet-open"); }
function closeTuto() {
  $("tuto").hidden = true; if (!$("sheet").classList.contains("open")) document.body.classList.remove("sheet-open");
  lsSet("seen-tuto", 1); if (S.profile) saveProfile({ seen: { ...(S.profile.seen || {}), tuto: true } });
  if (S.screen === "home") maybeWelcomeInstall();
}
function renderTuto() {
  const [ico, t, d] = TUTO[tutoI], last = tutoI === TUTO.length - 1;
  $("tutoBody").innerHTML = `<span class="tuto-ico" aria-hidden="true">${ico}</span><h2>${esc(t)}</h2><p>${esc(d)}</p>`;
  $("tutoDots").innerHTML = TUTO.map((_, i) => `<i class="${i === tutoI ? "on" : ""}"></i>`).join("");
  $("tutoNext").textContent = last ? "C’est parti !" : "Suivant";
  $("tutoPrev").style.visibility = tutoI ? "visible" : "hidden";
}
$("tutoNext").onclick = () => { if (tutoI === TUTO.length - 1) closeTuto(); else { tutoI++; renderTuto(); } };
$("tutoPrev").onclick = () => { if (tutoI) { tutoI--; renderTuto(); } };
$("tutoSkip").onclick = closeTuto;
$("tutoAgain").onclick = openTuto;

/* ============================================================
   Mes données : export (droit d'accès et de portabilité)
   ============================================================ */
function downloadJSON(obj, name) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" }), file = new File([blob], name, { type: "application/json" });
  if (navigator.canShare && navigator.canShare({ files: [file] })) return navigator.share({ files: [file], title: name }).catch(() => {});
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 60000);
}
async function exportMyData(btn) {
  btn.disabled = true; const label = btn.textContent; btn.textContent = "Préparation…";
  try {
    const all = async name => { const o = {}; (await getDocs(subCol(name))).forEach(d => { o[d.id] = d.data(); }); return o; };
    const [seances, nutrition, photos] = await Promise.all([all("seances"), all("nutrition"), all("photos")]);
    const convs = {};
    for (const [pid, f] of Object.entries(SOC.friends).filter(([, f]) => f.status === "accepted")) {
      try { convs[(SOC.dir[otherOf(f)] || {}).pseudo || otherOf(f)] = (await getDocs(query(collection(db, "chats", pid, "messages"), orderBy("at"), limitToLast(500)))).docs.map(d => d.data()); } catch (x) { /* conversation indisponible */ }
    }
    downloadJSON({
      app: "L'agenda du sportif", exportedAt: new Date().toISOString(), email: S.email, profil: S.profile,
      seances, nutrition, photos, amis: acceptedFriends().map(u => (SOC.dir[u] || {}).pseudo || u),
      reactionsRecues: SOC.myReacts, commentairesRecus: SOC.myComments, conversations: convs,
      defis: (SOC.challenges || []).map(({ id, ...c }) => c)
    }, "mes-donnees-agenda-du-sportif.json");
    btn.textContent = "✓ Données téléchargées";
  } catch (x) { btn.textContent = "Échec, réessaie"; }
  setTimeout(() => { btn.disabled = false; btn.textContent = label; }, 4000);
}
$("exportBtn").onclick = e => exportMyData(e.currentTarget);

// Administration : sauvegarde complète (profils, séances et nutrition de tous les utilisateurs, sans les photos).
async function adminBackup(btn) {
  if (!S.admin) return;
  btn.disabled = true; const label = btn.textContent, users = Object.values(S.members), out = { exportedAt: new Date().toISOString(), users: {}, messages: S.messages, reports: S.reports || [], bans: S.bans || {} };
  try {
    let i = 0;
    for (const m of users) {
      btn.textContent = `Sauvegarde… ${++i} / ${users.length}`;
      const get = async name => { const o = {}; (await getDocs(subCol(name, m.id))).forEach(d => { o[d.id] = d.data(); }); return o; };
      const { id, ...profil } = m;
      out.users[id] = { profil, seances: await get("seances"), nutrition: await get("nutrition") };
    }
    downloadJSON(out, "sauvegarde-agenda-du-sportif-" + todayK() + ".json");
    lsSet("last-backup", Date.now()); btn.textContent = "✓ Sauvegarde téléchargée";
  } catch (x) { btn.textContent = "Échec, réessaie"; }
  setTimeout(() => { btn.disabled = false; btn.textContent = label; renderAdmin(); }, 4000);
}
// Hors connexion : petit bandeau discret sur tous les écrans (les données restent enregistrées sur le téléphone).
function netState() { $("offlinePill").hidden = navigator.onLine; if (S.screen === "home") $("mode").textContent = ""; }
window.addEventListener("online", () => { netState(); if (S.screen === "feed") loadFeed(true); });
window.addEventListener("offline", netState);
netState();
let tx0 = null;
$("tuto").addEventListener("touchstart", e => { tx0 = e.touches[0].clientX; }, { passive: true });
$("tuto").addEventListener("touchend", e => {
  if (tx0 == null) return; const dx = e.changedTouches[0].clientX - tx0; tx0 = null;
  if (dx < -50 && tutoI < TUTO.length - 1) { tutoI++; renderTuto(); } else if (dx > 50 && tutoI) { tutoI--; renderTuto(); }
});

export { adminBackup, openTuto };
