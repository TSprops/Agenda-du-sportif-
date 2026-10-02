// Fiche « Comment faire » : Extension triceps à la poulie.
import { t } from "../../commun/i18n.js";
import { front, side } from "../_communs.js";
import { pushdownF, pushdownS } from "./_communs.js";

export default { views: [side([pushdownS(0), pushdownS(1)], [t("fiches.extension-triceps-a-la-poulie.legende1"), t("fiches.extension-triceps-a-la-poulie.legende2")]), front([pushdownF(0), pushdownF(1)], [t("fiches.extension-triceps-a-la-poulie.legende3"), t("fiches.extension-triceps-a-la-poulie.legende2")])],
    cue: t("fiches.extension-triceps-a-la-poulie.consigne"),
    tips: [t("fiches.extension-triceps-a-la-poulie.conseil1"), t("fiches.extension-triceps-a-la-poulie.conseil2"), t("fiches.extension-triceps-a-la-poulie.conseil3")], anim: "De profil" };
