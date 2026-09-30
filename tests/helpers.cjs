// Outils communs aux tests (émulateurs Firebase : auth 9099, firestore 8080, site 5000).
const BASE = process.env.BASE_URL || "http://127.0.0.1:5000/";
const AUTH = "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/";
const FS = "http://127.0.0.1:8080/v1/projects/demo-agenda/databases/(default)/documents/";
const OWNER = { authorization: "Bearer owner", "content-type": "application/json" };

async function req(url, opt = {}) { const r = await fetch(url, opt); let body = null; try { body = await r.json(); } catch (e) { /* vide */ } return { status: r.status, body }; }
// Encodage Firestore REST d'une valeur JS.
function val(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === "string") return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(val) } };
  return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, x]) => [k, val(x)])) } };
}
const fields = o => ({ fields: Object.fromEntries(Object.entries(o).map(([k, x]) => [k, val(x)])) });
// Écrit un document en contournant les règles (compte « owner » de l'émulateur).
const put = (path, data) => req(FS + path, { method: "PATCH", headers: OWNER, body: JSON.stringify(fields(data)) });
const del = path => req(FS + path, { method: "DELETE", headers: OWNER });
async function newUser() {
  const r = await req(AUTH + "accounts:signUp?key=demo", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: "u" + Math.random().toString(36).slice(2) + "@test.fr", password: "secret123", returnSecureToken: true }) });
  return { uid: r.body.localId, token: r.body.idToken, H: { authorization: "Bearer " + r.body.idToken, "content-type": "application/json" } };
}
async function uidOf(email) {
  const r = await req(AUTH + "projects/demo-agenda/accounts:query", { method: "POST", headers: OWNER, body: JSON.stringify({ returnUserInfo: true }) });
  return (r.body.userInfo || []).find(u => u.email === email).localId;
}
// Crée un compte depuis l'app (inscription + profil + tutoriel passé) et renvoie la page.
async function signupPage(browser, pseudo) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, acceptDownloads: true });
  const p = await ctx.newPage(); p.errs = [];
  p.on("pageerror", e => p.errs.push(e.message));
  await p.goto(BASE); await p.waitForSelector("#v-login:not([hidden])");
  // Tutoriels guidés coupés pour les parcours de test (ils ont leur propre test).
  await p.evaluate(() => { localStorage.setItem("help-hint-off", "1"); localStorage.setItem("tours-off", "1"); localStorage.setItem("fete-off", "1"); });
  p.email = pseudo.toLowerCase() + Date.now() + "@test.fr";
  await p.click("#tabUp"); await p.fill("#auEmail", p.email); await p.fill("#auPass", "secret123"); await p.click("#auSubmit");
  await p.waitForSelector("#v-onboard:not([hidden])"); await p.fill("#su-pseudo", pseudo);
  await p.click("#signup button[type=submit]");
  if (!(await p.$eval("#suErr", e => e.hidden))) { await p.check("#suTerms"); await p.click("#signup button[type=submit]"); }
  await p.waitForSelector("#v-home:not([hidden])");
  p.uid = await uidOf(p.email);
  return p;
}
const screen = p => p.evaluate(() => [...document.querySelectorAll(".view")].find(v => !v.hidden)?.id);
const home = async p => { await p.goto(BASE); await p.waitForSelector("#v-home:not([hidden])"); await p.waitForTimeout(600); };
module.exports = { BASE, FS, req, put, del, fields, newUser, uidOf, signupPage, screen, home };
