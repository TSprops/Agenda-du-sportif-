// Fonctions serveur (Cloud Functions) de L'agenda du sportif.
// Région : doit être compatible avec l'emplacement de la base Firestore (europe-west1 pour une base « eur3 »).
const { initializeApp } = require("firebase-admin/app");
const { setGlobalOptions } = require("firebase-functions/v2");
const { onCall } = require("firebase-functions/v2/https");
const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const R = require("./recherche.js");

initializeApp();
setGlobalOptions({ region: "europe-west1", maxInstances: 10 });

// Appelée par l'app : suggestions d'utilisateurs pendant la frappe (5 au maximum).
exports.rechercherUtilisateurs = onCall(request => R.rechercher(request));

// Fiche de recherche tenue à jour à chaque modification du profil (et effacée avec le compte).
exports.majRechercheProfil = onDocumentWritten("users/{uid}", e =>
  R.majFicheProfil(e.params.uid, e.data.before.exists ? e.data.before.data() : null, e.data.after.exists ? e.data.after.data() : null));

// Utilisateur suspendu : retiré de la recherche.
exports.majRechercheBan = onDocumentWritten("bans/{uid}", e => R.majFicheBan(e.params.uid, e.data.after.exists));

// Amitiés : liste d'amis de chacun, pour classer les amis d'amis en premier.
exports.majReseauAmis = onDocumentWritten("friends/{pid}", e => {
  const f = (e.data.after.exists ? e.data.after : e.data.before).data() || {};
  return Promise.all((f.users || []).map(R.majReseau));
});
