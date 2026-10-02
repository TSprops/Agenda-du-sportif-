// Fiche « Comment faire » : Double unders.
import { t } from "../../commun/i18n.js";
import { ANK, HIPY, onToes, side, stand } from "../_communs.js";
import { GROUND, raw } from "../../silhouette/index.js";

const f = n => n.toFixed(1);
// Corde à sauter : les poignées dans les mains, la boucle au-dessus de la tête ou sous les pieds ; trajet en pointillés.
const rope = under => raw(P => {
  const g = P.near.grip, h = P.head, y = under ? GROUND + 1 : h[1] - 24, x = under ? P.near.ankle[0] + 4 : h[0];
  return `<ellipse class="fg-path" cx="${f(P.hip[0] + 4)}" cy="${f((h[1] - 24 + GROUND) / 2)}" rx="44" ry="${f((GROUND - h[1] + 26) / 2)}"/>
    <path class="fg-rope" d="M${f(g[0])} ${f(g[1])}Q${f(g[0] + 34)} ${f(y + (under ? -6 : 12))} ${f(x)} ${f(y)}Q${f(g[0] - 46)} ${f(y + (under ? -10 : 18))} ${f(g[0] - 2)} ${f(g[1] + 2)}"/>`;
}, { top: true });
const arms = { ua: 98, fa: 20, hand: 20 };
const box = [64, -14, 182, GROUND];
export default { views: [side([
      stand({ box, hip: [120, HIPY - 5], torso: -88, neck: -90, near: { ...arms, ankleAt: onToes(118, 34), ft: 34 }, eq: [rope(false)] }),
      { box, hip: [120, HIPY - 17], torso: -88, neck: -90, near: { ...arms, ankleAt: [119, ANK - 15], ft: 30, kneeBend: 1 }, eq: [rope(true)] }],
      [t("fiches.double-unders.legende1"), t("fiches.double-unders.legende2")])],
    cue: t("fiches.double-unders.consigne"),
    tips: [t("fiches.double-unders.conseil1"), t("fiches.double-unders.conseil2"), t("fiches.double-unders.conseil3")] };
