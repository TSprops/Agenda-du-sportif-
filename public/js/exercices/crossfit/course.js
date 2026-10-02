// Fiche « Comment faire » : Course.
import { t } from "../../commun/i18n.js";
import { onToes, side } from "../_communs.js";

// Foulée de profil, bras opposés aux jambes, coudes pliés à 90°.
const armF = { ua: 55, fa: -35, hand: -35 }, armB = { ua: 125, fa: 60, hand: 60 };
// Appui : pied sous le bassin, l'autre genou ramené devant.
const stance = { hip: [118, 114], torso: -82, neck: -84, near: { ankleAt: onToes(122, 18), ft: 18, ...armB }, far: { th: 25, sh: 115, ft: 30, ...armF } };
// En l'air : jambe arrière tendue derrière, jambe avant qui se déplie vers le sol.
const flight = { hip: [118, 106], torso: -82, neck: -84, near: { th: 118, sh: 150, ft: 70, ...armF }, far: { th: 55, sh: 100, ft: 10, ...armB } };
export default { views: [side([stance, flight], [t("fiches.course.legende1"), t("fiches.course.legende2")], [0, 1])],
    cue: t("fiches.course.consigne"),
    tips: [t("fiches.course.conseil1"), t("fiches.course.conseil2"), t("fiches.course.conseil3")] };
