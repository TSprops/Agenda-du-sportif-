# L'agenda du sportif — repères pour Claude

PWA en JavaScript sans framework (modules ES), Firebase (Auth + Firestore). Répondre en français.

**Pour modifier un exercice, lis uniquement son fichier et le composant commun si nécessaire. Ne parcours pas tout le projet.**

## Structure (`public/`)

- `index.html` : tous les écrans (HTML), y compris les diapositives « Nouveautés ».
- `app.js` : charge les modules dans l'ordre. `data.js` : listes d'exercices, muscles, programmes.
- `css/NN-sujet.css` : styles, chargés dans l'ordre des numéros (l'ordre compte).
- `js/exercices/<groupe>/<exercice>.js` : une fiche « Comment faire » par exercice (vues, conseils, animation).
  Groupes : `crossfit`, `calisthenie`, `abdos`, `jambes`, `dos`, `epaules`, `pectoraux`, `bras`.
- `js/silhouette/` : mannequin SVG et matériel (commun à toutes les fiches).
- `js/comment-faire/` : bouton « ? » et fenêtre de la fiche.
- `js/seances/` : calendrier et fiche du jour (`fiche-muscu-calis.js`, `fiche-course.js`, `fiche-crossfit.js`, `fiche-cordes.js`…).
- `js/entrainement/` : bibliothèque, routines, programmes, records en direct, « dernière fois ».
- `js/idees/` : idées de séances, records, progression, CrossFit.
- `js/social/`, `js/amis/` : fil, commentaires, défis, classements ; amis, conversation.
- `js/pages/` : accueil, compte, nutrition, contact, FAQ, carte musculaire, admin.
- `js/commun/` : démarrage, base (`core.js`), enregistrement et navigation (`store.js`), thème, minuteur, etc.

## Règle de nommage

- Français, minuscules, mots séparés par des tirets, sans accents : `developpe-couche.js`.
- Une fiche porte le nom de l'exercice : « Développé couché » → `exercices/pectoraux/developpe-couche.js`.
- `_communs.js` : aides partagées par les fichiers de son dossier.
- `index.js` : point d'entrée d'un dossier. Il regroupe ce que les autres modules utilisent et garde l'ordre de chargement. Les autres dossiers importent `index.js`, jamais une partie.

## Éléments communs

- **Silhouette** : `js/silhouette/` (poses → `mannequin-profil.js` / `mannequin-face.js`, matériel → `materiel-*.js`).
- **Animation** : `js/silhouette/animation.js` (passage d'une pose à l'autre) et `js/comment-faire/lecture.js` (lecture).
- **Tutoriel guidé** : `js/commun/tutoriel.js`.
- **Nouveautés** : `js/commun/nouveautes.js`, avec les diapositives dans `index.html` (`#news…`).
- **Célébration** (confettis, son, message) : `js/commun/fete.js`. **Trophées** : `js/pages/trophees.js`.
- **Contact** : `js/pages/contact.js`. Le bouton est sur l'accueil (`#homeLinks` dans `index.html`).
- **Barre du bas** : `js/commun/barre-onglets.js` (Accueil, Séances, « + » = séance du jour, Social, Vous).
- **Accueil (tableau de bord) et page Séances** : `js/pages/accueil.js`. Styles avec Social et profil dans `css/13-accueil-profil-social.css`.
- **Partager mon profil** (QR code, code ami, lien `?ami=CODE`, scanner) : `js/amis/partage-profil.js`, avec `vendor/qrcode.js`.
- **Recherche d'utilisateurs** (suggestions pendant la frappe) : `js/amis/recherche.js` côté app, `functions/recherche.js` côté serveur (Cloud Functions : `rechercherUtilisateurs`, fiches `recherche/`, `reseau/`, limites `limites/`). Option « Ne pas apparaître dans la recherche » et « Nom affiché » dans `js/pages/compte.js`.
- **Styles** : « Comment faire » dans `css/10-comment-faire.css`, Nouveautés et tutoriel dans `css/11-nouveautes-tutoriel.css`.

## Langues (français, anglais, espagnol)

- **Aucun texte visible en dur** : tout passe par `t("ecran.element")` (`js/commun/i18n.js`), avec les textes dans `langues/fr.json`, `en.json`, `es.json` (clés rangées par écran). HTML : `data-i18n`, `data-i18n-html`, `data-i18n-placeholder`, `data-i18n-aria-label`, `data-i18n-title`.
- Variables `{nom}` et pluriels (`cle_one` / `cle_other`, choisis par `{n}`) : jamais de concaténation. Dates et nombres : `dateFormat`, `dateLongue`, `nombre`… de `i18n.js` (ou `fmtJour`, `fmtCourt`… de `core.js`).
- Valeurs enregistrées en base (noms d'exercices, objectifs, types…) : **gardées en français**, traduites à l'affichage avec `valeur("exercices.noms", nom)` (ou `nomEx`, `nomType`), et ramenées au français avant d'enregistrer avec `canon(...)`. Contenu écrit en plusieurs langues : `{ fr, en, es }` lu avec `texteLocal()`.
- Ajouter un texte : la même clé dans les trois fichiers. Ajouter une langue : copier `fr.json` en `<code>.json`, traduire (y compris `_langue`), puis `node scripts/liste-hors-ligne.cjs`.
- `node scripts/verifier-traductions.cjs` : clés manquantes ou inutilisées, variables différentes, texte français en dur (`// i18n-ignore` en fin de ligne pour une exception voulue). Les tests le lancent.
- Fiches « Comment faire » : textes sous `fiches.<nom-du-fichier>.consigne|conseilN|legendeN`.
- Pages légales : section `pagesLegales` (la version française fait foi).

## Ajouter ou renommer un fichier

1. Nouvel exercice : créer sa fiche, puis l'enregistrer dans `js/exercices/index.js` (un `import` et une ligne `HOW["Nom"] = …`).
2. Lancer `node scripts/liste-hors-ligne.cjs` pour mettre à jour la liste hors connexion de `sw.js` (et la liste des langues, et les manifestes par langue). Un test le vérifie.

## Mise en ligne

Chaque push sur `main` teste puis déploie. Il faut augmenter la version partout :

- `APP_VERSION` dans `js/commun/boot.js` ;
- `?v=` et `APP_PAGE_VERSION` dans `index.html` ;
- `agenda-vNN` et `?v=` dans `sw.js`.

Tests : `npm test` (émulateurs Firebase + Playwright).
