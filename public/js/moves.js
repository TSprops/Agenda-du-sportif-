// « Comment faire » : les positions de chaque exercice, dessinées avec le mannequin de figure.js.
// Une fiche = des vues (profil, face) ; une vue = des images clés (départ, arrivée…) et l'ordre de l'animation.
// Ce fichier n'importe que figure.js (qui n'importe rien) : il peut donc être évalué à tout moment.
import { GROUND, bar, db, kb, medball, bench, roller, pullbar, dipbars, rings, cable, cableTop, seat, box, wall, climbRope, wheel, line, pad, raw,
  fbar, fdb, fpullbar, fdips, frings, fcables, fcableTop, fbench, pole, beltSide, beltFront, add } from "./figure.js";

const ANK = GROUND - 7.2;            // cheville quand le pied est à plat au sol
const HIPY = ANK - 90;               // hanche d'une personne debout
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
  { hip: [70, 188], torso: -3, neck: 2, near: { ankleAt: [-18, GROUND - 10], ft: 80, wristAt: [118, GROUND - 3], h: "flat", hand: 0, ls: { ua: 0.75 } } },
  stand({ hip: [120, HIPY - 12], neck: -95, near: { ua: -84, fa: -88, hand: -90, h: "open", ft: 55 } })
];
const wb = x => [wall(186, -20), ...x];
const wallball = [
  { hip: [106, 166], torso: -66, neck: -86, near: { ankleAt: [124, ANK], ft: 0, wristAt: [136, 124], hand: -40, h: "open" },
    eq: wb([medball(P => add(P.sh, [22, 6]), { mid: true })]) },
  stand({ neck: -100, near: { ua: -70, fa: -66, hand: -66, h: "open", ft: 40 }, hip: [120, HIPY - 6],
    eq: wb([medball(P => add(P.near.grip, [10, -16]), { top: true })]) })
];
const snatchStart = { hip: [98, 165], torso: -30, neck: -20, near: { ankleAt: [124, ANK], ft: 0, wristAt: [128, GROUND - 18.5], hand: 90 }, eq: [bar([128, GROUND - 13], 13, { mid: true })] };
const rack = { ua: 12, fa: -158, hand: -60 };
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
      side([stand({ torso: -92, neck: -92, near: { ankleAt: [136, ANK], ua: 90, fa: 90, hand: 90 }, far: { ankleAt: [106, ANK], ft: 20 }, eq: [db(P => [P.near.grip, 90], "side", { mid: true })] }),
        stand({ torso: -92, neck: -92, near: { ankleAt: [106, ANK], ft: 20, ua: 90, fa: 90, hand: 90 }, far: { ankleAt: [136, ANK], ft: 0 }, eq: [db(P => [P.near.grip, 90], "side", { mid: true })] })], ["Un pas", "Le pas suivant"]),
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
      front([standF({ hip: [120, HIPY + 40], R: { th: 84, sh: 92, ls: { th: 0.2 }, ua: 60, fa: -100, hand: -90, ls: { ua: 0.45, th: 0.2 } }, eq: [fbar(P => P.R.grip[1], { top: true })] }),
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
const pullF = (grip, top, o = {}) => ({ view: "front", torso: -90, neck: -90, hip: [120, top ? BY + 64 : BY + 116], R: { wristAt: [120 + grip, BY + 5.5], hand: -90, elbowBend: top ? -1 : 1, th: 91, sh: 90 }, eq: [fpullbar(BY)], ...o });
const pullViews = (grip, extraSide = [], extraFront = []) => [
  side([hang({ eq: [pullbar(120, BY), ...extraSide] }), pullTop({ eq: [pullbar(120, BY), ...extraSide] })], ["Bras tendus", "Poitrine vers la barre"]),
  front([pullF(grip, 0, { eq: [fpullbar(BY), ...extraFront] }), pullF(grip, 1, { eq: [fpullbar(BY), ...extraFront] })], ["Bras tendus", "Menton au-dessus de la barre"])];
const PULL_TIPS = ["Pars bras complètement tendus, épaules basses.", "Tête droite, regard devant : c’est la poitrine qui monte vers la barre, la tête ne passe pas sous la barre.", "Tire les coudes vers le bas et vers l’arrière, sans balancer les jambes.", "Redescends lentement jusqu’aux bras tendus."];
// Pompes : mains sous les épaules, pieds en appui sur la pointe.
const TOES = [-14, GROUND - 7];
const plank = (shX, shY, wristX, o = {}) => {
  const a = Math.atan2(shY - TOES[1], shX - TOES[0]) * 180 / Math.PI, hip = [shX - 52 * Math.cos(a * Math.PI / 180), shY - 52 * Math.sin(a * Math.PI / 180)];
  return merge({ hip, torso: a, neck: a + 8, near: { th: 180 + a, sh: 180 + a, ft: 75, wristAt: [wristX, GROUND - 3], h: "flat", hand: 0, ls: { ua: 0.62 } } }, o);
};
const pushF = (wx, down, o = {}) => ({ view: "front", nolegs: true, tls: 0.22, torso: -90, neck: -90, hip: [120, down ? 190 : 162], R: { wristAt: [wx, GROUND - 4], hand: 90, h: "flat", ls: { ua: down ? 0.2 : 1 } }, ...o });
const dipTop = (o = {}) => merge({ hip: [119, 104], torso: -80, neck: -84, near: { wristAt: [133, 110], hand: 0, th: 100, sh: 185, ft: 150 } }, o);
const dipLow = (o = {}) => merge({ hip: [104, 133], torso: -70, neck: -76, near: { wristAt: [133, 110], hand: 0, th: 104, sh: 188, ft: 150 } }, o);
const dipF = (low, o = {}) => ({ view: "front", torso: -90, neck: -90, hip: [120, low ? 124 : 99], R: { wristAt: [140, 104.5], hand: 90, th: 91, sh: 90, ls: { sh: 0.55 } }, ...o });

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
  "Dips aux anneaux": { grip: null, views: [side([dipTop({ near: { wristAt: [133, 104.5], hand: 90 }, eq: [rings("near", { top: true })] }), dipLow({ near: { wristAt: [133, 104.5], hand: 90 }, eq: [rings("near", { top: true })] })], ["Bras tendus", "Coudes à 90°"]),
      front([dipF(0, { eq: [frings()] }), dipF(1, { eq: [frings()] })], ["Bras tendus, anneaux serrés", "Coudes à 90°"])],
    cue: "Anneaux tenus bras tendus près du corps : descends jusqu’aux coudes à 90°, puis remonte en gardant les anneaux serrés.",
    tips: ["Plus instable que les barres : maîtrise d’abord les dips classiques.", "Anneaux collés au corps, bras tendus en haut.", "Descends lentement sans laisser les anneaux s’écarter."] },
  "Human flag": { views: [front([{ view: "front", torso: 0, neck: 0, hip: [66, 118],
      R: { wristAt: [144, 176], hand: 0, th: 180, sh: 180 }, L: { wristAt: [144, 64], hand: 0, th: 180, sh: 180, elbowBend: 1 }, eq: [pole(152)] }], ["Position à tenir"])],
    cue: "Mains serrées sur une barre verticale, bras tendus : le bras du haut tire, celui du bas pousse, corps horizontal sur le côté.",
    tips: ["Mains écartées d’environ une largeur d’épaules et demie sur le poteau.", "Bras du haut qui tire, bras du bas qui pousse, tous les deux tendus.", "Progression : commence jambes groupées, puis une jambe tendue."] },
  "Planche": { views: [side([plank(122, 150, 124), plank(140, 156, 120)], ["Épaules au-dessus des mains", "Penché : épaules devant les mains"])],
    cue: "Version pieds au sol (planche penchée) : en appui sur les mains, bras tendus, avance les épaules devant les mains en gardant le corps gainé.",
    tips: ["Bras bien tendus, épaules qui poussent le sol.", "Doigts tournés vers l’extérieur ou vers l’arrière pour protéger les poignets.", "Corps gainé du début à la fin, pointes de pieds au sol."] },
  "Back lever": { views: [side([{ hip: [96, 80], torso: 0, neck: 2, near: { wristAt: [120, BY + 4], hand: -140, th: 180, sh: 180, ft: 180 }, eq: [pullbar(120, BY)] }], ["Position à tenir"])],
    cue: "Suspendu, bras tendus derrière le dos : corps gainé à l’horizontale, face vers le sol.", tips: ["Face vers le sol, corps droit des épaules aux pieds.", "Bras tendus, épaules vers l’avant.", "Progression : jambes groupées, puis une jambe tendue."] },
  "Front lever": { views: [side([{ hip: [150, 82], torso: 180, neck: 172, near: { wristAt: [120, BY + 5.5], hand: -70, th: 0, sh: 0, ft: 0 }, eq: [pullbar(120, BY)] }], ["Position à tenir"])],
    cue: "Suspendu bras tendus : corps gainé à l’horizontale, face vers le plafond.", tips: ["Bras tendus, tire la barre vers les hanches.", "Corps droit : ni fesses qui tombent, ni dos creux.", "Progression : genoux groupés, puis une jambe tendue."] },
  "Pompes": { grip: "floor", views: [side([plank(122, 150, 126), plank(122, 188, 126)], ["Bras tendus", "Poitrine près du sol"]),
      front([pushF(142, 0), pushF(142, 1)], ["Bras tendus", "Coudes près du corps"])],
    cue: "Corps gainé en planche, mains un peu plus larges que les épaules : descends la poitrine près du sol, coudes près du corps, puis pousse.",
    tips: ["Coudes à environ 45° du corps, pas écartés.", "Corps droit comme une planche : ni fesses en l’air, ni ventre qui tombe.", "Trop dur ? Fais-les sur les genoux ou mains sur un banc."] },
  "Pompes diamant": { grip: "diamond", views: [side([plank(122, 150, 124), plank(122, 190, 124)], ["Bras tendus", "Poitrine près des mains"]),
      front([pushF(124, 0), pushF(124, 1, { R: { wristAt: [126, GROUND - 4], hand: 90, h: "flat", ls: { ua: 0.2 } } })], ["Mains en losange", "Coudes serrés le long du corps"])],
    cue: "Mains collées sous la poitrine en forme de losange : descends en gardant les coudes serrés le long du corps, puis pousse.",
    tips: ["Pouces et index se touchent sous la poitrine.", "Coudes collés au corps, encore plus qu’aux pompes classiques.", "Plus dur : commence sur les genoux si besoin."] },
  "Pompes archer": { grip: "wide", views: [front([
      pushF(170, 0),
      pushF(170, 1, { hip: [142, 192], L: { wristAt: [70, GROUND - 4], hand: 90, h: "flat", elbowBend: -1 } }),
      pushF(170, 1, { hip: [98, 192], R: { wristAt: [170, GROUND - 4], hand: 90, h: "flat", elbowBend: 1 }, L: { wristAt: [70, GROUND - 4], hand: 90, h: "flat", elbowBend: 1, ls: { ua: 0.7 } } })],
      ["Mains très écartées", "Descente à droite, bras gauche tendu", "Descente à gauche, bras droit tendu"], [0, 1, 0, 2])],
    cue: "Mains très écartées : descends d’un côté en pliant ce bras, l’autre bras reste tendu, remonte, puis descends de l’autre côté.",
    tips: ["Un côté puis l’autre, jamais les deux en même temps.", "Le bras tendu glisse sur le côté et aide un peu.", "Corps gainé et droit pendant tout le mouvement."] },
  "Pompes pike": { views: [side([
      { hip: [88, 126], torso: 33.7, neck: 50, near: { ankleAt: [44, GROUND - 8], ft: 70, wristAt: [134, GROUND - 3], h: "flat", hand: 0 } },
      { hip: [96, 130], torso: 58, neck: 70, near: { ankleAt: [44, GROUND - 8], ft: 70, wristAt: [134, GROUND - 3], h: "flat", hand: 0 } }], ["Corps en V, bras tendus", "Tête vers le sol devant les mains"])],
    cue: "Mains au sol, hanches hautes (corps en V à l’envers) : plie les bras pour amener la tête vers le sol devant les mains, puis pousse.",
    tips: ["Hanches hautes : le corps forme un V à l’envers.", "La tête descend devant les mains, pas entre elles.", "Plus les pieds sont proches des mains, plus c’est dur."] },
  "Tractions australiennes": { grip: "row", views: [side([
      { hip: [130.6, 182], torso: -166.6, neck: -170, near: { wristAt: [80, 115.5], hand: -90, th: 13.4, sh: 13.4, ft: -75 }, eq: [pullbar(80, 110)] },
      { hip: [140.2, 157.1], torso: -149.5, neck: -155, near: { wristAt: [80, 115.5], hand: -90, elbowBend: 1, th: 30.5, sh: 30.5, ft: -60 }, eq: [pullbar(80, 110)] }], ["Bras tendus", "Poitrine à la barre"])],
    cue: "Sous une barre basse, corps gainé et droit, talons au sol : tire la poitrine jusqu’à la barre, coudes près du corps, puis redescends.",
    tips: ["Corps droit des épaules aux talons.", "Coudes près du corps, poitrine vers la barre.", "Plus les pieds sont loin, plus c’est dur."] },
  "Montée de corde": { views: [side([
      { hip: [112, 142], torso: -90, neck: -94, near: { wristAt: [117, 42], hand: -90, ankleAt: [116, 176], ft: 20 }, far: { wristAt: [117, 60] }, eq: [climbRope(120)] },
      { hip: [114, 104], torso: -92, neck: -92, near: { wristAt: [117, 60], hand: -90, ankleAt: [117, 190], ft: 20 }, far: { wristAt: [117, 44] }, eq: [climbRope(120)] }],
      ["Mains en haut, pieds qui serrent la corde", "Jambes qui poussent, une main puis l’autre"])],
    cue: "Mains serrées en haut, pieds qui bloquent la corde : pousse sur les jambes, puis avance une main après l’autre plus haut.",
    tips: ["Les pieds pincent la corde (une cheville sur l’autre).", "Ce sont les jambes qui font monter, les bras tiennent.", "Redescends main après main, jamais en glissant."] },
  "Montée de corde sans jambes": { views: [side([
      { hip: [114, 132], torso: -90, neck: -94, near: { wristAt: [117, 34], hand: -90, th: 60, sh: 85, ft: 20 }, far: { wristAt: [117, 60] }, eq: [climbRope(120)] },
      { hip: [114, 118], torso: -90, neck: -94, near: { wristAt: [117, 50], hand: -90, th: 60, sh: 85, ft: 20 }, far: { wristAt: [117, 24] }, eq: [climbRope(120)] }],
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
