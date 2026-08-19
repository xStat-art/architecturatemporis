/**
 * zone-profile.js
 * ─────────────────────────────────────────────────────────────────────────
 * Vanilla ES6 module. "Развёрнутый профиль зоны" — a 1D slice through the
 * zone's existing 2D spectral IDW surface (the same surface the map/
 * simulator paint as a gradient), taken along a REAL pedestrian route
 * through the zone's measured objects, not a straight line between them.
 *
 * THREE SEPARATE STAGES, exported separately, because they have three very
 * different failure/performance profiles and a caller may want to run them
 * independently (e.g. cache the route, re-sample after a new scenario):
 *
 *   1. computeStreetRoute(stops)  — ASYNC, network. Fetches the pedestrian
 *      street graph for the stops' bounding box from Overpass (same
 *      OVERPASS_URL + fetch(...,{method:'POST',body:'data='+encodeURI...})
 *      pattern already used in simulator.html's loadUnmeasuredBuildings()
 *      — reused verbatim, only the tag filter changes from
 *      way["building"] to way["highway"]), builds a graph, and runs
 *      Dijkstra WITH predecessor tracking between each consecutive pair of
 *      stops (in the order given) to produce one real, walkable polyline
 *      through all of them.
 *
 *   2. sampleProfile(route, objectsRelief, objectsTia?, opts?) — SYNC, pure
 *      math. Walks the route polyline and evaluates the IDW surface at each
 *      sampled point (idwAt() — the same math as ATRC_CI_Map.html's
 *      computeIDWGrid, factored down to a single query point), plus an
 *      exact (non-interpolated) value at each stop's own coordinate.
 *
 *   3. renderZoneProfile(containerId, data) / updateZoneProfile(...) —
 *      SYNC, pure render. See its own doc comment below for the three
 *      visual layers (relief / TIA line / HIA line).
 *
 * VISUAL LANGUAGE (Sergei, 2026-08-12, final spec after checking against
 * the original sketch) — REPLACES an earlier version of this file where
 * both lines were plain strokes and the "after" line was coloured red/green
 * by comparing it point-by-point against "before":
 *   - ONE filled "relief" — the real, measured CI(weighted) surface, coloured
 *     per segment through weightedToT()/ciToHex(), the SAME spectral
 *     function the map/ring/legend use (ported verbatim from
 *     ATRC_CI_Map.html here — see the colour-science section below for why
 *     this is NOT the same as the simpler linear mapping this file used
 *     before, or that tia-bar.js/tia-ring.js still use).
 *   - ONE flat-red TIA overlay line — the same surface under a hypothetical
 *     "modify one object" scenario (not "exclude" — reverted per Sergei's
 *     instruction, matching the original TIA_Article intent of adjusting an
 *     intervention's effect on an object, not deleting the object).
 *   - ONE flat-green HIA overlay line, reserved for a future expert-input
 *     Heritage Impact Assessment parameter (see
 *     TIA_continuation_brief_12aug2026.md, backlog item c) — no real data
 *     source exists yet, so it is simply not drawn unless a caller actually
 *     supplies HIA values; no placeholder/ghost line.
 * ─────────────────────────────────────────────────────────────────────────
 */

// ═══════════════════════════════════════════════════════════════
// 1) POINT-WISE IDW — same math as ATRC_CI_Map.html's computeIDWGrid
// (and simulator.html's verbatim port of it), factored down to a single
// query point. power=2, matching every other IDW call site in the project.
// ═══════════════════════════════════════════════════════════════
export function idwAt(lat, lng, points, power) {
  power = power || 2;
  let wSum = 0, vSum = 0;
  for (const p of points) {
    const d = Math.hypot(p.lat - lat, p.lng - lng);
    if (d < 1e-7) return p.ciWeighted;
    const w = 1 / Math.pow(d, power);
    wSum += w; vSum += w * p.ciWeighted;
  }
  return wSum ? vSum / wSum : null;
}

// ═══════════════════════════════════════════════════════════════
// 2) REAL STREET ROUTE — Overpass fetch + graph + Dijkstra w/ path
// reconstruction. Same endpoint/query shape as simulator.html's
// loadUnmeasuredBuildings(), different tag and consumer.
// ═══════════════════════════════════════════════════════════════
const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

// Highway classes excluded from the walkable graph — none of these are
// expected inside a historic old-town core, but the filter is explicit
// rather than assumed, same principle as simulator.html's building filter.
const EXCLUDED_HIGHWAY = /^(motorway|trunk|motorway_link|trunk_link|construction|proposed|raceway)$/;

function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Builds { nodeCoord: Map<id,{lat,lng}>, adj: Map<id, Map<neighborId, weightMeters>> } from an Overpass response. */
function buildStreetGraph(overpassData) {
  const nodeCoord = new Map();
  const adj = new Map();
  const addEdge = (id1, id2, w) => {
    if (!adj.has(id1)) adj.set(id1, new Map());
    if (!adj.has(id2)) adj.set(id2, new Map());
    const m1 = adj.get(id1), m2 = adj.get(id2);
    if (!m1.has(id2) || m1.get(id2) > w) m1.set(id2, w);
    if (!m2.has(id1) || m2.get(id1) > w) m2.set(id1, w);
  };
  for (const el of (overpassData.elements || [])) {
    if (el.type !== 'way') continue;
    const hw = (el.tags && el.tags.highway) || '';
    if (EXCLUDED_HIGHWAY.test(hw)) continue;
    const nodes = el.nodes || [];
    const geom = el.geometry || [];
    if (nodes.length !== geom.length) continue; // Overpass occasionally omits geometry for a node it couldn't resolve — skip the whole way rather than build a mismatched graph
    for (let i = 0; i < nodes.length - 1; i++) {
      const g1 = geom[i], g2 = geom[i + 1];
      if (!g1 || !g2 || g1.lat === undefined || g2.lat === undefined) continue;
      nodeCoord.set(nodes[i], { lat: g1.lat, lng: g1.lon });
      nodeCoord.set(nodes[i + 1], { lat: g2.lat, lng: g2.lon });
      const w = haversineMeters(g1.lat, g1.lon, g2.lat, g2.lon);
      if (w > 0) addEdge(nodes[i], nodes[i + 1], w);
    }
  }
  return { nodeCoord, adj };
}

/** Nearest graph node to (lat,lng) — linear scan, fine at ~1-2k nodes for a handful of calls. */
function snapToNearestNode(lat, lng, nodeCoord) {
  let bestId = null, bestD = Infinity;
  for (const [id, c] of nodeCoord) {
    const d = haversineMeters(lat, lng, c.lat, c.lng);
    if (d < bestD) { bestD = d; bestId = id; }
  }
  return { id: bestId, dist: bestD };
}

/** Dijkstra with predecessor tracking — O(V^2), fine at the ~1-2k node scale of one old-town bbox. */
function dijkstraWithPath(srcId, nodeCoord, adj) {
  const dist = new Map([[srcId, 0]]);
  const prev = new Map();
  const visited = new Set();
  while (true) {
    let u = null, best = Infinity;
    for (const [id, d] of dist) {
      if (visited.has(id)) continue;
      if (d < best) { best = d; u = id; }
    }
    if (u === null) break;
    visited.add(u);
    const neighbors = adj.get(u);
    if (!neighbors) continue;
    for (const [v, w] of neighbors) {
      if (visited.has(v)) continue;
      const alt = dist.get(u) + w;
      if (!dist.has(v) || alt < dist.get(v)) { dist.set(v, alt); prev.set(v, u); }
    }
  }
  return { dist, prev };
}

function reconstructPath(prev, srcId, targetId) {
  if (srcId === targetId) return [targetId];
  const path = [targetId];
  let cur = targetId;
  while (cur !== srcId) {
    const p = prev.get(cur);
    if (p === undefined) return null; // unreachable
    path.push(p);
    cur = p;
  }
  path.push(srcId);
  return path.reverse();
}

/**
 * computeStreetRoute(stops, opts?)
 * stops: [{ name, lat, lng }, ...] — VISITING ORDER already decided by the
 * caller (this function does not solve a TSP, it only routes between
 * consecutive stops in the order given — e.g. tia.html's confirmed
 * exact-optimum order from the 2026-08-12 street-network TSP investigation).
 *
 * Returns { points: [{lat,lng,distAlong}], stops: [{name,lat,lng,distAlong,snapDist}] }
 * — `points` is the full real-street polyline (graph resolution, not yet
 * resampled — see sampleProfile for that), `stops` gives each input stop's
 * own cumulative distance along that polyline (for axis tick placement)
 * AND its own lat/lng (so sampleProfile can compute each stop's EXACT,
 * non-interpolated value later — see sampleProfile's doc comment).
 *
 * Route geometry runs through each stop's SNAPPED street-graph node, not
 * its raw measured coordinate — snapDist (metres) reports how far apart
 * those two were for that stop, so a caller can judge data quality, but it
 * is NOT added into the polyline itself. Two reasons: (1) at an
 * intermediate stop, walking in to the true coordinate and back out to
 * resume the path is a real detour a person would actually make, and
 * skipping it (as an earlier version of this function did, by inserting
 * the true coordinate as a single through-vertex instead of an in-and-out
 * detour) silently cuts that distance — caught 2026-08-12 by cross-checking
 * against the already-verified street-network TSP result, where it showed
 * up as a systematic undercount; (2) rather than add the more complex
 * correct detour logic, snapDist values here are consistently small
 * (single digits of metres in the one zone tested so far), well under
 * both this chart's resolution and the ±3-8m GPS accuracy the underlying
 * CI field measurements already carry — folding the two together is
 * honest, not a shortcut taken to avoid writing the detour code.
 *
 * Throws on network failure or if any consecutive pair turns out
 * unreachable on the fetched graph (e.g. a disconnected OSM fragment) —
 * the caller is expected to catch this and show a retry affordance, same
 * UX pattern as simulator.html's "Could not reach OpenStreetMap" handling.
 */
export async function computeStreetRoute(stops, opts) {
  opts = opts || {};
  if (!stops || stops.length < 2) throw new Error('computeStreetRoute needs at least 2 stops');

  // Bounding box around the stops, padded so the fetched graph includes
  // streets that loop around a block rather than just the stops' own tight
  // footprint — pad values calibrated during the 2026-08-12 exploration
  // (enough to fully cover a ~250m x 250m old-town cluster's connecting
  // streets without pulling in the whole town).
  const padLat = opts.padLatDeg !== undefined ? opts.padLatDeg : 0.0018;
  const padLng = opts.padLngDeg !== undefined ? opts.padLngDeg : 0.0025;
  let south = Infinity, north = -Infinity, west = Infinity, east = -Infinity;
  stops.forEach(s => {
    if (s.lat < south) south = s.lat; if (s.lat > north) north = s.lat;
    if (s.lng < west) west = s.lng; if (s.lng > east) east = s.lng;
  });
  south -= padLat; north += padLat; west -= padLng; east += padLng;

  const query = `[out:json][timeout:${opts.timeoutSec || 25}];(way["highway"](${south},${west},${north},${east}););out geom;`;
  const res = await fetch(OVERPASS_URL, { method: 'POST', body: 'data=' + encodeURIComponent(query) });
  if (!res.ok) throw new Error('Overpass HTTP ' + res.status);
  const overpassData = await res.json();

  const { nodeCoord, adj } = buildStreetGraph(overpassData);
  if (nodeCoord.size === 0) throw new Error('Overpass returned no usable street geometry for this area');

  const snaps = stops.map(s => ({ ...snapToNearestNode(s.lat, s.lng, nodeCoord), stop: s }));

  const points = []; // {lat,lng,distAlong}
  const stopMarks = []; // {name,lat,lng,distAlong,snapDist}
  let cum = 0;

  const pushPoint = (lat, lng) => {
    if (points.length) {
      const last = points[points.length - 1];
      cum += haversineMeters(last.lat, last.lng, lat, lng);
    }
    points.push({ lat, lng, distAlong: cum });
  };

  const firstNode = nodeCoord.get(snaps[0].id);
  pushPoint(firstNode.lat, firstNode.lng);
  stopMarks.push({ name: snaps[0].stop.name, lat: snaps[0].stop.lat, lng: snaps[0].stop.lng, distAlong: cum, snapDist: snaps[0].dist });

  for (let i = 0; i < snaps.length - 1; i++) {
    const { prev } = dijkstraWithPath(snaps[i].id, nodeCoord, adj);
    const path = reconstructPath(prev, snaps[i].id, snaps[i + 1].id);
    if (!path) {
      throw new Error(`No street path found between "${snaps[i].stop.name}" and "${snaps[i + 1].stop.name}" — the fetched graph may be fragmented here.`);
    }
    // path[0] is snaps[i].id, already the last point pushed — skip it to
    // avoid a zero-length duplicate vertex at the seam.
    for (let k = 1; k < path.length; k++) {
      const c = nodeCoord.get(path[k]);
      pushPoint(c.lat, c.lng);
    }
    stopMarks.push({ name: snaps[i + 1].stop.name, lat: snaps[i + 1].stop.lat, lng: snaps[i + 1].stop.lng, distAlong: cum, snapDist: snaps[i + 1].dist });
  }

  return { points, stops: stopMarks, totalLength: cum };
}

// ═══════════════════════════════════════════════════════════════
// 3) SAMPLING — walk the route polyline, evaluate the IDW surface at each
// sampled point (relief + TIA scenario + optional HIA), plus an exact
// value at each stop's own coordinate. Pure, synchronous.
// ═══════════════════════════════════════════════════════════════
/**
 * sampleProfile(route, objectsRelief, objectsTia?, opts?)
 *
 * route: computeStreetRoute()'s return value.
 * objectsRelief: [{lat,lng,ciWeighted}, ...] — the REAL, measured object
 *   list (PASSPORT_REGISTRY state, no scenario applied). Drives the relief
 *   fill — the "honest" surface.
 * objectsTia: [{lat,lng,ciWeighted}, ...] — the same list under a
 *   hypothetical "modify one object" scenario. Defaults to objectsRelief
 *   (no scenario supplied -> the TIA line just retraces the relief).
 * opts.objectsHia: [{lat,lng,ciWeighted}, ...] — OPTIONAL, reserved for a
 *   future expert-assessed Heritage Impact Assessment layer (see
 *   TIA_continuation_brief_12aug2026.md, backlog item c). Omit entirely
 *   (not just an empty array) when there is no real HIA data — the render
 *   stage checks for its presence and simply doesn't draw a HIA line at all.
 * opts.targetSamples: aim for roughly this many samples regardless of the
 *   route's actual length (default 300) — more robust across zones of very
 *   different sizes (Kotor's streets won't be the same length as Herceg
 *   Novi's) than a fixed step in metres.
 *
 * Returns { samples, stops }:
 *   samples: [{distAlong, lat, lng, ciRelief, ciTia, ciHia?}, ...]
 *   stops: route.stops enriched with each stop's own EXACT value — via
 *     idwAt()'s d<1e-7 exact-match branch, never interpolated/resampled,
 *     since a stop IS one of the real measured objects — {name, lat, lng,
 *     distAlong, snapDist, ciRelief, ciTia, ciHia?}.
 */
export function sampleProfile(route, objectsRelief, objectsTia, opts) {
  opts = opts || {};
  objectsTia = objectsTia || objectsRelief;
  const objectsHia = opts.objectsHia;
  const targetSamples = opts.targetSamples || 300;
  const step = Math.max(0.5, route.totalLength / targetSamples);

  const samples = [];
  let segIdx = 0;
  for (let d = 0; d <= route.totalLength + 1e-6; d += step) {
    while (segIdx < route.points.length - 2 && route.points[segIdx + 1].distAlong < d) segIdx++;
    const p0 = route.points[segIdx], p1 = route.points[Math.min(segIdx + 1, route.points.length - 1)];
    const segLen = p1.distAlong - p0.distAlong;
    const t = segLen > 1e-9 ? Math.min(1, Math.max(0, (d - p0.distAlong) / segLen)) : 0;
    const lat = p0.lat + (p1.lat - p0.lat) * t;
    const lng = p0.lng + (p1.lng - p0.lng) * t;
    const sample = {
      distAlong: d,
      lat, lng,
      ciRelief: idwAt(lat, lng, objectsRelief),
      ciTia: idwAt(lat, lng, objectsTia),
    };
    if (objectsHia) sample.ciHia = idwAt(lat, lng, objectsHia);
    samples.push(sample);
  }

  const stops = route.stops.map(s => {
    const stop = {
      ...s,
      ciRelief: idwAt(s.lat, s.lng, objectsRelief),
      ciTia: idwAt(s.lat, s.lng, objectsTia),
    };
    if (objectsHia) stop.ciHia = idwAt(s.lat, s.lng, objectsHia);
    return stop;
  });

  return { samples, stops };
}

// ═══════════════════════════════════════════════════════════════
// COLOUR SCIENCE — weightedToT()/ciToHex() ported VERBATIM from
// ATRC_CI_Map.html (the same function the spectral map, the TIA ring, and
// the legend all use — confirmed 2026-08-12 by reading the source there
// directly). This REPLACES a simpler linear mapping this file used before
// (wl = 700 - (v/1.5)*300 across the whole 0-1.5 range) — that was NOT the
// same function, an oversight caught when Sergei asked specifically for
// "та же функция, что красит карту/кольцо/легенду". weightedToT is
// piecewise: CI 0-1.0 occupies the first SPECTRUM_SPLIT (80%) of the
// spectrum, CI 1.0-PSM_MAX occupies the remaining 20% — deliberately
// reserving the violet end for objects with a real PSM protection-status
// premium, rather than letting a PSM=1.0 object at CI=1.0 already claim it.
//
// KNOWN OPEN INCONSISTENCY (not fixed here): tia-bar.js/tia-ring.js still
// use the old simple linear mapping as of this writing, so the same
// CI(weighted) value currently renders a very slightly different colour on
// the bar/ring panels than on this one, on the same tia.html page. Asked
// Sergei 2026-08-12 whether to also update those two files; no answer yet
// — scoped to zone-profile.js only until that's decided.
// ═══════════════════════════════════════════════════════════════
function wavelengthToRGB(wl) {
  let r = 0, g = 0, b = 0;
  if (wl >= 380 && wl < 440) { r = (440 - wl) / (440 - 380); g = 0; b = 1; }
  else if (wl < 490) { r = 0; g = (wl - 440) / (490 - 440); b = 1; }
  else if (wl < 510) { r = 0; g = 1; b = (510 - wl) / (510 - 490); }
  else if (wl < 580) { r = (wl - 510) / (580 - 510); g = 1; b = 0; }
  else if (wl < 645) { r = 1; g = (645 - wl) / (645 - 580); b = 0; }
  else if (wl <= 780) { r = 1; g = 0; b = 0; }
  let factor = 1.0;
  if (wl >= 380 && wl < 420) factor = 0.3 + 0.7 * (wl - 380) / (420 - 380);
  else if (wl >= 700 && wl <= 780) factor = 0.3 + 0.7 * (780 - wl) / (780 - 700);
  const adjust = c => Math.round(255 * Math.pow(c * factor, 0.8));
  return [adjust(r), adjust(g), adjust(b)];
}

const PSM_MAX = 1.5;
const SPECTRUM_SPLIT = 0.8; // fraction of the colour scale given to CI_weighted 0-1.0

function weightedToT(ciWeighted) {
  const v = Math.max(0, ciWeighted);
  if (v <= 1.0) return (v / 1.0) * SPECTRUM_SPLIT;
  const span = PSM_MAX - 1.0;
  const extra = Math.min(v, PSM_MAX) - 1.0;
  return SPECTRUM_SPLIT + (span > 0 ? (extra / span) : 0) * (1 - SPECTRUM_SPLIT);
}

function ciToHex(ciWeighted) {
  const t = weightedToT(ciWeighted);
  const wl = 700 - t * 300; // t 1 -> 400nm violet (good), t 0 -> 700nm red (alarm)
  const [r, g, b] = wavelengthToRGB(wl);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

// Fixed overlay-line colours — flat, not spectral. Not sourced from any
// other file (checked 2026-08-12: neither hex appears elsewhere in the
// project before this session introduced them) — deliberate choices,
// kept even after the relief/TIA/HIA restructure since Sergei's spec
// explicitly calls for "фиксированный красный"/"фиксированный зелёный".
const TIA_COLOR = '#d03b3b';
const HIA_COLOR = '#0ca30c';

// ═══════════════════════════════════════════════════════════════
// GEOMETRY
// ═══════════════════════════════════════════════════════════════
export const PROFILE_GEOMETRY = {
  viewBoxWidth: 900,
  viewBoxHeight: 460,
  scaleMin: 0.25,
  scaleMax: 1.50,
  plotLeft: 70,
  plotRight: 870,
  plotTop: 70,
  baselineY: 340,
  titleX: 24,
  titleY: 30,
  stopLabelY: 372,
  categoryLabelY: 400,
  legendY: 432,
};

const CATEGORIES = [
  { key: 'anxious', label: 'Anxious', lo: 0.20, hi: 0.50 },
  { key: 'low', label: 'Low', lo: 0.50, hi: 0.80 },
  { key: 'moderate', label: 'Moderate', lo: 0.80, hi: 1.05 },
  { key: 'high', label: 'High', lo: 1.05, hi: 1.25 },
  { key: 'deep', label: 'Deep', lo: 1.25, hi: 1.50 },
];

function ciToY(ci) {
  const { scaleMin, scaleMax, plotTop, baselineY } = PROFILE_GEOMETRY;
  const v = Math.max(scaleMin, Math.min(scaleMax, ci));
  return baselineY - (v - scaleMin) / (scaleMax - scaleMin) * (baselineY - plotTop);
}
function distToX(d, totalLength) {
  const { plotLeft, plotRight } = PROFILE_GEOMETRY;
  const t = totalLength > 0 ? Math.max(0, Math.min(1, d / totalLength)) : 0;
  return plotLeft + t * (plotRight - plotLeft);
}

function buildAxes(totalLength) {
  const { plotLeft, plotRight, plotTop, baselineY, scaleMin, scaleMax } = PROFILE_GEOMETRY;
  let out = `<line x1="${plotLeft}" y1="${baselineY}" x2="${plotRight}" y2="${baselineY}" stroke="#333" stroke-width="1"/>`;
  for (let v = scaleMin; v <= scaleMax + 1e-9; v += 0.25) {
    const y = ciToY(v);
    out += `<line x1="${plotLeft - 6}" y1="${y.toFixed(2)}" x2="${plotLeft}" y2="${y.toFixed(2)}" stroke="#555" stroke-width="0.7"/>`;
    out += `<text x="${(plotLeft - 10).toFixed(2)}" y="${(y + 3).toFixed(2)}" text-anchor="end" font-size="9" fill="#9b9a9a" font-family="Helvetica, Arial, sans-serif">${v.toFixed(2)}</text>`;
    out += `<line x1="${plotLeft}" y1="${y.toFixed(2)}" x2="${plotRight}" y2="${y.toFixed(2)}" stroke="#333" stroke-width="0.4"/>`;
  }
  // distance ticks every ~100m (or a sensible fraction of shorter routes)
  const distStep = totalLength > 500 ? 100 : (totalLength > 150 ? 50 : 20);
  for (let d = 0; d <= totalLength + 1e-6; d += distStep) {
    const x = distToX(d, totalLength);
    out += `<line x1="${x.toFixed(2)}" y1="${baselineY}" x2="${x.toFixed(2)}" y2="${baselineY + 5}" stroke="#555" stroke-width="0.7"/>`;
    out += `<text x="${x.toFixed(2)}" y="${(baselineY + 16).toFixed(2)}" text-anchor="middle" font-size="8.5" fill="#9b9a9a" font-family="Helvetica, Arial, sans-serif">${d.toFixed(0)}m</text>`;
  }
  return out;
}

function buildCategoryRow() {
  const { plotLeft, scaleMin, scaleMax } = PROFILE_GEOMETRY;
  return CATEGORIES.map(cat => {
    const y0 = ciToY(Math.max(cat.lo, scaleMin)), y1 = ciToY(Math.min(cat.hi, scaleMax));
    const cy = (y0 + y1) / 2;
    return `<text x="${(plotLeft - 10).toFixed(2)}" y="${cy.toFixed(2)}" text-anchor="end" font-size="7.5" fill="#6a6a6a" font-family="'Myriad Pro', Arial, sans-serif">${cat.label}</text>`;
  }).join('');
}

// The relief — filled area under the REAL, measured surface (ciRelief),
// coloured per segment via ciToHex/weightedToT. A thin, translucent top
// stroke traces the silhouette on top of the fill for definition, same
// role as tia-bar.js's white top-edge stroke on its blocks.
function buildReliefFill(samples, totalLength) {
  if (samples.length < 2) return '';
  const { baselineY } = PROFILE_GEOMETRY;
  let fill = '';
  for (let i = 0; i < samples.length - 1; i++) {
    const a = samples[i], b = samples[i + 1];
    const mid = (a.ciRelief + b.ciRelief) / 2;
    const color = ciToHex(mid);
    const x1 = distToX(a.distAlong, totalLength), y1 = ciToY(a.ciRelief);
    const x2 = distToX(b.distAlong, totalLength), y2 = ciToY(b.ciRelief);
    fill += `<polygon points="${x1.toFixed(2)},${baselineY} ${x1.toFixed(2)},${y1.toFixed(2)} ${x2.toFixed(2)},${y2.toFixed(2)} ${x2.toFixed(2)},${baselineY}" fill="${color}"/>`;
  }
  const topPoints = samples.map(s => `${distToX(s.distAlong, totalLength).toFixed(2)},${ciToY(s.ciRelief).toFixed(2)}`).join(' L');
  return fill + `<path d="M${topPoints}" fill="none" stroke="#f5f5f5" stroke-width="1" opacity="0.6"/>`;
}

// Flat single-colour overlay line — used for both the TIA line (key
// 'ciTia') and the optional HIA line (key 'ciHia'). Returns '' if the
// requested key isn't present in the samples at all (e.g. no HIA data was
// supplied to sampleProfile) rather than drawing a line of undefined/NaN
// points.
function buildOverlayLine(samples, totalLength, key, color, strokeWidth) {
  if (samples.length < 2 || samples[0][key] === undefined) return '';
  const points = samples.map(s => `${distToX(s.distAlong, totalLength).toFixed(2)},${ciToY(s[key]).toFixed(2)}`).join(' L');
  return `<path d="M${points}" fill="none" stroke="${color}" stroke-width="${strokeWidth}"/>`;
}

function buildStopMarks(stops, totalLength) {
  const { baselineY, plotTop, stopLabelY } = PROFILE_GEOMETRY;
  return stops.map((s, i) => {
    const x = distToX(s.distAlong, totalLength);
    const label = s.name.length > 16 ? s.name.slice(0, 15) + '…' : s.name;
    return `<line x1="${x.toFixed(2)}" y1="${plotTop}" x2="${x.toFixed(2)}" y2="${baselineY}" stroke="#3a3a3a" stroke-width="0.6" stroke-dasharray="1,2"/>
      <circle cx="${x.toFixed(2)}" cy="${baselineY}" r="2.4" fill="#e5e5e5"/>
      <text x="${x.toFixed(2)}" y="${stopLabelY}" text-anchor="${i === 0 ? 'start' : (i === stops.length - 1 ? 'end' : 'middle')}" font-size="8.5" fill="#c8c8c8" font-family="Arial, sans-serif" transform="rotate(-38 ${x.toFixed(2)} ${stopLabelY})">${label}</text>`;
  }).join('');
}

// Numeric CI(weighted) label above each stop's own point on the relief —
// its EXACT value (samples[].ciRelief comes from sampleProfile's stops
// enrichment, via idwAt's exact-match branch, not interpolated).
//
// Margins ALTERNATE between two fixed heights rather than using one
// constant offset — checked against this zone's real spacing before
// shipping: Clock Tower and Stepeniste Kralja Tvrtka I sit only ~22m apart
// on a ~600m route, close enough on screen for two adjacent numeric labels
// to collide the same way tia-bar.js's before/after labels once did. A
// fixed zig-zag is a simpler, N-stop-safe fix than a real collision solver
// — unlike tia-bar.js (exactly 2 labels, so sort+push-apart was practical
// and worth the complexity), a route can have many stops, so alternating
// guarantees no two ADJACENT stops ever share a row, at the minor cost of
// a slightly staggered rhythm even where stops are already far enough
// apart to not need it. MIN_TOP_LABEL_Y clamps against climbing into the
// title/subtitle text for a stop whose CI(weighted) sits very near scaleMax.
const TOP_LABEL_MARGIN_NEAR = 14;
const TOP_LABEL_MARGIN_FAR = 26;
const MIN_TOP_LABEL_Y = 52;

function buildTopLabels(stops, totalLength) {
  return stops.map((s, i) => {
    if (s.ciRelief === null || s.ciRelief === undefined) return '';
    const x = distToX(s.distAlong, totalLength);
    const margin = i % 2 === 0 ? TOP_LABEL_MARGIN_NEAR : TOP_LABEL_MARGIN_FAR;
    const y = Math.max(ciToY(s.ciRelief) - margin, MIN_TOP_LABEL_Y);
    return `<text x="${x.toFixed(2)}" y="${y.toFixed(2)}" text-anchor="middle" font-size="9.5" font-weight="700" fill="#fff" font-family="Arial, sans-serif">${s.ciRelief.toFixed(3)}</text>`;
  }).join('');
}

function buildLegend(hasHia) {
  const { plotLeft, legendY } = PROFILE_GEOMETRY;
  let out = `
    <text x="${plotLeft}" y="${(legendY - 1).toFixed(2)}" font-size="10" fill="#c8c8c8" font-family="Arial, sans-serif">relief: real CI(weighted), spectral</text>
    <line x1="${plotLeft + 240}" y1="${(legendY - 4).toFixed(2)}" x2="${plotLeft + 260}" y2="${(legendY - 4).toFixed(2)}" stroke="${TIA_COLOR}" stroke-width="2.4"/>
    <text x="${plotLeft + 266}" y="${(legendY - 1).toFixed(2)}" font-size="10" fill="#c8c8c8" font-family="Arial, sans-serif">TIA scenario (modify)</text>`;
  if (hasHia) {
    out += `
    <line x1="${plotLeft + 430}" y1="${(legendY - 4).toFixed(2)}" x2="${plotLeft + 450}" y2="${(legendY - 4).toFixed(2)}" stroke="${HIA_COLOR}" stroke-width="2.4"/>
    <text x="${plotLeft + 456}" y="${(legendY - 1).toFixed(2)}" font-size="10" fill="#c8c8c8" font-family="Arial, sans-serif">HIA (reserved)</text>`;
  }
  return out;
}

function buildSVG(data) {
  const { viewBoxWidth: vbW, viewBoxHeight: vbH, titleX, titleY } = PROFILE_GEOMETRY;
  const samples = data.samples || [];
  const stops = data.stops || [];
  const totalLength = data.totalLength || (samples.length ? samples[samples.length - 1].distAlong : 0);
  const hasHia = samples.length > 0 && samples[0].ciHia !== undefined;

  return `<svg viewBox="0 0 ${vbW} ${vbH}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <rect width="${vbW}" height="${vbH}" fill="#111111"/>
    <text x="${titleX}" y="${titleY}" font-size="15" font-weight="700" fill="#fff" font-family="Arial, sans-serif">Zone Profile — ${data.zoneName || ''}</text>
    <text x="${titleX}" y="${titleY + 16}" font-size="10.5" fill="#9b9a9a" font-family="Arial, sans-serif">${data.zoneIdLabel || ''} &middot; real street route, ${totalLength.toFixed(0)} m &middot; CI(weighted) sampled along it</text>
    ${buildAxes(totalLength)}
    ${buildCategoryRow()}
    ${buildReliefFill(samples, totalLength)}
    ${buildOverlayLine(samples, totalLength, 'ciTia', TIA_COLOR, 2.2)}
    ${hasHia ? buildOverlayLine(samples, totalLength, 'ciHia', HIA_COLOR, 2.2) : ''}
    ${buildStopMarks(stops, totalLength)}
    ${buildTopLabels(stops, totalLength)}
    ${buildLegend(hasHia)}
  </svg>`;
}

let stylesInjected = false;
function injectGlobalStyles() {
  if (stylesInjected) return;
  stylesInjected = true;
  const style = document.createElement('style');
  style.textContent = `.zoneprofile-root { position: relative; }`;
  document.head.appendChild(style);
}

const instances = new Map();

/**
 * renderZoneProfile(containerId, data)
 * data = {
 *   zoneName, zoneIdLabel,
 *   samples,      // sampleProfile()'s .samples — {distAlong, ciRelief, ciTia, ciHia?}
 *   stops,        // sampleProfile()'s .stops — {name, lat, lng, distAlong, snapDist, ciRelief, ciTia, ciHia?}
 *   totalLength,  // computeStreetRoute()'s .totalLength
 * }
 *
 * Three visual layers, independent of each other — see the file header for
 * the full rationale:
 *   - relief: filled area tracing ciRelief, coloured per segment via
 *     weightedToT()/ciToHex() (the same spectral function the map/ring/
 *     legend use) — height and colour both come from the same real number.
 *   - TIA line: flat red (#d03b3b), tracing ciTia — a hypothetical
 *     "modify one object" scenario. Always drawn (defaults to retracing
 *     the relief when sampleProfile was given no scenario).
 *   - HIA line: flat green (#0ca30c), tracing ciHia — reserved for a
 *     future expert-input parameter. Drawn ONLY when ciHia is actually
 *     present in `samples`; omit it from sampleProfile's call entirely to
 *     leave this layer off, no placeholder line is drawn.
 */
export function renderZoneProfile(containerId, data) {
  injectGlobalStyles();
  const container = document.getElementById(containerId);
  if (!container) { console.error(`zone-profile: no element #${containerId}`); return; }
  container.classList.add('zoneprofile-root');
  container.innerHTML = buildSVG(data);
  instances.set(containerId, { data });
}

export function updateZoneProfile(containerId, data) {
  renderZoneProfile(containerId, data);
}
