// « Comment faire » : schéma du placement des mains (vu de dessus).

/* ---------- Placement des mains (vu de dessus) ---------- */
export const GRIPS = {
  floor: { x: 30, txt: "Mains au sol un peu plus larges que les épaules, doigts vers l’avant, coudes à environ 45° du corps." },
  wide: { x: 44, txt: "Mains au sol bien plus larges que les épaules (environ une fois et demie)." },
  diamond: { x: 6, rot: 40, txt: "Mains collées sous la poitrine : pouces et index se touchent et forment un losange (le « diamant »). Coudes serrés le long du corps." },
  bench: { x: 34, bar: 1, txt: "Mains sur la barre un peu plus larges que les épaules : en bas du mouvement, les avant-bras sont bien verticaux." },
  close: { x: 23, bar: 1, txt: "Mains à largeur d’épaules, pas plus serré, pour protéger les poignets." },
  pro: { x: 32, bar: 1, txt: "Prise en pronation (paumes vers la barre), mains un peu plus larges que les épaules, doigts refermés autour de la barre." },
  sup: { x: 22, bar: 1, txt: "Prise en supination (paumes tournées vers toi), mains à largeur d’épaules." },
  row: { x: 25, bar: 1, txt: "Prise en pronation (dos des mains vers l’avant, pouces vers l’intérieur), mains à largeur d’épaules." },
  dips: { x: 26, par: 1, txt: "Une main sur chaque barre parallèle, bras tendus, épaules basses et loin des oreilles." }
};
const HAND = `<rect x="-5" y="-3" width="10" height="11" rx="3.5"/><rect x="-4.8" y="-10" width="2.3" height="9" rx="1.15"/><rect x="-2.3" y="-11.6" width="2.3" height="10" rx="1.15"/><rect x="0.2" y="-10.8" width="2.3" height="9" rx="1.15"/><rect x="2.7" y="-8.6" width="2.2" height="7" rx="1.1"/><line class="hg-thumb" x1="-4" y1="5" x2="-9.5" y2="0.5"/>`;
export function gripSVG(id) {
  const g = GRIPS[id]; if (!g) return "";
  const hand = sx => `<g class="hg-hand" transform="translate(${80 + sx * g.x} 64) scale(${sx} 1) rotate(${-(g.rot || 0)})">${HAND}</g>`;
  return `<svg viewBox="0 0 160 100" class="hg" aria-hidden="true" focusable="false">
    <line class="hg-guide" x1="56" y1="34" x2="56" y2="82"/><line class="hg-guide" x1="104" y1="34" x2="104" y2="82"/>
    <circle class="hg-body" cx="80" cy="15" r="8"/><path class="hg-body" d="M50 44Q51 29 66 27H94Q109 29 110 44"/>
    ${g.bar ? `<line class="hg-bar" x1="6" y1="58" x2="154" y2="58"/>` : ""}${g.par ? [-1, 1].map(k => `<line class="hg-bar" x1="${80 + k * g.x}" y1="40" x2="${80 + k * g.x}" y2="86"/>`).join("") : ""}
    ${hand(1)}${hand(-1)}
    <path class="hg-dim" d="M58 86H102M61 83.5l-3 2.5 3 2.5M99 83.5l3 2.5-3 2.5"/><text class="hg-txt" x="80" y="97" text-anchor="middle">largeur d’épaules</text>
  </svg>`;
}
