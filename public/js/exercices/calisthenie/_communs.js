// Fonctions communes du groupe Calisthénie : positions et matériel partagés par ses fiches.
// Ce fichier n'importe que la silhouette et d'autres fichiers communs : il peut être évalué à tout moment.
import { t } from "../../commun/i18n.js";
import { front, merge, onToes, side } from "../_communs.js";
import { GROUND, fpullbar, pullbar } from "../../silhouette/index.js";

export const BY = -14;   // hauteur de la barre de traction
export const onBar = [120, BY + 5.5];   // poignet quand la main entoure la barre par-dessous
export const hang = (o = {}) => merge({ hip: [118, BY + 112], torso: -92, neck: -88, near: { wristAt: onBar, hand: -90, th: 96, sh: 104, ft: 55 } }, o);
export const pullTop = (o = {}) => merge({ hip: [117, BY + 60], torso: -100, neck: -94, near: { wristAt: onBar, hand: -90, th: 84, sh: 100, ft: 50 } }, o);
// En haut : épaules à hauteur de la barre, coudes sous les mains, écartés et dirigés vers le bas (vers les hanches).
export const pullF = (grip, top, o = {}) => ({ view: "front", torso: -90, neck: -90, hip: [120, top ? BY + 56 : BY + 116], R: { wristAt: [120 + grip, BY + 5.5], hand: -90, elbowBend: top ? -1 : 1, th: 91, sh: 90 }, eq: [fpullbar(BY)], ...o });
export const pullViews = (grip, extraSide = [], extraFront = []) => [
  side([hang({ eq: [pullbar(120, BY), ...extraSide] }), pullTop({ eq: [pullbar(120, BY), ...extraSide] })], [t("fiches.communs-calisthenie.legende1"), t("fiches.communs-calisthenie.legende2")]),
  front([pullF(grip, 0, { eq: [fpullbar(BY), ...extraFront] }), pullF(grip, 1, { eq: [fpullbar(BY), ...extraFront] })], [t("fiches.communs-calisthenie.legende1"), t("fiches.communs-calisthenie.legende3")])];
export const PULL_TIPS = [t("fiches.communs-calisthenie.conseil1"), t("fiches.communs-calisthenie.conseil2"), t("fiches.communs-calisthenie.conseil3"), t("fiches.communs-calisthenie.conseil4")];
// Pompes : mains sous les épaules, pieds en appui sur la pointe.
export const TOES = onToes(-14, 75);
export const plank = (shX, shY, wristX, o = {}, toes = TOES) => {
  const a = Math.atan2(shY - toes[1], shX - toes[0]) * 180 / Math.PI, hip = [shX - 52 * Math.cos(a * Math.PI / 180), shY - 52 * Math.sin(a * Math.PI / 180)];
  return merge({ hip, torso: a, neck: a + 8, near: { th: 180 + a, sh: 180 + a, ft: 75, wristAt: [wristX, GROUND - 3], h: "flat", hand: 0, ls: { ua: 0.62 } } }, o);
};
export const pushF = (wx, down, o = {}) => ({ view: "front", nolegs: true, crown: true, tls: 0.22, torso: -90, neck: -90, hip: [120, down ? 190 : 162], R: { wristAt: [wx, GROUND - 4], hand: 90, h: "palm", ls: { ua: down ? 0.2 : 1 } }, ...o });
// Dips : main fermée sur la barre (ou l'anneau), avant-bras toujours vertical ; en bas, coude à 90° qui part vers l'arrière.
export const dipTop = (o = {}) => merge({ hip: [124, 97.7], torso: -80, neck: -84, near: { ua: 90, fa: 90, hand: 90, th: 100, sh: 185, ft: 150 } }, o);
export const dipLow = (o = {}) => merge({ hip: [139.6, 123.4], torso: -62, neck: -66, near: { ua: 180, fa: 90, hand: 90, th: 100, sh: 188, ft: 150 } }, o);
export const dipF = (low, o = {}) => ({ view: "front", torso: -90, neck: -90, hip: [120, low ? 120.3 : 98.5], R: low ? { ua: 84, fa: 90, hand: 90, th: 91, sh: 90, ls: { ua: 0.3, sh: 0.55 } } : { wristAt: [140, 104.5], hand: 90, th: 91, sh: 90, ls: { sh: 0.55 } }, ...o });
