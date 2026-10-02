// Fiche « Comment faire » : Air bike.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { GROUND, raw } from "../../silhouette/index.js";

const f = n => n.toFixed(1), rad = d => d * Math.PI / 180;
// Vélo à air : grande roue à pales devant, pédalier sous la selle, poignées qui bougent avec les jambes.
const CRANK = [128, 180], ARM = 15, FAN = [190, 160];
const pedal = a => [CRANK[0] + ARM * Math.cos(rad(a)), CRANK[1] + ARM * Math.sin(rad(a))];
const bike = raw(P => `<g class="fg-eq"><circle class="fg-plate" cx="${FAN[0]}" cy="${FAN[1]}" r="30"/><circle class="fg-plate-in" cx="${FAN[0]}" cy="${FAN[1]}" r="18"/><circle class="fg-hub" cx="${FAN[0]}" cy="${FAN[1]}" r="3"/>
  <line class="fg-frame-l" x1="98" y1="140" x2="${CRANK[0]}" y2="${CRANK[1]}"/><line class="fg-frame-l" x1="${CRANK[0]}" y1="${CRANK[1]}" x2="${FAN[0]}" y2="${FAN[1]}"/>
  <line class="fg-frame-l" x1="70" y1="${GROUND - 2}" x2="214" y2="${GROUND - 2}"/><line class="fg-frame-l" x1="${CRANK[0]}" y1="${CRANK[1]}" x2="${CRANK[0] - 30}" y2="${GROUND - 2}"/><line class="fg-frame-l" x1="${FAN[0]}" y1="${FAN[1]}" x2="${FAN[0] + 10}" y2="${GROUND - 2}"/>
  <rect class="fg-pad" x="80" y="134" width="30" height="7" rx="3"/><circle class="fg-hub" cx="${CRANK[0]}" cy="${CRANK[1]}" r="4"/>
  <line class="fg-frame-l" x1="${f(P.near.grip[0])}" y1="${f(P.near.grip[1])}" x2="${FAN[0] - 22}" y2="${FAN[1] - 2}"/></g>`);
const ride = (a, wrist) => ({ box: [64, 50, 226, GROUND], hip: [96, 128], torso: -66, neck: -76, near: { ankleAt: pedal(a), ft: 10, wristAt: wrist, hand: -60 }, far: { ankleAt: pedal(a + 180), ft: 10, wristAt: [wrist[0] - 8, wrist[1] + 2] }, eq: [bike] });
export default { views: [side([ride(-60, [160, 98]), ride(120, [148, 106])], [t("fiches.air-bike.legende1"), t("fiches.air-bike.legende2")], [0, 1])],
    cue: t("fiches.air-bike.consigne"),
    tips: [t("fiches.air-bike.conseil1"), t("fiches.air-bike.conseil2"), t("fiches.air-bike.conseil3")] };
