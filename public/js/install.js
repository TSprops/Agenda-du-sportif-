// Installation sur l'écran d'accueil (iPhone, Android).
import { $, S, esc } from "./core.js";
import { go, saveProfile } from "./store.js";
import { newsPending, termsPending } from "./amis/index.js";

/* ============================================================
   Installation sur l'écran d'accueil
   ============================================================ */
const UA = navigator.userAgent;
const IS_IOS = /iphone|ipad|ipod/i.test(UA) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const IS_ANDROID = /android/i.test(UA);
// Navigateur intégré à une autre app (lien ouvert depuis Snapchat, Instagram, Messenger…) : l'installation y est impossible.
const IN_APP = /Instagram|FBAN|FBAV|FB_IAB|Messenger|Snapchat|musical_ly|TikTok|Twitter|LinkedInApp|Line\//i.test(UA);
const standalone = () => window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
let deferredInstall = null;
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredInstall = e; refreshInstallBtn(); });
window.addEventListener("appinstalled", () => { lsSet("install-done", 1); closeInstall(); refreshInstallBtn(); });
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, String(v)); } catch (e) { /* stockage bloqué */ } }
const canInstall = () => !standalone() && !lsGet("install-done") && (IS_IOS || IS_ANDROID || !!deferredInstall);
function refreshInstallBtn() {
  const b = $("installBtn"); if (b) b.hidden = !canInstall();
  const bn = $("installBanner"); if (bn) bn.hidden = !canInstall() || !!lsGet("install-banner-off");
}
const ICON_SHARE = '<svg viewBox="0 0 24 24"><path d="M12 3v12"/><path d="M8 7l4-4 4 4"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>';
const ICON_PLUS = '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/></svg>';
// Comptes créés avant le déménagement (30 sept. 2026) : ils ont peut-être encore l'ancienne icône.
const MOVED_AT = Date.UTC(2026, 8, 30);
const hadOldIcon = () => !!(S.profile && (S.profile.createdAt || 0) < MOVED_AT) && !/github\.io$/.test(location.hostname);
const OLD_ICON_STEP = () => IS_IOS
  ? `<li class="warn"><span class="n">!</span><span><b>Supprime l’ancienne icône</b> : appui long dessus › <b>Supprimer le signet</b> (ou « Supprimer l’app »).</span></li>`
  : `<li class="warn"><span class="n">!</span><span><b>Supprime l’ancienne icône</b> : appui long dessus › <b>Supprimer</b> (ou « Désinstaller »).</span></li>`;
const INSTALL_LEAD = "Ajoute l’app à ton écran d’accueil : elle s’ouvre en plein écran, en un toucher, comme une vraie application.";
function openInstall(welcome) {
  if (!canInstall()) return;
  $("installTitle").textContent = welcome ? "Mets l’app sur ton téléphone" : "Installe l’app";
  const old = welcome && hadOldIcon();
  $("installLead").innerHTML = old
    ? "L’app a une nouvelle adresse ! 🏠 Ajoute la nouvelle icône à ton écran d’accueil, puis <b>supprime l’ancienne</b> : elle ne marche plus."
    : welcome ? "Bienvenue ! 🏠 Ajoute l’app à ton écran d’accueil pour l’ouvrir en un toucher, en plein écran." : INSTALL_LEAD;
  const link = location.origin + location.pathname;
  $("installBody").innerHTML = IN_APP
    ? `<ol class="steps"><li><span class="n">1</span><span>Tu as ouvert le lien depuis une autre app (Snapchat, Instagram…). Il faut l’ouvrir dans <b>${IS_IOS ? "Safari" : "Chrome"}</b>.</span></li>
         <li><span class="n">2</span><span>Touche <b>•••</b> ou l’icône <b>${IS_IOS ? "boussole" : "navigateur"}</b>, puis <b>Ouvrir dans ${IS_IOS ? "Safari" : "le navigateur"}</b>.</span></li>
         <li><span class="n">3</span><span>Tu ne trouves pas ? Copie le lien et colle-le dans ${IS_IOS ? "Safari" : "Chrome"}.</span></li></ol>
       <button type="button" class="btn primary" id="installCopy" style="width:100%">Copier le lien</button>
       <p class="hint" id="installLink" style="text-align:center;user-select:all;word-break:break-all">${esc(link)}</p>`
    : deferredInstall
    ? `<button type="button" class="btn primary" id="installGo" style="width:100%">Installer l’application</button>`
    : IS_IOS
      ? `<ol class="steps"><li><span class="n">1</span><span>Touche <b>Partager</b> en bas de Safari</span><span class="ico">${ICON_SHARE}</span></li>
         <li><span class="n">2</span><span>Choisis <b>Sur l’écran d’accueil</b></span><span class="ico">${ICON_PLUS}</span></li>
         <li><span class="n">3</span><span>Touche <b>Ajouter</b>, c’est fait&nbsp;!</span></li></ol>
         <p class="hint" style="margin-top:6px">Tu ne vois pas « Partager » ? Il est parfois dans le menu <b>•••</b>. Sur un autre navigateur que Safari, ouvre d’abord ce lien dans Safari.</p>`
      : `<ol class="steps"><li><span class="n">1</span><span>Touche le menu <b>⋮</b> en haut à droite</span></li>
         <li><span class="n">2</span><span>Choisis <b>Installer l’application</b> ou <b>Ajouter à l’écran d’accueil</b></span><span class="ico">${ICON_PLUS}</span></li></ol>`;
  if (old && !IN_APP) { const ol = $("installBody").querySelector("ol.steps"); if (ol) ol.insertAdjacentHTML("beforeend", OLD_ICON_STEP()); else $("installBody").insertAdjacentHTML("beforeend", `<ol class="steps">${OLD_ICON_STEP()}</ol>`); }
  $("installBackdrop").hidden = false; $("installSheet").hidden = false;
  const cp = $("installCopy");
  if (cp) cp.onclick = async () => {
    try { await navigator.clipboard.writeText(link); cp.textContent = "Lien copié ✓"; }
    catch (e) { const r = document.createRange(); r.selectNodeContents($("installLink")); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); cp.textContent = "Lien sélectionné : copie-le"; }
  };
  const go = $("installGo");
  if (go) go.onclick = async () => {
    const p = deferredInstall; deferredInstall = null; closeInstall();
    try { p.prompt(); const r = await p.userChoice; if (r && r.outcome === "accepted") lsSet("install-done", 1); } catch (e) { /* fenêtre système fermée */ }
    refreshInstallBtn();
  };
}
function closeInstall() { $("installBackdrop").hidden = true; $("installSheet").hidden = true; }
$("installLater").onclick = () => { lsSet("install-later", Date.now()); closeInstall(); };
$("installBackdrop").onclick = () => { lsSet("install-later", Date.now()); closeInstall(); };
$("installBtn").onclick = () => openInstall();
$("installBannerOpen").onclick = () => openInstall();
$("installBannerClose").onclick = () => { lsSet("install-banner-off", 1); refreshInstallBtn(); };
let installTimer = null;
// Une seule fois par téléphone sur la nouvelle adresse : rappel du mode d'emploi pour installer l'app.
function maybeWelcomeInstall() {
  if (maybeOldIconTip()) return true;
  if (lsGet("welcome-install") || !canInstall() || /github\.io$/.test(location.hostname)) return false;
  clearTimeout(installTimer);
  installTimer = setTimeout(() => {
    if (S.screen !== "home" || document.body.classList.contains("sheet-open") || !$("termsSheet").hidden || !$("newsSheet").hidden || document.body.classList.contains("tour-on")) return;
    lsSet("welcome-install", 1); openInstall(true);
  }, 900);
  return true;
}
// Déjà installée depuis la nouvelle adresse : rappel unique pour supprimer l'ancienne icône.
function maybeOldIconTip() {
  if (!standalone() || !hadOldIcon() || lsGet("old-icon-tip") || (S.profile.seen || {}).oldIcon) return false;
  clearTimeout(installTimer);
  installTimer = setTimeout(() => {
    if (S.screen !== "home" || document.body.classList.contains("sheet-open") || !$("termsSheet").hidden || !$("newsSheet").hidden || document.body.classList.contains("tour-on")) return;
    $("oldIconSteps").innerHTML = OLD_ICON_STEP().replace('class="warn"', "");
    $("oldIconBackdrop").hidden = false; $("oldIconSheet").hidden = false;
  }, 900);
  return true;
}
function closeOldIcon() {
  $("oldIconBackdrop").hidden = true; $("oldIconSheet").hidden = true;
  lsSet("old-icon-tip", 1); saveProfile({ seen: { ...(S.profile.seen || {}), oldIcon: true } });
}
$("oldIconOk").onclick = closeOldIcon;
$("oldIconBackdrop").onclick = closeOldIcon;
function maybeInvite() {
  clearTimeout(installTimer);
  if (newsPending() || termsPending()) return;
  const later = +(lsGet("install-later") || 0);
  if (!canInstall() || Date.now() - later < 7 * 864e5) return;
  installTimer = setTimeout(() => { if (S.screen === "home" && !document.body.classList.contains("sheet-open")) openInstall(); }, 3000);
}

export { closeInstall, lsGet, lsSet, maybeInvite, maybeWelcomeInstall, refreshInstallBtn };
