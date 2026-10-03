// Amis : recherche d'utilisateurs avec suggestions pendant la frappe.
// La recherche se fait sur le serveur (functions/recherche.js) : 5 résultats au plus, infos publiques seulement.
import { SOC, pairId } from "./etat.js";
import { $, S, appelerServeur, avatarHTML, esc } from "../commun/core.js";
import { t } from "../commun/i18n.js";

const CODE_RE = /^[A-Za-z]+-\d{4}$/;
const DELAI = 300, CACHE_MS = 60000;
// etat : vide, court (1 caractère), chargement, ok, aucun, limite (trop de requêtes), erreur.
const R = { etat: "vide", resultats: [], num: 0, minuteur: null, cache: new Map() };
// Même normalisation que le serveur : « Daphné » → « daphne ».
const compact = s => String(s || "").toLowerCase().replace(/œ/g, "oe").replace(/æ/g, "ae").replace(/ß/g, "ss")
  .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "");
const cleDe = texte => CODE_RE.test(texte) ? texte.toUpperCase() : compact(texte);

export function rechercheHTML() {
  return `<form class="card" id="friendSearch" autocomplete="off" role="search">
      <div class="lbl">${t("amis.ajouter")}</div>
      <input id="fsInput" type="search" enterkeyhint="search" autocapitalize="off" spellcheck="false" maxlength="40"
        placeholder="${esc(t("recherche.placeholder"))}" aria-label="${esc(t("recherche.placeholder"))}" aria-controls="fsSugg" aria-autocomplete="list">
      <div id="fsSugg" class="fs-sugg" aria-live="polite"></div>
      <button type="button" class="btn" id="scanFriend">${t("amis.scanner")}</button>
    </form>`;
}
// Bouton selon la relation : Ajouter, Demande envoyée, Accepter (demande reçue) ou Déjà ami.
function boutonDe(u) {
  const f = SOC.friends[pairId(S.uid, u.uid)];
  if (!f) return `<button type="button" class="btn primary sm" data-fadd="${esc(u.uid)}" aria-label="${esc(t("recherche.ajouterAria", { pseudo: u.pseudo }))}">${t("commun.ajouter")}</button>`;
  if (f.status === "accepted") return `<span class="tag done">${t("recherche.dejaAmi")}</span>`;
  if (f.status === "pending" && f.to === S.uid) return `<button type="button" class="btn primary sm" data-faccept="${esc(pairId(S.uid, u.uid))}">${t("amis.accepter")}</button>`;
  if (f.status === "pending") return `<span class="tag done">${t("amis.demandeEnvoyee")}</span>`;
  return "";
}
export function renderSuggestions() {
  const el = $("fsSugg"); if (!el) return;
  const msg = { court: t("recherche.deuxCaracteres"), aucun: t("recherche.aucun"), limite: t("recherche.limite"), erreur: t("recherche.erreur") }[R.etat];
  const liste = R.resultats.filter(u => { const f = SOC.friends[pairId(S.uid, u.uid)]; return !f || f.status !== "blocked"; });
  el.setAttribute("aria-busy", String(R.etat === "chargement"));
  el.innerHTML = (R.etat === "chargement" ? `<p class="hint fs-load"><span class="fs-spin" aria-hidden="true"></span>${t("recherche.chargement")}</p>` : "")
    + (msg ? `<p class="hint">${esc(msg)}</p>` : "")
    + (liste.length ? `<div class="fs-list${R.etat === "chargement" ? " stale" : ""}" role="list">${liste.map(u => `<div class="frow" role="listitem">${avatarHTML(u, 40)}<span class="main"><b>${esc(u.pseudo)}</b>${u.nomAffiche && u.nomAffiche !== u.pseudo ? `<span>${esc(u.nomAffiche)}</span>` : ""}</span>${boutonDe(u)}</div>`).join("")}</div>` : "");
}
function afficher(resultats) {
  R.resultats = resultats; R.etat = resultats.length ? "ok" : "aucun";
  resultats.forEach(u => { if (!SOC.dir[u.uid]) SOC.dir[u.uid] = { uid: u.uid, pseudo: u.pseudo, photo: u.photo }; });
  renderSuggestions();
}
// Envoie la requête. Une réponse arrivée après une frappe plus récente est ignorée.
async function lancer(texte) {
  const num = ++R.num, cle = cleDe(texte);
  try {
    const { resultats } = await appelerServeur("rechercherUtilisateurs", { texte });
    R.cache.set(cle, { at: Date.now(), resultats });
    if (num === R.num) afficher(resultats || []);
  } catch (e) {
    if (num !== R.num) return;
    R.etat = e && e.code === "functions/resource-exhausted" ? "limite" : "erreur"; R.resultats = [];
    renderSuggestions();
  }
}
// À chaque frappe : attend 300 ms sans nouvelle frappe avant d'interroger le serveur.
function surFrappe(immediat) {
  const texte = $("fsInput").value.trim(), cle = cleDe(texte);
  clearTimeout(R.minuteur); R.num++; // la requête en cours devient inutile : sa réponse sera ignorée
  if (!CODE_RE.test(texte) && cle.length < 2) { R.etat = cle.length ? "court" : "vide"; R.resultats = []; renderSuggestions(); return; }
  const c = R.cache.get(cle);
  if (c && Date.now() - c.at < CACHE_MS) { afficher(c.resultats); return; }
  R.etat = "chargement"; renderSuggestions();
  if (immediat) lancer(texte); else R.minuteur = setTimeout(() => lancer(texte), DELAI);
}
// Recherche immédiate (lien d'invitation, QR code scanné).
export function searchUsers(texte) { const inp = $("fsInput"); if (!inp) return; inp.value = texte; surFrappe(true); }
export function resetRecherche() { clearTimeout(R.minuteur); Object.assign(R, { etat: "vide", resultats: [], num: R.num + 1, cache: new Map() }); }

document.addEventListener("input", e => { if (e.target.id === "fsInput") surFrappe(false); });
document.addEventListener("submit", e => { if (e.target.id === "friendSearch") { e.preventDefault(); surFrappe(true); } });
