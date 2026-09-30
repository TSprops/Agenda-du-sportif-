// « Comment faire » : retrouver la fiche d'un exercice à partir de son nom.
import { HOW } from "../exercices/index.js";
import { norm } from "../pages/faq.js";

// Noms tapés à la main : on retrouve la fiche grâce à quelques mots-clés.
const MOVE_WORDS = [
  [/diamant|diamond/, "Pompes diamant"], [/archer/, "Pompes archer"], [/pike/, "Pompes pike"], [/pompe|push ?up/, "Pompes"], [/anneau/, "Dips aux anneaux"], [/dips/, "Dips"],
  [/incline.*haltere|haltere.*incline/, "Développé incliné haltères"], [/incline/, "Développé incliné"], [/decline/, "Développé décliné"], [/couche.*serre|serre.*couche/, "Développé couché prise serrée"],
  [/couche.*haltere|haltere.*couche/, "Développé couché haltères"], [/presse pec|chest press/, "Presse pectoraux"], [/couche|bench/, "Développé couché"],
  [/poulie basse.*ecarte|ecarte.*poulie basse/, "Écarté poulie basse"], [/poulie moyenne.*ecarte|ecarte.*poulie moyenne/, "Écarté poulie moyenne"], [/poulie.*ecarte|ecarte.*poulie|vis a vis|crossover/, "Écarté poulie haute"],
  [/butterfly|pec deck/, "Pec deck (butterfly)"], [/ecarte|fly/, "Écarté haltères"], [/pull ?over/, "Pull-over"],
  [/tirage vertical.*serre/, "Tirage vertical prise serrée"], [/tirage vertical|pulldown/, "Tirage vertical"], [/muscle ?up/, "Muscle-up"], [/leste/, "Tractions lestées"], [/chin|supination.*traction|traction.*supination/, "Tractions supination (chin-up)"],
  [/australien|inverted/, "Tractions australiennes"], [/traction|pull ?up/, "Tractions"], [/face ?pull/, "Face pull"], [/tirage horizontal|tirage assis|rowing assis/, "Tirage horizontal"], [/rowing machine/, "Rowing machine"],
  [/t ?bar/, "Rowing T-bar"], [/rowing haltere|haltere.*rowing/, "Rowing haltère"], [/menton|upright/, "Rowing menton"], [/rowing|row\b|tirage/, "Rowing barre"],
  [/roumain|rdl/, "Soulevé de terre roumain"], [/sumo/, "Soulevé de terre sumo"], [/terre|deadlift/, "Soulevé de terre"], [/good morning/, "Good morning"], [/lombaire/, "Extension lombaire"],
  [/arnold/, "Développé Arnold"], [/push press/, "Push press"], [/militaire|epaule|overhead/, "Développé militaire"], [/elevation.*poulie|poulie.*elevation/, "Élévations latérales à la poulie"],
  [/elevations? frontale/, "Élévations frontales"], [/oiseau|arriere d.?epaule/, "Oiseau (arrière d’épaule)"], [/elevation/, "Élévations latérales"], [/shrug/, "Shrugs"],
  [/curl.*poulie|poulie.*curl/, "Curl à la poulie"], [/marteau|hammer/, "Curl marteau"], [/pupitre|preacher/, "Curl pupitre"], [/curl.*incline/, "Curl incliné"], [/poignet/, "Curl poignets"],
  [/curl.*barre|barre.*curl/, "Curl barre"], [/curl/, "Curl haltères"], [/barre au front|skull/, "Barre au front"], [/nuque|overhead extension/, "Extension triceps nuque"],
  [/kickback/, "Kickback triceps"], [/triceps/, "Extension triceps à la poulie"],
  [/goblet/, "Squat goblet"], [/pistol/, "Pistol squat"], [/front squat|squat avant/, "Front squat"], [/hack/, "Hack squat"], [/poids du corps/, "Squats (poids du corps)"], [/squat/, "Squat"],
  [/bulgare/, "Fentes bulgares"], [/step/, "Step-up"], [/fente|lunge/, "Fentes"], [/leg curl/, "Leg curl"], [/presse a cuisse|leg press/, "Presse à cuisses"], [/leg extension/, "Leg extension"],
  [/abduct/, "Abducteurs machine"], [/pont fessier|glute bridge/, "Pont fessier"], [/hip thrust|pont|fessier/, "Hip thrust"], [/mollet.*assis/, "Mollets assis"], [/mollet|calf/, "Mollets debout"],
  [/toes to bar/, "Toes to bar"], [/relev/, "Relevés de jambes"], [/crunch.*poulie/, "Crunch à la poulie"], [/sit ?up/, "Sit-ups"], [/twist/, "Russian twist"], [/crunch/, "Crunch"],
  [/gainage lateral|side plank/, "Gainage latéral"], [/gainage|plank/, "Gainage"], [/roue|ab wheel/, "Roue abdominale"], [/hollow/, "Hollow hold"], [/climber/, "Mountain climbers"],
  [/l ?sit/, "L-sit"], [/handstand push|hspu/, "Handstand push-up"], [/handstand|poirier/, "Handstand"], [/front lever/, "Front lever"], [/back lever/, "Back lever"], [/drapeau|human flag/, "Human flag"], [/planche/, "Planche"],
  [/corde.*avec jambe/, "Montée de corde avec jambes"], [/corde.*assis/, "Montée de corde départ assis"], [/corde|rope/, "Montée de corde"],
  [/swing/, "Kettlebell swings"], [/wall ?ball/, "Wall balls"], [/thruster/, "Thrusters"], [/snatch|arrache/, "Snatch"], [/clean|epaule jete/, "Clean"], [/box/, "Box jumps"], [/burpee/, "Burpees"],
  [/farmer|marche/, "Farmer walk"]
];
const key = n => norm(n || "").replace(/\s+/g, " ").trim();
// Construit au premier usage (et pas au chargement du fichier : norm vient d'un autre fichier).
let HOW_KEYS = null;
export function moveOf(name) {
  const k = key(name); if (!k) return null;
  HOW_KEYS = HOW_KEYS || Object.fromEntries(Object.keys(HOW).map(n => [key(n), n]));
  const n = HOW_KEYS[k] || (MOVE_WORDS.find(([re]) => re.test(k)) || [])[1];
  return n && HOW[n] ? { name: n, ...HOW[n] } : null;
}
