// À lancer une fois après la première mise en ligne de la recherche d'utilisateurs :
// crée les fiches de recherche et les listes d'amis des comptes déjà inscrits.
// (Ensuite, le serveur les tient à jour tout seul.)
//   npm ci --prefix functions
//   GOOGLE_APPLICATION_CREDENTIALS=cle-compte-de-service.json node scripts/remplir-recherche.cjs
const { initializeApp } = require("../functions/node_modules/firebase-admin/app");
const { getFirestore } = require("../functions/node_modules/firebase-admin/firestore");
initializeApp({ projectId: process.env.GCLOUD_PROJECT || "agenda-du-sportif" });
const R = require("../functions/recherche.js");

(async () => {
  const users = await getFirestore().collection("users").get();
  let n = 0;
  for (const d of users.docs) {
    await R.majFicheProfil(d.id, null, d.data());
    await R.majReseau(d.id);
    if (++n % 50 === 0) console.log(n + " comptes…");
  }
  console.log(`${n} comptes ajoutés à la recherche.`);
})().catch(e => { console.error(e); process.exit(1); });
