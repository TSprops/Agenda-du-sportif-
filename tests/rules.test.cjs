// Règles de sécurité Firestore : ce qui doit être autorisé ou refusé.
const assert = require("node:assert/strict");
const { FS, req, put, fields, newUser } = require("./helpers.cjs");
const post = (path, u, data) => req(FS + path, { method: "POST", headers: u.H, body: JSON.stringify(fields(data)) });
const patch = (path, u, data, mask) => req(FS + path + (mask ? "?" + mask.map(m => "updateMask.fieldPaths=" + encodeURIComponent(m)).join("&") : ""), { method: "PATCH", headers: u.H, body: JSON.stringify(fields(data)) });
const get = (path, u) => req(FS + path, { headers: u.H });
const listDir = (u, lim) => req(FS.replace(/documents\/$/, "documents:runQuery"), { method: "POST", headers: u.H, body: JSON.stringify({ structuredQuery: { from: [{ collectionId: "directory" }], ...(lim ? { limit: lim } : {}) } }) });

module.exports = async function rulesTests(t) {
  const a = await newUser(), c = await newUser(), x = await newUser(), admin = await newUser();
  await put("admins/" + admin.uid, { ok: true });
  t("propriétaire écrit sa séance", (await patch(`users/${a.uid}/seances/2026-09-01`, a, { title: "x", updatedAt: 1 })).status, 200);
  await patch(`share/${a.uid}`, a, { sessions: true });
  t("inconnu ne lit pas les séances", (await get(`users/${a.uid}/seances/2026-09-01`, x)).status, 403);
  const [u0, u1] = [a.uid, c.uid].sort(), pid = u0 + "_" + u1;
  t("demande d'ami", (await patch(`friends/${pid}`, c, { users: [u0, u1], status: "pending", from: c.uid, to: a.uid })).status, 200);
  t("on n'accepte pas sa propre demande", (await patch(`friends/${pid}`, c, { status: "accepted" }, ["status"])).status, 403);
  t("le destinataire accepte", (await patch(`friends/${pid}`, a, { status: "accepted" }, ["status"])).status, 200);
  t("un ami lit les séances partagées", (await get(`users/${a.uid}/seances/2026-09-01`, c)).status, 200);
  t("un ami ne modifie pas les séances", (await patch(`users/${a.uid}/seances/2026-09-01`, c, { title: "hack" })).status, 403);
  t("message entre amis", (await post(`chats/${pid}/messages`, c, { from: c.uid, text: "salut" })).status, 200);
  t("message au nom d'un autre refusé", (await post(`chats/${pid}/messages`, c, { from: a.uid, text: "salut" })).status, 403);
  const cm = await post(`comments/${a.uid}/items`, c, { date: "2026-09-01", from: c.uid, text: "bravo", at: 1 });
  t("commentaire d'un ami", cm.status, 200);
  t("commentaire d'un inconnu refusé", (await post(`comments/${a.uid}/items`, x, { date: "2026-09-01", from: x.uid, text: "yo", at: 1 })).status, 403);
  // Annuaire : lecture d'une fiche oui, liste complète non.
  await patch(`directory/${a.uid}`, a, { uid: a.uid, pseudo: "A", pseudoLower: "a", code: "A-1234" });
  t("annuaire : fiche lisible", (await get(`directory/${a.uid}`, x)).status, 200);
  t("annuaire : liste sans limite refusée", (await listDir(x)).status, 403);
  t("annuaire : liste limitée refusée aussi (la recherche passe par le serveur)", (await listDir(x, 5)).status, 403);
  // Recherche : collections réservées au serveur.
  await put(`recherche/${a.uid}`, { uid: a.uid, pseudo: "A", visible: true });
  for (const col of ["recherche", "reseau", "limites"]) {
    t(`${col} : lecture refusée`, (await get(`${col}/${a.uid}`, a)).status, 403);
    t(`${col} : écriture refusée`, (await patch(`${col}/${a.uid}`, a, { uid: a.uid })).status, 403);
  }
  t("profil : nom affiché accepté", (await patch(`users/${x.uid}`, x, { pseudo: "X", nomAffiche: "Xavier", masquerRecherche: true })).status, 200);
  t("profil : nom affiché trop long refusé", (await patch(`users/${x.uid}`, x, { pseudo: "X", nomAffiche: "x".repeat(31) })).status, 403);
  t("profil : option de recherche non booléenne refusée", (await patch(`users/${x.uid}`, x, { pseudo: "X", masquerRecherche: "oui" })).status, 403);
  // Défis
  const ch = await post("challenges", a, { name: "Defi", metric: "seances", start: "2026-09-29", end: "2026-10-05", owner: a.uid, members: [a.uid, c.uid], scores: {} });
  t("création d'un défi", ch.status, 200);
  const cid = ch.body.name.split("/").pop();
  t("chacun son score", (await patch(`challenges/${cid}`, c, { scores: { [c.uid]: 5 } }, ["scores.`" + c.uid + "`"])).status, 200);
  t("pas le score des autres", (await patch(`challenges/${cid}`, c, { scores: { [a.uid]: 0 } }, ["scores.`" + a.uid + "`"])).status, 403);
  // Modération
  const cmid = cm.body.name.split("/").pop();
  t("un inconnu ne supprime pas un commentaire", (await req(FS + `comments/${a.uid}/items/${cmid}`, { method: "DELETE", headers: x.H })).status, 403);
  t("l'admin supprime un commentaire", (await req(FS + `comments/${a.uid}/items/${cmid}`, { method: "DELETE", headers: admin.H })).status, 200);
  t("un utilisateur ne peut pas bannir", (await patch(`bans/${x.uid}`, c, { at: 1 })).status, 403);
  t("l'admin bannit", (await patch(`bans/${c.uid}`, admin, { at: 1 })).status, 200);
  t("un banni ne commente plus", (await post(`comments/${a.uid}/items`, c, { date: "2026-09-01", from: c.uid, text: "re", at: 2 })).status, 403);
  t("un banni n'écrit plus de message", (await post(`chats/${pid}/messages`, c, { from: c.uid, text: "re" })).status, 403);
  t("un banni voit qu'il est banni", (await get(`bans/${c.uid}`, c)).status, 200);
  t("l'admin supprime un défi", (await req(FS + `challenges/${cid}`, { method: "DELETE", headers: admin.H })).status, 200);
};
