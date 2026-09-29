// « Comment faire » : silhouette animée de chaque exercice (dessinée en SVG, aucune image ni vidéo).
// Chaque famille de mouvement a une pose de départ et une pose d'arrivée ; l'animation passe
// de l'une à l'autre en fondu enchaîné, puis revient (effet boomerang).
import { esc } from "./core.js";
import { norm } from "./faq.js";
import { musclesOf } from "./workout.js";
import { bodySVG } from "./muscles.js";

// Pose de profil (tournée vers la droite). h tête, s épaule, e coude, w main, p hanche, k genou, a cheville, t pointe du pied.
// k2 / a2 : seconde jambe (fentes, marche), dessinée en retrait. eq : matériel.
const STAND = { h: [60, 26], s: [60, 38], e: [61, 54], w: [62, 69], p: [60, 66], k: [60, 87], a: [60, 107] };
const P = o => ({ ...STAND, ...o });
const M = (p, s) => ({ p, s: s || [] });
const BENCH = { bench: [16, 80, 68] };
const PULLBAR = { pullbar: [26, 96, 10] };
const DOWN = { flip: true }; // corps face au sol
// Vue de face (symétrique) : on décrit le côté droit de l'image, le gauche est son miroir.
const STANDF = { view: "front", h: [60, 24], s: [71, 39], e: [74, 54], w: [75, 68], p: [66, 65], k: [67, 87], a: [67, 107] };
const F = o => ({ ...STANDF, ...o });

const FAMILIES = {
  squat: { mus: M(["quadriceps", "fessiers"], ["ischios", "lombaires"]), cue: "Dos droit, poitrine sortie : descends les hanches sous les genoux, puis pousse dans les talons.", poses: [
    P({ e: [50, 44], w: [58, 35], eq: [{ bar: [58, 35] }] }),
    P({ h: [64, 50], s: [56, 61], e: [46, 67], w: [55, 58], p: [42, 86], k: [69, 88], eq: [{ bar: [55, 58] }] })] },
  squatbw: { mus: M(["quadriceps", "fessiers"], ["ischios", "abdos"]), cue: "Bras devant pour l’équilibre, genoux dans l’axe des pieds, talons au sol.", poses: [
    P({ e: [74, 44], w: [88, 44] }),
    P({ h: [64, 50], s: [56, 61], e: [70, 64], w: [86, 64], p: [42, 86], k: [69, 88] })] },
  hinge: { mus: M(["ischios", "fessiers", "lombaires"], ["dorsaux", "trapezes", "avantbras"]), cue: "Dos bien droit, barre collée aux jambes : pousse les hanches vers l’avant pour te redresser.", poses: [
    P({ h: [82, 54], s: [72, 60], e: [72, 77], w: [72, 93], p: [45, 78], k: [64, 92], eq: [{ bar: [72, 97] }] }),
    P({ e: [61, 54], w: [62, 70], eq: [{ bar: [62, 72], front: true }] })] },
  bench: { mus: M(["pecs"], ["triceps", "epaules"]), cue: "Omoplates serrées, pieds au sol : descends la barre à la poitrine puis pousse vers le haut.", poses: [
    { h: [26, 71], s: [37, 75], e: [29, 84], w: [40, 64], p: [64, 76], k: [84, 72], a: [90, 106], eq: [BENCH, { bar: [40, 61] }] },
    { h: [26, 71], s: [37, 75], e: [38, 59], w: [40, 43], p: [64, 76], k: [84, 72], a: [90, 106], eq: [BENCH, { bar: [40, 41] }] }] },
  fly: { mus: M(["pecs"], ["epaules"]), cue: "Coudes légèrement fléchis : ouvre les bras sans descendre trop bas, puis referme au-dessus de la poitrine.", poses: [
    { h: [26, 71], s: [37, 75], e: [26, 82], w: [15, 76], p: [64, 76], k: [84, 72], a: [90, 106], eq: [BENCH, { db: [15, 76], front: true }] },
    { h: [26, 71], s: [37, 75], e: [38, 60], w: [40, 45], p: [64, 76], k: [84, 72], a: [90, 106], eq: [BENCH, { db: [40, 44], front: true }] }] },
  ohp: { mus: M(["epaules"], ["triceps", "trapezes"]), cue: "Gainé, fessiers serrés : pousse la charge au-dessus de la tête sans cambrer le dos.", poses: [
    F({ e: [83, 48], w: [80, 35], eq: [{ fbar: 34, front: true }] }),
    F({ e: [80, 22], w: [78, 6], eq: [{ fbar: 5, front: true }] })] },
  pullup: { mus: M(["dorsaux"], ["biceps", "avantbras", "trapezes"]), cue: "Pars bras tendus, tire les coudes vers le bas jusqu’à passer le menton au-dessus de la barre.", poses: [
    F({ h: [60, 31], s: [71, 41], e: [78, 27], w: [81, 12], p: [66, 69], k: [66, 88], a: [65, 104], eq: [{ fpull: 10 }] }),
    F({ h: [60, 4], s: [72, 19], e: [89, 24], w: [81, 12], p: [66, 47], k: [66, 66], a: [65, 83], eq: [{ fpull: 10 }] })] },
  pulldown: { mus: M(["dorsaux"], ["biceps", "trapezes"]), cue: "Assis, cuisses calées : tire la barre jusqu’au haut de la poitrine en serrant les omoplates.", poses: [
    F({ h: [60, 40], s: [71, 50], e: [79, 35], w: [84, 21], p: [66, 76], k: [71, 86], a: [71, 106], eq: [{ fseat: 80 }, { fcable: 21 }, { froll: 76, front: true }] }),
    F({ h: [60, 40], s: [71, 50], e: [87, 62], w: [83, 50], p: [66, 76], k: [71, 86], a: [71, 106], eq: [{ fseat: 80 }, { fcable: 50 }, { froll: 76, front: true }] })] },
  row: { mus: M(["dorsaux", "trapezes"], ["biceps", "lombaires"]), cue: "Buste penché et dos droit : tire la charge vers le nombril en serrant les omoplates.", poses: [
    P({ h: [82, 54], s: [72, 60], e: [72, 77], w: [72, 93], p: [45, 78], k: [64, 92], eq: [{ db: [72, 95], front: true }] }),
    P({ h: [82, 54], s: [72, 60], e: [57, 70], w: [64, 84], p: [45, 78], k: [64, 92], eq: [{ db: [64, 86], front: true }] })] },
  curl: { mus: M(["biceps"], ["avantbras"]), cue: "Coudes collés au corps : monte la charge sans balancer, redescends lentement.", poses: [
    P({ eq: [{ db: [62, 71], front: true }] }),
    P({ w: [70, 40], eq: [{ db: [70, 38], front: true }] })] },
  pushdown: { mus: M(["triceps"]), cue: "Coudes fixes le long du corps : tends complètement les bras, puis remonte en contrôlant.", poses: [
    P({ e: [60, 55], w: [74, 47], eq: [{ cable: [74, 47] }] }),
    P({ e: [60, 55], w: [65, 71], eq: [{ cable: [65, 71] }] })] },
  raise: { mus: M(["epaules"], ["trapezes"]), cue: "Bras presque tendus : monte jusqu’à l’horizontale sans hausser les épaules.", poses: [
    F({ eq: [{ fdb: 1 }] }),
    F({ e: [86, 41], w: [100, 42], eq: [{ fdb: 1 }] })] },
  shrug: { mus: M(["trapezes"], ["avantbras"]), cue: "Bras tendus : monte les épaules vers les oreilles, marque une pause, redescends.", poses: [
    F({ eq: [{ fdb: 1 }] }),
    F({ s: [71, 34], e: [74, 49], w: [75, 63], eq: [{ fdb: 1 }] })] },
  pushup: { mus: M(["pecs"], ["triceps", "epaules", "abdos"]), cue: "Corps gainé en planche : descends la poitrine près du sol puis pousse.", poses: [
    { ...DOWN, h: [31, 64], s: [40, 73], e: [38, 90], w: [36, 106], p: [70, 88], k: [85, 97], a: [99, 104], t: [104, 108] },
    { ...DOWN, h: [30, 86], s: [41, 92], e: [55, 95], w: [36, 106], p: [70, 99], k: [85, 103], a: [99, 104], t: [104, 108] }] },
  dips: { mus: M(["pecs", "triceps"], ["epaules"]), cue: "Buste légèrement penché : descends jusqu’à avoir les coudes à 90°, puis remonte.", poses: [
    { h: [63, 21], s: [58, 32], e: [59, 46], w: [60, 60], p: [56, 60], k: [65, 79], a: [55, 92], t: [58, 98], eq: [{ dipbar: [42, 84, 60] }] },
    { h: [65, 42], s: [58, 53], e: [44, 57], w: [60, 60], p: [56, 81], k: [65, 99], a: [55, 110], t: [58, 115], eq: [{ dipbar: [42, 84, 60] }] }] },
  lunge: { mus: M(["quadriceps", "fessiers"], ["ischios"]), cue: "Grand pas : descends le genou arrière près du sol, genou avant au-dessus de la cheville.", poses: [
    P({ k2: [60, 87], a2: [60, 107], eq: [{ db: [62, 71], front: true }] }),
    P({ h: [58, 48], s: [58, 60], e: [59, 76], w: [60, 91], p: [58, 87], k: [78, 87], a: [78, 107], k2: [45, 103], a2: [29, 105], eq: [{ db: [60, 93], front: true }] })] },
  crunch: { mus: M(["abdos"], ["obliques"]), cue: "Bas du dos au sol : enroule le haut du dos en soufflant, sans tirer sur la nuque.", poses: [
    { h: [22, 99], s: [33, 101], e: [29, 90], w: [21, 94], p: [62, 102], k: [77, 86], a: [90, 106] },
    { h: [40, 77], s: [47, 87], e: [41, 76], w: [36, 80], p: [62, 102], k: [77, 86], a: [90, 106] }] },
  legraise: { mus: M(["abdos"], ["obliques", "avantbras"]), cue: "Suspendu sans balancer : monte les jambes tendues le plus haut possible, redescends lentement.", poses: [
    { h: [66, 38], s: [58, 46], e: [59, 29], w: [60, 12], p: [57, 74], k: [58, 94], a: [58, 110], t: [63, 114], eq: [PULLBAR] },
    { h: [66, 38], s: [58, 46], e: [59, 29], w: [60, 12], p: [57, 74], k: [78, 72], a: [98, 70], t: [101, 64], eq: [PULLBAR] }] },
  hipthrust: { mus: M(["fessiers"], ["ischios", "quadriceps"]), cue: "Haut du dos sur le banc, pieds à plat : pousse les hanches vers le haut en serrant les fessiers.", poses: [
    { h: [22, 78], s: [33, 84], e: [44, 92], w: [54, 96], p: [56, 102], k: [75, 88], a: [85, 107], eq: [{ bench: [4, 86, 32] }, { bar: [56, 95], front: true }] },
    { h: [22, 78], s: [33, 84], e: [44, 80], w: [56, 78], p: [58, 83], k: [79, 83], a: [85, 107], eq: [{ bench: [4, 86, 32] }, { bar: [58, 76], front: true }] }] },
  calf: { mus: M(["mollets"]), cue: "Monte sur la pointe des pieds le plus haut possible, marque une pause, redescends lentement.", poses: [
    P({ eq: [{ box: [52, 104, 24, 6] }] }),
    P({ h: [60, 20], s: [60, 32], e: [61, 48], w: [62, 63], p: [60, 60], k: [60, 81], a: [60, 99], t: [67, 104], eq: [{ box: [52, 104, 24, 6] }] })] },
  legext: { mus: M(["quadriceps"]), cue: "Dos calé contre le dossier : tends les jambes complètement, redescends en contrôlant.", poses: [
    { h: [48, 43], s: [50, 54], e: [54, 68], w: [60, 80], p: [50, 82], k: [72, 83], a: [73, 104], eq: [{ seat: [40, 84] }, { roller: [77, 101], front: true }] },
    { h: [48, 43], s: [50, 54], e: [54, 68], w: [60, 80], p: [50, 82], k: [72, 83], a: [94, 79], t: [99, 73], eq: [{ seat: [40, 84] }, { roller: [96, 84], front: true }] }] },
  legpress: { mus: M(["quadriceps", "fessiers"], ["ischios"]), cue: "Dos et bassin collés au siège : pousse la plateforme sans verrouiller les genoux, redescends lentement.", poses: [
    { h: [20, 66], s: [28, 74], e: [38, 80], w: [46, 84], p: [44, 94], k: [58, 70], a: [76, 78], t: [80, 72], eq: [{ bench: [14, 96, 40] }, { sled: [80, 76] }] },
    { h: [20, 66], s: [28, 74], e: [38, 80], w: [46, 84], p: [44, 94], k: [70, 84], a: [96, 70], t: [100, 64], eq: [{ bench: [14, 96, 40] }, { sled: [100, 68] }] }] },
  legcurl: { mus: M(["ischios"], ["mollets"]), cue: "Hanches collées au banc : ramène les talons vers les fessiers, redescends lentement.", poses: [
    { ...DOWN, h: [18, 73], s: [29, 76], e: [27, 88], w: [36, 90], p: [58, 77], k: [80, 77], a: [102, 77], t: [104, 71], eq: [BENCH, { roller: [102, 71], front: true }] },
    { ...DOWN, h: [18, 73], s: [29, 76], e: [27, 88], w: [36, 90], p: [58, 77], k: [80, 77], a: [71, 57], t: [65, 55], eq: [BENCH, { roller: [74, 54], front: true }] }] },
  rope: { mus: M(["dorsaux", "biceps"], ["avantbras", "abdos"]), cue: "Pieds qui serrent la corde : grimpe en tirant avec les bras, puis resserre les jambes plus haut.", poses: [
    { h: [55, 44], s: [57, 55], e: [60, 44], w: [64, 32], p: [56, 81], k: [63, 95], a: [64, 104], eq: [{ rope: 64 }] },
    { h: [55, 23], s: [57, 34], e: [60, 23], w: [64, 11], p: [56, 60], k: [64, 71], a: [64, 84], eq: [{ rope: 64 }] }] },
  swing: { mus: M(["fessiers", "ischios"], ["lombaires", "epaules"]), cue: "Mouvement des hanches, pas des bras : projette les hanches vers l’avant pour lancer la charge.", poses: [
    P({ h: [82, 54], s: [72, 60], e: [65, 76], w: [57, 90], p: [45, 78], k: [64, 92], eq: [{ kb: [55, 92], front: true }] }),
    P({ e: [77, 40], w: [93, 38], eq: [{ kb: [97, 36], front: true }] })] },
  thruster: { mus: M(["quadriceps", "epaules"], ["fessiers", "triceps"]), cue: "Descends en squat avec la barre devant les épaules, puis remonte en poussant la barre au-dessus de la tête.", poses: [
    P({ h: [64, 50], s: [56, 61], e: [65, 71], w: [64, 58], p: [42, 86], k: [69, 88], eq: [{ bar: [65, 56], front: true }] }),
    P({ e: [61, 21], w: [61, 4], eq: [{ bar: [61, 3] }] })] },
  clean: { mus: M(["fessiers", "trapezes"], ["quadriceps", "ischios", "epaules"]), cue: "Barre près du corps : tire du sol avec les jambes, puis passe les coudes devant pour la recevoir sur les épaules.", poses: [
    P({ h: [82, 54], s: [72, 60], e: [72, 77], w: [72, 93], p: [45, 78], k: [64, 92], eq: [{ bar: [72, 97] }] }),
    P({ e: [71, 48], w: [67, 36], eq: [{ bar: [68, 34], front: true }] })] },
  boxjump: { mus: M(["quadriceps", "fessiers"], ["mollets"]), cue: "Élan des bras, saute à pieds joints et réceptionne-toi en douceur, genoux fléchis.", poses: [
    { h: [34, 50], s: [30, 61], e: [21, 72], w: [15, 82], p: [19, 86], k: [42, 88], a: [35, 107], eq: [{ box: [62, 80, 40, 30] }] },
    { h: [82, 2], s: [82, 14], e: [83, 30], w: [84, 45], p: [82, 42], k: [82, 61], a: [82, 78], eq: [{ box: [62, 80, 40, 30] }] }] },
  burpee: { mus: M(["pecs", "quadriceps"], ["abdos", "epaules"]), cue: "Mains au sol, pieds en arrière, poitrine au sol, puis remonte et saute bras en l’air.", poses: [
    { ...DOWN, h: [30, 86], s: [41, 92], e: [55, 95], w: [36, 106], p: [70, 99], k: [85, 103], a: [99, 104], t: [104, 108] },
    P({ h: [60, 18], s: [60, 30], e: [61, 13], w: [62, -3], p: [60, 58], k: [60, 79], a: [60, 99], t: [66, 104] })] },
  climber: { mus: M(["abdos"], ["quadriceps", "epaules"]), cue: "En planche, bras tendus : ramène un genou vers la poitrine, puis l’autre, sans lever les fesses.", poses: [
    { ...DOWN, h: [31, 64], s: [40, 73], e: [38, 90], w: [36, 106], p: [70, 88], k: [85, 97], a: [99, 104], t: [104, 108] },
    { ...DOWN, h: [31, 64], s: [40, 73], e: [38, 90], w: [36, 106], p: [70, 88], k: [52, 90], a: [64, 103], t: [69, 107] }] },
  walk: { mus: M(["avantbras", "trapezes"], ["abdos", "quadriceps"]), cue: "Bras tendus, charges lourdes, dos droit : marche à petits pas en gardant les épaules basses.", poses: [
    P({ k: [66, 87], a: [70, 107], k2: [56, 87], a2: [48, 107], eq: [{ db: [62, 71], front: true }] }),
    P({ k: [56, 87], a: [48, 107], k2: [66, 87], a2: [70, 107], eq: [{ db: [62, 71], front: true }] })] },
  hspu: { mus: M(["epaules", "triceps"], ["trapezes"]), cue: "Contre un mur, tête vers le sol : descends la tête près du sol puis pousse bras tendus.", poses: [
    { h: [56, 99], s: [58, 88], e: [47, 96], w: [52, 106], p: [60, 60], k: [60, 38], a: [60, 17], t: [66, 13], eq: [{ box: [70, -8, 8, 118] }] },
    { h: [56, 82], s: [58, 71], e: [56, 89], w: [52, 106], p: [60, 43], k: [60, 21], a: [60, 0], t: [66, -4], eq: [{ box: [70, -8, 8, 118] }] }] },
  // Positions tenues (une seule pose : pas d'animation)
  plank: { mus: M(["abdos"], ["obliques", "epaules"]), cue: "Sur les avant-bras, corps aligné des épaules aux talons : serre les abdos et les fessiers.", poses: [
    { ...DOWN, h: [29, 81], s: [38, 89], e: [38, 104], w: [52, 105], p: [70, 95], k: [85, 100], a: [99, 104], t: [104, 108] }] },
  hollow: { mus: M(["abdos"], ["obliques"]), cue: "Bas du dos plaqué au sol, bras et jambes tendus décollés : tiens la position.", poses: [
    { h: [30, 93], s: [40, 99], e: [28, 93], w: [16, 87], p: [64, 104], k: [84, 99], a: [103, 93], t: [107, 88] }] },
  lsit: { mus: M(["abdos"], ["triceps", "quadriceps"]), cue: "Bras tendus, épaules basses : jambes tendues à l’horizontale.", poses: [
    { h: [52, 49], s: [54, 60], e: [54, 76], w: [54, 91], p: [56, 87], k: [78, 87], a: [99, 87], t: [103, 82], eq: [{ dipbar: [42, 66, 91] }] }] },
  handstand: { mus: M(["epaules"], ["trapezes", "abdos"]), cue: "Mains écartées largeur d’épaules, corps gainé et aligné, regard entre les mains.", poses: [
    { h: [60, 94], s: [60, 83], e: [60, 95], w: [60, 106], p: [60, 55], k: [60, 34], a: [60, 13], t: [64, 7] }] },
  lever: { mus: M(["dorsaux", "abdos"], ["biceps"]), cue: "Suspendu bras tendus, corps gainé à l’horizontale : tiens la position.", poses: [
    { h: [45, 21], s: [54, 25], e: [57, 18], w: [60, 12], p: [80, 27], k: [96, 27], a: [110, 27], t: [114, 23], eq: [PULLBAR] }] },
  planche: { mus: M(["epaules", "pecs"], ["abdos", "triceps"]), cue: "Bras tendus, épaules en avant des mains : corps gainé à l’horizontale au-dessus du sol.", poses: [
    { ...DOWN, h: [33, 72], s: [44, 79], e: [44, 93], w: [44, 106], p: [72, 79], k: [90, 79], a: [106, 79], t: [111, 83] }] }
};

// Exercice → famille de mouvement (bibliothèque de l'app).
const MOVES = {
  "Développé couché": "bench", "Développé couché haltères": "bench", "Développé incliné": "bench", "Développé incliné haltères": "bench", "Développé décliné": "bench",
  "Écarté haltères": "fly", "Écarté à la poulie": "fly", "Pec deck (butterfly)": "fly", "Presse pectoraux": "bench", "Pompes": "pushup", "Pompes diamant": "pushup",
  "Dips": "dips", "Pull-over": "fly", "Tractions": "pullup", "Tractions lestées": "pullup", "Tractions supination (chin-up)": "pullup", "Tractions australiennes": "row",
  "Tirage vertical": "pulldown", "Tirage vertical prise serrée": "pulldown", "Tirage horizontal": "row", "Rowing barre": "row", "Rowing haltère": "row", "Rowing T-bar": "row",
  "Rowing machine": "row", "Soulevé de terre": "hinge", "Soulevé de terre roumain": "hinge", "Soulevé de terre sumo": "hinge", "Shrugs": "shrug", "Face pull": "row",
  "Extension lombaire": "hinge", "Good morning": "hinge", "Développé militaire": "ohp", "Développé épaules haltères": "ohp", "Développé Arnold": "ohp",
  "Élévations latérales": "raise", "Élévations latérales à la poulie": "raise", "Élévations frontales": "raise", "Oiseau (arrière d’épaule)": "raise",
  "Rowing menton": "shrug", "Push press": "ohp", "Curl barre": "curl", "Curl haltères": "curl", "Curl marteau": "curl", "Curl incliné": "curl", "Curl pupitre": "curl",
  "Curl à la poulie": "curl", "Extension triceps à la poulie": "pushdown", "Extension triceps nuque": "pushdown", "Barre au front": "pushdown",
  "Développé couché prise serrée": "bench", "Kickback triceps": "pushdown", "Curl poignets": "curl", "Farmer walk": "walk", "Squat": "squat", "Front squat": "squat",
  "Squat goblet": "squatbw", "Hack squat": "squat", "Presse à cuisses": "legpress", "Fentes": "lunge", "Fentes bulgares": "lunge", "Leg extension": "legext",
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
  [/tirage vertical|pulldown/, "pulldown"], [/traction|pull ?up|chin|muscle ?up/, "pullup"], [/rowing|row\b|tirage|face pull/, "row"], [/terre|deadlift|good morning|lombaire/, "hinge"],
  [/militaire|epaule|overhead|arnold|push press/, "ohp"], [/elevation|oiseau/, "raise"], [/shrug/, "shrug"], [/curl/, "curl"],
  [/triceps|barre au front|kickback|extension nuque/, "pushdown"], [/goblet|pistol|poids du corps/, "squatbw"], [/squat/, "squat"], [/fente|lunge|step/, "lunge"],
  [/leg curl/, "legcurl"], [/presse a cuisse|leg press/, "legpress"], [/leg extension|abduct/, "legext"], [/hip thrust|pont|fessier/, "hipthrust"], [/mollet|calf/, "calf"],
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
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]], add = (a, b) => [a[0] + b[0], a[1] + b[1]], mul = (a, k) => [a[0] * k, a[1] * k];
const len = v => Math.hypot(v[0], v[1]) || 1, unit = v => mul(v, 1 / len(v)), f = n => Math.round(n * 10) / 10, P2 = q => f(q[0]) + " " + f(q[1]);
// Le « devant » d'un segment qui part vers le bas du corps (épaule → hanche, hanche → genou…).
const front = (from, to, flip) => { const u = unit(sub(to, from)); return mul([u[1], -u[0]], flip ? -1 : 1); };
// Muscle en forme de fuseau le long d'un segment, décalé vers l'avant (+) ou l'arrière (-).
function belly(A, B, nf, side, from, to, width, cls) {
  const u = unit(sub(B, A)), L = len(sub(B, A)), a = add(add(A, mul(u, L * from)), mul(nf, side)), b = add(add(A, mul(u, L * to)), mul(nf, side));
  const m = mul(add(a, b), 0.5), n = mul(nf, width);
  return `<path class="${cls}" d="M${P2(a)}Q${P2(add(m, n))} ${P2(b)}Q${P2(sub(m, n))} ${P2(a)}Z"/>`;
}
function equipment(e, pose) {
  // Matériel vu de face
  if (e.fpull != null) { const y = e.fpull; return `<g class="hf-eq"><rect class="hf-metal" x="14" y="${y}" width="3.5" height="${110 - y}"/><rect class="hf-metal" x="102.5" y="${y}" width="3.5" height="${110 - y}"/><line class="hf-line" x1="15" y1="${y + 1}" x2="105" y2="${y + 1}"/></g>`; }
  if (e.fbar != null) { const y = e.fbar; return `<g class="hf-eq"><line class="hf-line" x1="12" y1="${y}" x2="108" y2="${y}"/><rect class="hf-dark" x="14" y="${y - 10}" width="5" height="20" rx="1.5"/><rect class="hf-dark" x="101" y="${y - 10}" width="5" height="20" rx="1.5"/><rect class="hf-dark" x="20" y="${y - 7}" width="3.5" height="14" rx="1"/><rect class="hf-dark" x="96.5" y="${y - 7}" width="3.5" height="14" rx="1"/></g>`; }
  if (e.fdb) return [pose.w, mirror(pose.w)].map(([x, y]) => `<g class="hf-eq"><rect class="hf-metal" x="${x - 1.2}" y="${y - 6}" width="2.4" height="12" rx="1"/><rect class="hf-dark" x="${x - 4.5}" y="${y - 8.5}" width="9" height="3.5" rx="1"/><rect class="hf-dark" x="${x - 4.5}" y="${y + 5}" width="9" height="3.5" rx="1"/></g>`).join("");
  if (e.fcable != null) { const y = e.fcable; return `<g class="hf-eq"><line class="hf-cable" x1="60" y1="-8" x2="60" y2="${y}"/><path class="hf-line" d="M28 ${y + 5}Q32 ${y} 40 ${y}H80Q88 ${y} 92 ${y + 5}"/></g>`; }
  if (e.fseat != null) { const y = e.fseat; return `<g class="hf-eq"><rect class="hf-metal" x="58.5" y="${y}" width="3" height="${108 - y}"/><rect class="hf-metal" x="46" y="107" width="28" height="3" rx="1"/><rect class="hf-pad" x="42" y="${y - 3}" width="36" height="6" rx="3"/></g>`; }
  if (e.froll != null) { const y = e.froll; return `<rect class="hf-pad" x="42" y="${y}" width="36" height="7" rx="3.5"/>`; }
  if (e.bar) { const [x, y] = e.bar; return `<g class="hf-eq"><circle class="hf-plate" cx="${x}" cy="${y}" r="9"/><circle class="hf-plate2" cx="${x}" cy="${y}" r="5.5"/><circle class="hf-dot" cx="${x}" cy="${y}" r="1.8"/></g>`; }
  if (e.db) { const [x, y] = e.db; return `<g class="hf-eq"><rect class="hf-metal" x="${x - 6}" y="${y - 1.2}" width="12" height="2.4" rx="1"/><rect class="hf-dark" x="${x - 8}" y="${y - 4.5}" width="3.5" height="9" rx="1"/><rect class="hf-dark" x="${x + 4.5}" y="${y - 4.5}" width="3.5" height="9" rx="1"/></g>`; }
  if (e.kb) { const [x, y] = e.kb; return `<g class="hf-eq"><path class="hf-line" d="M${x - 3.5} ${y}a3.5 4 0 0 1 7 0"/><circle class="hf-dark" cx="${x}" cy="${y + 5}" r="5.5"/></g>`; }
  if (e.bench) { const [x, y, w] = e.bench; return `<g class="hf-eq"><rect class="hf-metal" x="${x + 5}" y="${y + 4}" width="3" height="${108 - y - 4}"/><rect class="hf-metal" x="${x + w - 8}" y="${y + 4}" width="3" height="${108 - y - 4}"/><rect class="hf-metal" x="${x + 1}" y="107" width="11" height="3" rx="1"/><rect class="hf-metal" x="${x + w - 12}" y="107" width="11" height="3" rx="1"/><rect class="hf-pad" x="${x}" y="${y}" width="${w}" height="6" rx="3"/></g>`; }
  if (e.pullbar) { const [x1, x2, y] = e.pullbar; return `<g class="hf-eq"><rect class="hf-metal" x="${x1 - 2}" y="${y}" width="3.5" height="${110 - y}"/><rect class="hf-metal" x="${x2 - 1.5}" y="${y}" width="3.5" height="${110 - y}"/><line class="hf-line" x1="${x1}" y1="${y + 1}" x2="${x2}" y2="${y + 1}"/></g>`; }
  if (e.dipbar) { const [x1, x2, y] = e.dipbar; return `<g class="hf-eq"><rect class="hf-metal" x="${x1}" y="${y}" width="3" height="${110 - y}"/><rect class="hf-metal" x="${x2 - 3}" y="${y}" width="3" height="${110 - y}"/><line class="hf-line" x1="${x1}" y1="${y}" x2="${x2}" y2="${y}"/></g>`; }
  if (e.cable) { const [hx, hy] = e.cable; return `<g class="hf-eq"><rect class="hf-metal" x="94" y="-6" width="7" height="116" rx="1"/><circle class="hf-plate2" cx="92" cy="0" r="3.5"/><line class="hf-cable" x1="90" y1="1" x2="${hx}" y2="${hy}"/><line class="hf-line" x1="${hx - 5}" y1="${hy}" x2="${hx + 5}" y2="${hy}"/></g>`; }
  if (e.box) { const [x, y, w, h] = e.box; return `<rect class="hf-box" x="${x}" y="${y}" width="${w}" height="${h}" rx="2"/>`; }
  if (e.seat) { const [x, y] = e.seat; return `<g class="hf-eq"><rect class="hf-metal" x="${x + 10}" y="${y + 5}" width="3" height="${108 - y - 5}"/><rect class="hf-metal" x="${x}" y="107" width="24" height="3" rx="1"/><rect class="hf-pad" x="${x - 2}" y="${y}" width="26" height="6" rx="3"/><rect class="hf-pad" x="${x - 6}" y="${y - 32}" width="6" height="34" rx="3" transform="rotate(-8 ${x - 3} ${y})"/></g>`; }
  if (e.roller) { const [x, y] = e.roller; return `<circle class="hf-pad" cx="${x}" cy="${y}" r="4"/>`; }
  if (e.rope) return `<g class="hf-eq"><line class="hf-rope" x1="${e.rope}" y1="-8" x2="${e.rope}" y2="116"/><rect class="hf-metal" x="${e.rope - 14}" y="-10" width="28" height="3"/></g>`;
  if (e.sled) { const [x, y] = e.sled; return `<g class="hf-eq"><rect class="hf-dark" x="${x}" y="${y - 12}" width="5" height="24" rx="2" transform="rotate(-25 ${x} ${y})"/><line class="hf-line" x1="${x + 4}" y1="${y + 8}" x2="${x + 30}" y2="${y + 20}"/></g>`; }
  if (e.line) return `<line class="hf-line" x1="${e.line[0]}" y1="${e.line[1]}" x2="${e.line[2]}" y2="${e.line[3]}"/>`;
  return "";
}
// Contour d'un segment de membre effilé (ra au début, rb à la fin).
function capsuleD(A, B, ra, rb) {
  const u = unit(sub(B, A)), n = [-u[1], u[0]];
  return `M${P2(add(A, mul(n, ra)))}L${P2(add(B, mul(n, rb)))}A${rb} ${rb} 0 0 0 ${P2(sub(B, mul(n, rb)))}L${P2(sub(A, mul(n, ra)))}A${ra} ${ra} 0 0 0 ${P2(add(A, mul(n, ra)))}Z`;
}
const perp = (A, B) => { const u = unit(sub(B, A)); return [-u[1], u[0]]; };
const mirror = q => [120 - q[0], q[1]];
let uid = 0;
// Une pose : corps en volume, seuls les muscles travaillés sont colorés, découpés à la forme du corps.
export function figureSVG(pose, mus) {
  const Pm = (mus && mus.p) || [], Sd = (mus && mus.s) || [];
  const lvl = m => Pm.includes(m) ? " hf-p" : Sd.includes(m) ? " hf-s" : "";
  const id = "hf" + (++uid);
  // Forme de peau + ses muscles découpés à l'intérieur (clip) : contours nets, pas de traits parasites.
  // extra : dessiné aussi à l'intérieur (short), sous les muscles. skin : classe de la forme de base.
  const part = (d, name, inner, extra = "", skin = "hf-skin") => {
    const mu = extra + inner.filter(([m]) => lvl(m)).map(([m, shape]) => shape.replaceAll("<path ", `<path class="hf-mu${lvl(m)}" `).replaceAll("<ellipse ", `<ellipse class="hf-mu${lvl(m)}" `)).join("");
    return `<path class="${skin}" d="${d}"/>` + (mu ? `<clipPath id="${id}${name}"><path d="${d}"/></clipPath><g clip-path="url(#${id}${name})">${mu}</g>` : "");
  };
  const body = pose.view === "front" ? frontBody(pose, part, lvl, id) : sideBody(pose, part, lvl, id);
  return `<svg viewBox="0 -8 120 128" class="hf" aria-hidden="true" focusable="false">
    <line class="hf-ground" x1="2" y1="110.5" x2="118" y2="110.5"/>
    ${(pose.eq || []).filter(q => !q.front).map(q => equipment(q, pose)).join("")}
    ${body}
    ${(pose.eq || []).filter(q => q.front).map(q => equipment(q, pose)).join("")}
  </svg>`;
}
const lens = (A, B, nf, side, from, to, width) => belly(A, B, nf, side, from, to, width, "").replace(' class=""', "");
const ell = (c, rx, ry, rot) => `<ellipse cx="${f(c[0])}" cy="${f(c[1])}" rx="${rx}" ry="${ry}"${rot ? ` transform="rotate(${f(rot)} ${f(c[0])} ${f(c[1])})"` : ""}/>`;
const deg = v => Math.atan2(v[1], v[0]) * 180 / Math.PI;
// Tête : visage clair, cheveux sur le dessus et l'arrière du crâne.
function headSVG(h, off, id, r) {
  const hair = add(h, off);
  return `<clipPath id="${id}hd"><circle cx="${f(h[0])}" cy="${f(h[1])}" r="${r}"/></clipPath><circle class="hf-skin" cx="${f(h[0])}" cy="${f(h[1])}" r="${r}"/><g clip-path="url(#${id}hd)"><circle class="hf-hair" cx="${f(hair[0])}" cy="${f(hair[1])}" r="${r}"/></g>`;
}
// Vue de profil (tournée vers la droite, ou face au sol avec flip).
function sideBody(pose, part, lvl, id) {
  const { h, s, e, w, p, k, a } = pose, fl = !!pose.flip;
  const t = pose.t || add(a, front(p, k, fl)[0] >= 0 ? [8, 1] : [-8, 1]);
  const nT = front(s, p, fl), nU = front(s, e, fl), nF = front(e, w, fl), nTh = front(p, k, fl), nSh = front(k, a, fl);
  const uT = unit(sub(p, s)), uTh = unit(sub(k, p)), neck = add(s, mul(unit(sub(h, s)), 6));
  const c1 = add(s, add(mul(nT, 8.8), mul(uT, 3))), c2 = add(s, add(mul(nT, -7.6), mul(uT, 1.5))), h1 = add(p, mul(nT, 6.2)), h2 = add(p, mul(nT, -6.8));
  const torso = `M${P2(c2)}Q${P2(add(s, mul(uT, -5.5)))} ${P2(c1)}Q${P2(add(mul(add(c1, h1), 0.5), mul(nT, 1.8)))} ${P2(h1)}Q${P2(add(p, mul(uT, 6)))} ${P2(h2)}Q${P2(add(mul(add(c2, h2), 0.5), mul(nT, -2.6)))} ${P2(c2)}Z`;
  const gc = add(add(p, mul(unit(add(nT, nTh)), -4)), mul(uTh, 1.5));
  const butt = `M${P2(add(gc, [6.3, 0]))}A6.3 6.3 0 1 0 ${P2(add(gc, [-6.3, 0]))}A6.3 6.3 0 1 0 ${P2(add(gc, [6.3, 0]))}Z`;
  const calf = lens(k, a, nSh, -2.2, 0.06, 0.62, 3.2).match(/d="([^"]+)"/)[1];
  const shortsT = `<path class="hf-short" d="M${P2(add(p, add(mul(nT, 14), mul(uT, -5))))}L${P2(add(p, add(mul(nT, -14), mul(uT, -5))))}L${P2(add(p, add(mul(nT, -14), mul(uT, 14))))}L${P2(add(p, add(mul(nT, 14), mul(uT, 14))))}Z"/>`;
  const shortsL = `<path class="hf-short" d="${capsuleD(add(p, mul(uTh, -6)), add(p, mul(sub(k, p), 0.42)), 12, 12)}"/>`;
  const leg2 = pose.k2 ? `<g class="hf-back"><path class="hf-skin" d="${capsuleD(p, pose.k2, 7.6, 5.2)}"/><path class="hf-skin" d="${capsuleD(pose.k2, pose.a2, 5.2, 3.2)}"/><path class="hf-shoe" d="${capsuleD(pose.a2, add(pose.a2, [8, 1]), 3, 2.6)}"/></g>` : "";
  const deltoid = add(s, mul(unit(sub(e, s)), 1.5));
  return `${leg2}
    ${part(butt, "gl", [["fessiers", `<path d="${butt}"/>`]], "", "hf-short")}
    ${part(capsuleD(p, k, 7.8, 5.4), "th", [["quadriceps", lens(p, k, nTh, 5, 0.12, 0.96, 5.5)], ["ischios", lens(p, k, nTh, -5, 0.22, 0.96, 4.8)]], shortsL)}
    ${part(capsuleD(k, a, 5.3, 3.3), "sh", [])}
    ${part(calf, "ca", [["mollets", `<path d="${calf}"/>`]])}
    <path class="hf-shoe" d="${capsuleD(a, t, 3.3, 2.7)}"/>
    ${part(torso, "to", [["pecs", lens(s, p, nT, 6.5, 0.06, 0.42, 5)], ["abdos", lens(s, p, nT, 6, 0.46, 0.98, 3.6)], ["obliques", lens(s, p, nT, 1.5, 0.45, 0.9, 2.6)],
      ["dorsaux", lens(s, p, nT, -6.5, 0.08, 0.62, 4.5)], ["lombaires", lens(s, p, nT, -6.5, 0.64, 1, 3.4)], ["trapezes", lens(s, p, nT, -5.5, -0.15, 0.2, 4)]], shortsT)}
    <path class="hf-skin" d="${capsuleD(s, neck, 3.4, 3.2)}"/>
    ${headSVG(h, add(mul(nT, -3.2), mul(unit(sub(h, s)), 3)), id, 7)}<circle class="hf-skin" cx="${f(add(h, mul(nT, 6.8))[0])}" cy="${f(add(h, mul(nT, 6.8))[1])}" r="1.7"/>
    ${part(capsuleD(s, e, 4.8, 3.8), "ua", [["biceps", lens(s, e, nU, 3, 0.18, 0.96, 3.4)], ["triceps", lens(s, e, nU, -3, 0.12, 0.96, 3.4)]])}
    ${part(`M${P2(add(deltoid, [5.2, 0]))}A5.2 5.2 0 1 0 ${P2(add(deltoid, [-5.2, 0]))}A5.2 5.2 0 1 0 ${P2(add(deltoid, [5.2, 0]))}Z`, "de", [["epaules", ell(deltoid, 6, 6)]])}
    ${part(capsuleD(e, w, 3.8, 2.7), "fa", [["avantbras", lens(e, w, nF, 0, 0.02, 0.78, 4)]])}
    <circle class="hf-skin" cx="${f(w[0])}" cy="${f(w[1])}" r="3.1"/>`;
}
// Vue de face : corps symétrique (côté droit décrit, côté gauche en miroir).
function frontBody(pose, part, lvl, id) {
  const { h, s, p } = pose, my = (s[1] + p[1]) / 2;
  const R = [[63.5, s[1] - 6], [s[0] - 4, s[1] - 4.5], [s[0] - 0.5, s[1] - 2], [s[0] + 1.5, s[1] + 3], [s[0] - 0.5, s[1] + 8], [69, my + 3], [70.5, p[1] + 1], [60, p[1] + 5.5]];
  const L = R.slice(0, -1).reverse().map(mirror);
  const torso = `M${P2(R[0])}Q${P2(R[1])} ${P2(R[2])}Q${P2(R[3])} ${P2(R[4])}Q${P2([s[0] - 3.5, my - 4])} ${P2(R[5])}Q${P2([71, p[1] - 6])} ${P2(R[6])}L${P2(R[7])}L${P2(L[0])}Q${P2(mirror([71, p[1] - 6]))} ${P2(L[1])}Q${P2(mirror([s[0] - 3.5, my - 4]))} ${P2(L[2])}Q${P2(mirror(R[3]))} ${P2(L[4])}Q${P2(mirror(R[1]))} ${P2(L[6])}Z`;
  const side = (q, sg) => {
    const m = sg < 0 ? mirror : (x => x), s1 = m(q.s), e1 = m(q.e), w1 = m(q.w), p1 = m(q.p), k1 = m(q.k), a1 = m(q.a), tag = sg < 0 ? "l" : "r";
    const thigh = capsuleD(p1, k1, 7.6, 5.4), shin = capsuleD(k1, a1, 5.3, 3.4), up = capsuleD(s1, e1, 4.8, 3.8), fore = capsuleD(e1, w1, 3.7, 2.7);
    const nTh = perp(p1, k1), nSh = perp(k1, a1), nU = perp(s1, e1), nF = perp(e1, w1);
    return {
      legs: `${part(thigh, "th" + tag, [["quadriceps", lens(p1, k1, nTh, 0, 0.3, 0.98, 5.2)]])}
        ${part(shin, "sh" + tag, [["mollets", lens(k1, a1, nSh, 0, 0.06, 0.55, 2.6)]])}
        <ellipse class="hf-shoe" cx="${f(a1[0] + 1.6 * sg)}" cy="${f(a1[1] + 2.6)}" rx="4" ry="2.5"/>`,
      short: `<path class="hf-short" d="${capsuleD(p1, add(p1, mul(sub(k1, p1), 0.42)), 7.9, 6.3)}"/>`,
      arm: `${part(up, "ua" + tag, [["biceps", lens(s1, e1, nU, 0, 0.22, 0.98, 3.2)]])}${part(fore, "fa" + tag, [["avantbras", lens(e1, w1, nF, 0, 0.02, 0.8, 3.8)]])}
        ${part(`M${P2(add(s1, [4.8, 0]))}A4.8 4.8 0 1 0 ${P2(add(s1, [-4.8, 0]))}A4.8 4.8 0 1 0 ${P2(add(s1, [4.8, 0]))}Z`, "de" + tag, [["epaules", ell(s1, 6, 6)]])}
        <circle class="hf-skin" cx="${f(w1[0])}" cy="${f(w1[1])}" r="3.1"/>`
    };
  };
  const r = side(pose, 1), l = side(pose, -1), c = x => [x, 0];
  const shorts = `<path class="hf-short" d="M30 ${f(p[1] - 4)}H90V${f(p[1] + 12)}H30Z"/>`;
  return `${r.legs}${l.legs}${r.short}${l.short}
    ${part(torso, "to", [["pecs", ell([65.8, s[1] + 5.5], 5.8, 4.4) + ell([54.2, s[1] + 5.5], 5.8, 4.4)], ["abdos", `<path d="M56.2 ${f(s[1] + 12)}h7.6v${f(p[1] - s[1] - 14)}q0 3-3.8 3q-3.8 0-3.8-3Z"/>`],
      ["obliques", ell([68.6, my + 5], 2.6, 7) + ell([51.4, my + 5], 2.6, 7)], ["dorsaux", ell([s[0] + 0.5, s[1] + 12], 3.6, 9, -12) + ell(mirror([s[0] + 0.5, s[1] + 12]), 3.6, 9, 12)],
      ["trapezes", ell([60, s[1] - 5], 10, 3.4)]], shorts)}
    <path class="hf-skin" d="${capsuleD([60, s[1] - 4], add(h, c(0)), 3.6, 3.4)}"/>
    ${headSVG(h, [0, -4.4], id, 7)}
    ${r.arm}${l.arm}`;
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
  // Muscles de l'exercice (bibliothèque ou exercice perso), sinon ceux du mouvement.
  const found = musclesOf(name), mus = found && found.p.length ? found : mv.mus;
  const lv = {}; (mus.s || []).forEach(m => { lv[m] = 2; }); mus.p.forEach(m => { lv[m] = 4; });
  // Les silhouettes ne sont dessinées qu'ici, à l'ouverture.
  $h("howTitle").textContent = name;
  $h("howStage").className = "how-stage" + (b ? (reduce ? " side" : " boom") : " still");
  $h("howStage").innerHTML = !b
    ? `<figure>${figureSVG(a, mus)}<figcaption>Position à tenir</figcaption></figure>`
    : reduce
      ? `<figure>${figureSVG(a, mus)}<figcaption>Départ</figcaption></figure><figure>${figureSVG(b, mus)}<figcaption>Arrivée</figcaption></figure>`
      : `<div class="how-anim" role="img" aria-label="Animation du mouvement : départ puis arrivée, en boucle"><div class="how-a">${figureSVG(a, mus)}</div><div class="how-b">${figureSVG(b, mus)}</div></div>`;
  $h("howCue").textContent = mv.cue;
  $h("howMap").innerHTML = `<figure>${bodySVG("front", lv)}<figcaption>Face</figcaption></figure><figure>${bodySVG("back", lv)}<figcaption>Dos</figcaption></figure>
    <p class="how-legend"><span><i class="lp"></i>Muscles principaux</span><span><i class="ls"></i>Muscles qui aident</span></p>`;
  // Le reste de l'app devient inerte tant que la fenêtre est ouverte.
  inerted = [...document.body.children].filter(el => el.id !== "howSheet" && el.id !== "howBackdrop" && !el.inert);
  inerted.forEach(el => { el.inert = true; });
  $h("howBackdrop").hidden = false; $h("howSheet").hidden = false;
  $h("howClose").focus();
  document.addEventListener("keydown", onKey);
}
function closeHow() {
  if ($h("howSheet").hidden) return;
  $h("howBackdrop").hidden = true; $h("howSheet").hidden = true; $h("howStage").innerHTML = ""; $h("howMap").innerHTML = "";
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
