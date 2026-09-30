// Connexion, inscription, champs du profil et page Profil.
import { $, DEFAULT_TYPES, EmailAuthProvider, OBJECTIFS, S, TERMS_V, TYPES_V, arrayRemove, auth, avatarHTML, collection,
  createUserWithEmailAndPassword, db, deleteDoc, deleteUser, doc, esc, fmtDate, getDocs, nf, numOr, query,
  reauthenticateWithCredential, sendPasswordResetEmail, show, signInWithEmailAndPassword, signOut, updateDoc, where, writeBatch } from "./core.js";
import { renderTheme } from "./theme.js";
import { go, saveProfile, subCol, userRef } from "./store.js";
import { blobToData, compress } from "./seances.js";
import { renderSound } from "./timer.js";
import { refreshInstallBtn } from "./install.js";
import { ensureSocialProfile, subscribeSocial } from "./friends.js";
import { stopSubscriptions, subscribeData } from "./main.js";

/* ============================================================
   Connexion / inscription
   ============================================================ */
let authMode = "in";
function setAuthMode(m) {
  authMode = m;
  $("tabIn").setAttribute("aria-selected", String(m === "in"));
  $("tabUp").setAttribute("aria-selected", String(m === "up"));
  $("auSubmit").textContent = m === "in" ? "Se connecter" : "Créer mon compte";
  $("auPass").autocomplete = m === "in" ? "current-password" : "new-password";
  $("auForgot").hidden = m !== "in";
  $("auErr").hidden = true; $("auOk").hidden = true;
}
$("tabIn").onclick = () => setAuthMode("in");
$("tabUp").onclick = () => setAuthMode("up");
const AUTH_ERRORS = {
  "auth/invalid-email": "Cette adresse e-mail n’est pas valide.",
  "auth/email-already-in-use": "Un compte existe déjà avec cet e-mail. Connecte-toi plutôt.",
  "auth/weak-password": "Choisis un mot de passe d’au moins 6 caractères.",
  "auth/invalid-credential": "E-mail ou mot de passe incorrect.",
  "auth/wrong-password": "Mot de passe incorrect.",
  "auth/user-not-found": "Aucun compte avec cet e-mail.",
  "auth/too-many-requests": "Trop d’essais. Patiente quelques minutes puis réessaie.",
  "auth/network-request-failed": "Pas de connexion internet. Vérifie ton réseau.",
  "auth/missing-password": "Entre ton mot de passe."
};
const authMsg = e => AUTH_ERRORS[e && e.code] || "Une erreur est survenue. Réessaie.";
$("authForm").addEventListener("submit", async e => {
  e.preventDefault();
  const email = $("auEmail").value.trim(), pass = $("auPass").value;
  $("auErr").hidden = true; $("auOk").hidden = true;
  const btn = $("auSubmit"), label = btn.textContent; btn.disabled = true; btn.textContent = "Un instant…";
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
  if (!email) { show($("auErr"), "Entre ton e-mail ci-dessus, puis touche « Mot de passe oublié ? »."); return; }
  try { await sendPasswordResetEmail(auth, email); show($("auOk"), "Si un compte existe avec " + email + ", un e-mail vient de partir (expéditeur : noreply@agenda-du-sportif.firebaseapp.com). Regarde aussi dans tes spams ou courriers indésirables, il arrive en 1 à 5 minutes."); }
  catch (err) { show($("auErr"), authMsg(err)); }
};

/* ============================================================
   Champs de profil (inscription et page profil)
   ============================================================ */
function fieldsHTML(px, p) {
  p = p || {};
  return `<div style="display:flex;flex-direction:column;gap:12px">
  <label class="avatar-pick" for="${px}-photo"><span id="${px}-av">${avatarHTML(p, 64)}</span><span><b>Photo de profil</b><span class="hint">Touche pour ${p.photo ? "changer" : "ajouter"} ta photo</span></span><input id="${px}-photo" type="file" accept="image/*" data-px="${px}"></label>
  <label class="field"><span>Pseudo *</span><input id="${px}-pseudo" value="${esc(p.pseudo)}" placeholder="ex. TheoFit" required maxlength="30"></label>
  <div class="grid2"><label class="field"><span>Prénom</span><input id="${px}-prenom" value="${esc(p.prenom)}" maxlength="40"></label><label class="field"><span>Nom</span><input id="${px}-nom" value="${esc(p.nom)}" maxlength="40"></label></div>
  <div class="grid3"><label class="field"><span>Âge</span><input id="${px}-age" inputmode="numeric" value="${esc(p.age)}" placeholder="ans"></label><label class="field"><span>Taille</span><input id="${px}-taille" inputmode="numeric" value="${esc(p.taille)}" placeholder="cm"></label><label class="field"><span>Poids</span><input id="${px}-poids" inputmode="decimal" value="${esc(p.poids)}" placeholder="kg"></label></div>
  <div class="field"><span>Objectif</span><div class="chips" id="${px}-obj">${OBJECTIFS.map(o => `<button type="button" class="chip" data-obj="${esc(o)}" aria-pressed="${p.objectif === o}">${esc(o)}</button>`).join("")}</div></div>
  </div>`;
}
function readFields(px) {
  const v = id => $(px + "-" + id).value.trim();
  const sel = document.querySelector(`#${px}-obj [aria-pressed="true"]`);
  const out = { pseudo: v("pseudo"), prenom: v("prenom"), nom: v("nom"), age: numOr(v("age")), taille: numOr(v("taille")), poids: numOr(v("poids")), objectif: sel ? sel.dataset.obj : "" };
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
  if (!f.pseudo) { show($("suErr"), "Choisis un pseudo pour terminer ton inscription."); return; }
  if (!$("suTerms").checked) { show($("suErr"), "Accepte les conditions d’utilisation pour terminer ton inscription."); return; }
  $("suErr").hidden = true;
  try {
    await saveProfile({
      ...f, photo: f.photo || null, email: S.email, createdAt: Date.now(), visits: 1, lastSeen: Date.now(),
      typesV: TYPES_V, types: DEFAULT_TYPES.map(t => ({ ...t })), prefs: { creaDose: 5 }, goal: 3, seen: { amis1: true, v2: true, v3: true }, termsV: TERMS_V, termsAt: Date.now()
    });
    S.visitCounted = true;
    subscribeData(); ensureSocialProfile(); subscribeSocial(); go("home");
  } catch (err) { S.profile = null; show($("suErr"), "Impossible d’enregistrer ton profil. Vérifie ta connexion et réessaie."); }
});

/* ============================================================
   Page profil
   ============================================================ */
function renderPfStats() {
  const p = S.profile || {}, ks = Object.keys(S.days);
  const cd = Object.keys(S.nut).filter(k => S.nut[k].creatine).length;
  $("pfStats").innerHTML = `<div class="stat"><b>${ks.length}</b><span>séance${ks.length > 1 ? "s" : ""}</span></div><div class="stat"><b>${cd}</b><span>jour${cd > 1 ? "s" : ""} de créatine</span></div><div class="stat"><b style="font-size:17px;line-height:1.6">${p.createdAt ? esc(fmtDate(p.createdAt)) : "–"}</b><span>membre depuis</span></div>`;
}
function renderPfView(msg) {
  const p = S.profile || {}, dash = v => (v === "" || v == null) ? `<dd class="none">Non renseigné</dd>` : `<dd>${esc(v)}</dd>`;
  $("pfView").innerHTML = `<div class="pf-top">${avatarHTML(p, 72)}<div><b>${esc(p.pseudo || "")}</b>${p.objectif ? `<span class="tag">${esc(p.objectif)}</span>` : ""}</div></div>
    <dl class="kv"><dt>Prénom</dt>${dash(p.prenom)}<dt>Nom</dt>${dash(p.nom)}<dt>Âge</dt>${dash(p.age ? p.age + " ans" : "")}<dt>Taille</dt>${dash(p.taille ? p.taille + " cm" : "")}<dt>Poids</dt>${dash(p.poids ? nf.format(p.poids) + " kg" : "")}<dt>Objectif</dt>${dash(p.objectif)}</dl>
    ${msg ? `<p class="ok-msg">${esc(msg)}</p>` : ""}
    <button type="button" class="btn" id="pfEdit">Modifier</button>`;
  $("pfView").hidden = false; $("pfForm").hidden = true;
  $("pfEdit").onclick = () => {
    S.formPhoto.pf = undefined; $("pfFields").innerHTML = fieldsHTML("pf", S.profile); $("pfMsg").hidden = true;
    $("pfView").hidden = true; $("pfForm").hidden = false; $("pfForm").scrollIntoView({ block: "start", behavior: "smooth" });
  };
}
$("pfCancel").onclick = () => renderPfView();
function renderProfile() {
  renderPfView(); refreshInstallBtn(); renderTheme(); renderSound();
  $("pfEmail").textContent = "Connecté avec " + (S.email || "ton e-mail");
  $("pwMsg").hidden = true; $("delForm").hidden = true; $("delAccount").hidden = false; $("delErr").hidden = true;
  $("adminBtn").hidden = !S.admin; renderPfStats();
}
$("pfForm").addEventListener("submit", e => {
  e.preventDefault();
  const f = readFields("pf");
  if (!f.pseudo) { show($("pfMsg"), "Le pseudo ne peut pas être vide."); return; }
  $("pfMsg").hidden = true;
  const btn = e.submitter || $("pfForm").querySelector("[type=submit]"); btn.disabled = true;
  saveProfile(f).then(() => { renderPfView("Profil enregistré."); ensureSocialProfile(); }).catch(() => show($("pfMsg"), "Échec de l’enregistrement. Vérifie ta connexion et réessaie."))
    .finally(() => { btn.disabled = false; });
});
$("pwReset").onclick = async () => {
  try { await sendPasswordResetEmail(auth, S.email); show($("pwMsg"), "E-mail envoyé à " + S.email + ". Suis le lien pour choisir un nouveau mot de passe (regarde aussi dans tes spams)."); }
  catch (err) { show($("pwMsg"), authMsg(err)); }
};
$("logout").onclick = () => signOut(auth);
$("delAccount").onclick = () => { $("delAccount").hidden = true; $("delForm").hidden = false; $("delPass").focus(); };
$("delForm").addEventListener("submit", async e => {
  e.preventDefault();
  const btn = $("delGo"); btn.disabled = true; btn.textContent = "Suppression…"; $("delErr").hidden = true;
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
    show($("delErr"), err && err.code && err.code.startsWith("auth/") ? authMsg(err) : "La suppression a échoué. Réessaie.");
    btn.disabled = false; btn.textContent = "Supprimer définitivement";
  }
});

export { renderOnboard, renderPfStats, renderPfView, renderProfile, setAuthMode };
