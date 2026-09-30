// Démarrage : ancienne adresse (déménagement) et contrôle de version.

if (window.__appMoved) throw new Error("L'app a déménagé : " + window.NEW_HOME);
/* Version : si la page et le code ne correspondent pas (ancien fichier en cache), on recharge proprement. */
const APP_VERSION = "43";
if (window.APP_PAGE_VERSION !== APP_VERSION) {
  let tried = false; try { tried = sessionStorage.getItem("reload-v" + APP_VERSION) === "1"; sessionStorage.setItem("reload-v" + APP_VERSION, "1"); } catch (e) { /* stockage bloqué */ }
  if (!tried && window.__repairApp) { window.__repairApp(); throw new Error("Mise à jour en cours"); }
  if (!tried) { location.replace(location.pathname + "?r=" + Date.now()); throw new Error("Mise à jour en cours"); }
}
