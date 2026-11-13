# beamSynth

A beam pattern synthesizer. Beam Synth generates a synthetic automotive headlamp beam, low beam (passing) or high beam (driving), that complies with the ECE R149 photometric test table, and shows it as an iso-candela plot and a road isolux plot. Asymmetric (Class B) and symmetric (Classes CS, DS, ES) passing beams are supported, each with its corresponding driving beam.

It runs entirely in the browser: open `docs/index.html`, or the GitHub Pages site once Pages is switched on for the `/docs` folder.

## What it does

- **Two ways to define the beam**
  - **Road requirement (JSON):** give customer requirements on the road and the tool solves for a beam that meets them. The format is the same requirement set used in [road-illuminate](https://github.com/jalibakthermk/Road-illuminate), so one customer-spec file works in both tools.
  - **Beam parameters:** maximum intensity (cd), luminous flux (lm), horizontal spread (±°, half-width at 5 % of Imax), vertical spread (°, height at 5 % of Imax), hot spot position and Q factor.
    - **Hot spot position** (H, V in degrees). Defaults: 75R (1.15R 0.57D) for Class B, mirrored to 75L in left-hand traffic; 0.86D on V-V for the symmetric classes; H-V for the high beam. The solver holds the peak within about 0.1–0.3° of it.
    - **Q factor** (0–1, default 0.7) shapes the bottom of the beam. At 1 a wide beam forms a "+" (a tall hot spot crossing a flat band); as Q falls toward 0 the beam bends upward toward the sides and the lower part narrows there, so the isolines curve like a smile. Q does not move the hot spot or change the H spread; a strong smile can deepen the beam on the axis and increase the V spread.
  - Requirement files can be uploaded (click or drag and drop) or pasted.
  - **Beam function and class** are set once, above the two input modes, and apply to both. A requirement file that names `function` and `class` sets them when it is loaded.
- **Lowest flux by default.** In road requirement mode with no flux target, the tool returns the beam that meets ECE and every road check with the least emitted flux.
- **Flux on road** (optional minimum). The luminous flux that reaches the road surface inside a zone you define (distance from–to, width left and right), for one lamp or the lamp pair. The page always reports it, with the road share (the fraction of the emitted flux that lands in the zone). Set a minimum only when one is required; it then counts like a road check, and is the first requirement to give way if the checks conflict. The default zone is 0–100 m ahead, 10 m left and 10 m right, evaluated for one lamp.
- **Cut-off as R149 measures it.** The cut-off is checked by the regulation's instrumental method: a vertical scan at 2.5° from V-V with G = log E(β) − log E(β + 0.1°). You set the sharpness G (default 0.25); the compliance table shows the measured G (0.13 to 0.40 for asymmetric beams, at least 0.13 or 0.08 for the symmetric classes) and the measured cut-off position.
- **Aim tolerance** (optional, default 0). Give a tolerance in ±° vertical and ±° horizontal and the beam is solved to pass the ECE table with the lamp mis-aimed anywhere in that box; the compliance table then shows the worst margin in the box for each point. At 0 the beam is solved for nominal aim only. A Class B beam can pass up to about ±0.4° H with ±0.2° V; beyond that the cut-off shoulder reaches the 75R point.
- **Physical limits** (optional, off by default). Tick "Apply physical limits" and give the aperture width and height (mm), the LED luminance (Mcd/m², default 70) and the optical efficiency (%, default 45). Luminance is conserved through any optic, so Imax is then held at or below LED luminance × aperture area (Mcd/m² × mm² = cd); the limit appears as a row in the compliance table. The summary also shows the LED flux needed (emitted flux ÷ efficiency), the smallest Lambertian emitting area that can supply it (LED flux ÷ (π × luminance)), and how much of the Imax limit is used. With the aperture left blank the limit is not applied and the summary shows the minimum lit aperture area the solved Imax needs. Unticked, the beam is calculated without any of these parameters.
- **ECE compliance is enforced while solving.** The regulation test table for the selected class is a hard constraint; your parameters are soft targets. If a request cannot meet ECE, the tool shows the closest compliant result and reports requested against achieved values.
- **Iso-candela view** in cd or lx at 25 m, with test points, zones, the cut-off line and the hot spot.
- **Road illumination** for the lamp pair, top view with lane markings, using either *vertical planes on road* (the HSPR / GTB method, default) or *road surface* (horizontal plane) illuminance.
- **Compliance tables** for every ECE point, zone and sum, and for every road check.
- **Classes (R149)**

  | Function | Class | Cut-off | Test table |
  |---|---|---|---|
  | Low beam | B | asymmetric, 15° shoulder | B50L, 75R/L, 50R/L/V, 25R/L, P1–P8, Zones I, III, IV |
  | Low beam | CS, DS, ES | symmetric, flat at 0.57° D | points 1–15, Line 1 (2° D, 9L–9R), Zones 1 and 2 |
  | High beam | with Class B | – | Imax 48 000–215 000 cd, HV ≥ 0.8 Imax, H-2.5, H-5 |
  | High beam | BS, CS, DS / ES | – | Imax min 20 000 / 25 000 / 40 000 cd (max 215 000), H-V, H-2.5, H-5, and for CS and DS / ES also H-9, H-12, 2U-V |

  For symmetric passing beams the lobes are centred on V-V. The symmetric driving beams have no "HV within 80 % of Imax" check, as R149 exempts them.
- **Right- or left-hand traffic.** The tables are written for RHT; LHT mirrors the beam.
- **Export**
  - **Download IES:** LM-63-2002, photometric type B (H-V), absolute candela, one lamp, saved with a name such as `beamsynth_low_class-B_RHT_30081cd.ies`. Load it into road-illuminate to verify the beam. The file can also be copied as text.
  - The requirement set back in road-illuminate format.
  - The fitted model parameters as JSON.

## Road requirement format

Paste a road-illuminate requirement set as it is (a list of checks), or wrap it with vehicle settings:

```json
{
  "function": "low",
  "class": "B",
  "traffic": "RHT",
  "mounting": { "height_m": 0.65, "spacing_m": 1.4 },
  "plane": "vertical",
  "evalHeight_m": 0,
  "road": { "laneWidth_m": 3.5 },
  "aimTolerance": { "v_deg": 0, "h_deg": 0 },
  "physical": { "enabled": false, "aperture_mm": { "width": 60, "height": 30 }, "ledLuminance_Mcd_m2": 70, "efficiency_pct": 45 },
  "roadFlux": { "target_lm": null, "lamps": "one", "zone": { "x1": 0, "x2": 100, "left": 10, "right": 10 } },
  "checks": [
    { "label": "Ego lane 50 m", "type": "point", "x": 50, "y": 0, "op": ">=", "limit": 8 },
    { "label": "Reach on vehicle axis, 3 lx", "type": "range", "y": 0, "thr": 3, "op": ">=", "limit": 75 },
    { "label": "Foreground spread, 1 lx width at 20 m", "type": "width", "x": 20, "thr": 1, "op": ">=", "limit": 25 },
    { "label": "Oncoming driver eye, 50-100 m", "type": "zone", "x1": 50, "x2": 100, "y1": 1.75, "y2": 5.25, "z": 1.1, "stat": "max", "op": "<=", "limit": 0.6 }
  ]
}
```

| Check | Fields | Value compared with `limit` |
|---|---|---|
| `point` | `x`, `y` | illuminance at the point (lx) |
| `range` | `y`, `thr` | how far the `thr` lux line reaches along the line at `y` (m) |
| `width` | `x`, `thr` | lit width at `thr` lux, at distance `x` (m) |
| `zone` | `x1`, `x2`, `y1`, `y2`, `stat` (`min`, `max`, `avg`) | statistic inside the rectangle (lx) |

- `x` is distance ahead of the lamps, `y` is lateral offset from the vehicle centreline, **positive to the left** (as in road-illuminate). Values are for the lamp pair.
- `op` is `">="` or `"<="`.
- `z` (optional, per check) sets that check's evaluation height. This is a Beam Synth extension; road-illuminate ignores it.
- `class` (optional): `B`, `CS`, `DS`, `ES` for the passing beam; `B`, `BS`, `CS`, `DSES` for the driving beam.
- `targets` (optional) are soft goals: `imax`, `flux_lm`, `spreadH_deg`, `spreadV_deg`. Without `flux_lm` the solver returns the lowest-flux beam that passes.
- `aimTolerance` (optional): `v_deg` and `h_deg`, the half-sizes of the aim box in degrees.
- `physical` (optional): switches the physical limits on (unless `enabled` is `false`) and sets `aperture_mm` (`width`, `height`), `ledLuminance_Mcd_m2` and `efficiency_pct`.
- `roadFlux` (optional): `target_lm` (a minimum flux on road in lm; `null` for none), `lamps` (`one` or `pair`), and `zone` with `x1`, `x2` (m ahead) and `left`, `right` (m, positive extents).

Examples are in [`examples/`](examples).

A glare zone at road level on the oncoming lane conflicts with ECE when using vertical planes on road: at road level that area lies below the cut-off and must be lit (Zone IV). Put glare checks at eye height (`"z": 1.1`).

## How the beam is built

Three beam models can be chosen before generating:

| Model | Hot spot and surroundings | Spread and foreground |
|---|---|---|
| **Hybrid** (default) | square-root fall-off | two Gaussian lobes |
| Smooth √ fall-off | square-root fall-off over the whole beam | – |
| Lobes | Gaussian hot-spot lobe | two Gaussian lobes |

**Square-root fall-off.** Around the hot spot the intensity follows

    I = A · exp(−k · (√(ρ + ε) − √ε)),   ρ = √((Δh / Rh)² + (Δv / Rv)²)

so ln I falls with the square root of the distance. Rh and Rv are the extents to the left, right, down and up, ρ = 1 is the 5 % isoline, and ε softens the tip. Isolines at evenly stepped levels are packed tightly at the hot spot and widen outward. For the low beam the core is anchored at the cut-off (75R, or 75L in left-hand traffic, for Class B; 0.86D on V-V for the symmetric classes; H-V for the high beam), so the isolines hang from the cut-off as nested half-ovals.

**Hybrid.** The square-root core forms the hot spot and its surroundings; a spread lobe and a foreground lobe add the light needed to reach the road requirement levels. A smoothness rule keeps the beam homogeneous: along rays from the hot spot the decay rate of ln I may only ease off, never steepen again, so no bright blob on a flat band can form.

**Cut-off.** For the low beam the cut-off is defined on the logarithm of intensity, as R149 Annex 5 scans it. With m the lit fraction (1 well below the cut-off line, 0 well above, a logistic in between), the beam s and the floor F are mixed geometrically, E = s^m · F^(1−m). The log of E then follows an S-curve whose inflection sits on the cut-off line (horizontal elbow at 0.57° D with a 15° shoulder for Class B, flat for the symmetric classes) and whose steepest slope is G. The floor is a glare term that lights the signal points P1–P8, plus 0.3 % of the beam as stray light. The cut-off position and G are part of the solve; a short calibration afterwards corrects the width and offset if the measured scan is off.

A low Q factor makes the beam shallower toward the sides (square-root part) and bends the lobes upward there, so the lower isolines curve like a smile.

**Solving.** All three models use the same solver, a CMA-ES search (diagonal covariance) whose rounds stop when they converge.

1. **Find a beam that passes.** ECE (at nominal aim and, when an aim tolerance is set, at the four corners of the aim box), the cut-off scan and the road checks, with no pressure on flux.
2. **If checks are still missed** (road requirement mode): the missed checks get double weight and the search continues. If more than one still fails, a flux-on-road minimum gives way first; after that the check missed by the widest margin is left out (marked LEFT OUT in the road table).
3. **Reduce flux** (road requirement mode without a flux target): from the passing beam, the search restarts with flux in the cost, in rounds, until a round gains under 1 %.
4. **Calibrate the cut-off** to the R149 scan.

ECE outranks the road checks throughout, and the best result over all stages is kept. When no Imax target is given, a lower peak intensity is weakly preferred. The solver is deterministic: the same input always gives the same beam.

## Tests

`npm test` (or `node tests/run.js`) runs the test suite: numerics, every class against its ECE table, the R149 cut-off, road requirement sets and repeatability across random seeds, the aim box and the physical limits. `npm run bench` solves a fixed set of 12 cases and prints the metrics each change is judged on (`BS_AIM="0.4,0.2" npm run bench` solves them with an aim box); the `tests/bench-*.json` files hold the results before and after the changes in [IMPROVEMENT_PLAN.md](IMPROVEMENT_PLAN.md).

## Repository layout

| Path | Contents |
|---|---|
| `src/core.js` | Beam model, ECE and road check evaluation, solver (also runs in Node) |
| `src/ui.js` | Page logic, plots, tables, export |
| `src/page.html` | Page markup and styles |
| `build.py` | Assembles `docs/index.html` from the sources |
| `docs/index.html` | The built tool, served by GitHub Pages |
| `examples/` | Requirement sets |
| `tests/` | Test suite, benchmark and a customer-style requirement set |

After editing anything in `src/`, run `python3 build.py`.

## GitHub Pages

Settings → Pages → Build and deployment → Deploy from a branch → `main`, folder `/docs`.

## License

Released under the [MIT License](LICENSE). © 2026 Jalib Akther
