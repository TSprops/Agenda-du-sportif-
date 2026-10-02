// Fiche « Comment faire » : Développé couché.
import { t } from "../../commun/i18n.js";
import { front, side } from "../_communs.js";
import { BENCH_TIPS, benchEq, benchF, benchLie, pressArms } from "./_communs.js";

export default { grip: "bench", views: [side([benchLie(0, pressArms(1), benchEq(0)), benchLie(0, pressArms(0), benchEq(0))], [t("fiches.developpe-couche.legende1"), t("fiches.developpe-couche.legende2")]),
      front([benchF(1), benchF(0)], [t("fiches.developpe-couche.legende3"), t("fiches.developpe-couche.legende2")])],
    cue: t("fiches.developpe-couche.consigne"), tips: BENCH_TIPS, anim: "De profil" };
