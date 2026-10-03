// Recherche d'utilisateurs (fonction serveur rechercherUtilisateurs et fiches tenues à jour par le serveur).
const { req, put, get, del, newUser } = require("./helpers.cjs");
const FONCTION = "http://127.0.0.1:5001/demo-agenda/europe-west1/rechercherUtilisateurs";
const appeler = (u, texte) => req(FONCTION, { method: "POST", headers: u ? u.H : { "content-type": "application/json" }, body: JSON.stringify({ data: { texte } }) });
const pseudos = async (u, texte) => { const r = await appeler(u, texte); return r.status === 200 ? r.body.result.resultats.map(x => x.pseudo) : r.status; };
const paire = (a, b) => a < b ? [a, b] : [b, a];
const fiche = async uid => { const r = await get(`recherche/${uid}`); return r.status === 200 ? r.body.fields : null; };
// Les fonctions serveur réagissent aux écritures un peu plus tard : on attend que la condition soit vraie.
async function attendre(ok, ms = 20000) {
  for (const t0 = Date.now(); Date.now() - t0 < ms;) { if (await ok()) return true; await new Promise(r => setTimeout(r, 250)); }
  return false;
}
const visible = async (uid, v) => attendre(async () => { const f = await fiche(uid); return !!f && f.visible.booleanValue === v; });

module.exports = async function rechercheTests(t) {
  const [moi, ami, daphnis, lea, superd, cache, bloqueur, bloque] = await Promise.all(Array.from({ length: 8 }, newUser));
  const profils = [[moi, { pseudo: "Moi" }], [ami, { pseudo: "Copain" }], [daphnis, { pseudo: "Daphnis" }], [lea, { pseudo: "Léa", nomAffiche: "Daphné Durand" }],
    [superd, { pseudo: "SuperDaph" }], [cache, { pseudo: "Daphcache", masquerRecherche: true }], [bloqueur, { pseudo: "Daphbloqueur" }], [bloque, { pseudo: "Daphbloque" }]];
  for (const [u, p] of profils) await put(`users/${u.uid}`, { ...p, email: `secret-${u.uid}@test.fr`, prenom: "Prénom", nom: "Privé" });
  const lien = (a, b, x) => { const users = paire(a.uid, b.uid); return put(`friends/${users.join("_")}`, { users, from: a.uid, to: b.uid, ...x }); };
  await lien(moi, ami, { status: "accepted" });
  await lien(ami, lea, { status: "accepted" });
  await lien(bloqueur, moi, { status: "blocked", blockedBy: bloqueur.uid });
  await lien(moi, bloque, { status: "blocked", blockedBy: moi.uid });
  // Plus de 5 correspondances, pour vérifier la limite.
  for (let i = 1; i <= 7; i++) await put(`users/maxime${i}`, { pseudo: "Maxime" + i });

  t("fiches de recherche créées par le serveur", await attendre(async () => (await Promise.all(profils.map(([u]) => fiche(u.uid)))).every(Boolean) && !!(await fiche("maxime7"))), true);
  t("liste d'amis tenue à jour par le serveur", await attendre(async () => JSON.stringify((await get(`reseau/${lea.uid}`)).body || "").includes(ami.uid)), true);
  const ficheLea = await fiche(lea.uid) || {};
  t("fiche de recherche : ni e-mail, ni prénom, ni nom", ["email", "prenom", "nom"].filter(k => k in ficheLea), []);

  t("non connecté : refusé", (await appeler(null, "daph")).status, 401);
  t("moins de 2 caractères : refusé", (await appeler(moi, "d")).status, 400);
  const r = await appeler(moi, "daph");
  t("ordre : commence par (ami d'ami d'abord), puis contient ; ni masqué ni bloqué", r.body.result.resultats.map(x => x.pseudo), ["Léa", "Daphnis", "SuperDaph"]);
  t("seulement les infos publiques", Object.keys(r.body.result.resultats[0]).sort(), ["nomAffiche", "photo", "pseudo", "uid"]);
  t("nom affiché renvoyé", r.body.result.resultats[0].nomAffiche, "Daphné Durand");
  t("la liste se resserre (« daphn »)", await pseudos(moi, "daphn"), ["Léa", "Daphnis"]);
  t("majuscules et accents ignorés (« DAPHNÉ »)", await pseudos(moi, "DAPHNÉ"), ["Léa"]);
  t("recherche sur le nom affiché (« durand »)", await pseudos(moi, "durand"), ["Léa"]);
  t("5 résultats au maximum", (await pseudos(moi, "maxim")).length, 5);
  t("un ami apparaît (bouton « Déjà ami » dans l'app)", await pseudos(moi, "copain"), ["Copain"]);
  t("on ne se trouve pas soi-même", await pseudos(moi, "moi"), []);
  t("bloqué : ne me trouve pas non plus", await pseudos(bloque, "moi"), []);

  // Code ami : marche même pour quelqu'un qui ne veut pas apparaître dans la recherche.
  await put(`directory/${cache.uid}`, { uid: cache.uid, pseudo: "Daphcache", code: "DAPHCA-1234" });
  t("code ami : trouvé même masqué", await pseudos(moi, "daphca-1234"), ["Daphcache"]);
  // Option « Ne pas apparaître dans la recherche » désactivée, puis suspension par l'admin.
  await put(`users/${cache.uid}`, { pseudo: "Daphcache", masquerRecherche: false });
  await visible(cache.uid, true);
  t("option désactivée : réapparaît", (await pseudos(moi, "daphca")), ["Daphcache"]);
  await put(`bans/${daphnis.uid}`, { at: 1 });
  await visible(daphnis.uid, false);
  t("utilisateur suspendu : retiré", await pseudos(moi, "daphnis"), []);
  // Compte supprimé : sa fiche de recherche disparaît aussi.
  await del(`users/${superd.uid}`);
  t("compte supprimé : fiche effacée", await attendre(async () => !(await fiche(superd.uid))), true);

  // Limite de requêtes par utilisateur.
  const z = await newUser(), maintenant = Date.now(), minute = Math.floor(maintenant / 60000), jour = new Date(maintenant).toISOString().slice(0, 10);
  await appeler(z, "ab");
  t("requêtes comptées", (await get(`limites/${z.uid}`)).body.fields.nMin.integerValue, "1");
  await put(`limites/${z.uid}`, { minute, nMin: 30, jour, nJour: 30 });
  t("plus de 30 par minute : refusé", (await appeler(z, "ab")).status, 429);
  await put(`limites/${z.uid}`, { minute: minute - 1, nMin: 0, jour, nJour: 500 });
  t("plus de 500 par jour : refusé", (await appeler(z, "ab")).status, 429);
};
