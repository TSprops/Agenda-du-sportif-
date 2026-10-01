// Amis : page « Partager mon profil » (code ami, QR code, lien d'invitation) et scanner de QR code.
import { SOC } from "./etat.js";
import { searchUsers } from "./liste.js";
import { $, S, avatarHTML, esc, plural } from "../commun/core.js";
import { go } from "../commun/store.js";
import { lsGet, lsSet } from "../commun/install.js";
import { toast } from "../entrainement/index.js";
import qrcode from "../../vendor/qrcode.js";

/* ============================================================
   Lien d'invitation : …/?ami=CODE ouvre l'app et cherche ce code ami
   ============================================================ */
const CODE_RE = /^[A-Za-z]+-\d{4}$/;
const inviteLink = code => location.origin + location.pathname + "?ami=" + encodeURIComponent(code);
// Code ami lu dans un lien (ou un code tapé tel quel).
function codeFrom(txt) {
  txt = String(txt || "").trim();
  if (CODE_RE.test(txt)) return txt.toUpperCase();
  try { const c = new URL(txt).searchParams.get("ami"); return c && CODE_RE.test(c) ? c.toUpperCase() : ""; } catch (e) { return ""; }
}
// À l'ouverture de l'app par un lien d'invitation : on garde le code jusqu'à la connexion.
(function keepInvite() {
  const u = new URL(location.href), c = codeFrom(u.searchParams.get("ami"));
  if (!u.searchParams.has("ami")) return;
  if (c) lsSet("ami-invite", c);
  u.searchParams.delete("ami"); history.replaceState(null, "", u.pathname + u.search + u.hash);
})();
function searchCode(code) { go("friends"); $("fsInput").value = code; searchUsers(code); }
// Appelé en arrivant sur l'accueil : ouvre la page Amis avec le profil de l'invitation.
export function maybeFriendInvite() {
  const c = lsGet("ami-invite"); if (!c || !S.profile) return false;
  lsSet("ami-invite", ""); searchCode(c); return true;
}

/* ============================================================
   Page « Partager mon profil »
   ============================================================ */
function qrSVG(text) {
  const q = qrcode(0, "M"); q.addData(text); q.make();
  return q.createSvgTag({ cellSize: 6, margin: 2, scalable: true });
}
export function renderShare() {
  const p = S.profile || {}, code = p.friendCode || "", n = Object.keys(S.days).length;
  const friends = Object.values(SOC.friends).filter(f => f.status === "accepted").length;
  $("shareBody").innerHTML = `<section class="card share-card">
      ${avatarHTML(p, 72)}
      <b class="share-name">${esc(p.pseudo || "")}</b>
      <span class="hint">${plural(n, "activité")} · ${plural(friends, "ami")}</span>
      ${code ? `<div class="qr-box" role="img" aria-label="QR code de mon profil">${qrSVG(inviteLink(code))}</div>` : ""}
      <span class="lbl">Mon code ami</span>
      <b class="share-code" id="shareCode">${esc(code || "…")}</b>
      <div class="grid2"><button class="btn" id="shareCopy">📋 Copier</button><button class="btn primary" id="shareLink">📤 Envoyer le lien</button></div>
      <p class="hint">Ton ami prend le QR code en photo avec son téléphone (ou le bouton « Scanner » de l’app) et arrive directement sur ton profil.</p>
    </section>
    <button class="seance-tile hl" id="scanBtn"><span class="disc-ico" aria-hidden="true" style="--tc:var(--red-hi)"><svg viewBox="0 0 24 24"><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><circle cx="12" cy="12" r="3.2"/></svg></span><span class="mc"><b>Scanner le code d’un ami</b><span>Ouvre l’appareil photo</span></span><span class="arrow" aria-hidden="true">›</span></button>`;
}
function copy(txt, btn) {
  (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(() => { btn.textContent = "Copié ✓"; }, () => toast("Copie impossible : " + txt));
}
$("shareBody").addEventListener("click", e => {
  const b = e.target.closest("button"); if (!b) return;
  const code = (S.profile || {}).friendCode; if (b.id !== "scanBtn" && !code) return;
  if (b.id === "shareCopy") copy(code, b);
  else if (b.id === "shareLink") {
    const url = inviteLink(code), text = "Ajoute-moi sur L’agenda du sportif ! Mon code ami : " + code;
    if (navigator.share) navigator.share({ title: "L’agenda du sportif", text, url }).catch(() => {});
    else copy(url, b);
  } else if (b.id === "scanBtn") openScanner();
});

/* ============================================================
   Scanner de QR code (appareil photo)
   ============================================================ */
let scan = null;
function closeScanner() {
  if (!scan) return;
  clearTimeout(scan.timer); (scan.stream ? scan.stream.getTracks() : []).forEach(t => t.stop());
  scan.el.remove(); scan = null; document.body.classList.remove("scan-open");
}
export async function openScanner() {
  closeScanner();
  const el = document.createElement("div");
  el.className = "scan-sheet"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", "Scanner un QR code");
  el.innerHTML = `<div class="scan-box"><video playsinline muted></video><i class="scan-frame" aria-hidden="true"></i></div>
    <p class="scan-msg">Vise le QR code de ton ami.</p>
    <div class="grid2"><button class="btn" data-scan="code">Taper le code</button><button class="btn primary" data-scan="close">Fermer</button></div>`;
  document.body.appendChild(el); document.body.classList.add("scan-open");
  scan = { el };
  el.addEventListener("click", e => {
    const b = e.target.closest("[data-scan]"); if (!b) return;
    closeScanner(); if (b.dataset.scan === "code") { go("friends"); $("fsInput").focus(); }
  });
  const msg = t => { const m = el.querySelector(".scan-msg"); if (m) m.textContent = t; };
  if (!("BarcodeDetector" in window) || !navigator.mediaDevices) {
    msg("Ton navigateur ne sait pas lire les QR codes. Ouvre l’appareil photo de ton téléphone et vise le QR code : le lien s’ouvre tout seul. Ou tape le code ami.");
    el.querySelector(".scan-box").hidden = true; return;
  }
  const me = scan;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
    if (scan !== me) { stream.getTracks().forEach(t => t.stop()); return; }
    scan.stream = stream;
    const v = el.querySelector("video"); v.srcObject = stream; await v.play();
    const det = new window.BarcodeDetector({ formats: ["qr_code"] });
    const tick = async () => {
      if (scan !== me) return;
      try {
        const r = await det.detect(v), c = r.map(x => codeFrom(x.rawValue)).find(Boolean);
        if (c) { closeScanner(); if (c === (S.profile || {}).friendCode) toast("C’est ton propre code 😉"); else searchCode(c); return; }
        if (r.length) msg("Ce QR code ne vient pas de L’agenda du sportif.");
      } catch (x) { /* image pas prête */ }
      me.timer = setTimeout(tick, 250);
    };
    tick();
  } catch (x) { msg("Accès à l’appareil photo refusé. Autorise-le dans les réglages, ou tape le code ami."); el.querySelector(".scan-box").hidden = true; }
}
