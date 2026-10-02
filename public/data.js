/* Données fixes de l'app : muscles, bibliothèque d'exercices et programmes prêts à suivre.
   Les noms d'exercices sont des identifiants en français (enregistrés tels quels dans les séances) :
   leur traduction est dans langues/<code>.json, rubrique « exercices.noms », et s'affiche avec nomEx(). */
import { t } from "./js/commun/i18n.js";

// Muscles (identifiants utilisés par la carte musculaire).
export const MUSCLES = Object.fromEntries(["pecs", "epaules", "biceps", "triceps", "avantbras", "abdos", "obliques", "trapezes", "dorsaux", "lombaires",
  "fessiers", "quadriceps", "ischios", "mollets"].map(id => [id, t("muscles.noms." + id)]));
// Filtres de la bibliothèque : groupe → muscles concernés.
export const GROUPS = [
  ["pecs", ["pecs"]], ["dos", ["dorsaux", "trapezes", "lombaires"]], ["epaules", ["epaules"]],
  ["bras", ["biceps", "triceps", "avantbras"]], ["jambes", ["quadriceps", "ischios", "mollets"]],
  ["fessiers", ["fessiers"]], ["abdos", ["abdos", "obliques"]]
].map(([id, list]) => [id, t("bibliotheque.groupes." + id), list]);
export const EQUIP = Object.fromEntries(["B", "H", "M", "P", "C", "K", "E"].map(id => [id, t("bibliotheque.materiel." + id)]));

// [nom, muscles principaux, muscles secondaires, matériel, tenue (secondes) ?]
export const EXERCISES = [
  // Pectoraux
  ["Développé couché", ["pecs"], ["triceps", "epaules"], "B"],
  ["Développé couché haltères", ["pecs"], ["triceps", "epaules"], "H"],
  ["Développé incliné", ["pecs"], ["epaules", "triceps"], "B"],
  ["Développé incliné haltères", ["pecs"], ["epaules", "triceps"], "H"],
  ["Développé décliné", ["pecs"], ["triceps"], "B"],
  ["Écarté haltères", ["pecs"], ["epaules"], "H"],
  ["Écarté poulie haute", ["pecs"], ["epaules"], "P"],
  ["Écarté poulie moyenne", ["pecs"], ["epaules"], "P"],
  ["Écarté poulie basse", ["pecs"], ["epaules"], "P"],
  ["Pec deck (butterfly)", ["pecs"], [], "M"],
  ["Presse pectoraux", ["pecs"], ["triceps"], "M"],
  ["Pompes", ["pecs"], ["triceps", "epaules", "abdos"], "C"],
  ["Pompes diamant", ["triceps", "pecs"], ["epaules"], "C"],
  ["Dips", ["pecs", "triceps"], ["epaules"], "C"],
  ["Pull-over", ["pecs", "dorsaux"], ["triceps"], "H"],
  // Dos
  ["Tractions", ["dorsaux"], ["biceps", "avantbras"], "C"],
  ["Tractions lestées", ["dorsaux"], ["biceps", "avantbras"], "C"],
  ["Tractions supination (chin-up)", ["dorsaux", "biceps"], ["avantbras"], "C"],
  ["Tractions australiennes", ["dorsaux"], ["biceps", "trapezes"], "C"],
  ["Tirage vertical", ["dorsaux"], ["biceps"], "P"],
  ["Tirage vertical prise serrée", ["dorsaux"], ["biceps"], "P"],
  ["Tirage horizontal", ["dorsaux", "trapezes"], ["biceps"], "P"],
  ["Rowing barre", ["dorsaux", "trapezes"], ["biceps", "lombaires"], "B"],
  ["Rowing haltère", ["dorsaux"], ["biceps", "trapezes"], "H"],
  ["Rowing T-bar", ["dorsaux", "trapezes"], ["biceps"], "B"],
  ["Rowing machine", ["dorsaux", "trapezes"], ["biceps"], "M"],
  ["Soulevé de terre", ["lombaires", "fessiers", "ischios"], ["dorsaux", "trapezes", "quadriceps", "avantbras"], "B"],
  ["Soulevé de terre roumain", ["ischios", "fessiers"], ["lombaires"], "B"],
  ["Soulevé de terre sumo", ["fessiers", "quadriceps", "lombaires"], ["ischios", "trapezes"], "B"],
  ["Shrugs", ["trapezes"], ["avantbras"], "H"],
  ["Face pull", ["epaules", "trapezes"], [], "P"],
  ["Extension lombaire", ["lombaires"], ["fessiers", "ischios"], "M"],
  ["Good morning", ["ischios", "lombaires"], ["fessiers"], "B"],
  // Épaules
  ["Développé militaire", ["epaules"], ["triceps", "trapezes"], "H"],
  ["Développé Arnold", ["epaules"], ["triceps"], "H"],
  ["Élévations latérales", ["epaules"], ["trapezes"], "H"],
  ["Élévations latérales à la poulie", ["epaules"], [], "P"],
  ["Élévations frontales", ["epaules"], ["pecs"], "H"],
  ["Oiseau (arrière d’épaule)", ["epaules"], ["trapezes"], "H"],
  ["Rowing menton", ["epaules", "trapezes"], ["biceps"], "B"],
  ["Push press", ["epaules"], ["triceps", "quadriceps"], "B"],
  // Bras
  ["Curl barre", ["biceps"], ["avantbras"], "B"],
  ["Curl haltères", ["biceps"], ["avantbras"], "H"],
  ["Curl marteau", ["biceps", "avantbras"], [], "H"],
  ["Curl incliné", ["biceps"], [], "H"],
  ["Curl pupitre", ["biceps"], [], "M"],
  ["Curl à la poulie", ["biceps"], ["avantbras"], "P"],
  ["Extension triceps à la poulie", ["triceps"], [], "P"],
  ["Extension triceps nuque", ["triceps"], [], "H"],
  ["Barre au front", ["triceps"], [], "B"],
  ["Développé couché prise serrée", ["triceps", "pecs"], ["epaules"], "B"],
  ["Kickback triceps", ["triceps"], [], "H"],
  ["Curl poignets", ["avantbras"], [], "H"],
  ["Farmer walk", ["avantbras", "trapezes"], ["abdos"], "H"],
  ["Montée de corde", ["dorsaux", "biceps"], ["avantbras", "abdos"], "C"],
  ["Montée de corde avec jambes", ["dorsaux", "biceps"], ["avantbras", "abdos", "quadriceps"], "C"],
  ["Montée de corde départ assis", ["dorsaux", "biceps"], ["avantbras", "abdos"], "C"],
  // Jambes
  ["Squat", ["quadriceps", "fessiers"], ["ischios", "lombaires", "abdos"], "B"],
  ["Front squat", ["quadriceps"], ["fessiers", "abdos"], "B"],
  ["Squat goblet", ["quadriceps", "fessiers"], ["abdos"], "K"],
  ["Hack squat", ["quadriceps"], ["fessiers"], "M"],
  ["Presse à cuisses", ["quadriceps", "fessiers"], ["ischios"], "M"],
  ["Fentes", ["quadriceps", "fessiers"], ["ischios"], "H"],
  ["Fentes bulgares", ["quadriceps", "fessiers"], ["ischios"], "H"],
  ["Leg extension", ["quadriceps"], [], "M"],
  ["Leg curl", ["ischios"], [], "M"],
  ["Hip thrust", ["fessiers"], ["ischios"], "B"],
  ["Pont fessier", ["fessiers"], ["ischios"], "C"],
  ["Abducteurs machine", ["fessiers"], [], "M"],
  ["Step-up", ["quadriceps", "fessiers"], [], "H"],
  ["Mollets debout", ["mollets"], [], "M"],
  ["Mollets assis", ["mollets"], [], "M"],
  ["Squats (poids du corps)", ["quadriceps", "fessiers"], [], "C"],
  ["Pistol squat", ["quadriceps", "fessiers"], ["abdos"], "C"],
  ["Box jumps", ["quadriceps", "fessiers"], ["mollets"], "C"],
  // Abdos
  ["Crunch", ["abdos"], [], "C"],
  ["Crunch à la poulie", ["abdos"], [], "P"],
  ["Relevés de jambes", ["abdos"], ["obliques"], "C"],
  ["Toes to bar", ["abdos"], ["dorsaux", "avantbras"], "C"],
  ["Gainage", ["abdos"], ["obliques", "epaules"], "C", 1],
  ["Gainage latéral", ["obliques"], ["abdos"], "C", 1],
  ["Russian twist", ["obliques"], ["abdos"], "C"],
  ["Roue abdominale", ["abdos"], ["dorsaux"], "C"],
  ["Mountain climbers", ["abdos"], ["quadriceps", "epaules"], "C"],
  ["Sit-ups", ["abdos"], [], "C"],
  ["L-sit", ["abdos"], ["triceps", "quadriceps"], "C", 1],
  ["Hollow hold", ["abdos"], [], "C", 1],
  // Callisthénie
  ["Muscle-up", ["dorsaux", "triceps"], ["pecs", "biceps", "abdos"], "C"],
  ["Handstand push-up", ["epaules", "triceps"], ["trapezes"], "C"],
  ["Pompes pike", ["epaules", "triceps"], ["pecs"], "C"],
  ["Pompes archer", ["pecs"], ["triceps", "epaules"], "C"],
  ["Front lever", ["dorsaux", "abdos"], ["biceps"], "C", 1],
  ["Back lever", ["dorsaux", "pecs"], ["biceps", "abdos"], "C", 1],
  ["Planche", ["epaules", "pecs"], ["abdos", "triceps"], "C", 1],
  ["Handstand", ["epaules"], ["trapezes", "abdos"], "C", 1],
  ["Human flag", ["obliques", "dorsaux"], ["epaules"], "C", 1],
  ["Dips aux anneaux", ["pecs", "triceps"], ["epaules"], "C"],
  // Kettlebell / fonctionnel
  ["Kettlebell swings", ["fessiers", "ischios"], ["lombaires", "epaules"], "K"],
  ["Thrusters", ["quadriceps", "epaules"], ["fessiers", "triceps"], "B"],
  ["Clean", ["fessiers", "trapezes"], ["quadriceps", "ischios", "epaules"], "B"],
  ["Snatch", ["epaules", "fessiers"], ["trapezes", "quadriceps"], "B"],
  ["Burpees", ["pecs", "quadriceps"], ["abdos", "epaules"], "C"],
  ["Wall balls", ["quadriceps", "epaules"], ["fessiers"], "C"]
];

// Mots-clés : pour reconnaître les muscles d'un exercice tapé à la main.
// Exercices proposés dans une séance « Corde » (bouton « Ajouter un exercice »).
export const CORDES_EX = ["Montée de corde", "Montée de corde avec jambes", "Montée de corde départ assis"];
// Mouvements proposés dans un WOD (bouton « + Ajouter un mouvement ») : [nom, catégorie, muscles principaux, secondaires, matériel].
export const CF_CATS = ["halt", "force", "gym", "cardio"].map(id => [id, t("bibliotheque.categoriesCf." + id)]);
export const CF_LIB = [
  ["Thrusters", "halt", ["quadriceps", "epaules"], ["fessiers", "triceps"], "B"],
  ["Clean", "halt", ["fessiers", "trapezes"], ["quadriceps", "ischios", "epaules"], "B"],
  ["Power clean", "halt", ["fessiers", "trapezes"], ["quadriceps", "ischios", "epaules"], "B"],
  ["Snatch", "halt", ["epaules", "fessiers"], ["trapezes", "quadriceps"], "B"],
  ["Power snatch", "halt", ["epaules", "fessiers"], ["trapezes", "quadriceps"], "B"],
  ["Clean & jerk", "halt", ["fessiers", "epaules"], ["quadriceps", "trapezes", "triceps"], "B"],
  ["Push press", "halt", ["epaules"], ["triceps", "quadriceps"], "B"],
  ["Back squat", "force", ["quadriceps", "fessiers"], ["ischios", "lombaires", "abdos"], "B"],
  ["Front squat", "force", ["quadriceps"], ["fessiers", "abdos"], "B"],
  ["Overhead squat", "force", ["quadriceps", "epaules"], ["fessiers", "abdos", "trapezes"], "B"],
  ["Soulevé de terre", "force", ["lombaires", "fessiers", "ischios"], ["dorsaux", "trapezes", "quadriceps", "avantbras"], "B"],
  ["Tractions", "gym", ["dorsaux"], ["biceps", "avantbras"], "C"],
  ["Muscle-up", "gym", ["dorsaux", "triceps"], ["pecs", "biceps", "abdos"], "C"],
  ["Toes to bar", "gym", ["abdos"], ["dorsaux", "avantbras"], "C"],
  ["Handstand push-up", "gym", ["epaules", "triceps"], ["trapezes"], "C"],
  ["Pompes", "gym", ["pecs"], ["triceps", "epaules", "abdos"], "C"],
  ["Montée de corde", "gym", ["dorsaux", "biceps"], ["avantbras", "abdos"], "C"],
  ["Sit-ups", "gym", ["abdos"], [], "C"],
  ["Air squats", "gym", ["quadriceps", "fessiers"], ["ischios"], "C"],
  ["Fentes", "gym", ["quadriceps", "fessiers"], ["ischios"], "C"],
  ["Burpees", "cardio", ["pecs", "quadriceps"], ["abdos", "epaules"], "C"],
  ["Box jumps", "cardio", ["quadriceps", "fessiers"], ["mollets"], "C"],
  ["Double unders", "cardio", ["mollets"], ["quadriceps", "epaules", "avantbras"], "C"],
  ["Wall balls", "cardio", ["quadriceps", "epaules"], ["fessiers"], "C"],
  ["Kettlebell swings", "cardio", ["fessiers", "ischios"], ["lombaires", "epaules"], "K"],
  ["Rameur", "cardio", ["dorsaux", "quadriceps"], ["biceps", "lombaires", "fessiers"], "M"],
  ["Air bike", "cardio", ["quadriceps"], ["fessiers", "epaules", "pecs"], "M"],
  ["Course", "cardio", ["quadriceps", "mollets"], ["ischios", "fessiers"], "C"]
];
// Ateliers proposés dans une séance « Hyrox » : [nom, unité (m ou reps), quantité d'une course officielle, muscles principaux, secondaires, avec charge ?]
export const HYROX_EX = [
  ["Course", "m", 1000, ["quadriceps", "mollets"], ["ischios", "fessiers"]],
  ["SkiErg", "m", 1000, ["dorsaux", "triceps"], ["abdos", "epaules"]],
  ["Sled push", "m", 50, ["quadriceps", "fessiers"], ["mollets", "epaules"], 1],
  ["Sled pull", "m", 50, ["dorsaux", "biceps"], ["avantbras", "ischios"], 1],
  ["Burpees sautés", "m", 80, ["quadriceps", "pecs"], ["fessiers", "epaules"]],
  ["RowErg", "m", 1000, ["dorsaux", "quadriceps"], ["biceps", "lombaires"]],
  ["Farmers carry", "m", 200, ["avantbras", "trapezes"], ["abdos", "fessiers"], 1],
  ["Fentes sandbag", "m", 100, ["quadriceps", "fessiers"], ["ischios", "abdos"], 1],
  ["Wall balls", "reps", 100, ["quadriceps", "epaules"], ["fessiers"], 1]
];
// Anciens noms retirés de la bibliothèque : plus proposés, mais les séances déjà enregistrées gardent leurs muscles.
export const LEGACY_EX = [["Montée de corde sans jambes", ["dorsaux", "biceps"], ["avantbras", "abdos"]]];

// Mots du nom (sans accents, en français, anglais ou espagnol) → muscles principaux et secondaires.
export const KEYWORDS = [
  [/couche|pec|butterfly|ecarte|chest|bench|pompe|push ?up|dips|banca|pecho|flexion|fondo|apertura/, ["pecs"], ["triceps"]],
  [/traction|pull ?up|chin|tirage|lat|rowing|row\b|tbar|dos|dominada|remo|jalon|espalda/, ["dorsaux"], ["biceps"]],
  [/shrug|trap|encogimiento/, ["trapezes"], []],
  [/militaire|epaule|overhead|ohp|elevation|laterale|oiseau|arnold|shoulder|pike|hombro|militar/, ["epaules"], ["triceps"]],
  [/curl|biceps/, ["biceps"], ["avantbras"]],
  [/triceps|barre au front|extension|kickback|skull|press frances/, ["triceps"], []],
  [/squat|presse|leg press|fente|lunge|leg extension|cuisse|quadri|sentadilla|zancada|prensa/, ["quadriceps", "fessiers"], ["ischios"]],
  [/leg curl|ischio|roumain|rdl|good morning|femoral|rumano/, ["ischios"], ["fessiers"]],
  [/terre|deadlift|peso muerto/, ["lombaires", "fessiers", "ischios"], ["dorsaux"]],
  [/hip thrust|fessier|glute|pont|abduct|gluteo|puente/, ["fessiers"], []],
  [/mollet|calf|gemelo/, ["mollets"], []],
  [/abdo|crunch|gainage|planche abdo|relev|twist|sit ?up|toes|obliq|plank|plancha/, ["abdos"], ["obliques"]],
  [/lombaire|lumbar/, ["lombaires"], []],
  [/poignet|avant ?bras|farmer|forearm|wrist|antebrazo|muneca/, ["avantbras"], []],
  [/corde|rope|cuerda/, ["dorsaux", "biceps"], ["avantbras"]]
];

/* ---------- Programmes ---------- */
// Une séance : { name, disc, typeId, ex: [[nom, séries, reps, repos (s), tenue]] } ou, pour la course,
// { name, disc: "course", runType, note, blocks: [[reps, effort, unité, allure, récup]], m }.
// Textes (nom, niveau, présentation, conseil, séances) : « programmes.liste.<id> » ; noms des séances : « programmes.seances.<id> ».
const W = (id, typeId, ex, disc = "muscu") => ({ name: t("programmes.seances." + id), disc, typeId, ex });
const R = (name, runType, note, blocks, m) => ({ name, disc: "course", runType, note, blocks: blocks || [], m: m || "" });
const prog = (id, level, weeks, perWeek, color, plan) => ({ id, name: t(`programmes.liste.${id}.nom`), level: t("niveaux." + level), weeks, perWeek, color,
  desc: t(`programmes.liste.${id}.desc`), tip: t(`programmes.liste.${id}.conseil`), plan });

export const PROGRAMS = [
  prog("full3", "debutant", 8, 3, "#2FBF71", () => [
    W("fullA", "haut", [["Squat", 3, 10, 120], ["Développé couché", 3, 10, 120], ["Rowing haltère", 3, 10, 90], ["Développé militaire", 3, 10, 90], ["Gainage", 3, 40, 60, 1]]),
    W("fullB", "bas", [["Soulevé de terre roumain", 3, 10, 120], ["Développé incliné haltères", 3, 10, 90], ["Tirage vertical", 3, 10, 90], ["Fentes", 3, 10, 90], ["Crunch", 3, 15, 60]]),
    W("fullC", "haut", [["Presse à cuisses", 3, 12, 120], ["Pompes", 3, 12, 90], ["Tirage horizontal", 3, 12, 90], ["Élévations latérales", 3, 15, 60], ["Curl haltères", 3, 12, 60]])
  ]),
  prog("ppl", "intermediaire", 8, 3, "#FF3B30", () => [
    W("push", "push", [["Développé couché", 4, 8, 150], ["Développé militaire", 3, 8, 120], ["Développé incliné haltères", 3, 10, 90], ["Élévations latérales", 3, 15, 60], ["Extension triceps à la poulie", 3, 12, 60]]),
    W("pull", "pull", [["Tractions", 4, 8, 150], ["Rowing barre", 3, 8, 120], ["Tirage horizontal", 3, 12, 90], ["Face pull", 3, 15, 60], ["Curl barre", 3, 10, 60]]),
    W("jambes", "jambes", [["Squat", 4, 6, 180], ["Soulevé de terre roumain", 3, 8, 120], ["Presse à cuisses", 3, 12, 90], ["Leg curl", 3, 12, 60], ["Mollets debout", 4, 15, 60]])
  ]),
  prog("upper4", "intermediaire", 8, 4, "#A56BFF", () => [
    W("hautA", "haut", [["Développé couché", 4, 6, 150], ["Rowing barre", 4, 6, 150], ["Développé militaire", 3, 8, 120], ["Tractions", 3, 8, 120], ["Curl barre", 3, 10, 60]]),
    W("basA", "bas", [["Squat", 4, 6, 180], ["Soulevé de terre roumain", 3, 8, 150], ["Fentes bulgares", 3, 10, 90], ["Mollets debout", 4, 12, 60]]),
    W("hautB", "haut", [["Développé incliné haltères", 4, 10, 90], ["Tirage vertical", 4, 10, 90], ["Élévations latérales", 4, 15, 60], ["Tirage horizontal", 3, 12, 90], ["Extension triceps nuque", 3, 12, 60]]),
    W("basB", "bas", [["Presse à cuisses", 4, 12, 120], ["Hip thrust", 4, 10, 90], ["Leg curl", 3, 12, 60], ["Leg extension", 3, 15, 60], ["Relevés de jambes", 3, 12, 60]])
  ]),
  prog("force5", "tous", 12, 3, "#FF9F0A", () => [
    W("seanceA", "bas", [["Squat", 5, 5, 180], ["Développé couché", 5, 5, 180], ["Rowing barre", 5, 5, 180]]),
    W("seanceB", "bas", [["Squat", 5, 5, 180], ["Développé militaire", 5, 5, 180], ["Soulevé de terre", 1, 5, 240]])
  ]),
  prog("calis1", "debutant", 6, 3, "#C9D63A", () => [
    W("tirageAbdos", null, [["Tractions australiennes", 4, 10, 90], ["Tractions", 4, t("programmes.max"), 120], ["Relevés de jambes", 3, 10, 60], ["Hollow hold", 3, 20, 60, 1]], "calis"),
    W("pousseeJambes", null, [["Pompes", 4, 12, 90], ["Dips", 4, 8, 120], ["Squats (poids du corps)", 4, 20, 60], ["Gainage", 3, 45, 60, 1]], "calis"),
    W("fullBody", null, [["Tractions", 3, t("programmes.max"), 120], ["Pompes pike", 3, 8, 90], ["Fentes", 3, 12, 60], ["L-sit", 3, 10, 60, 1]], "calis")
  ]),
  prog("run10", "debutantInter", 8, 3, "#5AC8FA", w => [
    R(t("programmes.seances.footing"), "ef", t("programmes.course.footing", { semaine: w, min: 25 + w * 3 }), [], String(25 + w * 3)),
    w % 2
      ? R(t("programmes.seances.fracCourt"), "frac", t("programmes.course.fracCourt", { semaine: w, n: 6 + w }), [[6 + w, 400, "m", t("programmes.allure5km"), "1:30"]])
      : R(t("programmes.seances.seuil"), "seuil", t("programmes.course.seuil", { semaine: w, n: Math.min(4, 1 + w / 2), min: w >= 6 ? 10 : 8 }), [[Math.min(4, 1 + w / 2), w >= 6 ? 10 : 8, "min", t("programmes.allureSeuil"), "2:00"]]),
    R(t("programmes.seances.sortieLongue"), "ef", w === 8 ? t("programmes.course.jourJ") : t("programmes.course.sortieLongue", { semaine: w, km: Math.min(10, 4 + w * 0.75) }), [], "")
  ])
];
