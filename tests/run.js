// Test suite: node tests/run.js   (exit code 1 if anything fails)
const fs = require("fs"), path = require("path");
const { C, measure, aimBox } = require("./metrics.js");
const cust = JSON.parse(fs.readFileSync(path.join(__dirname, "customer-style-set.json")));
let failed = 0, n = 0;
const t = (name, fn) => { n++; try { const r = fn(); console.log("ok   ", name, r ? "(" + r + ")" : ""); } catch (e) { failed++; console.log("FAIL ", name, "\n       " + e.message); } };
const ok = (cond, text) => { if (!cond) throw new Error(text); };
const solve = o => { const cfg = C.defaultConfig(o), out = C.solveSync(cfg); return { cfg, out, m: measure(cfg, out) }; };

const base = solve({ beam: "low", cls: "B", mode: "param" });

// --- numerics ---
t("grid evaluation matches point evaluation for all three models", () => {
  const cfg = C.defaultConfig({ beam: "low", cls: "B", mode: "param" });
  let worst = 0;
  for (const model of ["hybrid", "sqrt", "lobes"]) {
    const ctx = C.contextFor(cfg), G = ctx.core;
    const P = model === "hybrid" ? C.decodeY(C.initHybrid("low", cfg.cut, cfg.targets, cfg.shape), "low", cfg.cut, cfg.shape)
      : model === "sqrt" ? C.decodeS(C.initSqrt("low", cfg.cut, cfg.targets, cfg.shape), "low", cfg.cut, cfg.shape)
      : C.decode(C.encode(C.initPhysical("low", cfg.targets, cfg.cut), "low"), "low", cfg.cut, cfg.shape);
    const r = C.evalGrid(P, G);
    for (let j = 0; j < G.nv; j += 5) for (let i = 0; i < G.nh; i += 7) worst = Math.max(worst, Math.abs(G.out[j * G.nh + i] - C.evalI(P, G.hs[i], G.vs[j])) / r.imax);
  }
  ok(worst < 1e-4, "max relative difference " + worst.toExponential(2)); return "max diff " + worst.toExponential(1);
});
t("no NaN anywhere in a solved beam", () => {
  const { out } = base; let bad = 0;
  for (let h = -90; h <= 90; h += 1.5) for (let v = -60; v <= 40; v += 0.7) { const x = C.evalI(out.P, h, v); if (!(x >= 0) || !isFinite(x)) bad++; }
  ok(bad === 0, bad + " invalid values");
});
t("flux integration agrees with a fine grid within 1 %", () => {
  const { out } = base; let F = 0; const dh = 0.25, dv = 0.025;
  for (let v = -60; v <= 40; v += dv) { let s = 0; for (let h = -90; h <= 90; h += dh) s += C.evalI(out.P, h, v); F += s * Math.cos(v * C.DEG) * dh * dv * C.DEG * C.DEG; }
  const d = Math.abs(out.res.flux - F) / F; ok(d < 0.01, "difference " + (100 * d).toFixed(2) + " %"); return (100 * d).toFixed(2) + " %";
});
t("same input gives the same beam (deterministic)", () => {
  const a = solve({ beam: "low", cls: "CS", mode: "param" }), b = solve({ beam: "low", cls: "CS", mode: "param" });
  ok(a.m.imax === b.m.imax && a.m.flux === b.m.flux, `${a.m.imax}/${a.m.flux} vs ${b.m.imax}/${b.m.flux}`);
});
t("LHT is the mirror image of RHT", () => {
  const l = solve({ beam: "low", cls: "B", mode: "param", traffic: "LHT" });
  ok(l.m.imax === base.m.imax && l.m.flux === base.m.flux, "LHT differs from RHT");
});

// --- compliance: every class, beam parameters mode ---

const CLASSES = [["low", "B"], ["low", "CS"], ["low", "DS"], ["low", "ES"], ["high", "B"], ["high", "BS"], ["high", "CS"], ["high", "DSES"]];
for (const [beam, cls] of CLASSES) t(`${beam} beam class ${cls}: default parameters pass ECE`, () => {
  const s = beam === "low" && cls === "B" ? base : solve({ beam, cls, mode: "param" });
  ok(s.m.ece.length === 0, "fails " + s.m.ece.join(", ")); return `Imax ${s.m.imax} cd, ${s.m.flux} lm`;
});
t("hot spot lands within 0.4 deg of the requested position (class B, CS, high)", () => {
  for (const [beam, cls] of [["low", "B"], ["low", "CS"], ["high", "B"]]) {
    const s = beam === "low" && cls === "B" ? base : solve({ beam, cls, mode: "param" }), h = s.cfg.targets.hot;
    ok(Math.hypot(s.m.hot[0] - h.h, s.m.hot[1] - h.v) < 0.4, `${beam} ${cls}: at ${s.m.hot} wanted ${h.h},${h.v}`);
  }
});

// --- road requirement mode ---
const ROAD = [["built-in low example", { beam: "low", cls: "B", mode: "road", checks: C.PRESET_ROAD.low.checks }],
  ["built-in high example", { beam: "high", cls: "B", mode: "road", checks: C.PRESET_ROAD.high.checks }],
  ["customer-style set, class B", { beam: "low", cls: "B", mode: "road", checks: cust }],
  // Symmetric variant of the set: a flat cut-off at 0.57 D cannot light the axis at 70 m from 0.65 m height (so 50 m),
  // and a symmetric beam cannot hold a left-only glare limit against the mirrored right-side minimum (so that limit is dropped).
  ["customer-style set, symmetric variant, class ES", { beam: "low", cls: "ES", mode: "road", checks: cust.filter(x => !/LH side/.test(x.label)).map(x => x.type === "range" ? Object.assign({}, x, { limit: 50 }) : x) }]];
for (const [name, o] of ROAD) t(`road mode, ${name}: ECE passes and at most one road check is missed`, () => {
  const s = solve(o); ok(s.m.ece.length === 0, "ECE fails " + s.m.ece.join(", ")); ok(s.m.roadMiss.length <= 1, "road misses: " + s.m.roadMiss.join(", "));
  return s.m.roadMiss.length ? "left out: " + s.m.roadMiss[0] : "all road checks pass";
});
t("cut-off follows R149: G within limits and inflection at 0.57 D (all low-beam classes)", () => {
  for (const cls of ["B", "CS", "DS", "ES"]) {
    const s = cls === "B" ? base : solve({ beam: "low", cls, mode: "param" }), lim = C.gLimits(s.cfg.cut, cls);
    ok(s.m.G >= lim.min && (lim.max == null || s.m.G <= lim.max), `class ${cls}: G ${s.m.G}`);
    ok(Math.abs(s.m.cutPos + 0.57) <= 0.05, `class ${cls}: cut-off at ${s.m.cutPos}`);
  }
});
t("lowest-flux solve is repeatable: 3 random seeds give Imax and flux within x1.5", () => {
  const o = { beam: "low", cls: "B", mode: "road", checks: cust };
  const runs = [4242, 1, 2].map(seed => C.solveSync(Object.assign(C.defaultConfig(o), { seed })).res);
  const r = k => Math.max(...runs.map(x => x[k])) / Math.min(...runs.map(x => x[k]));
  ok(runs.every(x => x.pass), "a seed fails ECE"); ok(r("imax") < 1.5 && r("flux") < 1.5, `Imax x${r("imax").toFixed(2)}, flux x${r("flux").toFixed(2)}`);
  return `Imax x${r("imax").toFixed(2)}, flux x${r("flux").toFixed(2)}`;
});
t("ECE passes across a ±0.2° V, ±0.4° H aim box when one is set (every class, beam parameters mode)", () => {
  const AIM = { h: 0.4, v: 0.2 };
  ok(C.AIM_DEFAULT.h === 0 && C.AIM_DEFAULT.v === 0, "default aim tolerance is not 0");
  for (const [beam, cls] of CLASSES) {
    const s = solve({ beam, cls, mode: "param", aim: AIM });
    ok(s.m.aimFails === 0, `${beam} ${cls}: fails at ` + Object.entries(s.m.aimDetail).map(([k, v]) => k + " (" + v.join(",") + ")").join("; "));
  }
  return `±${AIM.v}° V, ±${AIM.h}° H`;
});
t("physical limits: Imax stays at or below LED luminance x aperture, and the LED flux follows the efficiency", () => {
  const ph = { apW: 20, apH: 15, lum: 70, eff: 0.4 }, cap = 70 * 20 * 15;   // 21 000 cd
  ok(C.physLimits(ph).imaxCap === cap, "limit is not luminance x area");
  const out = [];
  for (const o of [{ beam: "low", cls: "B", mode: "param" }, { beam: "low", cls: "B", mode: "road", checks: C.PRESET_ROAD.low.checks }]) {
    const s = solve(Object.assign({ physical: ph }, o)), r = s.out.res;
    ok(r.imax <= cap * 1.0005, `${o.mode}: Imax ${Math.round(r.imax)} cd is above the ${cap} cd limit`);
    ok(r.pass, `${o.mode}: fails ` + r.rows.filter(x => x.pass === false).map(x => x.id).join(", "));
    ok(Math.abs(r.phys.ledFlux - r.flux / 0.4) < 1e-6 && Math.abs(r.phys.minEmit - r.phys.ledFlux / (Math.PI * 70)) < 1e-6, "LED flux or emitting area is wrong");
    out.push(`${o.mode} ${Math.round(r.imax)} cd`);
  }
  const free = base.out.res;
  ok(!free.rows.some(x => x.kind === "phys") && free.phys == null, "physical limits must be off unless asked for");
  return out.join(", ") + ` of ${cap} cd`;
});
t("road-illuminate format round-trips", () => {
  const a = C.normalizeChecks(cust), b = C.normalizeChecks(C.toRoadIlluminate(a));
  ok(JSON.stringify(a.map(x => [x.type, x.x, x.y, x.min, x.max])) === JSON.stringify(b.map(x => [x.type, x.x, x.y, x.min, x.max])), "checks changed");
});

console.log(`\n${n - failed} of ${n} tests passed`);
process.exit(failed ? 1 : 0);
