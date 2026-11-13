// Benchmark: solves a fixed set of cases and prints the metrics every improvement phase is judged on.
// Usage: node tests/bench.js [label]   -> writes tests/bench-<label>.json
const fs = require("fs"), path = require("path");
const { C, measure } = require("./metrics.js");
const cust = JSON.parse(fs.readFileSync(path.join(__dirname, "customer-style-set.json")));
const CASES = [
  ["param low B", { beam: "low", cls: "B", mode: "param" }],
  ["param low CS", { beam: "low", cls: "CS", mode: "param" }],
  ["param low DS", { beam: "low", cls: "DS", mode: "param" }],
  ["param low ES", { beam: "low", cls: "ES", mode: "param" }],
  ["param high B", { beam: "high", cls: "B", mode: "param" }],
  ["param high BS", { beam: "high", cls: "BS", mode: "param" }],
  ["param high DSES", { beam: "high", cls: "DSES", mode: "param" }],
  ["param low B LHT", { beam: "low", cls: "B", mode: "param", traffic: "LHT" }],
  ["road example low B", { beam: "low", cls: "B", mode: "road", checks: C.PRESET_ROAD.low.checks }],
  ["road example high", { beam: "high", cls: "B", mode: "road", checks: C.PRESET_ROAD.high.checks }],
  ["road customer B", { beam: "low", cls: "B", mode: "road", checks: cust }],
  ["road customer ES", { beam: "low", cls: "ES", mode: "road", checks: cust }]
];
const SEEDS = [4242, 1, 2, 3];
// BS_AIM="0.4,0.2" (±H,±V in degrees) solves every case with an aim tolerance box; the default is nominal aim only
const AIM = process.env.BS_AIM ? (([h, v]) => ({ h: +h, v: +v }))(process.env.BS_AIM.split(",")) : null;
const label = process.argv[2] || "run", only = process.argv[3], res = {};
const pad = (s, n) => String(s).padEnd(n);
console.log(pad("case", 20), pad("ECE", 10), pad("road", 6), pad("G", 6), pad("cut", 6), pad("aim", 4), pad("Imax", 7), pad("flux", 5), pad("rf", 5), pad("H/V", 10), "s");
for (const [name, o] of CASES) {
  if (only && !name.includes(only)) continue;
  const cfg = C.defaultConfig(AIM ? Object.assign({ aim: AIM }, o) : o), t0 = Date.now(), out = C.solveSync(cfg), m = measure(cfg, out); m.sec = +((Date.now() - t0) / 1000).toFixed(1);
  res[name] = m;
  console.log(pad(name, 20), pad(m.ece.length ? "FAIL " + m.ece.length : "pass", 10), pad(o.mode === "road" ? m.roadMiss.length : "-", 6), pad(m.G ?? "-", 6), pad(m.cutPos ?? "-", 6), pad(m.aimFails, 4), pad(m.imax, 7), pad(m.flux, 5), pad(m.roadFlux, 5), pad(m.spreadH + "/" + m.spreadV, 10), m.sec);
}
// repeatability: same case, different random seeds
if (!only) for (const name of ["road example low B", "road customer B"]) {
  const o = CASES.find(c => c[0] === name)[1], runs = SEEDS.map(seed => { const cfg = Object.assign(C.defaultConfig(AIM ? Object.assign({ aim: AIM }, o) : o), { seed }), out = C.solveSync(cfg); return { imax: out.res.imax, flux: out.res.flux, H: out.res.sp.spreadH, ok: out.res.pass && out.res.roadRows.filter(x => x.pass === false).length <= 1 }; });
  const rng = k => { const v = runs.map(r => r[k]); return Math.max(...v) / Math.min(...v); };
  res["seeds " + name] = { imaxRatio: +rng("imax").toFixed(2), fluxRatio: +rng("flux").toFixed(2), spreadRatio: +rng("H").toFixed(2), allOk: runs.every(r => r.ok) };
  console.log(pad("seeds " + name, 26), "max/min over", SEEDS.length, "seeds: Imax x" + res["seeds " + name].imaxRatio, "flux x" + res["seeds " + name].fluxRatio, "H spread x" + res["seeds " + name].spreadRatio, "all ok:", res["seeds " + name].allOk);
}
fs.writeFileSync(path.join(__dirname, `bench-${label}.json`), JSON.stringify(res, null, 1));
