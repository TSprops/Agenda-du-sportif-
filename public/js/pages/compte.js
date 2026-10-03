// Connexion, inscription, champs du profil et page Profil.
import { $, DEFAULT_TYPES, EmailAuthProvider, OBJECTIFS, S, TERMS_V, TYPES_V, arrayRemove, auth, avatarHTML, collection,
  createUserWithEmailAndPassword, db, deleteDoc, deleteUser, doc, esc, fmtDate, getDocs, isEmpty, nf, numOr, query,
  reauthenticateWithCredential, sendPasswordResetEmail, show, signInWithEmailAndPassword, signOut, updateDoc, where, writeBatch } from "../commun/core.js";
import { renderTheme } from "../commun/theme.js";
import { go, saveProfile, subCol, userRef } from "../commun/store.js";
import { blobToData, compress } from "../seances/index.js";
import { renderSound } from "../commun/timer.js";
import { refreshInstallBtn } from "../commun/install.js";
import { SOC, ensureSocialProfile, subscribeSocial } from "../amis/index.js";
import { stopSubscriptions, subscribeData } from "../commun/main.js";
import { LANGUE, existe, t, valeur } from "../commun/i18n.js";

/* ============================================================
   Connexion / inscription
   ============================================================ */
let authMode = "in";
function setAuthMode(m) {
  authMode = m;
  $("tabIn").setAttribute("aria-selected", String(m === "in"));
  $("tabUp").setAttribute("aria-selected", String(m === "up"));
  $("auSubmit").textContent = t(m === "in" ? "connexion.seConnecter" : "connexion.creerCompte");
  $("auPass").autocomplete = m === "in" ? "current-password" : "new-password";
  $("auForgot").hidden = m !== "in";
  $("auErr").hidden = true; $("auOk").hidden = true;
}
$("tabIn").onclick = () => setAuthMode("in");
$("tabUp").onclick = () => setAuthMode("up");
// Erreurs de connexion : « auth/invalid-email » → connexion.erreurs.invalid-email
const authMsg = e => { const k = "connexion.erreurs." + String((e && e.code) || "").replace("auth/", ""); return existe(k) ? t(k) : t("commun.erreur"); };
$("authForm").addEventListener("submit", async e => {
  e.preventDefault();
  const email = $("auEmail").value.trim(), pass = $("auPass").value;
  $("auErr").hidden = true; $("auOk").hidden = true;
  const btn = $("auSubmit"), label = btn.textContent; btn.disabled = true; btn.textContent = t("commun.unInstant");
  try {
    if (authMode === "in") await signInWithEmailAndPassword(auth, email, pass);
    else await createUserWithEmailAndPassword(auth, email, pass);
    $("auPass").value = "";
  } catch (err) { show($("auErr"), authMsg(err)); }
  btn.disabled = false; btn.textContent = label;
});
$("auForgot").onclick = async () => {
  const email = $("auEmail").value.trim();
  $("auErr").hidden = true; $("auOk").hidden = true;
  if (!email) { show($("auErr"), t("connexion.oublieSansEmail")); return; }
  try { await sendPasswordResetEmail(auth, email); show($("auOk"), t("connexion.oublieEnvoye", { email })); }
  catch (err) { show($("auErr"), authMsg(err)); }
};

/* ============================================================
   Champs de profil (inscription et page profil)
   ============================================================ */
function fieldsHTML(px, p) {
  p = p || {};
  return `<div style="display:flex;flex-direction:column;gap:12px">
  <label class="avatar-pick" for="${px}-photo"><span id="${px}-av">${avatarHTML(p, 64)}</span><span><b>${t("profil.champs.photo")}</b><span class="hint">${t(p.photo ? "profil.champs.photoChanger" : "profil.champs.photoAjouter")}</span></span><input id="${px}-photo" type="file" accept="image/*" data-px="${px}"></label>
  <label class="field"><span>${t("profil.champs.pseudo")}</span><input id="${px}-pseudo" value="${esc(p.pseudo)}" placeholder="${esc(t("profil.champs.pseudoExemple"))}" required maxlength="30"></label>
  <label class="field"><span>${t("profil.champs.nomAffiche")}</span><input id="${px}-nomAffiche" value="${esc(p.nomAffiche)}" placeholder="${esc(t("profil.champs.nomAfficheExemple"))}" maxlength="30"><small class="hint">${t("profil.champs.nomAfficheAide")}</small></label>
  <div class="grid2"><label class="field"><span>${t("profil.champs.prenom")}</span><input id="${px}-prenom" value="${esc(p.prenom)}" maxlength="40"></label><label class="field"><span>${t("profil.champs.nom")}</span><input id="${px}-nom" value="${esc(p.nom)}" maxlength="40"></label></div>
  <div class="grid3"><label class="field"><span>${t("profil.champs.age")}</span><input id="${px}-age" inputmode="numeric" value="${esc(p.age)}" placeholder="${esc(t("profil.champs.ans"))}"></label><label class="field"><span>${t("profil.champs.taille")}</span><input id="${px}-taille" inputmode="numeric" value="${esc(p.taille)}" placeholder="cm"></label><label class="field"><span>${t("profil.champs.poids")}</span><input id="${px}-poids" inputmode="decimal" value="${esc(p.poids)}" placeholder="kg"></label></div>
  <div class="field"><span>${t("profil.champs.objectif")}</span><div class="chips" id="${px}-obj">${OBJECTIFS.map(o => `<button type="button" class="chip" data-obj="${esc(o)}" aria-pressed="${p.objectif === o}">${esc(valeur("valeurs.objectifs", o))}</button>`).join("")}</div></div>
  </div>`;
}
function readFields(px) {
  const v = id => $(px + "-" + id).value.trim();
  const sel = document.querySelector(`#${px}-obj [aria-pressed="true"]`);
  const out = { pseudo: v("pseudo"), nomAffiche: v("nomAffiche"), prenom: v("prenom"), nom: v("nom"), age: numOr(v("age")), taille: numOr(v("taille")), poids: numOr(v("poids")), objectif: sel ? sel.dataset.obj : "" };
  if (S.formPhoto[px] !== undefined) out.photo = S.formPhoto[px];
  return out;
}
document.addEventListener("click", e => {
  const b = e.target.closest("[data-obj]"); if (!b) return;
  const was = b.getAttribute("aria-pressed") === "true";
  b.parentElement.querySelectorAll("[data-obj]").forEach(x => x.setAttribute("aria-pressed", "false"));
  b.setAttribute("aria-pressed", String(!was));
});
document.addEventListener("change", async e => {
  const px = e.target.dataset.px; if (!px || !e.target.files[0]) return;
  try {
    const b = await compress(e.target.files[0], 320, .82);
    S.formPhoto[px] = await blobToData(b);
    $(px + "-av").innerHTML = avatarHTML({ photo: S.formPhoto[px] }, 64);
  } catch (err) { /* image illisible : on garde l'ancienne */ }
  e.target.value = "";
});

function renderOnboard() { if (!$("su-pseudo")) { S.formPhoto.su = undefined; $("suFields").innerHTML = fieldsHTML("su", {}); } }
$("signup").addEventListener("submit", async e => {
  e.preventDefault();
  const f = readFields("su");
  if (!f.pseudo) { show($("suErr"), t("inscription.choisisPseudo")); return; }
  if (!$("suTerms").checked) { show($("suErr"), t("inscription.accepteConditions")); return; }
  $("suErr").hidden = true;
  try {
    await saveProfile({
      ...f, photo: f.photo || null, email: S.email, createdAt: Date.now(), visits: 1, lastSeen: Date.now(), lang: LANGUE,
      typesV: TYPES_V, types: DEFAULT_TYPES.map(ty => ({ ...ty })), prefs: { creaDose: 5 }, goal: 3, seen: { amis1: true, v2: true, v3: true }, termsV: TERMS_V, termsAt: Date.now()
    });
    S.visitCounted = true;
    subscribeData(); ensureSocialProfile(); subscribeSocial(); go("home");
  } catch (err) { S.profile = null; show($("suErr"), t("inscription.erreur")); }
});

/* ============================================================
   Page profil
   ============================================================ */
// En-tête façon Instagram : photo, puis nombre d'activités et d'amis.
function renderPfStats() {
  const n = Object.keys(S.days).filter(k => !isEmpty(S.days[k])).length;
  const f = Object.values(SOC.friends).filter(x => x.status === "accepted").length;
  const el = $("pfCounts"); if (!el) return;
  el.innerHTML = `<button type="button" data-go="seances"><b>${n}</b><span>${t("profil.activites", { n })}</span></button><button type="button" data-go="friends"><b>${f}</b><span>${t("profil.amis", { n: f })}</span></button>`;
}
function renderPfView(msg) {
  const p = S.profile || {}, name = [p.prenom, p.nom].filter(Boolean).join(" ");
  const body = [p.age ? t("profil.age", { n: +p.age || 0 }) : "", p.taille ? p.taille + " cm" : "", p.poids ? nf.format(p.poids) + " kg" : ""].filter(Boolean).join(" · ");
  $("pfView").innerHTML = `<div class="pf-top">${avatarHTML(p, 84)}<div class="pf-counts" id="pfCounts"></div></div>
    <div class="pf-id"><b>${esc(p.pseudo || "")}</b>${name ? `<span>${esc(name)}</span>` : ""}${body ? `<span class="hint">${esc(body)}</span>` : ""}${p.objectif ? `<span class="tag">${esc(valeur("valeurs.objectifs", p.objectif))}</span>` : ""}
      ${p.createdAt ? `<span class="hint">${esc(t("profil.membreDepuis", { date: fmtDate(p.createdAt) }))}</span>` : ""}</div>
    ${msg ? `<p class="ok-msg">${esc(msg)}</p>` : ""}
    <div class="grid2"><button type="button" class="btn" id="pfEdit">${t("profil.modifier")}</button><button type="button" class="btn primary" data-go="share">${t("profil.partager")}</button></div>`;
  $("pfView").hidden = false; $("pfForm").hidden = true;
  renderPfStats();
  $("pfEdit").onclick = () => {
    S.formPhoto.pf = undefined; $("pfFields").innerHTML = fieldsHTML("pf", S.profile); $("pfMsg").hidden = true;
    $("pfView").hidden = true; $("pfForm").hidden = false; $("pfForm").scrollIntoView({ block: "start", behavior: "smooth" });
  };
}
$("pfCancel").onclick = () => renderPfView();
function renderProfile() {
  renderPfView(); refreshInstallBtn(); renderTheme(); renderSound();
  $("pfEmail").textContent = S.email ? t("profil.connecteAvec", { email: S.email }) : t("profil.connecteAvecEmail");
  $("pwMsg").hidden = true; $("delForm").hidden = true; $("delAccount").hidden = false; $("delErr").hidden = true;
  $("adminBtn").hidden = !S.admin;
  $("hideSearch").setAttribute("aria-pressed", String(!!(S.profile && S.profile.masquerRecherche)));
}
// Confidentialité : ne pas apparaître dans la recherche d'utilisateurs (le code ami et le QR code marchent toujours).
$("hideSearch").onclick = () => {
  const masque = !(S.profile && S.profile.masquerRecherche);
  $("hideSearch").setAttribute("aria-pressed", String(masque));
  saveProfile({ masquerRecherche: masque }).catch(() => { $("hideSearch").setAttribute("aria-pressed", String(!masque)); });
};
$("pfForm").addEventListener("submit", e => {
  e.preventDefault();
  const f = readFields("pf");
  if (!f.pseudo) { show($("pfMsg"), t("profil.pseudoVide")); return; }
  $("pfMsg").hidden = true;
  const btn = e.submitter || $("pfForm").querySelector("[type=submit]"); btn.disabled = true;
  saveProfile(f).then(() => { renderPfView(t("profil.enregistre")); ensureSocialProfile(); }).catch(() => show($("pfMsg"), t("profil.echec")))
    .finally(() => { btn.disabled = false; });
});
$("pwReset").onclick = async () => {
  try { await sendPasswordResetEmail(auth, S.email); show($("pwMsg"), t("profil.mdpEnvoye", { email: S.email })); }
  catch (err) { show($("pwMsg"), authMsg(err)); }
};
$("logout").onclick = () => signOut(auth);
$("delAccount").onclick = () => { $("delAccount").hidden = true; $("delForm").hidden = false; $("delPass").focus(); };
$("delForm").addEventListener("submit", async e => {
  e.preventDefault();
  const btn = $("delGo"); btn.disabled = true; btn.textContent = t("profil.suppression"); $("delErr").hidden = true;
  try {
    const user = auth.currentUser;
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(S.email, $("delPass").value));
    stopSubscriptions();
    const refs = [];
    for (const name of ["seances", "nutrition", "photos"]) (await getDocs(subCol(name))).forEach(d => refs.push(d.ref));
    (await getDocs(query(collection(db, "messages"), where("uid", "==", S.uid)))).forEach(d => refs.push(d.ref));
    try { (await getDocs(collection(db, "reacts", S.uid, "items"))).forEach(d => refs.push(d.ref)); } catch (x) { /* rien */ }
    try { (await getDocs(collection(db, "comments", S.uid, "items"))).forEach(d => refs.push(d.ref)); } catch (x) { /* rien */ }
    try { (await getDocs(query(collection(db, "challenges"), where("members", "array-contains", S.uid)))).forEach(d => { if (d.data().owner === S.uid) refs.push(d.ref); else updateDoc(d.ref, { members: arrayRemove(S.uid) }).catch(() => {}); }); } catch (x) { /* rien */ }
    try { (await getDocs(query(collection(db, "friends"), where("users", "array-contains", S.uid)))).forEach(d => { const f = d.data(); if (f.status !== "blocked" || f.blockedBy === S.uid) refs.push(d.ref); }); } catch (x) { /* rien */ }
    refs.push(doc(db, "directory", S.uid), doc(db, "share", S.uid));
    for (let i = 0; i < refs.length; i += 400) { const b = writeBatch(db); refs.slice(i, i + 400).forEach(r => b.delete(r)); await b.commit(); }
    await deleteDoc(userRef());
    await deleteUser(user);
  } catch (err) {
    show($("delErr"), err && err.code && err.code.startsWith("auth/") ? authMsg(err) : t("profil.suppressionEchec"));
    btn.disabled = false; btn.textContent = t("profil.supprimerDefinitivement");
  }
});

export { renderOnboard, renderPfStats, renderPfView, renderProfile, setAuthMode };
