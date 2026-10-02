// Fiche « Comment faire » : Rameur (ergomètre).
import { side } from "../_communs.js";
import { GROUND, raw } from "../../silhouette/index.js";

const f = n => n.toFixed(1);
// Rail au sol, siège qui glisse, cale-pieds incliné, volant à l'avant ; la chaîne va de la poignée au volant.
const FLY = [212, 168];
const erg = raw(P => `<g class="fg-eq"><rect class="fg-frame" x="40" y="${GROUND - 12}" width="170" height="5" rx="2"/><rect class="fg-frame" x="44" y="${GROUND - 9}" width="6" height="9"/>
  <rect class="fg-pad" x="${f(P.hip[0] - 16)}" y="${f(P.hip[1] + 6)}" width="30" height="7" rx="3"/><rect class="fg-frame" x="${f(P.hip[0] - 4)}" y="${f(P.hip[1] + 13)}" width="6" height="${f(GROUND - 12 - P.hip[1] - 13)}"/>
  <rect class="fg-pad" x="160" y="${GROUND - 46}" width="8" height="40" rx="3" transform="rotate(-38 164 ${GROUND - 26})"/>
  <rect class="fg-frame" x="200" y="${FLY[1]}" width="8" height="${GROUND - FLY[1]}"/><circle class="fg-plate" cx="${FLY[0]}" cy="${FLY[1]}" r="20"/><circle class="fg-hub" cx="${FLY[0]}" cy="${FLY[1]}" r="3"/>
  <line class="fg-cable" x1="${f(P.near.grip[0])}" y1="${f(P.near.grip[1])}" x2="${FLY[0] - 14}" y2="${FLY[1] - 8}"/></g>`);
const BOX = [34, 70, 236, GROUND];
const feet = { ankleAt: [166, 184], ft: -52 };
export default { views: [side([
      { hip: [104, 178], torso: -60, neck: -66, box: BOX, near: { ...feet, kneeBend: 1, wristAt: [176, 150], hand: 0 }, eq: [erg] },
      { hip: [74, 178], torso: -112, neck: -100, box: BOX, near: { ...feet, wristAt: [104, 136], elbowBend: 1, hand: 0 }, eq: [erg] }],
      ["Attaque : genoux pliés, bras tendus", "Fin de tirage : jambes tendues, poignée au bas des côtes"], [0, 1])],
    cue: "Pousse d’abord avec les jambes, puis bascule le buste en arrière et tire la poignée vers le bas des côtes. Au retour, dans l’ordre inverse : bras, buste, jambes.",
    tips: ["L’ordre compte : jambes, buste, bras à l’aller ; bras, buste, jambes au retour.", "Dos droit pendant tout le mouvement.", "Le retour est plus lent que la poussée."] };
