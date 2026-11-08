(function () {
const $ = id => document.getElementById(id);
const S = { mode: "param", beam: "low", P: null, res: null, cfg: null, tables: {}, busy: false };
const fmt = (x, d = 0) => (x == null || !isFinite(x)) ? "—" : x.toLocaleString("en-US", { maximumFractionDigits: d, minimumFractionDigits: d });
const fmtCd = x => x >= 100 ? fmt(x) : fmt(x, 1);
const angH = h => Math.abs(h) < 0.005 ? "0" : fmt(Math.abs(h), 2) + (h > 0 ? "R" : "L");
const angV = v => Math.abs(v) < 0.005 ? "H" : fmt(Math.abs(v), 2) + (v > 0 ? "U" : "D");

// ---------- presets ----------
function compactJSON(o) {
  return JSON.stringify(o, null, 2).replace(/\{\n\s+([^{}\[\]]*?)\n\s+\}/g, (m, body) => "{ " + body.split(/,\n\s+/).join(", ") + " }")
    .replace(/\[\n\s+(-?[\d.]+),\n\s+(-?[\d.]+)\n\s+\]/g, "[$1, $2]");
}
// classes per beam function; key = PRESET_TABLES entry
const CLASSES = {
  low: [["B", "B — asymmetric", "low"], ["CS", "CS — symmetric", "low_CS"], ["DS", "DS — symmetric", "low_DS"], ["ES", "ES — symmetric", "low_ES"]],
  high: [["B", "With Class B (asym.)", "high"], ["BS", "BS — symmetric", "high_BS"], ["CS", "CS — symmetric", "high_CS"], ["DSES", "DS / ES — symmetric", "high_DSES"]]
};
const tableKey = () => (CLASSES[S.beam].find(c => c[0] === $("cls").value) || CLASSES[S.beam][0])[2];
const isSym = () => S.beam === "low" && $("cls").value !== "B";
function tableFor(key) { if (S.tables[key] == null) S.tables[key] = compactJSON(PRESET_TABLES[key].points); return S.tables[key]; }
function fillClasses(keep) {
  const prev = keep || $("cls").value;
  $("cls").innerHTML = CLASSES[S.beam].map(c => `<option value="${c[0]}">${c[1]}</option>`).join("");
  if (CLASSES[S.beam].some(c => c[0] === prev)) $("cls").value = prev;
}
function syncCut() {
  const sym = isSym();
  if (sym) { $("cAngle").value = 0; $("cCap").value = $("cElbow").value; }
  else if (+$("cAngle").value === 0) { $("cAngle").value = 15; $("cCap").value = 0.5; }
  $("cAngle").disabled = sym; $("cCap").disabled = sym;
}
$("roadJson").value = compactJSON(PRESET_ROAD.low);

function showTable() { const k = tableKey(); $("tableJson").value = tableFor(k); $("tableNote").textContent = PRESET_TABLES[k].name + ". " + PRESET_TABLES[k].note; $("cutBox").hidden = S.beam !== "low"; }
$("tableJson").addEventListener("input", () => { S.tables[tableKey()] = $("tableJson").value; });
$("tableReset").onclick = () => { const k = tableKey(); S.tables[k] = compactJSON(PRESET_TABLES[k].points); showTable(); };

const PARAM_DEFAULTS = { low: { imax: 30000, flux: 800, sph: 14, spv: 4 }, low_sym: { imax: 18000, flux: 700, sph: 16, spv: 4 },
  high: { imax: 90000, flux: 1200, sph: 12, spv: 6 }, high_sym: { imax: 60000, flux: 800, sph: 12, spv: 6 } };
function setDefaults() {
  const d = PARAM_DEFAULTS[S.beam + ($("cls").value === "B" ? "" : "_sym")];
  $("imax").value = d.imax; $("flux").value = d.flux; $("sph").value = d.sph; $("spv").value = d.spv;
}
$("fn").onchange = () => {
  S.beam = $("fn").value; fillClasses(); setDefaults(); syncCut(); showTable();
};
$("cls").onchange = () => { setDefaults(); syncCut(); showTable();
};
$("exLow").onclick = () => { $("roadJson").value = compactJSON(PRESET_ROAD.low); };
$("exHigh").onclick = () => { $("roadJson").value = compactJSON(PRESET_ROAD.high); };

function setMode(m) {
  S.mode = m; $("mRoad").setAttribute("aria-pressed", m === "road"); $("mParam").setAttribute("aria-pressed", m === "param");
  $("roadPanel").hidden = m !== "road"; $("paramPanel").hidden = m !== "param";
}
$("mRoad").onclick = () => setMode("road"); $("mParam").onclick = () => setMode("param");

// ---------- generate ----------
function num(id) { const x = parseFloat($(id).value); return isFinite(x) ? x : null; }
function msg(t, err) { $("msg").textContent = t; $("msg").className = "msg" + (err ? " err" : ""); }

function gather() {
  let road = null;
  try { road = JSON.parse($("roadJson").value); } catch (e) { if (S.mode === "road") throw new Error("Road JSON: " + e.message); }
  if (S.mode === "road" && road) {
    if (road.function === "low" || road.function === "high") { $("fn").value = road.function; S.beam = road.function; fillClasses(road.class); syncCut(); showTable(); }
    else if (road.class) { fillClasses(road.class); syncCut(); showTable(); }
    if (road.traffic === "RHT" || road.traffic === "LHT") $("traffic").value = road.traffic;
    if (road.mounting) { if (road.mounting.height_m) $("mh").value = road.mounting.height_m; if (road.mounting.spacing_m) $("sp").value = road.mounting.spacing_m; }
    if (road.plane === "vertical" || road.plane === "horizontal") $("plane").value = road.plane;
    if (road.evalHeight_m != null && isFinite(road.evalHeight_m)) $("evalH").value = road.evalHeight_m;
  }
  S.beam = $("fn").value;
  let table;
  try { table = JSON.parse(tableFor(tableKey())); if (!Array.isArray(table)) throw new Error("expected an array"); } catch (e) { throw new Error("Test table: " + e.message); }
  const sym = isSym(), elbow = num("cElbow") ?? -0.57;
  const cut = sym ? { elbow, angle: 0, cap: elbow, sharp: Math.max(0.02, num("cSharp") ?? 0.08), sym: true }
    : { elbow, angle: num("cAngle") ?? 15, cap: num("cCap") ?? 0.5, sharp: Math.max(0.02, num("cSharp") ?? 0.08) };
  const lht = $("traffic").value === "LHT";
  const H = num("mh") || 0.65, sp = num("sp") || 1.4;
  const isSet = Array.isArray(road);                       // bare road-illuminate requirement set
  const rawChecks = isSet ? road : road ? (road.checks || road.points || []) : [];
  const applies = S.mode === "road" || isSet || (road && road.function === S.beam);
  const checks = applies ? normalizeChecks(rawChecks) : [];
  let targets;
  if (S.mode === "road") {
    const t = (road && !isSet && road.targets) || {};
    targets = { imax: t.imax || null, flux: t.flux_lm || null, spreadH: t.spreadH_deg || null, spreadV: t.spreadV_deg || null };
    if (!checks.length) throw new Error("No valid checks found. Paste a road-illuminate requirement set (point, range, width, zone) or an object with a \"checks\" list.");
  } else {
    targets = { imax: num("imax"), flux: num("flux"), spreadH: num("sph"), spreadV: num("spv") };
    if (!targets.imax || !targets.flux || !targets.spreadH || !targets.spreadV) throw new Error("Fill in all four beam parameters.");
  }
  const lane = (road && !isSet && road.road && road.road.laneWidth_m) || 3.5;
  const evalH = Math.max(0, num("evalH") || 0);
  return { beam: S.beam, cls: $("cls").value, key: tableKey(), sym, cut, table, lht, H, sp, checks, evalH, targets, lane, mode: S.mode };
}

function generate() {
  if (S.busy) return;
  let c;
  try { c = gather(); } catch (e) { msg(e.message, true); return; }
  S.busy = true; $("go").disabled = true; msg("Solving…");
  const t0 = performance.now();
  const ctx = buildContext({ beam: c.beam, cut: c.cut, table: c.table,
    road: { checks: c.checks, height: c.H, spacing: c.sp, plane: $("plane").value, traffic: c.lht ? "LHT" : "RHT", evalH: c.evalH },
    useRoad: c.mode === "road", targets: c.targets });
  const u0 = encode(initPhysical(c.beam, c.targets, c.cut), c.beam);
  const iters = 2400, solver = makeSolver(ctx, u0, iters);
  const tick = () => {
    const done = solver.run(60);
    $("progBar").style.width = (100 * solver.it / iters) + "%";
    if (!done) { setTimeout(tick, 0); return; }
    S.P = decode(solver.best, c.beam, c.cut); S.cfg = c;
    S.res = evaluate(S.P, Object.assign({}, ctx, { useRoad: true }), true);
    S.ctx = ctx;
    S.busy = false; $("go").disabled = false;
    const nf = S.res.rows.filter(r => r.pass === false).length, nr = S.res.roadRows.filter(r => r.pass === false).length;
    msg(`Solved in ${((performance.now() - t0) / 1000).toFixed(1)} s. ` + (nf ? `${nf} ECE check${nf > 1 ? "s" : ""} fail: closest compromise shown.` : "All ECE checks pass.") + (nr ? ` ${nr} road target${nr > 1 ? "s" : ""} missed.` : ""), nf > 0);
    $("iesOut").value = "";
    renderAll();
  };
  setTimeout(tick, 20);
}
$("go").onclick = generate;

// ---------- display-frame evaluation ----------
function Idisp(h, v) { return evalI(S.P, S.cfg.lht ? -h : h, v); }
function luxDisp(x, y, z) {
  const c = S.cfg; z = z == null ? c.evalH : z; const yi = c.lht ? -y : y, H = c.H, s = c.sp / 2, vert = $("plane").value === "vertical";
  let E = 0;
  for (const ly of [-s, s]) {
    const dx = x, dy = yi - ly, dz = (z || 0) - H, d = Math.hypot(dx, dy, dz);
    const h = Math.atan2(dy, dx) / DEG, v = Math.atan2(dz, Math.hypot(dx, dy)) / DEG;
    const f = vert ? dx / (d * d * d) : Math.max(0, H - (z || 0)) / (d * d * d);
    E += evalI(S.P, h, v) * f;
  }
  return E;
}
function reach(level) {
  let last = null;
  for (let x = 1; x <= 600; x += 0.5) if (luxDisp(x, 0) >= level) last = x;
  return last;
}

// ---------- colour + plotting helpers ----------
const STOPS = [[22, 46, 84], [28, 92, 140], [23, 148, 152], [78, 184, 104], [214, 208, 70], [242, 154, 52], [226, 78, 58], [255, 226, 214]];
function cmap(t) {
  t = Math.min(1, Math.max(0, t)) * (STOPS.length - 1); const i = Math.min(STOPS.length - 2, Math.floor(t)), f = t - i, a = STOPS[i], b = STOPS[i + 1];
  return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
}
const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
function rgb(c, a = 1) { return `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`; }

function setupCanvas(cv, aspect) {
  const w = cv.clientWidth || cv.parentElement.clientWidth, h = Math.round(Math.max(240, Math.min(520, w * aspect)));
  const dpr = window.devicePixelRatio || 1;
  cv.style.height = h + "px"; cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
  const g = cv.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { g, w, h };
}

function marching(vals, nx, ny, L, seg) {
  const T = [[], [[3, 2]], [[2, 1]], [[3, 1]], [[0, 1]], [[3, 0], [2, 1]], [[0, 2]], [[3, 0]], [[3, 0]], [[0, 2]], [[0, 1], [3, 2]], [[0, 1]], [[3, 1]], [[2, 1]], [[3, 2]], []];
  for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
    const a = vals[j * nx + i], b = vals[j * nx + i + 1], c = vals[(j + 1) * nx + i + 1], d = vals[(j + 1) * nx + i];
    const k = (a >= L ? 8 : 0) | (b >= L ? 4 : 0) | (c >= L ? 2 : 0) | (d >= L ? 1 : 0);
    if (k === 0 || k === 15) continue;
    const e = n => n === 0 ? [i + (L - a) / (b - a), j] : n === 1 ? [i + 1, j + (L - b) / (c - b)] : n === 2 ? [i + (L - d) / (c - d), j + 1] : [i, j + (L - a) / (d - a)];
    for (const [p, q] of T[k]) { const A = e(p), B = e(q); seg(A[0], A[1], B[0], B[1]); }
  }
}

function drawField(g, box, vals, nx, ny, levels, colors) {
  const img = g.createImageData(nx, ny);
  for (let k = 0; k < nx * ny; k++) {
    const v = vals[k]; let b = -1;
    for (let l = 0; l < levels.length; l++) if (v >= levels[l]) b = l; else break;
    if (b >= 0) { const c = colors[b]; img.data[4 * k] = c[0]; img.data[4 * k + 1] = c[1]; img.data[4 * k + 2] = c[2]; img.data[4 * k + 3] = 215; }
  }
  const off = document.createElement("canvas"); off.width = nx; off.height = ny; off.getContext("2d").putImageData(img, 0, 0);
  g.imageSmoothingEnabled = true; g.drawImage(off, box.x, box.y, box.w, box.h);
  const sx = box.w / (nx - 1), sy = box.h / (ny - 1);
  levels.forEach((L, l) => {
    g.beginPath();
    marching(vals, nx, ny, L, (x1, y1, x2, y2) => { g.moveTo(box.x + x1 * sx, box.y + y1 * sy); g.lineTo(box.x + x2 * sx, box.y + y2 * sy); });
    g.strokeStyle = rgb(colors[l].map(c => Math.min(255, c + 50)), 0.95); g.lineWidth = 1; g.stroke();
  });
}

function legend(el, levels, colors, unit) {
  el.innerHTML = levels.map((L, i) => `<span><i style="background:${rgb(colors[i])}"></i>${L >= 1000 ? fmt(L / 1000, L % 1000 ? 1 : 0) + "k" : fmt(L, L < 1 ? 2 : (L < 10 && L % 1 ? 1 : 0))}</span>`).join("") + `<span>${unit}</span>`;
}

// ---------- iso-candela ----------
function isoView() {
  const R = +$("isoRange").value, low = S.cfg.beam === "low";
  const V = low ? ({ 20: [-6, 4], 40: [-10, 6], 60: [-15, 8] })[R] : ({ 20: [-8, 8], 40: [-12, 10], 60: [-15, 12] })[R];
  return { h0: -R, h1: R, v0: V[0], v1: V[1] };
}
function drawIso() {
  const cv = $("isoCv"), { g, w, h } = setupCanvas(cv, 0.42), view = isoView();
  const m = { l: 40, r: 12, t: 12, b: 26 }, box = { x: m.l, y: m.t, w: w - m.l - m.r, h: h - m.t - m.b };
  S.isoBox = box; S.isoView = view;
  g.fillStyle = css("--plot-bg"); g.fillRect(0, 0, w, h);
  const lx = $("isoUnit").value === "lx", k = lx ? 1 / 625 : 1, imax = S.res.imax;
  const base = S.cfg.beam === "low" ? [100, 250, 625, 1250, 2500, 5000, 10000, 15000, 20000, 30000, 40000, 60000, 80000] : [500, 1000, 2500, 5000, 10000, 20000, 40000, 60000, 80000, 100000, 150000, 200000];
  const lv = base.filter(L => L < imax * 0.98);
  const colors = lv.map((_, i) => cmap(lv.length > 1 ? i / (lv.length - 1) : 1).map(Math.round));
  const nx = Math.min(560, Math.round(box.w)), ny = Math.min(300, Math.round(box.h));
  const vals = new Float32Array(nx * ny);
  for (let j = 0; j < ny; j++) { const v = view.v1 - j * (view.v1 - view.v0) / (ny - 1); for (let i = 0; i < nx; i++) vals[j * nx + i] = Idisp(view.h0 + i * (view.h1 - view.h0) / (nx - 1), v); }
  drawField(g, box, vals, nx, ny, lv, colors);
  const X = hh => box.x + (hh - view.h0) / (view.h1 - view.h0) * box.w, Y = vv => box.y + (view.v1 - vv) / (view.v1 - view.v0) * box.h;
  // grid + axes
  g.font = "11px " + css("--f-mono"); g.fillStyle = css("--plot-dim"); g.textAlign = "center";
  const hs = view.h1 > 40 ? 10 : 5, vs = (view.v1 - view.v0) > 16 ? 4 : 2;
  for (let a = Math.ceil(view.h0 / hs) * hs; a <= view.h1; a += hs) { g.strokeStyle = a === 0 ? css("--plot-axis") : css("--plot-grid"); g.beginPath(); g.moveTo(X(a) + .5, box.y); g.lineTo(X(a) + .5, box.y + box.h); g.stroke(); g.fillText(a === 0 ? "V" : Math.abs(a) + (a < 0 ? "L" : "R"), X(a), h - 8); }
  g.textAlign = "right";
  for (let a = Math.ceil(view.v0 / vs) * vs; a <= view.v1; a += vs) { g.strokeStyle = a === 0 ? css("--plot-axis") : css("--plot-grid"); g.beginPath(); g.moveTo(box.x, Y(a) + .5); g.lineTo(box.x + box.w, Y(a) + .5); g.stroke(); g.fillText(a === 0 ? "H" : Math.abs(a) + (a > 0 ? "U" : "D"), box.x - 6, Y(a) + 4); }
  g.save(); g.beginPath(); g.rect(box.x, box.y, box.w, box.h); g.clip();
  const mir = S.cfg.lht ? -1 : 1;
  if (S.cfg.beam === "low") {
    g.setLineDash([5, 4]); g.strokeStyle = "rgba(255,255,255,.55)"; g.lineWidth = 1; g.beginPath();
    for (let a = view.h0; a <= view.h1; a += 0.1) { const yv = cutoffV(S.cfg.cut, mir * a); a === view.h0 ? g.moveTo(X(a), Y(yv)) : g.lineTo(X(a), Y(yv)); }
    g.stroke(); g.setLineDash([]);
  }
  if ($("isoPts").checked) {
    const pass = css("--pass"), fail = css("--fail");
    const status = {}; S.res.rows.forEach(r => { if (status[r.id] !== false) status[r.id] = r.pass; });
    S.cfg.table.forEach(e => {
      if (e.line) {
        g.beginPath(); g.moveTo(X(mir * e.line[0][0]), Y(e.line[0][1])); g.lineTo(X(mir * e.line[1][0]), Y(e.line[1][1]));
        g.strokeStyle = status[e.id] === false ? fail : "rgba(255,255,255,.55)"; g.setLineDash([2, 3]); g.lineWidth = 1.4; g.stroke(); g.setLineDash([]); g.lineWidth = 1;
        g.fillStyle = "rgba(255,255,255,.7)"; g.textAlign = "left"; g.font = "10px " + css("--f-mono");
        g.fillText(e.id, X(mir * Math.max(e.line[0][0], e.line[1][0])) + 4, Y(e.line[1][1]) + 3);
      }
      if (e.zone) {
        g.beginPath(); e.zone.forEach((p, i) => i ? g.lineTo(X(mir * p[0]), Y(p[1])) : g.moveTo(X(mir * p[0]), Y(p[1]))); g.closePath();
        g.strokeStyle = status[e.id] === false ? fail : "rgba(255,255,255,.35)"; g.setLineDash([2, 3]); g.stroke(); g.setLineDash([]);
        g.fillStyle = "rgba(255,255,255,.6)"; g.textAlign = "left"; g.font = "10px " + css("--f-mono");
        const p0 = e.zone[0]; g.fillText(e.id, X(mir * p0[0]) + (mir > 0 ? 3 : -40), Y(p0[1]) - 3);
      }
    });
    S.cfg.table.forEach(e => {
      if (e.h == null || e.zone || e.line) return;
      const st = status[e.id], x = X(mir * e.h), y = Y(e.v);
      g.beginPath(); g.arc(x, y, 3.5, 0, 7);
      g.fillStyle = st === false ? fail : st === true ? pass : "#9fb0bd"; g.fill(); g.strokeStyle = "#0d151d"; g.lineWidth = 1; g.stroke();
      g.fillStyle = "#e6eef4"; g.font = "10px " + css("--f-mono"); g.textAlign = "left"; g.fillText(e.id, x + 5, y - 4);
    });
  }
  // hot spot
  g.strokeStyle = "#fff"; g.lineWidth = 1.2; const hx = X(mir * S.res.hMax), hy = Y(S.res.vMax);
  g.beginPath(); g.moveTo(hx - 6, hy); g.lineTo(hx + 6, hy); g.moveTo(hx, hy - 6); g.lineTo(hx, hy + 6); g.stroke();
  g.restore();
  legend($("isoLeg"), lv.map(L => L * k), colors, lx ? "lx @25 m" : "cd");
}

// ---------- road ----------
function roadView() {
  const R = +$("roadRange").value, W = R <= 150 ? 20 : 30;
  return { x0: 0, x1: R, y0: -W, y1: W };
}
function drawRoad() {
  const cv = $("roadCv"), { g, w, h } = setupCanvas(cv, 0.42), view = roadView();
  const m = { l: 40, r: 12, t: 12, b: 26 }, box = { x: m.l, y: m.t, w: w - m.l - m.r, h: h - m.t - m.b };
  S.roadBox = box; S.roadView = view;
  g.fillStyle = css("--plot-bg"); g.fillRect(0, 0, w, h);
  const vert = $("plane").value === "vertical";
  const lv = vert ? [0.5, 1, 3, 5, 10, 20, 50, 100] : [0.25, 0.5, 1, 2, 3, 5, 10, 20, 50];
  const colors = lv.map((_, i) => cmap(i / (lv.length - 1)).map(Math.round));
  const nx = Math.min(480, Math.round(box.w)), ny = Math.min(240, Math.round(box.h));
  const vals = new Float32Array(nx * ny);
  // screen row j: top = left side of the road (y negative), bottom = right side (y positive)
  for (let j = 0; j < ny; j++) { const y = view.y0 + j * (view.y1 - view.y0) / (ny - 1); for (let i = 0; i < nx; i++) { const x = Math.max(0.5, view.x0 + i * (view.x1 - view.x0) / (nx - 1)); vals[j * nx + i] = luxDisp(x, y); } }
  drawField(g, box, vals, nx, ny, lv, colors);
  const X = x => box.x + (x - view.x0) / (view.x1 - view.x0) * box.w, Y = y => box.y + (y - view.y0) / (view.y1 - view.y0) * box.h;
  g.font = "11px " + css("--f-mono"); g.fillStyle = css("--plot-dim"); g.textAlign = "center";
  const xs = view.x1 > 200 ? 50 : 25;
  for (let a = 0; a <= view.x1; a += xs) { g.strokeStyle = css("--plot-grid"); g.beginPath(); g.moveTo(X(a) + .5, box.y); g.lineTo(X(a) + .5, box.y + box.h); g.stroke(); g.fillText(a + (a === view.x1 - (view.x1 % xs) ? " m" : ""), X(a), h - 8); }
  g.textAlign = "right";
  const ys = view.y1 > 20 ? 10 : 5;
  for (let a = view.y0; a <= view.y1; a += ys) { g.strokeStyle = a === 0 ? css("--plot-axis") : css("--plot-grid"); g.beginPath(); g.moveTo(box.x, Y(a) + .5); g.lineTo(box.x + box.w, Y(a) + .5); g.stroke(); g.fillText(a === 0 ? "0" : Math.abs(a) + (a > 0 ? "R" : "L"), box.x - 6, Y(a) + 4); }
  g.save(); g.beginPath(); g.rect(box.x, box.y, box.w, box.h); g.clip();
  // lane markings (display frame)
  const L = S.cfg.lane, side = S.cfg.lht ? -1 : 1;
  const line = (y, dash) => { g.setLineDash(dash); g.strokeStyle = "rgba(255,255,255,.7)"; g.lineWidth = 1.4; g.beginPath(); g.moveTo(box.x, Y(y)); g.lineTo(box.x + box.w, Y(y)); g.stroke(); g.setLineDash([]); };
  line(side * L / 2, []); line(-side * L / 2, [10, 8]); line(-side * 1.5 * L, []);
  // vehicle
  g.fillStyle = "#e6eef4"; g.fillRect(X(0) - 1, Y(-0.9), 4, Y(0.9) - Y(-0.9));
  if ($("roadPts").checked) {
    const pass = css("--pass"), fail = css("--fail");
    S.res.roadRows.forEach(r => {
      const c = r.check, col = r.pass === false ? fail : r.pass ? pass : "#9fb0bd";
      g.strokeStyle = col; g.fillStyle = col; g.lineWidth = 1.6; g.font = "10px " + css("--f-body"); g.textAlign = "left";
      let lx, ly;
      if (c.type === "point") {
        const x = X(c.x), y = Y(c.y); g.beginPath(); g.rect(x - 3.5, y - 3.5, 7, 7); g.fill(); g.strokeStyle = "#0d151d"; g.lineWidth = 1; g.stroke(); lx = x + 6; ly = y - 5;
      } else if (c.type === "range") {
        const y = Y(c.y), lim = c.min ?? c.max;
        g.setLineDash([3, 3]); g.beginPath(); g.moveTo(X(0), y); g.lineTo(X(Math.min(r.reach || 0, view.x1)), y); g.stroke(); g.setLineDash([]);
        if (lim != null) { g.beginPath(); g.moveTo(X(lim), y - 6); g.lineTo(X(lim), y + 6); g.stroke(); }
        if (r.reach) { g.beginPath(); g.arc(X(Math.min(r.reach, view.x1)), y, 3.5, 0, 7); g.fill(); }
        lx = X(Math.min(r.reach || lim || 0, view.x1)) + 6; ly = y - 5;
      } else if (c.type === "width") {
        const x = X(c.x);
        if (r.span) { g.beginPath(); g.moveTo(x, Y(r.span[0])); g.lineTo(x, Y(r.span[1])); g.stroke(); [0, 1].forEach(k => { g.beginPath(); g.moveTo(x - 5, Y(r.span[k])); g.lineTo(x + 5, Y(r.span[k])); g.stroke(); }); }
        lx = x + 6; ly = Y(r.span ? r.span[0] : 0) - 5;
      } else if (c.type === "zone") {
        g.setLineDash([5, 3]); g.strokeRect(X(c.x1), Y(c.y1), X(c.x2) - X(c.x1), Y(c.y2) - Y(c.y1)); g.setLineDash([]);
        lx = X(c.x1) + 3; ly = Y(c.y1) - 4;
      }
      g.fillStyle = "#e6eef4"; g.fillText(r.id, lx, ly);
    });
  }
  g.restore();
  legend($("roadLeg"), lv, colors, "lx");
}

// ---------- pointer readouts ----------
function hookRead(cv, which) {
  const handler = ev => {
    if (!S.res) return;
    const r = cv.getBoundingClientRect(), px = ev.clientX - r.left, py = ev.clientY - r.top;
    const box = which === "iso" ? S.isoBox : S.roadBox; if (!box) return;
    const u = (px - box.x) / box.w, v = (py - box.y) / box.h;
    if (u < 0 || u > 1 || v < 0 || v > 1) return;
    if (which === "iso") {
      const vw = S.isoView, hh = vw.h0 + u * (vw.h1 - vw.h0), vv = vw.v1 - v * (vw.v1 - vw.v0), I = Idisp(hh, vv);
      $("isoRead").textContent = `H ${angH(hh)}  V ${angV(vv)}   ${fmtCd(I)} cd · ${fmt(I / 625, 2)} lx @25 m`;
    } else {
      const vw = S.roadView, x = vw.x0 + u * (vw.x1 - vw.x0), y = vw.y0 + v * (vw.y1 - vw.y0);
      $("roadRead").textContent = `x ${fmt(x, 1)} m  y ${fmt(Math.abs(y), 1)} m ${y >= 0 ? "R" : "L"}   ${fmt(luxDisp(Math.max(0.5, x), y), 2)} lx (${$("plane").value === "vertical" ? "vertical plane" : "road surface"})`;
    }
  };
  cv.addEventListener("pointermove", handler); cv.addEventListener("pointerdown", handler);
}
hookRead($("isoCv"), "iso"); hookRead($("roadCv"), "road");

// ---------- summary + tables ----------
function kv(label, value, sub, cls) { return `<div class="kv ${cls || ""}"><b>${label}</b><span>${value}</span>${sub ? `<em>${sub}</em>` : ""}</div>`; }
function req(r, unit) { const p = []; if (r.min != null) p.push("≥ " + (unit === "lx" ? fmt(r.min, 2) : fmtCd(r.min))); if (r.max != null) p.push("≤ " + (unit === "lx" ? fmt(r.max, 2) : fmtCd(r.max))); return p.join(", ") || "info"; }
function pill(p) { return p === true ? '<span class="pill p">PASS</span>' : p === false ? '<span class="pill f">FAIL</span>' : '<span class="pill i">INFO</span>'; }

function renderSummary() {
  const r = S.res, c = S.cfg, t = c.targets, nf = r.rows.filter(x => x.pass === false).length, n = r.rows.filter(x => x.pass != null).length;
  const nr = r.roadRows.filter(x => x.pass === false).length, nrt = r.roadRows.filter(x => x.pass != null).length;
  const asked = (v, d, u) => c.mode === "param" && v ? `requested ${fmt(v, d)}${u}` : "";
  const mir = c.lht ? -1 : 1;
  const r1 = reach(1), r3 = reach(3);
  $("summary").innerHTML =
    kv("ECE verdict", nf ? `${nf} of ${n} fail` : `PASS ${n}/${n}`, `Class ${c.cls === "DSES" ? "DS / ES" : c.cls} ${c.beam === "low" ? "passing" : "driving"} beam`, "verdict " + (nf ? "bad" : "ok")) +
    kv("Road checks", nrt ? (nr ? `${nr} of ${nrt} missed` : `met ${nrt}/${nrt}`) : "none", c.mode === "road" ? "solved for" : "checked only", "verdict " + (nr ? "bad" : "ok")) +
    kv("Imax", fmt(r.imax) + " cd", asked(t.imax, 0, " cd")) +
    kv("Flux", fmt(r.flux) + " lm", asked(t.flux, 0, " lm")) +
    kv("H spread", "±" + fmt(r.sp.spreadH, 1) + "°", asked(t.spreadH, 1, "°") || `${angH(mir < 0 ? -r.sp.right : r.sp.left)} … ${angH(mir < 0 ? -r.sp.left : r.sp.right)}`) +
    kv("V spread", fmt(r.sp.spreadV, 1) + "°", asked(t.spreadV, 1, "°")) +
    kv("Hot spot", `${angH(mir * r.hMax)} ${angV(r.vMax)}`, "position of Imax") +
    kv("Reach 1 lx / 3 lx", `${r1 ? fmt(r1) : "—"} / ${r3 ? fmt(r3) : "—"} m`, ($("plane").value === "vertical" ? "vertical plane" : "road surface") + ", centreline");
  if ($("regLine")) $("regLine").textContent = `${PRESET_TABLES[c.beam].name.replace(/ (passing|driving) beam/, "")} · ${c.beam === "low" ? "low beam" : "high beam"} · ${c.lht ? "LHT (mirrored)" : "RHT"}`;
}

function renderTables() {
  const mir = S.cfg.lht ? -1 : 1;
  $("tblName").textContent = PRESET_TABLES[S.cfg.key].name;
  $("ecTbl").innerHTML = "<thead><tr><th>Point</th><th>Position</th><th>Requirement (cd)</th><th>Value (cd)</th><th>Margin</th><th></th></tr></thead><tbody>" +
    S.res.rows.map(r => {
      const pos = r.kind === "line" ? "line " + (r.min != null ? "min" : "max") : r.zone ? "zone " + (r.min != null ? "min" : "max") : r.kind === "sum" ? "sum" : r.h != null ? `${angH(mir * r.h)} ${angV(r.v)}` : "global";
      return `<tr class="${r.pass === false ? "fail" : ""}"><td class="id">${r.id}</td><td>${pos}</td><td class="n">${req(r)}</td><td class="n">${fmtCd(r.val)}</td><td class="n">${r.margin == null ? "" : fmt(100 * r.margin, 0) + " %"}</td><td>${pill(r.pass)}</td></tr>`;
    }).join("") + "</tbody>";
  $("roadMode").textContent = S.cfg.mode === "road" ? "solved for, lamp pair" : (S.res.roadRows.length ? "checked, not solved for" : "");
  const side = y => Math.abs(y) < 0.005 ? "axis" : `${fmt(Math.abs(y), 2)} ${y > 0 ? "R" : "L"}`;
  const where = c => c.type === "point" ? `${fmt(c.x)} m, ${side(c.y)}`
    : c.type === "range" ? `along ${side(c.y)}, ${fmt(c.thr, 2)} lx`
    : c.type === "width" ? `at ${fmt(c.x)} m, ${fmt(c.thr, 2)} lx`
    : `${fmt(c.x1)}–${fmt(c.x2)} m, ${fmt(Math.abs(c.y1), 2)}${c.y1 >= 0 ? "R" : "L"}–${fmt(Math.abs(c.y2), 2)}${c.y2 >= 0 ? "R" : "L"}, ${c.stat}`;
  const vfmt = r => r.unit === "m" ? (r.check.type === "range" && r.reach == null ? "not reached" : fmt(r.val, 1) + " m") : fmt(r.val, 2) + " lx";
  const rq = r => (r.min != null ? "≥ " + fmt(r.min, r.unit === "m" ? 0 : 2) : "≤ " + fmt(r.max, r.unit === "m" ? 0 : 2)) + " " + r.unit;
  $("rdTbl").innerHTML = S.res.roadRows.length ? "<thead><tr><th>Check</th><th>Type</th><th>Where</th><th>Requirement</th><th>Value</th><th></th></tr></thead><tbody>" +
    S.res.roadRows.map(r => `<tr class="${r.pass === false ? "fail" : ""}"><td class="id">${r.id}</td><td>${r.check.type}</td><td>${where(r.check)}${r.check.zEval ? `, z ${fmt(r.check.zEval, 2)} m` : ""}</td><td class="n">${rq(r)}</td><td class="n">${vfmt(r)}</td><td>${pill(r.pass)}</td></tr>`).join("") + "</tbody>"
    : `<tbody><tr><td class="note" style="white-space:normal">No road checks for this beam function. Switch to Road requirement mode or paste a requirement set.</td></tr></tbody>`;
}

function recomputeRoad() {
  // re-check with the method currently selected (it can change after solving)
  const c = S.cfg;
  const rd = compileRoad({ checks: c.checks, height: c.H, spacing: c.sp, plane: $("plane").value, traffic: c.lht ? "LHT" : "RHT", evalH: c.evalH }, c.beam, c.cut);
  S.res.roadRows = rd.map(rc => roadRow(rc, checkValue(S.P, rc)));
}

function renderAll() { if (!S.res) return; recomputeRoad(); renderSummary(); renderTables(); drawIso(); drawRoad(); }
["isoUnit", "isoRange", "isoPts"].forEach(id => $(id).addEventListener("change", () => S.res && drawIso()));
["roadRange", "roadPts"].forEach(id => $(id).addEventListener("change", () => S.res && drawRoad()));
$("plane").addEventListener("change", () => S.res && renderAll());
let rz; new ResizeObserver(() => { clearTimeout(rz); rz = setTimeout(() => S.res && (drawIso(), drawRoad()), 120); }).observe(document.querySelector("main"));
const redrawTheme = () => S.res && (drawIso(), drawRoad());
try { matchMedia("(prefers-color-scheme: dark)").addEventListener("change", redrawTheme); } catch (e) { }
new MutationObserver(redrawTheme).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

// ---------- export ----------
function buildIES() {
  if (!S.res) return "";
  const range = (a, b, s) => { const o = []; for (let x = a; x <= b + 1e-9; x += s) o.push(+x.toFixed(2)); return o; };
  const V = [...range(-40, -11, 1), ...range(-10, 5, 0.1), ...range(6, 40, 1)];
  const H = [...range(-90, -32, 2), ...range(-30, 30, 0.5), ...range(32, 90, 2)];
  const c = S.cfg, lines = [
    "IESNA:LM-63-2002",
    "[TEST] Synthetic beam (not measured)",
    "[MANUFAC] Beam Synth",
    `[LUMINAIRE] ${c.beam === "low" ? "Low beam (passing)" : "High beam (driving)"}, ${PRESET_TABLES[c.key].name}, ${c.lht ? "LHT" : "RHT"}`,
    `[_IMAX] ${Math.round(S.res.imax)} cd`, `[_FLUX] ${Math.round(S.res.flux)} lm`,
    `[_GENERATED] ${new Date().toISOString().slice(0, 10)}`,
    "TILT=NONE",
    `1 -1 1 ${V.length} ${H.length} 2 2 0 0 0`, "1 1 0"];
  const wrap = arr => { const o = []; for (let i = 0; i < arr.length; i += 10) o.push(arr.slice(i, i + 10).join(" ")); return o; };
  lines.push(...wrap(V), ...wrap(H));
  for (const h of H) lines.push(...wrap(V.map(v => Math.round(Idisp(h, v) * 10) / 10)));
  return lines.join("\n") + "\n";
}
$("riCopy").onclick = () => {
  let set = [];
  try { const j = JSON.parse($("roadJson").value); set = toRoadIlluminate(normalizeChecks(Array.isArray(j) ? j : (j.checks || j.points || []))); } catch (e) { msg("Road JSON: " + e.message, true); return; }
  const txt = JSON.stringify(set, null, 2); $("iesOut").value = txt; copy(txt, $("riCopy"));
};
$("iesBuild").onclick = () => { $("iesOut").value = buildIES(); };
async function copy(text, btn) {
  const orig = btn.textContent;
  try { await navigator.clipboard.writeText(text); btn.textContent = "Copied"; }
  catch (e) { $("iesOut").value = text; $("iesOut").focus(); $("iesOut").select(); btn.textContent = "Selected, press Ctrl+C"; }
  setTimeout(() => btn.textContent = orig, 1800);
}
$("iesCopy").onclick = () => { if (!S.res) return; if (!$("iesOut").value) $("iesOut").value = buildIES(); copy($("iesOut").value, $("iesCopy")); };
$("paramCopy").onclick = () => {
  if (!S.P) return;
  const r2 = x => Math.round(x * 1000) / 1000;
  const o = { function: S.cfg.beam, class: S.cfg.cls, traffic: S.cfg.lht ? "LHT" : "RHT", note: "Internal frame is RHT; LHT mirrors H.", cutoff: S.cfg.beam === "low" ? S.cfg.cut : null,
    lobes: S.P.comps.map((c, i) => ({ name: ["hot spot", "spread", "foreground"][i], A_cd: Math.round(c.A), h_deg: r2(c.h), v_deg: r2(c.v), sigmaH_deg: r2(c.sh), sigmaV_deg: r2(c.sv) })),
    glareFloor_cd: S.cfg.beam === "low" ? Math.round(S.P.sigA) : 0 };
  const txt = JSON.stringify(o, null, 2); $("iesOut").value = txt; copy(txt, $("paramCopy"));
};

// ---------- start ----------
fillClasses("B"); syncCut(); showTable();
setTimeout(generate, 50);
})();
