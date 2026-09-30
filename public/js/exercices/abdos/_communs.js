// Fonctions communes du groupe Abdos / gainage : positions et matériel partagés par ses fiches.
// Ce fichier n'importe que la silhouette et d'autres fichiers communs : il peut être évalué à tout moment.
import { ANK, merge, onToes } from "../_communs.js";
import { BY, TOES, onBar, plank } from "../calisthenie/_communs.js";
import { GROUND } from "../../figure.js";

// Allongé sur le dos : tête à gauche, genoux pliés, pieds à plat (orteils vers la droite).
export const backLie = (lift, o = {}) => {
  const t = 180 + lift;
  return merge({ hip: [130, GROUND - 13], torso: t, neck: t + 4, near: { ankleAt: [172, ANK], ft: 0, kneeBend: 1, wristAt: null, ua: t + 150, fa: t - 60, hand: t - 60 } }, o);
};
export const hangLeg = (o = {}) => merge({ hip: [118, BY + 112], torso: -92, neck: -88, near: { wristAt: onBar, hand: -90, th: 92, sh: 94, ft: 40 } }, o);
export const MC_TUCK = [86, onToes(86, 70)[1] - 3];   // mountain climbers : pied ramené sous la poitrine, 3 au-dessus du sol
// Animation : genou ramené, hanches un peu plus hautes (le genou passe sans toucher le sol), l'autre pied reste posé.
// (le buste pivote autour des épaules pour que les mains restent au sol)
export const mcTuck = side => { const p = plank(122, 150, 126, { near: { ls: {} } }), hip = [122 - 52 * Math.cos(-4.4 * Math.PI / 180), 150 - 52 * Math.sin(-4.4 * Math.PI / 180)];
  return merge(p, { hip, torso: -4.4, neck: 4, [side]: { ankleAt: MC_TUCK, ft: 70, kneeBend: 1 }, [side === "near" ? "far" : "near"]: { ankleAt: TOES, ft: 75, kneeBend: -1 } }); };
export const forearmPlank = (o = {}) => {
  const sh = [124, 173], a = Math.atan2(sh[1] - TOES[1], sh[0] - TOES[0]) * 180 / Math.PI;
  return merge({ hip: [sh[0] - 52 * Math.cos(a * Math.PI / 180), sh[1] - 52 * Math.sin(a * Math.PI / 180)], torso: a, neck: a + 4,
    near: { th: 180 + a, sh: 180 + a, ft: 75, ua: 90, fa: 0, hand: 0 } }, o);
};
