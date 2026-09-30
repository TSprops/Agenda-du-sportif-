// Fonctions communes à toutes les fiches : poses de base (debout, de face), vues, sol.
// Ce fichier n'importe que la silhouette et d'autres fichiers communs : il peut être évalué à tout moment.
import { GROUND } from "../figure.js";

export const ANK = GROUND - 7.2;   // cheville quand le pied est à plat au sol
export const HIPY = ANK - 90;   // hanche d'une personne debout
// Cheville d'un pied sur la pointe (angle ft) : le bout des orteils touche juste le sol.
export const onToes = (x, ft) => [x, GROUND - (24.4 * Math.sin(ft * Math.PI / 180) + 4.6 * Math.cos(ft * Math.PI / 180))];
export const merge = (a, b) => ({ ...a, ...b, near: { ...a.near, ...(b.near || {}) }, far: b.far ? { ...(a.far || {}), ...b.far } : a.far });
// Debout, de profil (regarde à droite).
export const stand = (o = {}) => merge({ hip: [120, HIPY], torso: -90, neck: -90, near: { ua: 93, fa: 84, hand: 86, th: 90, sh: 90, ft: 0 } }, o);
// Debout, de face.
export const standF = (o = {}) => ({ view: "front", hip: [120, HIPY], torso: -90, neck: -90, ...o, R: { ua: 84, fa: 88, hand: 90, th: 90, sh: 90, ...(o.R || {}) } });
export const view = (label, frames, caps, seq) => ({ label, frames, caps, seq: seq || frames.map((_, i) => i) });
export const side = (frames, caps, seq) => view("De profil", frames, caps, seq);
export const front = (frames, caps, seq) => view("De face", frames, caps, seq);
export const DA = ["Départ", "Arrivée"];
