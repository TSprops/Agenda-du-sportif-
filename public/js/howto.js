// « Comment faire » : silhouette animée de chaque exercice (dessinée en SVG, aucune image ni vidéo).
// Chaque famille de mouvement a une pose de départ et une pose d'arrivée ; l'animation passe
// de l'une à l'autre en fondu enchaîné, puis revient (effet boomerang).
import { esc } from "./core.js";
import { norm } from "./faq.js";

// Pose de profil (tournée vers la droite). h tête, s épaule, e coude, w main, p hanche, k genou, a cheville, t pointe du pied.
// k2 / a2 : seconde jambe (fentes, marche), dessinée en retrait. eq : matériel.
const STAND = { h: [60, 26], s: [60, 36], e: [61, 53], w: [62, 69], p: [60, 64], k: [60, 86], a: [60, 108] };
const P = o => ({ ...STAND, ...o });
const BENCH = { rect: [18, 80, 64, 6], legs: [[24, 86, 24, 108], [76, 86, 76, 108]] };
const BAR_TOP = { line: [30, 10, 92, 10] };

const FAMILIES = {
  squat: { hot: ["leg"], cue: "Dos droit, poitrine sortie : descends les hanches sous les genoux, puis pousse dans les talons.", poses: [
    P({ e: [50, 42], w: [60, 33], eq: [{ bar: [60, 33] }] }),
    P({ h: [62, 50], s: [56, 60], e: [46, 66], w: [56, 57], p: [44, 86], k: [70, 88], eq: [{ bar: [56, 57] }] })] },
  squatbw: { hot: ["leg"], cue: "Bras devant pour l’équilibre, genoux dans l’axe des pieds, talons au sol.", poses: [
    P({ e: [72, 42], w: [86, 42] }),
    P({ h: [62, 50], s: [56, 60], e: [70, 64], w: [86, 64], p: [44, 86], k: [70, 88] })] },
  hinge: { hot: ["leg", "torso"], cue: "Dos bien droit, barre collée aux jambes : pousse les hanches vers l’avant pour te redresser.", poses: [
    P({ h: [80, 54], s: [72, 60], e: [72, 77], w: [72, 93], p: [46, 78], k: [64, 92], eq: [{ bar: [72, 95] }] }),
    P({ e: [61, 52], w: [62, 68], eq: [{ bar: [62, 70] }] })] },
  bench: { hot: ["arm", "torso"], cue: "Omoplates serrées, pieds au sol : descends la barre à la poitrine puis pousse vers le haut.", poses: [
    { h: [28, 72], s: [38, 76], e: [30, 82], w: [40, 64], p: [66, 77], k: [84, 72], a: [88, 106], eq: [BENCH, { bar: [40, 62] }] },
    { h: [28, 72], s: [38, 76], e: [39, 60], w: [40, 44], p: [66, 77], k: [84, 72], a: [88, 106], eq: [BENCH, { bar: [40, 42] }] }] },
  fly: { hot: ["arm", "torso"], cue: "Coudes légèrement fléchis : ouvre les bras sans descendre trop bas, puis referme au-dessus de la poitrine.", poses: [
    { h: [28, 72], s: [38, 76], e: [26, 80], w: [16, 72], p: [66, 77], k: [84, 72], a: [88, 106], eq: [BENCH, { db: [16, 72] }] },
    { h: [28, 72], s: [38, 76], e: [38, 60], w: [40, 45], p: [66, 77], k: [84, 72], a: [88, 106], eq: [BENCH, { db: [40, 45] }] }] },
  ohp: { hot: ["arm"], cue: "Gainé, fessiers serrés : pousse la charge au-dessus de la tête sans cambrer le dos.", poses: [
    P({ e: [52, 44], w: [62, 34], eq: [{ bar: [62, 34] }] }),
    P({ e: [61, 19], w: [61, 3], eq: [{ bar: [61, 2] }] })] },
  pullup: { hot: ["arm", "torso"], cue: "Pars bras tendus, tire les coudes vers le bas jusqu’à passer le menton au-dessus de la barre.", poses: [
    { h: [66, 36], s: [58, 44], e: [59, 28], w: [60, 11], p: [57, 72], k: [60, 93], a: [56, 114], eq: [BAR_TOP] },
    { h: [66, 12], s: [58, 22], e: [48, 20], w: [60, 11], p: [57, 50], k: [60, 71], a: [56, 92], eq: [BAR_TOP] }] },
  row: { hot: ["arm", "torso"], cue: "Buste penché et dos droit : tire la charge vers le nombril en serrant les omoplates.", poses: [
    P({ h: [80, 54], s: [72, 60], e: [72, 77], w: [72, 93], p: [46, 78], k: [64, 92], eq: [{ db: [72, 94] }] }),
    P({ h: [80, 54], s: [72, 60], e: [58, 70], w: [64, 84], p: [46, 78], k: [64, 92], eq: [{ db: [64, 85] }] })] },
  curl: { hot: ["arm"], cue: "Coudes collés au corps : monte la charge sans balancer, redescends lentement.", poses: [
    P({ eq: [{ db: [62, 70] }] }),
    P({ w: [69, 38], eq: [{ db: [69, 38] }] })] },
  pushdown: { hot: ["arm"], cue: "Coudes fixes le long du corps : tends complètement les bras, puis remonte en contrôlant.", poses: [
    P({ e: [60, 53], w: [73, 46], eq: [{ line: [78, -6, 73, 46] }] }),
    P({ e: [60, 53], w: [64, 70], eq: [{ line: [78, -6, 64, 70] }] })] },
  raise: { hot: ["arm"], cue: "Bras presque tendus : monte jusqu’à l’horizontale sans hausser les épaules.", poses: [
    P({ eq: [{ db: [62, 70] }] }),
    P({ e: [76, 38], w: [93, 38], eq: [{ db: [93, 38] }] })] },
  shrug: { hot: ["torso"], cue: "Bras tendus : monte les épaules vers les oreilles, marque une pause, redescends.", poses: [
    P({ eq: [{ db: [62, 70] }] }),
    P({ h: [60, 22], s: [60, 31], e: [61, 48], w: [62, 64], eq: [{ db: [62, 65] }] })] },
  pushup: { hot: ["arm", "torso"], cue: "Corps gainé en planche : descends la poitrine près du sol puis pousse.", poses: [
    { h: [32, 66], s: [40, 74], e: [38, 91], w: [36, 108], p: [70, 88], k: [84, 98], a: [98, 106] },
    { h: [32, 88], s: [42, 94], e: [55, 96], w: [36, 108], p: [70, 100], k: [84, 104], a: [98, 106] }] },
  dips: { hot: ["arm", "torso"], cue: "Buste légèrement penché : descends jusqu’à avoir les coudes à 90°, puis remonte.", poses: [
    { h: [62, 20], s: [58, 30], e: [59, 45], w: [60, 60], p: [56, 58], k: [64, 78], a: [54, 92], eq: [{ line: [44, 60, 82, 60] }] },
    { h: [64, 42], s: [58, 52], e: [44, 56], w: [60, 60], p: [56, 80], k: [64, 98], a: [54, 112], eq: [{ line: [44, 60, 82, 60] }] }] },
  lunge: { hot: ["leg"], cue: "Grand pas : descends le genou arrière près du sol, genou avant au-dessus de la cheville.", poses: [
    P({ k2: [60, 86], a2: [60, 108] }),
    P({ h: [58, 48], s: [58, 58], e: [59, 75], w: [60, 91], p: [58, 86], k: [78, 86], a: [78, 108], k2: [46, 104], a2: [30, 106] })] },
  crunch: { hot: ["torso"], cue: "Bas du dos au sol : enroule le haut du dos en soufflant, sans tirer sur la nuque.", poses: [
    { h: [24, 98], s: [34, 102], e: [30, 90], w: [22, 94], p: [62, 104], k: [76, 86], a: [90, 106] },
    { h: [42, 78], s: [48, 88], e: [42, 76], w: [38, 80], p: [62, 104], k: [76, 86], a: [90, 106] }] },
  legraise: { hot: ["torso"], cue: "Suspendu sans balancer : monte les jambes tendues le plus haut possible, redescends lentement.", poses: [
    { h: [66, 36], s: [58, 44], e: [59, 28], w: [60, 11], p: [57, 72], k: [58, 93], a: [58, 114], eq: [BAR_TOP] },
    { h: [66, 36], s: [58, 44], e: [59, 28], w: [60, 11], p: [57, 72], k: [78, 70], a: [99, 68], eq: [BAR_TOP] }] },
  hipthrust: { hot: ["leg"], cue: "Pieds à plat : pousse les hanches vers le haut en serrant les fessiers, sans cambrer.", poses: [
    { h: [22, 94], s: [32, 98], e: [40, 104], w: [50, 106], p: [58, 106], k: [74, 90], a: [84, 108] },
    { h: [22, 94], s: [32, 98], e: [40, 104], w: [50, 106], p: [56, 84], k: [76, 84], a: [84, 108] }] },
  calf: { hot: ["leg"], cue: "Monte sur la pointe des pieds le plus haut possible, marque une pause, redescends lentement.", poses: [
    P({}),
    P({ h: [60, 20], s: [60, 30], e: [61, 47], w: [62, 63], p: [60, 58], k: [60, 80], a: [60, 101], t: [67, 109] })] },
  legext: { hot: ["leg"], cue: "Dos calé contre le dossier : tends les jambes complètement, redescends en contrôlant.", poses: [
    { h: [48, 42], s: [50, 52], e: [54, 66], w: [60, 78], p: [52, 80], k: [74, 82], a: [74, 104], eq: [{ rect: [40, 84, 40, 6] }, { line: [42, 84, 38, 46] }] },
    { h: [48, 42], s: [50, 52], e: [54, 66], w: [60, 78], p: [52, 80], k: [74, 82], a: [96, 78], t: [100, 72], eq: [{ rect: [40, 84, 40, 6] }, { line: [42, 84, 38, 46] }] }] },
  legcurl: { hot: ["leg"], cue: "Hanches collées au banc : ramène les talons vers les fessiers, redescends lentement.", poses: [
    { h: [20, 74], s: [30, 78], e: [28, 90], w: [36, 90], p: [58, 80], k: [80, 80], a: [102, 80], t: [104, 74], eq: [BENCH] },
    { h: [20, 74], s: [30, 78], e: [28, 90], w: [36, 90], p: [58, 80], k: [80, 80], a: [72, 60], t: [66, 58], eq: [BENCH] }] },
  rope: { hot: ["arm", "torso"], cue: "Pieds qui serrent la corde : grimpe en tirant avec les bras, puis resserre les jambes plus haut.", poses: [
    { h: [55, 42], s: [58, 52], e: [60, 42], w: [64, 30], p: [56, 78], k: [62, 94], a: [64, 106], eq: [{ line: [64, -8, 64, 118] }] },
    { h: [55, 22], s: [58, 32], e: [60, 22], w: [64, 10], p: [56, 58], k: [64, 70], a: [64, 84], eq: [{ line: [64, -8, 64, 118] }] }] },
  swing: { hot: ["leg", "torso"], cue: "Mouvement des hanches, pas des bras : projette les hanches vers l’avant pour lancer la charge.", poses: [
    P({ h: [80, 54], s: [72, 60], e: [66, 76], w: [58, 90], p: [46, 78], k: [64, 92], eq: [{ kb: [56, 94] }] }),
    P({ e: [76, 38], w: [92, 36], eq: [{ kb: [95, 36] }] })] },
  thruster: { hot: ["leg", "arm"], cue: "Descends en squat avec la barre devant les épaules, puis remonte en poussant la barre au-dessus de la tête.", poses: [
    P({ h: [62, 50], s: [56, 60], e: [64, 70], w: [64, 58], p: [44, 86], k: [70, 88], eq: [{ bar: [64, 57] }] }),
    P({ e: [61, 19], w: [61, 3], eq: [{ bar: [61, 2] }] })] },
  clean: { hot: ["leg", "torso", "arm"], cue: "Barre près du corps : tire du sol avec les jambes, puis passe les coudes devant pour la recevoir sur les épaules.", poses: [
    P({ h: [80, 54], s: [72, 60], e: [72, 77], w: [72, 93], p: [46, 78], k: [64, 92], eq: [{ bar: [72, 95] }] }),
    P({ e: [70, 46], w: [66, 34], eq: [{ bar: [67, 33] }] })] },
  boxjump: { hot: ["leg"], cue: "Élan des bras, saute à pieds joints et réceptionne-toi en douceur, genoux fléchis.", poses: [
    { h: [34, 50], s: [30, 60], e: [22, 72], w: [16, 82], p: [20, 86], k: [42, 88], a: [36, 108], eq: [{ rect: [62, 84, 40, 26] }] },
    { h: [82, 6], s: [82, 16], e: [83, 33], w: [84, 49], p: [82, 44], k: [82, 64], a: [82, 82], eq: [{ rect: [62, 84, 40, 26] }] }] },
  burpee: { hot: ["leg", "arm", "torso"], cue: "Mains au sol, pieds en arrière, poitrine au sol, puis remonte et saute bras en l’air.", poses: [
    { h: [32, 88], s: [42, 94], e: [55, 96], w: [36, 108], p: [70, 100], k: [84, 104], a: [98, 106] },
    P({ h: [60, 18], s: [60, 28], e: [61, 11], w: [62, -5], p: [60, 56], k: [60, 78], a: [60, 100], t: [66, 106] })] },
  climber: { hot: ["torso", "leg"], cue: "En planche, bras tendus : ramène un genou vers la poitrine, puis l’autre, sans lever les fesses.", poses: [
    { h: [32, 66], s: [40, 74], e: [38, 91], w: [36, 108], p: [70, 88], k: [84, 98], a: [98, 106] },
    { h: [32, 66], s: [40, 74], e: [38, 91], w: [36, 108], p: [70, 88], k: [52, 90], a: [64, 104] }] },
  walk: { hot: ["leg", "arm"], cue: "Bras tendus, charges lourdes, dos droit : marche à petits pas en gardant les épaules basses.", poses: [
    P({ k: [66, 86], a: [70, 108], k2: [56, 86], a2: [48, 108], eq: [{ db: [62, 70] }] }),
    P({ k: [56, 86], a: [48, 108], k2: [66, 86], a2: [70, 108], eq: [{ db: [62, 70] }] })] },
  hspu: { hot: ["arm"], cue: "Contre un mur, tête vers le sol : descends la tête près du sol puis pousse bras tendus.", poses: [
    { h: [56, 100], s: [58, 88], e: [48, 96], w: [52, 108], p: [60, 60], k: [60, 38], a: [60, 16], t: [66, 12], eq: [{ line: [70, -8, 70, 110] }] },
    { h: [56, 82], s: [58, 72], e: [56, 90], w: [52, 108], p: [60, 44], k: [60, 22], a: [60, 0], t: [66, -4], eq: [{ line: [70, -8, 70, 110] }] }] },
  // Positions tenues (une seule pose : pas d'animation)
  plank: { hot: ["torso"], cue: "Sur les avant-bras, corps aligné des épaules aux talons : serre les abdos et les fessiers.", poses: [
    { h: [30, 82], s: [38, 90], e: [38, 106], w: [52, 106], p: [70, 96], k: [84, 101], a: [98, 106] }] },
  hollow: { hot: ["torso"], cue: "Bas du dos plaqué au sol, bras et jambes tendus décollés : tiens la position.", poses: [
    { h: [30, 94], s: [40, 100], e: [28, 94], w: [16, 88], p: [64, 106], k: [84, 100], a: [104, 94], t: [108, 90] }] },
  lsit: { hot: ["torso", "arm"], cue: "Bras tendus, épaules basses : jambes tendues à l’horizontale.", poses: [
    { h: [52, 50], s: [54, 60], e: [54, 76], w: [54, 92], p: [56, 88], k: [78, 88], a: [100, 88], t: [104, 84], eq: [{ line: [44, 92, 64, 92] }] }] },
  handstand: { hot: ["arm", "torso"], cue: "Mains écartées largeur d’épaules, corps gainé et aligné, regard entre les mains.", poses: [
    { h: [60, 94], s: [60, 84], e: [60, 96], w: [60, 108], p: [60, 56], k: [60, 34], a: [60, 12], t: [64, 6] }] },
  lever: { hot: ["torso", "arm"], cue: "Suspendu bras tendus, corps gainé à l’horizontale : tiens la position.", poses: [
    { h: [46, 20], s: [54, 24], e: [57, 17], w: [60, 11], p: [80, 26], k: [96, 26], a: [112, 26], t: [116, 22], eq: [BAR_TOP] }] },
  planche: { hot: ["arm", "torso"], cue: "Bras tendus, épaules en avant des mains : corps gainé à l’horizontale au-dessus du sol.", poses: [
    { h: [34, 72], s: [44, 80], e: [44, 94], w: [44, 108], p: [72, 80], k: [90, 80], a: [108, 80], t: [112, 76] }] }
};

// Exercice → famille de mouvement (bibliothèque de l'app).
const MOVES = {
  "Développé couché": "bench", "Développé couché haltères": "bench", "Développé incliné": "bench", "Développé incliné haltères": "bench", "Développé décliné": "bench",
  "Écarté haltères": "fly", "Écarté à la poulie": "fly", "Pec deck (butterfly)": "fly", "Presse pectoraux": "bench", "Pompes": "pushup", "Pompes diamant": "pushup",
  "Dips": "dips", "Pull-over": "fly", "Tractions": "pullup", "Tractions lestées": "pullup", "Tractions supination (chin-up)": "pullup", "Tractions australiennes": "row",
  "Tirage vertical": "pullup", "Tirage vertical prise serrée": "pullup", "Tirage horizontal": "row", "Rowing barre": "row", "Rowing haltère": "row", "Rowing T-bar": "row",
  "Rowing machine": "row", "Soulevé de terre": "hinge", "Soulevé de terre roumain": "hinge", "Soulevé de terre sumo": "hinge", "Shrugs": "shrug", "Face pull": "row",
  "Extension lombaire": "hinge", "Good morning": "hinge", "Développé militaire": "ohp", "Développé épaules haltères": "ohp", "Développé Arnold": "ohp",
  "Élévations latérales": "raise", "Élévations latérales à la poulie": "raise", "Élévations frontales": "raise", "Oiseau (arrière d’épaule)": "raise",
  "Rowing menton": "shrug", "Push press": "ohp", "Curl barre": "curl", "Curl haltères": "curl", "Curl marteau": "curl", "Curl incliné": "curl", "Curl pupitre": "curl",
  "Curl à la poulie": "curl", "Extension triceps à la poulie": "pushdown", "Extension triceps nuque": "pushdown", "Barre au front": "pushdown",
  "Développé couché prise serrée": "bench", "Kickback triceps": "pushdown", "Curl poignets": "curl", "Farmer walk": "walk", "Squat": "squat", "Front squat": "squat",
  "Squat goblet": "squatbw", "Hack squat": "squat", "Presse à cuisses": "legext", "Fentes": "lunge", "Fentes bulgares": "lunge", "Leg extension": "legext",
  "Leg curl": "legcurl", "Hip thrust": "hipthrust", "Pont fessier": "hipthrust", "Abducteurs machine": "legext", "Step-up": "lunge", "Mollets debout": "calf",
  "Mollets assis": "calf", "Squats (poids du corps)": "squatbw", "Pistol squat": "squatbw", "Box jumps": "boxjump", "Crunch": "crunch", "Crunch à la poulie": "crunch",
  "Relevés de jambes": "legraise", "Toes to bar": "legraise", "Gainage": "plank", "Gainage latéral": "plank", "Russian twist": "crunch", "Roue abdominale": "pushup",
  "Mountain climbers": "climber", "Sit-ups": "crunch", "L-sit": "lsit", "Hollow hold": "hollow", "Muscle-up": "pullup", "Handstand push-up": "hspu", "Pompes pike": "pushup",
  "Pompes archer": "pushup", "Front lever": "lever", "Back lever": "lever", "Planche": "planche", "Handstand": "handstand", "Human flag": "lever",
  "Dips aux anneaux": "dips", "Kettlebell swings": "swing", "Thrusters": "thruster", "Clean": "clean", "Snatch": "clean", "Burpees": "burpee", "Wall balls": "thruster",
  "Montée de corde": "rope", "Montée de corde sans jambes": "rope"
};
// Noms tapés à la main : on reconnaît la famille grâce à quelques mots-clés.
const MOVE_WORDS = [
  [/pompe|push ?up/, "pushup"], [/dips/, "dips"], [/couche|bench|incline|decline|presse pec/, "bench"], [/ecarte|butterfly|pec deck|fly/, "fly"],
  [/traction|pull ?up|chin|tirage vertical|muscle ?up/, "pullup"], [/rowing|row\b|tirage|face pull/, "row"], [/terre|deadlift|good morning|lombaire/, "hinge"],
  [/militaire|epaule|overhead|arnold|push press/, "ohp"], [/elevation|oiseau/, "raise"], [/shrug/, "shrug"], [/curl/, "curl"],
  [/triceps|barre au front|kickback|extension nuque/, "pushdown"], [/goblet|pistol|poids du corps/, "squatbw"], [/squat/, "squat"], [/fente|lunge|step/, "lunge"],
  [/leg curl/, "legcurl"], [/leg extension|presse|abduct/, "legext"], [/hip thrust|pont|fessier/, "hipthrust"], [/mollet|calf/, "calf"],
  [/relev|toes to bar/, "legraise"], [/crunch|sit ?up|twist/, "crunch"], [/gainage|planche abdo|plank/, "plank"], [/corde|rope/, "rope"],
  [/swing/, "swing"], [/thruster|wall ?ball/, "thruster"], [/clean|snatch|arrache|epaule jete/, "clean"], [/box/, "boxjump"], [/burpee/, "burpee"],
  [/climber/, "climber"], [/farmer|marche/, "walk"]
];
const key = n => norm(n || "").replace(/\s+/g, " ").trim();
// Construit au premier usage (et pas au chargement du fichier : norm vient d'un autre fichier).
let MOVE_KEYS = null;
export function moveOf(name) {
  const k = key(name); if (!k) return null;
  MOVE_KEYS = MOVE_KEYS || Object.fromEntries(Object.entries(MOVES).map(([n, f]) => [key(n), f]));
  const id = MOVE_KEYS[k] || (MOVE_WORDS.find(([re]) => re.test(k)) || [])[1];
  return id ? { id, ...FAMILIES[id] } : null;
}

/* ---------- Dessin ---------- */
const pt = a => a[0] + " " + a[1];
function limb(pts, cls, w) { return `<polyline points="${pts.map(pt).join(" ")}" class="hf-${cls}" stroke-width="${w}"/>`; }
function equipment(e) {
  if (e.bar) return `<g class="hf-eq"><circle cx="${e.bar[0]}" cy="${e.bar[1]}" r="8"/><circle cx="${e.bar[0]}" cy="${e.bar[1]}" r="2" class="hf-dot"/></g>`;
  if (e.db) return `<rect class="hf-eq hf-fill" x="${e.db[0] - 6}" y="${e.db[1] - 3}" width="12" height="6" rx="2"/>`;
  if (e.kb) return `<g class="hf-eq"><circle cx="${e.kb[0]}" cy="${e.kb[1] + 2}" r="5" class="hf-fill"/><path d="M${e.kb[0] - 3} ${e.kb[1] - 2}a3 3 0 0 1 6 0"/></g>`;
  if (e.line) return `<line class="hf-eq" x1="${e.line[0]}" y1="${e.line[1]}" x2="${e.line[2]}" y2="${e.line[3]}"/>`;
  if (e.rect) return `<g class="hf-eq"><rect class="hf-fill" x="${e.rect[0]}" y="${e.rect[1]}" width="${e.rect[2]}" height="${e.rect[3]}" rx="2"/>${(e.legs || []).map(l => `<line x1="${l[0]}" y1="${l[1]}" x2="${l[2]}" y2="${l[3]}"/>`).join("")}</g>`;
  return "";
}
// Une pose en SVG : parties travaillées en couleur (hot), le reste en gris.
export function figureSVG(pose, hot) {
  const c = part => hot.includes(part) ? "hot" : "body";
  const t = pose.t || [pose.a[0] + 7, pose.a[1] + 1];
  const neck = [pose.s[0] + (pose.h[0] - pose.s[0]) * 0.45, pose.s[1] + (pose.h[1] - pose.s[1]) * 0.45];
  return `<svg viewBox="0 -8 120 128" class="hf" aria-hidden="true" focusable="false">
    <line class="hf-ground" x1="4" y1="110.5" x2="116" y2="110.5"/>
    ${(pose.eq || []).map(equipment).join("")}
    ${pose.k2 ? `<g class="hf-back">${limb([pose.p, pose.k2, pose.a2, [pose.a2[0] + 7, pose.a2[1] + 1]], c("leg"), 7)}</g>` : ""}
    ${limb([pose.p, pose.k, pose.a], c("leg"), 7)}${limb([pose.a, t], c("leg"), 5)}
    ${limb([pose.s, pose.p], c("torso"), 10)}${limb([pose.s, neck], "body", 6)}
    ${limb([pose.s, pose.e, pose.w], c("arm"), 6)}
    <circle cx="${pose.h[0]}" cy="${pose.h[1]}" r="7" class="hf-head"/>
  </svg>`;
}

/* ---------- Bouton « ? » et fenêtre ---------- */
export function howBtnHTML(name, i) {
  if (!moveOf(name)) return "";
  return `<button type="button" class="how-btn" data-how="${i}" aria-label="Comment faire : ${esc(name)}"><span aria-hidden="true">?</span></button>`;
}
let opener = null, inerted = [];
function openHow(name, btn) {
  const mv = moveOf(name); if (!mv) return;
  opener = btn;
  const [a, b] = mv.poses, reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Les silhouettes ne sont dessinées qu'ici, à l'ouverture.
  $h("howTitle").textContent = name;
  $h("howStage").className = "how-stage" + (b ? (reduce ? " side" : " boom") : " still");
  $h("howStage").innerHTML = !b
    ? `<figure>${figureSVG(a, mv.hot)}<figcaption>Position à tenir</figcaption></figure>`
    : reduce
      ? `<figure>${figureSVG(a, mv.hot)}<figcaption>Départ</figcaption></figure><figure>${figureSVG(b, mv.hot)}<figcaption>Arrivée</figcaption></figure>`
      : `<div class="how-anim" role="img" aria-label="Animation du mouvement : départ puis arrivée, en boucle"><div class="how-a">${figureSVG(a, mv.hot)}</div><div class="how-b">${figureSVG(b, mv.hot)}</div></div>`;
  $h("howCue").textContent = mv.cue;
  // Le reste de l'app devient inerte tant que la fenêtre est ouverte.
  inerted = [...document.body.children].filter(el => el.id !== "howSheet" && el.id !== "howBackdrop" && !el.inert);
  inerted.forEach(el => { el.inert = true; });
  $h("howBackdrop").hidden = false; $h("howSheet").hidden = false;
  $h("howClose").focus();
  document.addEventListener("keydown", onKey);
}
function closeHow() {
  if ($h("howSheet").hidden) return;
  $h("howBackdrop").hidden = true; $h("howSheet").hidden = true; $h("howStage").innerHTML = "";
  inerted.forEach(el => { el.inert = false; }); inerted = [];
  document.removeEventListener("keydown", onKey);
  // Le bouton a pu être redessiné entre-temps : on retrouve le même.
  const back = opener && opener.isConnected ? opener : opener && document.querySelector(`[data-how="${opener.dataset.how}"]`);
  if (back) back.focus();
  opener = null;
}
function onKey(e) {
  if (e.key === "Escape") { e.preventDefault(); closeHow(); return; }
  if (e.key === "Tab") { e.preventDefault(); $h("howClose").focus(); } // un seul élément actif dans la fenêtre
}
const $h = id => document.getElementById(id);
document.addEventListener("click", e => {
  const b = e.target.closest("[data-how]"); if (!b) return;
  e.stopPropagation();
  const inp = document.getElementById("exn-" + b.dataset.how);
  openHow(inp ? inp.value : b.getAttribute("aria-label").replace(/^Comment faire : /, ""), b);
}, true);
$h("howClose").onclick = closeHow;
$h("howBackdrop").onclick = closeHow;

export { FAMILIES };
