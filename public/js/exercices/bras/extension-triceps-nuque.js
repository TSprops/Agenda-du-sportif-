// Fiche « Comment faire » : Extension triceps nuque.
import { t } from "../../commun/i18n.js";
import { front, side } from "../_communs.js";
import { ohExt, ohExtF } from "./_communs.js";

export default { views: [side([ohExt(0), ohExt(1)], [t("fiches.extension-triceps-nuque.legende1"), t("fiches.extension-triceps-nuque.legende2")]), front([ohExtF(0), ohExtF(1)], [t("fiches.extension-triceps-nuque.legende3"), t("fiches.extension-triceps-nuque.legende4")])],
    cue: t("fiches.extension-triceps-nuque.consigne"),
    tips: [t("fiches.extension-triceps-nuque.conseil1"), t("fiches.extension-triceps-nuque.conseil2"), t("fiches.extension-triceps-nuque.conseil3")], anim: "De profil" };
