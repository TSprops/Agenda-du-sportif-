// Fiche « Comment faire » : Rowing T-bar.
import { t } from "../../commun/i18n.js";
import { front, side } from "../_communs.js";
import { bentF, tbar } from "./_communs.js";
import { GROUND, raw } from "../../silhouette/index.js";

export default { views: [side([tbar(0), tbar(1)], [t("fiches.rowing-t-bar.legende1"), t("fiches.rowing-t-bar.legende2")]),
      front([bentF(0.55, { R: { wristAt: [124, 150], hand: 90 }, eq: [raw(P => `<line class="fg-barline" x1="120" y1="${GROUND}" x2="120" y2="${(P.R.grip[1] + 8).toFixed(1)}"/>`), raw(P => `<circle class="fg-plate" cx="120" cy="${(P.R.grip[1] + 8).toFixed(1)}" r="12"/>`, { top: true })] }),
        bentF(0.55, { R: { wristAt: [124, 122], hand: 90, ls: { ua: 0.28, th: 0.85 } }, eq: [raw(P => `<line class="fg-barline" x1="120" y1="${GROUND}" x2="120" y2="${(P.R.grip[1] + 8).toFixed(1)}"/>`), raw(P => `<circle class="fg-plate" cx="120" cy="${(P.R.grip[1] + 8).toFixed(1)}" r="12"/>`, { top: true })] })], [t("fiches.rowing-t-bar.legende3"), t("fiches.rowing-t-bar.legende4")])],
    cue: t("fiches.rowing-t-bar.consigne"),
    tips: [t("fiches.rowing-t-bar.conseil1"), t("fiches.rowing-t-bar.conseil2"), t("fiches.rowing-t-bar.conseil3")], anim: "De face" };
