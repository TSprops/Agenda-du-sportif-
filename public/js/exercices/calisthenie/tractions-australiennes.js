// Fiche « Comment faire » : Tractions australiennes.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { pullbar } from "../../silhouette/index.js";

export default { grip: "row", views: [side([
      // Talons au même point. En haut, la barre arrive au milieu de la poitrine (épaules au-delà de la barre) :
      // le coude part vers les hanches, le long du corps, avant-bras vertical sous la barre.
      { hip: [88.2, 173.5], torso: -161, neck: -164, near: { wristAt: [80, 115.5], hand: -90, elbowBend: -1, th: 19, sh: 19, ft: -71 }, eq: [pullbar(80, 110)] },
      { hip: [99.4, 151.6], torso: -145.3, neck: -150, near: { wristAt: [80, 115.5], hand: -90, elbowBend: -1, th: 34.7, sh: 34.7, ft: -55 }, eq: [pullbar(80, 110)] }], [t("fiches.tractions-australiennes.legende1"), t("fiches.tractions-australiennes.legende2")])],
    cue: t("fiches.tractions-australiennes.consigne"),
    tips: [t("fiches.tractions-australiennes.conseil1"), t("fiches.tractions-australiennes.conseil2"), t("fiches.tractions-australiennes.conseil3")] };
