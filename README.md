# L’agenda du sportif

Application web publique pour noter ses séances de musculation, sa nutrition (compléments, créatine) et suivre ses progrès.
Chaque personne crée son compte (e-mail + mot de passe) et retrouve ses données sur tous ses appareils.
L’administrateur voit tous les utilisateurs, leurs statistiques et les messages envoyés depuis la page Contact.

L’app s’installe sur l’écran d’accueil d’un iPhone ou d’un Android comme une vraie application, et elle s’ouvre même sans réseau.

**Coût : 0 € en pratique.** La recherche d’utilisateurs utilise des fonctions serveur (Cloud Functions), qui demandent le forfait **Blaze** (paiement à l’usage) : son quota gratuit (2 millions d’appels par mois) suffit largement. Mets une alerte de budget (Google Cloud › Facturation › Budgets et alertes, par exemple 1 €). Les photos sont compressées et rangées dans la base de données, donc pas besoin du stockage payant.

---

## 1. Créer le projet Firebase (depuis un téléphone ou un ordinateur)

1. Va sur **https://console.firebase.google.com** et connecte-toi avec ton compte Google.
2. **Créer un projet**. Nom : `agenda-du-sportif` (ou un autre). Google Analytics n’est pas nécessaire.
3. Menu **Créer › Authentication** › **Commencer** › onglet **Mode de connexion** › **E-mail/Mot de passe** › active le premier interrupteur › **Enregistrer**.
   - Conseil : onglet **Modèles** › langue **français**, pour que l’e-mail « mot de passe oublié » soit en français.
4. Menu **Créer › Firestore Database** › **Créer une base de données**.
   - Emplacement : `eur3 (Europe)` ou `europe-west9 (Paris)`.
   - Mode : **production** (les vraies règles seront envoyées à l’étape 3).
5. Roue crantée **› Paramètres du projet › Général › Vos applications** › icône **`</>`** (Web).
   - Nom : `Agenda du sportif`. Ne coche pas « Firebase Hosting » à cette étape.
   - Copie le bloc `firebaseConfig` affiché.

## 2. Brancher l’app sur ton projet

- Colle les valeurs de `firebaseConfig` dans **`public/firebase-config.js`**.
- Remplace `REMPLACE-PAR-TON-ID-DE-PROJET` dans **`.firebaserc`** par l’identifiant du projet (le `projectId`).

Ces valeurs ne sont pas secrètes : c’est normal qu’elles soient visibles dans l’app. La sécurité vient des règles `firestore.rules`.

## 3. Mettre en ligne (depuis un ordinateur)

Il faut [Node.js](https://nodejs.org) (version 20 ou plus). Dans le dossier du projet :

```bash
npx firebase-tools login      # ouvre le navigateur pour te connecter à Google
npm run deploy                # envoie l’app et les règles de sécurité
```

À la fin, la commande affiche l’adresse publique, par exemple `https://agenda-du-sportif.web.app`. C’est le lien à partager.

Pour une mise à jour, relance simplement `npm run deploy`.

## 4. Devenir administrateur

1. Ouvre l’app et **crée ton compte** normalement.
2. Console Firebase › **Authentication › Utilisateurs** : copie ton **UID** (la longue suite de caractères sur ta ligne).
3. Console Firebase › **Firestore Database › + Commencer une collection** :
   - ID de la collection : `admins`
   - ID du document : **ton UID**
   - Un champ : `role` (chaîne) = `admin` › **Enregistrer**.
4. Recharge l’app : un bouton **Administration** apparaît dans ton **Profil**.

Personne ne peut se nommer administrateur depuis l’app : seul ce document, créé dans la console, donne l’accès.

## 5. Installer l’app sur l’écran d’accueil

- **iPhone** : ouvre le lien dans Safari › bouton **Partager** › **Sur l’écran d’accueil**.
- **Android** : Chrome › menu **⋮** › **Installer l’application**.

---

## Ce que contient le projet

| Fichier | Rôle |
|---|---|
| `public/index.html` | Les écrans de l’app |
| `public/css/` | Le thème noir et rouge, découpé par page (chargé dans l’ordre des numéros) |
| `public/app.js`, `public/js/` | La logique de l’app (voir « Organisation du code » plus bas) |
| `public/firebase-config.js` | Les identifiants de ton projet Firebase (à remplir) |
| `public/vendor/firebase.js` | Le SDK Firebase, déjà empaqueté (`npm run build` pour le régénérer) |
| `public/sw.js`, `public/manifest.webmanifest`, `public/icons/` | Installation sur l’écran d’accueil et fonctionnement hors ligne |
| `firestore.rules` | Règles de sécurité : chacun ne voit que ses données, l’admin voit tout |
| `firestore.indexes.json` | Index de la base (recherche d’utilisateurs) |
| `functions/` | Fonctions serveur : recherche d’utilisateurs (suggestions, limite de requêtes, fiches de recherche tenues à jour) |

### Organisation des données (Firestore)

- `users/{uid}` : profil (pseudo, photo, âge, taille, poids, objectif), préférences, types de séance, statistiques d’activité
- `users/{uid}/seances/{AAAA-MM-JJ}` : la séance du jour (exercices, séries, RPE, ressenti, photos)
- `users/{uid}/nutrition/{AAAA-MM-JJ}` : compléments et créatine du jour
- `users/{uid}/photos/{id}` : photos compressées
- `messages/{id}` : messages de la page Contact (lus par l’admin uniquement)
- `admins/{uid}` : liste des administrateurs (modifiable seulement depuis la console)
- `directory/{uid}` : fiche publique (pseudo, photo, code ami), lisible une par une, jamais en liste
- `recherche/{uid}`, `reseau/{uid}`, `limites/{uid}` : fiches de recherche, listes d’amis et compteurs de requêtes, **lus et écrits uniquement par le serveur**

## Tester en local (facultatif)

Il faut Java 11 ou plus. Laisse `public/firebase-config.js` vide et lance :

```bash
npm install
npm ci --prefix functions
npm run emulators
```

Puis ouvre http://127.0.0.1:5000 : l’app utilise des serveurs Firebase de test, sans toucher à tes vraies données.

## Tests automatiques

Les tests vérifient les règles de sécurité Firestore, la recherche d'utilisateurs côté serveur et les principaux parcours de l'app
(inscription, séance, record, suppression, export, social, recherche, signalement, modération).

```bash
npm install --no-save playwright@1.56.1 && npx playwright install chromium
npm ci --prefix functions
npm test   # démarre les émulateurs Firebase, lance les tests, puis les arrête
```

Ils tournent aussi automatiquement sur GitHub à chaque modification (onglet « Actions »).

## Mise en ligne sur Firebase Hosting

À chaque modification de `main`, le workflow « Tests et mise en ligne Firebase » lance les tests,
puis (s'ils passent) publie le site **et les règles de sécurité** sur https://agenda-du-sportif.web.app.

Réglage à faire une seule fois :
1. Console Firebase › Hosting › « Commencer » (passer les étapes).
2. Paramètres du projet › Comptes de service › « Générer une nouvelle clé privée ».
3. Google Cloud › IAM : donner au compte `firebase-adminsdk-…` les rôles « Administrateur Firebase » et « Consommateur Service Usage ».
4. GitHub › Settings › Secrets and variables › Actions › secret `FIREBASE_SERVICE_ACCOUNT` = contenu du fichier JSON.
5. Fonctions serveur (recherche d’utilisateurs) : passer le projet au forfait **Blaze**, activer les API
   (https://console.cloud.google.com/flows/enableapi?apiid=cloudfunctions.googleapis.com,cloudbuild.googleapis.com,artifactregistry.googleapis.com,run.googleapis.com,eventarc.googleapis.com,pubsub.googleapis.com&project=agenda-du-sportif),
   puis ajouter au même compte les rôles « Administrateur Cloud Functions », « Administrateur Cloud Run », « Utilisateur du compte de service »,
   « Administrateur Artifact Registry », « Éditeur Cloud Build », « Administrateur Eventarc » et, pour la première mise en ligne, « Administrateur IAM de projet ».
   La région des fonctions (`europe-west1`, dans `functions/index.js` et `public/js/commun/core.js`) doit être compatible avec l’emplacement de la base Firestore.
6. Une seule fois, après la première mise en ligne : `node scripts/remplir-recherche.cjs` (avec la clé du compte de service) pour ajouter les comptes déjà inscrits à la recherche.

Pendant la transition, l'ancienne adresse GitHub Pages reste en ligne ; passer `window.MOVED` à `true`
dans `public/index.html` y affiche la page « L'app déménage ».

## Organisation du code (`public/js/`)

`public/app.js` charge les parties de l'app dans l'ordre. Chaque dossier correspond à un sujet ; dans un dossier
découpé, `index.js` regroupe ce que les autres fichiers utilisent (et garde l'ordre de chargement d'origine).
Le détail (où modifier quoi) est dans `CLAUDE.md` à la racine.

| Dossier | Contenu |
|---|---|
| `commun/` | Démarrage (`boot.js`, tout premier chargé), base (`core.js`), enregistrement et navigation (`store.js`), thème, minuteur, installation, export, tutoriel guidé (`tutoriel.js`), fenêtre « Nouveautés » (`nouveautes.js`), démarrage temps réel (`main.js`) |
| `pages/` | Accueil, compte (connexion, profil), nutrition, contact, assistant (FAQ), carte musculaire, administration |
| `seances/` | Calendrier, fiche du jour (une fiche par sport), séries, photos, types de séance |
| `entrainement/` | Plusieurs séances par jour, « dernière fois », cordes, bibliothèque, records en direct, routines, programmes |
| `idees/` | CrossFit, idées de séances, records, catégories, courbes de progression |
| `social/`, `amis/` | Activité, fil, commentaires, défis, classements ; amis, page d'un ami, conversation |
| `comment-faire/` | Bouton « ? » et fenêtre « Comment faire » (recherche de la fiche, placement des mains, animation) |
| `silhouette/` | Mannequin articulé (profil et face) et matériel dessinés en SVG : longueurs fixes, poses données par des angles |
| `exercices/` | Une fiche par exercice, rangée par groupe (`exercices/<groupe>/<exercice>.js`), aides communes dans `_communs.js` |

Règles à respecter : `commun/core.js` n'importe jamais les autres fichiers (il doit être prêt en premier), et au chargement d'un fichier (hors fonctions) on n'utilise que des éléments de `core.js` (ou de `silhouette/`, qui n'importe rien).
