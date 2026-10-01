// Barre d'onglets en bas de l'écran (comme Strava) : Accueil, Séances, Let's go, Social, Profil.
import { $ } from "./core.js";
import { go } from "./store.js";

/* ============================================================
   Onglet allumé selon l'écran ouvert
   ============================================================ */
const TAB_OF = {
  home: "home", nutrition: "home", complements: "home", creatine: "home", tutos: "home", contact: "home", contactform: "home",
  seances: "seances", recap: "seances",
  go: "go", types: "go", hub: "go", routines: "go", routine: "go", programs: "go", records: "go", rec: "go", progress: "go", prog: "go", crossfit: "go", trophees: "go", muscles: "go",
  social: "social", messages: "social", feed: "social", challenges: "social", challenge: "social", ranks: "social", friends: "social", friend: "social",
  profile: "profile", admin: "profile", auser: "profile"
};
function updateTabbar(v) {
  const tab = TAB_OF[v];
  $("tabbar").hidden = !tab;
  document.body.classList.toggle("tabbar-on", !!tab);
  $("tabbar").querySelectorAll("[data-tab]").forEach(b => {
    if (b.dataset.tab === tab) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
  });
}
$("tabbar").addEventListener("click", e => { const b = e.target.closest("[data-tab]"); if (b) go(b.dataset.tab); });

export { updateTabbar };
