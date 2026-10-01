// Barre d'onglets en bas de l'écran (comme Strava) : Accueil, Séances, Let's go, Social, Vous.
import { $, S, avatarHTML, isEmpty, sessionsOn, todayK } from "./core.js";
import { go } from "./store.js";
import { openDay } from "../seances/index.js";
import { freshKey } from "../entrainement/index.js";

/* ============================================================
   Onglet allumé selon l'écran ouvert
   ============================================================ */
const TAB_OF = {
  home: "home", nutrition: "home", complements: "home", creatine: "home", tutos: "home", contact: "home", contactform: "home",
  muscles: "home", progress: "home", prog: "home", records: "home", rec: "home", recap: "home", trophees: "home",
  go: "seances", seances: "seances", types: "seances", hub: "seances", routines: "seances", routine: "seances", programs: "seances", crossfit: "seances",
  social: "social", messages: "social", challenges: "social", challenge: "social", ranks: "social", friends: "social", friend: "social",
  profile: "profile", share: "profile", admin: "profile", auser: "profile"
};
let avKey = "";
function updateTabbar(v) {
  const tab = TAB_OF[v];
  $("tabbar").hidden = !tab;
  document.body.classList.toggle("tabbar-on", !!tab);
  $("tabbar").querySelectorAll("[data-tab]").forEach(b => {
    if (b.dataset.tab === tab) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
  });
  // Onglet « Vous » : la photo de profil (ou l'initiale) à la place de l'icône.
  const p = S.profile, k = p ? (p.photo || "") + "|" + (p.pseudo || "") : "";
  if (p && k !== avKey) { avKey = k; $("tabAvatar").innerHTML = avatarHTML(p, 26); }
}
// « + Let's go » : la séance du jour, comme « Noter la séance du jour » dans le calendrier.
function openToday() {
  const t = todayK(), ks = sessionsOn(t).filter(k => !isEmpty(S.days[k])), d = new Date();
  S.view = new Date(d.getFullYear(), d.getMonth(), 1); go("seances"); openDay(ks.length ? ks[ks.length - 1] : freshKey(t));
}
$("tabbar").addEventListener("click", e => {
  const b = e.target.closest("[data-tab]"); if (!b) return;
  const t = b.dataset.tab;
  if (t === "go") openToday(); else go(t === "seances" ? "go" : t);
});

export { updateTabbar };
