// Assistant : questions fréquentes, sans IA.
import { $, BENCH, S } from "../commun/core.js";
import { go } from "../commun/store.js";
import { lsGet, lsSet } from "../commun/install.js";
import { who } from "../amis/index.js";

/* ============================================================
   Assistant (FAQ, sans IA)
   ============================================================ */
const FAQ = [
  { q: "Comment savoir faire un exercice ?", k: "comment faire exercice mouvement technique animation silhouette aide executer",
    a: "Touche le petit « ? » rouge : dans ta séance à côté du nom de l’exercice, ou directement dans la recherche d’exercices (sans l’ajouter).\nLe mouvement est animé de profil et de face (départ puis arrivée, en boucle), avec un conseil de technique et, pour les pompes, développés et tractions, un schéma du placement des mains.\nLes muscles qui travaillent sont en rouge." },
  { q: "C’est quoi le bouton + Let’s go ?", k: "lets go let go lancer demarrer seance commencer accueil plus bouton barre",
    a: "Le gros bouton + au milieu de la barre du bas ouvre directement ta séance du jour.\nL’onglet « Séances » regroupe la séance libre (calendrier), tes routines, les programmes et les idées de séances. L’accueil montre ta carte musculaire, ta progression, tes trophées, tes records et ton bilan." },
  { q: "Comment créer une routine ?", k: "routine enregistrer sauvegarder modele refaire seance favorite",
    a: "Deux façons :\n• dans une séance, touche « ☆ Enregistrer comme routine » ;\n• ou Séances › Mes routines › « + Créer une routine ».\nEnsuite, un toucher sur « Lancer » et la séance est prête, avec tes poids de la dernière fois." },
  { q: "Comment suivre un programme ?", k: "programme plan semaines ppl full body 5x5 prepa 10 km suivre",
    a: "Séances › Programmes, puis « Suivre ce programme ».\nL’app te propose ensuite la bonne séance à chaque fois (« ▶ Lancer »), semaine après semaine." },
  { q: "C’est quoi « la dernière fois » ?", k: "derniere fois historique precedent poids pre rempli avant",
    a: "Quand tu ajoutes un exercice déjà fait, l’app affiche ce que tu as fait la dernière fois (↺) et reprend tes poids. Les répétitions sont proposées en gris : tape les tiennes ou valide la série." },
  { q: "Comment marchent les records en direct ?", k: "record nouveau pr battre trophee direct",
    a: "Quand tu valides une série plus lourde que ton meilleur résultat (ou plus de reps au même poids), le message « Nouveau record ! » s’affiche, avec des confettis. Pour la course : ta plus longue sortie et ta meilleure allure. Tes amis voient tes records dans le fil d’actu." },
  { q: "C’est quoi la série 🔥 ?", k: "serie flamme streak objectif semaine hebdo anneau",
    a: "Sur l’accueil, choisis ton objectif de séances par semaine (touche l’anneau). Chaque semaine où tu l’atteins fait grandir ta série 🔥. Les jours « Repos » ne comptent pas." },
  { q: "Plusieurs séances le même jour ?", k: "plusieurs deux seances meme jour matin soir double",
    a: "Oui : dans une séance, touche « + Autre séance » en haut, ou « + Nouvelle » dans Séances. Les séances du jour s’affichent en onglets." },
  { q: "C’est quoi la carte musculaire ?", k: "carte musculaire muscles corps travailles oublies",
    a: "Accueil › Carte musculaire : les muscles travaillés sur 7 ou 30 jours s’allument, du plus clair au plus rouge. Touche un muscle pour voir son nombre de séries." },
  { q: "Comment partager mon bilan ?", k: "bilan mois story partager instagram image recap",
    a: "Accueil › Bilan du mois, puis « 📲 Partager en story ». Une image est créée avec tes chiffres du mois : partage-la sur Insta, Snap ou WhatsApp." },
  { q: "Comment noter une séance de cordes ?", k: "corde cordes montee rope climb depart lest",
    a: "Touche un jour, puis choisis « Cordes ». Pour chaque exercice : nombre de cordes, départ toutes les X secondes ou minutes, avec ou sans lest.\n« ⏱ Lancer les départs » fait sonner le minuteur à chaque départ." },
  { q: "Comment lancer un défi ?", k: "defi challenge competition amis concours",
    a: "Social › Défis › « + Nouveau défi » : choisis ce qu’on compte (séances, jours actifs, km ou volume), la durée et les amis invités. Le classement se met à jour tout seul." },
  { q: "Comment commenter une séance ?", k: "commenter commentaire fil actu actualite feed",
    a: "Social : dans le fil d’actu, sous chaque séance de tes amis, écris ton commentaire et touche « Envoyer ». Tu vois les commentaires sur tes séances dans Social et dans la fiche de la séance." },
  { q: "Comment noter une séance ?", k: "noter seance ajouter entrainement jour calendrier creer",
    a: "Va dans Séances, puis touche le jour voulu dans le calendrier (ou « Noter la séance du jour »).\nChoisis ton activité : Musculation, CrossFit, Callisthénie ou Course à pied. Chaque activité a sa fiche adaptée." },
  { q: "Comment ajouter des séries ?", k: "serie series repetition reps poids kg exercice ajouter",
    a: "Dans ta séance, touche « + Ajouter un exercice », écris son nom, puis remplis Reps et Poids pour chaque série.\n« + Ajouter une série » recopie la série précédente pour aller plus vite." },
  { q: "Comment marche le temps de repos ?", k: "repos minuteur timer chrono temps pause recuperation",
    a: "Sous chaque exercice, règle ton temps de repos avec − et + (par pas de 15 s).\nAprès ta série, touche « ✓ Série 1 finie · repos » : la série passe en vert et le minuteur démarre. À la fin du repos, la série suivante s’allume toute seule. « +15 s » ajoute du temps, « Passer » passe directement à la série suivante." },
  { q: "Est-ce que ma séance s’enregistre ?", k: "enregistrer sauvegarder sauvegarde perdu perdre bouton valider",
    a: "Oui, tout s’enregistre tout seul pendant que tu écris, pas besoin de bouton.\nUn message rouge s’affiche en haut seulement s’il y a un problème de connexion." },
  { q: "C’est quoi le RPE ?", k: "rpe difficulte dur effort note",
    a: "Le RPE note la difficulté de 1 à 10.\n8 = il te restait 2 répétitions en réserve, 9 = 1 répétition, 10 = échec. Ça t’aide à savoir quand augmenter les charges." },
  { q: "Comment ajouter une photo ?", k: "photo image camera prendre physique",
    a: "Ouvre ta séance et descends jusqu’à « Photos », puis touche « + Prendre une photo ».\nTouche une photo pour l’agrandir ou la supprimer." },
  { q: "Comment reprendre ma dernière séance ?", k: "reprendre copier derniere precedente meme",
    a: "Sur un jour vide, choisis le type de séance : un bouton « Reprendre la dernière séance » apparaît. Il recopie tes exercices et tes poids." },
  { q: "Comment changer les types et les couleurs ?", k: "type couleur modifier push pull jambes cardio cordes repos",
    a: "Dans Séances, touche le bouton « Types ». Tu peux renommer un type, changer sa couleur (touche la pastille), en ajouter ou en retirer." },
  { q: "Comment noter ma créatine ?", k: "creatine prise dose",
    a: "Nutrition › Créatine : touche le grand rond, il devient rouge = prise.\nTu as oublié un jour ? Touche la date dans le calendrier en dessous. La dose se règle en bas de la page." },
  { q: "Comment ajouter un complément ?", k: "complement whey proteine omega vitamine magnesium supplement",
    a: "Nutrition › Compléments : touche un complément dans « Ajout rapide », ou écris-en un nouveau avec sa dose. Les flèches en haut changent de jour." },
  { q: "Comment installer l’app sur mon téléphone ?", k: "installer app application ecran accueil telecharger icone",
    a: "Sur iPhone : dans Safari, touche Partager puis « Sur l’écran d’accueil ».\nSur Android : menu ⋮ puis « Installer l’application ».\nTu retrouves aussi un bouton dans Profil." },
  { q: "Comment modifier mon profil ?", k: "profil modifier photo pseudo poids taille age objectif infos",
    a: "Touche « Vous » en bas à droite, puis « Modifier le profil ». Change ce que tu veux et touche « Enregistrer »." },
  { q: "J’ai oublié mon mot de passe", k: "mot de passe oublie oubli reinitialiser connexion connecter",
    a: "Sur l’écran de connexion, écris ton e-mail puis touche « Mot de passe oublié ? ». Tu reçois un lien par e-mail (regarde aussi dans les spams)." },
  { q: "Mes données sont-elles privées ?", k: "prive privee donnees securite voir confidentialite",
    a: "Les autres utilisateurs ne peuvent pas voir tes données.\nL’administrateur de l’application peut consulter les comptes pour gérer l’app et t’aider." },
  { q: "Ça marche sans internet ?", k: "internet hors connexion reseau wifi offline",
    a: "Oui, l’app s’ouvre sans réseau et garde tes modifications. Elles sont envoyées dès que la connexion revient." },
  { q: "Comment supprimer mon compte ?", k: "supprimer compte effacer desinscrire",
    a: "Vous › « Supprimer mon compte et mes données », puis confirme avec ton mot de passe. Tout est effacé définitivement." },
  { q: "Comment noter une course à pied ?", k: "course courir running footing endurance fondamentale seuil fractionne vma allure distance km",
    a: "Touche un jour › Course à pied, puis choisis Endurance fondamentale, Seuil ou Fractionné.\nEntre la distance et la durée : ton allure (min/km) et ta vitesse se calculent seules. Pour le seuil et le fractionné, ajoute tes blocs (ex. 10 × 400 m, récup 1:00) et lance le minuteur de récup." },
  { q: "Comment noter un WOD de CrossFit ?", k: "crossfit wod noter enregistrer score",
    a: "Touche un jour › CrossFit. Choisis le format (For Time, AMRAP, EMOM…), écris les mouvements, puis ton score et Rx ou Scaled.\nÉcris « Fran », « Murph »… dans le nom du WOD : les mouvements se remplissent tout seuls." },
  { q: "Où voir mes records de CrossFit ?", k: "record 1rm pr charge max benchmark girls fran murph cindy",
    a: "Sur l’accueil, touche CrossFit : tu y notes tes records (1RM) en back squat, clean, snatch… et tes temps sur les WOD de référence comme Fran ou Murph." },
  { q: "Comment noter une séance de callisthénie ?", k: "callisthenie calisthenics street workout traction dips muscle front lever planche handstand poids corps",
    a: "Touche un jour › Callisthénie. Ajoute tes exercices en un toucher (Tractions, Dips, Front lever…). Pour les figures tenues, touche « Reps ⇄ » pour noter des secondes. La colonne Lest sert si tu t’alourdis." },
  { q: "Où trouver des idées de séances ?", k: "idee idees seance type programme exemple inspiration essayer",
    a: "Sur l’accueil, touche « Séances types » puis choisis ton activité : Musculation (Push, Pull, Jambes…), CrossFit, Callisthénie ou Course à pied.\nChaque idée a un bouton « Essayer aujourd’hui » qui remplit ta séance du jour." },
  { q: "Où noter mes records (PR) ?", k: "record pr 5km 10km semi marathon developpe couche squat souleve",
    a: "Accueil › Records, puis choisis ta catégorie : Musculation, CrossFit, Callisthénie ou Course à pied. Touche + pour ajouter un record : ton meilleur s’affiche en gros." },
  { q: "Où voir ma progression ?", k: "progression graphique courbe evolution progres stats statistiques", a: "Accueil › Progression, puis choisis ta catégorie. En musculation, choisis Push, Pull… : chaque exercice a sa courbe avec ta charge max à chaque séance. Touche une courbe pour voir la valeur d’une séance." },
  { q: "Comment régler le son du minuteur ?", k: "son volume minuteur chrono bip alarme entendre fort",
    a: "Vous › « Son du minuteur » : règle le volume, choisis Bip, Alarme, Sifflet ou Gong, et touche « Tester le son ».\nSur iPhone, le son est coupé si le bouton silencieux (sur le côté) est activé." },
  { q: "C’est quoi la série en couleur ?", k: "serie couleur cours surligne verte",
    a: "Dans une séance, la série sur laquelle tu es est entourée de ta couleur principale (« Série en cours »). Remplis tes reps et ton poids, puis touche « ✓ Série finie » : elle passe en vert, le repos démarre, et la suivante s’allume à la fin du chrono." },
  { q: "Comment ajouter un ami ?", k: "ami amis ajouter code pseudo demande accepter", a: "Social › Amis (ou la loupe 🔍). Montre ton QR code (Vous › Partager) ou donne ton code ami (ex. THEO-4821) à tes potes, ou cherche leur code ou leur pseudo, puis touche « Ajouter ». Ton ami accepte la demande et c’est fait." },
  { q: "Comment envoyer un message à un ami ?", k: "message messages ecrire discuter conversation chat", a: "Social › 💬 en haut à droite, ou Amis puis touche 💬 à côté de ton ami. Les messages ne sont visibles que par vous deux. Un point rouge t’indique les nouveaux messages." },
  { q: "Comment essayer la séance d’un ami ?", k: "seance ami essayer copier suivre voir", a: "Social › Amis, touche ton ami puis une de ses séances, et « Essayer cette séance » : elle est copiée dans ta séance du jour, avec ses poids comme objectif. Tu peux aussi réagir avec 💪 🔥 👏." },
  { q: "Qui voit mes séances ?", k: "voir seances prive partager partage confidentialite amis", a: "Seulement tes amis acceptés, et seulement si « Partager mes séances avec mes amis » est activé (Social › Amis). Ta nutrition et tes infos personnelles ne sont jamais partagées." },
  { q: "Comment bloquer ou signaler quelqu’un ?", k: "bloquer signaler harcelement probleme insulte", a: "Dans une conversation, touche ••• puis « Bloquer » ou « Signaler ». Tu peux aussi toucher un message pour le signaler. Les signalements arrivent chez l’administrateur." },
  { q: "Comment contacter le créateur ?", k: "contact contacter createur probleme bug aide reclamation idee",
    a: "Touche « Contact » en bas de l’accueil, choisis un objet et écris ton message : il arrive directement chez moi." }
];
const norm = t => String(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, " ");
// Lexique : t = termes exacts (bonus de pertinence), lex = rubrique du lexique.
const GLOSS = [
  { lex: "cf", t: ["wod"], q: "C’est quoi un WOD ?", k: "wod workout day seance jour",
    a: "WOD = « Workout Of the Day », l’entraînement du jour.\nEn CrossFit, c’est la partie principale de la séance : souvent courte (5 à 20 min) et intense, elle mélange cardio, gymnastique et haltérophilie." },
  { lex: "cf", t: ["rx", "scaled", "scale"], q: "C’est quoi Rx et Scaled ?", k: "rx scaled prescribed adapte niveau",
    a: "Rx (« as prescribed ») = tu fais le WOD exactement comme il est écrit : charges, mouvements et répétitions officiels.\nScaled = version adaptée à ton niveau : charge plus légère, tractions avec élastique, pompes sur les genoux…\nFaire en Scaled n’a rien de honteux : c’est comme ça qu’on progresse sans se blesser." },
  { lex: "cf", t: ["fortime"], q: "C’est quoi un For Time ?", k: "for time chrono vite possible temps",
    a: "For Time = tu fais tout le travail demandé le plus vite possible. Ton score, c’est ton temps.\nIl y a souvent un « time cap » (temps maximum)." },
  { lex: "cf", t: ["cap", "timecap"], q: "C’est quoi un time cap ?", k: "time cap limite maximum",
    a: "Le time cap est le temps maximum autorisé pour un WOD.\nSi tu n’as pas fini à temps, ton score = le nombre de répétitions faites (on note par exemple « CAP + 12 »)." },
  { lex: "cf", t: ["amrap"], q: "C’est quoi un AMRAP ?", k: "amrap many rounds possible tours maximum",
    a: "AMRAP = « As Many Rounds As Possible » : un maximum de tours dans un temps donné.\nEx. : AMRAP 12 min de 5 tractions, 10 pompes, 15 squats. Tu enchaînes les tours jusqu’au bip.\nScore = tours complets + répétitions du tour en cours (ex. 8 tours + 7)." },
  { lex: "cf", t: ["emom", "e2mom"], q: "C’est quoi un EMOM ?", k: "emom every minute chaque minute",
    a: "EMOM = « Every Minute On the Minute » : au début de chaque minute, tu fais le travail demandé, puis tu te reposes le reste de la minute.\nEx. : EMOM 10 min : 3 power cleans. Plus tu vas vite, plus tu te reposes.\nUn « E2MOM » = toutes les 2 minutes." },
  { lex: "cf", t: ["tabata"], q: "C’est quoi un Tabata ?", k: "tabata 20 10 secondes intervalle",
    a: "Tabata = 8 tours de 20 secondes d’effort maximal / 10 secondes de repos, soit 4 minutes.\nScore : le total de répétitions, ou le tour le plus faible selon la consigne." },
  { lex: "cf", t: ["chipper"], q: "C’est quoi un Chipper ?", k: "chipper liste longue",
    a: "Un Chipper est une longue liste de mouvements avec beaucoup de répétitions, à faire une seule fois dans l’ordre.\nOn les « grignote » (to chip) petit à petit. Ex. : 50 box jumps, 50 wall balls, 50 burpees…" },
  { lex: "cf", t: ["21159"], q: "Que veut dire 21-15-9 ?", k: "21 15 9 schema repetitions",
    a: "C’est un schéma de répétitions : 21 de chaque mouvement, puis 15, puis 9.\nEx. Fran : 21 thrusters, 21 tractions, 15 thrusters, 15 tractions, 9 thrusters, 9 tractions." },
  { lex: "cf", t: ["1rm", "rm", "pr"], q: "C’est quoi un 1RM et un PR ?", k: "1rm rm pr record personnel charge max repetition",
    a: "1RM = « 1 Repetition Max » : la charge la plus lourde que tu peux soulever une seule fois.\nPR = « Personal Record », ton record personnel. Note-les dans l’onglet CrossFit pour suivre tes progrès." },
  { lex: "cf", t: ["girls", "girl", "hero", "heroes", "benchmark"], q: "C’est quoi les Girls et les Hero WODs ?", k: "girls hero benchmark reference fran murph grace cindy",
    a: "Ce sont des WOD de référence (« benchmarks »), toujours identiques, pour mesurer tes progrès.\nLes « Girls » portent des prénoms féminins (Fran, Grace, Cindy…). Les « Hero WODs » rendent hommage à des militaires ou pompiers morts en service (Murph…).\nTu les retrouves tous dans l’onglet CrossFit." },
  { lex: "cf", t: ["kg"], q: "Que veut dire 43/29 kg ?", k: "charge homme femme slash deux poids",
    a: "Deux charges séparées par « / » = charge homme / charge femme.\nEx. Thrusters 43/29 kg : 43 kg pour les hommes, 29 kg pour les femmes (version Rx)." },
  { lex: "cf", t: ["metcon"], q: "C’est quoi un Metcon ?", k: "metcon metabolic conditioning cardio",
    a: "Metcon = « metabolic conditioning » : la partie intense et cardio du WOD, qui fait monter le cœur (souvent un For Time ou un AMRAP)." },
  { lex: "cf", t: ["box"], q: "C’est quoi une box ?", k: "box salle crossfit",
    a: "Une « box » est une salle de CrossFit." },
  { lex: "cf", t: ["kipping", "strict", "butterfly"], q: "Kipping ou strict, c’est quoi ?", k: "kipping strict balancement elan traction",
    a: "Strict = mouvement sans élan (ex. traction stricte).\nKipping = on utilise un balancement du corps pour enchaîner plus vite (tractions, toes to bar, HSPU). Le « butterfly » est un kipping encore plus rapide." },
  { lex: "cf", t: ["unbroken"], q: "Que veut dire Unbroken ?", k: "unbroken sans pause lacher",
    a: "Unbroken = toutes les répétitions d’une série sans t’arrêter ni lâcher la barre." },
  { lex: "cf", t: ["thruster", "thrusters"], q: "C’est quoi un thruster ?", k: "thruster squat developpe",
    a: "Un thruster = un front squat enchaîné avec un développé au-dessus de la tête, en un seul mouvement fluide : tu utilises l’élan de la remontée du squat pour pousser la barre." },
  { lex: "cf", t: ["wall", "wallball", "wallballs"], q: "C’est quoi un wall ball ?", k: "wall ball medecine ballon mur cible",
    a: "Wall ball = un squat avec un médecine-ball contre la poitrine, puis tu lances le ballon vers une cible au mur (3 m pour les hommes, 2,70 m pour les femmes) et tu le rattrapes." },
  { lex: "cf", t: ["double", "unders", "du"], q: "C’est quoi un double under ?", k: "double under corde sauter",
    a: "Double under = à la corde à sauter, la corde passe 2 fois sous tes pieds pendant un seul saut." },
  { lex: "cf", t: ["t2b", "toes"], q: "C’est quoi un toes to bar ?", k: "toes to bar pieds barre suspendu abdos",
    a: "Toes to bar = suspendu à la barre, tu montes les pieds jusqu’à toucher la barre." },
  { lex: "cf", t: ["muscleup", "muscle"], q: "C’est quoi un muscle-up ?", k: "muscle up anneaux barre traction dips",
    a: "Muscle-up = une traction enchaînée avec un dips pour passer le buste au-dessus de la barre ou des anneaux. C’est un mouvement avancé." },
  { lex: "cf", t: ["hspu"], q: "C’est quoi un HSPU ?", k: "hspu handstand push up pompe equilibre",
    a: "HSPU = « Handstand Push-Up » : une pompe en équilibre sur les mains, les pieds contre le mur." },
  { lex: "cf", t: ["clean", "snatch", "jerk", "epaule", "arrache"], q: "Clean, snatch, jerk : c’est quoi ?", k: "clean snatch jerk epaule arrache jete halterophilie",
    a: "Ce sont les mouvements d’haltérophilie :\n• Clean (épaulé) : la barre passe du sol aux épaules.\n• Jerk (jeté) : des épaules au-dessus de la tête.\n• Clean & jerk : les deux enchaînés.\n• Snatch (arraché) : du sol au-dessus de la tête en un seul mouvement.\n« Power » = réception en demi-squat au lieu du squat complet." },
  { lex: "cf", t: ["kb", "kettlebell", "swing", "swings"], q: "C’est quoi un KB swing ?", k: "kb kettlebell swing balancier",
    a: "KB swing = tu balances une kettlebell entre les jambes puis jusqu’à hauteur des yeux (swing russe) ou au-dessus de la tête (swing américain), grâce à la poussée des hanches." },
  { lex: "cf", t: ["burpee", "burpees"], q: "C’est quoi un burpee ?", k: "burpee",
    a: "Burpee = tu poses la poitrine au sol, tu te relèves et tu sautes en tapant des mains au-dessus de la tête." },
  { lex: "run", t: ["ef", "endurance", "fondamentale"], q: "C’est quoi l’endurance fondamentale ?", k: "endurance fondamentale ef lent footing zone 2",
    a: "L’endurance fondamentale (EF) est une allure lente et confortable : tu peux parler en courant. Environ 60 à 75 % de ta fréquence cardiaque max.\nElle représente la majorité de l’entraînement d’un coureur : elle développe le « moteur » sans fatiguer." },
  { lex: "run", t: ["seuil"], q: "C’est quoi le seuil ?", k: "seuil lactique allure tempo",
    a: "Le seuil est une allure soutenue mais contrôlée, que tu pourrais tenir environ 45 min à 1 h en course. Environ 85 à 90 % de ta FC max.\nEn séance, on le travaille par blocs (ex. 3 × 10 min au seuil, 2 min de récup)." },
  { lex: "run", t: ["fractionne", "fractionnee", "intervalle", "interval"], q: "C’est quoi le fractionné ?", k: "fractionne intervalle vitesse repetition",
    a: "Le fractionné alterne des efforts rapides et des récupérations.\nEx. : 10 × 400 m vite avec 1 min de récup, ou 30/30. C’est ce qui fait progresser ta vitesse et ta VMA." },
  { lex: "run", t: ["vma"], q: "C’est quoi la VMA ?", k: "vma vitesse maximale aerobie",
    a: "VMA = Vitesse Maximale Aérobie : la vitesse à laquelle tu consommes le maximum d’oxygène. Tu peux la tenir environ 4 à 7 minutes.\nOn s’en sert pour régler les allures du fractionné (ex. 30/30 à 100 % de VMA)." },
  { lex: "run", t: ["allure", "pace"], q: "C’est quoi l’allure ?", k: "allure pace min km vitesse",
    a: "L’allure est le temps pour parcourir 1 km (ex. 5:00 /km).\n5:00 /km = 12 km/h, 6:00 /km = 10 km/h, 4:00 /km = 15 km/h. L’app la calcule toute seule à partir de ta distance et de ta durée." },
  { lex: "run", t: ["3030"], q: "C’est quoi un 30/30 ?", k: "30 30 trente fractionne court",
    a: "30/30 = 30 secondes vite (autour de ta VMA) puis 30 secondes lentement, à répéter (ex. 2 × 10 fois). C’est un fractionné court classique." },
  { lex: "run", t: ["fc", "bpm", "cardiaque", "frequence"], q: "C’est quoi la FC max ?", k: "fc frequence cardiaque max bpm coeur",
    a: "La FC max est ta fréquence cardiaque maximale (en battements par minute). Une estimation simple : 220 − ton âge, mais elle varie beaucoup d’une personne à l’autre.\nLa FC moyenne de ta sortie se lit sur ta montre." }
];
const BENCH_NOTES = {
  murph: "Tu peux découper les tractions, pompes et squats comme tu veux (ex. 20 tours de 5-10-15), mais la course se fait au début et à la fin.",
  cindy: "Enchaîne les tours sans t’arrêter pendant 20 minutes : ton score = tours + reps.",
  fran: "C’est l’un des WOD les plus connus : très court (souvent 3 à 10 min) mais très intense.",
  helen: "Enchaîne 3 fois : la course, les swings puis les tractions.",
  annie: "50 double unders et 50 sit-ups, puis 40 et 40, etc. jusqu’à 10."
};
GLOSS.forEach(g => FAQ.push(g));
BENCH.forEach(bm => FAQ.push({
  lex: "wod", t: [norm(bm.name).trim()], q: `C’est quoi le WOD ${bm.name} ?`, k: norm(bm.name) + " wod benchmark",
  a: `${bm.name} : ${bm.desc}.\n${bm.type === "amrap" ? `C’est un AMRAP de ${bm.cap} min : ton score est ton nombre de tours + reps.` : "C’est un For Time : ton score est ton temps."}${BENCH_NOTES[bm.id] ? "\n" + BENCH_NOTES[bm.id] : ""}\nNote ton résultat dans l’onglet CrossFit.`
}));
const STOP = new Set("je tu il le la les de du un en et ou ce ca sa ma ta se ne on au comment pour avec dans une des est que qui quoi quel quelle quels mon mes ton tes son ses faire fait fais peux peut puis sur pas par plus moins tout tous toute cette ces aux the and elle ils nous vous etre avoir suis sont veux voudrais savoir aide aider app application veut dire signifie explique expliquer ".split(" "));
function helpAdd(text, who) {
  const d = document.createElement("div"); d.className = "bubble " + who; d.textContent = text;
  $("helpMsgs").appendChild(d); $("helpMsgs").scrollTop = $("helpMsgs").scrollHeight;
}
function helpSuggest(list, withContact) {
  const w = document.createElement("div"); w.className = "help-sugg";
  list.forEach(i => { const b = document.createElement("button"); b.type = "button"; b.textContent = FAQ[i].q; b.dataset.faq = i; w.appendChild(b); });
  if (withContact) { const b = document.createElement("button"); b.type = "button"; b.textContent = "✉️ Écrire au créateur"; b.dataset.contact = "1"; w.appendChild(b); }
  $("helpMsgs").appendChild(w); $("helpMsgs").scrollTop = $("helpMsgs").scrollHeight;
}
function helpAnswer(i) { helpAdd(FAQ[i].q, "me"); setTimeout(() => helpAdd(FAQ[i].a, "bot"), 250); }
function helpOpen() {
  $("helpPanel").hidden = false; $("helpFab").hidden = true; $("helpHint").hidden = true;
  if (!$("helpMsgs").children.length) {
    const who = S.profile && S.profile.pseudo ? " " + S.profile.pseudo : "";
    helpAdd("Salut" + who + " 👋 Je réponds aux questions fréquentes sur l’app. Choisis une question ou écris la tienne.", "bot");
    helpSuggest([0, 16, 17, 2, 5, 8], false);
    helpLexButtons();
  }
}
function helpLexButtons() {
  const w = document.createElement("div"); w.className = "help-sugg";
  [["cf", "📖 Lexique CrossFit"], ["wod", "📖 Explication des WOD"], ["run", "📖 Lexique course à pied"]].forEach(([id, label]) => {
    const b = document.createElement("button"); b.type = "button"; b.className = "lex"; b.textContent = label; b.dataset.lex = id; w.appendChild(b);
  });
  $("helpMsgs").appendChild(w); $("helpMsgs").scrollTop = $("helpMsgs").scrollHeight;
}
function helpClose() { $("helpPanel").hidden = true; updateFab(); }
$("helpFab").onclick = () => { lsSet("help-hint-off", 1); helpOpen(); };
$("helpClose").onclick = helpClose;
$("helpMsgs").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  if (b.dataset.contact) { helpClose(); go("contactform"); return; }
  if (b.dataset.lex) {
    const titles = { cf: "Lexique CrossFit", wod: "Explication des WOD", run: "Lexique course à pied" };
    helpAdd(titles[b.dataset.lex], "me");
    setTimeout(() => { helpAdd("Choisis le mot ou le WOD que tu veux comprendre :", "bot"); helpSuggest(FAQ.map((f, i) => f.lex === b.dataset.lex ? i : -1).filter(i => i >= 0), false); }, 250);
    return;
  }
  if (b.dataset.faq != null) helpAnswer(+b.dataset.faq);
});
$("helpForm").addEventListener("submit", e => {
  e.preventDefault();
  const text = $("helpInput").value.trim(); if (!text) return;
  $("helpInput").value = ""; helpAdd(text, "me");
  const raw = norm(text), words = raw.split(" ").filter(w => w.length > 1 && !STOP.has(w));
  const joined = raw.replace(/\s+/g, "");
  const scored = FAQ.map((f, i) => {
    const hay = norm(f.k + " " + f.q);
    let score = words.reduce((a, w) => a + (w.length > 2 && (hay.includes(w) || hay.includes(w.replace(/s$/, ""))) ? 1 : 0) + ((f.t || []).includes(w) ? 3 : 0), 0);
    (f.t || []).forEach(t => { if (t.length > 3 && !words.includes(t) && joined.includes(t)) score += 3; });
    return { i, score };
  }).filter(x => x.score > 0).sort((a, b) => b.score - a.score);
  setTimeout(() => {
    if (scored.length) {
      helpAdd(FAQ[scored[0].i].a, "bot");
      const more = scored.slice(1, 3).filter(x => x.score >= Math.max(2, scored[0].score));
      if (more.length) { helpAdd("Ça peut aussi t’aider :", "bot"); helpSuggest(more.map(x => x.i), false); }
    } else {
      helpAdd("Je n’ai pas trouvé de réponse à ta question. Tu peux écrire directement au créateur de l’app, il te répondra.", "bot");
      helpSuggest([0, 10, 12], true);
    }
  }, 300);
});
const FAB_SCREENS = ["home", "seances", "nutrition", "complements", "creatine", "contact", "profile", "crossfit", "types", "hub", "records", "rec", "progress", "prog", "friends", "friend", "go", "social", "messages", "share", "challenges", "challenge", "ranks", "muscles", "recap", "routines", "programs"];
let hintReady = false;
setTimeout(() => { hintReady = true; updateFab(); }, 2500);
function updateFab() {
  $("helpFab").hidden = !FAB_SCREENS.includes(S.screen) || !$("helpPanel").hidden;
  $("helpHint").hidden = $("helpFab").hidden || !hintReady || !!lsGet("help-hint-off");
}
function hideHint() { lsSet("help-hint-off", 1); $("helpHint").hidden = true; }
$("helpHintClose").onclick = hideHint;
$("helpHintOpen").onclick = () => { hideHint(); helpOpen(); };

export { FAB_SCREENS, norm, updateFab };
