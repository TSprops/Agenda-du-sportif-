// « Comment faire » : les positions de chaque exercice, dessinées avec le mannequin de figure.js.
// Une fiche = des vues (profil, face) ; une vue = des images clés (départ, arrivée…) et l'ordre de l'animation.
// Ce fichier n'importe que figure.js (qui n'importe rien) : il peut donc être évalué à tout moment.
import { GROUND, bar, db, kb, medball, bench, roller, pullbar, dipbars, rings, cable, cableTop, seat, box, wall, climbRope, wheel, line, pad, raw,
  fbar, fdb, fpullbar, fdips, frings, fcables, fcableTop, fbench, pole, beltSide, beltFront, add } from "./figure.js";

const ANK = GROUND - 7.2;            // cheville quand le pied est à plat au sol
const HIPY = ANK - 90;               // hanche d'une personne debout
// Cheville d'un pied sur la pointe (angle ft) : le bout des orteils touche juste le sol.
const onToes = (x, ft) => [x, GROUND - (24.4 * Math.sin(ft * Math.PI / 180) + 4.6 * Math.cos(ft * Math.PI / 180))];
const merge = (a, b) => ({ ...a, ...b, near: { ...a.near, ...(b.near || {}) }, far: b.far ? { ...(a.far || {}), ...b.far } : a.far });
// Debout, de profil (regarde à droite).
export const stand = (o = {}) => merge({ hip: [120, HIPY], torso: -90, neck: -90, near: { ua: 93, fa: 84, hand: 86, th: 90, sh: 90, ft: 0 } }, o);
// Debout, de face.
export const standF = (o = {}) => ({ view: "front", hip: [120, HIPY], torso: -90, neck: -90, ...o, R: { ua: 84, fa: 88, hand: 90, th: 90, sh: 90, ...(o.R || {}) } });
const view = (label, frames, caps, seq) => ({ label, frames, caps, seq: seq || frames.map((_, i) => i) });
const side = (frames, caps, seq) => view("De profil", frames, caps, seq);
const front = (frames, caps, seq) => view("De face", frames, caps, seq);
const DA = ["Départ", "Arrivée"];

/* ═══ CrossFit / fonctionnel ═══ */
const burpee = [
  stand({ near: { ua: 95, fa: 88 } }),
  { hip: [104, 172], torso: -20, neck: -8, near: { ankleAt: [116, ANK], ft: 0, wristAt: [150, GROUND - 3], h: "flat", hand: 0 } },
  { hip: [70, 188], torso: -3, neck: 2, near: { ankleAt: onToes(-18, 80), ft: 80, wristAt: [118, GROUND - 3], h: "flat", hand: 0, ls: { ua: 0.75 } } },
  stand({ hip: [120, HIPY - 12], neck: -95, near: { ua: -84, fa: -88, hand: -90, h: "open", ft: 55 } })
];
const wb = x => [wall(186, -20), ...x];
const wallball = [
  { hip: [106, 166], torso: -66, neck: -86, near: { ankleAt: [124, ANK], ft: 0, wristAt: [136, 124], hand: -40, h: "open" },
    eq: wb([medball(P => add(P.sh, [22, 6]), { mid: true })]) },
  stand({ neck: -100, near: { ua: -70, fa: -66, hand: -66, h: "open", ft: 40 }, hip: [120, HIPY - 12],
    eq: wb([medball(P => add(P.near.grip, [10, -16]), { top: true })]) })
];
const snatchStart = { hip: [98, 165], torso: -30, neck: -20, near: { ankleAt: [124, ANK], ft: 0, wristAt: [128, GROUND - 18.5], hand: 90 }, eq: [bar(P => P.near.grip, 13, { mid: true })] };
const rack = { ua: 20, fa: -150, hand: -30 };
const boxAt = box(150, 150, 58, 60);

export const HOW = {
  "Burpees": { views: [side(burpee, ["Debout", "Mains au sol", "Poitrine au sol", "Saut, bras en l’air"], [0, 1, 2, 1, 0, 3])],
    cue: "Mains au sol, pieds en arrière, poitrine au sol, puis ramène les pieds, remonte et saute bras en l’air.",
    tips: ["Le corps reste tourné du même côté pendant tout le mouvement.", "En planche, corps gainé : pas de fesses en l’air.", "Saut léger, réception souple sur l’avant du pied."] },
  "Wall balls": { views: [side(wallball, ["Squat, ballon contre la poitrine", "Lancer vers la cible"])],
    cue: "Medecine ball contre la poitrine : descends en squat, puis remonte d’un coup et lance le ballon sur la cible au mur. Rattrape-le et enchaîne.",
    tips: ["Squat complet à chaque répétition, dos droit.", "C’est la poussée des jambes qui lance le ballon, les bras finissent le geste.", "Regarde la cible, rattrape le ballon en redescendant directement en squat."] },
  "Snatch": { views: [side([snatchStart, stand({ neck: -92, near: { ua: -96, fa: -94, hand: -92, ls: { ua: 0.9, fa: 0.9 } }, eq: [bar(P => P.near.grip, 13, { top: true })] })], ["Barre au sol, prise large", "Barre au-dessus de la tête, bras tendus"])],
    cue: "Prise très large : arrache la barre du sol d’un seul mouvement et reçois-la bras tendus au-dessus de la tête.",
    tips: ["Mouvement technique : apprends-le avec un bâton ou une barre à vide.", "Barre toujours près du corps pendant la montée.", "À l’arrivée, bras verrouillés, barre au-dessus de la nuque."] },
  "Box jumps": { views: [side([
      { hip: [98, 142], torso: -52, neck: -40, near: { ankleAt: [112, ANK], ft: 0, ua: 150, fa: 150, hand: 150, h: "open" }, eq: [boxAt] },
      { hip: [138, 96], torso: -70, neck: -80, near: { ankleAt: [150, 140], ft: 30, ua: -40, fa: -50, hand: -50, h: "open" }, eq: [boxAt] },
      { hip: [168, 116], torso: -62, neck: -75, near: { ankleAt: [182, 150 - 7.2], ft: 0, ua: 10, fa: 0, hand: 0, h: "open" }, eq: [boxAt] }],
      ["Élan : bras en arrière", "Saut : bras vers l’avant", "Réception sur la box"], [0, 1, 2])],
    cue: "Élan des bras vers l’arrière, saute à pieds joints en lançant les bras devant, et réceptionne-toi en douceur sur la box, genoux fléchis.",
    tips: ["Les bras accompagnent le saut : arrière à l’élan, avant au décollage.", "Réception pieds entiers sur la box, genoux dans l’axe.", "Redescends en marchant plutôt qu’en sautant."] },
  "Farmer walk": { views: [
      side([stand({ torso: -92, neck: -92, near: { ankleAt: [136, ANK], ua: 90, fa: 90, hand: 90 }, far: { ankleAt: onToes(106, 20), ft: 20 }, eq: [db(P => [P.near.grip, 90], "side", { mid: true })] }),
        stand({ torso: -92, neck: -92, near: { ankleAt: onToes(106, 20), ft: 20, ua: 90, fa: 90, hand: 90 }, far: { ankleAt: [136, ANK], ft: 0 }, eq: [db(P => [P.near.grip, 90], "side", { mid: true })] })], ["Un pas", "Le pas suivant"]),
      front([standF({ R: { ua: 86, fa: 90 }, eq: [fdb("end", { top: true })] })], ["Tête haute, buste ouvert"])],
    cue: "Une charge lourde dans chaque main, bras tendus : marche à petits pas, tête haute et buste ouvert.",
    tips: ["Tête haute, regard droit devant.", "Buste ouvert, épaules basses et tirées en arrière.", "Abdos serrés, petits pas réguliers."] },
  "Kettlebell swings": { views: [side([
      { hip: [100, 120], torso: -35, neck: -20, near: { ankleAt: [124, ANK], ft: 0, wristAt: [122, 142], hand: 110 }, eq: [kb(P => P.near.grip, { mid: true })] },
      stand({ torso: -92, near: { ua: -4, fa: -4, hand: -4 }, eq: [kb(P => add(P.near.grip, [4, -4]), { top: true })] })], DA)],
    cue: "Mouvement des hanches, pas des bras : kettlebell entre les jambes, projette les hanches vers l’avant pour la lancer à hauteur des épaules.",
    tips: ["Dos plat, hanches en arrière comme pour fermer une porte avec les fesses.", "Les bras restent tendus : ce sont les fessiers qui lancent.", "En haut, corps droit et gainé, sans te pencher en arrière."] },
  "Thrusters": { views: [
      side([{ hip: [108, 165], torso: -70, neck: -84, near: { ankleAt: [124, ANK], ft: 0, ...rack }, eq: [bar(P => P.near.grip, 13, { top: true })] },
        stand({ near: { ua: -88, fa: -88, hand: -90 }, eq: [bar(P => P.near.grip, 13, { top: true })] })], ["Squat, barre sur les épaules", "Barre au-dessus de la tête"]),
      front([standF({ hip: [120, HIPY + 40], R: { th: 84, sh: 92, ua: 60, fa: -100, hand: -90, ls: { ua: 0.45, th: 0.2, sh: 0.93 } }, eq: [fbar(P => P.R.grip[1], { top: true })] }),
        standF({ R: { ua: -70, fa: -84, hand: -90 }, eq: [fbar(P => P.R.grip[1], { top: true })] })], ["Squat, genoux dans l’axe des pieds", "Bras tendus"])],
    cue: "Barre posée devant les épaules : descends en squat, puis remonte et pousse la barre au-dessus de la tête d’un seul mouvement.",
    tips: ["Coudes hauts devant toi pendant le squat.", "Genoux dans l’axe des pieds, talons au sol.", "Utilise l’élan des jambes pour pousser la barre."] },
  "Clean": { views: [side([{ ...snatchStart, near: { ...snatchStart.near, wristAt: [130, GROUND - 18.5] } },
      stand({ near: rack, eq: [bar(P => P.near.grip, 13, { top: true })] })], ["Barre au sol", "Barre reçue sur les épaules"])],
    cue: "Barre près du corps : tire du sol avec les jambes, puis passe les coudes devant pour la recevoir sur l’avant des épaules.",
    tips: ["Prise à largeur d’épaules, dos plat au départ.", "La barre reste collée au corps pendant la montée.", "Réception coudes hauts, barre posée sur les clavicules."] }
};

/* ═══ Calisthénie ═══ */
const BY = -14;                                   // hauteur de la barre de traction
const onBar = [120, BY + 5.5];                   // poignet quand la main entoure la barre par-dessous
const hang = (o = {}) => merge({ hip: [118, BY + 112], torso: -92, neck: -88, near: { wristAt: onBar, hand: -90, th: 96, sh: 104, ft: 55 } }, o);
const pullTop = (o = {}) => merge({ hip: [117, BY + 60], torso: -100, neck: -94, near: { wristAt: onBar, hand: -90, th: 84, sh: 100, ft: 50 } }, o);
// En haut : épaules à hauteur de la barre, coudes sous les mains, écartés et dirigés vers le bas (vers les hanches).
const pullF = (grip, top, o = {}) => ({ view: "front", torso: -90, neck: -90, hip: [120, top ? BY + 56 : BY + 116], R: { wristAt: [120 + grip, BY + 5.5], hand: -90, elbowBend: top ? -1 : 1, th: 91, sh: 90 }, eq: [fpullbar(BY)], ...o });
const pullViews = (grip, extraSide = [], extraFront = []) => [
  side([hang({ eq: [pullbar(120, BY), ...extraSide] }), pullTop({ eq: [pullbar(120, BY), ...extraSide] })], ["Bras tendus", "Poitrine vers la barre"]),
  front([pullF(grip, 0, { eq: [fpullbar(BY), ...extraFront] }), pullF(grip, 1, { eq: [fpullbar(BY), ...extraFront] })], ["Bras tendus", "Menton au-dessus de la barre"])];
const PULL_TIPS = ["Pars bras complètement tendus, épaules basses.", "Tête droite, regard devant : c’est la poitrine qui monte vers la barre, la tête ne passe pas sous la barre.", "Tire les coudes vers le bas et vers l’arrière, sans balancer les jambes.", "Redescends lentement jusqu’aux bras tendus."];
// Pompes : mains sous les épaules, pieds en appui sur la pointe.
const TOES = onToes(-14, 75);
const plank = (shX, shY, wristX, o = {}) => {
  const a = Math.atan2(shY - TOES[1], shX - TOES[0]) * 180 / Math.PI, hip = [shX - 52 * Math.cos(a * Math.PI / 180), shY - 52 * Math.sin(a * Math.PI / 180)];
  return merge({ hip, torso: a, neck: a + 8, near: { th: 180 + a, sh: 180 + a, ft: 75, wristAt: [wristX, GROUND - 3], h: "flat", hand: 0, ls: { ua: 0.62 } } }, o);
};
const pushF = (wx, down, o = {}) => ({ view: "front", nolegs: true, crown: true, tls: 0.22, torso: -90, neck: -90, hip: [120, down ? 190 : 162], R: { wristAt: [wx, GROUND - 4], hand: 90, h: "palm", ls: { ua: down ? 0.2 : 1 } }, ...o });
// Dips : main fermée sur la barre (ou l'anneau), avant-bras toujours vertical ; en bas, coude à 90° qui part vers l'arrière.
const dipTop = (o = {}) => merge({ hip: [124, 97.7], torso: -80, neck: -84, near: { ua: 90, fa: 90, hand: 90, th: 100, sh: 185, ft: 150 } }, o);
const dipLow = (o = {}) => merge({ hip: [139.6, 123.4], torso: -62, neck: -66, near: { ua: 180, fa: 90, hand: 90, th: 100, sh: 188, ft: 150 } }, o);
const dipF = (low, o = {}) => ({ view: "front", torso: -90, neck: -90, hip: [120, low ? 120.3 : 98.5], R: low ? { ua: 84, fa: 90, hand: 90, th: 91, sh: 90, ls: { ua: 0.3, sh: 0.55 } } : { wristAt: [140, 104.5], hand: 90, th: 91, sh: 90, ls: { sh: 0.55 } }, ...o });

Object.assign(HOW, {
  "Tractions": { grip: "pro", views: pullViews(30), cue: "Suspendu bras tendus, mains un peu plus larges que les épaules : tire la poitrine vers la barre jusqu’à passer le menton au-dessus, puis redescends.", tips: PULL_TIPS },
  "Tractions supination (chin-up)": { grip: "sup", views: pullViews(18), cue: "Mains à largeur d’épaules, paumes tournées vers toi : tire la poitrine vers la barre, menton au-dessus, puis redescends.", tips: PULL_TIPS },
  "Tractions lestées": { grip: "pro", views: pullViews(30, [beltSide()], [beltFront()]), cue: "Ceinture de lest autour des hanches, le poids pend entre les jambes : même mouvement que la traction classique.",
    tips: ["Ceinture serrée sur les hanches, disque qui pend entre les jambes sans balancer.", ...PULL_TIPS.slice(1)] },
  "Muscle-up": { grip: "pro", views: [side([
      hang({ hip: [118, BY + 112], eq: [pullbar(120, BY)] }),
      pullTop({ hip: [114, BY + 52], torso: -104, eq: [pullbar(120, BY)] }),
      stand({ hip: [121, BY - 3], torso: -96, neck: -92, near: { wristAt: [120, BY - 5.5], hand: 90, th: 96, sh: 98, ft: 40 }, eq: [pullbar(120, BY)] })],
      ["Bras tendus", "Tirage explosif, poitrine à la barre", "Corps au-dessus de la barre, bras tendus"], [0, 1, 2, 1])],
    cue: "Tire de façon explosive jusqu’à la poitrine, bascule les poignets par-dessus la barre, puis pousse jusqu’à avoir les bras tendus, corps au-dessus de la barre.",
    tips: ["Maîtrise d’abord 10 tractions strictes et des dips.", "Tire la barre vers le bas des pectoraux, pas vers le menton.", "À la fin, bras tendus et hanches au niveau de la barre."] },
  "Dips": { grip: "dips", views: [side([dipTop({ eq: [dipbars(96, 176, 110)] }), dipLow({ eq: [dipbars(96, 176, 110)] })], ["Bras tendus", "Coudes à 90°"]),
      front([dipF(0, { eq: [fdips(110)] }), dipF(1, { eq: [fdips(110)] })], ["Bras tendus", "Coudes à 90°"])],
    cue: "Mains qui serrent les barres, bras tendus : descends jusqu’à avoir les coudes à 90°, puis remonte.", tips: ["Les mains entourent les barres, poignets droits.", "Épaules basses, loin des oreilles.", "Buste penché en avant = plus de pectoraux ; buste droit = plus de triceps."] },
  // Anneaux : descente plus verticale, buste moins penché, mains près des hanches.
  "Dips aux anneaux": { grip: null, views: [side([dipTop({ eq: [rings("near", { top: true })] }), dipLow({ hip: [128, 124], torso: -74, neck: -78, near: { wristAt: [127, 106], hand: 90 }, eq: [rings("near", { top: true })] })], ["Bras tendus", "Coudes à 90°"]),
      front([dipF(0, { eq: [frings()] }), dipF(1, { eq: [frings()] })], ["Bras tendus, anneaux serrés", "Coudes à 90°"])],
    cue: "Anneaux tenus bras tendus près du corps : descends jusqu’aux coudes à 90°, puis remonte en gardant les anneaux serrés.",
    tips: ["Plus instable que les barres : maîtrise d’abord les dips classiques.", "Anneaux collés au corps, bras tendus en haut.", "Descends lentement sans laisser les anneaux s’écarter."] },
  "Human flag": { views: [front([{ view: "front", torso: 0, neck: 0, hip: [66, 118],
      R: { wristAt: [144, 176], hand: 0, th: 180, sh: 180 }, L: { wristAt: [144, 64], hand: 0, th: 180, sh: 180, elbowBend: 1 }, eq: [pole(152)] }], ["Position à tenir"])],
    cue: "Mains serrées sur une barre verticale, bras tendus : le bras du haut tire, celui du bas pousse, corps horizontal sur le côté.",
    tips: ["Mains écartées d’environ une largeur d’épaules et demie sur le poteau.", "Bras du haut qui tire, bras du bas qui pousse, tous les deux tendus.", "Progression : commence jambes groupées, puis une jambe tendue."] },
  // Bras tendus dans le plan : mains à plat et pointes de pieds sur la même ligne de sol.
  "Planche": { views: [side([plank(140, 156, 120, { near: { ls: {} } })], ["Position à tenir : épaules devant les mains"])],
    cue: "Version pieds au sol (planche penchée) : en appui sur les mains, bras tendus, avance les épaules devant les mains en gardant le corps gainé.",
    tips: ["Bras bien tendus, épaules qui poussent le sol.", "Doigts tournés vers l’extérieur ou vers l’arrière pour protéger les poignets.", "Corps gainé du début à la fin, pointes de pieds au sol."] },
  "Back lever": { views: [side([{ hip: [96, 80], torso: 0, neck: 2, near: { wristAt: [120, BY + 4], hand: -140, th: 180, sh: 180, ft: 180 }, eq: [pullbar(120, BY)] }], ["Position à tenir"])],
    cue: "Suspendu, bras tendus derrière le dos : corps gainé à l’horizontale, face vers le sol.", tips: ["Face vers le sol, corps droit des épaules aux pieds.", "Bras tendus, épaules vers l’avant.", "Progression : jambes groupées, puis une jambe tendue."] },
  "Front lever": { views: [side([{ hip: [150, 82], torso: 180, neck: 172, near: { wristAt: [120, BY + 5.5], hand: -70, th: 0, sh: 0, ft: 0 }, eq: [pullbar(120, BY)] }], ["Position à tenir"])],
    cue: "Suspendu bras tendus : corps gainé à l’horizontale, face vers le plafond.", tips: ["Bras tendus, tire la barre vers les hanches.", "Corps droit : ni fesses qui tombent, ni dos creux.", "Progression : genoux groupés, puis une jambe tendue."] },
  "Pompes": { grip: "floor", views: [side([plank(122, 150, 126, { near: { ls: {} } }), plank(122, 188, 126)], ["Bras tendus", "Poitrine près du sol"]),
      front([pushF(142, 0), pushF(142, 1)], ["Bras tendus", "Coudes près du corps"])],
    cue: "Corps gainé en planche, mains un peu plus larges que les épaules : descends la poitrine près du sol, coudes près du corps, puis pousse.",
    tips: ["Coudes à environ 45° du corps, pas écartés.", "Corps droit comme une planche : ni fesses en l’air, ni ventre qui tombe.", "Trop dur ? Fais-les sur les genoux ou mains sur un banc."] },
  "Pompes diamant": { grip: "diamond", views: [side([plank(122, 150, 124, { near: { ls: {} } }), plank(122, 190, 124)], ["Bras tendus", "Poitrine près des mains"]),
      front([pushF(124, 0), pushF(124, 1, { R: { wristAt: [126, GROUND - 4], hand: 90, h: "palm", ls: { ua: 0.2 } } })], ["Mains en losange", "Coudes serrés le long du corps"])],
    cue: "Mains collées sous la poitrine en forme de losange : descends en gardant les coudes serrés le long du corps, puis pousse.",
    tips: ["Pouces et index se touchent sous la poitrine.", "Coudes collés au corps, encore plus qu’aux pompes classiques.", "Plus dur : commence sur les genoux si besoin."] },
  "Pompes archer": { grip: "wide", views: [front([
      pushF(164, 0),
      // Descente d'un côté : ce bras plie (coude près du corps, avant-bras vertical), l'autre reste tendu sur le côté.
      pushF(164, 1, { hip: [146, 190], R: { wristAt: [164, GROUND - 4], hand: 90, h: "palm", ls: { ua: 0.2 } }, L: { wristAt: [76, GROUND - 4], hand: 90, h: "palm", ls: {} } }),
      pushF(164, 1, { hip: [94, 190], R: { wristAt: [164, GROUND - 4], hand: 90, h: "palm" }, L: { wristAt: [76, GROUND - 4], hand: 90, h: "palm", ls: { ua: 0.2 } } })],
      ["Mains très écartées", "Descente à droite, bras gauche tendu", "Descente à gauche, bras droit tendu"], [0, 1, 0, 2])],
    cue: "Mains très écartées : descends d’un côté en pliant ce bras, l’autre bras reste tendu, remonte, puis descends de l’autre côté.",
    tips: ["Un côté puis l’autre, jamais les deux en même temps.", "Le bras tendu glisse sur le côté et aide un peu.", "Corps gainé et droit pendant tout le mouvement."] },
  "Pompes pike": { views: [side([
      { hip: [88, 126], torso: 33.7, neck: 50, near: { ankleAt: onToes(44, 70), ft: 70, wristAt: [134, GROUND - 3], h: "flat", hand: 0 } },
      { hip: [96, 130], torso: 58, neck: 70, near: { ankleAt: onToes(44, 70), ft: 70, wristAt: [134, GROUND - 3], h: "flat", hand: 0 } }], ["Corps en V, bras tendus", "Tête vers le sol devant les mains"])],
    cue: "Mains au sol, hanches hautes (corps en V à l’envers) : plie les bras pour amener la tête vers le sol devant les mains, puis pousse.",
    tips: ["Hanches hautes : le corps forme un V à l’envers.", "La tête descend devant les mains, pas entre elles.", "Plus les pieds sont proches des mains, plus c’est dur."] },
  "Tractions australiennes": { grip: "row", views: [side([
      { hip: [130.6, 182], torso: -166.6, neck: -170, near: { wristAt: [80, 115.5], hand: -90, th: 13.4, sh: 13.4, ft: -75 }, eq: [pullbar(80, 110)] },
      // Poitrine près de la barre, talons au même endroit : le haut du bras reste perpendiculaire au buste (coude vers le sol).
      { hip: [145.9, 148.5], torso: -142.9, neck: -148, near: { wristAt: [80, 115.5], hand: -90, elbowBend: 1, th: 37.1, sh: 37.1, ft: -60 }, eq: [pullbar(80, 110)] }], ["Bras tendus", "Poitrine à la barre"])],
    cue: "Sous une barre basse, corps gainé et droit, talons au sol : tire la poitrine jusqu’à la barre, coudes près du corps, puis redescends.",
    tips: ["Corps droit des épaules aux talons.", "Coudes près du corps, poitrine vers la barre.", "Plus les pieds sont loin, plus c’est dur."] },
  "Montée de corde": { views: [side([
      { hip: [112, 142], torso: -90, neck: -94, near: { wristAt: [117, 42], hand: -90, ankleAt: [116, 176], ft: 20 }, far: { wristAt: [117, 60] }, eq: [climbRope(120)] },
      { hip: [114, 104], torso: -92, neck: -92, near: { wristAt: [117, 60], hand: -90, ankleAt: [117, 190], ft: 20 }, far: { wristAt: [117, 44] }, eq: [climbRope(120)] }],
      ["Mains en haut, pieds qui serrent la corde", "Jambes qui poussent, une main puis l’autre"])],
    cue: "Mains serrées en haut, pieds qui bloquent la corde : pousse sur les jambes, puis avance une main après l’autre plus haut.",
    tips: ["Les pieds pincent la corde (une cheville sur l’autre).", "Ce sont les jambes qui font monter, les bras tiennent.", "Redescends main après main, jamais en glissant."] },
  "Montée de corde sans jambes": { views: [side([
      { hip: [114, 106], torso: -90, neck: -94, near: { wristAt: [117, 8], hand: -90, th: 60, sh: 85, ft: 20 }, far: { wristAt: [117, 34] }, eq: [climbRope(120)] },
      { hip: [114, 92], torso: -90, neck: -94, near: { wristAt: [117, 24], hand: -90, th: 60, sh: 85, ft: 20 }, far: { wristAt: [117, -2] }, eq: [climbRope(120)] }],
      ["Main droite en haut", "Main gauche en haut"])],
    cue: "Uniquement avec les bras, jambes légèrement relevées : monte une main après l’autre.",
    tips: ["Jambes relevées devant toi, sans balancer.", "Une main après l’autre, bras qui tirent.", "Redescends aussi main après main."] },
  "L-sit": { views: [side([{ hip: [120, 118], torso: -90, neck: -90, near: { wristAt: [121, 122], hand: 0, th: 0, sh: 0, ft: 0 }, eq: [dipbars(96, 150, 127.5)] }], ["Position à tenir"])],
    cue: "Bras tendus en appui sur des barres, épaules basses : jambes tendues à l’horizontale.", tips: ["Épaules basses, loin des oreilles.", "Jambes serrées et tendues, pointes de pieds tirées.", "Progression : un genou plié, puis les deux jambes tendues."] },
  "Handstand": { views: [side([{ hip: [118, 99], torso: 91, neck: 78, near: { wristAt: [121, GROUND - 3], h: "flat", hand: 0, th: -90, sh: -90, ft: -90 } }], ["Position à tenir"])],
    cue: "Mains à largeur d’épaules, corps gainé et aligné, regard entre les mains.", tips: ["Commence contre un mur, ventre face au mur.", "Bras tendus, épaules qui poussent vers le haut.", "Corps aligné : mains, épaules, hanches, pieds."] },
  "Handstand push-up": { views: [side([
      { hip: [118, 99], torso: 91, neck: 90, near: { wristAt: [110, GROUND - 3], h: "flat", hand: 180, th: -90, sh: -90, ft: -90 }, eq: [wall(132)] },
      { hip: [118, 126], torso: 93, neck: 92, near: { wristAt: [110, GROUND - 3], h: "flat", hand: 180, th: -90, sh: -90, ft: -90 }, eq: [wall(132)] }], ["Bras tendus contre le mur", "Tête près du sol"])],
    cue: "En équilibre, pieds contre le mur : descends la tête près du sol en pliant les bras, puis pousse bras tendus.", tips: ["Mains à 20–30 cm du mur, largeur d’épaules.", "Descends lentement, la tête frôle le sol.", "Progression : pompes pike sur un banc."] }
});

/* ═══ Abdos / gainage ═══ */
// Allongé sur le dos : tête à gauche, genoux pliés, pieds à plat (orteils vers la droite).
const backLie = (lift, o = {}) => {
  const t = 180 + lift;
  return merge({ hip: [130, GROUND - 13], torso: t, neck: t + 4, near: { ankleAt: [172, ANK], ft: 0, kneeBend: 1, wristAt: null, ua: t + 150, fa: t - 60, hand: t - 60 } }, o);
};
const hangLeg = (o = {}) => merge({ hip: [118, BY + 112], torso: -92, neck: -88, near: { wristAt: onBar, hand: -90, th: 92, sh: 94, ft: 40 } }, o);
const MC_TUCK = [86, onToes(86, 70)[1] - 3];   // mountain climbers : pied ramené sous la poitrine, 3 au-dessus du sol
// Animation : genou ramené, hanches un peu plus hautes (le genou passe sans toucher le sol), l'autre pied reste posé.
// (le buste pivote autour des épaules pour que les mains restent au sol)
const mcTuck = side => { const p = plank(122, 150, 126, { near: { ls: {} } }), hip = [122 - 52 * Math.cos(-4.4 * Math.PI / 180), 150 - 52 * Math.sin(-4.4 * Math.PI / 180)];
  return merge(p, { hip, torso: -4.4, neck: 4, [side]: { ankleAt: MC_TUCK, ft: 70, kneeBend: 1 }, [side === "near" ? "far" : "near"]: { ankleAt: TOES, ft: 75, kneeBend: -1 } }); };
const forearmPlank = (o = {}) => {
  const sh = [124, 173], a = Math.atan2(sh[1] - TOES[1], sh[0] - TOES[0]) * 180 / Math.PI;
  return merge({ hip: [sh[0] - 52 * Math.cos(a * Math.PI / 180), sh[1] - 52 * Math.sin(a * Math.PI / 180)], torso: a, neck: a + 4,
    near: { th: 180 + a, sh: 180 + a, ft: 75, ua: 90, fa: 0, hand: 0 } }, o);
};
Object.assign(HOW, {
  // Seul le haut du dos s'enroule (curl) : le bas du dos et le bassin restent au sol.
  "Crunch": { views: [side([backLie(0, { near: { ua: 150, fa: -60, hand: -60 } }), backLie(0, { curl: 34, neck: 222, near: { ua: 184, fa: -26, hand: -26 } })], ["Allongé, genoux pliés", "Haut du dos enroulé, bas du dos au sol"])],
    cue: "Allongé sur le dos, genoux pliés et pieds à plat : enroule le haut du dos en soufflant, sans tirer sur la nuque, puis redescends.",
    tips: ["Pieds à plat au sol, talons près des fesses.", "Le bas du dos reste collé au sol : seules les épaules décollent.", "Mains contre les tempes, sans tirer sur la tête."] },
  // Mains sur la tête, coudes vers l'avant (vers les genoux), position neutre : le bras garde le même angle par rapport au buste.
  "Sit-ups": { views: [side([backLie(0, { near: { ua: 225, fa: 78, hand: 78, ls: { fa: 0.53 } } }), backLie(72, { neck: 250, near: { ua: 297, fa: 150, hand: 150, ls: { fa: 0.53 } } })], ["Allongé, genoux pliés", "Buste relevé jusqu’aux genoux"])],
    cue: "Allongé, genoux pliés, pieds à plat (bloqués si besoin) : relève tout le buste jusqu’aux genoux, puis redescends doucement.",
    tips: ["Pieds à plat, orteils vers l’avant, calés sous un support si besoin.", "Monte en déroulant le dos, redescends lentement.", "Mains contre les tempes ou bras croisés sur la poitrine."] },
  "Crunch à la poulie": { views: [side([
      // Hanches fixes au-dessus des genoux ; le dos s'enroule (curl). Mains contre la tête, coudes toujours vers le bas :
      // le bras garde le même angle par rapport au haut du dos pendant tout le mouvement.
      { hip: [110, 158], torso: -80, neck: -70, near: { th: 90, sh: 180, ft: 180, ua: 60, fa: -110, hand: -110 }, eq: [cable(186, 16, "rope")] },
      { hip: [110, 158], torso: -45, curl: 95, neck: 60, near: { th: 90, sh: 180, ft: 180, ua: 190, fa: 20, hand: 20 }, eq: [cable(186, 16, "rope")] }],
      ["À genoux, corde derrière la tête", "Dos enroulé vers le sol"])],
    cue: "À genoux face à la poulie haute, corde tenue derrière la tête : enroule le dos vers le sol en contractant les abdos, puis remonte lentement.",
    tips: ["Les hanches restent au-dessus des genoux et ne bougent pas.", "Mains fixes contre la tête : c’est le dos qui s’enroule.", "Souffle en descendant."] },
  // Animation : une jambe à la fois (genou vers la poitrine puis retour en planche), l'autre reste tendue au sol.
  "Mountain climbers": { animViews: [side([
      mcTuck("near"), plank(122, 150, 126, { near: { ls: {} } }), mcTuck("far")], ["Genou droit vers la poitrine", "Planche", "Genou gauche vers la poitrine"], [0, 1, 2, 1])],
    views: [side([
      // Genou vers la poitrine, pied juste au-dessus du sol (jamais dedans) ; l'autre jambe tendue, sur la pointe.
      plank(122, 150, 126, { near: { ls: {}, ankleAt: MC_TUCK, ft: 70, kneeBend: 1 }, far: { th: 165.5, sh: 165.5, ft: 75 } }),
      plank(122, 150, 126, { near: { ls: {} }, far: { ankleAt: MC_TUCK, ft: 70, kneeBend: 1 } })], ["Genou droit vers la poitrine", "Genou gauche vers la poitrine"])],
    cue: "En planche, bras tendus : ramène un genou vers la poitrine, puis l’autre, en alternant vite sans lever les fesses.",
    tips: ["Un genou après l’autre, jamais les deux en même temps.", "Mains sous les épaules, bras tendus.", "Fesses basses, dos plat."] },
  "Roue abdominale": { views: [side([
      { hip: [78, 158], torso: -30, neck: -20, near: { th: 102, sh: 180, ft: 180, wristAt: [126, 190], hand: 90 }, eq: [wheel()] },
      { hip: [94.4, 165.3], torso: -5, neck: 0, near: { th: 125, sh: 180, ft: 180, wristAt: [196, 192], hand: 90 }, eq: [wheel()] }],
      ["À genoux, roue sous les épaules", "Roule devant toi, dos plat"])],
    cue: "À genoux, mains sur la roue sous les épaules : roule devant toi en gardant le dos plat, puis reviens en contractant les abdos.",
    tips: ["Dos plat, fesses serrées : le bas du dos ne se creuse jamais.", "Ne va pas plus loin que ce que tu contrôles.", "Débutant : petites amplitudes, ou contre un mur."] },
  "Russian twist": { views: [
      side([{ hip: [110, GROUND - 10], torso: -125, neck: -110, near: { th: -40, sh: 25, ft: 10, wristAt: [116, 164], hand: -10 }, eq: [medball(P => add(P.near.grip, [4, 0]), { top: true })] }], ["Assis, buste penché en arrière"]),
      front([
        { view: "front", hip: [120, 184], tls: 0.75, torso: -90, neck: -90, R: { th: -70, sh: 90, ls: { th: 0.35, sh: 0.45 }, wristAt: [152, 170], hand: 0 }, L: { wristAt: [140, 176], hand: 0 }, eq: [medball(P => [(P.R.grip[0] + P.L.grip[0]) / 2 + 4, P.R.grip[1] + 2], { top: true })] },
        { view: "front", hip: [120, 184], tls: 0.75, torso: -90, neck: -90, R: { th: -70, sh: 90, ls: { th: 0.35, sh: 0.45 }, wristAt: [100, 176], hand: 180 }, L: { wristAt: [88, 170], hand: 180 }, eq: [medball(P => [(P.R.grip[0] + P.L.grip[0]) / 2 - 4, P.L.grip[1] + 2], { top: true })] }],
        ["Poids à droite", "Poids à gauche"])],
    cue: "Assis, buste penché en arrière comme en haut d’un crunch, pieds décollés : fais passer le poids d’un côté à l’autre en tournant les épaules.",
    tips: ["Dos droit (pas arrondi), buste penché à environ 45°.", "Ce sont les épaules qui tournent, le poids suit.", "Trop dur ? Garde les talons au sol."] },
  "Gainage": { views: [side([forearmPlank()], ["Position à tenir"])],
    cue: "Sur les avant-bras, coudes sous les épaules, avant-bras vers l’avant : corps aligné des épaules aux talons.",
    tips: ["Coudes sous les épaules, avant-bras parallèles pointés vers l’avant.", "Corps droit : ni fesses en l’air, ni ventre qui tombe.", "Serre les abdos et les fessiers, respire normalement."] },
  "Gainage latéral": { views: [front([{ view: "front", hip: [70, 170], torso: -12, neck: -12,
      R: { ua: 90, fa: 90, hand: 90, ls: { ua: 0.8, fa: 0.3 }, th: 168, sh: 168 }, L: { ua: 170, fa: 178, hand: 178, th: 168, sh: 168 } }], ["Position à tenir"])],
    cue: "Sur un avant-bras, coude sous l’épaule : corps aligné de la tête aux pieds, sans laisser tomber ni monter les hanches.",
    tips: ["Coude juste sous l’épaule.", "Corps aligné : les hanches ne montent pas et ne tombent pas.", "Trop dur ? Pose le genou du dessous au sol."] },
  "Relevés de jambes": { views: [side([hangLeg({ eq: [pullbar(120, BY)] }), hangLeg({ near: { th: -2, sh: -2, ft: -20 }, eq: [pullbar(120, BY)] })], ["Suspendu, jambes tendues", "Jambes à l’horizontale"])],
    cue: "Suspendu à la barre sans balancer : monte les jambes tendues jusqu’à l’horizontale, puis redescends lentement.",
    tips: ["Bras tendus, épaules actives.", "Pas d’élan : les jambes montent et descendent lentement.", "Trop dur ? Monte les genoux pliés."] },
  // Les jambes montent par l'avant (étape « à l'horizontale ») jusqu'à toucher la barre, pointes de pieds vers la barre.
  "Toes to bar": { views: [side([hangLeg({ eq: [pullbar(120, BY)] }), hangLeg({ near: { th: -2, sh: -2, ft: -20 }, eq: [pullbar(120, BY)] }),
      { hip: [148, BY + 93], torso: -140, neck: -140, near: { wristAt: onBar, hand: -90, ankleAt: [140, BY + 12], ft: -150 }, eq: [pullbar(120, BY)] }], ["Suspendu", "Jambes à l’horizontale", "Pointes de pieds à la barre"], [0, 1, 2, 1])],
    cue: "Suspendu à la barre : monte les pieds jusqu’à toucher la barre, jambes tendues, puis redescends en contrôlant.",
    tips: ["Les pointes de pieds touchent la barre, entre les mains.", "Bras tendus, épaules qui tirent vers le bas.", "Contrôle la descente pour ne pas te balancer."] },
  "Hollow hold": { views: [side([{ hip: [124, GROUND - 13], torso: -172, neck: -170, near: { ua: -168, fa: -170, hand: -170, th: -12, sh: -12, ft: -12 } }], ["Position à tenir"])],
    cue: "Allongé sur le dos, bas du dos plaqué au sol : bras tendus derrière la tête et jambes tendues, décollés du sol.",
    tips: ["Le bas du dos reste collé au sol.", "Épaules et pieds décollés de quelques centimètres.", "Trop dur ? Genoux pliés ou bras le long du corps."] }
});

/* ═══ Jambes / fessiers ═══ */
const rad = d => d * Math.PI / 180, dirA = d => [Math.cos(rad(d)), Math.sin(rad(d))];
const shOf = (hip, torso) => add(hip, [52 * Math.cos(rad(torso)), 52 * Math.sin(rad(torso))]);
// Barre posée sur le haut du dos : un peu derrière et au-dessus de l'épaule.
const backBarAt = (hip, torso) => add(shOf(hip, torso), add([9 * Math.cos(rad(torso - 90)), 9 * Math.sin(rad(torso - 90))], [2 * Math.cos(rad(torso)), 2 * Math.sin(rad(torso))]));
// Mains sur la barre derrière la nuque : coude vers le bas et l'arrière, avant-bras vertical.
const backSquat = (hip, torso, ank) => { const r = torso + 90; return { hip, torso, neck: torso > -80 ? -70 : -88, near: { ankleAt: ank, ft: 0, ua: 100 + r, fa: -88 + r, hand: -90 + r }, eq: [bar(P => backBarAt(P.hip, P.torso), 13)] }; };
// Squat vu de face : cuisses qui avancent vers nous (raccourcies), genoux au-dessus des pieds.
const squatF = (down, o = {}) => ({ view: "front", torso: -90, neck: -90, tls: down ? 0.86 : 1, hip: [120, down ? ANK - 44 * 0.97 - 46 * 0.3 : HIPY],
  R: { th: down ? 84 : 90, sh: down ? 92 : 90, ls: down ? { th: 0.3 } : {}, ...(o.R || {}) }, ...o, R: { th: down ? 84 : 90, sh: down ? 92 : 90, ls: down ? { th: 0.3 } : {}, ...(o.R || {}) } });
// Front squat : barre posée sur l'avant des épaules (au contact des clavicules), coudes hauts devant.
const frontRack = (hip, torso, ank) => { const sh = shOf(hip, torso), r = rad(torso + 90), w = add(sh, [6.2 * Math.cos(r) - 3.75 * Math.sin(r), 6.2 * Math.sin(r) + 3.75 * Math.cos(r)]);
  return { hip, torso, neck: torso + (torso > -80 ? -14 : 0), near: { ankleAt: ank, ft: 0, wristAt: w, elbowBend: 1, hand: -30 + torso + 90 }, eq: [bar(P => P.near.grip, 13, { top: true })] }; };
const SQUAT_TIPS = ["Pieds largeur d’épaules, pointes légèrement vers l’extérieur.", "Genoux dans l’axe des pieds : ils ne rentrent pas et ne partent pas vers l’extérieur.", "Descends au moins jusqu’aux cuisses parallèles au sol, dos droit, talons au sol.", "Pousse dans les talons pour remonter."];
// Pied posé par la plante (bord d'une marche) : cheville placée pour que la plante reste au point « ball ».
const ankleFromBall = (ball, ft) => add(ball, [-(18 * Math.cos(rad(ft)) - 7.2 * Math.sin(rad(ft))), -(18 * Math.sin(rad(ft)) + 7.2 * Math.cos(rad(ft)))]);
const calfStand = ft => { const a = ankleFromBall([132, 188], ft); return stand({ hip: [a[0], a[1] - 90], near: { ft, ua: 93, fa: 84 }, eq: [box(128, 188, 40, 22), db(P => [P.near.grip, 90], "side", { mid: true })] }); };
const hackEq = [
  raw(P => { const b = dirA(P.torso - 90), p1 = add(P.hip, [b[0] * 13, b[1] * 13]), p2 = add(P.sh, [b[0] * 13, b[1] * 13]); return `<line class="fg-padline" x1="${p1[0].toFixed(1)}" y1="${p1[1].toFixed(1)}" x2="${p2[0].toFixed(1)}" y2="${p2[1].toFixed(1)}"/>`; }),
  line([60, 4], [172, 214], "fg-rail"), line([150, 212], [196, 170], "fg-plat"),
  roller(P => add(P.sh, [-2, -9]), 6, { top: true })];
const pressEq = ank => [line([30, 202], [196, 36], "fg-rail"), raw(() => `<rect class="fg-pad" x="30" y="150" width="70" height="8" rx="3.5"/><rect class="fg-pad" x="18" y="118" width="46" height="8" rx="3.5" transform="rotate(32 64 122)"/><rect class="fg-frame" x="56" y="158" width="4" height="${GROUND - 158}"/><rect class="fg-frame" x="30" y="${GROUND - 3}" width="60" height="4" rx="1.5"/>`),
  // Plateforme sous la semelle (pied à plat, orteils vers le haut de la plateforme), chariot derrière elle.
  raw(P => { const a = add(P.near.ankle, [0.5, -14.6]); return `<g transform="translate(${a[0].toFixed(1)} ${a[1].toFixed(1)}) rotate(45)"><rect class="fg-plate" x="-26" y="-3.5" width="52" height="7" rx="2"/><rect class="fg-frame" x="-6" y="-19.5" width="12" height="16"/></g>`; })];
const legExt = ext => ({ hip: [100, 142], torso: -95, neck: -90, near: { th: -4, sh: ext ? -8 : 92, ft: ext ? -20 : 10, wristAt: [104, 150], hand: 0 },
  // Boudin sur l'avant du bas du tibia, juste au-dessus de la cheville, pendant tout le mouvement.
  eq: [seat(86, 150, 1, 8), roller(P => { const a = rad(P.near.sh); return add(P.near.ankle, [-6 * Math.cos(a) + 6.5 * Math.sin(a), -6 * Math.sin(a) - 6.5 * Math.cos(a)]); }, 6, { top: true })] });
const legCurl = up => ({ hip: [100, 150], torso: 0, neck: 4, near: { th: 180, sh: up ? -60 : 180, ft: up ? -60 : 180, wristAt: [168, 166], hand: 90 },
  eq: [bench(30, 176, 163), roller(P => add(P.near.ankle, up ? [4, -6] : [0, -8]), 6, { top: true })] });
// Assis, cuisses à l'horizontale, coussin sur le bas des cuisses près des genoux, avant du pied sur la cale :
// seules les chevilles bougent (le talon monte et descend, le genou suit un peu).
const seatCalf = ft => { const a = ankleFromBall([166, 190], ft); return { hip: [100, 142], torso: -88, neck: -88, near: { ankleAt: a, ft, kneeBend: 1, wristAt: [134, 130], hand: 0 },
  eq: [seat(86, 150, 0), box(150, 190, 40, 20), roller(P => add(P.near.knee, [-8, -10]), 6.5, { top: true }), roller(P => add(P.near.knee, [-18, -10]), 6.5, { top: true })] }; };
const lunge = (front, o = {}) => stand({ hip: [118, 150], ...o, near: front === "near" ? { ankleAt: [160, ANK], ft: 0, ua: 92, fa: 88, hand: 90 } : { ankleAt: onToes(72, 62), ft: 62, ua: 92, fa: 88, hand: 90 },
  far: front === "near" ? { ankleAt: onToes(72, 62), ft: 62 } : { ankleAt: [160, ANK], ft: 0 }, eq: [db(P => [P.near.grip, 90], "side", { mid: true })] });
const BENCH_HT = 163;
const ht = (sh, hipUp) => { const hip = hipUp ? add(sh, [52, 0]) : add(sh, [52 * Math.cos(rad(33.7)), 52 * Math.sin(rad(33.7))]), b = add(hip, [4, -13]);
  return { hip, torso: hipUp ? 180 : -146.3, neck: hipUp ? 200 : -150, near: { ankleAt: [150, ANK], ft: 0, kneeBend: 1, wristAt: add(b, [-4, -4]), hand: -60 }, eq: [bench(10, 72, BENCH_HT), bar(P => add(P.hip, [4, -13]), 13, { top: true })] }; };

Object.assign(HOW, {
  "Squat": { views: [
      side([backSquat([120, HIPY], -90, [124, ANK]), backSquat([104, 166], -58, [124, ANK])], ["Debout, barre sur le haut du dos", "Cuisses parallèles au sol"]),
      // Coudes vers le bas, sous la barre ; la barre repose sur le haut du dos (derrière la nuque).
      front([squatF(0, { R: { ua: 75, fa: -70, hand: -90, ls: { ua: 0.6 } }, eq: [fbar(P => P.R.grip[1])] }), squatF(1, { R: { ua: 75, fa: -70, hand: -90, ls: { ua: 0.6, th: 0.3 } }, eq: [fbar(P => P.R.grip[1])] })], ["Debout, coudes sous la barre", "Genoux dans l’axe des pieds"])],
    cue: "Barre sur le haut du dos, dos droit : descends les hanches jusqu’aux cuisses parallèles au sol, genoux dans l’axe des pieds, puis pousse dans les talons.", tips: SQUAT_TIPS },
  "Squats (poids du corps)": { views: [
      side([stand({ near: { ua: -2, fa: -2, hand: -2, h: "open" } }), { hip: [104, 166], torso: -58, neck: -76, near: { ankleAt: [124, ANK], ft: 0, ua: -2, fa: -2, hand: -2, h: "open" } }], ["Debout, bras devant", "Cuisses parallèles au sol"]),
      front([squatF(0, { R: { ua: 86, fa: 90 } }), squatF(1, { R: { ua: -80, fa: -80, ls: { ua: 0.25, fa: 0.25, th: 0.3 }, h: "open" } })], ["Debout", "Genoux dans l’axe des pieds"])],
    cue: "Bras devant pour l’équilibre : descends les hanches jusqu’aux cuisses parallèles au sol, genoux dans l’axe des pieds, talons au sol, puis remonte.", tips: SQUAT_TIPS },
  "Squat goblet": { views: [
      side([stand({ near: { wristAt: [136, 96], hand: -80 }, eq: [db(P => [add(P.near.grip, [3, 0]), 0], "side", { top: true })] }),
        { hip: [104, 166], torso: -66, neck: -80, near: { ankleAt: [124, ANK], ft: 0, wristAt: [140, 128], hand: -80 }, eq: [db(P => [add(P.near.grip, [3, 0]), 0], "side", { top: true })] }], ["Haltère contre la poitrine", "Coudes entre les genoux"]),
      front([squatF(0, { R: { wristAt: [128, 96], hand: 180, ls: {} }, eq: [db(P => [[120, P.R.grip[1]], 90], "side", { top: true })] }),
        squatF(1, { R: { wristAt: [128, 140], hand: 180 }, eq: [db(P => [[120, P.R.grip[1]], 90], "side", { top: true })] })], ["Debout", "Genoux dans l’axe des pieds"])],
    cue: "Haltère tenu à deux mains contre la poitrine : descends entre tes genoux en gardant le buste droit, genoux dans l’axe des pieds, puis remonte.",
    tips: ["Haltère tenu verticalement contre la poitrine, coudes vers le bas.", "Pieds un peu plus larges que les épaules, genoux dans l’axe des pieds.", "En bas, les coudes passent entre les genoux."] },
  "Front squat": { views: [
      side([frontRack([120, HIPY], -90, [124, ANK]), frontRack([106, 166], -72, [124, ANK])], ["Barre sur l’avant des épaules", "Buste droit, cuisses parallèles"]),
      front([squatF(0, { R: { ua: 60, fa: -100, hand: -90, ls: { ua: 0.45, fa: 0.3 } }, eq: [fbar(P => P.R.shoulder[1] + 2, { top: true })] }), squatF(1, { R: { ua: 60, fa: -100, hand: -90, ls: { ua: 0.45, fa: 0.3, th: 0.3 } }, eq: [fbar(P => P.R.shoulder[1] + 2, { top: true })] })], ["Barre sur l’avant des épaules, coudes hauts", "Genoux dans l’axe des pieds"])],
    cue: "Barre posée devant, sur le haut des épaules et les clavicules, coudes hauts : descends en gardant le buste droit, puis remonte.",
    tips: ["La barre repose sur l’avant des épaules, contre la gorge, pas dans les mains.", "Coudes hauts et pointés devant toi pendant toute la descente.", "Genoux dans l’axe des pieds, buste plus droit qu’au squat classique."] },
  "Pistol squat": { views: [side([
      stand({ near: { ua: -2, fa: -2, hand: -2, h: "open" }, far: { th: 70, sh: 90, ft: 0 } }),
      { hip: [100, 170], torso: -52, neck: -70, near: { ankleAt: [120, ANK], ft: 0, ua: -4, fa: -4, hand: -4, h: "open" }, far: { th: -6, sh: -6, ft: -20 } }], ["Sur une jambe, l’autre devant", "Descente sur une jambe, l’autre tendue"])],
    cue: "Sur une jambe, l’autre tendue devant : descends le plus bas possible en gardant le talon au sol, puis remonte.",
    tips: ["Bras tendus devant pour l’équilibre.", "Talon de la jambe d’appui au sol, genou dans l’axe du pied.", "Pour apprendre : descends sur un banc ou tiens-toi à un support."] },
  "Hack squat": { views: [side([
      { hip: [118, 108], torso: -115, neck: -100, near: { ankleAt: [168, 184], ft: -45, wristAt: [104, 70], hand: -60 }, eq: hackEq },
      { hip: [137, 145], torso: -115, neck: -100, near: { ankleAt: [168, 184], ft: -45, wristAt: [123, 107], hand: -60 }, eq: hackEq }], ["Jambes presque tendues", "Cuisses parallèles à la plateforme"])],
    cue: "Dos collé au dossier, épaules sous les coussins, pieds sur la plateforme : descends le chariot en pliant les genoux, puis pousse.",
    tips: ["Dos et bassin collés au dossier.", "Pieds largeur d’épaules au milieu de la plateforme.", "Ne verrouille pas les genoux en haut."] },
  "Presse à cuisses": { views: [side([
      { hip: [92, 150], torso: -148, neck: -148, near: { ankleAt: [134, 104], ft: -135, kneeBend: 1, wristAt: [100, 158], hand: 0 }, eq: pressEq() },
      { hip: [92, 150], torso: -148, neck: -148, near: { ankleAt: [158, 80], ft: -135, kneeBend: 1, wristAt: [100, 158], hand: 0 }, eq: pressEq() }], ["Genoux pliés", "Jambes presque tendues"])],
    cue: "Dos et bassin collés au siège, pieds sur la plateforme : pousse sans verrouiller les genoux, puis redescends lentement.",
    tips: ["Pieds largeur de hanches au milieu de la plateforme.", "Descends jusqu’à avoir les genoux à 90°, sans décoller le bassin.", "Ne verrouille pas les genoux en haut."] },
  "Leg extension": { views: [side([legExt(0), legExt(1)], ["Genoux à 90°", "Jambes tendues"])],
    cue: "Dos calé contre le dossier, boudin sur le bas des tibias : tends les jambes complètement, puis redescends en contrôlant.",
    tips: ["Règle le dossier pour que tes genoux soient au bord du siège.", "Boudin posé sur le bas des tibias.", "Tiens les poignées, les fesses restent sur le siège."] },
  "Leg curl": { views: [side([legCurl(0), legCurl(1)], ["Jambes tendues", "Talons vers les fesses"])],
    cue: "Allongé sur le ventre, boudin derrière les chevilles : ramène les talons vers les fesses, puis redescends lentement.",
    tips: ["Hanches collées au banc pendant tout le mouvement.", "Boudin juste au-dessus des talons.", "Redescends lentement, sans laisser tomber la charge."] },
  "Abducteurs machine": { views: [front([
      { view: "front", hip: [120, 142], torso: -90, neck: -90, R: { th: 90, sh: 90, ls: { th: 0.3 }, ua: 80, fa: 90, hand: 90 }, eq: [fbench(150), roller(P => add(P.R.knee, [9, 0]), 6, { top: true }), roller(P => add(P.L.knee, [-9, 0]), 6, { top: true })] },
      { view: "front", hip: [120, 142], torso: -90, neck: -90, R: { th: 40, sh: 84, ls: { th: 0.45 }, ua: 80, fa: 90, hand: 90 }, eq: [fbench(150), roller(P => add(P.R.knee, [9, 0]), 6, { top: true }), roller(P => add(P.L.knee, [-9, 0]), 6, { top: true })] }], ["Genoux serrés", "Genoux écartés"])],
    cue: "Assis, coussins contre l’extérieur des genoux : écarte les jambes, puis ramène-les lentement.",
    tips: ["Dos collé au dossier, mains sur les poignées.", "Écarte sans à-coups, garde 1 seconde, ramène lentement."] },
  "Fentes": { views: [side([stand({ eq: [db(P => [P.near.grip, 90], "side", { mid: true })] }), lunge("near"), lunge("far")], ["Debout", "Jambe droite devant", "Jambe gauche devant"], [0, 1, 0, 2])],
    cue: "Grand pas en avant : descends le genou arrière près du sol, genou avant au-dessus de la cheville, remonte, puis change de jambe.",
    tips: ["Une jambe puis l’autre.", "Genou avant au-dessus de la cheville, dans l’axe du pied.", "Buste droit, genou arrière qui frôle le sol."] },
  "Fentes bulgares": { views: [side([
      stand({ hip: [114, 126], near: { ankleAt: [150, ANK], ft: 0 }, far: { ankleAt: [46, 156], ft: 170, kneeBend: 1 }, eq: [bench(0, 58, 163), db(P => [P.near.grip, 90], "side", { mid: true })] }),
      stand({ hip: [108, 150], near: { ankleAt: [150, ANK], ft: 0 }, far: { ankleAt: [46, 156], ft: 170, kneeBend: 1 }, eq: [bench(0, 58, 163), db(P => [P.near.grip, 90], "side", { mid: true })] })], ["Pied arrière sur le banc", "Genou arrière vers le sol"])],
    cue: "Dessus du pied arrière posé sur un banc : descends le genou arrière vers le sol, genou avant au-dessus de la cheville, puis remonte.",
    tips: ["Banc à hauteur de genou, dessus du pied arrière posé dessus.", "Pied avant assez loin du banc pour garder le genou au-dessus de la cheville.", "Buste droit, descends à la verticale."] },
  "Step-up": { views: [side([
      stand({ hip: [108, 112], torso: -84, near: { ankleAt: [152, 150.8], ft: 0 }, far: { ankleAt: [104, ANK], ft: 0 }, eq: [box(130, 158, 56, 52), db(P => [P.near.grip, 90], "side", { mid: true })] }),
      stand({ hip: [150, 60.8], near: { ankleAt: [152, 150.8], ft: 0 }, far: { th: 40, sh: 110, ft: 30 }, eq: [box(130, 158, 56, 52), db(P => [P.near.grip, 90], "side", { mid: true })] })], ["Un pied sur la box", "Debout au-dessus du genou"])],
    cue: "Pose un pied entier sur la box : monte en poussant sur ce pied jusqu’à être debout au-dessus de ce genou, puis redescends en contrôlant.",
    tips: ["Box à hauteur de genou environ, pied entier posé dessus.", "Pousse sur le talon du pied posé sur la box, sans t’aider de l’autre jambe.", "Monte jusqu’à être bien droit, puis redescends lentement."] },
  "Pont fessier": { views: [side([
      { hip: [124, GROUND - 13], torso: 180, neck: 182, near: { ankleAt: [162, ANK], ft: 0, kneeBend: 1, ua: 8, fa: 2, hand: 0, h: "flat" } },
      { hip: [117.9, 170.6], torso: 152, neck: 170, near: { ankleAt: [162, ANK], ft: 0, kneeBend: 1, ua: 14, fa: 6, hand: 0, h: "flat" } }], ["Allongé, épaules au sol", "Hanches levées"])],
    cue: "Allongé sur le dos, épaules au sol, pieds à plat : monte les hanches en serrant les fessiers, puis redescends.",
    tips: ["Épaules et tête restent au sol (sans banc, contrairement au hip thrust).", "Pieds à plat, talons près des fesses.", "En haut, genoux–hanches–épaules alignés, fessiers serrés 1 seconde."] },
  "Hip thrust": { views: [side([ht([66, 152], 0), ht([66, 152], 1)], ["Hanches basses", "Corps à l’horizontale"])],
    cue: "Haut du dos posé sur un banc, barre sur les hanches, pieds à plat : pousse les hanches vers le haut en serrant les fessiers, puis redescends.",
    tips: ["Le bas des omoplates posé sur le bord d’un banc.", "Barre sur le pli des hanches, avec une mousse.", "En haut, les tibias sont verticaux et le corps forme une table.", "Menton rentré, regard vers les genoux."] },
  "Mollets debout": { views: [side([calfStand(-22), calfStand(38)], ["Talons sous la marche", "Sur la pointe des pieds"])],
    cue: "Plante des pieds sur le bord d’une marche, talons dans le vide : monte sur la pointe des pieds le plus haut possible, puis redescends lentement.",
    tips: ["Seule la plante du pied est sur la marche.", "Descends les talons sous le niveau de la marche avant de remonter.", "Tiens-toi à un support pour l’équilibre."] },
  "Mollets assis": { views: [side([seatCalf(-18), seatCalf(34)], ["Talons en bas", "Talons levés"])],
    cue: "Assis, coussin sur les genoux, plante des pieds sur la marche : monte les talons le plus haut possible, puis redescends lentement.",
    tips: ["Seule la plante du pied est sur la marche, talons dans le vide.", "Coussin bien calé sur le bas des cuisses.", "Mouvement lent, pause en haut."] }
});

/* ═══ Dos / lombaires ═══ */
const dlStart = (wx = 128, o = {}) => merge({ hip: [98, 165], torso: -30, neck: -20, near: { ankleAt: [124, ANK], ft: 0, wristAt: [wx, GROUND - 18.5], hand: 90, track: 1 }, eq: [bar(P => P.near.grip, 13, { top: true })] }, o);
const dlTop = (o = {}) => stand(merge({ near: { wristAt: [117.8, 118.7], hand: 90, track: 1 }, eq: [bar(P => P.near.grip, 13, { top: true })] }, o));
// Passage aux genoux (animation seulement) : tibias presque verticaux, la barre passe devant les genoux, bras tendus.
const dlKnee = (o = {}) => merge({ hip: [92, 128], torso: -40, neck: -28, near: { ankleAt: [124, ANK], ft: 0, wristAt: [133, 152.5], hand: 90, track: 1 }, eq: [bar(P => P.near.grip, 13, { top: true })] }, o);
const bentF = (tls, o = {}) => ({ view: "front", torso: -90, neck: -90, tls, hip: [120, 120], ...o, R: { th: 90, sh: 90, ls: { th: 0.85 }, ...(o.R || {}) } });
const rowSide = (up, o = {}) => merge({ hip: [96, 120], torso: -35, neck: -24, near: { ankleAt: [120, ANK], ft: 0, wristAt: up ? [122, 113] : [136, 146], hand: 90 } }, o);
const benchRow = up => ({ hip: [112, 112], torso: -10, neck: -14, near: { th: 96, sh: 88, ft: 0, ua: up ? -158 : 90, fa: 90, hand: 90 },
  far: { ua: 97, fa: 93, hand: 0, h: "flat", th: 92, sh: 180, ft: 160 }, eq: [bench(62, 196, 165), db(P => [P.near.grip, 90], "side", { mid: true })] });
// Assis sur le banc, pieds contre les cale-pieds, genoux légèrement fléchis vers le haut.
const seatedRow = back => ({ hip: [84, 178], torso: back ? -96 : -70, neck: back ? -96 : -70, near: { ankleAt: [166, 176], ft: -80, kneeBend: 1, wristAt: back ? [112, 158] : [176, 150], hand: 0 },
  eq: [bench(40, 120, 186), line([175, 160], [175, 200], "fg-plat"), line([175, 200], [175, GROUND], "fg-rail"), cable(204, 150, "handle")] });
const machineRow = back => ({ hip: [100, 142], torso: -88, neck: -88, near: { th: 0, sh: 90, ft: 0, wristAt: back ? [140, 104] : [170, 102], hand: 0 },
  // Le câble arrive de face, un peu plus bas que les mains.
  eq: [seat(86, 150, 0), pad(122, 88, 8, 40), cable(198, 114, "handle")] });
const pulldown = (down, o = {}) => merge({ hip: [104, 150], torso: -95, neck: -92, near: { th: -4, sh: 92, ft: 0, wristAt: down ? [118, 96] : [112, 44], hand: -90, elbowBend: -1 },
  eq: [seat(88, 158, 0), roller(P => add(P.near.knee, [-6, -9]), 6, { top: true }), cableTop(113, -30, 170)] }, o);
const pulldownF = (grip, down) => ({ view: "front", torso: -90, neck: -90, hip: [120, 150], R: { th: 90, sh: 90, ls: { th: 0.3, sh: 0.86 },
    // Prise serrée, en bas : coudes vers le bas le long des côtes, avant-bras presque verticaux.
    // Le coude descend devant, dans l'axe du corps : vu de face le haut du bras raccourcit puis s'inverse
    // (raccourci négatif), sans s'écarter sur le côté ni croiser l'autre bras.
    ...(grip < 15 ? (down ? { ua: -105, fa: -121, hand: -90, ls: { th: 0.3, sh: 0.86, ua: -1 }, fore: 1 } : { ua: -102.3, fa: -100.3, hand: -90, fore: 1 }) : { wristAt: [120 + grip, down ? 94 : 38], hand: -90, elbowBend: down ? -1 : 1 }) },
  eq: [fbench(158), fcableTop()] });
const hyper = t => ({ hip: [100, 120], torso: t, neck: t + 4, near: { th: 180, sh: 180, ft: 180, ua: t + 70, fa: t - 160, hand: t - 160 },
  eq: [raw(() => `<rect class="fg-frame" x="96" y="132" width="5" height="${GROUND - 132}"/><rect class="fg-frame" x="18" y="132" width="5" height="${GROUND - 132}"/><rect class="fg-frame" x="10" y="${GROUND - 3}" width="100" height="4" rx="1.5"/><rect class="fg-frame" x="18" y="130" width="84" height="4"/>`),
    pad(84, 126, 30, 8), roller([12, 128], 5.5, { top: true }), roller([12, 112], 5.5, { top: true })] });
const tbar = up => { const g = up ? [128, 128] : [134, 170]; return { hip: [96, 120], torso: -35, neck: -24, near: { ankleAt: [120, ANK], ft: 0, wristAt: add(g, [0, -5.5]), hand: 90 },
  eq: [raw(P => { const c = add(P.near.grip, [12, 0]); return `<line class="fg-barline" x1="30" y1="${GROUND - 3}" x2="${c[0].toFixed(1)}" y2="${c[1].toFixed(1)}"/>`; }), bar(P => add(P.near.grip, [12, 0]), 11, { top: true }), roller([30, GROUND - 4], 3)] }; };
const shrugStand = up => stand({ shrug: up ? 7 : 0, near: { ua: 92, fa: 90, hand: 90 }, eq: [db(P => [P.near.grip, 90], "side", { mid: true })] });

Object.assign(HOW, {
  "Soulevé de terre": { animViews: [side([dlStart(), dlKnee(), dlTop()], ["Barre au sol, dos plat", "Barre devant les genoux", "Debout, barre contre les cuisses"], [0, 1, 2, 1]), "De face"], views: [
      side([dlStart(), dlTop()], ["Barre au sol, dos plat", "Debout, barre contre les cuisses"]),
      front([bentF(0.3, { hip: [120, 150], R: { ls: { th: 0.2 }, wristAt: [141, 190.5], hand: 90 }, eq: [fbar(P => P.R.grip[1], { top: true })] }), standF({ R: { wristAt: [141, 124], hand: 90 }, eq: [fbar(P => P.R.grip[1], { top: true })] })], ["Mains juste à l’extérieur des genoux", "Debout"])],
    cue: "Barre au-dessus du milieu des pieds, dos plat : pousse dans le sol avec les jambes en gardant la barre collée aux jambes, jusqu’à être debout.",
    tips: ["Pieds largeur de hanches, barre au-dessus du milieu du pied.", "Dos plat du début à la fin, jamais arrondi.", "Barre collée aux jambes pendant toute la montée.", "En haut, serre les fessiers sans te pencher en arrière."] },
  "Soulevé de terre roumain": { views: [side([
      // En haut, jambes tendues ; les genoux se fléchissent un peu pendant la descente (hanche à 87 de la cheville en bas).
      // La barre descend en ligne droite le long des cuisses puis des tibias (track).
      { hip: [121, HIPY], torso: -90, neck: -90, near: { ankleAt: [122, ANK], ft: 0, wristAt: [128.5, 118], hand: 90, track: 1 }, eq: [bar(P => P.near.grip, 13, { top: true })] },
      { hip: [84, 124.5], torso: -20, neck: -20, near: { ankleAt: [122, ANK], ft: 0, wristAt: [132, 164.7], hand: 90, track: 1 }, eq: [bar(P => P.near.grip, 13, { top: true })] }], ["Debout, jambes tendues", "Hanches en arrière, genoux un peu fléchis"])],
    cue: "Jambes presque tendues : pousse les hanches vers l’arrière en gardant le dos plat, descends la barre le long des cuisses jusque sous les genoux, puis remonte.",
    tips: ["Genoux légèrement fléchis et fixes.", "Ce sont les hanches qui reculent : la barre glisse le long des cuisses.", "Arrête-toi quand tu sens l’étirement derrière les cuisses, dos toujours plat."] },
  "Soulevé de terre sumo": { animViews: [side([dlStart(126, { hip: [102, 180], torso: -62, near: { ls: { th: 0.8 } } }), dlKnee(), dlTop()], ["Barre au sol, buste plus droit", "Barre devant les genoux", "Debout"], [0, 1, 2, 1]), "De face"], views: [
      side([dlStart(126, { hip: [102, 180], torso: -62, near: { ls: { th: 0.8 } } }), dlTop()], ["Barre au sol, buste plus droit", "Debout"]),
      front([{ view: "front", torso: -90, neck: -90, tls: 0.35, hip: [120, 150], R: { th: 40, sh: 95, ls: { th: 0.8, sh: 0.65 }, wristAt: [132, 190.5], hand: 90 }, eq: [fbar(P => P.R.grip[1], { top: true })] },
        { view: "front", torso: -90, neck: -90, hip: [120, 116], R: { th: 70, sh: 95, wristAt: [133, 120], hand: 90 }, eq: [fbar(P => P.R.grip[1], { top: true })] }], ["Pieds très écartés, mains entre les genoux", "Debout"])],
    cue: "Pieds très écartés, pointes vers l’extérieur, mains entre les genoux : pousse les genoux vers l’extérieur et remonte en gardant le dos plat.",
    tips: ["Écartement des pieds bien plus large que les épaules, pointes vers l’extérieur.", "Mains à l’intérieur des genoux, bras tendus.", "Genoux dans l’axe des pieds, buste plus droit qu’au soulevé classique."] },
  "Good morning": { views: [side([backSquat([120, HIPY], -90, [124, ANK]), backSquat([98, HIPY + 6], -12, [124, ANK])], ["Barre sur les épaules", "Buste penché, dos plat"])],
    cue: "Barre posée sur le haut du dos et les épaules, genoux à peine fléchis : penche le buste en avant en gardant le dos plat, puis redresse-toi.",
    tips: ["Commence léger : barre seule ou un bâton.", "Dos plat, genoux légèrement fléchis et fixes.", "Descends jusqu’à sentir l’étirement derrière les cuisses, pas plus."] },
  "Extension lombaire": { views: [side([hyper(75), hyper(0)], ["Buste vers le sol", "Corps aligné"])],
    cue: "Allongé sur le banc à lombaires, hanches sur le coussin, pieds bloqués : descends le buste dos droit, puis remonte jusqu’à être aligné.",
    tips: ["Le coussin est juste sous le haut des hanches.", "Bras croisés sur la poitrine, dos droit.", "Remonte jusqu’à l’alignement, sans te cambrer au-dessus."] },
  "Rowing barre": { grip: "row", views: [
      side([rowSide(0, { eq: [bar(P => P.near.grip, 13, { top: true })] }), rowSide(1, { eq: [bar(P => P.near.grip, 13, { top: true })] })], ["Bras tendus", "Barre au nombril, coudes près du corps"]),
      front([bentF(0.55, { R: { wristAt: [138, 151], hand: 90 }, eq: [fbar(P => P.R.grip[1], { top: true })] }), bentF(0.55, { R: { wristAt: [138, 118], hand: 90, ls: { ua: 0.28, th: 0.85 } }, eq: [fbar(P => P.R.grip[1], { top: true })] })], ["Bras tendus", "Coudes près du corps"])],
    cue: "Buste penché à 45°, dos plat : tire la barre vers le nombril en gardant les coudes près du corps, puis redescends bras tendus.",
    tips: ["Genoux légèrement fléchis, buste penché à environ 45°, dos plat.", "Coudes près du corps (environ 45°), pas écartés.", "Serre les omoplates en haut, redescends sans arrondir le dos."] },
  "Rowing haltère": { views: [side([benchRow(0), benchRow(1)], ["Bras tendu", "Coude tiré vers l’arrière"])],
    cue: "Une main et un genou sur le banc, dos plat : tire l’haltère vers la hanche, coude près du corps, puis redescends.",
    tips: ["Dos plat, parallèle au sol.", "Tire le coude vers la hanche, pas vers l’épaule.", "Le buste ne tourne pas pendant le mouvement."] },
  "Rowing T-bar": { views: [side([tbar(0), tbar(1)], ["Barre entre les jambes, bras tendus", "Poignée à la poitrine"]),
      front([bentF(0.55, { R: { wristAt: [124, 150], hand: 90 }, eq: [raw(P => `<line class="fg-barline" x1="120" y1="${GROUND}" x2="120" y2="${(P.R.grip[1] + 8).toFixed(1)}"/>`), raw(P => `<circle class="fg-plate" cx="120" cy="${(P.R.grip[1] + 8).toFixed(1)}" r="12"/>`, { top: true })] }),
        bentF(0.55, { R: { wristAt: [124, 122], hand: 90, ls: { ua: 0.28, th: 0.85 } }, eq: [raw(P => `<line class="fg-barline" x1="120" y1="${GROUND}" x2="120" y2="${(P.R.grip[1] + 8).toFixed(1)}"/>`), raw(P => `<circle class="fg-plate" cx="120" cy="${(P.R.grip[1] + 8).toFixed(1)}" r="12"/>`, { top: true })] })], ["Barre entre les jambes", "Coudes serrés"])],
    cue: "Debout au-dessus de la barre, elle passe entre tes jambes : tire la poignée vers la poitrine en gardant les coudes près du corps, puis redescends.",
    tips: ["La barre passe entre les jambes, poignée en V dans les mains.", "Buste penché, dos plat, genoux légèrement fléchis.", "Coudes serrés le long du corps."] },
  "Tirage horizontal": { views: [side([seatedRow(0), seatedRow(1)], ["Bras tendus", "Poignée au ventre"])],
    cue: "Assis, pieds sur la plateforme, dos droit : tire la poignée vers le ventre en serrant les omoplates, sans basculer en arrière.",
    tips: ["Genoux légèrement fléchis, dos droit.", "Coudes près du corps, poignée vers le nombril.", "Le buste reste presque immobile : ce sont les bras et le dos qui tirent."] },
  "Rowing machine": { views: [side([machineRow(0), machineRow(1)], ["Bras tendus, poitrine sur le coussin", "Coudes tirés vers l’arrière"])],
    cue: "Assis, poitrine contre le coussin, poignées en main : tire les coudes vers l’arrière en serrant les omoplates, puis reviens bras tendus.",
    tips: ["Règle le siège pour avoir les poignées à hauteur de poitrine.", "La poitrine reste collée au coussin.", "Coudes près du corps, serre les omoplates en fin de mouvement."] },
  "Tirage vertical": { grip: "pro", views: [side([pulldown(0), pulldown(1)], ["Bras tendus", "Barre en haut de la poitrine"]), front([pulldownF(40, 0), pulldownF(40, 1)], ["Prise large", "Coudes vers le bas"])],
    cue: "Assis, cuisses calées sous les boudins : tire la barre jusqu’au haut de la poitrine en serrant les omoplates, puis remonte bras tendus.",
    tips: ["La poulie est juste au-dessus de toi : le câble descend droit.", "Poitrine sortie, léger recul du buste.", "Tire les coudes vers le bas, pas vers l’arrière."] },
  "Tirage vertical prise serrée": { grip: null, views: [side([pulldown(0), pulldown(1)], ["Bras tendus", "Poignée en haut de la poitrine"]), front([pulldownF(6, 0), pulldownF(6, 1)], ["Mains serrées", "Coudes le long du corps"])],
    cue: "Assis sous la poulie, poignée serrée en main : tire jusqu’au haut de la poitrine en gardant les coudes près du corps, puis remonte.",
    tips: ["Mains rapprochées sur la poignée en V.", "La poulie est au-dessus de toi, le câble descend droit.", "Coudes le long du corps, poitrine sortie."] },
  "Shrugs": { views: [side([shrugStand(0), shrugStand(1)], ["Épaules basses", "Épaules haussées"]),
      front([standF({ R: { ua: 86, fa: 90 }, eq: [fdb("end", { top: true })] }), standF({ shrug: 7, R: { ua: 86, fa: 90 }, eq: [fdb("end", { top: true })] })], ["Bras tendus", "Épaules vers les oreilles"])],
    cue: "Bras tendus, charges en main : monte les épaules vers les oreilles, marque une pause, puis redescends lentement.",
    tips: ["Bras tendus : ce ne sont pas les bras qui tirent.", "Monte droit vers les oreilles, sans rouler les épaules.", "Pause d’une seconde en haut."] }
});

/* ═══ Épaules ═══ */
const SH_Y = HIPY - 52;                                   // épaule d'une personne debout (x = 120)
const ohpS = up => stand({ near: up ? { ua: -93, fa: -91, hand: -90 } : { ua: 78, fa: -96, hand: -90 }, eq: [db(P => [P.near.grip, 0], "end", { top: true })] });
const ohpF = up => standF({ R: up ? { ua: -68, fa: -86, hand: -90 } : { ua: 16, fa: -88, hand: -90 }, eq: [fdb("across", { top: true })] });
// Développé Arnold. spin = rotation des poignets (0 : paumes vers soi, 1 : paumes vers l'avant) ; l'haltère la montre :
// de face la poignée gauche-droite raccourcit jusqu'à pointer vers nous (paumes face à face) puis revient ; de profil c'est l'inverse.
const spinDb = (P, c, front) => {
  const k = Math.abs(Math.cos(Math.PI * (P.spin || 0))), w = front ? k : 1 - k, h = 11 * w, r = v => v.toFixed(1);
  const end = w < 0.45 ? `<circle class="fg-plate" cx="${r(c[0])}" cy="${r(c[1])}" r="8"/><circle class="fg-hub" cx="${r(c[0])}" cy="${r(c[1])}" r="2.2"/>` : "";
  return `<g class="fg-eq">${end}${w >= 0.2 ? `<line class="fg-handle" x1="${r(c[0] - h)}" y1="${r(c[1])}" x2="${r(c[0] + h)}" y2="${r(c[1])}"/><rect class="fg-plate" x="${r(c[0] - h - 3)}" y="${r(c[1] - 9)}" width="6" height="18" rx="2"/><rect class="fg-plate" x="${r(c[0] + h - 3)}" y="${r(c[1] - 9)}" width="6" height="18" rx="2"/>` : ""}</g>`;
};
// De profil : départ coudes devant, puis bras ouverts sur le côté (haut du bras hors du plan, donc court), puis bras tendus.
const arnoldS = k => ({ hip: [120, 150], torso: -88, neck: -88, spin: [0, 1, 1][k], near: [{ ua: 20, fa: -98, hand: -90 }, { ua: 80, fa: -92, hand: -90, ls: { ua: 0.25 } }, { ua: -93, fa: -91, hand: -90 }][k],
  eq: [seat(104, 158, 1, 4), raw(P => spinDb(P, P.near.grip, false), { top: true })] });
const fixLegsSeated = p => ({ ...p, near: { th: 0, sh: 92, ft: 0, ...p.near } });
// De face (référence) : haltères devant le visage, coudes devant ; les bras s'ouvrent sur les côtés en tournant
// les poignets (position basse du développé militaire), puis poussée vers le haut, paumes vers l'avant.
const arnoldF = k => ({ view: "front", torso: -90, neck: -90, hip: [120, 150], spin: [0, 1, 1][k], R: { th: 90, sh: 90, ...[{ ua: 112, fa: -96, hand: -90, ls: { ua: 0.35, th: 0.3, sh: 0.86 } }, { ua: 12, fa: -88, hand: -90, ls: { th: 0.3, sh: 0.86 } }, { ua: -68, fa: -86, hand: -90, ls: { th: 0.3, sh: 0.86 } }][k] },
  eq: [fbench(158), raw(P => spinDb(P, P.R.grip, true) + spinDb(P, P.L.grip, true), { top: true })] });
const armsForward = (ls) => ({ ua: -4, fa: -4, hand: -4, ls });
const latS = up => stand({ near: up ? { ua: -8, fa: -6, hand: -6, ls: { ua: 0.42, fa: 0.42 } } : { ua: 92, fa: 90, hand: 90 }, eq: [db(P => [P.near.grip, up ? 90 : 90], "side", { top: true })] });
const latF = up => standF({ R: up ? { ua: 2, fa: -4, hand: -4 } : { ua: 86, fa: 90, hand: 90 }, eq: [fdb("end", { top: true })] });
const cableLat = up => ({ view: "front", torso: -90, neck: -90, hip: [120, HIPY], box: [30, 30, 200, GROUND], R: { th: 90, sh: 90, ...(up ? { ua: 2, fa: -4, hand: -4 } : { ua: 110, fa: 120, hand: 120 }) }, L: { ua: 100, fa: 95, hand: 90, th: 90, sh: 90 },
  eq: [raw(P => { const g = P.R.grip; return `<g class="fg-eq"><rect class="fg-frame" x="36" y="-30" width="10" height="${GROUND + 30}"/><rect class="fg-stack" x="37.5" y="${GROUND - 58}" width="7" height="50"/><circle class="fg-pulley" cx="50" cy="${GROUND - 8}" r="4.4"/><line class="fg-cable" x1="50" y1="${GROUND - 8}" x2="${g[0].toFixed(1)}" y2="${g[1].toFixed(1)}"/></g>`; })] });
const rearS = up => ({ hip: [92, 160], torso: -24, neck: -24, near: { ankleAt: [146, ANK], ft: 0, kneeBend: 1, ...(up ? { ua: 86, fa: 86, hand: 86, ls: { ua: 0.4, fa: 0.4 } } : { ua: 92, fa: 90, hand: 90 }) },
  eq: [bench(52, 120, 168), db(P => [P.near.grip, 90], "side", { top: true })] });
const rearF = up => ({ view: "front", torso: -90, neck: -90, tls: 0.4, hip: [120, 162], R: { th: 70, sh: 95, ls: { th: 0.4, sh: 0.5 }, ...(up ? { ua: 4, fa: 2, hand: 2 } : { ua: 92, fa: 92, hand: 90 }) },
  eq: [fbench(168), fdb("end", { top: true })] });
const uprowS = up => stand({ near: up ? { wristAt: [130, SH_Y + 8], hand: 0, elbowBend: 1, ls: { ua: 0.45 } } : { ua: 94, fa: 88, hand: 90 }, eq: [bar(P => P.near.grip, 13, { top: true })] });
// En haut : coudes écartés, plus hauts que les mains (au-dessus des épaules), mains sous le menton.
const uprowF = up => standF({ R: up ? { ua: -12, fa: 150, hand: 90, ls: { ua: 0.6 } } : { wristAt: [130, 124], hand: 90 }, eq: [fbar(P => P.R.grip[1], { top: true })] });
// Fin du face pull : coude haut à hauteur d'épaule, écarté (donc raccourci de profil), mains qui tirent la corde vers le visage.
const facepullS = back => stand({ near: back ? { ua: 0, fa: -38, hand: -30, ls: { ua: -0.3 } } : { ua: -8, fa: -8, hand: -8 }, eq: [cable(186, SH_Y - 12, "rope")] });

Object.assign(HOW, {
  "Développé militaire": { views: [side([ohpS(0), ohpS(1)], ["Haltères à hauteur des épaules", "Bras tendus au-dessus de la tête"]), front([ohpF(0), ohpF(1)], ["Coudes sous les poignets", "Bras tendus"])],
    cue: "Debout, un haltère dans chaque main à hauteur des épaules, paumes vers l’avant : pousse au-dessus de la tête sans cambrer le dos, puis redescends.",
    tips: ["Départ : haltères à hauteur des oreilles, coudes sous les poignets.", "Monte jusqu’aux bras presque tendus, sans cogner les haltères.", "Abdos et fessiers serrés : le dos ne se creuse pas."] },
  "Développé Arnold": { views: [side([0, 1, 2].map(k => fixLegsSeated(arnoldS(k))), ["Paumes vers toi, coudes devant", "Bras ouverts sur les côtés", "Paumes vers l’avant, bras tendus"], [0, 1, 2, 1]),
      front([0, 1, 2].map(arnoldF), ["Paumes vers toi, coudes devant", "Bras ouverts en tournant les poignets", "Poussée : paumes vers l’avant, bras tendus"], [0, 1, 2, 1])],
    cue: "Assis, haltères devant le visage paumes vers toi : pousse vers le haut en tournant les poignets pour finir paumes vers l’avant, puis redescends en tournant dans l’autre sens.",
    tips: ["Assis sur un banc, dossier droit.", "En bas : paumes vers toi, coudes devant le corps.", "La rotation se fait pendant la montée : en haut, paumes vers l’avant."] },
  "Élévations latérales": { views: [side([latS(0), latS(1)], ["Bras le long du corps", "Bras à l’horizontale sur les côtés"]), front([latF(0), latF(1)], ["Bras le long du corps", "Bras à l’horizontale"])],
    cue: "Bras presque tendus : monte les haltères sur les côtés jusqu’à l’horizontale, sans hausser les épaules, puis redescends lentement.",
    tips: ["Charges légères, coudes légèrement fléchis.", "Monte jusqu’à l’horizontale, pas plus haut.", "Épaules basses : ce ne sont pas les trapèzes qui travaillent."] },
  "Élévations latérales à la poulie": { views: [front([cableLat(0), cableLat(1)], ["Poignée devant la hanche opposée", "Bras à l’horizontale"])],
    cue: "Poulie basse à côté de toi, poignée tenue avec la main opposée : monte le bras sur le côté jusqu’à l’horizontale, puis redescends lentement.",
    tips: ["Le câble passe devant le corps.", "Bras presque tendu, monte jusqu’à l’horizontale.", "Fais toutes les répétitions d’un côté, puis change."] },
  "Élévations frontales": { views: [side([stand({ near: { ua: 92, fa: 88, hand: 88 }, eq: [db(P => [P.near.grip, 0], "end", { top: true })] }), stand({ near: { ua: -4, fa: -4, hand: -4 }, eq: [db(P => [P.near.grip, 0], "end", { top: true })] })], ["Haltères devant les cuisses", "Bras devant, à hauteur des épaules"]),
      front([standF({ R: { wristAt: [134, 128], hand: 90 }, eq: [fdb("across", { top: true })] }), standF({ R: { ua: -80, fa: -80, hand: -80, ls: { ua: 0.25, fa: 0.25 } }, eq: [fdb("across", { top: true })] })], ["Haltères à l’horizontale", "Bras devant"])],
    cue: "Haltères tenues à l’horizontale devant les cuisses : monte les bras presque tendus devant toi jusqu’à hauteur des épaules, puis redescends lentement.",
    tips: ["Haltères tenues à l’horizontale, paumes vers le sol.", "Monte jusqu’à hauteur des yeux maximum.", "Sans élan : le buste ne bouge pas."] },
  "Oiseau (arrière d’épaule)": { views: [side([rearS(0), rearS(1)], ["Assis penché, bras pendants", "Bras ouverts sur les côtés"]), front([rearF(0), rearF(1)], ["Bras pendants", "Bras à l’horizontale"])],
    cue: "Assis au bout d’un banc, buste penché en avant sur les cuisses, dos plat : ouvre les bras sur les côtés jusqu’à l’horizontale, puis redescends.",
    tips: ["Buste penché presque sur les cuisses (ou appuyé sur un banc incliné).", "Coudes légèrement fléchis et fixes.", "Charges légères : pense « écarter », pas « tirer »."] },
  "Rowing menton": { views: [side([uprowS(0), uprowS(1)], ["Barre contre les cuisses", "Barre sous le menton, coudes hauts"]), front([uprowF(0), uprowF(1)], ["Mains à largeur d’épaules", "Coudes plus hauts que les mains"])],
    cue: "Barre contre les cuisses : monte-la le long du corps en levant les coudes sur les côtés, jusqu’en bas de la poitrine, puis redescends.",
    tips: ["Mains à largeur d’épaules (pas collées).", "Les coudes montent plus haut que les mains.", "Arrête-toi au bas de la poitrine."] },
  "Face pull": { views: [side([facepullS(0), facepullS(1)], ["Bras tendus vers la poulie", "Corde vers le visage, coudes hauts"]),
      front([standF({ R: { ua: -20, fa: -60, hand: -60, ls: { ua: 0.12, fa: 0.2 } } }), standF({ R: { ua: 0, fa: -135, hand: -120 } })], ["Bras tendus vers la poulie", "Coudes hauts et écartés, mains au visage"])],
    cue: "Poulie à hauteur du visage, corde en main : tire vers les yeux en écartant les mains, coudes hauts, puis reviens bras tendus.",
    tips: ["Coudes à hauteur des épaules ou plus haut.", "Écarte les mains de chaque côté de la tête en fin de mouvement.", "Charge légère, mouvement lent."] },
  "Push press": { views: [side([stand({ near: rack, eq: [bar(P => P.near.grip, 13, { top: true })] }), { hip: [114, 124], torso: -88, neck: -88, near: { ankleAt: [124, ANK], ft: 0, ...rack }, eq: [bar(P => P.near.grip, 13, { top: true })] },
      stand({ near: { ua: -88, fa: -88, hand: -90 }, eq: [bar(P => P.near.grip, 13, { top: true })] })], ["Barre sur les épaules", "Petite flexion des genoux", "Poussée au-dessus de la tête"], [0, 1, 2, 1])],
    cue: "Barre sur l’avant des épaules : fléchis un peu les genoux, puis pousse avec les jambes et termine avec les bras pour amener la barre au-dessus de la tête.",
    tips: ["Petite flexion des genoux, buste droit.", "L’élan des jambes lance la barre, les bras finissent.", "Bras verrouillés en haut, barre au-dessus de la nuque."] }
});
HOW["Développé épaules haltères"] = HOW["Développé militaire"];   // ancien nom (doublon supprimé de la bibliothèque)

/* ═══ Pectoraux ═══ */
const BT = 163;                                            // dessus du banc
const lieHip = [114, BT - 13];
// Couché sur le banc (tête à gauche), pieds au sol. deg > 0 : incliné, deg < 0 : décliné.
const benchLie = (deg, arms, eq, o = {}) => {
  const t = 180 + deg, sh = shOf(lieHip, t);
  const legs = deg < 0 ? { th: -35, sh: 70, ft: 20, ankleAt: null } : { ankleAt: [152, ANK], ft: 0, kneeBend: 1 };
  return merge({ hip: lieHip, torso: t, neck: t + (deg > 0 ? -8 : 2), near: { ...legs, ...arms(sh, t) } }, { eq, ...o });
};
// Point au-dessus de la poitrine (côté ventre) à la distance k de l'épaule, décalé de « along » vers les hanches.
const overChest = (sh, t, k, along = 6) => add(add(sh, [-Math.sin(rad(t)) * k, Math.cos(rad(t)) * k]), [Math.cos(rad(t + 180)) * along, Math.sin(rad(t + 180)) * along]);
// Incliné : barre posée sur le haut de la poitrine, puis poussée verticale jusqu'à l'aplomb des épaules.
const inclineArms = down => sh => ({ wristAt: add(sh, down ? [8, -6.5] : [8, -52]), hand: -90, elbowBend: -1, ls: { ua: down ? 0.72 : 1 }, track: 1 });
const pressArms = (down, grip = 0) => (sh, t) => { const b = overChest(sh, t, down ? 15 : 58, down ? 8 : 4); return { wristAt: add(b, [0, 5.5]), hand: -90, elbowBend: -1, ls: { ua: down ? 0.72 - grip : 1 } }; };
// Prise serrée : coudes serrés qui descendent vers le bas du corps, le long du buste (et non vers la tête) ; poussée verticale.
const closeArms = down => (sh, t) => { const b = overChest(sh, t, down ? 15 : 58, down ? 14 : 4); return { wristAt: add(b, [0, 5.5]), hand: -90, elbowBend: -1, ls: { ua: down ? 0.78 : 1 }, track: 1 }; };
const benchEq = (deg, tool) => [bench(18, 150, BT, deg, 118), ...(deg < 0 ? [roller(P => add(P.near.ankle, [-2, -7]), 5.5, { top: true })] : []),
  tool === "db" ? db(P => [P.near.grip, 0], "end", { top: true }) : bar(P => P.near.grip, 13, { top: true })];
// Vue depuis les pieds : buste raccourci, tête derrière, bras vers le plafond.
const benchF = (down, x = 150, tool = "bar", o = {}) => ({ view: "front", nolegs: true, headBehind: true, torso: -90, neck: -90, tls: 0.3, hip: [120, 158],
  R: { wristAt: down ? [x, 122] : [x - 8, 90], hand: -90, elbowBend: -1, ls: { ua: down ? 0.85 : 1 } }, ...o,
  eq: [fbench(160, o.back), tool === "db" ? fdb("across", { top: true }) : fbar(P => P.R.grip[1], { top: true })] });
const incF = (down, tool) => benchF(down, 150, tool, { hip: [120, 158], tls: 0.62, back: 118 });
const BENCH_TIPS = ["Pieds à plat au sol, fesses et omoplates collées au banc.", "Coudes à environ 45° du buste, pas écartés à 90°.", "En bas, avant-bras verticaux et coudes à angle droit (90°).", "Débutant : commence avec la barre seule et fais-toi surveiller."];
// Écarté : en haut, bras quasi tendus au-dessus de la poitrine (légère flexion fixe des coudes).
// De profil, les bras s'ouvrent sur les côtés (hors du plan) : ils paraissent seulement plus courts en bas.
const flyArms = open => () => open ? { ua: -86, fa: -94, hand: -92, ls: { ua: 0.12, fa: 0.12 } } : { ua: -86, fa: -94, hand: -92 };
// Écarté vu de dessus (animation) : allongé sur le banc, tête en haut. Bras ouverts sur les côtés, puis levés vers
// le plafond : vus d'en haut ils raccourcissent jusqu'à se rejoindre au-dessus de la poitrine (sans tourner).
const flyTop = open => ({ view: "front", noShadow: true, torso: -90, neck: -90, hip: [120, HIPY], R: { th: 88, sh: 90, ua: 2, fa: -6, hand: 90, ls: open ? {} : { ua: -0.2, fa: -0.2 }, fore: 1 },
  eq: [raw(P => `<rect class="fg-pad" x="104" y="${(P.head[1] - 14).toFixed(1)}" width="32" height="${(P.hip[1] + 18 - P.head[1] + 14).toFixed(1)}" rx="6"/>`),
    raw(P => [P.R, P.L].map(q => { const c = q.wrist; return `<g class="fg-eq"><line class="fg-handle" x1="${c[0].toFixed(1)}" y1="${(c[1] - 9).toFixed(1)}" x2="${c[0].toFixed(1)}" y2="${(c[1] + 9).toFixed(1)}"/><rect class="fg-plate" x="${(c[0] - 8).toFixed(1)}" y="${(c[1] - 14).toFixed(1)}" width="16" height="6" rx="2"/><rect class="fg-plate" x="${(c[0] - 8).toFixed(1)}" y="${(c[1] + 8).toFixed(1)}" width="16" height="6" rx="2"/></g>`; }).join(""), { top: true })] });
const cableFly = (py, level) => {
  const endY = { haute: 136, moyenne: 88, basse: 62 }[level], startY = { haute: 40, moyenne: 80, basse: 150 }[level];
  // Poulies moyenne et basse : bras quasi tendus (légère flexion constante), mains qui se rejoignent devant la poitrine
  // (bras dirigés vers nous, donc raccourcis sur le dessin).
  // (un raccourci négatif = le bras passe devant le corps : la main arrive à l'intérieur de l'épaule, sans jamais descendre).
  // Poulie basse : les mains montent devant le corps et se rejoignent sous le menton, sans se croiser.
  const arms = { moyenne: [{ ua: 4, fa: -4, fore: 1 }, { ua: -20, fa: -26, ls: { ua: -0.33, fa: -0.33 }, fore: 1 }], basse: [{ ua: 62, fa: 56, fore: 1 }, { ua: 36, fa: 42, hand: -90, ls: { ua: -0.33, fa: -0.33 }, fore: 1 }] }[level];
  if (arms) return arms.map(r => standF({ box: [40, -10, 200, GROUND], R: { hand: r.fa, ...r }, eq: [fcables(py)] }));
  return [
    standF({ box: [40, -10, 200, GROUND], R: { wristAt: [180, startY], hand: 0, elbowBend: 1 }, eq: [fcables(py)] }),
    standF({ box: [40, -10, 200, GROUND], R: { wristAt: [127, endY], hand: 90, elbowBend: 1 }, eq: [fcables(py)] })];
};
const cableFlySide = level => {
  const a = { haute: [-40, 60], moyenne: [180, 0], basse: [150, -10] }[level];
  // Poulie moyenne : le bras reste à hauteur d'épaule, de l'arrière (raccourci négatif) vers l'avant.
  const back = level === "moyenne" ? { ua: 0, fa: -6, hand: -6, ls: { ua: -0.45, fa: -0.45 } } : { ua: a[0], fa: a[0] - 10, hand: a[0] - 10, ls: { ua: 0.5, fa: 0.5 } };
  return [stand({ torso: -84, near: { ...back, ankleAt: [138, ANK] }, far: { ankleAt: onToes(104, 20), ft: 20 } }),
    stand({ torso: -84, near: { ua: a[1], fa: a[1] - 6, hand: a[1] - 6, ankleAt: [138, ANK] }, far: { ankleAt: onToes(104, 20), ft: 20 } })];
};
// Bras fermés : le haut du bras vient vers nous (raccourci négatif = il passe devant), sans tourner sur lui-même.
const pecDeckF = close => ({ view: "front", torso: -90, neck: -90, hip: [120, 150], R: { th: 90, sh: 90, ls: { th: 0.3, sh: 0.86, ...(close ? { ua: -0.3 } : {}) }, ua: 0, fa: -90, hand: -90, fore: 1 },
  eq: [fbench(158), raw(P => [P.R, P.L].map(s => `<rect class="fg-pad" x="${(s.wrist[0] - (s.k > 0 ? -3 : 9)).toFixed(1)}" y="${(s.wrist[1] - 4).toFixed(1)}" width="6" height="30" rx="3"/>`).join(""))] });
const chestPressS = out => ({ hip: [100, 142], torso: -92, neck: -90, near: { th: 0, sh: 92, ft: 0, wristAt: out ? [156, 88] : [112, 92], hand: -90, ls: { ua: out ? 1 : 0.8 } },
  eq: [seat(86, 150, 1, 4), raw(P => { const g = P.near.grip; return `<line class="fg-rail" x1="${g[0].toFixed(1)}" y1="${(g[1] - 8).toFixed(1)}" x2="${g[0].toFixed(1)}" y2="${(g[1] + 8).toFixed(1)}"/>`; }, { top: true })] });
const chestPressF = out => ({ view: "front", torso: -90, neck: -90, hip: [120, 150], R: { th: 90, sh: 90, ls: { th: 0.3, sh: 0.86, ...(out ? { ua: 0.3, fa: 0.3 } : {}) }, ...(out ? { ua: 170, fa: 170, hand: -90 } : { ua: 40, fa: -80, hand: -90 }) }, eq: [fbench(158)] });

Object.assign(HOW, {
  "Développé couché": { grip: "bench", views: [side([benchLie(0, pressArms(1), benchEq(0)), benchLie(0, pressArms(0), benchEq(0))], ["Barre au bas des pectoraux", "Bras tendus"]),
      front([benchF(1), benchF(0)], ["Avant-bras verticaux, coudes à 90°", "Bras tendus"])],
    cue: "Allongé sur un banc plat, omoplates serrées, pieds au sol : descends la barre au bas des pectoraux, puis pousse vers le haut.", tips: BENCH_TIPS },
  "Développé couché haltères": { views: [side([benchLie(0, pressArms(1), benchEq(0, "db")), benchLie(0, pressArms(0), benchEq(0, "db"))], ["Haltères au niveau de la poitrine", "Bras tendus"]),
      front([benchF(1, 150, "db"), benchF(0, 142, "db")], ["Coudes à 90°", "Haltères au-dessus des épaules"])],
    cue: "Allongé sur un banc plat, un haltère dans chaque main : descends-les sur les côtés de la poitrine, puis pousse vers le haut.",
    tips: ["Banc à plat, pieds bien à plat au sol.", "Pars bras tendus, paumes tournées vers tes pieds.", "Descends jusqu’aux coudes à 90°, coudes à environ 45° du buste.", "Remonte en rapprochant les haltères, sans les cogner."] },
  "Développé incliné": { grip: "bench", views: [side([benchLie(35, inclineArms(1), benchEq(35)), benchLie(35, inclineArms(0), benchEq(35))], ["Barre en haut des pectoraux", "Bras tendus"]),
      front([incF(1), incF(0)], ["Coudes à 90°", "Bras tendus"])],
    cue: "Sur un banc incliné à 30–45° : descends la barre sur le haut des pectoraux, puis pousse vers le haut.",
    tips: ["Dossier relevé à 30–45° (2 ou 3 crans).", "Barre descendue sur le haut des pectoraux, sous les clavicules.", "Coudes à environ 45° du buste ; en bas, coudes à 90°."] },
  "Développé incliné haltères": { views: [side([benchLie(35, inclineArms(1), benchEq(35, "db")), benchLie(35, inclineArms(0), benchEq(35, "db"))], ["Haltères en haut des pectoraux", "Bras tendus"]),
      front([incF(1, "db"), incF(0, "db")], ["Coudes à 90°", "Bras tendus"])],
    cue: "Sur un banc incliné à 30–45°, un haltère dans chaque main : descends-les au niveau du haut des pectoraux, puis pousse vers le haut.",
    tips: ["Dossier relevé à 30–45°.", "Paumes vers tes pieds, coudes à environ 45° du buste.", "Descends jusqu’aux coudes à 90°, remonte en rapprochant les haltères."] },
  "Développé décliné": { grip: "bench", views: [side([benchLie(-18, pressArms(1), benchEq(-18)), benchLie(-18, pressArms(0), benchEq(-18))], ["Barre au bas des pectoraux", "Bras tendus"])],
    cue: "Sur un banc décliné, pieds bloqués sous les boudins : descends la barre au bas des pectoraux, puis pousse vers le haut.",
    tips: ["Tête plus basse que les hanches (15–30°), pieds bloqués.", "Barre descendue sur le bas des pectoraux.", "Fais-toi aider pour prendre et reposer la barre."] },
  "Développé couché prise serrée": { grip: "close", views: [side([benchLie(0, closeArms(1), benchEq(0)), benchLie(0, closeArms(0), benchEq(0))], ["Barre au bas des pectoraux, coudes le long du buste", "Bras tendus"]),
      front([benchF(1, 138, "bar", { R: { wristAt: [138, 122], hand: -90, elbowBend: -1, ls: { ua: 0.5 } } }), benchF(0, 146)], ["Mains à largeur d’épaules, coudes serrés", "Bras tendus"])],
    cue: "Mains à largeur d’épaules sur la barre : descends au bas des pectoraux en gardant les coudes près du corps, puis pousse.",
    tips: ["Mains à largeur d’épaules, pas plus serré.", "Coudes près du corps pendant la descente.", "Travaille surtout les triceps."] },
  "Écarté haltères": { animViews: ["De profil", view("Vue de dessus", [flyTop(1), flyTop(0)], ["Bras ouverts", "Haltères au-dessus de la poitrine"])], views: [side([benchLie(0, flyArms(1), benchEq(0, "db")), benchLie(0, flyArms(0), benchEq(0, "db"))], ["Bras ouverts", "Haltères au-dessus de la poitrine"]),
      front([benchF(1, 150, "db", { R: { ua: 4, fa: -12, hand: -12 } }), benchF(0, 128, "db", { R: { wristAt: [128, 92], hand: -90, elbowBend: -1 } })], ["Bras ouverts, coudes légèrement pliés", "Mains qui se rejoignent"])],
    cue: "Allongé, coudes légèrement fléchis : ouvre les bras sur les côtés sans descendre plus bas que le banc, puis referme au-dessus de la poitrine.",
    tips: ["Coudes légèrement fléchis et fixes.", "Ouvre jusqu’à sentir l’étirement des pectoraux, pas plus bas que le banc.", "Referme comme pour faire un câlin à un tronc d’arbre."] },
  "Écarté poulie haute": { views: [front(cableFly(8, "haute"), ["Bras ouverts vers les poulies hautes", "Mains qui se rejoignent devant les hanches"]), side(cableFlySide("haute"), ["Bras en haut", "Mains devant les hanches"])],
    cue: "Poulies réglées en haut : ramène les mains vers le bas et l’avant jusqu’à ce qu’elles se rejoignent devant les hanches. Cible le bas des pectoraux.",
    tips: ["Un pied devant l’autre, buste légèrement penché.", "Coudes légèrement fléchis et fixes.", "Poulie haute = bas des pectoraux."] },
  "Écarté poulie moyenne": { views: [front(cableFly(SH_Y + 16, "moyenne"), ["Bras ouverts à hauteur d’épaules", "Mains qui se rejoignent devant la poitrine"]), side(cableFlySide("moyenne"), ["Bras ouverts", "Mains devant la poitrine"])],
    cue: "Poulies à hauteur d’épaules : ramène les mains devant la poitrine en gardant les bras à l’horizontale. Cible le milieu des pectoraux.",
    tips: ["Bras à hauteur d’épaules pendant tout le mouvement.", "Coudes légèrement fléchis et fixes.", "Poulie moyenne = milieu des pectoraux."] },
  "Écarté poulie basse": { views: [front(cableFly(GROUND - 10, "basse"), ["Bras ouverts vers les poulies basses", "Mains qui se rejoignent à hauteur du visage"]), side(cableFlySide("basse"), ["Bras en bas", "Mains devant le visage"])],
    cue: "Poulies réglées en bas : ramène les mains vers le haut et l’avant jusqu’à ce qu’elles se rejoignent à hauteur du menton. Cible le haut des pectoraux.",
    tips: ["Buste droit, un pied devant l’autre.", "Coudes légèrement fléchis, monte en arc de cercle.", "Poulie basse = haut des pectoraux."] },
  "Pec deck (butterfly)": { views: [front([pecDeckF(0), pecDeckF(1)], ["Avant-bras contre les coussins", "Coussins qui se touchent"])],
    cue: "Assis sur la machine, dos collé, avant-bras contre les coussins : ramène les bras devant toi jusqu’à ce que les coussins se touchent, puis rouvre lentement.",
    tips: ["Règle le siège pour avoir les coudes à hauteur des épaules.", "Bras pliés à 90° contre les coussins.", "Rouvre lentement sans aller trop loin en arrière."] },
  "Presse pectoraux": { views: [side([chestPressS(0), chestPressS(1)], ["Poignées à la poitrine", "Bras tendus devant"]), front([chestPressF(0), chestPressF(1)], ["Coudes à hauteur de poitrine", "Bras tendus vers l’avant"])],
    cue: "Assis sur la machine, dos collé, poignées à hauteur de poitrine : pousse devant toi sans verrouiller les coudes, puis reviens lentement.",
    tips: ["Règle le siège : poignées à hauteur du milieu de la poitrine.", "Dos et tête collés au dossier.", "Pousse jusqu’aux bras presque tendus."] },
  "Pull-over": { views: [side([benchLie(0, () => ({ ua: 176, fa: 188, hand: 188 }), [bench(18, 150, BT), db(P => [P.near.grip, 90], "side", { top: true })]),
      // En haut : bras quasi tendus au-dessus de la poitrine, coudes légèrement fléchis vers les pieds (jamais vers la tête).
      benchLie(0, () => ({ ua: -80, fa: -98, hand: -95 }), [bench(18, 150, BT), db(P => [P.near.grip, 0], "side", { top: true })])], ["Haltère derrière la tête", "Haltère au-dessus de la poitrine"])],
    cue: "Allongé, un haltère tenu à deux mains, bras presque tendus : descends-le derrière la tête, puis ramène-le au-dessus de la poitrine.",
    tips: ["Coudes légèrement fléchis et fixes.", "Descends jusqu’à sentir l’étirement, sans douleur à l’épaule.", "Bassin et bas du dos restent posés sur le banc."] }
});
HOW["Écarté à la poulie"] = HOW["Écarté poulie haute"];   // ancien nom

/* ═══ Bras ═══ */
const curlS = (up, eq, o = {}) => stand(merge({ near: up ? { ua: 86, fa: -72, hand: -62 } : { ua: 93, fa: 86, hand: 88 }, eq }, o));
const curlF = (up, eq, o = {}) => standF({ ...o, R: up ? { ua: 88, fa: -92, hand: -90, ls: { fa: 0.35 } } : { ua: 88, fa: 90, hand: 90 }, eq });
const inclCurl = up => ({ hip: [116, 150], torso: -125, neck: -110, near: { ankleAt: [156, ANK], ft: 0, kneeBend: 1, ua: 90, fa: up ? -60 : 90, hand: up ? -60 : 90 },
  eq: [bench(40, 156, 158, 55, 118), db(P => [P.near.grip, 0], "end", { top: true })] });
// En bas, on s'arrête un peu avant l'extension complète (avant-bras à 15° du bras, jamais au-delà).
const preacher = up => ({ hip: [96, 150], torso: -80, neck: -80, near: { th: 0, sh: 92, ft: 0, ua: 40, fa: up ? -100 : 25, hand: up ? -100 : 30 },
  eq: [box(74, 158, 34, 52), raw(P => { const n = [Math.cos(rad(130)), Math.sin(rad(130))], a = add(P.sh, [n[0] * 10 + 3, n[1] * 10 + 3]), b = add(P.near.elbow, [n[0] * 8, n[1] * 8]);
    return `<line class="fg-padline" x1="${a[0].toFixed(1)}" y1="${a[1].toFixed(1)}" x2="${b[0].toFixed(1)}" y2="${b[1].toFixed(1)}"/><line class="fg-rail" x1="${((a[0] + b[0]) / 2).toFixed(1)}" y1="${((a[1] + b[1]) / 2 + 6).toFixed(1)}" x2="${((a[0] + b[0]) / 2).toFixed(1)}" y2="${GROUND}"/>`; }, { mid: true }),
    bar(P => P.near.grip, 10, { top: true })] });
// Avant-bras posé à plat sur la cuisse, poignet juste au-delà du genou.
const wristCurl = up => ({ hip: [96, 158], torso: -35, neck: -20, near: { th: 0, sh: 90, ft: 0, ua: 130.9, fa: -2, hand: up ? -45 : 55 },
  eq: [bench(40, 120, 166), bar(P => P.near.grip, 9, { top: true })] });
const skull = up => benchLie(0, () => ({ ua: -100, fa: up ? -100 : 150, hand: up ? -100 : 150 }), [bench(18, 150, BT), bar(P => P.near.grip, 13, { top: true })]);
const ohExt = up => stand({ near: { ua: -102, fa: up ? -96 : 120, hand: up ? -96 : 120 }, eq: [db(P => [add(P.near.grip, up ? [0, -6] : [-4, 4]), (up ? -96 : 120) - 90], "side", { top: true })] });
const ohExtF = up => standF({ R: up ? { ua: -84, fa: -96, hand: -120 } : { ua: -76, fa: 104, hand: 150, ls: { fa: 0.5 } }, eq: [db(P => [[120, P.R.grip[1] - (up ? 10 : 8)], 0], "side", { top: !!up })] });
const pushdownS = down => stand({ torso: -86, near: { ua: 92, fa: down ? 88 : -36, hand: down ? 88 : -36 }, eq: [cable(184, 12, "rope")] });
const pushdownF = down => standF({ R: down ? { ua: 92, fa: 96, hand: 96 } : { ua: 92, fa: -94, hand: -94, ls: { fa: 0.4 } },
  eq: [raw(P => `<line class="fg-cable" x1="120" y1="-40" x2="120" y2="${(P.R.grip[1] - 8).toFixed(1)}"/><path class="fg-rope" d="M120 ${(P.R.grip[1] - 8).toFixed(1)}L${P.R.grip[0].toFixed(1)} ${P.R.grip[1].toFixed(1)}M120 ${(P.R.grip[1] - 8).toFixed(1)}L${P.L.grip[0].toFixed(1)} ${P.L.grip[1].toFixed(1)}"/>`, { top: true })] });
const kickback = up => ({ hip: [112, 114], torso: -10, neck: -14, near: { th: 96, sh: 88, ft: 0, ua: 172, fa: up ? 172 : 90, hand: up ? 172 : 90 },
  far: { ua: 97, fa: 93, hand: 0, h: "flat", th: 92, sh: 180, ft: 160 }, farWorks: false, eq: [bench(62, 196, 167), db(P => [P.near.grip, up ? 172 : 90], "side", { mid: true })] });
const HAMMER = { cue: "Coudes collés au corps, pouces vers le haut : monte les haltères sans balancer, puis redescends lentement.",
  tips: ["Prise marteau : pouces vers le haut pendant tout le mouvement.", "Coudes fixes le long du corps.", "Sans élan : si tu balances, allège les charges."] };

Object.assign(HOW, {
  "Curl barre": { views: [side([curlS(0, [bar(P => P.near.grip, 11, { top: true })]), curlS(1, [bar(P => P.near.grip, 11, { top: true })])], ["Bras tendus", "Barre aux épaules, coudes fixes"]),
      front([curlF(0, [fbar(P => P.R.grip[1], { top: true, ez: 1 })]), curlF(1, [fbar(P => P.R.grip[1], { top: true, ez: 1 })])], ["Barre EZ, mains à largeur d’épaules", "Coudes le long du corps"])],
    cue: "Barre EZ en main, paumes vers l’avant, coudes collés au corps : monte la barre sans balancer, puis redescends lentement.",
    tips: ["Barre EZ (coudée) : plus confortable pour les poignets.", "Seuls les avant-bras bougent, les coudes restent le long du corps.", "Pas d’élan avec le dos."] },
  "Curl haltères": { views: [side([curlS(0, [db(P => [P.near.grip, 90], "side", { mid: true })]), curlS(1, [db(P => [P.near.grip, 0], "end", { top: true })])], ["Pouces vers l’avant", "Paumes vers les épaules"]),
      front([curlF(0, [fdb("end", { top: true })]), curlF(1, [fdb("across", { top: true })])], ["Paumes face au corps", "Rotation : paumes vers le haut"])],
    cue: "Haltères le long du corps, paumes face aux cuisses : monte en tournant le poignet pour finir paumes vers les épaules, puis redescends en tournant dans l’autre sens.",
    tips: ["Supination : le poignet tourne pendant la montée (paumes vers le haut en haut).", "Coudes fixes le long du corps.", "Monte et descends lentement, sans élan."] },
  // Prise neutre : la poignée reste perpendiculaire à l'avant-bras (elle suit la main), l'haltère ne se retourne jamais.
  "Curl marteau": { anim: "De profil", views: [side([curlS(0, [db(P => [P.near.grip, P.near.hand], "side", { top: true })], { box: [80, 40, 196, GROUND] }), curlS(1, [db(P => [P.near.grip, P.near.hand], "side", { top: true })])], ["Bras tendus", "Pouces vers le haut"]),
      front([curlF(0, [fdb("end", { top: true })]), curlF(1, [fdb("end", { top: true })])], ["Paumes face au corps", "Pouces vers le haut"])], ...HAMMER },
  "Curl à la poulie": { views: [side([curlS(0, [cable(186, GROUND - 8, "bar")], { near: { ua: 92, fa: 76, hand: 76 } }), curlS(1, [cable(186, GROUND - 8, "bar")])], ["Bras tendus vers la poulie", "Barre aux épaules"])],
    cue: "Face à la poulie basse, barre en main : monte la barre vers les épaules en gardant les coudes fixes, puis redescends lentement.",
    tips: ["Un pas en arrière pour que le câble reste tendu en bas.", "Coudes collés au corps.", "La tension du câble reste constante : descends lentement."] },
  "Curl pupitre": { views: [side([preacher(0), preacher(1)], ["Bras presque tendus sur le pupitre", "Barre vers les épaules"])],
    cue: "Assis, l’arrière des bras posé sur le pupitre : monte la barre vers les épaules, puis redescends lentement sans tendre brutalement.",
    tips: ["Aisselles calées en haut du pupitre.", "L’arrière des bras reste collé au coussin.", "Garde un léger pli du coude en bas."] },
  "Curl incliné": { views: [side([inclCurl(0), inclCurl(1)], ["Bras qui pendent derrière le buste", "Haltères vers les épaules"])],
    cue: "Assis sur un banc incliné, bras qui pendent derrière le buste : monte les haltères sans avancer les coudes, puis redescends lentement.",
    tips: ["Banc incliné à 45–60°, dos et tête collés au dossier.", "Bras verticaux au départ, derrière le buste : les coudes ne bougent pas.", "Charge plus légère qu’au curl debout."] },
  "Curl poignets": { views: [side([wristCurl(0), wristCurl(1)], ["Poignets vers le bas", "Poignets enroulés vers le haut"])],
    cue: "Assis, avant-bras posés sur les cuisses, poignets dans le vide, paumes vers le haut : enroule les poignets vers le haut, puis redescends.",
    tips: ["Avant-bras posés à plat sur les cuisses, poignets au-delà des genoux.", "Seuls les poignets bougent.", "Charge légère, beaucoup de répétitions."] },
  "Barre au front": { views: [side([skull(0), skull(1)], ["Barre près du front", "Bras tendus"])],
    cue: "Allongé sur un banc, barre tenue bras tendus au-dessus du visage : plie les coudes pour descendre la barre vers le front, puis tends les bras.",
    tips: ["Mains à largeur d’épaules (barre droite ou EZ).", "Les coudes restent fixes, pointés vers le plafond.", "Descends lentement vers le front, sans le toucher."] },
  "Extension triceps nuque": { views: [side([ohExt(0), ohExt(1)], ["Haltère derrière la tête", "Bras tendus vers le haut"]), front([ohExtF(0), ohExtF(1)], ["Coudes vers le haut", "Bras tendus"])],
    cue: "Haltère tenu à deux mains au-dessus de la tête : descends-le derrière la nuque en pliant les coudes, puis tends les bras vers le haut.",
    tips: ["Coudes pointés vers le haut, près de la tête.", "Seuls les avant-bras bougent.", "Abdos serrés pour ne pas cambrer (ou assis, dos calé)."] },
  "Extension triceps à la poulie": { views: [side([pushdownS(0), pushdownS(1)], ["Avant-bras remontés", "Bras tendus"]), front([pushdownF(0), pushdownF(1)], ["Coudes collés au corps", "Bras tendus"])],
    cue: "Face à la poulie haute, coudes collés au corps : tends complètement les bras vers le bas, puis remonte en contrôlant.",
    tips: ["Coudes fixes le long du corps.", "Tends complètement les bras en bas.", "Remonte lentement jusqu’aux avant-bras à l’horizontale."] },
  "Kickback triceps": { views: [side([kickback(0), kickback(1)], ["Coude à 90°", "Bras tendu vers l’arrière"])],
    cue: "Un genou et une main en appui sur un banc, dos plat, bras collé au corps : tends l’avant-bras vers l’arrière, puis reviens lentement.",
    tips: ["Genou et main du même côté posés sur le banc, dos parallèle au sol.", "Le haut du bras reste collé au corps et immobile.", "Charge légère, mouvement lent."] }
});

/* ═══ Vue gardée dans l'animation (« Voir le mouvement ») ═══ */
// Les images de départ / arrivée gardent toutes leurs vues ; seule l'animation est limitée à la vue indiquée.
const ANIM_ONLY = {
  "De profil": ["Presse pectoraux", "Pompes", "Tractions", "Tractions lestées", "Tractions supination (chin-up)", "Rowing barre", "Face pull", "Élévations frontales",
    "Curl barre", "Curl haltères", "Extension triceps à la poulie", "Extension triceps nuque", "Squats (poids du corps)", "Thrusters",
    "Développé couché", "Développé incliné", "Développé incliné haltères", "Développé couché prise serrée"],
  "De face": ["Écarté poulie haute", "Rowing T-bar", "Développé militaire", "Élévations latérales", "Rowing menton"]
};
Object.entries(ANIM_ONLY).forEach(([label, names]) => names.forEach(n => { HOW[n].anim = label; }));
