// Silhouette : formes SVG de chaque partie du corps (profil et face).

/* ---------- Formes du profil ---------- */
export const SIDE = {
  ua: { open: 1, d: "M0 -7.5Q14 -9.8 31 -4.6A4.7 4.7 0 0 1 31 4.8Q10 10.8 0 8.5A8 8 0 0 1 0 -7.5Z",
    lines: ["M9 3.2Q19 6.2 27 4.2", "M7 -4Q18 -6 26 -3.2"],
    mus: { triceps: "M2 1.2Q16 2.8 30 2.2L33 6Q10 12 0 9Z", biceps: "M3 -1Q16 -1 30 -1.2L33 -6Q14 -11 0 -8Z" } },
  delt: { d: "M-7 -8Q6 -12 15 -4Q13 3 15 8Q4 11.5 -7 8A8 8 0 0 1 -7 -8Z", lines: ["M11 -6Q8 0 12 7"], mus: { epaules: "M-8 -13H17V13H-8Z" } },
  fa: { open: 1, d: "M0 -4.9Q8 -6.6 27 -2.8A2.8 2.8 0 0 1 27 2.8Q8 5.9 0 4.9A4.9 4.9 0 0 1 0 -4.9Z",
    lines: ["M2 -1.4Q12 0.2 23 -0.4"], mus: { avantbras: "M-5 -8H30V8H-5Z" } },
  th: { open: 1, d: "M0 -9.6Q22 -11.8 46 -5.6A5.6 5.6 0 0 1 46 5.6Q18 10.8 0 10A9.8 9.8 0 0 1 0 -9.6Z",
    lines: ["M6 -4Q24 -2.6 40 -3", "M29 -9Q38 -6.5 42.5 -2", "M8 5Q24 5.4 42 3.6"],
    mus: { quadriceps: "M-2 -13Q22 -14 49 -7L49 -0.5Q24 -1.5 -2 -2.5Z", ischios: "M-2 3.5Q24 4 49 2.5L49 8Q18 13 -2 12Z" } },
  sh: { open: 1, d: "M0 -5.4Q22 -4.8 44 -3.2A3.2 3.2 0 0 1 44 3.2Q30 3.8 20 6.6Q8 9.2 0 5.6A5.5 5.5 0 0 1 0 -5.4Z",
    lines: ["M3 3.4Q12 7.6 24 4.9", "M6 -2.4Q22 -1.4 38 -1.6"], mus: { mollets: "M0 1.6Q12 1.2 27 3.4Q18 9 6 10Q0 9 0 1.6Z" } },
  torso: { sy: 1.2, d: "M0 -10Q12 -16 22 -11.6Q36 -9.2 52 -11A11 11 0 0 1 52 11Q38 12.4 30 10.2Q14 14.8 0 11A10.5 10.5 0 0 1 0 -10Z",
    lines: ["M3 -9.5Q14 -15 21.5 -11", "M20 -5.5Q23 -9 22.5 -11.5", "M25.5 -10.6V-6.2", "M32.5 -9.8V-5.6", "M39.5 -10.2V-6", "M24 -7.8Q36 -7.6 48 -9", "M28 -3.8Q38 0 46 4", "M5 8.6Q18 5.8 30 7.4", "M36 8.6Q44 7 50 8"],
    mus: { pecs: "M-2 -18Q12 -19 23 -13L22 -4.5Q10 -3.5 -2 -5Z", abdos: "M23 -14Q36 -12 55 -14L55 -5.5Q36 -4.5 23 -5.5Z", obliques: "M26 -5Q40 -3 50 5L42 7Q34 1 24 0Z",
      dorsaux: "M2 5Q16 2 33 5L33 16Q14 18 -2 14Z", lombaires: "M33 5Q43 4 56 6L56 16Q38 16 31 13Z", trapezes: "M-8 3Q2 2 8 5L8 16H-8Z" } },
  neck: { d: "M-1 -4.2L10 -3.6A3.6 3.6 0 0 1 10 3.6L-1 4.6Z", lines: ["M1 -2.4L9 1.5"] },
  head: { d: "M-9 -4Q-10 -17 1 -17Q11 -17 11 -6L12.6 0.4L10.6 2Q11 6 9 8.6Q5 11.2 0 9.6Q-6 9 -8 4Q-10 0 -9 -4Z",
    lines: ["M5 -2.6L8 -2.6", "M8.6 5.4Q7 6.8 5.6 6.4", "M-3.4 -3.4Q0 -3.8 -0.2 0Q0 3.2 -3 2.6"] },
  hair: "M-9 -4Q-10 -17 1 -17Q9 -17 10.6 -9.4Q2 -12.6 -4 -9Q-7 -6.4 -9 -4Z",
  // Pied : repère de la cheville, x vers les orteils, +y vers la semelle.
  foot: { d: "M-4 -4Q6 -4.4 14 -0.4Q22 1.6 24.4 4.6Q24.6 7.2 20.4 7.2L-3 7.2Q-7.4 6.4 -6.2 1Q-6 -2.6 -4 -4Z", lines: ["M17 2.6L18.2 7"] },
  // Main fermée : repère du poignet, x vers les doigts ; les doigts entourent ce qui est tenu au point (6, 0).
  fist: { d: "M-1 -3.6L7 -4Q11.4 -3.8 11.4 0Q11.4 4 7 4.2L-1 3.6Z", lines: ["M7.2 -3.8Q9.6 0 7.2 4", "M3.6 -3.7V3.8"] },
  // Main à plat (appui au sol ou sur un banc) : x vers les doigts, +y côté paume.
  flat: { d: "M-1.2 -2.8L11 -2.2Q14.4 -1.4 14.4 1Q14.4 2.8 11 2.8L-1.2 3Z", lines: ["M8 -2.3V2.8"] },
  // Main ouverte, doigts tendus (saut, équilibre).
  open: { d: "M-1 -3.2L9 -2.8Q15 -2.4 15.4 0Q15 2.4 9 2.8L-1 3.2Z", lines: ["M9 -1V1"] }
};
/* ---------- Formes de face (symétriques ; côté gauche de l'image = miroir) ---------- */
export const FRONT = {
  ua: { open: 1, d: "M0 -7.8Q16 -8.8 31 -5A5 5 0 0 1 31 5Q16 8.8 0 7.8A7.8 7.8 0 0 1 0 -7.8Z",
    lines: ["M7 -1.5Q17 -5.5 27 -1.5", "M8 2Q18 4.5 27 2"], mus: { biceps: "M5 -4Q17 -8 29 -3L29 3Q17 7 5 4Z" } },
  delt: { d: "M-4 -8Q5 -9.6 11 -4.4Q12 0 11 4.4Q5 9.6 -4 8A8 8 0 0 1 -4 -8Z", lines: ["M8 -5.6Q10 0 8 5.6"], mus: { epaules: "M-8 -13H17V13H-8Z" } },
  fa: { open: 1, d: "M0 -5.2Q6 -6.4 27 -3A3 3 0 0 1 27 3Q6 6.2 0 5.2A5.2 5.2 0 0 1 0 -5.2Z", lines: ["M3 -2Q14 0 24 0"], mus: { avantbras: "M-5 -8H30V8H-5Z" } },
  th: { open: 1, d: "M0 -10.5Q16 -12 46 -6A6 6 0 0 1 46 6Q20 9.4 0 10.5A10.5 10.5 0 0 1 0 -10.5Z",
    lines: ["M4 -1Q24 -2 40 -1", "M30 6Q38 7.4 43 3", "M8 -6Q26 -7.5 42 -4"], mus: { quadriceps: "M-2 -13Q20 -14 49 -7L49 5Q30 7 -2 2Z" } },
  sh: { open: 1, d: "M0 -5.6Q14 -6.6 44 -3.4A3.4 3.4 0 0 1 44 3.4Q14 7.4 0 5.6A5.6 5.6 0 0 1 0 -5.6Z",
    lines: ["M4 0.4L40 0.4", "M4 3Q12 7 22 4"], mus: { mollets: "M1 1.5Q12 2 24 3L24 9H1Z" } },
  torso: { d: "M0 -6Q2 -16 4 -19Q10 -19.8 12 -17.6Q26 -16.6 38 -13.6Q46 -13 52 -15.6Q56 -10 58 0Q56 10 52 15.6Q46 13 38 13.6Q26 16.6 12 17.6Q10 19.8 4 19Q2 16 0 6Z",
    lines: ["M9 -1Q18 -2 20.5 -14", "M9 1Q18 2 20.5 14", "M6 0L20 0", "M20 0L51 0", "M26 -6.4L26 6.4", "M33 -6.8L33 6.8", "M40 -6.8L40 6.8", "M22 -7Q36 -7.6 50 -6.4", "M22 7Q36 7.6 50 6.4",
      "M13 -17Q22 -15.2 28 -13.4", "M13 17Q22 15.2 28 13.4", "M44 -12Q52 -6 56 -2", "M44 12Q52 6 56 2", "M3 -6Q2.6 -12 4.4 -17", "M3 6Q2.6 12 4.4 17"],
    mus: { pecs: "M3 -20Q18 -21 21 -14Q21 -3 20 0Q21 3 21 14Q18 21 3 20Z", abdos: "M21 -7.4H52V7.4H21Z", obliques: "M24 -7Q38 -7.6 52 -6L52 -18L24 -18ZM24 7Q38 7.6 52 6L52 18L24 18Z",
      dorsaux: "M12 -30L30 -30L30 -14.6Q22 -16 12 -17.4ZM12 30L30 30L30 14.6Q22 16 12 17.4Z", trapezes: "M-4 -20L6 -20Q3 -12 3 -5L-4 -5ZM-4 20L6 20Q3 12 3 5L-4 5Z" } },
  neck: { d: "M-1 -5L10 -4.4A4.4 4.4 0 0 1 10 4.4L-1 5Z", lines: ["M1 -3L8 -1", "M1 3L8 1"] },
  head: { d: "M0 -12.6Q10 -12.6 10 0Q10 9 5 12Q2.6 13.6 0 13.6Q-2.6 13.6 -5 12Q-10 9 -10 0Q-10 -12.6 0 -12.6Z",
    lines: ["M-5.4 -0.6H-2.4", "M2.4 -0.6H5.4", "M0 1L-0.8 5H0.8", "M-2.6 8.4Q0 9.6 2.6 8.4"] },
  hair: "M-10 -1Q-10.6 -12.6 0 -12.8Q10.6 -12.6 10 -1Q8 -7.4 0 -7.6Q-8 -7.4 -10 -1Z",
  // Tête penchée vers le sol, vue de face (pompes) : on voit le dessus du crâne (cheveux), le front juste en bas.
  crown: "M-10 0Q-10 -12.6 0 -12.6Q10 -12.6 10 0Q10 6.4 7.6 9Q0 6.2 -7.6 9Q-10 6.4 -10 0Z", crownLines: ["M0 -12.4Q-1.4 -3 0.6 5.6", "M-6.6 -8Q-4 -1 -5.4 6", "M6.6 -8Q4 -1 5.4 6"],
  fist: SIDE.fist, flat: SIDE.flat, open: SIDE.open,
  // Main posée à plat au sol, vue de face : doigts vers nous (paume raccourcie, doigts écartés côte à côte).
  palm: { d: "M-1 -6.2Q3 -6.8 6 -5.6L6.6 5.6Q3 6.8 -1 6.2Z", lines: ["M3 -3.1L6.3 -3.1", "M3 0L6.4 0", "M3 3.1L6.3 3.1"] }
};
