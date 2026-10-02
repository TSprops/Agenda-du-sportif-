// Séances : photos (JPEG compressé dans Firestore) et visionneuse.
import { renderMain } from "./calendrier.js";
import { changed, forceFlush, renderSheet } from "./feuille.js";
import { $, S, armed, clone, deleteDoc, doc, getDoc, setDoc } from "../commun/core.js";
import { persistDay, subCol, subDoc } from "../commun/store.js";
import { t } from "../commun/i18n.js";

/* ============================================================
   Photos (stockées en JPEG compressé dans Firestore : reste gratuit)
   ============================================================ */
export function compress(file, max, q) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      const r = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight)), w = Math.round(img.naturalWidth * r), h = Math.round(img.naturalHeight * r);
      const cv = document.createElement("canvas"); cv.width = w; cv.height = h; cv.getContext("2d").drawImage(img, 0, 0, w, h); URL.revokeObjectURL(url);
      cv.toBlob(b => b ? res(b) : rej(new Error("encode")), "image/jpeg", q);
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("decode")); };
    img.src = url;
  });
}
export function blobToData(b) { return new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result); f.readAsDataURL(b); }); }
const loading = new Set();
export function loadPhotos(list) {
  const missing = list.map(p => p.pid).filter(id => id && !S.photoCache[id] && !loading.has(id));
  if (!missing.length) return;
  missing.forEach(id => loading.add(id));
  Promise.all(missing.map(id => getDoc(subDoc("photos", id)).then(s => { if (s.exists()) S.photoCache[id] = s.data().data; }).catch(() => {})))
    .then(() => { missing.forEach(id => loading.delete(id)); if (S.open) renderSheet(); });
}
export function dropPhoto(pid) { deleteDoc(subDoc("photos", pid)).catch(() => {}); delete S.photoCache[pid]; }
export async function addPhotos(files) {
  const k = S.open, target = S.cur; if (!k || !target) return;
  S.photoErr = ""; S.uploading = (S.uploading || 0) + files.length; renderSheet();
  for (const f of files) {
    try {
      let data = await blobToData(await compress(f, 1280, .72));
      if (data.length > 850000) data = await blobToData(await compress(f, 900, .6));
      // Identifiant créé tout de suite : la photo s'ajoute même sans réseau (envoyée au retour de la connexion).
      const ref = doc(subCol("photos")); setDoc(ref, { data, date: k, createdAt: Date.now() }).catch(() => {});
      S.photoCache[ref.id] = data;
      target.photos = target.photos || []; target.photos.push({ pid: ref.id });
    } catch (e) { S.photoErr = t("photos.erreur"); }
    S.uploading--;
    if (S.open === k && S.cur === target) { changed(); renderSheet(); }
    else { const data = { ...clone(target), updatedAt: Date.now() }; S.days[k] = data; persistDay(k, data); renderMain(); }
  }
}
let vIdx = -1;
export function openViewer(i) { vIdx = i; $("viewerImg").src = S.photoCache[S.cur.photos[i].pid] || ""; $("viewer").hidden = false; }
$("viewer").addEventListener("click", e => {
  const b = e.target.closest("[data-a]"); if (!b) return;
  if (b.dataset.a === "vclose") { $("viewer").hidden = true; return; }
  if (b.dataset.a === "vdel") {
    if (!armed(b, t("photos.confirmer"))) return;
    const [p] = S.cur.photos.splice(vIdx, 1); $("viewer").hidden = true;
    forceFlush(); if (p && p.pid) dropPhoto(p.pid); renderSheet();
  }
});
