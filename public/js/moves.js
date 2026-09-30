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

/* ═══ Abdos / gainage ═══ */
// Allongé sur le dos : tête à gauche, genoux pliés, pieds à plat (orteils vers la droite).
const backLie = (lift, o = {}) => {
  const t = 180 + lift;
  return merge({ hip: [130, GROUND - 13], torso: t, neck: t + 4, near: { ankleAt: [172, ANK], ft: 0, kneeBend: 1, wristAt: null, ua: t + 150, fa: t - 60, hand: t - 60 } }, o);
};
const hangLeg = (o = {}) => merge({ hip: [118, BY + 112], torso: -92, neck: -88, near: { wristAt: onBar, hand: -90, th: 92, sh: 94, ft: 40 } }, o);
const forearmPlank = (o = {}) => {
  const sh = [124, 173], a = Math.atan2(sh[1] - TOES[1], sh[0] - TOES[0]) * 180 / Math.PI;
  return merge({ hip: [sh[0] - 52 * Math.cos(a * Math.PI / 180), sh[1] - 52 * Math.sin(a * Math.PI / 180)], torso: a, neck: a + 4,
    near: { th: 180 + a, sh: 180 + a, ft: 75, ua: 90, fa: 0, hand: 0 } }, o);
};
Object.assign(HOW, {
  "Crunch": { views: [side([backLie(0, { near: { ua: 150, fa: -60, hand: -60 } }), backLie(28, { near: { ua: 150, fa: -40, hand: -40 } })], ["Allongé, genoux pliés", "Haut du dos enroulé"])],
    cue: "Allongé sur le dos, genoux pliés et pieds à plat : enroule le haut du dos en soufflant, sans tirer sur la nuque, puis redescends.",
    tips: ["Pieds à plat au sol, talons près des fesses.", "Le bas du dos reste collé au sol : seules les épaules décollent.", "Mains contre les tempes, sans tirer sur la tête."] },
  "Sit-ups": { views: [side([backLie(0, { near: { ua: 150, fa: -60, hand: -60 } }), backLie(72, { neck: 250, near: { ua: 170, fa: -30, hand: -30 } })], ["Allongé, genoux pliés", "Buste relevé jusqu’aux genoux"])],
    cue: "Allongé, genoux pliés, pieds à plat (bloqués si besoin) : relève tout le buste jusqu’aux genoux, puis redescends doucement.",
    tips: ["Pieds à plat, orteils vers l’avant, calés sous un support si besoin.", "Monte en déroulant le dos, redescends lentement.", "Mains contre les tempes ou bras croisés sur la poitrine."] },
  "Crunch à la poulie": { views: [side([
      { hip: [110, 158], torso: -80, neck: -70, near: { th: 90, sh: 180, ft: 180, wristAt: [128, 104], hand: -80 }, eq: [cable(186, 16, "rope")] },
      { hip: [112, 160], torso: 22, neck: 50, near: { th: 90, sh: 180, ft: 180, wristAt: [160, 170], hand: 40 }, eq: [cable(186, 16, "rope")] }],
      ["À genoux, corde derrière la tête", "Dos enroulé vers le sol"])],
    cue: "À genoux face à la poulie haute, corde tenue derrière la tête : enroule le dos vers le sol en contractant les abdos, puis remonte lentement.",
    tips: ["Les hanches restent au-dessus des genoux et ne bougent pas.", "Mains fixes contre la tête : c’est le dos qui s’enroule.", "Souffle en descendant."] },
  "Mountain climbers": { views: [side([
      plank(122, 150, 126, { near: { ls: {}, th: 40, sh: 150, ft: 70 }, far: { th: 157.6, sh: 157.6, ft: 75 } }),
      plank(122, 150, 126, { near: { ls: {} }, far: { th: 40, sh: 150, ft: 70 } })], ["Genou droit vers la poitrine", "Genou gauche vers la poitrine"])],
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
      R: { ua: 90, fa: 90, hand: 90, ls: { fa: 0.3 }, th: 168, sh: 168 }, L: { ua: 170, fa: 178, hand: 178, th: 168, sh: 168 } }], ["Position à tenir"])],
    cue: "Sur un avant-bras, coude sous l’épaule : corps aligné de la tête aux pieds, sans laisser tomber ni monter les hanches.",
    tips: ["Coude juste sous l’épaule.", "Corps aligné : les hanches ne montent pas et ne tombent pas.", "Trop dur ? Pose le genou du dessous au sol."] },
  "Relevés de jambes": { views: [side([hangLeg({ eq: [pullbar(120, BY)] }), hangLeg({ near: { th: -2, sh: -2, ft: -20 }, eq: [pullbar(120, BY)] })], ["Suspendu, jambes tendues", "Jambes à l’horizontale"])],
    cue: "Suspendu à la barre sans balancer : monte les jambes tendues jusqu’à l’horizontale, puis redescends lentement.",
    tips: ["Bras tendus, épaules actives.", "Pas d’élan : les jambes montent et descendent lentement.", "Trop dur ? Monte les genoux pliés."] },
  "Toes to bar": { views: [side([hangLeg({ eq: [pullbar(120, BY)] }),
      { hip: [148, BY + 93], torso: -140, neck: -120, near: { wristAt: onBar, hand: -90, ankleAt: [132, BY + 6], ft: -40 }, eq: [pullbar(120, BY)] }], ["Suspendu", "Pieds qui touchent la barre"])],
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
const backSquat = (hip, torso, ank) => { const b = backBarAt(hip, torso), r = torso + 90; return { hip, torso, neck: torso > -80 ? -70 : -88, near: { ankleAt: ank, ft: 0, ua: 100 + r, fa: -88 + r, hand: -90 + r }, eq: [bar(b, 13)] }; };
// Squat vu de face : cuisses qui avancent vers nous (raccourcies), genoux au-dessus des pieds.
const squatF = (down, o = {}) => ({ view: "front", torso: -90, neck: -90, tls: down ? 0.86 : 1, hip: [120, down ? ANK - 44 * 0.97 - 46 * 0.3 : HIPY],
  R: { th: down ? 84 : 90, sh: down ? 92 : 90, ls: down ? { th: 0.3 } : {}, ...(o.R || {}) }, ...o, R: { th: down ? 84 : 90, sh: down ? 92 : 90, ls: down ? { th: 0.3 } : {}, ...(o.R || {}) } });
const SQUAT_TIPS = ["Pieds largeur d’épaules, pointes légèrement vers l’extérieur.", "Genoux dans l’axe des pieds : ils ne rentrent pas et ne partent pas vers l’extérieur.", "Descends au moins jusqu’aux cuisses parallèles au sol, dos droit, talons au sol.", "Pousse dans les talons pour remonter."];
// Pied posé par la plante (bord d'une marche) : cheville placée pour que la plante reste au point « ball ».
const ankleFromBall = (ball, ft) => add(ball, [-(18 * Math.cos(rad(ft)) - 7.2 * Math.sin(rad(ft))), -(18 * Math.sin(rad(ft)) + 7.2 * Math.cos(rad(ft)))]);
const calfStand = ft => { const a = ankleFromBall([132, 188], ft); return stand({ hip: [a[0], a[1] - 90], near: { ft, ua: 93, fa: 84 }, eq: [box(128, 188, 40, 22), db(P => [P.near.grip, 90], "side", { mid: true })] }); };
const hackEq = [
  raw(P => { const b = dirA(P.torso - 90), p1 = add(P.hip, [b[0] * 13, b[1] * 13]), p2 = add(P.sh, [b[0] * 13, b[1] * 13]); return `<line class="fg-padline" x1="${p1[0].toFixed(1)}" y1="${p1[1].toFixed(1)}" x2="${p2[0].toFixed(1)}" y2="${p2[1].toFixed(1)}"/>`; }),
  line([60, 4], [172, 214], "fg-rail"), line([150, 212], [196, 170], "fg-plat"),
  roller(P => add(P.sh, [-2, -9]), 6, { top: true })];
const pressEq = ank => [line([30, 202], [196, 36], "fg-rail"), raw(() => `<rect class="fg-pad" x="30" y="150" width="70" height="8" rx="3.5"/><rect class="fg-pad" x="18" y="118" width="46" height="8" rx="3.5" transform="rotate(32 64 122)"/><rect class="fg-frame" x="56" y="158" width="4" height="${GROUND - 158}"/><rect class="fg-frame" x="30" y="${GROUND - 3}" width="60" height="4" rx="1.5"/>`),
  raw(P => { const a = P.near.ankle; return `<g transform="translate(${(a[0] + 5).toFixed(1)} ${(a[1] - 4).toFixed(1)}) rotate(45)"><rect class="fg-plate" x="-24" y="-3" width="48" height="7" rx="2"/><rect class="fg-frame" x="-6" y="4" width="12" height="16"/></g>`; }, { top: true })];
const legExt = ext => ({ hip: [100, 142], torso: -95, neck: -90, near: { th: -4, sh: ext ? -8 : 92, ft: ext ? -20 : 10, wristAt: [104, 150], hand: 0 },
  eq: [seat(86, 150, 1, 8), roller(P => add(P.near.ankle, ext ? [3, 8] : [8, 2]), 6, { top: true })] });
const legCurl = up => ({ hip: [100, 150], torso: 0, neck: 4, near: { th: 180, sh: up ? -60 : 180, ft: up ? -60 : 180, wristAt: [168, 166], hand: 90 },
  eq: [bench(30, 176, 163), roller(P => add(P.near.ankle, up ? [4, -6] : [0, -8]), 6, { top: true })] });
const seatCalf = ft => { const a = ankleFromBall([148, 194], ft); return { hip: [100, 142], torso: -88, neck: -88, near: { ankleAt: a, ft, kneeBend: -1, wristAt: [132, 132], hand: 0 },
  eq: [seat(86, 150, 0), box(140, 194, 36, 16), roller(P => add(P.near.knee, [2, -9]), 6, { top: true })] }; };
const lunge = (front, o = {}) => stand({ hip: [118, 150], ...o, near: front === "near" ? { ankleAt: [160, ANK], ft: 0, ua: 92, fa: 88, hand: 90 } : { ankleAt: [72, ANK - 1], ft: 62, ua: 92, fa: 88, hand: 90 },
  far: front === "near" ? { ankleAt: [72, ANK - 1], ft: 62 } : { ankleAt: [160, ANK], ft: 0 }, eq: [db(P => [P.near.grip, 90], "side", { mid: true })] });
const BENCH_HT = 163;
const ht = (sh, hipUp) => { const hip = hipUp ? add(sh, [52, 0]) : add(sh, [52 * Math.cos(rad(33.7)), 52 * Math.sin(rad(33.7))]), b = add(hip, [4, -13]);
  return { hip, torso: hipUp ? 180 : -146.3, neck: hipUp ? 200 : -150, near: { ankleAt: [150, ANK], ft: 0, kneeBend: 1, wristAt: add(b, [-4, -4]), hand: -60 }, eq: [bench(10, 72, BENCH_HT), bar(b, 13, { top: true })] }; };

Object.assign(HOW, {
  "Squat": { views: [
      side([backSquat([120, HIPY], -90, [124, ANK]), backSquat([104, 166], -58, [124, ANK])], ["Debout, barre sur le haut du dos", "Cuisses parallèles au sol"]),
      front([squatF(0, { R: { wristAt: [150, 72], hand: -90 }, eq: [fbar(() => 70)] }), squatF(1, { R: { wristAt: [150, 118], hand: -90 }, eq: [fbar(() => 116)] })], ["Debout", "Genoux dans l’axe des pieds"])],
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
      side([stand({ near: rack, eq: [bar(P => P.near.grip, 13, { top: true })] }), { hip: [106, 166], torso: -72, neck: -86, near: { ankleAt: [124, ANK], ft: 0, ...rack }, eq: [bar(P => P.near.grip, 13, { top: true })] }], ["Barre sur l’avant des épaules", "Buste droit, cuisses parallèles"]),
      front([squatF(0, { R: { ua: 60, fa: -100, hand: -90, ls: { ua: 0.45 } }, eq: [fbar(P => P.R.grip[1], { top: true })] }), squatF(1, { R: { ua: 60, fa: -100, hand: -90, ls: { ua: 0.45, th: 0.3 } }, eq: [fbar(P => P.R.grip[1], { top: true })] })], ["Coudes hauts", "Genoux dans l’axe des pieds"])],
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
      { hip: [92, 150], torso: -148, neck: -130, near: { ankleAt: [134, 104], ft: -45, kneeBend: -1, wristAt: [100, 158], hand: 0 }, eq: pressEq() },
      { hip: [92, 150], torso: -148, neck: -130, near: { ankleAt: [158, 80], ft: -45, kneeBend: -1, wristAt: [100, 158], hand: 0 }, eq: pressEq() }], ["Genoux pliés", "Jambes presque tendues"])],
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
