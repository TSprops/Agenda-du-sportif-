// Langue de l'app : textes traduits (fichiers langues/<code>.json), pluriels, dates et nombres.
// La langue est choisie avant le chargement des autres modules (await au premier niveau) :
// tout le code peut appeler t() dès son chargement. Changer de langue recharge l'app.
import { LANGUES } from "./langues.js";

const DEFAUT = "fr";
const CLE = "langue";
const connue = c => LANGUES.some(l => l.code === c);
const base = c => String(c || "").toLowerCase().split(/[-_]/)[0];

// Premier lancement : langue de l'appareil si elle est gérée, sinon le français.
function choisir() {
  let l = null; try { l = localStorage.getItem(CLE); } catch (e) { /* stockage bloqué */ }
  if (connue(l)) return l;
  const prefs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
  for (const p of prefs) if (connue(base(p))) return base(p);
  return DEFAUT;
}
const LANGUE = choisir();
const INFO = LANGUES.find(l => l.code === LANGUE);
// Format régional : celui de l'appareil s'il parle la même langue (en-US, en-GB, es-MX…), sinon celui du fichier.
const LOCALE = (() => {
  const prefs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
  const p = prefs.find(x => base(x) === LANGUE && /[-_]/.test(x));
  try { if (p) return Intl.getCanonicalLocales(p.replace("_", "-"))[0]; } catch (e) { /* code invalide */ }
  return INFO.locale;
})();
try { localStorage.setItem(CLE, LANGUE); } catch (e) { /* stockage bloqué */ }

// Fichiers JSON imbriqués par écran → { "ecran.element": "texte" }.
function aplatir(o, pre, out) {
  for (const [k, v] of Object.entries(o)) {
    if (k === "_langue") continue;
    if (v && typeof v === "object") aplatir(v, pre + k + ".", out); else out[pre + k] = v;
  }
  return out;
}
async function charger(code) {
  const r = await fetch("langues/" + code + ".json");
  if (!r.ok) throw new Error("langues/" + code + ".json : " + r.status);
  return aplatir(await r.json(), "", {});
}
const [FR, TXT] = await Promise.all([charger(DEFAUT), LANGUE === DEFAUT ? null : charger(LANGUE).catch(() => null)]);
const DICO = TXT || FR;

const PLURIEL = new Intl.PluralRules(LOCALE), PLURIEL_FR = new Intl.PluralRules("fr-FR");
const NOMBRE = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 2 });

function chercher(dico, regles, cle, vars) {
  if (vars && typeof vars.n === "number") {
    const f = cle + "_" + (vars.n === 0 && (cle + "_zero") in dico ? "zero" : regles.select(vars.n));
    if (f in dico) return dico[f];
    if ((cle + "_other") in dico) return dico[cle + "_other"];
  }
  return dico[cle];
}
// Texte traduit. Variables : t("accueil.serie", { n: 3, nom: "Squat" }) avec « {n} séries de {nom} ».
// Pluriel : clés « _one » / « _other » (et « _zero » facultatif), choisies selon {n}.
function t(cle, vars) {
  let s = chercher(DICO, PLURIEL, cle, vars);
  if (s === undefined && DICO !== FR) s = chercher(FR, PLURIEL_FR, cle, vars);
  if (s === undefined) { console.warn("Traduction manquante : " + cle); return cle; }
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (m, v) => vars[v] === undefined || vars[v] === null ? m : typeof vars[v] === "number" ? NOMBRE.format(vars[v]) : String(vars[v]));
}
// Texte français de référence : valeurs enregistrées en base (identifiants historiques en français).
const tFr = cle => FR[cle] ?? cle;
const existe = cle => cle in DICO || cle in FR || (cle + "_other") in DICO || (cle + "_other") in FR;

// Valeurs enregistrées en base en français (noms d'exercices, objectifs…) : on garde le français
// comme identifiant et on traduit seulement à l'affichage. Groupe = section du fichier de langue
// qui associe un identifiant à un nom (ex. « exercices.noms »).
const INVERSE = {};
function inverse(groupe, dico) {
  const k = groupe + "|" + (dico === FR ? "fr" : LANGUE);
  if (!INVERSE[k]) {
    const m = new Map(), pre = groupe + ".";
    for (const [c, v] of Object.entries(dico)) if (c.startsWith(pre) && !c.slice(pre.length).includes(".")) m.set(String(v).toLowerCase(), c);
    INVERSE[k] = m;
  }
  return INVERSE[k];
}
// « Développé couché » → « Bench press » (texte inconnu : renvoyé tel quel).
function valeur(groupe, fr) {
  if (fr === undefined || fr === null || fr === "") return fr;
  const c = inverse(groupe, FR).get(String(fr).toLowerCase());
  return c ? t(c) : fr;
}
// L'inverse, pour enregistrer : « Bench press » (saisi en anglais) → « Développé couché ».
function canon(groupe, saisi) {
  const s = String(saisi ?? "").trim(); if (!s) return s;
  const c = inverse(groupe, DICO).get(s.toLowerCase());
  return c && FR[c] !== undefined ? FR[c] : s;
}
// Identifiant d'une valeur française (« Développé couché » → « developpe-couche »), ou null.
function idDe(groupe, fr) {
  const c = inverse(groupe, FR).get(String(fr ?? "").toLowerCase());
  return c ? c.slice(groupe.length + 1) : null;
}
// Contenus écrits en base dans plusieurs langues : { fr: "…", en: "…", es: "…" } (ou un simple texte).
function texteLocal(v) {
  if (!v || typeof v !== "object") return v ?? "";
  return v[LANGUE] ?? v[DEFAUT] ?? Object.values(v)[0] ?? "";
}

/* Dates, heures et nombres, selon la langue choisie. */
const fmtCache = {};
const dtf = opts => { const k = JSON.stringify(opts); return fmtCache[k] || (fmtCache[k] = new Intl.DateTimeFormat(LOCALE, opts)); };
const dateLongue = d => dtf({ day: "numeric", month: "long", year: "numeric" }).format(new Date(d));
const dateFormat = (d, opts) => dtf(opts).format(new Date(d));
const heure = d => dtf({ hour: "2-digit", minute: "2-digit" }).format(new Date(d));
// Noms des mois (0 = janvier) et des jours (0 = dimanche), sans majuscule forcée.
const nomMois = (i, forme = "long") => dtf({ month: forme, timeZone: "UTC" }).format(new Date(Date.UTC(2021, i, 1)));
const nomJour = (i, forme = "long") => dtf({ weekday: forme, timeZone: "UTC" }).format(new Date(Date.UTC(2021, 0, 3 + i)));
const nombre = (n, opts) => opts ? new Intl.NumberFormat(LOCALE, opts).format(n) : NOMBRE.format(n);
const RELATIF = new Intl.RelativeTimeFormat(LOCALE, { numeric: "auto" });
const relatif = (n, unite) => RELATIF.format(n, unite);
const LISTE = typeof Intl.ListFormat === "function" ? new Intl.ListFormat(LOCALE, { type: "conjunction" }) : null;
const liste = arr => LISTE ? LISTE.format(arr.map(String)) : arr.join(", ");
// Majuscule initiale (mois et jours sont en minuscules en français et en espagnol).
const majuscule = s => s ? s.charAt(0).toLocaleUpperCase(LOCALE) + s.slice(1) : s;

/* HTML statique : data-i18n (texte), data-i18n-html (texte avec balises), data-i18n-placeholder,
   data-i18n-aria-label, data-i18n-title, data-i18n-alt. Pour data-i18n sur un élément qui contient
   aussi des icônes, seul son texte est remplacé. */
const ATTRS = ["placeholder", "aria-label", "title", "alt", "content"];
function traduireDom(racine = document) {
  racine.querySelectorAll("[data-i18n]").forEach(el => {
    const txt = t(el.dataset.i18n);
    if (!el.children.length) { el.textContent = txt; return; }
    const n = [...el.childNodes].find(x => x.nodeType === 3 && x.nodeValue.trim());
    if (n) n.nodeValue = n.nodeValue.replace(n.nodeValue.trim(), txt); else el.append(txt);
  });
  racine.querySelectorAll("[data-i18n-html]").forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  for (const a of ATTRS) racine.querySelectorAll(`[data-i18n-${a}]`).forEach(el => el.setAttribute(a, t(el.getAttribute("data-i18n-" + a))));
}
document.documentElement.lang = LANGUE;
traduireDom();
// Textes du filet de secours de index.html (affichés avant le chargement des modules, la fois suivante).
try { localStorage.setItem("secours", JSON.stringify({ lent: t("secours.lent"), reparer: t("secours.reparer"), donnees: t("secours.donnees") })); } catch (e) { /* stockage bloqué */ }

// Changer de langue : enregistrée sur l'appareil, puis l'app se recharge dans la nouvelle langue.
function changerLangue(code, recharger = true) {
  if (!connue(code)) return;
  try { localStorage.setItem(CLE, code); } catch (e) { /* stockage bloqué */ }
  if (recharger && code !== LANGUE) location.reload();
}

export { LANGUE, LANGUES, LOCALE, canon, changerLangue, dateFormat, dateLongue, existe, heure, idDe, liste, majuscule, nomJour, nomMois, nombre,
  relatif, t, tFr, texteLocal, traduireDom, valeur };
