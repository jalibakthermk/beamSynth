# beamSynth

A beam pattern synthesizer. Beam Synth generates a synthetic automotive headlamp beam, low beam (passing) or high beam (driving), that complies with the ECE R149 photometric test table, and shows it as an iso-candela plot and a road isolux plot. Asymmetric (Class B) and symmetric (Classes CS, DS, ES) passing beams are supported, each with its corresponding driving beam.

It runs entirely in the browser: open `docs/index.html`, or the GitHub Pages site once Pages is switched on for the `/docs` folder.

## What it does

- **Two ways to define the beam**
  - **Road requirement (JSON):** give customer requirements on the road and the tool solves for a beam that meets them. The format is the same requirement set used in [road-illuminate](https://github.com/jalibakthermk/Road-illuminate), so one customer-spec file works in both tools.
  - **Beam parameters:** beam function, R149 class, maximum intensity (cd), luminous flux (lm), horizontal spread (±°, half-width at 5 % of Imax) and vertical spread (°, height at 5 % of Imax).
  - Requirement files can be uploaded (click or drag and drop) or pasted.
- **Flux on road.** The luminous flux that reaches the road surface inside a zone you define (distance from–to, width left and right), for one lamp or the lamp pair. It is a target for the solver, with defaults you can change:

  | Beam | Default flux on road |
  |---|---|
  | Low beam, Class B, DS, ES | 600 lm |
  | Low beam, Class CS | 300 lm |
  | High beam | 600 lm |

  The default zone is 0–100 m ahead, 10 m left and 10 m right, evaluated for one lamp. Leave the target empty to only report the value. The page also shows the road share, the fraction of the emitted flux that lands in the zone.
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
  "targets": { "flux_lm": 800 },
  "roadFlux": { "target_lm": 600, "lamps": "one", "zone": { "x1": 0, "x2": 100, "left": 10, "right": 10 } },
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
- `targets` (optional) are soft goals: `imax`, `flux_lm`, `spreadH_deg`, `spreadV_deg`.
- `roadFlux` (optional): `target_lm` (`null` to only report), `lamps` (`one` or `pair`), and `zone` with `x1`, `x2` (m ahead) and `left`, `right` (m, positive extents). Without it, the default target for the class and the default zone apply.

Examples are in [`examples/`](examples).

A glare zone at road level on the oncoming lane conflicts with ECE when using vertical planes on road: at road level that area lies below the cut-off and must be lit (Zone IV). Put glare checks at eye height (`"z": 1.1`).

## How the beam is built

The intensity distribution is a sum of three Gaussian lobes (hot spot, spread, foreground). For the low beam it is multiplied by a logistic cut-off (horizontal elbow at 0.57° D with a 15° shoulder for Class B, flat for the symmetric classes, all adjustable) and has a glare-floor term above the cut-off to light the signal points P1–P8. An evolution-strategy solver adjusts the lobes until the ECE table and the road checks are met, staying as close as possible to the requested Imax, flux and spread.

The ECE preset values are a starting point. The symmetric class values follow R113 (01 series), which R149 carries over. Check them against the regulation series you certify to and edit the test table in the tool as needed.

## Repository layout

| Path | Contents |
|---|---|
| `src/core.js` | Beam model, ECE and road check evaluation, solver (also runs in Node) |
| `src/ui.js` | Page logic, plots, tables, export |
| `src/page.html` | Page markup and styles |
| `build.py` | Assembles `docs/index.html` from the sources |
| `docs/index.html` | The built tool, served by GitHub Pages |
| `examples/` | Requirement sets |

After editing anything in `src/`, run `python3 build.py`.

## GitHub Pages

Settings → Pages → Build and deployment → Deploy from a branch → `main`, folder `/docs`.

## License

Released under the [MIT License](LICENSE). © 2026 Jalib Akther
