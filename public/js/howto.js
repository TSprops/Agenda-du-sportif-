// « Comment faire » : silhouette animée de chaque exercice (dessinée en SVG, aucune image ni vidéo).
// Chaque famille de mouvement a une pose de départ et une pose d'arrivée ; l'animation passe
// de l'une à l'autre en fondu enchaîné, puis revient (effet boomerang).
import { esc } from "./core.js";
import { norm } from "./faq.js";
import { musclesOf } from "./workout.js";
import { bodySVG } from "./muscles.js";
import { figure, frameBox } from "./figure.js";
import { HOW } from "./moves.js";

// Petits calculs de géométrie (utilisés par les poses et le dessin).
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]], add = (a, b) => [a[0] + b[0], a[1] + b[1]], mul = (a, k) => [a[0] * k, a[1] * k];
const len = v => Math.hypot(v[0], v[1]) || 1, unit = v => mul(v, 1 / len(v)), f = n => Math.round(n * 10) / 10, P2 = q => f(q[0]) + " " + f(q[1]);

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
// Allongé sur le dos, vu depuis les pieds (développé, écarté) ; en appui face au sol, vu de face (pompes).
const LIE = o => ({ view: "front", nolegs: true, headBack: true, h: [60, 73], s: [71, 82], p: [66, 95], ...o });
const HEAD = o => ({ view: "front", nolegs: true, ...o });

// poses : vue de profil ; front : vue de face (ou depuis les pieds pour les exercices allongés). grip : placement des mains.
const FAMILIES = {
  squat: { mus: M(["quadriceps", "fessiers"], ["ischios", "lombaires"]), cue: "Dos droit, poitrine sortie : descends les hanches sous les genoux, puis pousse dans les talons.", poses: [
    P({ e: [50, 44], w: [58, 35], eq: [{ bar: [58, 35] }] }),
    P({ h: [64, 50], s: [56, 61], e: [46, 67], w: [55, 58], p: [42, 86], k: [69, 88], eq: [{ bar: [55, 58] }] })], front: [
    F({ e: [88, 46], w: [83, 35], eq: [{ fbar: 34 }] }),
    F({ h: [60, 47], s: [71, 61], e: [88, 70], w: [83, 58], p: [66, 84], k: [80, 90], a: [70, 107], eq: [{ fbar: 57 }] })] },
  squatbw: { mus: M(["quadriceps", "fessiers"], ["ischios", "abdos"]), cue: "Bras devant pour l’équilibre, genoux dans l’axe des pieds, talons au sol.", poses: [
    P({ e: [74, 44], w: [88, 44] }),
    P({ h: [64, 50], s: [56, 61], e: [70, 64], w: [86, 64], p: [42, 86], k: [69, 88] })], front: [
    F({ e: [75, 45], w: [70, 42] }),
    F({ h: [60, 47], s: [71, 61], e: [75, 67], w: [70, 64], p: [66, 84], k: [80, 90], a: [70, 107] })] },
  hinge: { mus: M(["ischios", "fessiers", "lombaires"], ["dorsaux", "trapezes", "avantbras"]), cue: "Dos bien droit, barre collée aux jambes : pousse les hanches vers l’avant pour te redresser.", poses: [
    P({ h: [82, 54], s: [72, 60], e: [72, 77], w: [72, 93], p: [45, 78], k: [64, 92], eq: [{ bar: [72, 97] }] }),
    P({ e: [61, 54], w: [62, 70], eq: [{ bar: [62, 72], front: true }] })], front: [
    F({ h: [60, 50], s: [71, 56], e: [73, 73], w: [73, 89], p: [66, 72], k: [71, 90], a: [68, 107], eq: [{ fbar: 91, front: true }] }),
    F({ eq: [{ fbar: 70, front: true }] })] },
  bench: { mus: M(["pecs"], ["triceps", "epaules"]), grip: "bench", cue: "Omoplates serrées, pieds au sol : descends la barre à la poitrine puis pousse vers le haut.", poses: [
    { h: [26, 71], s: [37, 75], e: [29, 84], w: [40, 64], p: [64, 76], k: [84, 72], a: [90, 106], eq: [BENCH, { bar: [40, 61] }] },
    { h: [26, 71], s: [37, 75], e: [38, 59], w: [40, 43], p: [64, 76], k: [84, 72], a: [90, 106], eq: [BENCH, { bar: [40, 41] }] }], front: [
    LIE({ e: [91, 83], w: [90, 66], eq: [{ fbench: 95 }, { fbar: 65, front: true }] }),
    LIE({ e: [81, 58], w: [79, 42], eq: [{ fbench: 95 }, { fbar: 41, front: true }] })] },
  fly: { mus: M(["pecs"], ["epaules"]), cue: "Coudes légèrement fléchis : ouvre les bras sans descendre trop bas, puis referme au-dessus de la poitrine.", poses: [
    { h: [26, 71], s: [37, 75], e: [26, 82], w: [15, 76], p: [64, 76], k: [84, 72], a: [90, 106], eq: [BENCH, { db: [15, 76], front: true }] },
    { h: [26, 71], s: [37, 75], e: [38, 60], w: [40, 45], p: [64, 76], k: [84, 72], a: [90, 106], eq: [BENCH, { db: [40, 44], front: true }] }], front: [
    LIE({ e: [95, 84], w: [108, 78], eq: [{ fbench: 95 }, { fdb: 1, front: true }] }),
    LIE({ e: [80, 58], w: [67, 44], eq: [{ fbench: 95 }, { fdb: 1, front: true }] })] },
  flycable: { mus: M(["pecs"], ["epaules"]), cue: "Debout entre les deux poulies hautes, buste un peu penché : ramène les mains l’une vers l’autre devant toi, bras presque tendus, puis rouvre lentement.", poses: [
    P({ h: [64, 27], s: [62, 39], e: [56, 48], w: [55, 40], eq: [{ ctop: 50 }] }),
    P({ h: [64, 27], s: [62, 39], e: [70, 51], w: [78, 60], eq: [{ ctop: 50 }] })], front: [
    F({ e: [89, 36], w: [103, 29], eq: [{ fcables: 1 }] }),
    F({ e: [79, 55], w: [64, 62], eq: [{ fcables: 1 }] })] },
  pullover: { mus: M(["dorsaux", "pecs"], ["triceps"]), cue: "Allongé, bras presque tendus : descends l’haltère derrière la tête, puis ramène-la au-dessus de la poitrine.", poses: [
    { h: [26, 71], s: [37, 75], e: [22, 69], w: [8, 70], p: [64, 76], k: [84, 72], a: [90, 106], eq: [BENCH, { db: [6, 70], front: true }] },
    { h: [26, 71], s: [37, 75], e: [38, 59], w: [40, 44], p: [64, 76], k: [84, 72], a: [90, 106], eq: [BENCH, { db: [40, 42], front: true }] }] },
  ohp: { mus: M(["epaules"], ["triceps", "trapezes"]), cue: "Gainé, fessiers serrés : pousse la charge au-dessus de la tête sans cambrer le dos.", poses: [
    P({ e: [52, 46], w: [63, 36], eq: [{ bar: [63, 35] }] }),
    P({ e: [61, 21], w: [61, 4], eq: [{ bar: [61, 3] }] })], front: [
    F({ e: [83, 48], w: [80, 35], eq: [{ fbar: 34, front: true }] }),
    F({ e: [80, 22], w: [78, 6], eq: [{ fbar: 5, front: true }] })] },
  pullup: { mus: M(["dorsaux"], ["biceps", "avantbras", "trapezes"]), grip: "pro", cue: "Pars bras tendus, tire les coudes vers le bas jusqu’à passer le menton au-dessus de la barre.", poses: [
    { h: [66, 38], s: [58, 46], e: [59, 29], w: [60, 12], p: [57, 74], k: [60, 92], a: [55, 106], t: [60, 110], eq: [PULLBAR] },
    { h: [66, 13], s: [58, 23], e: [47, 20], w: [60, 12], p: [57, 51], k: [61, 71], a: [55, 88], t: [60, 92], eq: [PULLBAR] }], front: [
    F({ h: [60, 31], s: [71, 41], e: [78, 27], w: [81, 12], p: [66, 69], k: [66, 88], a: [65, 104], eq: [{ fpull: 10 }] }),
    F({ h: [60, 4], s: [72, 19], e: [89, 24], w: [81, 12], p: [66, 47], k: [66, 66], a: [65, 83], eq: [{ fpull: 10 }] })] },
  pulldown: { mus: M(["dorsaux"], ["biceps", "trapezes"]), grip: "pro", cue: "Assis, cuisses calées : tire la barre jusqu’au haut de la poitrine en serrant les omoplates.", poses: [
    { h: [53, 43], s: [52, 53], e: [55, 36], w: [58, 19], p: [48, 82], k: [70, 82], a: [72, 106], eq: [{ seat: [38, 84] }, { roller: [70, 75] }, { cable: [58, 19] }] },
    { h: [55, 43], s: [52, 53], e: [44, 64], w: [58, 53], p: [48, 82], k: [70, 82], a: [72, 106], eq: [{ seat: [38, 84] }, { roller: [70, 75] }, { cable: [58, 53] }] }], front: [
    F({ h: [60, 40], s: [71, 50], e: [79, 35], w: [84, 21], p: [66, 76], k: [71, 86], a: [71, 106], eq: [{ fseat: 80 }, { fcable: 21 }, { froll: 76, front: true }] }),
    F({ h: [60, 40], s: [71, 50], e: [87, 62], w: [83, 50], p: [66, 76], k: [71, 86], a: [71, 106], eq: [{ fseat: 80 }, { fcable: 50 }, { froll: 76, front: true }] })] },
  row: { mus: M(["dorsaux", "trapezes"], ["biceps", "lombaires"]), grip: "row", cue: "Buste penché à 45°, dos droit : tire la barre vers le nombril en serrant les omoplates, redescends bras tendus.", poses: [
    P({ h: [82, 54], s: [72, 60], e: [72, 77], w: [72, 93], p: [45, 78], k: [64, 92], eq: [{ bar: [72, 95] }] }),
    P({ h: [82, 54], s: [72, 60], e: [57, 70], w: [64, 84], p: [45, 78], k: [64, 92], eq: [{ bar: [64, 86] }] })], front: [
    F({ h: [60, 50], s: [71, 57], e: [74, 74], w: [75, 90], p: [66, 73], k: [71, 90], a: [68, 107], eq: [{ fbar: 91, front: true }] }),
    F({ h: [60, 50], s: [71, 57], e: [88, 67], w: [78, 80], p: [66, 73], k: [71, 90], a: [68, 107], eq: [{ fbar: 81, front: true }] })] },
  rowdb: { mus: M(["dorsaux", "trapezes"], ["biceps", "lombaires"]), cue: "Une main et un genou sur le banc, dos plat : tire l’haltère vers la hanche, coude près du corps.", poses: [
    { h: [82, 56], s: [72, 62], e: [72, 79], w: [72, 95], p: [42, 64], k: [44, 84], a: [26, 86], k2: [50, 88], a2: [52, 107], eq: [{ bench: [14, 86, 50] }, { db: [72, 97], front: true }] },
    { h: [82, 56], s: [72, 62], e: [55, 68], w: [62, 82], p: [42, 64], k: [44, 84], a: [26, 86], k2: [50, 88], a2: [52, 107], eq: [{ bench: [14, 86, 50] }, { db: [62, 84], front: true }] }] },
  seatrow: { mus: M(["dorsaux", "trapezes"], ["biceps", "lombaires"]), cue: "Assis, dos droit, genoux un peu fléchis : tire la poignée vers le ventre en serrant les omoplates, sans basculer en arrière.", poses: [
    { h: [46, 49], s: [44, 61], e: [58, 68], w: [74, 72], p: [40, 90], k: [62, 82], a: [82, 96], t: [84, 88], eq: [{ box: [26, 93, 28, 17] }, { hcable: 72 }] },
    { h: [44, 49], s: [42, 61], e: [26, 70], w: [44, 74], p: [40, 90], k: [62, 82], a: [82, 96], t: [84, 88], eq: [{ box: [26, 93, 28, 17] }, { hcable: 72 }] }] },
  facepull: { mus: M(["epaules", "trapezes"], ["dorsaux", "biceps"]), cue: "Corde à hauteur du visage : tire vers les yeux en écartant les mains, coudes hauts.", poses: [
    P({ e: [74, 40], w: [88, 36], eq: [{ hcable: 36 }] }),
    P({ e: [48, 34], w: [64, 28], eq: [{ hcable: 36 }] })], front: [
    F({ e: [74, 43], w: [70, 39] }),
    F({ e: [92, 33], w: [82, 24] })] },
  invrow: { mus: M(["dorsaux", "trapezes"], ["biceps", "abdos"]), grip: "row", cue: "Sous une barre basse, corps gainé et droit : tire la poitrine jusqu’à la barre, redescends bras tendus.", poses: [
    { h: [36, 79], s: [47, 80], e: [47, 70], w: [48, 60], p: [75, 91], k: [92, 98], a: [108, 104], t: [110, 97], eq: [{ lowbar: [48, 58] }] },
    { h: [37, 62], s: [48, 65], e: [60, 72], w: [48, 60], p: [76, 83], k: [93, 94], a: [108, 104], t: [110, 97], eq: [{ lowbar: [48, 58] }] }] },
  curl: { mus: M(["biceps"], ["avantbras"]), cue: "Coudes collés au corps : monte la charge sans balancer, redescends lentement.", poses: [
    P({ eq: [{ db: [62, 71], front: true }] }),
    P({ w: [70, 40], eq: [{ db: [70, 38], front: true }] })], front: [
    F({ eq: [{ fdb: 1 }] }),
    F({ w: [75, 43], eq: [{ fdb: 1, front: true }] })] },
  pushdown: { mus: M(["triceps"]), cue: "Coudes fixes le long du corps : tends complètement les bras, puis remonte en contrôlant.", poses: [
    P({ e: [60, 55], w: [74, 47], eq: [{ cable: [74, 47] }] }),
    P({ e: [60, 55], w: [65, 71], eq: [{ cable: [65, 71] }] })], front: [
    F({ e: [74, 55], w: [68, 48], eq: [{ fcablev: 1 }] }),
    F({ e: [74, 55], w: [69, 71], eq: [{ fcablev: 1 }] })] },
  raise: { mus: M(["epaules"], ["trapezes"]), cue: "Bras presque tendus : monte sur les côtés jusqu’à l’horizontale sans hausser les épaules.", poses: [
    P({ eq: [{ db: [62, 71], front: true }] }),
    P({ e: [63, 41], w: [65, 40], eq: [{ db: [66, 40], front: true }] })], front: [
    F({ eq: [{ fdb: 1 }] }),
    F({ e: [86, 41], w: [100, 42], eq: [{ fdb: 1 }] })] },
  fraise: { mus: M(["epaules"], ["pecs", "trapezes"]), cue: "Bras presque tendus : monte la charge devant toi jusqu’à hauteur des yeux, redescends lentement.", poses: [
    P({ eq: [{ db: [62, 71], front: true }] }),
    P({ e: [77, 40], w: [93, 40], eq: [{ db: [95, 40], front: true }] })], front: [
    F({ eq: [{ fdb: 1 }] }),
    F({ e: [73, 42], w: [71, 38], eq: [{ fdb: 1, front: true }] })] },
  shrug: { mus: M(["trapezes"], ["avantbras"]), cue: "Bras tendus : monte les épaules vers les oreilles, marque une pause, redescends.", poses: [
    P({ eq: [{ db: [62, 71], front: true }] }),
    P({ s: [60, 34], e: [61, 50], w: [62, 65], eq: [{ db: [62, 67], front: true }] })], front: [
    F({ eq: [{ fdb: 1 }] }),
    F({ s: [71, 34], e: [74, 49], w: [75, 63], eq: [{ fdb: 1 }] })] },
  pushup: { mus: M(["pecs"], ["triceps", "epaules", "abdos"]), grip: "floor", cue: "Corps gainé en planche : descends la poitrine près du sol puis pousse.", poses: [
    { ...DOWN, h: [31, 64], s: [40, 73], e: [38, 90], w: [36, 106], p: [70, 88], k: [85, 97], a: [99, 104], t: [104, 108] },
    { ...DOWN, h: [30, 86], s: [41, 92], e: [55, 95], w: [36, 106], p: [70, 99], k: [85, 103], a: [99, 104], t: [104, 108] }], front: [
    HEAD({ h: [60, 63], s: [72, 72], e: [79, 89], w: [82, 106], p: [66, 82] }),
    HEAD({ h: [60, 87], s: [72, 94], e: [93, 97], w: [82, 106], p: [66, 102] })] },
  pushdiamond: { mus: M(["triceps", "pecs"], ["epaules", "abdos"]), grip: "diamond", cue: "Mains collées sous la poitrine en forme de losange : descends en gardant les coudes le long du corps, puis pousse.", poses: [
    { ...DOWN, h: [31, 64], s: [40, 73], e: [44, 90], w: [47, 106], p: [70, 88], k: [85, 97], a: [99, 104], t: [104, 108] },
    { ...DOWN, h: [30, 84], s: [41, 91], e: [58, 94], w: [47, 106], p: [70, 99], k: [85, 103], a: [99, 104], t: [104, 108] }], front: [
    HEAD({ h: [60, 63], s: [72, 72], e: [71, 90], w: [64, 106], p: [66, 82] }),
    HEAD({ h: [60, 85], s: [72, 93], e: [83, 101], w: [64, 106], p: [66, 102] })] },
  dips: { mus: M(["pecs", "triceps"], ["epaules"]), grip: "dips", cue: "Buste légèrement penché : descends jusqu’à avoir les coudes à 90°, puis remonte.", poses: [
    { h: [63, 21], s: [58, 32], e: [59, 46], w: [60, 60], p: [56, 60], k: [65, 79], a: [55, 92], t: [58, 98], eq: [{ dipbar: [42, 84, 60] }] },
    { h: [65, 42], s: [58, 53], e: [44, 57], w: [60, 60], p: [56, 81], k: [65, 99], a: [55, 106], t: [58, 111], eq: [{ dipbar: [42, 84, 60] }] }], front: [
    F({ h: [60, 22], s: [71, 35], e: [76, 48], w: [79, 60], p: [66, 62], k: [66, 81], a: [66, 96], eq: [{ fdip: 60 }] }),
    F({ h: [60, 42], s: [71, 55], e: [90, 60], w: [79, 60], p: [66, 82], k: [66, 99], a: [66, 106], eq: [{ fdip: 60 }] })] },
  lunge: { mus: M(["quadriceps", "fessiers"], ["ischios"]), cue: "Grand pas : descends le genou arrière près du sol, genou avant au-dessus de la cheville.", poses: [
    P({ k2: [60, 87], a2: [60, 107], eq: [{ db: [62, 71], front: true }] }),
    P({ h: [58, 48], s: [58, 60], e: [59, 76], w: [60, 91], p: [58, 87], k: [78, 87], a: [78, 107], k2: [45, 103], a2: [29, 105], eq: [{ db: [60, 93], front: true }] })], front: [
    F({ eq: [{ fdb: 1 }] }),
    F({ h: [60, 45], s: [71, 60], e: [74, 75], w: [75, 89], p: [66, 86], k: [69, 95], a: [68, 107], L: { k: [53, 104], a: [53, 108] }, eq: [{ fdb: 1 }] })] },
  crunch: { mus: M(["abdos"], ["obliques"]), cue: "Bas du dos au sol : enroule le haut du dos en soufflant, sans tirer sur la nuque.", poses: [
    { h: [22, 99], s: [33, 101], e: [29, 90], w: [21, 94], p: [62, 102], k: [77, 86], a: [90, 106] },
    { h: [40, 77], s: [47, 87], e: [41, 76], w: [36, 80], p: [62, 102], k: [77, 86], a: [90, 106] }] },
  legraise: { mus: M(["abdos"], ["obliques", "avantbras"]), cue: "Suspendu sans balancer : monte les jambes tendues le plus haut possible, redescends lentement.", poses: [
    { h: [66, 38], s: [58, 46], e: [59, 29], w: [60, 12], p: [57, 74], k: [58, 92], a: [58, 106], t: [63, 110], eq: [PULLBAR] },
    { h: [66, 38], s: [58, 46], e: [59, 29], w: [60, 12], p: [57, 74], k: [78, 72], a: [98, 70], t: [101, 64], eq: [PULLBAR] }] },
  hipthrust: { mus: M(["fessiers"], ["ischios", "quadriceps"]), cue: "Haut du dos sur le banc, pieds à plat : pousse les hanches vers le haut en serrant les fessiers.", poses: [
    { h: [22, 78], s: [33, 84], e: [44, 92], w: [54, 96], p: [56, 102], k: [75, 88], a: [85, 107], eq: [{ bench: [4, 86, 32] }, { bar: [56, 95], front: true }] },
    { h: [22, 78], s: [33, 84], e: [44, 80], w: [56, 78], p: [58, 83], k: [79, 83], a: [85, 107], eq: [{ bench: [4, 86, 32] }, { bar: [58, 76], front: true }] }] },
  calf: { mus: M(["mollets"]), cue: "Monte sur la pointe des pieds le plus haut possible, marque une pause, redescends lentement.", poses: [
    P({ eq: [{ box: [52, 104, 24, 6] }] }),
    P({ h: [60, 20], s: [60, 32], e: [61, 48], w: [62, 63], p: [60, 60], k: [60, 81], a: [60, 99], t: [67, 104], eq: [{ box: [52, 104, 24, 6] }] })], front: [
    F({ eq: [{ box: [40, 104, 40, 6] }] }),
    F({ h: [60, 18], s: [71, 33], e: [74, 48], w: [75, 62], p: [66, 59], k: [67, 81], a: [67, 99], eq: [{ box: [40, 104, 40, 6] }] })] },
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
    P({ e: [77, 40], w: [93, 38], eq: [{ kb: [97, 36], front: true }] })], front: [
    F({ h: [60, 50], s: [71, 56], e: [70, 72], w: [63, 86], p: [66, 72], k: [73, 90], a: [70, 107], eq: [{ fkb: 1, front: true }] }),
    F({ e: [71, 45], w: [63, 40], eq: [{ fkb: 1, front: true }] })] },
  thruster: { mus: M(["quadriceps", "epaules"], ["fessiers", "triceps"]), cue: "Descends en squat avec la barre devant les épaules, puis remonte en poussant la barre au-dessus de la tête.", poses: [
    P({ h: [64, 50], s: [56, 61], e: [65, 71], w: [64, 58], p: [42, 86], k: [69, 88], eq: [{ bar: [65, 56], front: true }] }),
    P({ e: [61, 21], w: [61, 4], eq: [{ bar: [61, 3] }] })], front: [
    F({ h: [60, 47], s: [71, 61], e: [80, 71], w: [80, 59], p: [66, 84], k: [80, 90], a: [70, 107], eq: [{ fbar: 58, front: true }] }),
    F({ e: [80, 22], w: [78, 6], eq: [{ fbar: 5, front: true }] })] },
  clean: { mus: M(["fessiers", "trapezes"], ["quadriceps", "ischios", "epaules"]), cue: "Barre près du corps : tire du sol avec les jambes, puis passe les coudes devant pour la recevoir sur les épaules.", poses: [
    P({ h: [82, 54], s: [72, 60], e: [72, 77], w: [72, 93], p: [45, 78], k: [64, 92], eq: [{ bar: [72, 97] }] }),
    P({ e: [71, 48], w: [67, 36], eq: [{ bar: [68, 34], front: true }] })], front: [
    F({ h: [60, 50], s: [71, 56], e: [73, 73], w: [73, 89], p: [66, 72], k: [71, 90], a: [68, 107], eq: [{ fbar: 91, front: true }] }),
    F({ e: [80, 47], w: [80, 36], eq: [{ fbar: 35, front: true }] })] },
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
    P({ k: [56, 87], a: [48, 107], k2: [66, 87], a2: [70, 107], eq: [{ db: [62, 71], front: true }] })], front: [
    F({ L: { k: [53, 84], a: [53, 103] }, eq: [{ fdb: 1 }] }),
    F({ k: [67, 84], a: [67, 103], eq: [{ fdb: 1 }] })] },
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

/* ---------- Variantes : même mouvement, autre banc ou autre charge ---------- */
const rotP = (q, c, deg) => { const r = deg * Math.PI / 180, x = q[0] - c[0], y = q[1] - c[1]; return [f(c[0] + x * Math.cos(r) - y * Math.sin(r)), f(c[1] + x * Math.sin(r) + y * Math.cos(r))]; };
// Barre ↔ haltères.
function withTool(poses, tool) {
  return poses.map(q => ({ ...q, eq: (q.eq || []).map(e => {
    if (tool === "db" && e.bar) return { db: [e.bar[0], e.bar[1] + 2], front: true };
    if (tool === "db" && e.fbar != null) return { fdb: 1, front: e.front };
    if (tool === "bar" && e.db) return { bar: e.db, front: e.front };
    if (tool === "bar" && e.fdb) return { fbar: q.w[1], front: true };
    return e;
  }) }));
}
// Banc incliné (deg > 0, tête plus haute) ou décliné (deg < 0, tête plus basse), vu de profil.
function tiltBench(poses, deg) {
  const c = [62, 77];
  return poses.map(q => {
    const o = { ...q };
    (deg > 0 ? ["h", "s"] : ["h", "s", "k"]).forEach(j => { o[j] = rotP(q[j], c, deg); });
    const d = sub(o.s, q.s); o.e = add(q.e, d); o.w = add(q.w, d);
    if (deg < 0) { o.a = add(o.k, [6, 15]); o.t = add(o.a, [8, 1]); }
    o.eq = (q.eq || []).flatMap(e => e.bench ? [{ ibench: [c[0], 81, deg] }].concat(deg < 0 ? [{ roller: add(o.a, [-1, -6]), front: true }] : [])
      : e.bar ? [{ ...e, bar: add(e.bar, d) }] : e.db ? [{ ...e, db: add(e.db, d) }] : [e]);
    return o;
  });
}
// Même banc vu depuis les pieds : le haut du corps monte (incliné) ou descend (décliné).
function tiltFront(poses, deg) {
  const dy = -Math.round(Math.sin(deg * Math.PI / 180) * 24), up = q => add(q, [0, dy]);
  return poses.map(q => ({ ...q, h: up(q.h), s: up(q.s), e: up(q.e), w: up(q.w),
    eq: (q.eq || []).map(e => e.fbench != null ? { fbench: e.fbench, back: deg > 0 ? q.s[1] + dy - 8 : null } : e.fbar != null ? { ...e, fbar: e.fbar + dy } : e) }));
}
const B = FAMILIES.bench;
B.front[0].mark = ["e", "90°"];
B.tips = ["Banc à plat, pieds bien à plat au sol, fesses et omoplates collées au banc.",
  "Barre : descends-la doucement jusqu’au bas des pectoraux (au niveau des tétons).",
  "Coudes à environ 45° du buste (ni collés au corps, ni écartés à 90°).",
  "En bas, les avant-bras sont verticaux et le coude fait un angle droit (90°).",
  "Débutant : commence avec la barre seule (20 kg) et fais-toi surveiller."];
const DB_TIPS = ["Haltères : pars bras tendus au-dessus des épaules, paumes tournées vers tes pieds.",
  "Descends jusqu’à ce que les coudes soient un peu plus bas que le banc (angle droit au coude, 90°).",
  "Coudes à environ 45° du buste, puis remonte en rapprochant les haltères sans les cogner.",
  "Pour t’installer : assieds-toi haltères sur les cuisses, puis allonge-toi en les ramenant contre la poitrine."];
const INCL = "Banc incliné : dossier relevé à 30–45° (2 ou 3 crans), assise un peu relevée pour ne pas glisser.";
const DECL = "Banc décliné : tête plus basse que les hanches (15–30°), pieds bloqués sous les boudins.";
Object.assign(FAMILIES, {
  benchdb: { ...B, grip: null, poses: withTool(B.poses, "db"), front: withTool(B.front, "db"), cue: "Allongé sur un banc plat, un haltère dans chaque main : descends-les sur les côtés de la poitrine, puis pousse vers le haut.",
    tips: ["Banc à plat, pieds bien à plat au sol.", ...DB_TIPS] },
  incline: { ...B, mus: M(["pecs", "epaules"], ["triceps"]), poses: tiltBench(B.poses, 35), front: tiltFront(B.front, 35),
    cue: "Sur un banc incliné : descends la barre sur le haut des pectoraux, puis pousse vers le haut.",
    tips: [INCL, "Barre : descends-la sur le haut des pectoraux, juste sous les clavicules.", "Coudes à environ 45° du buste ; en bas, avant-bras verticaux et coude à 90°.", "Omoplates serrées et collées au dossier, pieds à plat au sol."] },
  inclinedb: { ...B, grip: null, mus: M(["pecs", "epaules"], ["triceps"]), poses: withTool(tiltBench(B.poses, 35), "db"), front: withTool(tiltFront(B.front, 35), "db"),
    cue: "Sur un banc incliné, un haltère dans chaque main : descends-les au niveau du haut des pectoraux, puis pousse vers le haut.",
    tips: [INCL, ...DB_TIPS] },
  decline: { ...B, mus: M(["pecs"], ["triceps", "epaules"]), poses: tiltBench(B.poses, -18), front: tiltFront(B.front, -18),
    cue: "Sur un banc décliné, pieds bloqués : descends la barre sur le bas des pectoraux, puis pousse vers le haut.",
    tips: [DECL, "Barre : descends-la sur le bas des pectoraux.", "Coudes à environ 45° du buste ; en bas, coude à 90°.", "Débutant : fais-toi aider pour prendre et reposer la barre."] },
  ohpdb: { ...FAMILIES.ohp, poses: withTool(FAMILIES.ohp.poses, "db"), front: withTool(FAMILIES.ohp.front, "db"),
    cue: "Un haltère dans chaque main à hauteur des épaules : pousse au-dessus de la tête sans cambrer, redescends lentement.",
    tips: ["Debout ou assis sur un banc avec dossier bien droit (90°).", "Départ : haltères à hauteur des oreilles, coudes sous les poignets.", "Monte jusqu’à avoir les bras presque tendus au-dessus de la tête, sans cogner les haltères.", "Abdos et fessiers serrés : le dos ne se creuse pas."] },
  curlbar: { ...FAMILIES.curl, poses: withTool(FAMILIES.curl.poses, "bar"), front: withTool(FAMILIES.curl.front, "bar"),
    cue: "Barre en main, paumes vers l’avant, coudes collés au corps : monte la barre sans balancer, redescends lentement.",
    tips: ["Mains à largeur d’épaules, paumes vers l’avant (supination).", "Seuls les avant-bras bougent : les coudes restent le long du corps.", "Pas d’élan avec le dos : si tu balances, allège la barre."] }
});
FAMILIES.squat.tips = ["Pieds largeur d’épaules, pointes légèrement vers l’extérieur.", "Barre posée sur le haut du dos (pas sur la nuque), mains un peu plus larges que les épaules.", "Descends au moins jusqu’à avoir les cuisses parallèles au sol, genoux dans l’axe des pieds.", "Dos droit et regard devant : pousse dans les talons pour remonter."];
FAMILIES.hinge.tips = ["Pieds largeur de hanches, barre au-dessus du milieu du pied.", "Dos plat du début à la fin : jamais arrondi.", "Barre collée aux jambes pendant toute la montée.", "En haut, serre les fessiers sans te pencher en arrière."];
FAMILIES.pushup.tips = ["Mains un peu plus larges que les épaules, doigts vers l’avant.", "Corps droit comme une planche : ni fesses en l’air, ni ventre qui tombe.", "Coudes à environ 45° du corps, descends jusqu’à frôler le sol.", "Trop dur ? Fais-les sur les genoux ou mains sur un banc."];
FAMILIES.pushdiamond.tips = ["Pouces et index se touchent sous la poitrine et forment un losange.", "Coudes serrés le long du corps en descendant.", "Plus dur que les pompes classiques : commence sur les genoux si besoin."];
FAMILIES.pullup.tips = ["Pars bras complètement tendus, épaules basses.", "Tire les coudes vers le bas et vers l’arrière, poitrine vers la barre.", "Menton au-dessus de la barre, puis redescends lentement.", "Trop dur ? Utilise un élastique ou la machine d’assistance."];
FAMILIES.ohp.tips = ["Barre posée sur le haut de la poitrine, mains un peu plus larges que les épaules.", "Pousse la barre droit vers le haut en reculant légèrement la tête.", "Abdos et fessiers serrés : le dos ne se creuse pas.", "Bras tendus au-dessus de la tête, barre au-dessus du milieu du pied."];
FAMILIES.row.tips = ["Genoux légèrement fléchis, buste penché à environ 45°, dos plat.", "Tire la barre vers le nombril, coudes le long du corps.", "Serre les omoplates en haut, redescends bras tendus sans arrondir le dos."];
FAMILIES.dips.tips = ["Bras tendus au départ, épaules basses.", "Descends jusqu’à avoir les coudes à 90°, pas plus bas.", "Buste penché en avant = plus de pectoraux ; buste droit = plus de triceps."];
FAMILIES.fly.tips = ["Banc à plat, un haltère dans chaque main, paumes face à face.", "Coudes légèrement fléchis et fixes pendant tout le mouvement.", "Ouvre jusqu’à sentir l’étirement des pectoraux, sans descendre plus bas que le banc."];
FAMILIES.lunge.tips = ["Grand pas en avant, buste droit.", "Genou avant au-dessus de la cheville (pas au-delà des orteils).", "Genou arrière qui frôle le sol, puis pousse sur le talon avant."];
FAMILIES.hipthrust.tips = ["Le bas des omoplates posé sur le bord d’un banc plat.", "Pieds à plat, largeur de hanches ; en haut, les tibias sont verticaux.", "Barre sur le pli des hanches (avec une mousse), menton rentré.", "Serre fort les fessiers en haut : le corps forme une table des épaules aux genoux."];
// Exercices qui ont leur propre mouvement (machine, banc, position particulière).
const SEATED = { h: [48, 43], s: [50, 54], p: [50, 82], k: [72, 83], a: [73, 104] };
const SEATF = { view: "front", h: [60, 40], s: [71, 50], p: [66, 76], k: [71, 86], a: [71, 106] };
const LIEB = { h: [26, 71], s: [37, 75], p: [64, 76], k: [84, 72], a: [90, 106] };
Object.assign(FAMILIES, {
  chestpress: { mus: M(["pecs"], ["triceps", "epaules"]), cue: "Assis, dos collé au dossier, poignées à hauteur de poitrine : pousse devant toi sans verrouiller les coudes, reviens lentement.", poses: [
    { ...SEATED, e: [40, 62], w: [56, 57], eq: [{ seat: [38, 84] }, { handle: 1 }] },
    { ...SEATED, e: [66, 56], w: [82, 55], eq: [{ seat: [38, 84] }, { handle: 1 }] }], front: [
    { ...SEATF, e: [90, 60], w: [87, 50], eq: [{ fseat: 80 }, { fhandle: 1, front: true }] },
    { ...SEATF, e: [77, 53], w: [72, 50], eq: [{ fseat: 80 }, { fhandle: 1, front: true }] }],
    tips: ["Règle le siège pour que les poignées soient à hauteur du milieu de la poitrine.", "Dos et tête collés au dossier pendant tout le mouvement.", "Pousse jusqu’à avoir les bras presque tendus, puis reviens lentement."] },
  pecdeck: { mus: M(["pecs"], ["epaules"]), cue: "Assis, dos collé au dossier, avant-bras contre les coussins : ramène les bras l’un vers l’autre devant toi, puis rouvre lentement.", poses: [
    { ...SEATED, e: [48, 52], w: [47, 38], eq: [{ seat: [38, 84] }] },
    { ...SEATED, e: [66, 52], w: [68, 38], eq: [{ seat: [38, 84] }] }], front: [
    { ...SEATF, e: [93, 50], w: [93, 34], eq: [{ fseat: 80 }] },
    { ...SEATF, e: [71, 53], w: [65, 36], eq: [{ fseat: 80 }] }],
    tips: ["Règle le siège pour avoir les coudes à hauteur des épaules.", "Coudes fixes, bras pliés à 90° contre les coussins.", "Serre les pectoraux quand les mains se rejoignent, rouvre sans aller trop loin en arrière."] },
  goodmorning: { mus: M(["ischios", "lombaires"], ["fessiers"]), cue: "Barre sur le haut du dos, genoux à peine fléchis : penche le buste en avant dos droit, puis redresse-toi en poussant les hanches.", poses: [
    P({ e: [50, 44], w: [58, 35], eq: [{ bar: [58, 35] }] }),
    P({ h: [84, 58], s: [74, 62], e: [66, 56], w: [72, 52], p: [46, 74], k: [60, 90], eq: [{ bar: [72, 52] }] })], front: [
    F({ e: [88, 46], w: [83, 35], eq: [{ fbar: 34 }] }),
    F({ h: [60, 52], s: [71, 58], e: [88, 62], w: [83, 54], p: [66, 72], k: [68, 90], a: [68, 107], eq: [{ fbar: 53 }] })],
    tips: ["Commence léger : barre seule ou même un bâton.", "Dos plat, genoux légèrement fléchis et fixes.", "Descends jusqu’à sentir l’étirement derrière les cuisses (buste presque à l’horizontale), pas plus."] },
  backext: { mus: M(["lombaires"], ["fessiers", "ischios"]), cue: "Hanches calées sur le coussin, pieds bloqués : descends le buste dos droit, puis remonte jusqu’à être aligné.", poses: [
    { p: [56, 64], k: [40, 80], a: [26, 94], t: [22, 101], s: [66, 86], h: [70, 98], e: [72, 80], w: [67, 76], eq: [{ line: [22, 106, 62, 70] }, { roller: [61, 70] }, { roller: [28, 88] }] },
    { p: [56, 64], k: [40, 80], a: [26, 94], t: [22, 101], s: [76, 48], h: [84, 39], e: [80, 58], w: [74, 54], eq: [{ line: [22, 106, 62, 70] }, { roller: [61, 70] }, { roller: [28, 88] }] }],
    tips: ["Règle le coussin juste sous le haut des hanches.", "Bras croisés sur la poitrine, dos droit.", "Remonte jusqu’à l’alignement jambes–buste, sans te cambrer au-dessus."] },
  uprow: { mus: M(["epaules", "trapezes"], ["biceps"]), cue: "Barre contre les cuisses, mains un peu serrées : monte la barre le long du corps en levant les coudes, jusqu’en bas de la poitrine.", poses: [
    P({ eq: [{ bar: [62, 72], front: true }] }),
    P({ e: [52, 38], w: [65, 46], eq: [{ bar: [65, 46], front: true }] })], front: [
    F({ e: [71, 56], w: [67, 70], eq: [{ fbar: 70, front: true }] }),
    F({ e: [91, 37], w: [68, 47], eq: [{ fbar: 47, front: true }] })],
    tips: ["Mains à largeur d’épaules (pas collées), prise en pronation.", "Les coudes montent plus haut que les mains.", "Arrête-toi au bas de la poitrine : pas plus haut que les épaules."] },
  rearfly: { mus: M(["epaules"], ["trapezes", "dorsaux"]), cue: "Buste penché, dos droit, haltères sous la poitrine : ouvre les bras sur les côtés jusqu’à l’horizontale, redescends lentement.", poses: [
    P({ h: [82, 54], s: [72, 60], e: [72, 77], w: [72, 93], p: [45, 78], k: [64, 92], eq: [{ db: [72, 95], front: true }] }),
    P({ h: [82, 54], s: [72, 60], e: [71, 68], w: [70, 72], p: [45, 78], k: [64, 92], eq: [{ db: [70, 74], front: true }] })], front: [
    F({ h: [60, 50], s: [71, 57], e: [74, 74], w: [74, 90], p: [66, 73], k: [71, 90], a: [68, 107], eq: [{ fdb: 1 }] }),
    F({ h: [60, 50], s: [71, 57], e: [88, 62], w: [104, 63], p: [66, 73], k: [71, 90], a: [68, 107], eq: [{ fdb: 1 }] })],
    tips: ["Charges légères : c’est un petit muscle.", "Coudes légèrement fléchis et fixes.", "Ouvre les bras sur les côtés en pensant « écarter », pas « tirer »."] },
  inclcurl: { mus: M(["biceps"], ["avantbras"]), cue: "Assis sur un banc incliné, bras qui pendent derrière le corps : monte les haltères sans avancer les coudes, redescends lentement.", poses: [
    { h: [34, 47], s: [40, 58], e: [38, 74], w: [37, 90], p: [54, 83], k: [74, 84], a: [76, 106], eq: [{ ibench: [56, 86, 55] }, { db: [37, 92], front: true }] },
    { h: [34, 47], s: [40, 58], e: [38, 74], w: [48, 60], p: [54, 83], k: [74, 84], a: [76, 106], eq: [{ ibench: [56, 86, 55] }, { db: [48, 58], front: true }] }],
    tips: ["Banc incliné à 45–60°, dos et tête collés au dossier.", "Bras qui pendent verticalement au départ : les coudes ne bougent pas.", "Charge plus légère qu’au curl debout."] },
  preacher: { mus: M(["biceps"], ["avantbras"]), cue: "Haut des bras posé sur le pupitre : monte la charge vers les épaules, redescends lentement sans tendre brutalement.", poses: [
    { h: [54, 40], s: [52, 52], e: [70, 67], w: [84, 80], p: [44, 82], k: [64, 84], a: [66, 106], eq: [{ box: [32, 86, 22, 24] }, { slab: [54, 60, 76, 76] }, { db: [85, 82], front: true }] },
    { h: [54, 40], s: [52, 52], e: [70, 67], w: [64, 48], p: [44, 82], k: [64, 84], a: [66, 106], eq: [{ box: [32, 86, 22, 24] }, { slab: [54, 60, 76, 76] }, { db: [64, 46], front: true }] }],
    tips: ["Règle le siège pour que les aisselles touchent le haut du pupitre.", "L’arrière des bras reste collé au coussin.", "Ne tends pas complètement les bras en bas : garde un léger pli."] },
  skull: { mus: M(["triceps"]), cue: "Allongé, bras tendus au-dessus du visage : plie les coudes pour descendre la barre vers le front, puis tends les bras.", poses: [
    { ...LIEB, e: [33, 50], w: [24, 62], eq: [BENCH, { bar: [24, 60] }] },
    { ...LIEB, e: [33, 50], w: [35, 32], eq: [BENCH, { bar: [35, 30] }] }], front: [
    LIE({ e: [78, 50], w: [76, 67], eq: [{ fbench: 95 }, { fbar: 66, front: true }] }),
    LIE({ e: [78, 50], w: [78, 32], eq: [{ fbench: 95 }, { fbar: 31, front: true }] })],
    tips: ["Mains à largeur d’épaules (barre droite ou barre EZ).", "Les coudes restent fixes et pointent vers le plafond.", "Descends lentement vers le front, sans le toucher."] },
  ohext: { mus: M(["triceps"]), cue: "Haltère tenu à deux mains au-dessus de la tête : descends-le derrière la nuque en pliant les coudes, puis tends les bras.", poses: [
    P({ e: [64, 15], w: [52, 28], eq: [{ db: [52, 30] }] }),
    P({ e: [64, 15], w: [64, -1], eq: [{ db: [64, -3], front: true }] })], front: [
    F({ e: [70, 16], w: [62, 30], eq: [{ db: [60, 32], front: true }] }),
    F({ e: [70, 16], w: [62, 2], eq: [{ db: [60, 0], front: true }] })],
    tips: ["Assis ou debout, abdos serrés pour ne pas cambrer.", "Coudes pointés vers le haut, près de la tête.", "Seuls les avant-bras bougent."] },
  kickback: { mus: M(["triceps"]), cue: "Buste penché, bras collé au corps : tends l’avant-bras vers l’arrière, puis reviens lentement.", poses: [
    P({ h: [82, 50], s: [72, 56], e: [56, 62], w: [58, 78], p: [45, 76], k: [62, 92], eq: [{ db: [58, 80], front: true }] }),
    P({ h: [82, 50], s: [72, 56], e: [56, 62], w: [40, 68], p: [45, 76], k: [62, 92], eq: [{ db: [38, 68], front: true }] })],
    tips: ["Une main et un genou sur un banc si tu veux plus de stabilité.", "Le haut du bras reste parallèle au sol et immobile.", "Charge légère, mouvement lent."] },
  frontsquat: { mus: M(["quadriceps", "fessiers"], ["abdos"]), cue: "Barre posée sur l’avant des épaules, coudes hauts : descends en gardant le buste droit, puis remonte.", poses: [
    P({ e: [72, 46], w: [67, 38], eq: [{ bar: [68, 36], front: true }] }),
    P({ h: [62, 49], s: [57, 60], e: [70, 68], w: [64, 60], p: [42, 86], k: [69, 88], eq: [{ bar: [65, 58], front: true }] })], front: [
    F({ e: [82, 47], w: [80, 37], eq: [{ fbar: 36, front: true }] }),
    F({ h: [60, 47], s: [71, 61], e: [82, 70], w: [80, 60], p: [66, 84], k: [80, 90], a: [70, 107], eq: [{ fbar: 59, front: true }] })],
    tips: ["La barre repose sur l’avant des épaules, pas dans les mains.", "Coudes hauts, pointés devant toi, pendant toute la descente.", "Buste plus droit qu’au squat classique."] },
  goblet: { mus: M(["quadriceps", "fessiers"], ["abdos"]), cue: "Haltère ou kettlebell tenu contre la poitrine : descends entre tes genoux en gardant le buste droit, puis remonte.", poses: [
    P({ e: [66, 53], w: [69, 44], eq: [{ kb: [71, 40], front: true }] }),
    P({ h: [64, 50], s: [56, 61], e: [66, 74], w: [70, 65], p: [42, 86], k: [69, 88], eq: [{ kb: [72, 61], front: true }] })], front: [
    F({ e: [72, 53], w: [63, 44], eq: [{ fkb: 1, front: true }] }),
    F({ h: [60, 47], s: [71, 61], e: [74, 75], w: [63, 66], p: [66, 84], k: [80, 90], a: [70, 107], eq: [{ fkb: 1, front: true }] })],
    tips: ["Tiens la charge collée à la poitrine, coudes vers le bas.", "Pieds un peu plus larges que les épaules.", "Les coudes passent entre les genoux en bas."] },
  bulgarian: { mus: M(["quadriceps", "fessiers"], ["ischios"]), cue: "Pied arrière posé sur un banc : descends le genou arrière vers le sol, genou avant au-dessus de la cheville, puis remonte.", poses: [
    { h: [59, 24], s: [58, 36], e: [59, 52], w: [60, 67], p: [58, 64], k: [70, 85], a: [74, 107], k2: [48, 84], a2: [30, 79], eq: [{ bench: [6, 82, 32] }, { db: [60, 69], front: true }] },
    { h: [58, 42], s: [57, 54], e: [58, 70], w: [59, 85], p: [56, 82], k: [76, 86], a: [74, 107], k2: [42, 100], a2: [30, 79], eq: [{ bench: [6, 82, 32] }, { db: [59, 87], front: true }] }],
    tips: ["Banc à hauteur de genou, dessus du pied arrière posé dessus.", "Pied avant assez loin du banc pour que le genou reste au-dessus de la cheville.", "Buste droit, descends à la verticale."] },
  stepup: { mus: M(["quadriceps", "fessiers"], ["mollets"]), cue: "Un pied sur une box ou un banc : monte en poussant sur ce pied, puis redescends en contrôlant.", poses: [
    { h: [54, 28], s: [54, 40], e: [55, 56], w: [56, 71], p: [54, 68], k: [70, 72], a: [72, 83], k2: [52, 88], a2: [50, 107], eq: [{ box: [62, 86, 34, 24] }, { db: [56, 73], front: true }] },
    { h: [76, 8], s: [76, 20], e: [77, 36], w: [78, 51], p: [76, 48], k: [76, 67], a: [76, 83], k2: [70, 68], a2: [64, 84], eq: [{ box: [62, 86, 34, 24] }, { db: [78, 53], front: true }] }],
    tips: ["Box à hauteur de genou environ.", "Pousse sur le talon du pied posé sur la box, sans t’aider de la jambe au sol.", "Redescends lentement, en contrôlant."] },
  glutebridge: { mus: M(["fessiers"], ["ischios"]), cue: "Allongé au sol, pieds à plat : monte les hanches en serrant les fessiers, puis redescends.", poses: [
    { h: [18, 100], s: [29, 102], e: [40, 106], w: [50, 106], p: [58, 103], k: [76, 88], a: [86, 107] },
    { h: [18, 100], s: [30, 100], e: [40, 106], w: [50, 106], p: [58, 84], k: [78, 82], a: [86, 107] }],
    tips: ["Pieds à plat, largeur de hanches, talons près des fesses.", "Bras au sol le long du corps.", "En haut, genoux–hanches–épaules alignés : serre les fessiers 1 seconde."] },
  abduct: { mus: M(["fessiers"]), cue: "Assis, coussins contre l’extérieur des genoux : écarte les jambes, puis ramène-les lentement.", poses: [
    { ...SEATF, e: [80, 64], w: [84, 76], k: [69, 86], a: [69, 106], eq: [{ fseat: 80 }] },
    { ...SEATF, e: [80, 64], w: [84, 76], k: [85, 85], a: [82, 105], eq: [{ fseat: 80 }] }],
    tips: ["Dos collé au dossier, mains sur les poignées.", "Écarte sans à-coups, garde 1 seconde, ramène lentement."] },
  seatcalf: { mus: M(["mollets"]), cue: "Assis, coussin sur les cuisses, pointe des pieds sur la marche : monte les talons le plus haut possible, redescends lentement.", poses: [
    { ...SEATED, e: [60, 68], w: [69, 78], a: [73, 102], t: [81, 102], eq: [{ seat: [38, 84] }, { box: [64, 104, 24, 6] }, { roller: [70, 79], front: true }] },
    { ...SEATED, k: [72, 78], e: [60, 64], w: [69, 73], a: [73, 96], t: [81, 102], eq: [{ seat: [38, 84] }, { box: [64, 104, 24, 6] }, { roller: [70, 74], front: true }] }],
    tips: ["Seule la pointe des pieds est sur la marche, talons dans le vide.", "Descends les talons le plus bas possible avant de remonter."] },
  pistol: { mus: M(["quadriceps", "fessiers"], ["abdos"]), cue: "Sur une jambe, l’autre tendue devant : descends le plus bas possible en gardant l’équilibre, puis remonte.", poses: [
    P({ e: [74, 44], w: [88, 44], k2: [66, 86], a2: [74, 104] }),
    P({ h: [66, 52], s: [58, 63], e: [72, 64], w: [88, 62], p: [44, 90], k: [66, 90], a: [60, 107], k2: [66, 86], a2: [90, 84] })],
    tips: ["Bras tendus devant pour l’équilibre.", "Talon au sol tout du long.", "Pour apprendre : descends sur un banc ou tiens-toi à un support."] },
  cablecrunch: { mus: M(["abdos"], ["obliques"]), cue: "À genoux face à la poulie, corde derrière la tête : enroule le dos vers le sol en contractant les abdos, puis remonte.", poses: [
    { h: [66, 42], s: [62, 54], e: [72, 50], w: [67, 44], p: [60, 80], k: [64, 104], a: [42, 106], t: [36, 108], eq: [{ ctop: 62 }] },
    { h: [86, 86], s: [78, 76], e: [84, 88], w: [84, 82], p: [58, 82], k: [64, 104], a: [42, 106], t: [36, 108], eq: [{ ctop: 62 }] }],
    tips: ["Les hanches ne bougent pas : c’est le dos qui s’enroule.", "Mains fixes contre la tête.", "Souffle en descendant."] },
  russian: { mus: M(["obliques"], ["abdos"]), cue: "Assis, buste penché en arrière, pieds décollés : tourne les épaules d’un côté puis de l’autre en amenant les mains au sol.", poses: [
    { h: [36, 64], s: [40, 76], e: [48, 88], w: [60, 86], p: [54, 100], k: [70, 86], a: [86, 92], t: [90, 88] },
    { h: [36, 64], s: [40, 76], e: [46, 86], w: [54, 94], p: [54, 100], k: [70, 86], a: [86, 92], t: [90, 88] }], front: [
    { view: "front", h: [60, 52], s: [71, 64], p: [66, 92], k: [70, 84], a: [70, 98], e: [84, 82], w: [96, 94], L: { e: [64, 84], w: [90, 94] } },
    { view: "front", h: [60, 52], s: [71, 64], p: [66, 92], k: [70, 84], a: [70, 98], e: [56, 84], w: [30, 94], L: { e: [36, 82], w: [24, 94] } }],
    tips: ["Dos droit (pas arrondi), buste penché à environ 45°.", "Ce sont les épaules qui tournent, pas seulement les bras.", "Trop dur ? Garde les talons au sol."] },
  sideplank: { mus: M(["obliques"], ["abdos", "epaules"]), cue: "Sur un avant-bras, coude sous l’épaule, corps aligné de la tête aux pieds : tiens la position sans laisser tomber les hanches.", poses: [
    { h: [24, 70], s: [33, 80], e: [34, 104], w: [48, 106], p: [64, 92], k: [84, 99], a: [104, 104], t: [106, 98] }],
    tips: ["Coude juste sous l’épaule.", "Hanches hautes : le corps forme une ligne droite.", "Trop dur ? Pose le genou du dessous au sol."] },
  abwheel: { mus: M(["abdos"], ["dorsaux", "epaules"]), cue: "À genoux, mains sur la roue : roule devant toi en gardant le dos plat, puis reviens en contractant les abdos.", poses: [
    { ...DOWN, h: [36, 76], s: [46, 76], e: [46, 88], w: [46, 99], p: [68, 82], k: [72, 104], a: [92, 106], t: [96, 107], eq: [{ wheel: [46, 101] }] },
    { ...DOWN, h: [20, 93], s: [30, 97], e: [20, 98], w: [10, 99], p: [60, 94], k: [72, 104], a: [92, 106], t: [96, 107], eq: [{ wheel: [10, 101] }] }],
    tips: ["Dos plat, fesses serrées : le bas du dos ne se creuse jamais.", "Ne va pas plus loin que ce que tu contrôles.", "Débutant : fais de petites amplitudes."] },
  pike: { mus: M(["epaules"], ["triceps", "trapezes"]), cue: "Mains au sol, fesses en l’air (corps en V à l’envers) : descends la tête vers le sol entre tes mains, puis pousse.", poses: [
    { ...DOWN, h: [40, 90], s: [42, 80], e: [40, 93], w: [38, 106], p: [66, 60], k: [80, 84], a: [92, 106], t: [97, 108] },
    { ...DOWN, h: [44, 101], s: [48, 91], e: [58, 96], w: [38, 106], p: [68, 64], k: [80, 86], a: [92, 106], t: [97, 108] }],
    tips: ["Mains un peu plus larges que les épaules.", "Fesses hautes : plus tu es vertical, plus c’est dur.", "La tête descend devant les mains, pas entre elles."] },
  wallball: { mus: M(["quadriceps", "epaules"], ["fessiers"]), cue: "Ballon contre la poitrine : descends en squat, puis remonte et lance le ballon sur la cible au mur. Rattrape-le et enchaîne.", poses: [
    P({ h: [64, 50], s: [56, 61], e: [62, 72], w: [67, 62], p: [42, 86], k: [69, 88], eq: [{ box: [100, -8, 6, 118] }, { ball: [71, 58], front: true }] }),
    P({ e: [64, 21], w: [66, 6], eq: [{ box: [100, -8, 6, 118] }, { ball: [69, -2], front: true }] })],
    tips: ["Squat complet à chaque répétition.", "Utilise l’élan des jambes pour lancer le ballon.", "Regarde la cible, pas le ballon."] },
  snatch: { mus: M(["fessiers", "epaules"], ["quadriceps", "trapezes", "ischios"]), cue: "Prise large : arrache la barre du sol d’un seul mouvement pour la recevoir bras tendus au-dessus de la tête.", poses: [
    P({ h: [82, 54], s: [72, 60], e: [72, 77], w: [72, 93], p: [45, 78], k: [64, 92], eq: [{ bar: [72, 97] }] }),
    P({ e: [60, 20], w: [58, 4], eq: [{ bar: [58, 3] }] })], front: [
    F({ h: [60, 50], s: [71, 56], e: [80, 73], w: [86, 89], p: [66, 72], k: [71, 90], a: [68, 107], eq: [{ fbar: 91, front: true }] }),
    F({ e: [88, 22], w: [98, 5], eq: [{ fbar: 4, front: true }] })],
    tips: ["Mouvement technique : apprends-le avec un bâton ou une barre à vide.", "Prise très large (mains près des disques).", "Barre toujours près du corps pendant la montée."] },
  wristcurl: { mus: M(["avantbras"]), cue: "Assis, avant-bras posés sur les cuisses, poignets dans le vide : monte la charge en pliant seulement les poignets.", poses: [
    { h: [66, 46], s: [58, 56], e: [52, 80], w: [72, 84], p: [46, 84], k: [68, 84], a: [70, 106], eq: [{ box: [32, 88, 24, 22] }, { db: [75, 88], front: true }] },
    { h: [66, 46], s: [58, 56], e: [52, 80], w: [72, 79], p: [46, 84], k: [68, 84], a: [70, 106], eq: [{ box: [32, 88, 24, 22] }, { db: [75, 76], front: true }] }],
    tips: ["Avant-bras posés à plat sur les cuisses.", "Seuls les poignets bougent.", "Charge légère, beaucoup de répétitions."] }
});

// Exercice → famille de mouvement (bibliothèque de l'app).
const MOVES = {
  "Développé couché": "bench", "Développé couché haltères": "benchdb", "Développé incliné": "incline", "Développé incliné haltères": "inclinedb", "Développé décliné": "decline",
  "Écarté haltères": "fly", "Écarté à la poulie": "flycable", "Pec deck (butterfly)": "pecdeck", "Presse pectoraux": "chestpress", "Pompes": "pushup", "Pompes diamant": "pushdiamond",
  "Dips": "dips", "Pull-over": "pullover", "Tractions": "pullup", "Tractions lestées": "pullup", "Tractions supination (chin-up)": "pullup:sup", "Tractions australiennes": "invrow",
  "Tirage vertical": "pulldown", "Tirage vertical prise serrée": "pulldown:close", "Tirage horizontal": "seatrow", "Rowing barre": "row", "Rowing haltère": "rowdb", "Rowing T-bar": "row",
  "Rowing machine": "seatrow", "Soulevé de terre": "hinge", "Soulevé de terre roumain": "hinge", "Soulevé de terre sumo": "hinge", "Shrugs": "shrug", "Face pull": "facepull",
  "Extension lombaire": "backext", "Good morning": "goodmorning", "Développé militaire": "ohp", "Développé épaules haltères": "ohpdb", "Développé Arnold": "ohpdb",
  "Élévations latérales": "raise", "Élévations latérales à la poulie": "raise", "Élévations frontales": "fraise", "Oiseau (arrière d’épaule)": "rearfly",
  "Rowing menton": "uprow", "Push press": "ohp", "Curl barre": "curlbar", "Curl haltères": "curl", "Curl marteau": "curl", "Curl incliné": "inclcurl", "Curl pupitre": "preacher",
  "Curl à la poulie": "curl", "Extension triceps à la poulie": "pushdown", "Extension triceps nuque": "ohext", "Barre au front": "skull",
  "Développé couché prise serrée": "bench:close", "Kickback triceps": "kickback", "Curl poignets": "wristcurl", "Farmer walk": "walk", "Squat": "squat", "Front squat": "frontsquat",
  "Squat goblet": "goblet", "Hack squat": "squat", "Presse à cuisses": "legpress", "Fentes": "lunge", "Fentes bulgares": "bulgarian", "Leg extension": "legext",
  "Leg curl": "legcurl", "Hip thrust": "hipthrust", "Pont fessier": "glutebridge", "Abducteurs machine": "abduct", "Step-up": "stepup", "Mollets debout": "calf",
  "Mollets assis": "seatcalf", "Squats (poids du corps)": "squatbw", "Pistol squat": "pistol", "Box jumps": "boxjump", "Crunch": "crunch", "Crunch à la poulie": "cablecrunch",
  "Relevés de jambes": "legraise", "Toes to bar": "legraise", "Gainage": "plank", "Gainage latéral": "sideplank", "Russian twist": "russian", "Roue abdominale": "abwheel",
  "Mountain climbers": "climber", "Sit-ups": "crunch", "L-sit": "lsit", "Hollow hold": "hollow", "Muscle-up": "pullup", "Handstand push-up": "hspu", "Pompes pike": "pike",
  "Pompes archer": "pushup:wide", "Front lever": "lever", "Back lever": "lever", "Planche": "planche", "Handstand": "handstand", "Human flag": "lever",
  "Dips aux anneaux": "dips", "Kettlebell swings": "swing", "Thrusters": "thruster", "Clean": "clean", "Snatch": "snatch", "Burpees": "burpee", "Wall balls": "wallball",
  "Montée de corde": "rope", "Montée de corde sans jambes": "rope"
};
// Noms tapés à la main : on reconnaît la famille grâce à quelques mots-clés.
const MOVE_WORDS = [
  [/diamant|diamond/, "pushdiamond"], [/pompe|push ?up/, "pushup"], [/dips/, "dips"], [/incline.*haltere|haltere.*incline/, "inclinedb"], [/incline/, "incline"], [/decline/, "decline"], [/couche.*haltere|haltere.*couche/, "benchdb"], [/presse pec|chest press/, "chestpress"], [/couche|bench/, "bench"], [/poulie.*ecarte|ecarte.*poulie|vis a vis|butterfly|pec deck|crossover/, "flycable"], [/ecarte|fly/, "fly"], [/pull ?over/, "pullover"],
  [/tirage vertical|pulldown/, "pulldown"], [/traction|pull ?up|chin|muscle ?up/, "pullup"], [/face ?pull/, "facepull"], [/australien|inverted/, "invrow"], [/tirage horizontal|rowing machine|rowing assis|tirage assis/, "seatrow"], [/rowing haltere|haltere.*rowing/, "rowdb"], [/rowing|row\b|tirage/, "row"], [/terre|deadlift|good morning|lombaire/, "hinge"],
  [/militaire|epaule|overhead|arnold|push press/, "ohp"], [/elevations? frontale/, "fraise"], [/elevation|oiseau/, "raise"], [/shrug/, "shrug"], [/curl/, "curl"],
  [/triceps|barre au front|kickback|extension nuque/, "pushdown"], [/goblet/, "goblet"], [/pistol/, "pistol"], [/front squat|squat avant/, "frontsquat"], [/poids du corps/, "squatbw"], [/squat/, "squat"], [/bulgare/, "bulgarian"], [/step/, "stepup"], [/fente|lunge/, "lunge"],
  [/leg curl/, "legcurl"], [/presse a cuisse|leg press/, "legpress"], [/leg extension|abduct/, "legext"], [/pont fessier|glute bridge/, "glutebridge"], [/hip thrust|pont|fessier/, "hipthrust"], [/mollet|calf/, "calf"],
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
  // « famille:prise » : la prise des mains propre à l'exercice (vide = pas de schéma).
  const [id, grip] = (MOVE_KEYS[k] || (MOVE_WORDS.find(([re]) => re.test(k)) || [])[1] || "").split(":");
  if (!id) return null;
  const mv = { id, ...FAMILIES[id] };
  if (grip != null) mv.grip = grip || null;
  else if (/serre/.test(k) && mv.grip === "bench") mv.grip = "close";
  else if (/supination|chin/.test(k) && mv.grip === "pro") mv.grip = "sup";
  return mv;
}

/* ---------- Dessin ---------- */
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
  if (e.fcables) return `<g class="hf-eq"><rect class="hf-metal" x="0" y="-8" width="5" height="118" rx="1"/><rect class="hf-metal" x="115" y="-8" width="5" height="118" rx="1"/>${[pose.w, mirror(pose.w)].map(([x, y]) => `<line class="hf-cable" x1="${x < 60 ? 6 : 114}" y1="-2" x2="${x}" y2="${y}"/>`).join("")}<circle class="hf-plate2" cx="6.5" cy="-2" r="2.5"/><circle class="hf-plate2" cx="113.5" cy="-2" r="2.5"/></g>`;
  if (e.fcablev) return `<g class="hf-eq">${[pose.w, mirror(pose.w)].map(([x, y]) => `<line class="hf-cable" x1="60" y1="-8" x2="${x}" y2="${y}"/>`).join("")}</g>`;
  if (e.fdip != null) { const y = e.fdip; return [pose.w[0], 120 - pose.w[0]].map(x => `<g class="hf-eq"><rect class="hf-metal" x="${x - 2}" y="${y + 2}" width="4" height="${108 - y}"/><rect class="hf-metal" x="${x - 4}" y="${y}" width="8" height="4" rx="2"/></g>`).join(""); }
  if (e.fkb) { const y = pose.w[1] + 2; return `<g class="hf-eq"><path class="hf-line" d="M56 ${y}a4 4 0 0 1 8 0"/><circle class="hf-dark" cx="60" cy="${y + 7}" r="6.5"/></g>`; }
  if (e.fbench != null) { const y = e.fbench; return `<g class="hf-eq">${e.back != null ? `<rect class="hf-pad" x="47" y="${e.back}" width="26" height="${y - e.back + 2}" rx="4"/>` : ""}<rect class="hf-metal" x="58.5" y="${y + 4}" width="3" height="${106 - y}"/><rect class="hf-metal" x="46" y="107" width="28" height="3" rx="1"/><rect class="hf-pad" x="47" y="${y}" width="26" height="7" rx="3"/></g>`; }
  if (e.ctop != null) return `<g class="hf-eq"><line class="hf-cable" x1="${e.ctop}" y1="-8" x2="${pose.w[0]}" y2="${pose.w[1]}"/></g>`;
  if (e.hcable != null) { const y = e.hcable, [x, hy] = pose.w; return `<g class="hf-eq"><rect class="hf-metal" x="104" y="${y - 8}" width="7" height="${118 - y}" rx="1"/><circle class="hf-plate2" cx="103" cy="${y}" r="3"/><line class="hf-cable" x1="101" y1="${y}" x2="${x}" y2="${hy}"/></g>`; }
  if (e.lowbar) { const [x, y] = e.lowbar; return `<g class="hf-eq"><rect class="hf-metal" x="${x - 1.5}" y="${y}" width="3" height="${110 - y}"/><circle class="hf-plate" cx="${x}" cy="${y}" r="2.6"/></g>`; }
  if (e.ibench) {
    const [x, y, d] = e.ibench;
    if (d > 0) return `<g class="hf-eq"><rect class="hf-metal" x="${x + 8}" y="${y + 4}" width="3" height="${106 - y}"/><rect class="hf-metal" x="${x - 26}" y="${y - 6}" width="3" height="${116 - y}"/><rect class="hf-metal" x="${x - 32}" y="107" width="48" height="3" rx="1"/><rect class="hf-pad" x="${x - 2}" y="${y}" width="22" height="6" rx="3"/><rect class="hf-pad" x="${x - 52}" y="${y}" width="52" height="6" rx="3" transform="rotate(${d} ${x} ${y + 3})"/></g>`;
    return `<g class="hf-eq"><rect class="hf-metal" x="${x - 30}" y="${y + 8}" width="3" height="${98 - y}"/><rect class="hf-metal" x="${x + 14}" y="${y - 6}" width="3" height="${112 - y}"/><rect class="hf-metal" x="${x - 36}" y="107" width="58" height="3" rx="1"/><rect class="hf-pad" x="${x - 50}" y="${y}" width="76" height="6" rx="3" transform="rotate(${d} ${x} ${y + 3})"/></g>`;
  }
  if (e.handle) { const [x, y] = pose.w; return `<rect class="hf-dark" x="${x - 1.8}" y="${y - 6}" width="3.6" height="12" rx="1.5"/>`; }
  if (e.fhandle) return [pose.w, mirror(pose.w)].map(([x, y]) => `<rect class="hf-dark" x="${x - 1.8}" y="${y - 6}" width="3.6" height="12" rx="1.5"/>`).join("");
  if (e.slab) { const [x1, y1, x2, y2] = e.slab; return `<g class="hf-eq"><line class="hf-metal-l" x1="${(x1 + x2) / 2}" y1="${(y1 + y2) / 2}" x2="${(x1 + x2) / 2}" y2="108"/><line class="hf-slab" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/></g>`; }
  if (e.wheel) { const [x, y] = e.wheel; return `<g class="hf-eq"><circle class="hf-dark" cx="${x}" cy="${y}" r="6"/><circle class="hf-dot" cx="${x}" cy="${y}" r="1.6"/></g>`; }
  if (e.ball) { const [x, y] = e.ball; return `<g class="hf-eq"><circle class="hf-ball" cx="${x}" cy="${y}" r="6.5"/><path class="hf-plate2" d="M${x - 6.5} ${y}h13"/></g>`; }
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
// Haut du cadre commun à plusieurs poses : les exercices au sol sont cadrés plus serré, donc dessinés plus grands.
const TALL = ["cable", "ctop", "fcables", "fcablev", "rope", "fpull", "pullbar"];
export function frameTop(poses) {
  let y = 110;
  poses.forEach(q => {
    ["h", "s", "e", "w", "p", "k", "a", "t", "k2", "a2"].forEach(j => { if (q[j]) y = Math.min(y, q[j][1] - (j === "h" ? 11 : 6)); });
    (q.eq || []).forEach(e => Object.entries(e).forEach(([k, v]) => {
      if (TALL.includes(k)) y = -8;
      else if (Array.isArray(v)) y = Math.min(y, v[1] - 11);
      else if (typeof v === "number" && k[0] === "f" && v !== 1) y = Math.min(y, v - 12);
    }));
  });
  return Math.max(-8, Math.min(40, Math.floor(y)));
}
export function figureSVG(pose, mus, top = -8) {
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
  return `<svg viewBox="0 ${top} 120 ${120 - top}" class="hf" aria-hidden="true" focusable="false">
    <line class="hf-ground" x1="2" y1="110.5" x2="118" y2="110.5"/>
    ${(pose.eq || []).filter(q => !q.front).map(q => equipment(q, pose)).join("")}
    ${body}
    ${(pose.eq || []).filter(q => q.front).map(q => equipment(q, pose)).join("")}
    ${markSVG(pose)}
  </svg>`;
}
// Repère d'angle (ex. « 90° » au coude en bas du développé).
function markSVG(q) {
  if (!q.mark) return "";
  const [j, txt] = q.mark, J = q[j], [A, C] = j === "e" ? [q.s, q.w] : j === "k" ? [q.p, q.a] : [q.s, q.k];
  const u1 = unit(sub(A, J)), u2 = unit(sub(C, J)), r = 8, p1 = add(J, mul(u1, r)), p2 = add(J, mul(u2, r));
  const sweep = u1[0] * u2[1] - u1[1] * u2[0] > 0 ? 1 : 0, t = add(J, mul(unit(add(u1, u2)), -9));
  return `<g class="hf-mark"><path d="M${P2(p1)}A${r} ${r} 0 0 ${sweep} ${P2(p2)}"/><text x="${f(t[0])}" y="${f(t[1] + 2.5)}" text-anchor="middle">${txt}</text></g>`;
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
    // Côté gauche : miroir du droit, sauf les articulations données à part dans L (fentes, marche…).
    const L = q.L || {}, g = key => q[key] && (sg < 0 ? L[key] || mirror(q[key]) : q[key]), tag = sg < 0 ? "l" : "r";
    const s1 = g("s"), e1 = g("e"), w1 = g("w"), p1 = g("p"), k1 = g("k"), a1 = g("a");
    const up = capsuleD(s1, e1, 4.8, 3.8), fore = capsuleD(e1, w1, 3.7, 2.7), nU = perp(s1, e1), nF = perp(e1, w1);
    const legs = !q.nolegs && k1;
    return {
      legs: legs ? `${part(capsuleD(p1, k1, 7.6, 5.4), "th" + tag, [["quadriceps", lens(p1, k1, perp(p1, k1), 0, 0.3, 0.98, 5.2)]])}
        ${part(capsuleD(k1, a1, 5.3, 3.4), "sh" + tag, [["mollets", lens(k1, a1, perp(k1, a1), 0, 0.06, 0.55, 2.6)]])}
        <ellipse class="hf-shoe" cx="${f(a1[0] + 1.6 * sg)}" cy="${f(a1[1] + 2.6)}" rx="4" ry="2.5"/>` : "",
      short: legs ? `<path class="hf-short" d="${capsuleD(p1, add(p1, mul(sub(k1, p1), 0.42)), 7.9, 6.3)}"/>` : "",
      arm: `${part(up, "ua" + tag, [["biceps", lens(s1, e1, nU, 0, 0.22, 0.98, 3.2)]])}${part(fore, "fa" + tag, [["avantbras", lens(e1, w1, nF, 0, 0.02, 0.8, 3.8)]])}
        ${part(`M${P2(add(s1, [4.8, 0]))}A4.8 4.8 0 1 0 ${P2(add(s1, [-4.8, 0]))}A4.8 4.8 0 1 0 ${P2(add(s1, [4.8, 0]))}Z`, "de" + tag, [["epaules", ell(s1, 6, 6)]])}
        <circle class="hf-skin" cx="${f(w1[0])}" cy="${f(w1[1])}" r="3.1"/>`
    };
  };
  const r = side(pose, 1), l = side(pose, -1), c = x => [x, 0];
  const shorts = `<path class="hf-short" d="M30 ${f(p[1] - 4)}H90V${f(p[1] + 12)}H30Z"/>`;
  const head = headSVG(h, [0, -4.4], id, 7);
  return `${r.legs}${l.legs}${r.short}${l.short}${pose.headBack ? head : ""}
    ${part(torso, "to", [["pecs", ell([65.8, s[1] + 5.5], 5.8, 4.4) + ell([54.2, s[1] + 5.5], 5.8, 4.4)], ["abdos", `<path d="M56.2 ${f(s[1] + 12)}h7.6v${f(p[1] - s[1] - 14)}q0 3-3.8 3q-3.8 0-3.8-3Z"/>`],
      ["obliques", ell([68.6, my + 5], 2.6, 7) + ell([51.4, my + 5], 2.6, 7)], ["dorsaux", ell([s[0] + 0.5, s[1] + 12], 3.6, 9, -12) + ell(mirror([s[0] + 0.5, s[1] + 12]), 3.6, 9, 12)],
      ["trapezes", ell([60, s[1] - 5], 10, 3.4)]], shorts)}
    ${pose.headBack ? "" : `<path class="hf-skin" d="${capsuleD([60, s[1] - 4], add(h, c(0)), 3.6, 3.4)}"/>`}
    ${pose.headBack ? "" : head}
    ${r.arm}${l.arm}`;
}
/* ---------- Placement des mains (vu de dessus) ---------- */
const GRIPS = {
  floor: { x: 30, txt: "Mains au sol un peu plus larges que les épaules, doigts vers l’avant, coudes à environ 45° du corps." },
  wide: { x: 44, txt: "Mains au sol bien plus larges que les épaules (environ une fois et demie)." },
  diamond: { x: 6, rot: 40, txt: "Mains collées sous la poitrine : pouces et index se touchent et forment un losange (le « diamant »). Coudes serrés le long du corps." },
  bench: { x: 34, bar: 1, txt: "Mains sur la barre un peu plus larges que les épaules : en bas du mouvement, les avant-bras sont bien verticaux." },
  close: { x: 23, bar: 1, txt: "Mains à largeur d’épaules, pas plus serré, pour protéger les poignets." },
  pro: { x: 32, bar: 1, txt: "Prise en pronation (paumes vers l’avant), mains un peu plus larges que les épaules." },
  sup: { x: 22, bar: 1, txt: "Prise en supination (paumes tournées vers toi), mains à largeur d’épaules." },
  row: { x: 25, bar: 1, txt: "Prise en pronation (dos des mains vers l’avant, pouces vers l’intérieur), mains à largeur d’épaules." },
  dips: { x: 26, par: 1, txt: "Une main sur chaque barre parallèle, bras tendus, épaules basses et loin des oreilles." }
};
const HAND = `<rect x="-5" y="-3" width="10" height="11" rx="3.5"/><rect x="-4.8" y="-10" width="2.3" height="9" rx="1.15"/><rect x="-2.3" y="-11.6" width="2.3" height="10" rx="1.15"/><rect x="0.2" y="-10.8" width="2.3" height="9" rx="1.15"/><rect x="2.7" y="-8.6" width="2.2" height="7" rx="1.1"/><line class="hg-thumb" x1="-4" y1="5" x2="-9.5" y2="0.5"/>`;
export function gripSVG(id) {
  const g = GRIPS[id]; if (!g) return "";
  const hand = sx => `<g class="hg-hand" transform="translate(${80 + sx * g.x} 64) scale(${sx} 1) rotate(${-(g.rot || 0)})">${HAND}</g>`;
  return `<svg viewBox="0 0 160 100" class="hg" aria-hidden="true" focusable="false">
    <line class="hg-guide" x1="56" y1="34" x2="56" y2="82"/><line class="hg-guide" x1="104" y1="34" x2="104" y2="82"/>
    <circle class="hg-body" cx="80" cy="15" r="8"/><path class="hg-body" d="M50 44Q51 29 66 27H94Q109 29 110 44"/>
    ${g.bar ? `<line class="hg-bar" x1="6" y1="58" x2="154" y2="58"/>` : ""}${g.par ? [-1, 1].map(k => `<line class="hg-bar" x1="${80 + k * g.x}" y1="40" x2="${80 + k * g.x}" y2="86"/>`).join("") : ""}
    ${hand(1)}${hand(-1)}
    <path class="hg-dim" d="M58 86H102M61 83.5l-3 2.5 3 2.5M99 83.5l3 2.5-3 2.5"/><text class="hg-txt" x="80" y="97" text-anchor="middle">largeur d’épaules</text>
  </svg>`;
}

/* ---------- Bouton « ? » et fenêtre ---------- */
// i : numéro de l'exercice dans la séance, ou "lib" dans la recherche d'exercices.
export function howBtnHTML(name, i) {
  if (!moveOf(name) && !howOf(name)) return "";
  return `<button type="button" class="how-btn" data-how="${i}" data-name="${esc(name)}" aria-label="Comment faire : ${esc(name)}"><span aria-hidden="true">?</span></button>`;
}
let opener = null, inerted = [];
// Fiche dessinée avec le nouveau mannequin (moves.js), retrouvée aussi pour un nom tapé à la main.
let HOW_KEYS = null;
// Nom tapé à la main → famille reconnue par mots-clés → fiche dessinée correspondante.
const FAM_HOW = { burpee: "Burpees", wallball: "Wall balls", snatch: "Snatch", boxjump: "Box jumps", walk: "Farmer walk", swing: "Kettlebell swings", thruster: "Thrusters", clean: "Clean",
  pushup: "Pompes", pushdiamond: "Pompes diamant", pike: "Pompes pike", dips: "Dips", pullup: "Tractions", invrow: "Tractions australiennes", rope: "Montée de corde",
  lsit: "L-sit", handstand: "Handstand", hspu: "Handstand push-up", planche: "Planche",
  crunch: "Crunch", legraise: "Relevés de jambes", plank: "Gainage", hollow: "Hollow hold", climber: "Mountain climbers",
  squat: "Squat", squatbw: "Squats (poids du corps)", lunge: "Fentes", hipthrust: "Hip thrust", calf: "Mollets debout", legext: "Leg extension", legpress: "Presse à cuisses", legcurl: "Leg curl",
  hinge: "Soulevé de terre", row: "Rowing barre", rowdb: "Rowing haltère", seatrow: "Tirage horizontal", pulldown: "Tirage vertical", shrug: "Shrugs", backext: "Extension lombaire", goodmorning: "Good morning",
  ohp: "Développé militaire", ohpdb: "Développé militaire", raise: "Élévations latérales", fraise: "Élévations frontales", uprow: "Rowing menton", rearfly: "Oiseau (arrière d’épaule)", facepull: "Face pull" };
function howOf(name) {
  HOW_KEYS = HOW_KEYS || Object.fromEntries(Object.keys(HOW).map(n => [key(n), n]));
  const mv = HOW_KEYS[key(name)] ? null : moveOf(name), n = HOW_KEYS[key(name)] || (mv && FAM_HOW[mv.id]);
  return n ? HOW[n] : null;
}
// Une vue : les images clés côte à côte (Départ / Arrivée…) et, cachée, la même vue animée (bouton « Voir le mouvement »).
// L'animation redessine chaque image (identifiants de découpe uniques : un doublon caché casserait l'affichage).
function viewHTML(v, draw, many) {
  const n = v.frames.length, caps = v.caps || (n === 1 ? ["Position à tenir"] : n === 2 ? ["Départ", "Arrivée"] : []);
  const figs = v.frames.map(draw), seq = v.seq || v.frames.map((_, i) => i), D = seq.length * 1.1;
  return `<div class="how-view">${many ? `<p class="how-vt">${v.label}</p>` : ""}
    <div class="how-frames${n > 1 ? " multi" : ""}">${figs.map((f, i) => `<figure>${f}<figcaption>${caps[i] || ""}</figcaption></figure>`).join("")}</div>
    ${n > 1 ? `<div class="how-anim" role="img" aria-label="Animation ${v.label.toLowerCase()}, en boucle">${seq.map((k, i) => `<div class="how-f" style="animation:hs${Math.min(seq.length, 6)} ${D.toFixed(1)}s ease-in-out infinite;animation-delay:${(-((seq.length - i) % seq.length) * 1.1).toFixed(1)}s">${draw(v.frames[k])}</div>`).join("")}</div>` : ""}</div>`;
}
function openHow(name, btn) {
  const mv = moveOf(name), def = howOf(name); if (!mv && !def) return;
  opener = btn;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // Muscles de l'exercice (bibliothèque ou exercice perso), sinon ceux du mouvement.
  const found = musclesOf(name), mus = found && found.p.length ? found : (def && def.mus) || mv.mus;
  const lv = {}; (mus.s || []).forEach(m => { lv[m] = 2; }); mus.p.forEach(m => { lv[m] = 4; });
  // Les silhouettes ne sont dessinées qu'ici, à l'ouverture.
  let html, moving;
  if (def) {
    const target = def.t || mus.p;
    moving = def.views.some(v => v.frames.length > 1);
    html = def.views.map(v => { const b = frameBox(v.frames); return viewHTML(v, p => figure(p, target, b), def.views.length > 1); }).join("");
  } else {
    const views = [{ label: "De profil", frames: mv.poses }, mv.front && { label: "De face", frames: mv.front }].filter(Boolean);
    moving = mv.poses.length > 1;
    html = views.map(v => { const top = frameTop(v.frames); return viewHTML(v, p => figureSVG(p, mus, top), views.length > 1); }).join("");
  }
  const info = { ...(mv || {}), ...(def || {}) };
  $h("howTitle").textContent = name;
  $h("howStage").className = "how-stage";
  $h("howStage").innerHTML = html + (moving && !reduce ? `<button type="button" class="btn how-play" id="howPlay" aria-pressed="false"><span aria-hidden="true">▶</span> Voir le mouvement</button>` : "");
  $h("howTips").hidden = !info.tips;
  $h("howTips").innerHTML = info.tips ? `<p class="how-vt">Repères pour débuter</p><ul>${info.tips.map(t => `<li>${esc(t)}</li>`).join("")}</ul>` : "";
  const grip = GRIPS[info.grip];
  $h("howGrip").hidden = !grip;
  $h("howGrip").innerHTML = grip ? `<p class="how-vt">Placement des mains</p>${gripSVG(info.grip)}<p>${grip.txt}</p>` : "";
  $h("howCue").textContent = info.cue;
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
  $h("howBackdrop").hidden = true; $h("howSheet").hidden = true; $h("howStage").innerHTML = ""; $h("howMap").innerHTML = ""; $h("howGrip").innerHTML = ""; $h("howTips").innerHTML = "";
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
  openHow(inp ? inp.value : b.dataset.name, b);
}, true);
$h("howClose").onclick = closeHow;
// « Voir le mouvement » : passe des images côte à côte à l'animation (et inversement).
$h("howStage").addEventListener("click", e => {
  const b = e.target.closest("#howPlay"); if (!b) return;
  const on = $h("howStage").classList.toggle("playing");
  b.setAttribute("aria-pressed", on);
  b.innerHTML = on ? `<span aria-hidden="true">■</span> Revoir départ et arrivée` : `<span aria-hidden="true">▶</span> Voir le mouvement`;
});
$h("howBackdrop").onclick = closeHow;

export { FAMILIES };
