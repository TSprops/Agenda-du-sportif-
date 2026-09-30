// « Comment faire » : les positions de chaque exercice, dessinées avec le mannequin de figure.js.
// Une fiche = des vues (profil, face) ; une vue = des images clés (départ, arrivée…) et l'ordre de l'animation.
// Ce fichier n'importe que figure.js (qui n'importe rien) : il peut donc être évalué à tout moment.
import { GROUND, bar, db, kb, medball, bench, roller, pullbar, dipbars, rings, cable, cableTop, seat, box, wall, climbRope, wheel, line, pad, raw,
  fbar, fdb, fpullbar, fdips, frings, fcables, fcableTop, fbench, add } from "./figure.js";

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
