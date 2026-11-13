// ---------- Synthetic beam core (internal frame: right-hand traffic, H + right, V + up, degrees) ----------
const DEG = Math.PI / 180;

const PRESET_TABLES = {
  low: {
    name: "ECE R112 / R149 Class B passing beam",
    note: "Values in cd for right-hand traffic. Check against the regulation series you certify to and edit as needed.",
    points: [
      { id: "B50L", h: -3.43, v: 0.57, max: 350 },
      { id: "75R", h: 1.15, v: -0.57, min: 10100 },
      { id: "75L", h: -3.43, v: -0.57, max: 10600 },
      { id: "50L", h: -3.43, v: -0.86, max: 13200 },
      { id: "50R", h: 1.72, v: -0.86, min: 10100 },
      { id: "50V", h: 0, v: -0.86, min: 5100 },
      { id: "25L", h: -9, v: -1.72, min: 1700 },
      { id: "25R", h: 9, v: -1.72, min: 1700 },
      { id: "P1", h: -4, v: 4, info: true },
      { id: "P2", h: 0, v: 4, info: true },
      { id: "P3", h: 4, v: 4, info: true },
      { id: "P4", h: -4, v: 2, info: true },
      { id: "P5", h: 0, v: 2, info: true },
      { id: "P6", h: 4, v: 2, info: true },
      { id: "P7", h: -8, v: 0, min: 65 },
      { id: "P8", h: 8, v: 0, min: 125 },
      { id: "P1+P2+P3", sum: ["P1", "P2", "P3"], min: 190 },
      { id: "P4+P5+P6", sum: ["P4", "P5", "P6"], min: 375 },
      { id: "Zone III", zone: [[-8, 1], [-8, 4], [8, 4], [8, 2], [4, 2], [1, 1]], max: 625 },
      { id: "Zone IV", zone: [[-5.15, -0.86], [5.15, -0.86], [5.15, -1.72], [-5.15, -1.72]], min: 2500 },
      { id: "Zone I", zone: [[-9, -1.72], [9, -1.72], [9, -6], [-9, -6]], maxRef: { id: "50R", k: 2 } }
    ]
  },
  high: {
    name: "ECE R112 / R149 driving beam",
    note: "Values in cd per lamp. Check against the regulation series you certify to and edit as needed.",
    points: [
      { id: "Imax", imax: true, min: 48000, max: 215000 },
      { id: "HV", h: 0, v: 0, minRatioImax: 0.8 },
      { id: "H-2.5L", h: -2.5, v: 0, min: 24000 },
      { id: "H-2.5R", h: 2.5, v: 0, min: 24000 },
      { id: "H-5L", h: -5, v: 0, min: 6000 },
      { id: "H-5R", h: 5, v: 0, min: 6000 }
    ]
  }
};

// ---- symmetric passing beam (R149 Classes CS, DS, ES; values as R113 01 series) ----
function symLowTable(cls) {
  const k = { CS: 0, DS: 1, ES: 2 }[cls];
  const pick = a => a[k];
  return [
    { id: "1 (3.5R)", h: 3.5, v: -0.86, min: pick([2000, 2000, 2500]), max: 13750 },
    { id: "2 (V)", h: 0, v: -0.86, min: pick([2450, 4900, 4900]) },
    { id: "3 (3.5L)", h: -3.5, v: -0.86, min: pick([2000, 2000, 2500]), max: 13750 },
    { id: "4L", h: -1.5, v: 0.5, max: 900 },
    { id: "4R", h: 1.5, v: 0.5, max: 900 },
    { id: "5L", h: -15, v: -2, min: pick([550, 1100, 1100]) },
    { id: "5R", h: 15, v: -2, min: pick([550, 1100, 1100]) },
    { id: "6L", h: -20, v: -4, min: pick([150, 300, 600]) },
    { id: "6R", h: 20, v: -4, min: pick([150, 300, 600]) },
    { id: "7 (HV)", h: 0, v: 0, max: 1700 },
    { id: "Line 1", line: [[-9, -2], [9, -2]], min: pick([1350, 1350, 1900]) },
    { id: "8", h: -8, v: 4, max: 700 },
    { id: "9", h: 0, v: 4, max: 700 },
    { id: "10", h: 8, v: 4, max: 700 },
    { id: "11", h: -4, v: 2, max: 900 },
    { id: "12", h: 0, v: 2, max: 900 },
    { id: "13", h: 4, v: 2, max: 900 },
    { id: "14L", h: -8, v: 0, min: 50 },
    { id: "14R", h: 8, v: 0, min: 50 },
    { id: "15L", h: -4, v: 0, min: 100, max: 900 },
    { id: "15R", h: 4, v: 0, min: 100, max: 900 },
    { id: "Zone 1", zone: [[-8, 1], [-8, 4], [8, 4], [8, 1], [4, 0], [1, 0], [0, 0.6], [-1, 0], [-4, 0]], max: 900 },
    { id: "Zone 2", zone: [[-8, 4.01], [8, 4.01], [8, 14.99], [-8, 14.99]], max: 700 }
  ];
}
function symHighTable(cls) {
  const T = {
    BS: { imax: 20000, hv: 16000, h25: 9000, h5: 2500 },
    CS: { imax: 25000, hv: 20000, h25: 10000, h5: 3500, h9: 2000, h12: 600, u2: 1000 },
    DSES: { imax: 40000, hv: 30000, h25: 20000, h5: 5000, h9: 3400, h12: 1000, u2: 1700 }
  }[cls];
  const t = [
    { id: "Imax", imax: true, min: T.imax, max: 215000 },
    { id: "H-V", h: 0, v: 0, min: T.hv },
    { id: "H-2.5L", h: -2.5, v: 0, min: T.h25 }, { id: "H-2.5R", h: 2.5, v: 0, min: T.h25 },
    { id: "H-5L", h: -5, v: 0, min: T.h5 }, { id: "H-5R", h: 5, v: 0, min: T.h5 }
  ];
  if (T.h9) t.push({ id: "H-9L", h: -9, v: 0, min: T.h9 }, { id: "H-9R", h: 9, v: 0, min: T.h9 },
    { id: "H-12L", h: -12, v: 0, min: T.h12 }, { id: "H-12R", h: 12, v: 0, min: T.h12 }, { id: "2U-V", h: 0, v: 2, min: T.u2 });
  return t;
}
const SYM_NOTE = "Symmetric classes for L and T category vehicles. Values in cd as in R113 01 series, carried into R149. Check against the series you certify to and edit as needed.";
["CS", "DS", "ES"].forEach(c => { PRESET_TABLES["low_" + c] = { name: `ECE R149 Class ${c} passing beam (symmetric)`, note: SYM_NOTE, points: symLowTable(c) }; });
PRESET_TABLES.high_BS = { name: "ECE R149 Class BS driving beam", note: SYM_NOTE + " Primary driving beam; HV need not lie in the 80 % isocandela.", points: symHighTable("BS") };
PRESET_TABLES.high_CS = { name: "ECE R149 Class CS driving beam", note: SYM_NOTE + " Primary driving beam; HV need not lie in the 80 % isocandela.", points: symHighTable("CS") };
PRESET_TABLES.high_DSES = { name: "ECE R149 Class DS / ES driving beam", note: SYM_NOTE + " Primary driving beam; HV need not lie in the 80 % isocandela.", points: symHighTable("DSES") };

const PRESET_ROAD = {
  low: {
    function: "low", traffic: "RHT",
    mounting: { height_m: 0.65, spacing_m: 1.4 },
    plane: "vertical", evalHeight_m: 0,
    road: { laneWidth_m: 3.5 },
    roadFlux: { target_lm: null, lamps: "one", zone: { x1: 0, x2: 100, left: 10, right: 10 } },
    checks: [
      { label: "Ego lane 50 m", type: "point", x: 50, y: 0, op: ">=", limit: 8 },
      { label: "Reach on vehicle axis, 3 lx", type: "range", y: 0, thr: 3, op: ">=", limit: 75 },
      { label: "Kerb-side reach, 1 lx along right edge", type: "range", y: -1.75, thr: 1, op: ">=", limit: 90 },
      { label: "Foreground spread, 1 lx width at 20 m", type: "width", x: 20, thr: 1, op: ">=", limit: 25 },
      { label: "Oncoming driver eye, 50-100 m", type: "zone", x1: 50, x2: 100, y1: 1.75, y2: 5.25, z: 1.1, stat: "max", op: "<=", limit: 0.6 }
    ]
  },
  high: {
    function: "high", traffic: "RHT",
    mounting: { height_m: 0.65, spacing_m: 1.4 },
    plane: "vertical", evalHeight_m: 0,
    road: { laneWidth_m: 3.5 },
    roadFlux: { target_lm: null, lamps: "one", zone: { x1: 0, x2: 100, left: 10, right: 10 } },
    checks: [
      { label: "Centre 100 m", type: "point", x: 100, y: 0, op: ">=", limit: 10 },
      { label: "Reach on vehicle axis, 1 lx", type: "range", y: 0, thr: 1, op: ">=", limit: 300 },
      { label: "Reach along left edge, 3 lx", type: "range", y: 5.25, thr: 3, op: ">=", limit: 120 },
      { label: "Width of 3 lx at 60 m", type: "width", x: 60, thr: 3, op: ">=", limit: 15 },
      { label: "Right verge 30-60 m, min", type: "zone", x1: 30, x2: 60, y1: -1.75, y2: -5, stat: "min", op: ">=", limit: 3 }
    ]
  }
};

const BOUNDS = {
  low: [
    ["log", 2000, 150000], ["lin", -3, 4], ["lin", -3, -0.4], ["log", 0.8, 10], ["log", 0.3, 3],
    ["log", 200, 60000], ["lin", -4, 4], ["lin", -5, -0.4], ["log", 2, 40], ["log", 0.6, 6],
    ["log", 30, 20000], ["lin", -14, -1.5], ["log", 8, 70], ["log", 1.5, 15],
    ["log", 10, 600]
  ],
  high: [
    ["log", 5000, 260000], ["lin", -2, 2], ["lin", -1.5, 1.5], ["log", 0.8, 10], ["log", 0.5, 5],
    ["log", 300, 150000], ["lin", -2, 2], ["lin", -2.5, 1], ["log", 3, 40], ["log", 1, 10],
    ["log", 30, 30000], ["lin", -10, 0], ["log", 10, 70], ["log", 2, 15],
    ["log", 1, 2]
  ]
};

function decodeVal(b, u) { return b[0] === "log" ? b[1] * Math.pow(b[2] / b[1], u) : b[1] + u * (b[2] - b[1]); }
function encodeVal(b, x) {
  x = Math.min(Math.max(x, b[1]), b[2]);
  return b[0] === "log" ? Math.log(x / b[1]) / Math.log(b[2] / b[1]) : (x - b[1]) / (b[2] - b[1]);
}

// Smile factor S (0..1): bends each lobe upward toward the sides so the isolines form a smile
// instead of a "+" (S = 0). The bend follows the lobe's own horizontal width, so the shape scales
// with the H spread, and is zero on the lobe's axis, so the hot spot does not move.
function applySmile(P, S) {
  P.smile = S > 0 ? S : 0;
  const ref = P.cut ? P.cut.elbow - 0.3 : null;
  const hc = P.comps[0].h, W = SMILE.wk * Math.max(P.comps[1].sh, P.comps[0].sh);   // one smooth bend for the whole beam
  for (const c of P.comps) {
    c.bc = hc; c.w = W;
    c.rise = !(S > 0) ? 0 : ref != null ? Math.min(SMILE.riseMax * S, S * Math.max(0, ref - c.v)) : S * SMILE.hiRise * c.sv;
    c.thin = SMILE.thin * Math.min(1, S > 0 ? S : 0);
  }
  return P;
}
const SMILE = { wk: 1.0, thin: 0.6, riseMax: 6, hiRise: 0.6 };

function decode(u, beam, cut, opt) {
  const B = BOUNDS[beam], x = u.map((ui, i) => decodeVal(B[i], ui));
  if (cut && cut.sym) { x[1] = 0; x[6] = 0; }   // symmetric passing beam: lobes centred on V-V
  if (opt && opt.hot) {   // hot-spot lobe pinned in H; in V it may sit up to 0.6° above the target so the peak lands on it
    x[1] = cut && cut.sym ? 0 : opt.hot.h + (cut ? -0.8 + Math.min(1, Math.max(0, u[1])) : 0);
    x[2] = opt.hot.v - 0.15 + 0.75 * Math.min(1, Math.max(0, u[2]));
  }
  const P = {
    beam, cut,
    comps: [
      { A: x[0], h: x[1], v: x[2], sh: x[3], sv: x[4] },
      { A: x[5], h: x[6], v: x[7], sh: x[8], sv: x[9] },
      { A: x[10], h: 0, v: x[11], sh: x[12], sv: x[13] }
    ],
    sigA: beam === "low" ? x[14] : 0
  };
  return applySmile(P, opt && opt.smile);
}
function encode(phys, beam) {
  const B = BOUNDS[beam], c = phys.comps;
  const x = [c[0].A, c[0].h, c[0].v, c[0].sh, c[0].sv, c[1].A, c[1].h, c[1].v, c[1].sh, c[1].sv,
    c[2].A, c[2].v, c[2].sh, c[2].sv, beam === "low" ? phys.sigA : 1.5];
  return x.map((xi, i) => encodeVal(B[i], xi));
}

function cutoffV(cut, h) { return h > 0 ? Math.min(cut.elbow + h * Math.tan(cut.angle * DEG), Math.max(cut.cap, cut.elbow)) : cut.elbow; }
// Cut-off, defined the way R149 Annex 5 measures it (vertical scan of log E, G = log E(b) - log E(b + 0.1 deg)).
// m is the "lit fraction": 1 well below the cut-off line, 0 well above, a logistic of width cut.sharp between.
// cutBlend mixes the beam s and the floor F geometrically, E = s^m * F^(1-m), so log E follows an S-curve whose
// inflection sits on the cut-off line and whose steepest slope is G = log10(s / F) * tanh(0.025 / cut.sharp).
// cut.off (deg) is a small calibration offset so the measured inflection lands exactly on the nominal line.
function maskAt(P, h, v) { if (P.beam !== "low") return 1; return 1 / (1 + Math.exp((v - cutoffV(P.cut, h) - (P.cut.off || 0)) / P.cut.sharp)); }
const PREF = { flux: 2, passFlux: +(typeof process !== "undefined" && process.env.BS_PF || 0.4), imax: 0.3 };
const STRAY = 0.003;      // light above the cut-off never drops below 0.3 % of the beam it is cut from
function cutBlend(s, m, floor) {
  if (m >= 0.99999) return s;
  const F = floor + STRAY * s;
  if (m <= 1e-5) return F;
  if (!(s > 1e-12)) return (1 - m) * floor;
  const x = (1 - m) * Math.log(s / F);            // E = s * (F / s)^(1 - m)
  return x >= 0 ? s * expNeg(x) : s * Math.exp(-x);
}
function widthForG(g, contrast) { const r = Math.min(0.98, g / contrast); return 0.025 / (0.5 * Math.log((1 + r) / (1 - r))); }   // inverse of G = contrast * tanh(0.025 / w)
const SIG_SH = 12, SIG_V = 2, SIG_SV = 2.5;
function sigAt(h, v) { const a = h / SIG_SH, b = (v - SIG_V) / SIG_SV; return Math.exp(-0.5 * (a * a + b * b)); }

function evalM(P, h, v, m) {
  if (P.model === "hybrid") return evalHybM(P, h, v, m);
  if (P.model === "sqrt") return evalSqrtM(P, h, v, m);
  let s = 0;
  if (P.smile) {
    for (const c of P.comps) {
      const a = (h - c.h) / c.sh, d = (h - c.bc) / c.w, bend = 1 - Math.exp(-0.5 * d * d);
      const vc = c.v + c.rise * bend, b = (v - vc) / (v < vc ? c.sv * (1 - c.thin * bend) : c.sv);
      s += c.A * Math.exp(-0.5 * (a * a + b * b));
    }
  } else for (const c of P.comps) { const a = (h - c.h) / c.sh, b = (v - c.v) / c.sv; s += c.A * Math.exp(-0.5 * (a * a + b * b)); }
  if (P.beam === "low") s = cutBlend(s, m, P.sigA * sigAt(h, v));
  return s;
}
function evalI(P, h, v) { return evalM(P, h, v, maskAt(P, h, v)); }

// ---------- grids ----------
// v1 may be a list of [from, to, step] bands instead of an end angle: rows are then cell centres with their own heights
// (fine near the horizon where the beam and the cut-off are, coarse far above and below).
function makeGrid(beam, cut, h0, h1, dh, v0, v1, dv) {
  const nh = Math.round((h1 - h0) / dh) + 1, bands = Array.isArray(v0) ? v0 : null;
  let vs, dvs = null, nv;
  if (bands) {
    const a = [], d = [];
    for (const [f, t, st] of bands) { const n = Math.round((t - f) / st); for (let k = 0; k < n; k++) { a.push(f + (k + 0.5) * st); d.push(st); } }
    nv = a.length; vs = Float64Array.from(a); dvs = Float64Array.from(d); dv = null;
  } else { nv = Math.round((v1 - v0) / dv) + 1; vs = new Float64Array(nv); for (let j = 0; j < nv; j++) vs[j] = v0 + j * dv; }
  const hs = new Float64Array(nh);
  for (let i = 0; i < nh; i++) hs[i] = h0 + i * dh;
  const P0 = { beam, cut };
  let mask = null;
  if (beam === "low") { mask = new Float64Array(nh * nv); for (let j = 0; j < nv; j++) for (let i = 0; i < nh; i++) mask[j * nh + i] = maskAt(P0, hs[i], vs[j]); }
  const sgh = new Float64Array(nh), sgv = new Float64Array(nv);
  for (let i = 0; i < nh; i++) sgh[i] = Math.exp(-0.5 * (hs[i] / SIG_SH) ** 2);
  for (let j = 0; j < nv; j++) sgv[j] = Math.exp(-0.5 * ((vs[j] - SIG_V) / SIG_SV) ** 2);
  const dOm = new Float64Array(nv);
  for (let j = 0; j < nv; j++) dOm[j] = Math.cos(vs[j] * DEG) * dh * (dvs ? dvs[j] : dv) * DEG * DEG;
  return { beam, nh, nv, hs, vs, dh, dv, dvs, mask, sgh, sgv, dOm, out: new Float64Array(nh * nv), env: new Float64Array(nh),
    gh: [0, 1, 2].map(() => new Float64Array(nh)), gv: [0, 1, 2].map(() => new Float64Array(nv)) };
}

function evalGridSmile(P, G) {
  const { nh, nv, hs, vs, mask, out, env } = G, low = P.beam === "low", sA = P.sigA, C = P.comps;
  out.fill(0); env.fill(0);
  if (G.dvs) {   // banded grid: rows are not evenly spaced, so evaluate each lobe directly
    for (let k = 0; k < 3; k++) {
      const c = C[k], lim = 1e-6 * c.A;
      for (let i = 0; i < nh; i++) {
        const a = (hs[i] - c.h) / c.sh, amp = c.A * Math.exp(-0.5 * a * a); if (amp < lim) continue;
        const d = (hs[i] - c.bc) / c.w, bend = 1 - Math.exp(-0.5 * d * d), vc = c.v + c.rise * bend, iLo = 1 / (c.sv * (1 - c.thin * bend)), iUp = 1 / c.sv;
        for (let j = 0; j < nv; j++) { const t = vs[j] - vc, b = t * (t < 0 ? iLo : iUp); if (b * b < 45) out[j * nh + i] += amp * Math.exp(-0.5 * b * b); }
      }
    }
  } else
  for (let k = 0; k < 3; k++) {
    const c = C[k], lim = 1e-6 * c.A;
    for (let i = 0; i < nh; i++) {
      const a = (hs[i] - c.h) / c.sh, amp = c.A * Math.exp(-0.5 * a * a);
      if (amp < lim) continue;
      const d = (hs[i] - c.bc) / c.w, bend = 1 - Math.exp(-0.5 * d * d);
      // lower half narrows toward the sides (thin); upper half keeps its width
      const vc = c.v + c.rise * bend, invLo = 1 / (c.sv * (1 - c.thin * bend)), invUp = 1 / c.sv;
      const jc = Math.min(nv - 1, Math.max(-1, Math.floor((vc - vs[0]) / G.dv)));      // last row below vc
      const j0 = Math.max(0, Math.floor((vc - 4.5 / invLo - vs[0]) / G.dv)), j1 = Math.min(nv - 1, Math.ceil((vc + 4.5 / invUp - vs[0]) / G.dv));
      // Gaussian by recurrence: g(j+1) = g(j) * r(j), r(j+1) = r(j) * q  (one exp per run instead of one per point)
      const run = (ja, jb, inv) => {
        if (jb < ja) return;
        const dvv = G.dv * inv, b0 = (vs[ja] - vc) * inv, q = Math.exp(-dvv * dvv);
        let g = amp * Math.exp(-0.5 * b0 * b0), r = Math.exp(-b0 * dvv - 0.5 * dvv * dvv);
        for (let j = ja; j <= jb; j++) { out[j * nh + i] += g; g *= r; r *= q; }
      };
      run(j0, Math.min(jc, j1), invLo); run(Math.max(jc + 1, j0), j1, invUp);
    }
  }
  let max = -1, mi = 0, mj = 0, flux = 0;
  for (let j = 0; j < nv; j++) {
    const sv = G.sgv[j] * sA, row = j * nh; let rowSum = 0;
    for (let i = 0; i < nh; i++) {
      let s = out[row + i];
      if (low) { s = cutBlend(s, mask[row + i], G.sgh[i] * sv); out[row + i] = s; }
      rowSum += s;
      if (s > env[i]) env[i] = s;
      if (s > max) { max = s; mi = i; mj = j; }
    }
    flux += rowSum * G.dOm[j];
  }
  return { imax: max, hMax: hs[mi], vMax: vs[mj], mi, mj, flux };
}

function evalGrid(P, G) {
  if (P.model === "hybrid") return evalGridHyb(P, G);
  if (P.model === "sqrt") return evalGridSqrt(P, G);
  if (P.smile) return evalGridSmile(P, G);
  const { nh, nv, hs, vs, mask, out, env, gh, gv } = G;
  for (let k = 0; k < 3; k++) {
    const c = P.comps[k];
    for (let i = 0; i < nh; i++) { const a = (hs[i] - c.h) / c.sh; gh[k][i] = c.A * Math.exp(-0.5 * a * a); }
    for (let j = 0; j < nv; j++) { const b = (vs[j] - c.v) / c.sv; gv[k][j] = Math.exp(-0.5 * b * b); }
  }
  const g0 = gh[0], g1 = gh[1], g2 = gh[2], low = P.beam === "low", sA = P.sigA;
  let max = -1, mi = 0, mj = 0, flux = 0;
  env.fill(0);
  for (let j = 0; j < nv; j++) {
    const a0 = gv[0][j], a1 = gv[1][j], a2 = gv[2][j], sv = G.sgv[j] * sA, row = j * nh;
    let rowSum = 0;
    for (let i = 0; i < nh; i++) {
      let s = g0[i] * a0 + g1[i] * a1 + g2[i] * a2;
      if (low) s = cutBlend(s, mask[row + i], G.sgh[i] * sv);
      out[row + i] = s; rowSum += s;
      if (s > env[i]) env[i] = s;
      if (s > max) { max = s; mi = i; mj = j; }
    }
    flux += rowSum * G.dOm[j];
  }
  return { imax: max, hMax: hs[mi], vMax: vs[mj], mi, mj, flux };
}

function crossing(xa, ya, xb, yb, t) { return ya === yb ? xb : xa + (t - ya) / (yb - ya) * (xb - xa); }

function spreads(G, r, frac) {
  const thr = frac * r.imax, { env, hs, nh, nv, vs, out } = G;
  let L = hs[0], R = hs[nh - 1];
  for (let i = 0; i < nh; i++) if (env[i] >= thr) { L = i > 0 ? crossing(hs[i - 1], env[i - 1], hs[i], env[i], thr) : hs[0]; break; }
  for (let i = nh - 1; i >= 0; i--) if (env[i] >= thr) { R = i < nh - 1 ? crossing(hs[i + 1], env[i + 1], hs[i], env[i], thr) : hs[nh - 1]; break; }
  let B = vs[0], T = vs[nv - 1];
  const col = j => out[j * nh + r.mi];
  for (let j = 0; j < nv; j++) if (col(j) >= thr) { B = j > 0 ? crossing(vs[j - 1], col(j - 1), vs[j], col(j), thr) : vs[0]; break; }
  for (let j = nv - 1; j >= 0; j--) if (col(j) >= thr) { T = j < nv - 1 ? crossing(vs[j + 1], col(j + 1), vs[j], col(j), thr) : vs[nv - 1]; break; }
  return { left: L, right: R, spreadH: (Math.abs(L) + Math.abs(R)) / 2, bottom: B, top: T, spreadV: T - B };
}

// ---------- requirement compilation ----------
function pointInPoly(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
  }
  return inside;
}

function compileTable(table, beam, cut, step) {
  const P0 = { beam, cut }; step = step || 0.25;
  return table.map(e => {
    const c = Object.assign({}, e);
    if (e.zone) {
      const xs = e.zone.map(p => p[0]), ys = e.zone.map(p => p[1]);
      const pts = [];
      for (let h = Math.min(...xs); h <= Math.max(...xs) + 1e-9; h += step)
        for (let v = Math.min(...ys); v <= Math.max(...ys) + 1e-9; v += step)
          if (pointInPoly(h, v, e.zone) || e.zone.some(p => Math.abs(p[0] - h) < 1e-6 && Math.abs(p[1] - v) < 1e-6)) pts.push([h, v, maskAt(P0, h, v)]);
      e.zone.forEach(p => pts.push([p[0], p[1], maskAt(P0, p[0], p[1])]));
      c.samples = pts;
    } else if (e.line) {
      const [[h1, v1], [h2, v2]] = e.line, n = Math.max(1, Math.ceil(Math.hypot(h2 - h1, v2 - v1) / step));
      c.samples = [];
      for (let k = 0; k <= n; k++) { const h = h1 + (h2 - h1) * k / n, v = v1 + (v2 - v1) * k / n; c.samples.push([h, v, maskAt(P0, h, v)]); }
      c.zone = null; c.isLine = true;
    } else if (e.h != null) c.m = maskAt(P0, e.h, e.v);
    return c;
  });
}

// ---------- road checks (road-illuminate requirement format) ----------
// A check is normalised to: {label, type: point|range|width|zone, x, y, thr, x1, x2, y1, y2, stat, z, min, max}
// with y positive to the RIGHT (Beam Synth display frame). road-illuminate files use y positive to the LEFT.
function normalizeChecks(src) {
  const out = [];
  const opLim = (c, o) => {
    if (c.op === ">=" || c.op === ">") o.min = +c.limit;
    else if (c.op === "<=" || c.op === "<") o.max = +c.limit;
    if (c.min != null) o.min = +c.min;
    if (c.max != null) o.max = +c.max;
  };
  const list = Array.isArray(src) ? src : [];
  list.forEach((c, i) => {
    if (!c || typeof c !== "object") return;
    const label = c.label || c.id || `Check ${i + 1}`;
    if (c.x_m != null && c.y_m != null && !c.type) {           // Beam Synth v1 point format (y + right)
      const o = { label, type: "point", x: +c.x_m, y: +c.y_m, z: c.z_m != null ? +c.z_m : null };
      opLim(c, o); out.push(o); return;
    }
    const t = c.type, z = c.z != null ? +c.z : null;
    const o = { label, type: t, z, src: c };
    if (t === "point") { o.x = +c.x; o.y = -c.y; }
    else if (t === "range") { o.y = -c.y; o.thr = +c.thr; }
    else if (t === "width") { o.x = +c.x; o.thr = +c.thr; }
    else if (t === "zone") { o.x1 = Math.min(+c.x1, +c.x2); o.x2 = Math.max(+c.x1, +c.x2); const a = -c.y1, b = -c.y2; o.y1 = Math.min(a, b); o.y2 = Math.max(a, b); o.stat = c.stat || "max"; }
    else return;
    opLim(c, o);
    const bad = ["x", "y", "thr", "x1", "x2", "y1", "y2"].some(k => k in o && !isFinite(o[k]));
    if (!bad && (o.min != null || o.max != null || t)) out.push(o);
  });
  return out;
}

function toRoadIlluminate(checks) {
  const r = v => Math.round(v * 1000) / 1000;
  return checks.map(c => {
    const o = { label: c.label, type: c.type };
    if (c.type === "point") { o.x = r(c.x); o.y = r(-c.y); }
    if (c.type === "range") { o.y = r(-c.y); o.thr = c.thr; }
    if (c.type === "width") { o.x = r(c.x); o.thr = c.thr; }
    if (c.type === "zone") { o.x1 = c.x1; o.x2 = c.x2; o.y1 = r(-c.y2); o.y2 = r(-c.y1); o.stat = c.stat; }
    if (c.z != null) o.z = c.z;
    if (c.min != null) { o.op = ">="; o.limit = c.min; } else if (c.max != null) { o.op = "<="; o.limit = c.max; }
    return o;
  });
}

function makeSampler(spec, beam, cut) {
  const P0 = { beam, cut }, H = spec.height, s = spec.spacing / 2, lht = spec.traffic === "LHT", vert = spec.plane !== "horizontal";
  return (x, y, z) => {
    const yi = lht ? -y : y;
    return [-s, s].map(ly => {
      const dx = x, dy = yi - ly, dz = z - H, d = Math.hypot(dx, dy, dz);
      const h = Math.atan2(dy, dx) / DEG, v = Math.atan2(dz, Math.hypot(dx, dy)) / DEG;
      const f = vert ? dx / (d * d * d) : Math.max(0, H - z) / (d * d * d);
      return { h, v, m: maskAt(P0, h, v), f };
    });
  };
}

function compileRoad(spec, beam, cut) {
  const smp = makeSampler(spec, beam, cut), zDef = spec.evalH || 0;
  return (spec.checks || []).map(c => {
    const z = c.z != null ? c.z : zDef, o = Object.assign({}, c, { zEval: z });
    if (c.type === "point") o.pts = [smp(c.x, c.y, z)];
    else if (c.type === "range") {
      const xMax = Math.max(300, 2 * (c.min || c.max || 0)); o.xs = [];
      for (let x = 1; x <= xMax; x += 1) o.xs.push(x);
      o.pts = o.xs.map(x => smp(x, c.y, z));
    } else if (c.type === "width") {
      o.ys = []; for (let y = -40; y <= 40 + 1e-9; y += 0.25) o.ys.push(y);
      o.pts = o.ys.map(y => smp(c.x, y, z));
    } else if (c.type === "zone") {
      const nx = Math.max(2, Math.min(40, Math.ceil((c.x2 - c.x1) / 1.5))), ny = Math.max(2, Math.min(16, Math.ceil((c.y2 - c.y1) / 0.4)));
      o.pts = [];
      for (let i = 0; i <= nx; i++) for (let j = 0; j <= ny; j++) o.pts.push(smp(c.x1 + (c.x2 - c.x1) * i / nx, c.y1 + (c.y2 - c.y1) * j / ny, z));
    }
    return o;
  });
}

// ---------- flux on road ----------
// Luminous flux landing on the road surface inside a rectangle ahead of the vehicle:
// sum of horizontal illuminance x area. zone: {x1, x2, left, right} in metres (left/right as positive extents).
// Flux on road is an optional minimum: none by default, so the beam uses the least flux that meets the requirements.
const ROAD_FLUX_ZONE = { x1: 0, x2: 100, left: 10, right: 10 };
function roadFluxDefault() { return null; }

function compileRoadFlux(spec, beam, cut) {
  if (!spec || !spec.zone) return null;
  const z = spec.zone, x1 = Math.max(0.05, Math.min(z.x1, z.x2)), x2 = Math.max(z.x1, z.x2);
  const yA = -Math.abs(z.left), yB = Math.abs(z.right);
  if (!(x2 > x1) || !(yB > yA)) return null;
  const smp = makeSampler({ height: spec.height, spacing: spec.spacing, traffic: spec.traffic, plane: "horizontal" }, beam, cut);
  // finer steps close to the lamps where illuminance changes fastest
  const xs = [], dxs = [];
  let x = x1;
  while (x < x2 - 1e-9) { const dx = Math.min(x < 10 ? 0.25 : x < 30 ? 0.5 : x < 80 ? 1 : 2, x2 - x); xs.push(x + dx / 2); dxs.push(dx); x += dx; }
  const dy = Math.min(0.5, (yB - yA) / 8), ys = [];
  for (let y = yA + dy / 2; y < yB; y += dy) ys.push(y);
  const pts = [];
  xs.forEach((xc, i) => ys.forEach(yc => { smp(xc, yc, 0).forEach(L => { if (L.f > 0) pts.push({ h: L.h, v: L.v, m: L.m, w: L.f * dxs[i] * dy }); }); }));
  return { pts, perLamp: spec.lamps === "one", target: spec.target || null };
}
// Fast version: weights on the angular flux grid. Each grid cell is subsampled; the weight is the
// share of its solid angle whose ray lands inside the zone (summed over the lamps).
function compileRoadFluxGrid(spec, G) {
  if (!spec || !spec.zone) return null;
  const z = spec.zone, x1 = Math.max(0, Math.min(z.x1, z.x2)), x2 = Math.max(z.x1, z.x2);
  const lht = spec.traffic === "LHT", yA = lht ? -Math.abs(z.right) : -Math.abs(z.left), yB = lht ? Math.abs(z.left) : Math.abs(z.right);
  if (!(x2 > x1) || !(yB > yA)) return null;
  const H = spec.height, s = spec.spacing / 2, n = 4, idx = [], wt = [];
  for (let j = 0; j < G.nv; j++) {
    const dvj = G.dvs ? G.dvs[j] : G.dv;
    if (G.vs[j] - dvj / 2 >= 0) continue;
    for (let i = 0; i < G.nh; i++) {
      let hit = 0;
      for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) {
        const h = (G.hs[i] + (a + 0.5) / n * G.dh - G.dh / 2) * DEG, v = (G.vs[j] + (b + 0.5) / n * dvj - dvj / 2) * DEG;
        if (v >= 0) continue;
        const r = H / Math.tan(-v), x = r * Math.cos(h), dy = r * Math.sin(h);
        if (x < x1 || x > x2) continue;
        for (const ly of [-s, s]) { const y = ly + dy; if (y >= yA && y <= yB) hit++; }
      }
      if (hit) { idx.push(j * G.nh + i); wt.push(hit / (n * n) * G.dOm[j]); }
    }
  }
  return { idx: Int32Array.from(idx), wt: Float64Array.from(wt), perLamp: spec.lamps === "one", target: spec.target || null, G };
}
function roadFluxFromGrid(rf) { let F = 0; const o = rf.G.out; for (let k = 0; k < rf.idx.length; k++) F += o[rf.idx[k]] * rf.wt[k]; return rf.perLamp ? F / 2 : F; }

function roadFluxOf(P, rf) {
  if (!rf) return null;
  let F = 0; for (const p of rf.pts) F += evalM(P, p.h, p.v, p.m) * p.w;
  return rf.perLamp ? F / 2 : F;
}

function luxOf(P, lamps) { let E = 0; for (const L of lamps) E += evalM(P, L.h, L.v, L.m) * L.f; return E; }

function checkValue(P, c) {
  if (c.type === "point") return { val: luxOf(P, c.pts[0]) };
  const E = c.pts.map(l => luxOf(P, l));
  if (c.type === "zone") {
    let v = c.stat === "min" ? Infinity : c.stat === "avg" ? 0 : -Infinity;
    for (const e of E) { if (c.stat === "min") v = Math.min(v, e); else if (c.stat === "avg") v += e; else v = Math.max(v, e); }
    return { val: c.stat === "avg" ? v / E.length : v };
  }
  if (c.type === "range") {
    let last = -1; for (let i = 0; i < E.length; i++) if (E[i] >= c.thr) last = i;
    if (last < 0) return { val: 0, reach: null };
    const x = last === E.length - 1 ? c.xs[last] : crossing(c.xs[last], E[last], c.xs[last + 1], E[last + 1], c.thr);
    return { val: x, reach: x };
  }
  if (c.type === "width") {
    let a = -1, b = -1; for (let i = 0; i < E.length; i++) if (E[i] >= c.thr) { if (a < 0) a = i; b = i; }
    if (a < 0) return { val: 0, span: null };
    const ya = a > 0 ? crossing(c.ys[a - 1], E[a - 1], c.ys[a], E[a], c.thr) : c.ys[0];
    const yb = b < E.length - 1 ? crossing(c.ys[b + 1], E[b + 1], c.ys[b], E[b], c.thr) : c.ys[E.length - 1];
    return { val: yb - ya, span: [ya, yb] };
  }
  return { val: NaN };
}

function roadRow(c, cv) {
  const r = row({ id: c.label }, "road", cv.val, c.min, c.max);
  return Object.assign(r, { check: c, reach: cv.reach, span: cv.span, unit: (c.type === "range" || c.type === "width") ? "m" : "lx" });
}

// ---------- evaluation ----------
function penalty(val, min, max, margin) {
  let p = 0;
  if (min != null && isFinite(min)) { const t = min * (1 + margin); if (val < t) { const r = (t - val) / Math.max(t, 1e-9); p += 200 * r * r + 5 * r; } }
  if (max != null && isFinite(max)) { const t = max * (1 - margin); if (val > t) { const r = (val - t) / Math.max(t, 1e-9); p += 200 * r * r + 5 * r; } }
  return p;
}

// the same table entries with the whole beam (cut-off included) moved by (dh, dv): each test point is read at (h - dh, v - dv)
function shiftTable(table, dh, dv) {
  return table.map(e => {
    const c = Object.assign({}, e);
    if (e.zone) c.zone = e.zone.map(p => [p[0] - dh, p[1] - dv]);
    if (e.line) c.line = e.line.map(p => [p[0] - dh, p[1] - dv]);
    if (e.h != null) { c.h = e.h - dh; c.v = e.v - dv; }
    return c;
  });
}
const AIM_CORNERS = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
// Cost terms by name, collected only while the blocking-check analysis runs (see explainMisses)
let _T = null;
function term(key, label, v) { if (_T && v) { const t = _T.get(key); if (t) t.v += v; else _T.set(key, { key, label, v }); } return v; }
function tableEval(P, table, imax, margin, detail, tag) {
  const tk = tag ? "aim|" : "ece|", tl = tag ? " (in the aim box)" : "";
  let cost = 0;
  const vals = {}, rows = [];
  for (const e of table) {
    if (e.h != null && !e.zone && !e.isLine) vals[e.id] = evalM(P, e.h, e.v, e.m);
    else if (e.imax) vals[e.id] = imax;
  }
  for (const e of table) {
    let val, min = e.min, max = e.max, kind = "pt";
    if (e.zone || e.isLine) {
      kind = e.isLine ? "line" : "zone";
      let lo = Infinity, hi = -Infinity;
      for (const s of e.samples) { const x = evalM(P, s[0], s[1], s[2]); if (x < lo) lo = x; if (x > hi) hi = x; }
      if (e.maxRef) max = e.maxRef.k * (vals[e.maxRef.id] || 0);
      val = min != null ? lo : hi;
      vals[e.id] = val;
      if (min != null && max != null) { cost += term(tk + e.id + "|min", "ECE " + e.id + " minimum" + tl, penalty(lo, min, null, margin)) + term(tk + e.id + "|max", "ECE " + e.id + " maximum" + tl, penalty(hi, null, max, margin)); if (detail) rows.push(row(e, kind, lo, min, null), row(e, kind, hi, null, max)); continue; }
    } else if (e.sum) { kind = "sum"; val = e.sum.reduce((a, id) => a + (vals[id] || 0), 0); vals[e.id] = val; }
    else val = vals[e.id];
    if (e.maxRef && !e.zone && !e.isLine) max = e.maxRef.k * (vals[e.maxRef.id] || 0);
    if (e.minRatioImax) min = e.minRatioImax * imax;
    if (e.info) { if (detail) rows.push(row(e, kind, val, null, null)); continue; }
    cost += term(tk + e.id, "ECE " + e.id + tl, penalty(val, min, max, margin));
    if (detail) rows.push(row(e, kind, val, min, max));
  }
  return { cost, rows };
}
// worst margin of every ECE row over the aim box (nominal, 4 corners, 4 edge centres)
function aimAnalysis(P, table, beam, cut, aim, imax, rows) {
  const key = x => x.id + (x.min != null && x.max == null ? "|min" : x.max != null && x.min == null ? "|max" : "");
  const worst = {};
  for (const sh of [-1, 0, 1]) for (const sv of [-1, 0, 1]) {
    if (!sh && !sv) continue;
    const tr = tableEval(P, compileTable(shiftTable(table, sh * aim.h, sv * aim.v), beam, cut), imax, 0, true).rows;
    for (const x of tr) if (x.margin != null) { const k = key(x); if (worst[k] == null || x.margin < worst[k].margin) worst[k] = { margin: x.margin, val: x.val, at: [sh * aim.h, sv * aim.v] }; }
  }
  let fails = 0;
  for (const x of rows) { const w = worst[key(x)]; if (w && x.margin != null) { x.aimMargin = Math.min(w.margin, x.margin); x.aimVal = w.margin < x.margin ? w.val : x.val; x.aimAt = w.margin < x.margin ? w.at : [0, 0]; x.aimPass = x.aimMargin >= 0; if (!x.aimPass && x.pass !== false) fails++; } }
  return fails;
}

function evaluate(P, ctx, detail) {
  const r = evalGrid(P, ctx.core);
  const fr = evalGrid(P, ctx.fluxGrid);
  // the grid peak underestimates Imax between grid points: refine it around the grid maximum
  // (a quick 2-level search while solving, a fine one for the final result)
  let pk = Math.max(r.imax, fr.imax), pkH = r.hMax, pkV = r.vMax;
  if (detail || ctx.finePeak) {
    for (let dh = -0.5; dh <= 0.501; dh += 0.05) for (let dv = -0.2; dv <= 0.201; dv += 0.025) { const x = evalI(P, r.hMax + dh, r.vMax + dv); if (x > pk) { pk = x; pkH = r.hMax + dh; pkV = r.vMax + dv; } }
  } else {
    for (const st of [[0.25, 0.1], [0.12, 0.05]]) {
      const h0 = pkH, v0 = pkV;
      for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { if (!a && !b) continue; const x = evalI(P, h0 + a * st[0], v0 + b * st[1]); if (x > pk) { pk = x; pkH = h0 + a * st[0]; pkV = v0 + b * st[1]; } }
    }
  }
  r.hMax = pkH; r.vMax = pkV;
  const imax = pk, flux = fr.flux;
  const sp = spreads(ctx.core, r, 0.05);
  const margin = detail ? 0 : 0.04, W = ctx.eceWeight || 1;
  let cost = 0;
  const te = tableEval(P, ctx.table, imax, margin, detail), rows = te.rows || [];
  cost += W * te.cost;
  // aim tolerance: the ECE table must also hold with the beam shifted to each corner of the aim box
  let aimFails = null;
  if (ctx.aimTables) {
    aimFails = [];
    for (const tb of ctx.aimTables) {
      const ta = tableEval(P, tb, imax, detail ? 0 : 0.015, detail, "aim");
      cost += W * ta.cost;
      if (detail) for (const x of ta.rows) if (x.pass === false && !aimFails.includes(x.id)) aimFails.push(x.id);
    }
  }
  // physical limit: no direction can be brighter than source luminance x aperture area
  if (ctx.imaxCap) {
    cost += W * 3 * term("phys", "the aperture limit (LED luminance × aperture area)", penalty(imax, null, ctx.imaxCap, detail ? 0 : 0.02));
    if (detail) rows.push({ id: "Aperture limit", kind: "phys", val: imax, min: null, max: ctx.imaxCap, pass: imax <= ctx.imaxCap * 1.0005, margin: (ctx.imaxCap - imax) / ctx.imaxCap });
  }
  const roadRows = [];
  for (const c of ctx.road) {
    const cv = checkValue(P, c);
    if (ctx.useRoad) cost += (c.w || 1) * term("road|" + c.label, "road check “" + c.label + "”", penalty(cv.val, c.min, c.max, margin));
    if (detail) roadRows.push(roadRow(c, cv));
  }
  if (ctx.homogW && P.model === "hybrid") cost += ctx.homogW * term("smooth", "the beam smoothness rule (hybrid model)", kneePenalty(P));
  if (ctx.cutCal && !detail) {   // calibration polish: hold the measured cut-off position and sharpness
    const sc = cutoffScan(P, ctx.cutCal.h, 0.02, ctx.cutCal.pos - 1.2, ctx.cutCal.pos + 1.2);
    cost += term("cutpos", "the cut-off position", 40 * (sc.pos - ctx.cutCal.pos) ** 2) + term("cutG", "the cut-off sharpness G", 60 * (sc.G - ctx.cutCal.G) ** 2);
  }
  const t = ctx.targets || {};
  const soft = (a, b, w) => (b ? w * ((a - b) / b) ** 2 : 0);
  cost += term("t|imax", "the requested Imax", soft(imax, t.imax, 10)) + term("t|flux", "the requested flux", soft(flux, t.flux, 10)) + term("t|spreadH", "the requested H spread", soft(sp.spreadH, t.spreadH, t.hot ? 25 : 3)) + term("t|spreadV", "the requested V spread", soft(sp.spreadV, t.spreadV, 2));
  if (t.hot) {   // hot spot stays where it was asked to be
    const mir = 1, dh = r.hMax - t.hot.h, dv = r.vMax - t.hot.v;
    cost += term("t|hot", "the requested hot spot position", 40 * (dh * dh + 4 * dv * dv));
  }
  const rfv = ctx.rf ? roadFluxFromGrid(ctx.rf) : null;   // fluxGrid was just evaluated above
  // flux on road: a value to hit when the beam is given by parameters; a minimum to reach when the lowest-flux beam is wanted
  // flux on road: when a minimum is given it is a requirement like a road check (and the first to give way if the checks conflict)
  if (rfv != null && ctx.rf.target && !ctx.rfRelax) cost += term("rf", "the flux on road minimum", penalty(rfv, ctx.rf.target, null, margin));
  // preference among passing beams: the lowest emitted flux, then (always, weakly) the lowest peak intensity
  if (ctx.prefer === "flux") cost += term("pref|flux", "the lowest-flux preference", PREF.flux * flux / 1000);
  else if (ctx.rfMin) cost += term("pref|flux", "the lowest-flux preference", PREF.passFlux * flux / 1000);   // pass-finding step of a lowest-flux solve: lean toward low flux, weakly
  if (!t.imax) cost += term("pref|imax", "the preference for a low peak intensity", PREF.imax * imax / 100000);
  if (!detail) return cost;
  return { cost, imax, flux, aimFails, roadFlux: rfv, roadFluxTarget: ctx.rf ? ctx.rf.target : null, hMax: r.hMax, vMax: r.vMax, sp, rows, roadRows, pass: rows.every(x => x.pass !== false), roadPass: roadRows.every(x => x.pass !== false) };
}

function row(e, kind, val, min, max) {
  let pass = null, margin = null;
  if (min != null) { pass = val >= min; margin = (val - min) / min; }
  if (max != null) { const pm = val <= max, mm = (max - val) / max; pass = pass == null ? pm : pass && pm; margin = margin == null ? mm : Math.min(margin, mm); }
  return { id: e.id, kind, h: e.h, v: e.v, x: e.x_m, y: e.y_m, z: e.z_m, zone: e.zone, val, min, max, pass, margin };
}

// ---------- physical limits ----------
// Luminance is conserved through any optic, so in every direction I <= L x A (source luminance x lit aperture area).
// Units: Mcd/m2 x mm2 = cd. Optical efficiency links the emitted flux to the LED flux.
const PHYS_DEFAULT = { apW: null, apH: null, lum: 70, eff: 0.45 };
function physLimits(ph) {
  ph = ph || {};
  const pos = x => (isFinite(x) && x > 0 ? +x : null);
  const apW = pos(ph.apW), apH = pos(ph.apH), lum = pos(ph.lum), eff = pos(ph.eff) ? Math.min(1, ph.eff) : null;
  const area = apW && apH ? apW * apH : null;
  return { apW, apH, lum, eff, area, imaxCap: area && lum ? lum * area : null };
}
// What the solved beam asks of the light source: LED flux, the smallest Lambertian emitting area that can supply it
// at this luminance (flux = pi x L x A), and the share of the aperture that must appear lit from the hot spot direction.
function physReport(ph, imax, flux) {
  const p = physLimits(ph), ledFlux = p.eff ? flux / p.eff : null;
  return Object.assign(p, { ledFlux, minEmit: ledFlux && p.lum ? ledFlux / (Math.PI * p.lum) : null,
    apertureUsed: p.imaxCap ? imax / p.imaxCap : null, minAperture: p.lum ? imax / p.lum : null });
}

// ---------- context + solver ----------
function buildContext(o) {
  const beam = o.beam, cut = beam === "low" ? o.cut : null;
  const vRange = beam === "low" ? [-12, 5] : [-12, 12];
  const ctx = {
    beam, cut,
    core: makeGrid(beam, cut, -70, 70, 0.5, vRange[0], vRange[1], 0.2),
    fluxGrid: makeGrid(beam, cut, -90, 90, 1, beam === "low" ? [[-60, -12, 1], [-12, 6, 0.25], [6, 40, 1]] : [[-60, -12, 1], [-12, 12, 0.25], [12, 40, 1]]),
    table: compileTable(o.table, beam, cut),
    aimTables: o.aim && (o.aim.h > 0 || o.aim.v > 0) ? AIM_CORNERS.map(([sh, sv]) => compileTable(shiftTable(o.table, sh * o.aim.h, sv * o.aim.v), beam, cut, 0.5)) : null,
    road: compileRoad(o.road, beam, cut),
    rf: null,
    useRoad: o.useRoad, targets: o.targets, shape: o.shape || null, imaxCap: o.imaxCap || null
  };
  ctx.rf = compileRoadFluxGrid(o.roadFlux, ctx.fluxGrid);
  return ctx;
}

function initPhysical(beam, t, cut) {
  const I = t.imax || (beam === "low" ? 30000 : 90000), S = t.spreadH || (beam === "low" ? 14 : 12), V = t.spreadV || (beam === "low" ? 4 : 6);
  if (beam === "low") {
    const e = cut ? cut.elbow : -0.57, sym = cut && cut.sym;
    return { comps: [
      { A: I * 1.15, h: sym ? 0 : 1.5, v: e - 0.55, sh: Math.max(1.5, S / 4.5), sv: Math.min(2.5, Math.max(0.4, V / 5)) },
      { A: 0.35 * I, h: sym ? 0 : 0.5, v: e - 0.75, sh: S / 1.97, sv: Math.max(0.8, V / 3) },
      { A: 0.06 * I, h: 0, v: -4, sh: S * 1.6, sv: 3 }], sigA: 220 };
  }
  return { comps: [
    { A: 0.75 * I, h: 0, v: 0.2, sh: Math.max(1.2, S / 4.5), sv: Math.max(0.6, V / 5) },
    { A: 0.28 * I, h: 0, v: -0.3, sh: S / 1.6, sv: Math.max(1.2, V / 3) },
    { A: 0.02 * I, h: 0, v: -3, sh: 25, sv: 4 }], sigA: 0 };
}

function randn(rng) { let u = 0, v = 0; while (u === 0) u = rng(); v = rng(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
function mulberry(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

function makeSolver(ctx, u0, iters) {
  const rng = mulberry(12345), beam = ctx.beam, n = u0.length;
  const f = u => evaluate(decode(u, beam, ctx.cut, ctx.shape), ctx, false);
  const st = { best: u0.slice(), fbest: f(u0), step: 0.08, it: 0, iters };
  st.run = function (k) {
    const end = Math.min(st.iters, st.it + k);
    for (; st.it < end; st.it++) {
      if (st.it > 0 && st.it % Math.floor(st.iters / 3) === 0) st.step = 0.12;
      const c = new Array(n);
      for (let i = 0; i < n; i++) c[i] = Math.min(1, Math.max(0, st.best[i] + st.step * randn(rng)));
      const fc = f(c);
      if (fc < st.fbest) { st.best = c; st.fbest = fc; st.step = Math.min(0.3, st.step * 1.25); }
      else st.step = Math.max(0.002, st.step * 0.955);
    }
    return st.it >= st.iters;
  };
  return st;
}


// =====================================================================================
// Square-root fall-off model
// -------------------------------------------------------------------------------------
// One smooth intensity distribution around the hot spot (h0, v0):
//   rho = sqrt((dh / Rh)^2 + (dv / Rv)^2),  Rh = Rl or Rr, Rv = Rd or Ru by side
//   I   = Imax * exp(-K * (sqrt(rho + eps) - sqrt(eps)) / (sqrt(1 + eps) - sqrt(eps)))
// so log I falls with the square root of the distance and rho = 1 is the 5 % isoline (K = ln 20).
// Isolines at evenly stepped levels are tightly packed at the hot spot and spread outward.
// eps softens the tip of the hot spot. For the low beam the cut-off mask cuts the top, so the
// isolines hang from the cut-off as nested half-ovals. Q makes the beam shallower toward the sides.
const SQ = { K: Math.log(20) };
// exp(-x) table for 0 <= x < 40 (linear interpolation, relative error below 1e-5)
const EXPN = (() => { const n = 8192, t = new Float64Array(n + 2); for (let i = 0; i <= n + 1; i++) t[i] = Math.exp(-i * 40 / n); return { t, k: n / 40, max: 40 }; })();
function expNeg(x) { if (x >= EXPN.max) return 0; const y = x * EXPN.k, i = y | 0, f = y - i; return EXPN.t[i] + (EXPN.t[i + 1] - EXPN.t[i]) * f; }
const BOUNDS_S = {
  low: [["log", 2000, 150000], ["lin", 0, 1], ["lin", 0, 1], ["log", 2, 70], ["log", 2, 70], ["log", 0.8, 20], ["log", 0.3, 6], ["log", 0.002, 0.6], ["log", 10, 600], ["lin", 0, 4], ["lin", 0, 4]],
  high: [["log", 5000, 260000], ["lin", 0, 1], ["lin", 0, 1], ["log", 2, 70], ["log", 2, 70], ["log", 0.8, 20], ["log", 0.8, 20], ["log", 0.002, 0.6], ["log", 1, 2], ["lin", 0, 4], ["lin", 0, 4]]
};
function sqrtRel(P, h, v) {
  const dh = h - P.h0, d = dh / P.bw, bend = 1 - expNeg(0.5 * d * d);
  // droop: the beam centre sinks gradually toward each side (darker just under the cut-off out there)
  const dv = v - P.v0 + (dh < 0 ? P.dL : P.dR) * bend;
  // Q: the beam gets shallower toward the sides (downward extent shrinks smoothly), so the lower isolines smile
  let Rd = P.Rd;
  if (P.q && dv < 0) Rd *= 1 - P.q * bend;
  const a = dh / (dh < 0 ? P.Rl : P.Rr), b = dv / (dv < 0 ? Rd : P.Ru), rho = Math.sqrt(a * a + b * b);
  return expNeg(P.kn * (Math.sqrt(rho + P.eps) - P.se));
}
function evalSqrtM(P, h, v, m) {
  let s = P.A * sqrtRel(P, h, v);
  if (P.beam === "low") s = cutBlend(s, m, P.sigA * sigAt(h, v));
  return s;
}
function evalGridSqrt(P, G) {
  const { nh, nv, hs, vs, mask, out, env } = G, low = P.beam === "low";
  // per-column terms (depend on h only): 1/Rh^2 * dh^2, droop shift, Q-shrunk downward extent
  const ah = G.sqA || (G.sqA = new Float64Array(nh)), sh = G.sqS || (G.sqS = new Float64Array(nh)), rd = G.sqR || (G.sqR = new Float64Array(nh));
  for (let i = 0; i < nh; i++) {
    const dh = hs[i] - P.h0, d = dh / P.bw, bend = 1 - expNeg(0.5 * d * d), a = dh / (dh < 0 ? P.Rl : P.Rr);
    ah[i] = a * a; sh[i] = (dh < 0 ? P.dL : P.dR) * bend; rd[i] = 1 / (P.Rd * (P.q ? 1 - P.q * bend : 1));
  }
  const iRu = 1 / P.Ru, kn = P.kn, eps = P.eps, se = P.se, A = P.A;
  let max = -1, mi = 0, mj = 0, flux = 0;
  env.fill(0);
  for (let j = 0; j < nv; j++) {
    const row = j * nh, sv = low ? G.sgv[j] * P.sigA : 0, dv0 = vs[j] - P.v0; let rowSum = 0;
    for (let i = 0; i < nh; i++) {
      const dv = dv0 + sh[i], b = dv * (dv < 0 ? rd[i] : iRu);
      let s = A * expNeg(kn * (Math.sqrt(Math.sqrt(ah[i] + b * b) + eps) - se));
      if (low) s = cutBlend(s, mask[row + i], G.sgh[i] * sv);
      out[row + i] = s; rowSum += s;
      if (s > env[i]) env[i] = s;
      if (s > max) { max = s; mi = i; mj = j; }
    }
    flux += rowSum * G.dOm[j];
  }
  return { imax: max, hMax: hs[mi], vMax: vs[mj], mi, mj, flux };
}
// hot spot: default 75R (Class B), 0.86D (symmetric), H-V (high beam), or the user's value;
// the model centre may sit a little off it so the masked peak lands on the target
function sqrtHotDefault(beam, cut) { return beam === "high" ? { h: 0, v: 0 } : cut && cut.sym ? { h: 0, v: -0.86 } : { h: 1.15, v: -0.57 }; }
function decodeS(u, beam, cut, opt) {
  const B = BOUNDS_S[beam], x = u.map((ui, i) => decodeVal(B[i], ui));
  const hot = (opt && opt.hot) || sqrtHotDefault(beam, cut);
  const h0 = cut && cut.sym ? 0 : hot.h + (cut ? -0.8 + x[1] : -0.3 + 0.6 * x[1]);
  const v0 = hot.v + (cut ? -0.15 + 0.75 * x[2] : -0.3 + 0.6 * x[2]);
  let Rl = x[3], Rr = x[4], dL = x[9], dR = x[10];
  if (cut && cut.sym) { Rl = Rr = Math.sqrt(Rl * Rr); dL = dR = (dL + dR) / 2; }
  const eps = x[7], se = Math.sqrt(eps), kn = SQ.K / (Math.sqrt(1 + eps) - se);
  const S = (opt && opt.smile) || 0;
  return { model: "sqrt", beam, cut, A: x[0], h0, v0, Rl, Rr, Rd: x[5], Ru: x[6], eps, se, kn,
    q: 0.65 * S, bw: Math.max(Rl, Rr) * 0.5, smile: 0, dL, dR, sigA: beam === "low" ? x[8] : 0 };
}
function initSqrt(beam, cut, t, opt) {
  const hot = (opt && opt.hot) || sqrtHotDefault(beam, cut);
  const S = t.spreadH || (beam === "low" ? 14 : 12), V = t.spreadV || (beam === "low" ? 4 : 6);
  const phys = [t.imax || (beam === "low" ? 30000 : 90000), 0.8, 0.3,
    Math.max(2.5, S + (cut && !cut.sym ? hot.h : 0)), Math.max(2.5, S - (cut && !cut.sym ? hot.h : 0)),
    beam === "low" ? Math.max(1, V * 1.1) : V / 2, beam === "low" ? 1.5 : V / 2, 0.05, beam === "low" ? 220 : 1.5, 0.1, 0.1];
  return phys.map((x, i) => encodeVal(BOUNDS_S[beam][i], x));
}
function makeSolverS(ctx, u0, iters, seed, dec) {
  const rng = mulberry(seed || 4242), beam = ctx.beam, n = u0.length, D = dec || decodeS;
  const f = u => evaluate(D(u, beam, ctx.cut, ctx.shape), ctx, false);
  const st = { best: u0.slice(), fbest: f(u0), step: 0.1, it: 0, iters };
  st.run = function (k) {
    const end = Math.min(st.iters, st.it + k);
    for (; st.it < end; st.it++) {
      if (st.it > 0 && st.it % Math.floor(st.iters / 3) === 0) st.step = 0.1;
      const c = new Array(n);
      for (let i = 0; i < n; i++) c[i] = Math.min(1, Math.max(0, st.best[i] + st.step * randn(rng)));
      const fc = f(c);
      if (fc < st.fbest) { st.best = c; st.fbest = fc; st.step = Math.min(0.3, st.step * 1.25); }
      else st.step = Math.max(0.002, st.step * 0.955);
    }
    return st.it >= st.iters;
  };
  return st;
}

// sep-CMA-ES (diagonal covariance) on the unit box for objective f. run(k) does k evaluations.
function makeCMA(f, u0, iters, sigma0, seed, opt) {
  const n = u0.length, rng = mulberry(seed || 777);
  const lam = 4 + Math.floor(3 * Math.log(n)), mu = Math.floor(lam / 2);
  let w = []; for (let i = 0; i < mu; i++) w.push(Math.log(mu + 0.5) - Math.log(i + 1));
  const ws = w.reduce((a, b) => a + b, 0); w = w.map(x => x / ws);
  const mueff = 1 / w.reduce((a, b) => a + b * b, 0);
  const cs = (mueff + 2) / (n + mueff + 5), ds = 1 + 2 * Math.max(0, Math.sqrt((mueff - 1) / (n + 1)) - 1) + cs;
  const cc = (4 + mueff / n) / (n + 4 + 2 * mueff / n);
  const c1 = Math.min(1, 2 / ((n + 1.3) ** 2 + mueff) * (n + 2) / 3);
  const cmu = Math.min(1 - c1, 2 * (mueff - 2 + 1 / mueff) / ((n + 2) ** 2 + mueff) * (n + 2) / 3);
  const chiN = Math.sqrt(n) * (1 - 1 / (4 * n) + 1 / (21 * n * n));
  let m = u0.slice(), sig = sigma0 || 0.1, gen = 0, pop = [];
  const C = new Array(n).fill(1), pc = new Array(n).fill(0), ps = new Array(n).fill(0);
  const st = { best: u0.slice(), fbest: f(u0), it: 0, iters, converged: false };
  // convergence: stop when the best cost has not improved by 0.3 % for `stall` evaluations
  const stall = (opt && opt.stall) || 0, minIt = (opt && opt.minIt) || 0;
  let refCost = st.fbest, refIt = 0;
  st.run = function (k) {
    if (st.converged) return true;
    const end = Math.min(st.iters, st.it + k);
    while (st.it < end) {
      const x = new Array(n);
      for (let i = 0; i < n; i++) x[i] = Math.min(1, Math.max(0, m[i] + sig * Math.sqrt(C[i]) * randn(rng)));
      const fx = f(x); st.it++;
      if (fx < st.fbest) { st.fbest = fx; st.best = x.slice(); }
      if (st.fbest < refCost * 0.997 - 1e-9) { refCost = st.fbest; refIt = st.it; }
      else if (stall && st.it >= minIt && st.it - refIt >= stall) { st.converged = true; return true; }
      pop.push([fx, x]);
      if (pop.length < lam) continue;
      pop.sort((a, b) => a[0] - b[0]);
      const mOld = m; m = new Array(n).fill(0);
      for (let r = 0; r < mu; r++) for (let i = 0; i < n; i++) m[i] += w[r] * pop[r][1][i];
      const yw = m.map((mi, i) => (mi - mOld[i]) / sig);
      for (let i = 0; i < n; i++) ps[i] = (1 - cs) * ps[i] + Math.sqrt(cs * (2 - cs) * mueff) * yw[i] / Math.sqrt(C[i]);
      const psn = Math.sqrt(ps.reduce((a, b) => a + b * b, 0)); gen++;
      const hsig = psn / Math.sqrt(1 - (1 - cs) ** (2 * gen)) / chiN < 1.4 + 2 / (n + 1) ? 1 : 0;
      for (let i = 0; i < n; i++) {
        pc[i] = (1 - cc) * pc[i] + hsig * Math.sqrt(cc * (2 - cc) * mueff) * yw[i];
        let rank = 0; for (let r = 0; r < mu; r++) { const y = (pop[r][1][i] - mOld[i]) / sig; rank += w[r] * y * y; }
        C[i] = Math.max(1e-6, (1 - c1 - cmu) * C[i] + c1 * (pc[i] * pc[i] + (1 - hsig) * cc * (2 - cc) * C[i]) + cmu * rank);
      }
      sig = Math.min(0.5, sig * Math.exp(cs / ds * (psn / chiN - 1)));
      if (!(sig > 0)) sig = 0.05;
      pop = [];
    }
    return st.it >= st.iters;
  };
  return st;
}


// =====================================================================================
// Hybrid model: square-root core + lobes for the spread and the foreground
// -------------------------------------------------------------------------------------
// Area 1, hot spot and its surroundings: the square-root fall-off anchored at the cut-off
//   I = As * exp(-k (sqrt(rho + eps) - sqrt(eps))), rho = 1 at 5 % of As (left/right/down/up extents).
// Area 2, spread and foreground: two Gaussian lobes, free to reach the road requirement levels.
// A smoothness rule (kneePenalty) keeps the whole beam homogeneous: along rays from the hot spot
// the decay rate of log I may only ease off, never steepen again, so no bright blob on a flat band.
const BOUNDS_Y = {
  low: [["log", 2000, 150000], ["lin", 0, 1], ["lin", 0, 1], ["log", 1.5, 40], ["log", 1.5, 40], ["log", 0.5, 8], ["log", 0.3, 6], ["log", 0.002, 0.6], ["log", 10, 600],
    ["log", 100, 60000], ["lin", -4, 4], ["lin", -5, -0.4], ["log", 2, 40], ["log", 0.6, 6],
    ["log", 30, 20000], ["lin", -14, -1.5], ["log", 8, 70], ["log", 1.5, 15]],
  high: [["log", 5000, 260000], ["lin", 0, 1], ["lin", 0, 1], ["log", 1.5, 40], ["log", 1.5, 40], ["log", 0.6, 12], ["log", 0.6, 12], ["log", 0.002, 0.6], ["log", 1, 2],
    ["log", 200, 150000], ["lin", -2, 2], ["lin", -2.5, 1], ["log", 3, 40], ["log", 1, 10],
    ["log", 30, 30000], ["lin", -10, -1], ["log", 10, 70], ["log", 2, 15]]
};
function decodeY(u, beam, cut, opt) {
  const B = BOUNDS_Y[beam], x = u.map((ui, i) => decodeVal(B[i], ui));
  const hot = (opt && opt.hot) || sqrtHotDefault(beam, cut), sym = cut && cut.sym;
  const h0 = sym ? 0 : hot.h + (cut ? -0.8 + x[1] : -0.3 + 0.6 * x[1]);
  const v0 = hot.v + (cut ? -0.15 + 0.75 * x[2] : -0.3 + 0.6 * x[2]);
  let Rl = x[3], Rr = x[4]; if (sym) Rl = Rr = Math.sqrt(Rl * Rr);
  const eps = x[7], se = Math.sqrt(eps), S = (opt && opt.smile) || 0;
  const L = [{ A: x[9], h: sym ? 0 : x[10], v: x[11], sh: x[12], sv: x[13] }, { A: x[14], h: 0, v: x[15], sh: x[16], sv: x[17] }];
  const W = Math.max(L[0].sh, Rl, Rr), ref = cut ? cut.elbow - 0.3 : null;
  for (const c of L) {   // Q for the lobes: rise toward the sides, lower half narrows
    c.rise = !(S > 0) ? 0 : ref != null ? Math.min(6 * S, S * Math.max(0, ref - c.v)) : S * 0.6 * c.sv; c.thin = 0.6 * Math.min(1, S);
  }
  return { model: "hybrid", beam, cut, A: x[0], h0, v0, Rl, Rr, Rd: x[5], Ru: x[6], eps, se, kn: SQ.K / (Math.sqrt(1 + eps) - se),
    q: 0.65 * S, bw: Math.max(Rl, Rr) * 0.5, dL: 0, dR: 0, smile: 0, sigA: beam === "low" ? x[8] : 0, lobes: L, lw: W };
}
function lobeVal(c, dhc, h, v, W) {
  const a = (h - c.h) / c.sh; if (a * a > 60) return 0;
  let vc = c.v, sv = c.sv;
  if (c.rise || c.thin) { const d = dhc / W, bend = 1 - expNeg(0.5 * d * d); vc += c.rise * bend; if (v < vc) sv *= 1 - c.thin * bend; }
  const b = (v - vc) / sv;
  return c.A * expNeg(0.5 * (a * a + b * b));
}
function evalHybM(P, h, v, m) {
  let s = P.A * sqrtRel(P, h, v);
  for (const c of P.lobes) s += lobeVal(c, h - P.h0, h, v, P.lw);
  if (P.beam === "low") s = cutBlend(s, m, P.sigA * sigAt(h, v));
  return s;
}
function evalGridHyb(P, G) {
  const { nh, nv, hs, vs, mask, out, env } = G, low = P.beam === "low";
  const ah = G.sqA || (G.sqA = new Float64Array(nh)), rd = G.sqR || (G.sqR = new Float64Array(nh));
  const L = P.lobes, nl = L.length;
  const la = G.hyA || (G.hyA = [new Float64Array(nh), new Float64Array(nh)]), lv = G.hyV || (G.hyV = [new Float64Array(nh), new Float64Array(nh)]);
  const lsl = G.hyL || (G.hyL = [new Float64Array(nh), new Float64Array(nh)]), lsu = G.hyU || (G.hyU = [new Float64Array(nh), new Float64Array(nh)]);
  for (let i = 0; i < nh; i++) {
    const dh = hs[i] - P.h0, d = dh / P.bw, bend = 1 - expNeg(0.5 * d * d), a = dh / (dh < 0 ? P.Rl : P.Rr);
    ah[i] = a * a; rd[i] = 1 / (P.Rd * (P.q ? 1 - P.q * bend : 1));
    const d2 = dh / P.lw, bend2 = 1 - expNeg(0.5 * d2 * d2);
    for (let k = 0; k < nl; k++) {
      const c = L[k], aa = (hs[i] - c.h) / c.sh;
      la[k][i] = aa * aa > 60 ? 0 : c.A * expNeg(0.5 * aa * aa);
      lv[k][i] = c.v + c.rise * bend2; lsu[k][i] = 1 / c.sv; lsl[k][i] = 1 / (c.sv * (1 - c.thin * bend2));
    }
  }
  const iRu = 1 / P.Ru, kn = P.kn, eps = P.eps, se = P.se, A = P.A;
  let max = -1, mi = 0, mj = 0, flux = 0;
  env.fill(0);
  for (let j = 0; j < nv; j++) {
    const row = j * nh, sv = low ? G.sgv[j] * P.sigA : 0, vj = vs[j], dv = vj - P.v0; let rowSum = 0;
    for (let i = 0; i < nh; i++) {
      const b = dv * (dv < 0 ? rd[i] : iRu);
      let s = A * expNeg(kn * (Math.sqrt(Math.sqrt(ah[i] + b * b) + eps) - se));
      for (let k = 0; k < nl; k++) { const amp = la[k][i]; if (amp) { const t = vj - lv[k][i], bb = t * (t < 0 ? lsl[k][i] : lsu[k][i]); s += amp * expNeg(0.5 * bb * bb); } }
      if (low) s = cutBlend(s, mask[row + i], G.sgh[i] * sv);
      out[row + i] = s; rowSum += s;
      if (s > env[i]) env[i] = s;
      if (s > max) { max = s; mi = i; mj = j; }
    }
    flux += rowSum * G.dOm[j];
  }
  return { imax: max, hMax: hs[mi], vMax: vs[mj], mi, mj, flux };
}
// smoothness rule: along 7 rays from the hot spot (below the cut-off), the decay rate of ln I
// should only ease off outward. Each re-steepening adds to the penalty, relative to the ray's total drop.
const KNEE_RAYS = [[-1, 0], [1, 0], [0, -1], [-1, -0.12], [1, -0.12], [-1, -0.3], [1, -0.3]];
function kneePenalty(P) {
  const low = P.beam === "low", vS = low ? -0.25 : 0, top = P.A + P.lobes[0].A;
  let pen = 0;
  for (const [ux, uy] of KNEE_RAYS) {
    const len = uy === -1 ? 12 : 40, n = 32;
    let prevL = null, prevS = null, drop = 0, rise = 0;
    for (let k = 0; k <= n; k++) {
      const t = (k / n) * (k / n) * len;          // denser near the hot spot
      const h = P.h0 + ux * t, v = P.v0 + vS + (uy === -1 ? -t : uy * t);
      const I = evalHybM(P, h, v, 1);
      if (I < 0.01 * top) break;
      const L = Math.log(I);
      if (prevL != null) {
        const s = (prevL - L) / Math.max(1e-6, t - (k === 0 ? 0 : ((k - 1) / n) * ((k - 1) / n) * len));
        if (prevS != null && s > prevS) rise += (s - prevS);
        drop += Math.max(0, prevL - L); prevS = s;
      }
      prevL = L;
    }
    if (drop > 0) pen += rise / (1 + drop);
  }
  return pen;
}
function initHybrid(beam, cut, t, opt) {
  const base = initSqrt(beam, cut, t, opt).slice(0, 9).map((u, i) => decodeVal(BOUNDS_S[beam][i], u));
  const lob = initPhysical(beam, t, cut).comps;
  base[3] *= 0.7; base[4] *= 0.7;                    // core a little tighter than the whole beam
  const phys = [...base, lob[1].A, lob[1].h, lob[1].v, lob[1].sh, lob[1].sv, lob[2].A, lob[2].v, lob[2].sh, lob[2].sv];
  return phys.map((x, i) => encodeVal(BOUNDS_Y[beam][i], x));
}

// Multi-loop solve for the square-root model (road requirement mode).
// Loop 1 solves normally. After each loop, road checks that still fail get three times the weight
// (up to 40x) and the next loop continues from the best beam so far; ECE weight is raised so it
// stays ahead of the road checks. Stops when ECE passes and at most `allow` road checks fail,
// or after maxLoops. The best loop result is kept (fewest ECE fails, then fewest road misses).
function makeLoopSolverS(ctx, u0, opt) {
  const o = Object.assign({ maxLoops: 4, first: +(typeof process !== "undefined" && process.env.BS_FIRST) || 1600, next: 900, allow: 1, dec: decodeS, refine: +(typeof process !== "undefined" && process.env.BS_REFINE || 3), refineIt: 1300 }, opt || {});
  const beam = ctx.beam, saved = { w: ctx.road.map(c => c.w), ece: ctx.eceWeight }, D = o.dec;
  const st = { loop: 1, maxLoops: o.maxLoops, it: 0, iters: o.first + (o.maxLoops - 1) * o.next, done: false, cands: [], refine: 0, refFlux: null, phase: "pass" };
  const seed0 = o.seed || 4242, cost = u => evaluate(D(u, beam, ctx.cut, ctx.shape), ctx, false);
  // lowest-flux mode works in two phases: first find a beam that passes (no flux pressure), then squeeze its flux
  const wantFlux = ctx.prefer === "flux"; if (wantFlux) { ctx.prefer = null; ctx.rfMin = true; }
  // every loop is a CMA-ES search that stops once it has converged
  let inner = makeCMA(cost, u0, o.first, 0.15, seed0, { stall: 350, minIt: 700 }), base = 0;
  const score = u => {
    const r = evaluate(D(u, beam, ctx.cut, ctx.shape), Object.assign({}, ctx, { useRoad: true }), true);
    const nomFail = r.rows.filter(x => x.pass === false).map(x => x.id);
    const ece = nomFail.length + (r.aimFails ? r.aimFails.filter(id => !nomFail.includes(id)).length : 0), fails = r.roadRows.map((x, i) => x.pass === false ? i : -1).filter(i => i >= 0);
    let short = 0; r.roadRows.forEach(x => { if (x.pass === false) short += Math.abs(x.margin); });
    return { u, ece, fails, miss: fails.length, short, margins: r.roadRows.map(x => x.margin), cost: inner.fbest, flux: r.flux, rf: r.roadFlux };
  };
  st.run = function (k) {
    if (st.done) return true;
    const doneInner = inner.run(k);
    st.it = base + inner.it;
    if (!doneInner) return false;
    const c = score(inner.best); st.cands.push(c);
    // loops 1 and 2 aim for every check; one missed check is accepted only from loop 3 on
    // beam parameters mode: another round while the targets are far off and the last round still gained over 5 %
    const prevC = st.cands.length > 1 ? st.cands[st.cands.length - 2].cost : null;
    const settled = c.cost < 1 || (prevC != null && c.cost > prevC * 0.95);
    const good = c.ece === 0 && (ctx.useRoad ? c.miss <= (st.loop >= 3 ? o.allow : 0) : settled);
    if (good && wantFlux && st.refine < o.refine) {
      // flux descent: restart the search around the passing beam with flux in the cost, until a round gains under 1 %
      const bestNow = st.pick(), gain = st.refFlux == null ? 1 : (st.refFlux - bestNow.flux) / st.refFlux;
      if (st.refine < 2 || gain > 0.01) {
        ctx.prefer = "flux"; st.refFlux = bestNow.flux; st.refine++; st.phase = "flux"; base += inner.it;
        // wide first (to leave a poor basin), then narrower
        inner = makeCMA(cost, bestNow.u, o.refineIt, [0.12, 0.08, 0.05][st.refine - 1] || 0.05, seed0 + 31 * st.refine, { stall: 450, minIt: 700 });
        return false;
      }
    }
    if (good || st.loop >= o.maxLoops) { st.finish(); return true; }
    const best0 = st.pick();
    if (st.loop >= 2 && best0.miss > o.allow && !st.leftOut) {
      if (ctx.rf && ctx.rf.target && !ctx.rfRelax && best0.rf != null && best0.rf < ctx.rf.target) {
        // benevolent step 1: the flux-on-road minimum gives way before any customer check does
        ctx.rfRelax = true; st.rfRelaxed = true;
      } else {
        // benevolent step 2: leave out the check missed by the widest margin, push the rest harder
        let worst = -1, wm = 0;
        best0.fails.forEach(i => { const m = Math.abs(best0.margins[i]); if (m > wm) { wm = m; worst = i; } });
        if (worst >= 0) { ctx.road[worst].w = 0.05; st.leftOut = ctx.road[worst].label || ctx.road[worst].id; st.leftOutIdx = worst; }
      }
    }
    c.fails.forEach(i => { if ((ctx.road[i].w || 1) >= 1) ctx.road[i].w = Math.min(20, (ctx.road[i].w || 1) * 2); });
    ctx.eceWeight = Math.max(5, ...ctx.road.map(r => r.w || 1));
    base += inner.it; st.loop++;
    const best = st.pick();
    inner = makeCMA(cost, best.u, o.next, 0.12, seed0 + 977 * st.loop, { stall: 300, minIt: 400 });
    return false;
  };
  // fewest ECE fails, then fewest road misses, then (lowest-flux mode) the lowest flux, else the smallest shortfall
  st.pick = () => st.cands.slice().sort((a, b) => a.ece - b.ece || a.miss - b.miss || (ctx.prefer === "flux" ? a.flux - b.flux : 0) || a.short - b.short || (ctx.useRoad ? 0 : a.cost - b.cost))[0];
  st.pickCost = () => st.pick();
  st.finish = () => {
    st.done = true; st.used = base + inner.it; st.it = st.iters;
    const b = st.pick(); st.best = b.u; st.result = b;
    ctx.road.forEach((c, i) => { c.w = saved.w[i]; }); ctx.eceWeight = saved.ece; if (wantFlux) ctx.prefer = "flux";
  };
  return st;
}


// =====================================================================================
// Job layer: one place that turns a configuration into a solve. The page and the tests both use it.
// -------------------------------------------------------------------------------------
const PARAM_DEFAULTS = { low: { imax: 30000, flux: 800, sph: 14, spv: 4 }, low_sym: { imax: 18000, flux: 700, sph: 16, spv: 4 }, low_CS: { imax: 18000, flux: 400, sph: 16, spv: 4 },
  high: { imax: 90000, flux: 1200, sph: 12, spv: 6 }, high_sym: { imax: 60000, flux: 800, sph: 12, spv: 6 } };
// aim tolerance box, +/- degrees. 0.4 H with 0.2 V is the largest box a Class B beam can pass: at 0.5 H and 0.2 V the
// shoulder of the cut-off lands on the 75R point.
const Q_DEFAULT = 0.3, G_DEFAULT = 0.25, AIM_DEFAULT = { h: 0, v: 0 };
// R149 cut-off sharpness limits: asymmetric 0.13 to 0.40 (Annex 5); symmetric at least 0.13 (BS) or 0.08 (AS, CS, DS, ES), no maximum (Annex 6)
function gLimits(cut, cls) { return cut && cut.sym ? { min: cls === "BS" ? 0.13 : 0.08, max: null } : { min: 0.13, max: 0.40 }; }
const TABLE_KEYS = { low: { B: "low", CS: "low_CS", DS: "low_DS", ES: "low_ES" }, high: { B: "high", BS: "high_BS", CS: "high_CS", DSES: "high_DSES" } };
function tableKeyFor(beam, cls) { return TABLE_KEYS[beam][cls] || TABLE_KEYS[beam].B; }
function paramDefaults(beam, cls) { return PARAM_DEFAULTS[beam + "_" + cls] || PARAM_DEFAULTS[beam + (cls === "B" ? "" : "_sym")]; }
function hotDefault(beam, cls, lht) { return beam === "high" ? { h: 0, v: 0 } : cls === "B" ? { h: lht ? -1.15 : 1.15, v: -0.57 } : { h: 0, v: -0.86 }; }   // display frame
function defaultCut(beam, cls) {
  const sym = beam === "low" && cls !== "B";
  const sharp = widthForG(G_DEFAULT, 1.9);
  return sym ? { elbow: -0.57, angle: 0, cap: -0.57, sharp, G: G_DEFAULT, off: 0, sym: true } : { elbow: -0.57, angle: 15, cap: 0.5, sharp, G: G_DEFAULT, off: 0 };
}
// Same configuration the page gathers from its inputs, filled from defaults. o: { beam, cls, mode, checks, traffic, model, targets, smile, roadFluxTarget }
function defaultConfig(o) {
  const beam = o.beam || "low", cls = o.cls || "B", mode = o.mode || "param", lht = o.traffic === "LHT";
  const d = paramDefaults(beam, cls), cut = defaultCut(beam, cls), H = 0.65, sp = 1.4;
  let targets;
  if (mode === "param") {
    const hd = hotDefault(beam, cls, lht);
    targets = Object.assign({ imax: d.imax, flux: d.flux, spreadH: d.sph, spreadV: d.spv, hot: { h: lht ? -hd.h : hd.h, v: hd.v } }, o.targets || {});
  } else targets = Object.assign({ imax: null, flux: null, spreadH: null, spreadV: null }, o.targets || {});
  const rft = o.roadFluxTarget !== undefined ? o.roadFluxTarget : roadFluxDefault(beam, cls);
  return { beam, cls, key: tableKeyFor(beam, cls), sym: !!cut.sym, cut, table: PRESET_TABLES[tableKeyFor(beam, cls)].points, lht, H, sp,
    checks: normalizeChecks(o.checks || (mode === "param" && beam === "low" && cls === "B" ? PRESET_ROAD.low.checks : [])), evalH: 0, plane: "vertical", targets,
    roadFlux: { zone: Object.assign({}, ROAD_FLUX_ZONE), target: rft, lamps: "one", height: H, spacing: sp, traffic: lht ? "LHT" : "RHT" },
    shape: mode === "param" ? { smile: o.smile != null ? o.smile : Q_DEFAULT, hot: targets.hot } : null, lane: 3.5, mode, model: o.model || "hybrid",
    aim: o.aim !== undefined ? o.aim : Object.assign({}, AIM_DEFAULT),
    physical: o.physical ? Object.assign({}, PHYS_DEFAULT, o.physical) : null };   // physical limits are optional: null = not applied
}
function contextFor(c) {
  return buildContext({ beam: c.beam, cut: c.cut, table: c.table,
    road: { checks: c.checks, height: c.H, spacing: c.sp, plane: c.plane || "vertical", traffic: c.lht ? "LHT" : "RHT", evalH: c.evalH },
    useRoad: c.mode === "road", targets: c.targets, roadFlux: c.roadFlux, shape: c.shape, aim: c.aim, imaxCap: physLimits(c.physical).imaxCap });
}
// R149 Annex 5 cut-off scan at horizontal angle h: G = log10 I(b) - log10 I(b + 0.1 deg).
// Returns the largest G and the cut-off position (inflection of log I, i.e. the steepest point).
function cutoffScan(P, h, step, from, to) {
  step = step || 0.01; from = from == null ? -2.5 : from; to = to == null ? 1.5 : to;
  // log10 I on a fine vertical line, then G over 0.1 deg and the steepest point (refined by a parabola through its neighbours)
  const n = Math.round((to - from + 0.1) / step) + 1, L = new Float64Array(n), k = Math.round(0.1 / step);
  for (let i = 0; i < n; i++) L[i] = Math.log10(Math.max(1e-9, evalI(P, h, from + i * step)));
  let G = 0;
  for (let i = 0; i + k < n; i++) { const g = L[i] - L[i + k]; if (g > G) G = g; }
  let steep = -1, im = 1;
  for (let i = 1; i < n - 1; i++) { const d = L[i - 1] - L[i + 1]; if (d > steep) { steep = d; im = i; } }
  let pos = from + im * step;
  if (im > 1 && im < n - 2) { const a = L[im - 2] - L[im], b = L[im - 1] - L[im + 1], c = L[im] - L[im + 2], den = a - 2 * b + c; if (den < 0) pos += step * 0.5 * (a - c) / den; }
  return { G, pos };
}

// job.run(k) advances the solve by about k evaluations and returns true when finished; job.result() gives the beam.
function createJob(c) {
  // a requested Imax above the aperture limit (luminance x area) cannot be made: aim for the limit instead
  const cap0 = physLimits(c.physical).imaxCap;
  let imaxAsked = null;
  if (cap0 && c.targets && c.targets.imax > cap0) { imaxAsked = c.targets.imax; c = Object.assign({}, c, { targets: Object.assign({}, c.targets, { imax: cap0 * 0.98 }) }); }
  const model = c.model || "hybrid", hy = model === "hybrid", sq = model === "sqrt" || hy, dec = hy ? decodeY : sq ? decodeS : decode;
  const low = c.beam === "low", CAL = low ? 3 : 0, CAL_IT = 350;
  let cut = low && c.cut ? Object.assign({}, c.cut) : null, ctx = contextFor(Object.assign({}, c, { cut }));
  if (hy) ctx.homogW = 2;
  // the cut-off position and sharpness are part of the solve from the start (measured by the R149 scan)
  if (low) ctx.cutCal = { h: -2.5, pos: cut.elbow, G: cut.G || G_DEFAULT };
  // road requirement mode without a flux target: return the lowest-flux beam that passes
  const prefer = c.mode === "road" && !(c.targets && c.targets.flux) ? "flux" : null;
  ctx.prefer = prefer;
  const u0 = hy ? initHybrid(c.beam, cut, c.targets, c.shape) : sq ? initSqrt(c.beam, cut, c.targets, c.shape) : encode(initPhysical(c.beam, c.targets, cut), c.beam);
  const solver = makeLoopSolverS(ctx, u0, { dec, seed: c.seed });
  const job = { ctx, cfg: c, prefer, loop: 1, maxLoops: solver.maxLoops, it: 0, iters: solver.iters + CAL * CAL_IT, done: false, stage: "solve", cal: 0 };
  let best = null, polish = null, base = 0;
  const scanH = -2.5, gTarget = cut && cut.G ? cut.G : G_DEFAULT, cands = [];
  // every stage is kept as a candidate; the final beam is the one with the fewest ECE fails, then road misses, then cut-off error
  const record = () => {
    const P = dec(best, c.beam, cut, c.shape), r = evaluate(P, Object.assign({}, ctx, { useRoad: true, cutCal: null }), true);
    const sc = low ? cutoffScan(P, scanH) : null, lim = gLimits(cut, c.cls);
    const gBad = sc && (sc.G < lim.min || (lim.max != null && sc.G > lim.max)) ? 1 : 0;
    const nomFail = r.rows.filter(x => x.pass === false).map(x => x.id);
    const cd = { u: best, cut, ctx, sc, ece: nomFail.length + (r.aimFails ? r.aimFails.filter(id => !nomFail.includes(id)).length : 0) + gBad, miss: c.mode === "road" ? r.roadRows.filter(x => x.pass === false).length : 0,
      err: sc ? Math.abs(sc.G - gTarget) / 0.03 + Math.abs(sc.pos - cut.elbow) / 0.05 : 0 };
    cands.push(cd); return cd;
  };
  // after the main solve: measure the cut-off as R149 does, correct width and offset, polish, repeat if needed
  const calibrate = () => {
    const cd = record(), sc = cd.sc;
    if (!low) return false;
    const okG = Math.abs(sc.G - gTarget) <= 0.012, okPos = Math.abs(sc.pos - cut.elbow) <= 0.025;
    if ((okG && okPos && cd.ece === 0) || job.cal >= CAL) return false;
    const contrast = sc.G / Math.tanh(0.025 / cut.sharp);
    cut = Object.assign({}, cut, { sharp: Math.min(0.6, Math.max(0.03, widthForG(gTarget, contrast))), off: (cut.off || 0) + (cut.elbow - sc.pos) });
    ctx = contextFor(Object.assign({}, c, { cut })); if (hy) ctx.homogW = 2; ctx.shape = c.shape; ctx.prefer = prefer;
    if (solver.leftOutIdx != null && solver.result && solver.result.miss) ctx.road[solver.leftOutIdx].w = 0.05;
    if (solver.rfRelaxed) ctx.rfRelax = true;
    ctx.cutCal = { h: scanH, pos: cut.elbow, G: gTarget }; ctx.eceWeight = 4;
    polish = makeCMA(u => evaluate(dec(u, c.beam, cut, c.shape), ctx, false), best, CAL_IT, 0.04, 9001 + job.cal);
    job.cal++; job.stage = "calibrate"; return true;
  };
  const finish = () => {
    // a cut-off more than 0.05 deg off the line is an aim error, so it ranks before a missed road check
    const off = x => (x.sc && x.cut && Math.abs(x.sc.pos - x.cut.elbow) > 0.05 ? 1 : 0);
    const pick = cands.slice().sort((a, b) => a.ece - b.ece || off(a) - off(b) || a.miss - b.miss || a.err - b.err)[0];
    best = pick.u; cut = pick.cut; ctx = pick.ctx; job.done = true; job.it = job.iters;
  };
  job.run = k => {
    if (job.done) return true;
    if (job.stage === "solve") {
      const d = solver.run(k); job.it = solver.it; job.loop = solver.loop || 1; job.phase = solver.phase; job.refine = solver.refine;
      if (!d) return false;
      best = solver.best; base = solver.iters; job.evals = solver.used;
      if (!calibrate()) finish();
      return job.done;
    }
    const d = polish.run(k); job.it = base + (job.cal - 1) * CAL_IT + polish.it;
    if (!d) return false;
    best = polish.best; job.evals += polish.it;
    if (!calibrate()) finish();
    return job.done;
  };
  job.result = () => {
    const P = dec(best, c.beam, cut, c.shape);
    const res = evaluate(P, Object.assign({}, ctx, { useRoad: true, cutCal: null }), true);
    res.phys = c.physical ? physReport(c.physical, res.imax, res.flux) : null;
    if (res.phys) res.phys.imaxRequested = imaxAsked;   // set when the requested Imax was above the aperture limit
    res.aim = c.aim && (c.aim.h > 0 || c.aim.v > 0) ? c.aim : null;
    res.aimFailCount = res.aim ? aimAnalysis(P, c.table, c.beam, cut, c.aim, res.imax, res.rows) : 0;
    res.aimPass = res.aimFailCount === 0;
    if (low) {   // cut-off rows, measured as in R149 Annex 5 / 6
      const sc = cutoffScan(P, scanH), lim = gLimits(cut, c.cls), side = cut.sym ? "2.5°" : c.lht ? "2.5R" : "2.5L";
      const gPass = sc.G >= lim.min && (lim.max == null || sc.G <= lim.max);
      res.rows.push({ id: "Cut-off G", kind: "G", where: side, val: sc.G, min: lim.min, max: lim.max, pass: gPass, margin: Math.min((sc.G - lim.min) / lim.min, lim.max == null ? 9 : (lim.max - sc.G) / lim.max) });
      res.rows.push({ id: "Cut-off position", kind: "cutpos", where: side, val: sc.pos, target: cut.elbow, pass: null, margin: null });
      res.pass = res.rows.every(x => x.pass !== false); res.G = sc.G; res.cutPos = sc.pos;
    }
    // name what holds back every unmet target and failed check
    try {
      const ectx = Object.assign({}, ctx, { rfRelax: false }); ectx.road = ctx.road.map(x => Object.assign({}, x, { w: Math.max(1, x.w || 1) }));
      res.blocking = explainMisses(best, u => dec(u, c.beam, cut, c.shape), ectx, listMisses(c, res, imaxAsked)).map(m => m.fixed ? Object.assign(m, { by: m.fixed }) : m);
    } catch (e) { res.blocking = []; }
    return { P, res, ctx, cut, prefer, rfRelaxed: !!solver.rfRelaxed, evals: job.evals, loops: solver.cands.length, calibrations: job.cal, leftOut: solver.leftOut && solver.result && solver.result.miss ? solver.leftOut : null };
  };
  return job;
}
// ---------- blocking checks ----------
// At the solved beam the cost is at a minimum, so the pull of every unmet term is balanced by the terms that oppose it.
// For an unmet target or failed check t, the share of another term i is  -(grad_i . grad_t) / |grad_t|^2  (the shares of all
// opposing terms add up to about 1). The terms with the largest shares are the ones holding t back.
function costTerms(u, decodeFn, ctx) {
  _T = new Map();
  try { evaluate(decodeFn(u), Object.assign({}, ctx, { finePeak: true }), false); return _T; } finally { _T = null; }
}
function explainMisses(u, decodeFn, ctx, misses) {
  if (!misses.length) return [];
  const n = u.length, h = 0.01, base = costTerms(u, decodeFn, ctx), grads = new Map();
  for (const k of base.keys()) grads.set(k, new Float64Array(n));
  for (let j = 0; j < n; j++) {
    const up = Array.from(u), dn = Array.from(u); up[j] += h; dn[j] -= h;
    const a = costTerms(up, decodeFn, ctx), b = costTerms(dn, decodeFn, ctx);
    for (const k of new Set([...a.keys(), ...b.keys()])) {
      if (!grads.has(k)) { grads.set(k, new Float64Array(n)); base.set(k, a.get(k) || b.get(k)); }
      grads.get(k)[j] = ((a.get(k) ? a.get(k).v : 0) - (b.get(k) ? b.get(k).v : 0)) / (2 * h);
    }
  }
  const dot = (x, y) => { let s = 0; for (let j = 0; j < n; j++) s += x[j] * y[j]; return s; };
  const out = [];
  for (const m of misses) {
    const keys = m.keys.filter(k => grads.has(k));
    if (!keys.length) { out.push(Object.assign({ by: [] }, m)); continue; }
    const g = new Float64Array(n); for (const k of keys) { const gk = grads.get(k); for (let j = 0; j < n; j++) g[j] += gk[j]; }
    const gg = dot(g, g), by = [];
    if (gg > 1e-12) for (const [k, gk] of grads) {
      if (keys.includes(k)) continue;
      const share = -dot(gk, g) / gg;
      if (share > 0.02) by.push({ key: k, label: base.get(k).label, share });
    }
    // shares as fractions of everything that opposes t; keep the main ones. A low total means nothing clearly opposes t
    // (the solver gave it up, or the beam model itself cannot do it), which is reported as "weak".
    const tot = by.reduce((s, x) => s + x.share, 0);
    for (const x of by) x.share /= tot || 1;
    by.sort((a, b) => b.share - a.share);
    out.push(Object.assign({}, m, { by: by.filter(x => x.share >= 0.2).slice(0, 3), weak: tot < 0.3 }));
  }
  return out;
}
// What was asked for and not reached: requested beam values, failed ECE checks, missed road checks
function listMisses(c, res, imaxAsked) {
  const t = c.targets || {}, out = [], rel = (a, b) => Math.abs(a - b) / b;
  if (imaxAsked) out.push({ what: "Imax", unit: "cd", asked: imaxAsked, got: res.imax, keys: [], fixed: [{ key: "phys", label: "the aperture limit (LED luminance × aperture area)", share: 1 }] });
  else if (t.imax && rel(res.imax, t.imax) > 0.05) out.push({ what: "Imax", unit: "cd", asked: t.imax, got: res.imax, keys: ["t|imax"] });
  if (t.flux && rel(res.flux, t.flux) > 0.05) out.push({ what: "Flux", unit: "lm", asked: t.flux, got: res.flux, keys: ["t|flux"] });
  if (t.spreadH && rel(res.sp.spreadH, t.spreadH) > 0.08) out.push({ what: "H spread", unit: "°", asked: t.spreadH, got: res.sp.spreadH, keys: ["t|spreadH"] });
  if (t.spreadV && rel(res.sp.spreadV, t.spreadV) > 0.1) out.push({ what: "V spread", unit: "°", asked: t.spreadV, got: res.sp.spreadV, keys: ["t|spreadV"] });
  if (t.hot && Math.hypot(res.hMax - t.hot.h, 2 * (res.vMax - t.hot.v)) > 0.3) out.push({ what: "Hot spot", unit: "pos", asked: t.hot, got: { h: res.hMax, v: res.vMax }, keys: ["t|hot"] });
  for (const r of res.rows) if (r.pass === false) {
    if (r.kind === "phys") out.push({ what: "Aperture limit", unit: "cd", check: true, limit: "max", asked: r.max, got: r.val, keys: ["phys"] });
    else if (r.kind === "G") out.push({ what: "Cut-off G", unit: "G", check: true, got: r.val, keys: ["cutG"] });
    else out.push({ what: "ECE " + r.id, unit: "cd", check: true, limit: r.min != null && r.val < r.min ? "min" : "max", asked: r.min != null && r.val < r.min ? r.min : r.max, got: r.val, keys: ["ece|" + r.id, "ece|" + r.id + "|min", "ece|" + r.id + "|max"] });
  }
  if (c.mode === "road") for (const r of res.roadRows) if (r.pass === false) out.push({ what: "Road check “" + r.id + "”", unit: r.unit, check: true, limit: r.min != null ? "min" : "max", asked: r.min != null ? r.min : r.max, got: r.val, keys: ["road|" + r.id] });
  if (res.roadFluxTarget && res.roadFlux < res.roadFluxTarget * 0.995) out.push({ what: "Flux on road", unit: "lm", check: true, limit: "min", asked: res.roadFluxTarget, got: res.roadFlux, keys: ["rf"] });
  return out;
}
function solveSync(c) { const job = createJob(c); while (!job.run(200)); return job.result(); }

if (typeof module !== "undefined") module.exports = { explainMisses, listMisses, costTerms, PHYS_DEFAULT, physLimits, physReport, AIM_DEFAULT, shiftTable, tableEval, aimAnalysis, cutoffScan, cutBlend, widthForG, gLimits, G_DEFAULT, PARAM_DEFAULTS, Q_DEFAULT, tableKeyFor, paramDefaults, hotDefault, defaultCut, defaultConfig, contextFor, createJob, solveSync, makeGrid, evalGrid, makeSolverS, makeCMA, decodeY, initHybrid, kneePenalty, makeLoopSolverS, decodeS, initSqrt, makeSolverS, sqrtRel, SMILE, applySmile, ROAD_FLUX_ZONE, roadFluxDefault, compileRoadFlux, roadFluxOf, PRESET_TABLES, PRESET_ROAD, normalizeChecks, toRoadIlluminate, checkValue, roadRow, makeSampler, luxOf, decode, encode, evalI, evaluate, buildContext, initPhysical, makeSolver, cutoffV, maskAt, compileRoad, DEG };
