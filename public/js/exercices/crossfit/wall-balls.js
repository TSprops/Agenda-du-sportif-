// Fiche « Comment faire » : Wall balls.
import { t } from "../../commun/i18n.js";
import { side } from "../_communs.js";
import { wallball } from "./_communs.js";

export default { views: [side(wallball.slice(0, 2), [t("fiches.wall-balls.legende1"), t("fiches.wall-balls.legende2")])],
    animViews: [side(wallball, [t("fiches.wall-balls.legende1"), t("fiches.wall-balls.legende3"), t("fiches.wall-balls.legende4"), t("fiches.wall-balls.legende5")])],
    cue: t("fiches.wall-balls.consigne"),
    tips: [t("fiches.wall-balls.conseil1"), t("fiches.wall-balls.conseil2"), t("fiches.wall-balls.conseil3")] };
