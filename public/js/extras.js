// Export de mes données, sauvegarde admin et état du réseau.
import { $, S, collection, db, getDocs, limitToLast, orderBy, query, todayK } from "./core.js";
import { subCol } from "./store.js";
import { renderAdmin } from "./admin.js";
import { lsSet } from "./install.js";
import { SOC, otherOf } from "./amis/index.js";
import { acceptedFriends, loadFeed } from "./social/index.js";

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
export { adminBackup };
