// Recherche d'utilisateurs : fiches de recherche (collection « recherche », lue seulement par le serveur),
// réseau d'amis (collection « reseau ») et limite de requêtes (collection « limites »).
const { getFirestore } = require("firebase-admin/firestore");
const { HttpsError } = require("firebase-functions/v2/https");

const MAX_RESULTATS = 5;
const PAR_MINUTE = 30;
const PAR_JOUR = 500;
const CODE_RE = /^[A-Za-z]+-\d{4}$/;

const db = () => getFirestore();

// « Daphné » → « daphne » : minuscules, sans accents, ponctuation remplacée par des espaces.
function norm(s) {
  return String(s || "").toLowerCase().replace(/œ/g, "oe").replace(/æ/g, "ae").replace(/ß/g, "ss")
    .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}
const compact = s => norm(s).replace(/ /g, "");
// Morceaux de 2, 3 et 4 lettres : permettent de trouver « aph » dans « Daphné » (requête array-contains).
function morceaux(...textes) {
  const out = new Set();
  textes.map(compact).forEach(c => { for (const n of [2, 3, 4]) for (let i = 0; i + n <= c.length; i++) out.add(c.slice(i, i + n)); });
  return [...out];
}
// Morceau utilisé pour la requête « contient » : le texte tapé lui-même (2 à 4 lettres) ou ses 4 premières lettres.
const morceauDe = q => q.slice(0, 4);

// Fiche de recherche construite à partir du profil (jamais l'email ni les autres données privées).
function ficheDe(uid, p, banni) {
  const pseudo = String(p.pseudo || "").slice(0, 30), nomAffiche = String(p.nomAffiche || "").trim().slice(0, 30);
  const masque = p.masquerRecherche === true;
  return {
    uid, pseudo, nomAffiche, photo: typeof p.photo === "string" ? p.photo : null,
    pseudoNorm: compact(pseudo), nomNorm: compact(nomAffiche),
    mots: [...new Set([...norm(pseudo).split(" "), ...norm(nomAffiche).split(" ")].filter(Boolean))],
    morceaux: morceaux(pseudo, nomAffiche),
    masque, banni: !!banni, visible: !!pseudo && !masque && !banni
  };
}
const CHAMPS_PROFIL = ["pseudo", "nomAffiche", "photo", "masquerRecherche"];
const memes = (a, b) => CHAMPS_PROFIL.every(k => JSON.stringify(a[k] ?? null) === JSON.stringify(b[k] ?? null));

// Profil créé, modifié ou supprimé : met à jour sa fiche de recherche.
async function majFicheProfil(uid, avant, apres) {
  const ref = db().doc(`recherche/${uid}`);
  if (!apres) {
    await Promise.all([ref, db().doc(`reseau/${uid}`), db().doc(`limites/${uid}`)].map(r => r.delete()));
    return;
  }
  // Le profil change souvent (dernière visite…) : on n'écrit que si un champ utile a changé ou si la fiche manque.
  if (avant && memes(avant, apres) && (await ref.get()).exists) return;
  const banni = (await db().doc(`bans/${uid}`).get()).exists;
  await ref.set(ficheDe(uid, apres, banni));
}
// Utilisateur suspendu ou rétabli : il disparaît ou réapparaît dans la recherche.
async function majFicheBan(uid, banni) {
  const ref = db().doc(`recherche/${uid}`), s = await ref.get();
  if (!s.exists) return;
  await ref.update({ banni, visible: !!s.data().pseudo && !s.data().masque && !banni });
}
// Liste des amis d'un utilisateur (pour classer les amis d'amis en premier).
async function majReseau(uid) {
  const snap = await db().collection("friends").where("users", "array-contains", uid).get();
  const amis = snap.docs.map(d => d.data()).filter(f => f.status === "accepted").map(f => f.users.find(u => u !== uid)).filter(Boolean);
  await db().doc(`reseau/${uid}`).set({ amis });
}

// Au plus 30 recherches par minute et 500 par jour et par utilisateur.
async function limiter(uid, maintenant = Date.now()) {
  const ref = db().doc(`limites/${uid}`), minute = Math.floor(maintenant / 60000), jour = new Date(maintenant).toISOString().slice(0, 10);
  await db().runTransaction(async tx => {
    const d = (await tx.get(ref)).data() || {};
    const nMin = d.minute === minute ? d.nMin || 0 : 0, nJour = d.jour === jour ? d.nJour || 0 : 0;
    if (nMin >= PAR_MINUTE || nJour >= PAR_JOUR) throw new HttpsError("resource-exhausted", "trop de recherches");
    tx.set(ref, { minute, nMin: nMin + 1, jour, nJour: nJour + 1 });
  });
}

// Mes relations : amis, et personnes exclues (moi, bloquées par moi ou qui m'ont bloqué).
async function relationsDe(uid) {
  const snap = await db().collection("friends").where("users", "array-contains", uid).get();
  const amis = new Set(), exclus = new Set([uid]);
  snap.docs.forEach(d => {
    const f = d.data(), autre = (f.users || []).find(u => u !== uid);
    if (!autre) return;
    if (f.status === "blocked") exclus.add(autre);
    else if (f.status === "accepted") amis.add(autre);
  });
  return { amis, exclus };
}
const publique = f => ({ uid: f.uid, pseudo: f.pseudo || "", nomAffiche: f.nomAffiche || "", photo: f.photo || null });

// Recherche par code ami (lien d'invitation, QR code) : marche même si la personne est masquée de la recherche.
async function parCode(uid, code) {
  const snap = await db().collection("directory").where("code", "==", code.toUpperCase()).limit(1).get();
  if (snap.empty) return [];
  const d = snap.docs[0].data(), { exclus } = await relationsDe(uid);
  if (!d.uid || exclus.has(d.uid)) return [];
  const fiche = (await db().doc(`recherche/${d.uid}`).get()).data() || {};
  if (fiche.banni) return [];
  return [publique({ ...d, nomAffiche: fiche.nomAffiche })];
}

// Recherche par pseudo ou nom affiché : d'abord ceux qui commencent par le texte, puis ceux qui le contiennent,
// et à égalité les amis d'amis en premier.
async function parTexte(uid, texte) {
  const q = compact(texte);
  if (q.length < 2) throw new HttpsError("invalid-argument", "au moins 2 caractères");
  const col = db().collection("recherche").where("visible", "==", true);
  const debut = champ => col.where(champ, ">=", q).where(champ, "<=", q + "").orderBy(champ).limit(10).get();
  const [rel, ...snaps] = await Promise.all([relationsDe(uid), debut("pseudoNorm"), debut("nomNorm"), col.where("morceaux", "array-contains", morceauDe(q)).limit(40).get()]);
  const vus = new Map();
  snaps.forEach(s => s.docs.forEach(d => { if (!vus.has(d.id)) vus.set(d.id, d.data()); }));
  const mot = new RegExp("(^| )" + norm(texte).replace(/ /g, " ?"));
  const candidats = [...vus.values()]
    .filter(f => !rel.exclus.has(f.uid) && ((f.pseudoNorm || "").includes(q) || (f.nomNorm || "").includes(q)))
    .map(f => ({ f, rang: (f.pseudoNorm || "").startsWith(q) || (f.nomNorm || "").startsWith(q) || (f.mots || []).some(m => m.startsWith(q)) || mot.test((f.mots || []).join(" ")) ? 0 : 1, fof: false }))
    .sort((a, b) => a.rang - b.rang || a.f.pseudoNorm.length - b.f.pseudoNorm.length)
    .slice(0, 20);
  // Amis d'amis : un de mes amis est dans sa liste d'amis.
  if (rel.amis.size && candidats.length) {
    const reseaux = await db().getAll(...candidats.map(c => db().doc(`reseau/${c.f.uid}`)));
    reseaux.forEach((r, i) => { const c = candidats[i]; c.fof = !rel.amis.has(c.f.uid) && ((r.data() || {}).amis || []).some(a => rel.amis.has(a)); });
  }
  candidats.sort((a, b) => a.rang - b.rang || b.fof - a.fof || a.f.pseudoNorm.localeCompare(b.f.pseudoNorm));
  return candidats.slice(0, MAX_RESULTATS).map(c => publique(c.f));
}

async function rechercher(request) {
  if (!request.auth) throw new HttpsError("unauthenticated", "connexion requise");
  const uid = request.auth.uid, texte = String((request.data || {}).texte || "").trim().slice(0, 40);
  if ((await db().doc(`bans/${uid}`).get()).exists) throw new HttpsError("permission-denied", "compte suspendu");
  if (!CODE_RE.test(texte) && compact(texte).length < 2) throw new HttpsError("invalid-argument", "au moins 2 caractères");
  await limiter(uid);
  return { resultats: CODE_RE.test(texte) ? await parCode(uid, texte) : await parTexte(uid, texte) };
}

module.exports = { norm, compact, morceaux, ficheDe, majFicheProfil, majFicheBan, majReseau, rechercher, MAX_RESULTATS, PAR_MINUTE, PAR_JOUR };
