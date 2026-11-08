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

const PRESET_ROAD = {
  low: {
    function: "low", traffic: "RHT",
    mounting: { height_m: 0.65, spacing_m: 1.4 },
    plane: "vertical", evalHeight_m: 0,
    road: { laneWidth_m: 3.5 },
    targets: { flux_lm: 800 },
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
    targets: { flux_lm: 1200 },
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

function decode(u, beam, cut) {
  const B = BOUNDS[beam], x = u.map((ui, i) => decodeVal(B[i], ui));
  return {
    beam, cut,
    comps: [
      { A: x[0], h: x[1], v: x[2], sh: x[3], sv: x[4] },
      { A: x[5], h: x[6], v: x[7], sh: x[8], sv: x[9] },
      { A: x[10], h: 0, v: x[11], sh: x[12], sv: x[13] }
    ],
    sigA: beam === "low" ? x[14] : 0
  };
}
function encode(phys, beam) {
  const B = BOUNDS[beam], c = phys.comps;
  const x = [c[0].A, c[0].h, c[0].v, c[0].sh, c[0].sv, c[1].A, c[1].h, c[1].v, c[1].sh, c[1].sv,
    c[2].A, c[2].v, c[2].sh, c[2].sv, beam === "low" ? phys.sigA : 1.5];
  return x.map((xi, i) => encodeVal(B[i], xi));
}

function cutoffV(cut, h) { return h > 0 ? Math.min(cut.elbow + h * Math.tan(cut.angle * DEG), Math.max(cut.cap, cut.elbow)) : cut.elbow; }
function maskAt(P, h, v) { if (P.beam !== "low") return 1; return 1 / (1 + Math.exp((v - cutoffV(P.cut, h)) / P.cut.sharp)); }
const SIG_SH = 12, SIG_V = 2, SIG_SV = 2.5;
function sigAt(h, v) { const a = h / SIG_SH, b = (v - SIG_V) / SIG_SV; return Math.exp(-0.5 * (a * a + b * b)); }

function evalM(P, h, v, m) {
  let s = 0;
  for (const c of P.comps) { const a = (h - c.h) / c.sh, b = (v - c.v) / c.sv; s += c.A * Math.exp(-0.5 * (a * a + b * b)); }
  if (P.beam === "low") { s = s * m + P.sigA * sigAt(h, v); }
  return s;
}
function evalI(P, h, v) { return evalM(P, h, v, maskAt(P, h, v)); }

// ---------- grids ----------
function makeGrid(beam, cut, h0, h1, dh, v0, v1, dv) {
  const nh = Math.round((h1 - h0) / dh) + 1, nv = Math.round((v1 - v0) / dv) + 1;
  const hs = new Float64Array(nh), vs = new Float64Array(nv);
  for (let i = 0; i < nh; i++) hs[i] = h0 + i * dh;
  for (let j = 0; j < nv; j++) vs[j] = v0 + j * dv;
  const P0 = { beam, cut };
  let mask = null;
  if (beam === "low") { mask = new Float64Array(nh * nv); for (let j = 0; j < nv; j++) for (let i = 0; i < nh; i++) mask[j * nh + i] = maskAt(P0, hs[i], vs[j]); }
  const sgh = new Float64Array(nh), sgv = new Float64Array(nv);
  for (let i = 0; i < nh; i++) sgh[i] = Math.exp(-0.5 * (hs[i] / SIG_SH) ** 2);
  for (let j = 0; j < nv; j++) sgv[j] = Math.exp(-0.5 * ((vs[j] - SIG_V) / SIG_SV) ** 2);
  const dOm = new Float64Array(nv);
  for (let j = 0; j < nv; j++) dOm[j] = Math.cos(vs[j] * DEG) * dh * dv * DEG * DEG;
  return { beam, nh, nv, hs, vs, dh, dv, mask, sgh, sgv, dOm, out: new Float64Array(nh * nv), env: new Float64Array(nh),
    gh: [0, 1, 2].map(() => new Float64Array(nh)), gv: [0, 1, 2].map(() => new Float64Array(nv)) };
}

function evalGrid(P, G) {
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
      if (low) s = s * mask[row + i] + G.sgh[i] * sv;
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

function compileTable(table, beam, cut) {
  const P0 = { beam, cut };
  return table.map(e => {
    const c = Object.assign({}, e);
    if (e.zone) {
      const xs = e.zone.map(p => p[0]), ys = e.zone.map(p => p[1]);
      const pts = [];
      for (let h = Math.min(...xs); h <= Math.max(...xs) + 1e-9; h += 0.25)
        for (let v = Math.min(...ys); v <= Math.max(...ys) + 1e-9; v += 0.25)
          if (pointInPoly(h, v, e.zone) || e.zone.some(p => Math.abs(p[0] - h) < 1e-6 && Math.abs(p[1] - v) < 1e-6)) pts.push([h, v, maskAt(P0, h, v)]);
      e.zone.forEach(p => pts.push([p[0], p[1], maskAt(P0, p[0], p[1])]));
      c.samples = pts;
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

function evaluate(P, ctx, detail) {
  const r = evalGrid(P, ctx.core);
  const fr = evalGrid(P, ctx.fluxGrid);
  const imax = Math.max(r.imax, fr.imax), flux = fr.flux;
  const sp = spreads(ctx.core, r, 0.05);
  const margin = detail ? 0 : 0.04;
  let cost = 0;
  const vals = {}, rows = [];
  for (const e of ctx.table) {
    if (e.h != null && !e.zone) vals[e.id] = evalM(P, e.h, e.v, e.m);
    else if (e.imax) vals[e.id] = imax;
  }
  for (const e of ctx.table) {
    let val, min = e.min, max = e.max, kind = "pt";
    if (e.zone) {
      kind = "zone";
      let lo = Infinity, hi = -Infinity;
      for (const s of e.samples) { const x = evalM(P, s[0], s[1], s[2]); if (x < lo) lo = x; if (x > hi) hi = x; }
      if (e.maxRef) max = e.maxRef.k * (vals[e.maxRef.id] || 0);
      val = min != null ? lo : hi;
      vals[e.id] = val;
      if (min != null && max != null) { cost += penalty(lo, min, null, margin) + penalty(hi, null, max, margin); if (detail) rows.push(row(e, kind, lo, min, null), row(e, kind, hi, null, max)); continue; }
    } else if (e.sum) { kind = "sum"; val = e.sum.reduce((a, id) => a + (vals[id] || 0), 0); vals[e.id] = val; }
    else val = vals[e.id];
    if (e.maxRef && !e.zone) max = e.maxRef.k * (vals[e.maxRef.id] || 0);
    if (e.minRatioImax) min = e.minRatioImax * imax;
    if (e.info) { if (detail) rows.push(row(e, kind, val, null, null)); continue; }
    cost += penalty(val, min, max, margin);
    if (detail) rows.push(row(e, kind, val, min, max));
  }
  const roadRows = [];
  for (const c of ctx.road) {
    const cv = checkValue(P, c);
    if (ctx.useRoad) cost += penalty(cv.val, c.min, c.max, margin);
    if (detail) roadRows.push(roadRow(c, cv));
  }
  const t = ctx.targets || {};
  const soft = (a, b, w) => (b ? w * ((a - b) / b) ** 2 : 0);
  cost += soft(imax, t.imax, 10) + soft(flux, t.flux, 10) + soft(sp.spreadH, t.spreadH, 3) + soft(sp.spreadV, t.spreadV, 2);
  if (ctx.useRoad && !t.flux) cost += 0.02 * flux / 1000;
  if (!detail) return cost;
  return { cost, imax, flux, hMax: r.hMax, vMax: r.vMax, sp, rows, roadRows, pass: rows.every(x => x.pass !== false), roadPass: roadRows.every(x => x.pass !== false) };
}

function row(e, kind, val, min, max) {
  let pass = null, margin = null;
  if (min != null) { pass = val >= min; margin = (val - min) / min; }
  if (max != null) { const pm = val <= max, mm = (max - val) / max; pass = pass == null ? pm : pass && pm; margin = margin == null ? mm : Math.min(margin, mm); }
  return { id: e.id, kind, h: e.h, v: e.v, x: e.x_m, y: e.y_m, z: e.z_m, zone: e.zone, val, min, max, pass, margin };
}

// ---------- context + solver ----------
function buildContext(o) {
  const beam = o.beam, cut = beam === "low" ? o.cut : null;
  const vRange = beam === "low" ? [-12, 5] : [-12, 12];
  return {
    beam, cut,
    core: makeGrid(beam, cut, -70, 70, 0.4, vRange[0], vRange[1], 0.15),
    fluxGrid: makeGrid(beam, cut, -90, 90, 1, -60, 40, 0.25),
    table: compileTable(o.table, beam, cut),
    road: compileRoad(o.road, beam, cut),
    useRoad: o.useRoad, targets: o.targets
  };
}

function initPhysical(beam, t, cut) {
  const I = t.imax || (beam === "low" ? 30000 : 90000), S = t.spreadH || (beam === "low" ? 14 : 12), V = t.spreadV || (beam === "low" ? 4 : 6);
  if (beam === "low") {
    const e = cut ? cut.elbow : -0.57;
    return { comps: [
      { A: I * 1.15, h: 1.5, v: e - 0.55, sh: Math.max(1.5, S / 4.5), sv: Math.min(2.5, Math.max(0.4, V / 5)) },
      { A: 0.35 * I, h: 0.5, v: e - 0.75, sh: S / 1.97, sv: Math.max(0.8, V / 3) },
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
  const f = u => evaluate(decode(u, beam, ctx.cut), ctx, false);
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

if (typeof module !== "undefined") module.exports = { PRESET_TABLES, PRESET_ROAD, normalizeChecks, toRoadIlluminate, checkValue, roadRow, makeSampler, luxOf, decode, encode, evalI, evaluate, buildContext, initPhysical, makeSolver, cutoffV, maskAt, compileRoad, DEG };
