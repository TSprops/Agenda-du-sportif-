// Parcours dans l'app (navigateur Chromium via Playwright).
const { chromium } = require("playwright");
const { BASE, get, put, signupPage, screen, home } = require("./helpers.cjs");

module.exports = async function appTests(t) {
  const browser = await chromium.launch();
  try {
    // Inscription : les conditions sont obligatoires.
    const A = await signupPage(browser, "Alice");
    t("inscription avec conditions acceptées", await screen(A), "v-home");

    // Séance : bibliothèque, dernière fois, record en direct.
    t("accueil : tableau de bord (cartes vers les pages)", await A.$$eval("#homeDash [data-go]", x => x.map(b => b.dataset.go).join()), "muscles,progress,nutrition,trophees,records,recap,seances");
    t("barre du bas : Accueil, Séances, +, Social, Vous", await A.$$eval("#tabbar [data-tab]", x => x.map(b => b.dataset.tab + ":" + b.querySelector(":scope > span:not(.tab-av)").textContent).join()), "home:Accueil,seances:Séances,go:Let’s go,social:Social,profile:Vous");
    await A.click("[data-tab=go]"); await A.waitForSelector("#sheet.open");
    t("bouton + : séance du jour ouverte", await screen(A), "v-seances");
    await A.click("[data-a=disc][data-id=muscu]"); await A.click("[data-a=type][data-id=push]");
    await A.click("[data-a=add-ex]"); await A.fill("#libQ", "couch"); await A.waitForTimeout(200); await A.click('#libList [data-lib="Développé couché"]');
    await A.fill("#r-0-0", "8"); await A.fill("#k-0-0", "80"); await A.click("#go-0"); await A.click("#rtSkip");
    await A.click("[data-a=close]"); await A.waitForTimeout(500);
    await A.click("#v-seances .back"); await A.click("[data-gonew]"); await A.click("[data-a=disc][data-id=muscu]"); await A.click("[data-a=type][data-id=push]");
    await A.click("[data-a=add-ex]"); await A.fill("#libQ", "couch"); await A.waitForTimeout(200);
    // « ? » directement dans la recherche : on voit le mouvement sans ajouter l'exercice.
    await A.click('#libList [data-how="lib"][data-name="Développé couché"]'); await A.waitForSelector("#howSheet:not([hidden])");
    t("comment faire depuis la recherche", await A.textContent("#howTitle"), "Développé couché");
    t("comment faire : placement des mains", await A.$eval("#howGrip", e => !e.hidden && !!e.querySelector("svg.hg")), true);
    await A.click("#howClose");
    t("recherche toujours ouverte, rien d'ajouté", await A.isVisible('#libList [data-lib="Développé couché"]') && !(await A.$("#k-0-0")), true);
    await A.click('#libList [data-lib="Développé couché"]');
    t("poids de la dernière fois repris", await A.inputValue("#k-0-0"), "80");
    // « Comment faire » : silhouette animée.
    t("comment faire : rien de dessiné avant l'ouverture", await A.$eval("#howStage", e => e.children.length), 0);
    t("comment faire : bouton accessible", await A.getAttribute("[data-how='0']", "aria-label"), "Comment faire : Développé couché");
    t("comment faire : zone tactile ≥ 44 px", await A.$eval("[data-how='0']", e => e.getBoundingClientRect().width >= 44 && e.getBoundingClientRect().height >= 44), true);
    await A.click("[data-how='0']"); await A.waitForSelector("#howSheet:not([hidden])");
    t("comment faire : focus sur la croix", await A.evaluate(() => document.activeElement.id), "howClose");
    t("comment faire : départ et arrivée côte à côte (profil et face)", await A.$$eval("#howStage .how-frames figure", x => x.length), 4);
    await A.click("#howPlay"); await A.waitForTimeout(150);
    const live1 = await A.evaluate(() => [...document.querySelectorAll("#howStage .how-live svg")].map(s => s.innerHTML).join("|"));
    t("comment faire : le bouton lance l'animation (fenêtre ouverte, vue de profil seule animée)", await A.evaluate(() => [!document.getElementById("howSheet").hidden, document.getElementById("howStage").classList.contains("playing"), document.getElementById("howPlay").getAttribute("aria-pressed"), document.querySelectorAll("#howStage .how-live svg").length, document.querySelector("#howStage .how-live-fig").getBoundingClientRect().width > 100].join()), "true,true,true,1,true");
    await A.waitForTimeout(700);
    t("comment faire : la silhouette bouge", (await A.evaluate(() => [...document.querySelectorAll("#howStage .how-live svg")].map(s => s.innerHTML).join("|"))) !== live1, true);
    // Allers-retours : « Revoir départ et arrivée » redonne exactement la présentation d'origine (aucun dessin animé en plus).
    const shown = () => A.evaluate(() => { const st = document.getElementById("howStage"), vis = e => e.getClientRects().length > 0;
      return [[...st.querySelectorAll(".how-frames figure")].filter(vis).length, [...st.querySelectorAll(".how-live")].filter(vis).length, st.querySelectorAll(".how-live svg").length, st.querySelectorAll("svg.fg").length].join(); });
    for (let k = 0; k < 3; k++) {
      await A.click("#howPlay"); await A.waitForTimeout(80);
      t("comment faire : retour aux images, aller-retour " + (k + 1), await shown(), "4,0,0,4");
      await A.click("#howPlay"); await A.waitForTimeout(80);
      t("comment faire : animation relancée, aller-retour " + (k + 1), await shown(), "0,1,1,5");
    }
    t("comment faire : fond inerte", await A.$eval("#sheet", e => e.inert), true);
    await A.keyboard.press("Escape");
    t("comment faire : fermé par Échap", await A.$eval("#howSheet", e => e.hidden), true);
    t("comment faire : focus rendu au bouton", await A.evaluate(() => document.activeElement.dataset.how), "0");
    t("comment faire : fond de nouveau actif", await A.$eval("#sheet", e => e.inert), false);
    await A.click("[data-how='0']"); await A.click("#howBackdrop", { position: { x: 20, y: 20 } });
    t("comment faire : fermé par un toucher sur le fond", await A.$eval("#howSheet", e => e.hidden), true);
    await A.emulateMedia({ reducedMotion: "reduce" }); await A.click("[data-how='0']");
    t("comment faire : sans animation, poses côte à côte et pas de bouton", await A.evaluate(() => document.querySelectorAll("#howStage .how-frames figure").length + "," + !!document.getElementById("howPlay")), "4,false");
    await A.click("#howClose"); await A.emulateMedia({ reducedMotion: "no-preference" });
    // Suggestion de charge : tout réussi à 80 kg la dernière fois → 82,5 kg proposé.
    t("suggestion de charge", /Tout réussi à 80 kg.*82,5 kg/.test(await A.textContent("#sg-0")), true);
    await A.click("#sg-0 .kg-tip-b");
    t("suggestion de charge appliquée", await A.inputValue("#k-0-0"), "82.5");
    await A.fill("#r-0-0", "6"); await A.fill("#k-0-0", "85"); await A.click("#go-0"); await A.waitForTimeout(300);
    t("record en direct", /Nouveau record/.test(await A.textContent("#toast")), true);
    t("célébration : confettis", !!(await A.$("canvas.confetti")), true);
    await A.click("#rtSkip"); await A.click("[data-a=close]"); await A.waitForTimeout(500);

    // 1RM estimé (80 kg × 8 ≈ 101,5 ; 85 kg × 6 = 102) et trophées.
    await home(A);
    t("trophées : aperçu sur l’accueil", /Mes trophées · [1-9]/.test(await A.textContent("#homeDash .trophy-strip")), true);
    t("accueil : aperçus records et progression", (await A.textContent("#homeDash [data-go=records] .dc-big")) + "|" + !!(await A.$("#homeDash [data-go=progress] .spark")), "1|true");
    await A.click("#homeDash [data-go=records]"); await A.click("[data-cat='rec:muscu']");
    t("1RM estimé dans les records", /1RM estimé : 102 kg \(85 kg × 6/.test(await A.textContent("#recBody")), true);
    await home(A); await A.click("#homeDash [data-go=progress]"); await A.click("[data-cat='prog:muscu']");
    t("progression : charge max par défaut", /85 kg/.test(await A.textContent("#progBody")), true);
    await A.click("[data-pmetric='1rm']");
    t("progression : 1RM estimé", /102 kg/.test(await A.textContent("#progBody")) && await A.getAttribute("[data-pmetric='1rm']", "aria-pressed"), "true");
    await home(A); await A.click("#homeDash .trophy-strip");
    t("trophées : page avec « Premier pas » débloqué", await A.$$eval("#trophyBody .tbadge.on .tb-n", x => x.map(e => e.textContent).includes("Premier pas")), true);
    t("trophées : rangés par famille, les autres restent à débloquer", await A.evaluate(() => [document.querySelectorAll("#trophyBody .tfam").length, document.querySelectorAll("#trophyBody .tbadge:not(.on)").length > 5].join()), "6,true");
    await A.click("#trophyBody .tbadge:not(.on)");
    t("trophées : toucher un badge affiche son détail", /\d+ \/ \d+/.test(await A.textContent("#trophyBody .tfam-detail")), true);
    // Badge au centre de l'écran (désactivé pendant les tests pour ne pas bloquer les touchers) : essai direct.
    await A.evaluate(async () => { localStorage.removeItem("fete-off"); (await import("/js/commun/fete.js")).showBadge({ ico: "", kicker: "Trophée débloqué", title: "Essai", sub: "Test" }); });
    await A.waitForSelector("#feteBadge:not([hidden])");
    t("célébration : badge au centre, bouton Continuer en focus", await A.evaluate(() => document.getElementById("feteTitle").textContent + "|" + document.activeElement.textContent), "Essai|Continuer");
    await A.click("#feteBadge [data-fete-ok]");
    t("célébration : fermée par Continuer", await A.$eval("#feteBadge", e => e.hidden), true);
    await A.evaluate(() => localStorage.setItem("fete-off", "1"));

    // Programme et routine : la séance se prépare toute seule.
    await home(A); await A.click("[data-tab=seances]"); await A.click(".seance-tile[data-go=programs]"); await A.click("[data-pgstart=ppl]"); await A.waitForTimeout(300);
    await A.click("[data-pgnext]"); await A.waitForSelector("#f-title", { timeout: 8000 });
    t("programme : séance prête", await A.inputValue("#f-title"), "Push");
    t("programme : noms d'exercices verrouillés", await A.$eval("#exn-0", e => e.readOnly), true);
    await A.click("[data-a=save-routine]"); await A.click("[data-a=close]"); await A.waitForTimeout(400);
    await home(A); await A.click("[data-tab=seances]"); await A.click("[data-rgo2]"); await A.waitForSelector("#f-title", { timeout: 8000 });
    t("routine : séance lancée", await A.$$eval("[id^=exn-]", x => x.length), 5);
    await A.click("[data-a=close]"); await A.waitForTimeout(400);

    // Séance ancienne (plus de 90 jours) : chargée par morceaux.
    const old = new Date(Date.now() - 200 * 864e5), ok = old.getFullYear() + "-" + String(old.getMonth() + 1).padStart(2, "0") + "-" + String(old.getDate()).padStart(2, "0");
    await put(`users/${A.uid}/seances/${ok}`, { disc: "course", runType: "ef", title: "Vieille sortie", run: { dist: 12, h: "", m: 70, s: "", blocks: [] }, updatedAt: 1 });
    await home(A); await A.click("[data-tab=seances]"); await A.click(".seance-tile[data-go=seances]");
    await A.waitForFunction(k => !!document.querySelector("#list") && true, ok);
    const hasOld = await A.evaluate(async k => { for (let i = 0; i < 12; i++) { if ([...document.querySelectorAll("#list .row")].some(r => r.dataset.k === k)) return true; document.getElementById("prev").click(); await new Promise(r => setTimeout(r, 50)); } return false; }, ok);
    t("ancienne séance chargée", hasOld, true);

    // Glisser pour supprimer.
    await home(A); await A.click("[data-tab=seances]"); await A.click(".seance-tile[data-go=seances]"); await A.waitForTimeout(300);
    const n0 = await A.$$eval("#list .row", x => x.length);
    await A.$eval("#list .row", e => e.scrollIntoView({ block: "center" })); await A.waitForTimeout(200);
    const bb = await (await A.$("#list .row")).boundingBox();
    await A.mouse.move(bb.x + 30, bb.y + bb.height / 2); await A.mouse.down(); await A.mouse.move(bb.x + 240, bb.y + bb.height / 2, { steps: 6 }); await A.mouse.up();
    await A.waitForSelector("#confirmSheet:not([hidden])"); await A.click("#confirmGo"); await A.waitForTimeout(400);
    t("glisser supprime la séance", await A.$$eval("#list .row", x => x.length), n0 - 1);

    // Export de mes données.
    await home(A); await A.click("[data-tab=profile]");
    const [dl] = await Promise.all([A.waitForEvent("download", { timeout: 15000 }), A.click("#exportBtn")]);
    t("export de mes données", /mes-donnees/.test(dl.suggestedFilename()), true);
    t("profil : nombre d’activités et d’amis", await A.$$eval("#pfCounts button", x => x.map(b => b.textContent).join(" ")), "4activités 0ami");
    await A.click("#pfView [data-go=share]");
    t("partager : QR code et code ami", await A.$eval("#shareBody", e => !!e.querySelector(".qr-box svg") && /^[A-Z]+-\d{4}$/.test(e.querySelector("#shareCode").textContent)), true);

    // Compte existant sans conditions acceptées : fenêtre à accepter une fois.
    await put(`users/${A.uid}`, { pseudo: "Alice", termsV: 0, seen: { amis1: true, v2: true, v3: true, tuto: true }, typesV: 2 });
    await home(A); await A.waitForTimeout(500);
    t("conditions demandées aux anciens comptes", await A.$eval("#termsSheet", e => !e.hidden), true);
    await A.click("#termsOk"); await home(A);
    t("conditions demandées une seule fois", await A.$eval("#termsSheet", e => !e.hidden), false);

    // Nouveautés : deux diapositives hors iPhone (Suivant / Précédent, points), vues une seule fois, même après rechargement.
    await put(`users/${A.uid}`, { pseudo: "Alice", termsV: 1, seen: { amis1: true, v2: true, tuto: true }, typesV: 2 });
    await home(A); await A.waitForSelector("#newsSheet:not([hidden])", { timeout: 5000 });
    const slide = () => A.evaluate(() => [document.getElementById("newsSheet").getAttribute("aria-labelledby"), document.querySelector("#newsDots .on") === document.querySelector("#newsDots i:nth-child(2)"), document.getElementById("newsNext").textContent].join());
    t("nouveautés : diapo 1 (nouveau nom et logo), pas de diapo iPhone hors de l'app installée", (await slide()) + "," + (await A.$$eval(".news-brand img", x => x.length)) + "," + (await A.$$eval(".news-ios, #newsDots i", x => x.length)), "newsTitle1,false,Suivant,1,2");
    await A.click("#newsNext");
    t("nouveautés : diapo 2 (Contact)", await slide(), "newsTitle2,true,C’est parti\u00a0!");
    await A.click("#newsPrev");
    t("nouveautés : retour à la diapo 1", await slide(), "newsTitle1,false,Suivant");
    await A.click("#newsNext"); await A.click("#newsNext");
    t("nouveautés : fermée par « C’est parti ! »", await A.$eval("#newsSheet", e => e.hidden), true);
    await home(A); await A.waitForTimeout(1600);
    t("nouveautés : plus jamais affichée", await A.$eval("#newsSheet", e => e.hidden), true);

    // Tutoriel guidé : une fois par page et par compte ; page « Tutoriel » pour le revoir sans changer le suivi.
    await A.evaluate(() => localStorage.removeItem("tours-off"));
    await home(A); await A.waitForSelector("#tour:not([hidden])", { timeout: 6000 });
    const tourState = () => A.evaluate(() => [document.getElementById("tourStep").textContent, document.getElementById("tourNext").textContent, getComputedStyle(document.getElementById("tourPrev")).visibility].join());
    t("tutoriel accueil : lancé à la première ouverture", await tourState(), "1/5,Suivant,hidden");
    await A.click("#tourNext");
    t("tutoriel : étape suivante", await tourState(), "2/5,Suivant,visible");
    await A.click("#tourPrev");
    t("tutoriel : étape précédente", await tourState(), "1/5,Suivant,hidden");
    await A.click("#tourSkip");
    t("tutoriel : passé", await A.$eval("#tour", e => e.hidden), true);
    await home(A); await A.waitForTimeout(1500);
    t("tutoriel accueil : plus jamais relancé", await A.$eval("#tour", e => e.hidden), true);
    t("boutons Tutoriel et Contact sur l’accueil", await A.$$eval("#homeLinks [data-go]", x => x.map(b => b.dataset.go).join()), "tutos,contact");
    await A.click("#homeLinks [data-go=tutos]"); await A.click('#tutosList [data-tour="home"]');
    await A.waitForSelector("#tour:not([hidden])", { timeout: 6000 });
    t("revoir le tutoriel de l’accueil depuis la page Tutoriel", await tourState(), "1/5,Suivant,hidden");
    for (let k = 0; k < 5; k++) await A.click("#tourNext");
    t("tutoriel terminé", await A.$eval("#tour", e => e.hidden), true);
    await A.click("[data-tab=seances]"); await A.waitForSelector("#tour:not([hidden])", { timeout: 6000 });
    t("tutoriel Séances à la première ouverture (fil rouge : Séance libre)", (await A.textContent("#tourText")).length > 10, true);
    await A.click("#tourSkip");
    await A.goto(BASE + "?reset-tutoriels"); await A.waitForSelector("#v-home:not([hidden])"); await A.waitForSelector("#tour:not([hidden])", { timeout: 6000 });
    t("tutoriels remis à zéro (?reset-tutoriels)", await tourState(), "1/5,Suivant,hidden");
    await A.click("#tourSkip"); await A.evaluate(() => localStorage.setItem("tours-off", "1"));

    // Séries : toucher une série plus loin (numéro ou case vide) valide les précédentes, sans repos ; « Exercice fini » remet au gris.
    await home(A); await A.click("[data-tab=seances]"); await A.click("[data-gonew]"); await A.click("#sheet [data-a=disc][data-id=muscu]"); await A.click("#sheet [data-a=type][data-id=push]");
    await A.click("#sheet [data-a=add-ex]"); await A.fill("#libQ", "couch"); await A.waitForTimeout(200); await A.click('#libList [data-lib="Développé couché"]');
    while ((await A.$$("#sheet tr[id^=row-0-]")).length < 3) await A.click("#sheet [data-a=add-set][data-ex='0']");
    const rows = () => A.$$eval("#sheet tr[id^=row-0-]", x => x.slice(0, 3).map(e => e.className || "-").join());
    t("séries : « Exercice fini » proposé dès le début", await A.isVisible("#fini-0"), true);
    await A.click('#sheet [data-a=set-toggle][data-ex="0"][data-s="1"]');
    t("séries : toucher la série 2 valide la 1, sans repos", (await rows()) + "|" + (await A.isVisible("#restTimer")), "done,cur,-|false");
    await A.click("#r-0-2");
    t("séries : toucher une case vide de la série 3 valide la 2", await rows(), "done,done,cur");
    await A.fill("#r-0-2", "6"); await A.click("#fini-0");
    t("séries : exercice fini, tout au gris, phrase gardée", (await rows()) + "|" + (await A.textContent("#sn-0")) + "|" + (await A.isVisible("#go-0")), "-,-,-|✓ Toutes les séries sont faites|false");
    await A.click('#sheet [data-a=set-toggle][data-ex="0"][data-s="0"]');
    t("séries : toucher un numéro rouvre l'exercice", (await A.isVisible("#fini-0")) + "|" + (await A.isVisible("#go-0")), "true|true");
    await A.click("#sheet [data-a=close]");

    // Course : supprimer un bloc (fractionné puis seuil), avec confirmation ; la séance garde les bons blocs.
    await home(A); await A.click("[data-tab=seances]"); await A.click("[data-gonew]"); await A.click("#sheet [data-a=disc][data-id=course]");
    await A.click("#sheet [data-a=runtype][data-id=frac]"); await A.click("#sheet [data-a=bl-add]"); await A.click("#sheet [data-a=bl-add]");
    for (const [j, v] of [[0, "10"], [1, "8"], [2, "6"]]) await A.fill(`#bl-rep-${j}`, v);
    const blocs = () => A.$$eval("#sheet .bloc .bl-rep", x => x.map(e => e.value).join());
    await A.click('#sheet [data-a=bl-del][data-b="1"]');
    t("bloc : premier toucher = confirmation demandée", (await blocs()) + "|" + (await A.textContent('#sheet [data-a=bl-del][data-b="1"]')), "10,8,6|Confirmer ?");
    await A.click('#sheet [data-a=bl-del][data-b="1"]');
    t("fractionné : bloc supprimé, les autres restent", (await blocs()) + "|" + (await A.$$eval("#sheet .bloc .ex-num", x => x.map(e => e.textContent).join())), "10,6|01,02");
    await A.click("#sheet [data-a=runtype][data-id=seuil]"); await A.click('#sheet [data-a=bl-del][data-b="0"]'); await A.click('#sheet [data-a=bl-del][data-b="0"]');
    t("seuil : bloc supprimé", await blocs(), "6");
    await A.click("#sheet [data-a=close]"); await A.waitForTimeout(800); await A.click(`#list .row:has-text("Seuil")`); await A.waitForTimeout(400);
    t("bloc supprimé aussi dans la séance enregistrée", await blocs(), "6");
    await A.click("#sheet [data-a=close]");

    // Course, seuil / fractionné : « Ma sortie » masquée, format lisible, décompte des séries, validation, distance calculée.
    await home(A); await A.click("[data-tab=seances]"); await A.click("[data-gonew]"); await A.click("#sheet [data-a=disc][data-id=course]");
    await A.click("#sheet [data-a=runtype][data-id=ef]");
    t("endurance fondamentale : « Ma sortie » affichée", await A.isVisible("#rn-dist"), true);
    await A.click("#sheet [data-a=runtype][data-id=frac]");
    t("fractionné : « Ma sortie » masquée, unités m / s / min", (await A.isVisible("#rn-dist")) + "|" + (await A.$$eval("#sheet [data-a=bl-unit]", x => x.map(e => e.dataset.u).join())), "false|m,s,min");
    await A.fill("#bl-rep-0", "3"); await A.fill("#bl-eff-0", "200");
    const cnt = async () => (await A.innerText("#bl-count-0")).replace(/\s+/g, " ").trim();
    t("fractionné : aperçu et décompte", (await A.textContent("#bl-prev-0")) + "|" + (await cnt()), "Aperçu : 3 × 200 m|3 séries restantes ⏱ Lancer la récup");
    await A.click('#sheet [data-a=bl-go][data-b="0"]');
    t("récup : une série de moins, minuteur lancé", (await cnt()) + "|" + (await A.isVisible("#restTimer")), "2 séries restantes ⏱ Lancer la récup|true");
    await A.click("#rtSkip"); await A.click('#sheet [data-a=bl-go][data-b="0"]'); await A.click("#rtSkip");
    t("dernière série : bouton « Terminer »", await cnt(), "1 série restante ✓ Terminer");
    await A.click('#sheet [data-a=bl-go][data-b="0"]');
    t("terminer : sans récup, 0, validé, distance calculée", (await cnt()) + "|" + (await A.isVisible("#restTimer")) + "|" + (await A.textContent("#bl-dist-0")), "0 exercice validé ✓|false|Distance parcourue 600 m");
    t("format enregistré inchangé", await A.inputValue("#bl-rep-0"), "3");
    await A.click("#sheet [data-a=bl-add]"); await A.fill("#bl-rep-1", "5"); await A.fill("#bl-eff-1", "400"); await A.click('#sheet [data-a=bl-fini][data-b="1"]');
    t("valider l'exercice d'un coup + total", (await A.textContent("#bl-dist-1")) + "|" + (await A.textContent("#bl-total")), "Distance parcourue 2 km|Total parcouru 2,6 km");
    await A.click("#sheet [data-a=runtype][data-id=frac]"); await A.click("#sheet [data-a=runtype][data-id=seuil]");
    t("seuil : « min » fixe, sans sélecteur", (await A.$$eval("#sheet [data-a=bl-unit]", x => x.length)) + "|" + (await A.isVisible("#rn-dist")), "0|false");
    await A.click("#sheet [data-a=close]"); await A.waitForTimeout(800);
    t("distance comptée dans le mois", await A.textContent("#list .row:has-text('Seuil') .me"), "Seuil · 2,6 km");
    // Anciennes séances : distance de « Ma sortie » gardée, sinon calculée depuis les blocs (km, ou durée avec l'allure).
    const km = await A.evaluate(async () => { const { runKm } = await import("/js/commun/core.js"); return [
      { disc: "course", runType: "frac", run: { dist: 8, blocks: [{ rep: 10, eff: 400, unit: "m" }] } },
      { disc: "course", runType: "frac", run: { blocks: [{ rep: 5, eff: 1, unit: "km" }, { rep: 10, eff: 200 }] } },
      { disc: "course", runType: "seuil", run: { blocks: [{ rep: 3, eff: 10, unit: "min", pace: "4:00 /km" }] } },
      { disc: "course", runType: "seuil", run: { blocks: [{ rep: 3, eff: 10, unit: "min", pace: "allure semi" }] } },
      { disc: "course", runType: "frac", run: { dist: 8, blocks: [{ rep: 10, eff: 400, unit: "m", fini: false }] } }].map(runKm).join(); });
    t("anciennes séances : distances prises en compte", km, "8,7,7.5,0,0");
    await A.click(`#list .row:has-text("Seuil")`); await A.waitForTimeout(400);
    t("séance rouverte : blocs validés gardés", await A.$$eval("#sheet .bloc.fini", x => x.length), 2);
    await A.click("#sheet [data-a=close]");

    // Corde : plus de propositions directes ; « Ajouter un exercice » donne exactement les trois montées de corde.
    await home(A); await A.click("[data-tab=seances]"); await A.click("[data-gonew]"); await A.click("#sheet [data-a=disc][data-id=cordes]");
    t("corde : rien de proposé avant « Ajouter un exercice »", await A.$$eval("#sheet [data-a=cd-add]", x => x.length), 0);
    await A.click("#sheet [data-a=add-ex]"); await A.waitForSelector("#libSheet.open");
    t("corde : liste des exercices", await A.$$eval("#libList [data-lib]", x => x.map(e => e.dataset.lib).join(" | ")), "Montée de corde | Montée de corde avec jambes | Montée de corde départ assis");
    // Corde : X cordes par départ, toutes les Y, pendant Z → nombre de départs calculé.
    await A.click('#libList [data-lib="Montée de corde"]'); await A.waitForSelector("#cd-per-0");
    await A.fill("#cd-per-0", "1"); await A.fill("#cd-every-0", "5"); await A.fill("#cd-dur-0", "1");
    t("corde : 1 corde toutes les 5 s pendant 1 min", (await A.textContent("#cd-sum-0")).trim(), "12 départs · 12 cordes au total · 1:00");
    await A.click("#sheet [data-a=close]");

    // Callisthénie en départs : 5 tractions toutes les minutes pendant 10 min.
    await home(A); await A.click("[data-tab=seances]"); await A.click("[data-gonew]"); await A.click("#sheet [data-a=disc][data-id=calis]");
    await A.click('#sheet [data-a=calis-add][data-name="Tractions"]'); await A.click('#sheet [data-a=dp-mode][data-v=dep]');
    await A.fill("#dp-per-0", "5"); await A.fill("#dp-every-0", "1"); await A.fill("#dp-dur-0", "10");
    t("callisthénie : départs calculés", (await A.textContent("#dp-sum-0")).trim(), "10 départs · 50 reps au total · 10:00");
    t("callisthénie : bouton « Lancer les départs » actif", await A.$eval("#dpgo-0", b => b.disabled), false);
    await A.click("#sheet [data-a=close]");

    // Hyrox libre : « Ajouter un exercice » propose les ateliers ; temps total calculé.
    await home(A); await A.click("[data-tab=seances]"); await A.click("[data-gonew]"); await A.click("#sheet [data-a=disc][data-id=hyrox]");
    await A.click("#sheet [data-a=add-ex]"); await A.waitForSelector("#libSheet.open");
    t("hyrox : liste des ateliers", await A.$$eval("#libList [data-lib]", x => x.map(e => e.dataset.lib).join(" | ")), "Course | SkiErg | Sled push | Sled pull | Burpees sautés | RowErg | Farmers carry | Fentes sandbag | Wall balls");
    await A.click('#libList [data-lib="SkiErg"]'); await A.waitForSelector("#hx-time-0"); await A.fill("#hx-time-0", "4:12");
    t("hyrox : distance pré-remplie et total", (await A.inputValue("#hx-amt-0")) + "|" + (await A.textContent("#hxSum")).trim(), "1000|Total : 4:12 · 1 km");
    await A.click("#sheet [data-a=close]");

    // Idées · Hyrox (Double mixte) et explications des WOD CrossFit.
    await home(A); await A.click("[data-tab=seances]"); await A.click(".seance-tile[data-go=types]"); await A.click('[data-cat="ideas:hyrox"]');
    await A.click('#v-hub [data-tab=double]'); await A.click('#v-hub [data-sub=x]');
    t("idées hyrox : double mixte", (await A.textContent("#v-hub .idea-top b")) + "|" + await A.$$eval("#v-hub .hx-st", x => x.length), "Hyrox Double · Mixte|8");
    await A.click("#v-hub [data-try]"); await A.waitForSelector("#sheet.open"); await A.waitForTimeout(300);
    t("idées hyrox : séance du jour avec 16 exercices", await A.$$eval("#sheet .ex.hyrox", x => x.length), 16);
    await A.click("#sheet [data-a=close]");
    await home(A); await A.click("[data-tab=seances]"); await A.click(".seance-tile[data-go=types]"); await A.click('[data-cat="ideas:crossfit"]');
    await A.click('#cfBench [data-cfhow=fran]');
    t("crossfit : explication de Fran", /21 thrusters, puis 21 tractions/.test(await A.textContent("#cfBench .wod-how")), true);

    // Texte non sélectionnable, sauf les zones de saisie (écrire, tout sélectionner).
    await home(A); await A.click("#homeLinks [data-go=contact]"); await A.click("[data-go=contactform]");
    t("texte de l’app non sélectionnable", await A.evaluate(() => [getComputedStyle(document.querySelector("#v-contactform .vtitle")).userSelect, getComputedStyle(document.querySelector("#v-contactform .btn")).userSelect].join()), "none,none");
    await A.fill("#ctText", "Bonjour"); await A.focus("#ctText"); await A.keyboard.press("Control+A");
    t("zone de saisie : écriture et sélection possibles", await A.$eval("#ctText", e => [e.value, getComputedStyle(e).userSelect, e.selectionEnd - e.selectionStart].join()), "Bonjour,text,7");
    await home(A);

    // Social : ami, commentaire, signalement, modération.
    await A.click("[data-tab=social]"); await A.click("[data-go=friends]"); const code = await A.textContent("#myCode");
    const B = await signupPage(browser, "Bruno");
    // Lien d'invitation (celui du QR code) : ouvre la page Amis avec le profil trouvé.
    await B.goto(BASE + "?ami=" + code); await B.waitForSelector("#v-friends:not([hidden]) [data-fadd]", { timeout: 10000 });
    t("lien d’invitation : profil de l’ami trouvé", (await B.inputValue("#fsInput")) + "|" + new URL(B.url()).search, code + "|");
    await B.click("[data-fadd]"); await A.waitForTimeout(900); await A.click("[data-faccept]"); await A.waitForTimeout(900);
    await home(B); await B.click("[data-tab=social]"); await B.waitForSelector(".feed-card .c-form input", { timeout: 10000 });
    const bad = "Commentaire à modérer " + Date.now();
    const inp = await B.$(".feed-card .c-form input"); await inp.fill(bad); await inp.press("Enter"); await B.waitForTimeout(800);
    await home(A); await A.click("[data-tab=seances]"); await A.click(".seance-tile[data-go=seances]"); await A.click("#list .row"); await A.waitForTimeout(500);
    t("commentaire reçu dans la séance", (await A.textContent("#myComments")).includes(bad), true);
    await A.click("#myComments [data-crep]"); await A.click("#myComments [data-crep]"); await A.waitForTimeout(600);
    t("commentaire signalé", /signalé/.test(await A.textContent("#toast")), true);
    await A.click("[data-a=close]");
    // A devient admin : supprime le contenu et bannit B.
    await put("admins/" + A.uid, { ok: true });
    await home(A); await A.click("[data-tab=profile]"); await A.click("#adminBtn"); await A.waitForTimeout(800);
    t("signalement visible par l'admin", (await A.textContent("#adminBody")).includes(bad), true);
    const del = `.msg:has-text("${bad}") [data-repdel]`;
    // L'écran admin se redessine à chaque nouveauté : on confirme jusqu'à ce que la suppression passe.
    for (let i = 0; i < 4 && (await A.$(del)); i++) { await A.click(del); await A.click(del).catch(() => {}); await A.waitForTimeout(700); }
    await A.waitForFunction(t => !document.getElementById("adminBody").textContent.includes(t), bad, { timeout: 8000 }).catch(() => {});
    t("contenu supprimé par l'admin", (await A.textContent("#adminBody")).includes(bad), false);
    await A.click(`#adminBody [data-uid="${B.uid}"]`); await A.waitForTimeout(500); await A.click("#auserBody [data-ban]"); await A.click("#auserBody [data-ban]"); await A.waitForTimeout(800);
    await home(B); await B.click("[data-tab=social]");
    t("le banni voit la suspension", await B.$(".ban-card") !== null, true);

    // Langues : celle de l'appareil au premier lancement, repli sur le français.
    const ouvrir = async locale => {
      const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale });
      const p = await ctx.newPage(); p.errs = []; p.on("pageerror", e => p.errs.push(e.message));
      await p.goto(BASE); await p.waitForSelector("#v-login:not([hidden])");
      return p;
    };
    for (const [locale, lang] of [["en-US", "en"], ["es-MX", "es"], ["de-DE", "fr"], ["fr-CA", "fr"]]) {
      const p = await ouvrir(locale);
      t(`langue de l'appareil ${locale} → ${lang}`, await p.evaluate(() => document.documentElement.lang), lang);
      await p.context().close();
    }
    const E = await ouvrir("en-US");
    t("anglais : écran de connexion traduit", await E.textContent("#tabUp"), "Sign up");
    t("anglais : dates au format américain", await E.evaluate(async () => (await import("./js/commun/i18n.js")).dateLongue("2026-03-05T12:00:00")), "March 5, 2026");
    t("anglais : nombres au format américain", await E.evaluate(async () => (await import("./js/commun/i18n.js")).nombre(1234.5)), "1,234.5");
    t("anglais : pluriels", await E.evaluate(async () => { const { t: tr } = await import("./js/commun/i18n.js"); return [1, 3].map(n => tr("programmes.parSemaine", { n })).join(" / "); }),
      "1 workout per week / 3 workouts per week");
    t("aucune erreur JavaScript (anglais)", E.errs.join(" | "), "");
    await E.context().close();
    const Es = await ouvrir("es-ES");
    t("espagnol : dates", await Es.evaluate(async () => (await import("./js/commun/i18n.js")).dateLongue("2026-03-05T12:00:00")), "5 de marzo de 2026");
    await Es.context().close();
    // Inscription en anglais : la langue est enregistrée sur le compte.
    const G = await signupPage(browser, "Gina", "en-US");
    await G.waitForTimeout(800);
    t("langue enregistrée sur le compte à l'inscription", (await get("users/" + G.uid)).body.fields.lang?.stringValue, "en");
    t("barre du bas en anglais", await G.$eval("#tabbar [data-tab=profile] > span:not(.tab-av)", x => x.textContent), "You");
    // Sélecteur dans les réglages : passe en espagnol, enregistré sur le compte, l'app se recharge.
    await G.click("[data-tab=profile]"); await G.waitForSelector("#langList [data-lang=es]");
    await Promise.all([G.waitForEvent("load"), G.click("#langList [data-lang=es]")]);
    await G.waitForSelector("#v-home:not([hidden]), #v-profile:not([hidden])");
    t("sélecteur : l'app passe en espagnol", await G.evaluate(() => document.documentElement.lang), "es");
    t("sélecteur : choix enregistré sur le compte", (await get("users/" + G.uid)).body.fields.lang?.stringValue, "es");
    // Autre appareil (en français) : la langue du compte est reprise à la connexion.
    const G2 = await ouvrir("fr-FR");
    await G2.fill("#auEmail", G.email); await G2.fill("#auPass", "secret123");
    await Promise.all([G2.waitForEvent("load", { timeout: 15000 }), G2.click("#auSubmit")]);
    await G2.waitForSelector("#v-home:not([hidden])");
    t("autre appareil : langue du compte reprise", await G2.evaluate(() => document.documentElement.lang), "es");
    t("aucune erreur JavaScript (espagnol)", [...G.errs, ...G2.errs].join(" | "), "");

    t("aucune erreur JavaScript (A)", A.errs.join(" | "), "");
    t("aucune erreur JavaScript (B)", B.errs.join(" | "), "");
  } finally { await browser.close(); }
};
