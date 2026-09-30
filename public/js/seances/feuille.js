// Séances, fiche du jour : affichage, ouverture, fermeture et enregistrement automatique.
import { renderMain } from "./calendrier.js";
import { cordesHTML, normCordes } from "./fiche-cordes.js";
import { courseHTML } from "./fiche-course.js";
import { crossfitHTML } from "./fiche-crossfit.js";
import { calisHTML, choiceHTML, muscuHTML, photoTile } from "./fiche-muscu-calis.js";
import { loadPhotos } from "./photos.js";
import { $, DAYS, DISC, MONTHS, MOODS, S, cap, clone, dayMeta, esc, isEmpty, parse, typeOf } from "../core.js";
import { myReactsHTML } from "../friends.js";
import { renderCrossfit } from "../ideas.js";
import { myCommentsHTML } from "../social.js";
import { persistDay } from "../store.js";
import { tourCheck } from "../tour.js";
import { announcePRs, sessTabsHTML, sessionPRs } from "../entrainement/index.js";

export function renderSheet() {
  const c = S.cur, k = S.open, d = parse(k), disc = c.disc;
  const mt = disc ? dayMeta(c) : null;
  const el = $("sheet"), y = el.scrollTop;
  const dateTxt = `${cap(DAYS[d.getDay()])} ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  let body;
  if (!disc) body = `${sessTabsHTML(c, k)}<p class="eyebrow">${dateTxt}</p>${choiceHTML()}`;
  else {
    const specific = disc === "muscu" ? muscuHTML(c, k) : disc === "calis" ? calisHTML(c, k) : disc === "cordes" ? cordesHTML(c, k) : disc === "course" ? courseHTML(c) : crossfitHTML(c);
    const ph = disc === "muscu" && mt && typeOf(c.typeId) ? mt.name : disc === "course" && c.runType ? mt.name : disc === "crossfit" ? "WOD du jour" : DISC[disc].name;
    body = `${sessTabsHTML(c, k)}<div class="disc-line"><p class="eyebrow">${dateTxt} · ${DISC[disc].name}</p><button class="linkish" data-a="change-disc">Changer d’activité</button></div>
    <div class="my-reacts" id="myReacts">${myReactsHTML(k)}</div>
    <input id="f-title" class="title-in" data-f="title" placeholder="${esc(ph)}" value="${esc(c.title)}" autocomplete="off" aria-label="Titre de la séance">
    ${specific}
    <section class="card"><div class="lbl">Ressenti général</div>
      <div class="chips">${MOODS.map(m => `<button class="chip" data-a="mood" data-v="${m}" style="--tc:var(--red)" aria-pressed="${c.mood === m}">${m}</button>`).join("")}</div>
      <textarea id="f-note" data-f="note" placeholder="Sommeil, énergie, ce qu’il faut changer la prochaine fois…" rows="3">${esc(c.note)}</textarea>
    </section>
    <section class="card"><div class="lbl">Photos <em>${(c.photos || []).length || ""}</em></div>
      <div class="photos">${(c.photos || []).map(photoTile).join("")}${'<div class="ph loading">Envoi…</div>'.repeat(S.uploading || 0)}
      <label class="ph-add" for="phIn"><span class="plus">+</span>Prendre une photo<input id="phIn" type="file" accept="image/*" multiple data-f="photo"></label></div>
      ${S.photoErr ? `<p class="err">${esc(S.photoErr)}</p>` : ""}
    </section>
    <section class="card" id="myComments">${myCommentsHTML(k)}</section>
    ${isEmpty(c) ? "" : `<button class="danger" data-a="del-session">Supprimer la séance</button>`}`;
  }
  el.innerHTML = `<div class="bar-top"><button class="link" data-a="close">‹ Calendrier</button><span class="save" id="saveState">${esc(S.saveMsg || "")}</span></div>
  <div class="sheet-body" style="--tc:${mt ? mt.color : "var(--red-hi)"}">${body}</div>`;
  el.scrollTop = y;
  if (disc) loadPhotos(c.photos || []);
  tourCheck(disc ? "seance" : "seance-choix");
}
export const EMPTY_DAY = () => ({ disc: null, title: "", typeId: null, exercises: [], mood: null, note: "", photos: [] });
export function setDisc(c, disc) {
  c.disc = disc;
  if (disc === "course") c.run = c.run || { blocks: [] };
  if (disc === "crossfit") c.wod = c.wod || { moves: [] };
  if (!c.exercises) c.exercises = [];
}
export function openDay(k, preset) {
  S.open = k;
  const existing = S.days[k];
  S.cur = existing ? clone(existing) : EMPTY_DAY();
  if (existing && !S.cur.disc) S.cur.disc = "muscu"; // anciennes séances = musculation
  normCordes(S.cur);
  if (!existing && preset) setDisc(S.cur, preset);
  if (!S.cur.photos) S.cur.photos = [];
  S.saveMsg = ""; S.photoErr = "";
  S.prSeen = new Set(sessionPRs(S.cur, k).map(p => k + "|" + p.ex));
  renderSheet(); $("sheet").scrollTop = 0; $("sheet").classList.add("open"); document.body.style.overflow = "hidden"; document.body.classList.add("sheet-open");
}
export function closeSheet() { flush(); $("sheet").classList.remove("open"); document.body.style.overflow = ""; document.body.classList.remove("sheet-open"); S.open = null; S.cur = null; S.photoErr = ""; renderMain(); if (S.screen === "crossfit") renderCrossfit(); }
export function setSave(m) { S.saveMsg = m; const e = $("saveState"); if (e) e.textContent = m; }
let timer = null;
export function changed() { clearTimeout(timer); timer = setTimeout(flush, 700); }
// Enregistre tout de suite (sans attendre la petite pause de saisie).
export function forceFlush() { timer = 1; flush(); }
export function flush() {
  if (!S.open || timer === null) return;
  clearTimeout(timer); timer = null;
  const k = S.open, c = S.cur;
  if (isEmpty(c)) { if (S.days[k]) { delete S.days[k]; persistDay(k, null); } }
  else {
    const prs = sessionPRs(c, k); c.prs = prs.map(p => p.ex + " · " + p.txt);
    const data = { ...clone(c), updatedAt: Date.now() }; S.days[k] = data; persistDay(k, data);
    announcePRs(prs, k);
  }
}
export const intOr = v => { const n = parseInt(String(v), 10); return isFinite(n) ? n : ""; };
