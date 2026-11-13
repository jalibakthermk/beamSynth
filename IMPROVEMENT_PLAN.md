# Improvement plan

A phased rework of the beam generation algorithm. Every phase is judged against the same benchmark (`npm run bench`): 12 cases covering every class, both input modes and three requirement sets, plus a repeatability check across random seeds.

| Phase | What changes | Acceptance | Status |
|---|---|---|---|
| 0. Benchmark and tests | Fixed benchmark and a test suite; the solve pipeline moved into one job layer shared by the page and the tests | Baseline recorded; tests run with one command | Done |
| 1. R149 cut-off | Cut-off defined in the log domain as the regulation scans it; G is an input and a compliance row | G within limits and inflection at 0.57° D in every low-beam case | Done |
| 2. Lowest-flux beam | Pass first, then reduce flux; CMA-ES search with convergence stops; flux on road becomes an optional minimum | Different random seeds give nearly the same beam | Done |
| 3. Aim tolerance | Optional aim box (default 0, nominal aim only); when set, the solve must pass ECE at every position in the box. Peak intensity refined between grid points. Beam function and class moved above the input modes; Q scale reversed | Every benchmark case passes at all positions of a ±0.2° V, ±0.4° H box | Done |
| 4. Physical limits | Optional (tick box, off by default): aperture area, LED luminance, optical efficiency | Imax never exceeds luminance × aperture; LED flux, emitting area and aperture use reported | Done |
| 5. Blocking check | "Held back by" panel: for every unmet target, failed ECE check and missed road check, the checks or targets that oppose it (from the gradients of the cost terms at the solved beam) | Aperture limit and ECE Imax maximum named correctly; nothing shown when every target is met | Done |

## Results so far

| Metric | Baseline | After phase 2 | After phase 3 |
|---|---|---|---|
| Cut-off sharpness G (low beams) | 0.42–0.47, above the 0.40 maximum | 0.24–0.28 | 0.24–0.27 |
| Cut-off position | 0.37–0.43° D | 0.53–0.58° D | 0.53–0.59° D |
| ECE pass, 12 benchmark cases | 11 | 12 | 12 |
| ECE pass across a ±0.2° V, ±0.4° H aim box, 12 cases | – | not solved for | 12 when the box is set |
| Beam parameters mode, Class B (30 000 cd, 800 lm, ±14°, 4° requested) | 33 749 cd, 693 lm, ±14.8°, 5.5° | 30 333 cd, 792 lm, ±14.0°, 4.0° | 30 621 cd, 804 lm, ±14.1°, 3.9° |
| Repeatability, customer-style set, 4 seeds (highest ÷ lowest) | Imax ×4.33, flux ×1.52, spread ×2.29 | Imax ×1.16, flux ×1.10, spread ×1.04 | Imax ×1.10, flux ×1.08, spread ×1.08 |
| Tests | – | 21 of 21 pass | 22 of 22 pass |

Phases 4 and 5 add one test each (24 of 24 pass). Example: a Class B low beam asked for 30 000 cd through a 20 × 15 mm aperture at 70 Mcd/m² (limit 21 000 cd) is solved at 20 374 cd and still passes ECE; a Class B high beam cannot pass through that aperture, because ECE needs at least 48 000 cd.

Notes:

- The softer, regulation-true cut-off puts less light just under the cut-off line, so reach is a little shorter than the earlier, too-sharp cut-off suggested.
- A flat symmetric cut-off at 0.57° D cannot light the vehicle axis at 70 m from a 0.65 m mounting height (that point lies at 0.53° D). The Class ES benchmark case therefore misses its 70 m range check; the earlier pass came from the cut-off sitting too high.
- Aim tolerance costs light: with a ±0.2° V, ±0.4° H box the lowest-flux beams need roughly 1.5 to 2.5 times the flux of the nominal-aim solution (customer-style set, Class B: 160 lm at nominal aim, 236 lm with the box), and the hot spot moves right, away from the shoulder. A ±0.5° H box with ±0.2° V is not reachable for Class B, because the 75R point then lies on the cut-off shoulder.
- The `aim` column of the benchmark counts the aim positions (of 8) where ECE fails inside the configured box; `bench-phase3.json` is solved at nominal aim, `bench-phase3-aim.json` with the box.
