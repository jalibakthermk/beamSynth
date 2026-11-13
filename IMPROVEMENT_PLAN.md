# Improvement plan

A phased rework of the beam generation algorithm. Every phase is judged against the same benchmark (`npm run bench`): 12 cases covering every class, both input modes and three requirement sets, plus a repeatability check across random seeds.

| Phase | What changes | Acceptance | Status |
|---|---|---|---|
| 0. Benchmark and tests | Fixed benchmark and a test suite; the solve pipeline moved into one job layer shared by the page and the tests | Baseline recorded; tests run with one command | Done |
| 1. R149 cut-off | Cut-off defined in the log domain as the regulation scans it; G is an input and a compliance row | G within limits and inflection at 0.57° D in every low-beam case | Done |
| 2. Lowest-flux beam | Pass first, then reduce flux; CMA-ES search with convergence stops; flux on road becomes an optional minimum | Different random seeds give nearly the same beam | Done |
| 3. Aim tolerance | Solve must pass ECE across an aim box (default ±0.2° V, ±0.5° H) | Every case passes at all positions of the box | Planned |
| 4. Physical limits | Aperture area, LED luminance, optical efficiency | Imax never exceeds luminance × aperture; LED lumens reported | Planned |
| 5. Blocking check | Name the check that prevents a target | Shown when Imax, flux or spread cannot be met | Planned |

## Results so far

| Metric | Baseline | After phase 2 |
|---|---|---|
| Cut-off sharpness G (low beams) | 0.42–0.47, above the 0.40 maximum | 0.24–0.28 |
| Cut-off position | 0.37–0.43° D | 0.53–0.58° D |
| ECE pass, 12 benchmark cases | 11 | 12 |
| Beam parameters mode, Class B (30 000 cd, 800 lm, ±14°, 4° requested) | 33 749 cd, 693 lm, ±14.8°, 5.5° | 30 333 cd, 792 lm, ±14.0°, 4.0° |
| Repeatability, customer-style set, 4 seeds (highest ÷ lowest) | Imax ×4.33, flux ×1.52, spread ×2.29 | Imax ×1.16, flux ×1.10, spread ×1.04 |
| Tests | – | 21 of 21 pass |

Notes:

- The softer, regulation-true cut-off puts less light just under the cut-off line, so reach is a little shorter than the earlier, too-sharp cut-off suggested.
- A flat symmetric cut-off at 0.57° D cannot light the vehicle axis at 70 m from a 0.65 m mounting height (that point lies at 0.53° D). The Class ES benchmark case therefore misses its 70 m range check; the earlier pass came from the cut-off sitting too high.
- Aim tolerance is not yet part of the solve: the `aim` column of the benchmark counts aim positions (of 8) where ECE fails.
