/* Données fixes de l'app : muscles, bibliothèque d'exercices et programmes prêts à suivre. */

// Muscles (identifiants utilisés par la carte musculaire).
export const MUSCLES = {
  pecs: "Pectoraux", epaules: "Épaules", biceps: "Biceps", triceps: "Triceps", avantbras: "Avant-bras",
  abdos: "Abdos", obliques: "Obliques", trapezes: "Trapèzes", dorsaux: "Dorsaux", lombaires: "Lombaires",
  fessiers: "Fessiers", quadriceps: "Quadriceps", ischios: "Ischios", mollets: "Mollets"
};
// Filtres de la bibliothèque : groupe → muscles concernés.
export const GROUPS = [
  ["pecs", "Pecs", ["pecs"]], ["dos", "Dos", ["dorsaux", "trapezes", "lombaires"]], ["epaules", "Épaules", ["epaules"]],
  ["bras", "Bras", ["biceps", "triceps", "avantbras"]], ["jambes", "Jambes", ["quadriceps", "ischios", "mollets"]],
  ["fessiers", "Fessiers", ["fessiers"]], ["abdos", "Abdos", ["abdos", "obliques"]]
];
export const EQUIP = { B: "Barre", H: "Haltères", M: "Machine", P: "Poulie", C: "Poids du corps", K: "Kettlebell", E: "Élastique" };

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
  ["Montée de corde sans jambes", ["dorsaux", "biceps"], ["avantbras", "abdos"], "C"],
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
export const KEYWORDS = [
  [/couche|pec|butterfly|ecarte|chest|bench|pompe|push ?up|dips/, ["pecs"], ["triceps"]],
  [/traction|pull ?up|chin|tirage|lat|rowing|row\b|tbar|dos/, ["dorsaux"], ["biceps"]],
  [/shrug|trap/, ["trapezes"], []],
  [/militaire|epaule|overhead|ohp|elevation|laterale|oiseau|arnold|shoulder|pike/, ["epaules"], ["triceps"]],
  [/curl|biceps/, ["biceps"], ["avantbras"]],
  [/triceps|barre au front|extension|kickback|skull/, ["triceps"], []],
  [/squat|presse|leg press|fente|lunge|leg extension|cuisse|quadri/, ["quadriceps", "fessiers"], ["ischios"]],
  [/leg curl|ischio|roumain|rdl|good morning/, ["ischios"], ["fessiers"]],
  [/terre|deadlift/, ["lombaires", "fessiers", "ischios"], ["dorsaux"]],
  [/hip thrust|fessier|glute|pont|abduct/, ["fessiers"], []],
  [/mollet|calf/, ["mollets"], []],
  [/abdo|crunch|gainage|planche abdo|relev|twist|sit ?up|toes|obliq/, ["abdos"], ["obliques"]],
  [/lombaire/, ["lombaires"], []],
  [/poignet|avant ?bras|farmer/, ["avantbras"], []],
  [/corde|rope/, ["dorsaux", "biceps"], ["avantbras"]]
];

/* ---------- Programmes ---------- */
// Une séance : { name, disc, typeId, ex: [[nom, séries, reps, repos (s), tenue]] } ou, pour la course,
// { name, disc: "course", runType, note, blocks: [[reps, effort, unité, allure, récup]], m }.
const W = (name, typeId, ex, disc = "muscu") => ({ name, disc, typeId, ex });
const R = (name, runType, note, blocks, m) => ({ name, disc: "course", runType, note, blocks: blocks || [], m: m || "" });

export const PROGRAMS = [
  {
    id: "full3", name: "Full body débutant", level: "Débutant", weeks: 8, perWeek: 3, color: "#2FBF71",
    desc: "Tout le corps à chaque séance, 3 fois par semaine. Idéal pour débuter ou reprendre.",
    tip: "Ajoute un peu de poids dès que tu réussis toutes tes séries avec une bonne technique.",
    plan: () => [
      W("Full body A", "haut", [["Squat", 3, 10, 120], ["Développé couché", 3, 10, 120], ["Rowing haltère", 3, 10, 90], ["Développé militaire", 3, 10, 90], ["Gainage", 3, 40, 60, 1]]),
      W("Full body B", "bas", [["Soulevé de terre roumain", 3, 10, 120], ["Développé incliné haltères", 3, 10, 90], ["Tirage vertical", 3, 10, 90], ["Fentes", 3, 10, 90], ["Crunch", 3, 15, 60]]),
      W("Full body C", "haut", [["Presse à cuisses", 3, 12, 120], ["Pompes", 3, 12, 90], ["Tirage horizontal", 3, 12, 90], ["Élévations latérales", 3, 15, 60], ["Curl haltères", 3, 12, 60]])
    ]
  },
  {
    id: "ppl", name: "Push Pull Jambes", level: "Intermédiaire", weeks: 8, perWeek: 3, color: "#FF3B30",
    desc: "Le grand classique : poussée, tirage, jambes. 3 séances par semaine (ou 6 en le faisant 2 fois).",
    tip: "Garde 1 à 2 répétitions en réserve (RPE 8) sur la plupart des séries.",
    plan: () => [
      W("Push", "push", [["Développé couché", 4, 8, 150], ["Développé militaire", 3, 8, 120], ["Développé incliné haltères", 3, 10, 90], ["Élévations latérales", 3, 15, 60], ["Extension triceps à la poulie", 3, 12, 60]]),
      W("Pull", "pull", [["Tractions", 4, 8, 150], ["Rowing barre", 3, 8, 120], ["Tirage horizontal", 3, 12, 90], ["Face pull", 3, 15, 60], ["Curl barre", 3, 10, 60]]),
      W("Jambes", "jambes", [["Squat", 4, 6, 180], ["Soulevé de terre roumain", 3, 8, 120], ["Presse à cuisses", 3, 12, 90], ["Leg curl", 3, 12, 60], ["Mollets debout", 4, 15, 60]])
    ]
  },
  {
    id: "upper4", name: "Haut / Bas", level: "Intermédiaire", weeks: 8, perWeek: 4, color: "#A56BFF",
    desc: "4 séances : 2 haut du corps, 2 bas du corps. Parfait pour la prise de masse.",
    tip: "Séance A lourde (peu de reps), séance B plus légère (plus de reps).",
    plan: () => [
      W("Haut A (force)", "haut", [["Développé couché", 4, 6, 150], ["Rowing barre", 4, 6, 150], ["Développé militaire", 3, 8, 120], ["Tractions", 3, 8, 120], ["Curl barre", 3, 10, 60]]),
      W("Bas A (force)", "bas", [["Squat", 4, 6, 180], ["Soulevé de terre roumain", 3, 8, 150], ["Fentes bulgares", 3, 10, 90], ["Mollets debout", 4, 12, 60]]),
      W("Haut B (volume)", "haut", [["Développé incliné haltères", 4, 10, 90], ["Tirage vertical", 4, 10, 90], ["Élévations latérales", 4, 15, 60], ["Tirage horizontal", 3, 12, 90], ["Extension triceps nuque", 3, 12, 60]]),
      W("Bas B (volume)", "bas", [["Presse à cuisses", 4, 12, 120], ["Hip thrust", 4, 10, 90], ["Leg curl", 3, 12, 60], ["Leg extension", 3, 15, 60], ["Relevés de jambes", 3, 12, 60]])
    ]
  },
  {
    id: "force5", name: "Force 5×5", level: "Tous niveaux", weeks: 12, perWeek: 3, color: "#FF9F0A",
    desc: "Peu d’exercices, beaucoup de force : 5 séries de 5 sur les mouvements de base, en alternant 2 séances.",
    tip: "Ajoute 2,5 kg à chaque séance réussie (5 kg au soulevé de terre). Si tu échoues 3 fois, baisse de 10 %.",
    plan: () => [
      W("Séance A", "bas", [["Squat", 5, 5, 180], ["Développé couché", 5, 5, 180], ["Rowing barre", 5, 5, 180]]),
      W("Séance B", "bas", [["Squat", 5, 5, 180], ["Développé militaire", 5, 5, 180], ["Soulevé de terre", 1, 5, 240]])
    ]
  },
  {
    id: "calis1", name: "Callisthénie débutant", level: "Débutant", weeks: 6, perWeek: 3, color: "#C9D63A",
    desc: "Au poids du corps, sans salle : les bases pour tes premières tractions et tes premiers dips.",
    tip: "Quand tu fais toutes les séries sans forcer, passe à la variante plus dure (ex. pompes → pompes diamant).",
    plan: () => [
      W("Tirage & abdos", null, [["Tractions australiennes", 4, 10, 90], ["Tractions", 4, "max", 120], ["Relevés de jambes", 3, 10, 60], ["Hollow hold", 3, 20, 60, 1]], "calis"),
      W("Poussée & jambes", null, [["Pompes", 4, 12, 90], ["Dips", 4, 8, 120], ["Squats (poids du corps)", 4, 20, 60], ["Gainage", 3, 45, 60, 1]], "calis"),
      W("Full body", null, [["Tractions", 3, "max", 120], ["Pompes pike", 3, 8, 90], ["Fentes", 3, 12, 60], ["L-sit", 3, 10, 60, 1]], "calis")
    ]
  },
  {
    id: "run10", name: "Prépa 10 km", level: "Débutant à intermédiaire", weeks: 8, perWeek: 3, color: "#5AC8FA",
    desc: "8 semaines pour courir 10 km : une sortie facile, une séance de vitesse et une sortie longue par semaine.",
    tip: "La sortie facile et la sortie longue doivent rester en aisance respiratoire : tu dois pouvoir parler.",
    plan: w => [
      R("Footing facile", "ef", `Semaine ${w} : ${25 + w * 3} min en endurance fondamentale.`, [], String(25 + w * 3)),
      w % 2
        ? R("Fractionné court", "frac", `Semaine ${w} : ${6 + w} × 400 m rapide, récup 1:30 en trottinant.`, [[6 + w, 400, "m", "allure 5 km", "1:30"]])
        : R("Seuil", "seuil", `Semaine ${w} : ${Math.min(4, 1 + w / 2)} × ${w >= 6 ? 10 : 8} min à allure seuil, récup 2:00.`, [[Math.min(4, 1 + w / 2), w >= 6 ? 10 : 8, "min", "seuil", "2:00"]]),
      R("Sortie longue", "ef", w === 8 ? "Semaine 8 : c’est le jour J, cours tes 10 km !" : `Semaine ${w} : ${Math.min(10, 4 + w * 0.75).toString().replace(".", ",")} km tranquilles.`, [], "")
    ]
  }
];
