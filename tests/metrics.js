// Shared measurements for the benchmark and the tests.
const path = require("path"), fs = require("fs");
const corePath = [path.join(__dirname, "..", "src", "core.js"), path.join(__dirname, "..", "core.js")].find(p => fs.existsSync(p));
const C = require(corePath);

function inPoly(x, y, poly) {
  let ins = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i], [xj, yj] = poly[j]; if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) ins = !ins; }
  return ins;
}
// ECE table evaluated with the whole beam (cut-off included) shifted by (dh, dv) degrees. Returns ids of failed checks.
function eceFailsShifted(P, table, dh, dv) {
  const f = [], vals = {}, at = (h, v) => C.evalI(P, h - dh, v - dv);
  let imax = 0;
  if (table.some(e => e.imax || e.minRatioImax)) for (let h = -8; h <= 8; h += 0.2) for (let v = -5; v <= 4; v += 0.1) imax = Math.max(imax, C.evalI(P, h, v));
  for (const e of table) if (e.h != null && !e.zone && !e.line) vals[e.id] = at(e.h, e.v);
  for (const e of table) {
    let v, min = e.min, max = e.max;
    if (e.zone || e.line) {
      let lo = 1e99, hi = -1;
      if (e.zone) { const xs = e.zone.map(p => p[0]), ys = e.zone.map(p => p[1]);
        for (let h = Math.min(...xs); h <= Math.max(...xs) + 1e-9; h += 0.25) for (let vv = Math.min(...ys); vv <= Math.max(...ys) + 1e-9; vv += 0.25) if (inPoly(h, vv, e.zone)) { const x = at(h, vv); lo = Math.min(lo, x); hi = Math.max(hi, x); }
      } else { const [[h1, v1], [h2, v2]] = e.line; for (let k = 0; k <= 72; k++) { const x = at(h1 + (h2 - h1) * k / 72, v1 + (v2 - v1) * k / 72); lo = Math.min(lo, x); hi = Math.max(hi, x); } }
      if (e.maxRef) max = e.maxRef.k * vals[e.maxRef.id];
      if (min != null && lo < min) f.push(e.id); if (max != null && hi > max) f.push(e.id); continue;
    }
    if (e.imax) v = imax; else if (e.sum) v = e.sum.reduce((a, id) => a + vals[id], 0); else if (e.h != null) v = vals[e.id]; else continue;
    if (e.info) continue;
    if (e.minRatioImax) min = e.minRatioImax * imax;
    if (min != null && v < min) f.push(e.id); if (max != null && v > max) f.push(e.id);
  }
  return f;
}
// aim box: nominal plus the 8 edge and corner positions
function aimBox(P, table, dH, dV) {
  const out = {};
  for (const sh of [-1, 0, 1]) for (const sv of [-1, 0, 1]) { const f = eceFailsShifted(P, table, sh * dH, sv * dV); if (f.length) out[`H${sh * dH} V${sv * dV}`] = f; }
  return out;
}
function measure(cfg, out) {
  const r = out.res, low = cfg.beam === "low", m = {
    ece: r.rows.filter(x => x.pass === false).map(x => x.id), roadMiss: cfg.mode === "road" ? r.roadRows.filter(x => x.pass === false).map(x => x.id) : [],
    imax: Math.round(r.imax), flux: Math.round(r.flux), roadFlux: Math.round(r.roadFlux), spreadH: +r.sp.spreadH.toFixed(1), spreadV: +r.sp.spreadV.toFixed(1),
    hot: [+r.hMax.toFixed(2), +r.vMax.toFixed(2)], loops: out.loops };
  if (low) { const s = C.cutoffScan(out.P, cfg.sym ? 2.5 : -2.5); m.G = +s.G.toFixed(3); m.cutPos = +s.pos.toFixed(2); }
  const box = aimBox(out.P, cfg.table, 0.5, 0.2); m.aimFails = Object.keys(box).length; m.aimDetail = box;
  return m;
}
module.exports = { C, eceFailsShifted, aimBox, measure };
