// Fiche « Comment faire » : Crunch à la poulie.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { cable } from "../../silhouette/index.js";

export default { views: [side([
      // Hanches fixes au-dessus des genoux ; le dos s'enroule (curl). Mains contre la tête, coudes toujours vers le bas :
      // le bras garde le même angle par rapport au haut du dos pendant tout le mouvement.
      { hip: [110, 158], torso: -80, neck: -70, near: { th: 90, sh: 180, ft: 180, ua: 60, fa: -110, hand: -110 }, eq: [cable(186, 16, "rope")] },
      { hip: [110, 158], torso: -45, curl: 95, neck: 60, near: { th: 90, sh: 180, ft: 180, ua: 190, fa: 20, hand: 20 }, eq: [cable(186, 16, "rope")] }],
      [t("fiches.crunch-a-la-poulie.legende1"), t("fiches.crunch-a-la-poulie.legende2")])],
    cue: t("fiches.crunch-a-la-poulie.consigne"),
    tips: [t("fiches.crunch-a-la-poulie.conseil1"), t("fiches.crunch-a-la-poulie.conseil2"), t("fiches.crunch-a-la-poulie.conseil3")] };
