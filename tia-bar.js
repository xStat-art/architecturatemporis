/**
 * tia-bar.js
 * ─────────────────────────────────────────────────────────────────────────
 * Vanilla ES6 module. Overlay bar chart for zone chronity + TIA impact.
 *
 * CONCEPT (Sergei's, from chat): each zone state is a block whose X position
 * on the CI(weighted) spectral scale AND whose height both track the same
 * single number — the zone's aggregate CI_zone(weighted). Two states share
 * one X axis:
 *   - "before" (the zone as it stands in PASSPORT_REGISTRY, pre-scenario) —
 *     drawn behind, at reduced opacity
 *   - "after" (the same zone once a TIA scenario is applied) — drawn in
 *     front, fully opaque
 * Both numbers come straight from the server (handleComputeTIA's response:
 * ciZoneWeightedBefore, ciZoneWeightedAfter, deltaCIWeighted, decision) —
 * this file does no aggregation of its own and knows nothing about how many
 * objects changed or which ones. That's deliberate: scenario.modify is a
 * single flat patch per object per request (see applyTiaScenario in
 * ACAP_AppsScript_v8_1.gs) — the caller is the one that accumulates
 * multiple interventions into a final scenario before sending it, so by the
 * time a response comes back, all this file ever sees is one before/after
 * pair for the whole zone, never a list of individual edits. Trying to
 * visualize "which object changed" here would be inventing detail the data
 * doesn't carry.
 *
 * REPLACES an earlier version of this file that computed its own "outlier"
 * (the single lowest-CI object in the zone, via a local computeZoneStats()
 * heuristic) and drew a stepped "ghost vs current-with-outlier" shape. That
 * heuristic never talked to the real backend at all — removed outright, not
 * kept as a fallback, per Sergei's decision 2026-08-12: this component now
 * shows the zone's real before/after TIA state or nothing.
 * ─────────────────────────────────────────────────────────────────────────
 */

export const BAR_GEOMETRY = {
  viewBoxWidth: 760,
  viewBoxHeight: 610,   // was 580 — the reference file's footer text sits at y=590, so 580 was clipping it
  scaleMin: 0.25,
  scaleMax: 1.50,
  plotLeft: 122.4,
  plotRight: 574.1,
  legendX: 606,          // right-side column, "before" reference
  legendLineEndX: 687.3,
  baselineY: 420,
  maxBarHeight: 190,
  barTop: 452,
  barHeight: 15,
  categoryLabelY: 440,
  tickLabelY: 483,
  footerY: 507,
  titleX: 75.54,
  titleY: 42,      // was 24.23 — at 39.685px font, the ascenders reached above y=0 and got clipped by the viewBox edge
  subtitleY: 64.69,
  zoneNameY: 117.17,
  zoneIdY: 133.17,
  currentLabelY: 152.39,
};

// v8.4: Anxious lower bound corrected 0.25 -> 0.20, to match the confirmed
// value in tia-ring.js (RING_CATEGORIES) — that file's own history comment
// documents this as a deliberate revision from the original baked artwork's
// 0.30 down to 0.20, confirmed with Sergei. This file's 0.25 had simply
// never picked up that correction; the two components now agree.
export const CATEGORIES = [
  { key: 'anxious', label: 'Anxious', lo: 0.20, hi: 0.50 },
  { key: 'low', label: 'low', lo: 0.50, hi: 0.80 },
  { key: 'moderate', label: 'Moderate', lo: 0.80, hi: 1.05 },
  { key: 'high', label: 'High', lo: 1.05, hi: 1.25 },
  { key: 'deep', label: 'Deep', lo: 1.25, hi: 1.50 },
];

function wavelengthToRGB(wavelength) {
  let r = 0, g = 0, b = 0;
  if (wavelength >= 380 && wavelength < 440) { r = -(wavelength - 440) / (440 - 380); g = 0; b = 1; }
  else if (wavelength >= 440 && wavelength < 490) { r = 0; g = (wavelength - 440) / (490 - 440); b = 1; }
  else if (wavelength >= 490 && wavelength < 510) { r = 0; g = 1; b = -(wavelength - 510) / (510 - 490); }
  else if (wavelength >= 510 && wavelength < 580) { r = (wavelength - 510) / (580 - 510); g = 1; b = 0; }
  else if (wavelength >= 580 && wavelength < 645) { r = 1; g = -(wavelength - 645) / (645 - 580); b = 0; }
  else if (wavelength >= 645 && wavelength <= 780) { r = 1; g = 0; b = 0; }
  let factor = 1;
  if (wavelength >= 380 && wavelength < 420) factor = 0.3 + 0.7 * (wavelength - 380) / (420 - 380);
  else if (wavelength >= 701 && wavelength <= 780) factor = 0.3 + 0.7 * (780 - wavelength) / (780 - 700);
  const gamma = 0.8;
  const adjust = c => c === 0 ? 0 : Math.round(255 * Math.pow(c * factor, gamma));
  return [adjust(r), adjust(g), adjust(b)];
}

export function valueToHex(value) {
  const v = Math.max(0.25, Math.min(1.5, value));
  const wl = 700 - (v / 1.5) * 300;
  const [r, g, b] = wavelengthToRGB(wl);
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
}

export function valueToX(value) {
  const { plotLeft, plotRight, scaleMin, scaleMax } = BAR_GEOMETRY;
  const v = Math.max(scaleMin, Math.min(scaleMax, value));
  return plotLeft + (v - scaleMin) / (scaleMax - scaleMin) * (plotRight - plotLeft);
}

export function valueToHeight(value) {
  const { scaleMin, scaleMax, maxBarHeight } = BAR_GEOMETRY;
  const v = Math.max(scaleMin, Math.min(scaleMax, value));
  return (v - scaleMin) / (scaleMax - scaleMin) * maxBarHeight;
}

const GRADIENT_STOPS = 24;
function buildGradientDef(id, x0, x1, y0, y1, colorAt) {
  const stops = [];
  for (let i = 0; i <= GRADIENT_STOPS; i++) {
    const t = i / GRADIENT_STOPS;
    stops.push(`<stop offset="${(t * 100).toFixed(1)}%" stop-color="${colorAt(t)}"/>`);
  }
  return `<linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="${x0.toFixed(2)}" y1="${y0}" x2="${x1.toFixed(2)}" y2="${y1}">${stops.join('')}</linearGradient>`;
}

function buildSpectrumBar(uid, defsOut) {
  const { plotLeft, plotRight, barTop, barHeight, scaleMin, scaleMax } = BAR_GEOMETRY;
  const gradId = `tiabar-spectrum-grad-${uid}`;
  defsOut.push(buildGradientDef(gradId, plotLeft, plotRight, barTop, barTop,
    t => valueToHex(scaleMin + t * (scaleMax - scaleMin))));
  let out = `<rect x="${plotLeft}" y="${barTop}" width="${(plotRight - plotLeft).toFixed(2)}" height="${barHeight}" fill="url(#${gradId})"/>`;
  for (let v = scaleMin; v <= scaleMax + 1e-9; v += 0.25) {
    const x = valueToX(v);
    out += `<line x1="${x.toFixed(2)}" y1="${barTop}" x2="${x.toFixed(2)}" y2="${barTop + barHeight + 5}" stroke="#555" stroke-width="0.7"/>`;
    out += `<text x="${x.toFixed(2)}" y="${BAR_GEOMETRY.tickLabelY}" text-anchor="middle" font-size="8.5" fill="#9b9a9a" font-family="Helvetica, Arial, sans-serif">${v.toFixed(2)}</text>`;
  }
  return out;
}

function categoryAt(value) {
  return CATEGORIES.find(c => value >= c.lo && value < c.hi) || CATEGORIES[CATEGORIES.length - 1];
}

function buildCategoryRow(meanValue) {
  const activeCat = meanValue !== undefined ? categoryAt(meanValue) : null;
  return CATEGORIES.map(cat => {
    const cx = (valueToX(cat.lo) + valueToX(cat.hi)) / 2;
    const isActive = activeCat && cat.key === activeCat.key;
    const fill = isActive ? '#fff' : '#9b9a9a';
    const weight = isActive ? '700' : '400';
    return `<text x="${cx.toFixed(2)}" y="${BAR_GEOMETRY.categoryLabelY}" text-anchor="middle" font-size="8.5" font-weight="${weight}" fill="${fill}" font-family="'Myriad Pro', Arial, sans-serif">${cat.label}</text>`;
  }).join('');
}

function buildCornerLabel(x, shapeTopY, labelY) {
  return `<line x1="${x.toFixed(2)}" y1="${(labelY + 10).toFixed(2)}" x2="${x.toFixed(2)}" y2="${shapeTopY.toFixed(2)}" stroke="#666" stroke-width="0.5" stroke-dasharray="1,2"/>`;
}
function buildCornerValue(x, labelY, value, opts) {
  const { bold } = opts || {};
  return `<text x="${x.toFixed(2)}" y="${labelY.toFixed(2)}" text-anchor="middle" font-size="12" font-weight="${bold ? '700' : '400'}" fill="${bold ? '#fff' : '#ccc'}" font-family="Arial, sans-serif">${value.toFixed(3)}</text>`;
}

// Margin between a corner label's own baseline and the top of the bar it
// marks, when there's no risk of colliding with the OTHER label — and the
// minimum vertical gap enforced between before/after's two labels when
// their natural positions (each bar's own top - CORNER_LABEL_MARGIN) would
// otherwise land closer together than this.
const CORNER_LABEL_MARGIN = 16;
const CORNER_LABEL_MIN_GAP = 20;

/**
 * Computes each shown bar's corner-label Y. Each label's NATURAL position
 * is CORNER_LABEL_MARGIN above its own bar's top — so a taller bar's label
 * ends up higher on the canvas too, same as the bar itself (one value
 * driving both, same principle buildStateBar already uses for X/height).
 *
 * When before/after are close enough that their natural positions would
 * collide — the common case: a small ΔCI is the typical real TIA outcome —
 * both are pushed apart around their shared midpoint until
 * CORNER_LABEL_MIN_GAP separates them, WITHOUT changing which one ends up
 * on top. This matters because "before" and "after" are not fixed to a
 * particular row: whichever one currently has the higher CI_zone(weighted)
 * gets the higher label, in both directions (ΔCI positive OR negative) —
 * a fixed pair of Y positions only happens to read correctly in one
 * direction and silently misleads in the other (verified 2026-08-12 by
 * checking both before<after and before>after by hand before shipping this).
 */
function computeLabelPositions(beforeBar, afterBar) {
  const positions = {};
  if (beforeBar && afterBar) {
    const entries = [
      { key: 'before', naturalY: beforeBar.top - CORNER_LABEL_MARGIN },
      { key: 'after', naturalY: afterBar.top - CORNER_LABEL_MARGIN },
    ].sort((a, b) => a.naturalY - b.naturalY);
    const [higher, lower] = entries;
    if (lower.naturalY - higher.naturalY < CORNER_LABEL_MIN_GAP) {
      const mid = (higher.naturalY + lower.naturalY) / 2;
      positions[higher.key] = mid - CORNER_LABEL_MIN_GAP / 2;
      positions[lower.key] = mid + CORNER_LABEL_MIN_GAP / 2;
    } else {
      positions[higher.key] = higher.naturalY;
      positions[lower.key] = lower.naturalY;
    }
  } else if (beforeBar) {
    positions.before = beforeBar.top - CORNER_LABEL_MARGIN;
  } else if (afterBar) {
    positions.after = afterBar.top - CORNER_LABEL_MARGIN;
  }
  return positions;
}

/**
 * Draws one zone-state block: a solid-colour bar centred on valueToX(value),
 * with height valueToHeight(value) — one number drives both dimensions at
 * once, which is what makes the block visibly "move" along the spectral
 * scale AND change height as the zone's CI shifts. Replaces the old
 * buildOverlayBar (which spread a block across a min–max RANGE with an
 * internal gradient) — there is no range anymore, only the single
 * zone-level ciZoneWeighted number the server gives us, so a flat fill at
 * that one colour is the honest representation, not a gradient implying a
 * spread we don't have data for.
 *
 * Width is a proportion of the plot area (10% each side, ~20% of plotWidth
 * total), not a fixed pixel value — the earlier fixed 22px read as far too
 * thin against the ~450px plot, leaving the chart looking sparse (flagged
 * 2026-08-12). At the scale's extreme edges (value pinned near 0.25 or
 * 1.50) a bar this wide sits close to the Y-axis tick labels without quite
 * touching them — a known, accepted minor tradeoff, not addressed here.
 */
function buildStateBar(uid, id, value, opacity, defsOut) {
  const { baselineY, plotLeft, plotRight } = BAR_GEOMETRY;
  const halfWidth = (plotRight - plotLeft) * 0.10;
  const cx = valueToX(value);
  const x0 = cx - halfWidth, x1 = cx + halfWidth;
  const h = valueToHeight(value);
  const top = baselineY - h;
  const color = valueToHex(value);
  return {
    markup: `<rect id="${id}-${uid}" x="${x0.toFixed(2)}" y="${top.toFixed(2)}" width="${(x1 - x0).toFixed(2)}" height="${h.toFixed(2)}" fill="${color}" opacity="${opacity}"/>
      <line x1="${x0.toFixed(2)}" y1="${top.toFixed(2)}" x2="${x1.toFixed(2)}" y2="${top.toFixed(2)}" stroke="#fff" stroke-width="${opacity < 1 ? 0.5 : 1}" opacity="${opacity}"/>`,
    x0, x1, top, h, cx, value,
  };
}

// "before" stays as a small right-side reference, same legend column the
// old "could have been" text used — renamed, not moved. The "after" mean
// lives near the zone name (the headline number).
function buildBeforeLegend(beforeBar, beforeValue) {
  const { legendX, legendLineEndX } = BAR_GEOMETRY;
  const line1Y = beforeBar.top - 6.4;
  const line2Y = line1Y + 31.62;
  return `<line x1="${beforeBar.x1.toFixed(2)}" y1="${beforeBar.top.toFixed(2)}" x2="${legendLineEndX}" y2="${beforeBar.top.toFixed(2)}" stroke="#7c7b7b" stroke-width="0.5" stroke-dasharray="1,2"/>
    <text x="${legendX}" y="${line1Y.toFixed(2)}" font-size="11.5" fill="#999" font-family="Arial, sans-serif">before</text>
    <text x="${legendX}" y="${line2Y.toFixed(2)}" font-size="12" fill="#ccc" font-family="Arial, sans-serif">CI_zone ${beforeValue.toFixed(3)}</text>`;
}

// Faint secondary reference line at the "after" bar's own top height —
// ties the after value to the same right-side column, without a duplicate
// text label (the after value is already the prominent headline number).
function buildAfterReferenceLine(afterBar) {
  const { legendLineEndX } = BAR_GEOMETRY;
  return `<line x1="${afterBar.x1.toFixed(2)}" y1="${afterBar.top.toFixed(2)}" x2="${legendLineEndX}" y2="${afterBar.top.toFixed(2)}" stroke="#888" stroke-width="0.7" stroke-dasharray="1,2"/>`;
}

function buildResultsSummary(data) {
  const parts = [];
  if (data.ciZoneWeightedBefore !== undefined) parts.push(`before ${data.ciZoneWeightedBefore.toFixed(3)}`);
  if (data.ciZoneWeightedAfter !== undefined) parts.push(`after ${data.ciZoneWeightedAfter.toFixed(3)}`);
  if (!parts.length) return '';
  const cx = (BAR_GEOMETRY.plotLeft + BAR_GEOMETRY.plotRight) / 2;
  let out = `<text x="${cx.toFixed(2)}" y="${BAR_GEOMETRY.footerY + 45}" text-anchor="middle" font-size="11.5" fill="#c8c8c8" font-family="Arial, sans-serif">${parts.join('   →   ')}</text>`;
  if (data.deltaCIWeighted !== undefined) {
    const sign = data.deltaCIWeighted >= 0 ? '+' : '';
    const decisionSuffix = data.decision ? `  —  ${data.decision}` : '';
    out += `<text x="${cx.toFixed(2)}" y="${BAR_GEOMETRY.footerY + 65}" text-anchor="middle" font-size="11" fill="#aaa" font-family="Arial, sans-serif">ΔCI_zone ${sign}${data.deltaCIWeighted.toFixed(3)}${decisionSuffix}</text>`;
  }
  return out;
}

// Vertical axis + horizontal gridlines, matching the reference file:
// ticks at 0.25 through 1.50 sit on the real linear scale (baselineY down
// to maxBarHeight above it); an extra "0" tick is placed at the spectrum
// bar's own y (barTop) purely for context — it's not on the same linear
// spacing as the rest, it just visually ties the axis to the reference
// bar below.
function buildYAxis() {
  const { plotLeft, plotRight, baselineY, barTop, scaleMin, scaleMax } = BAR_GEOMETRY;
  const axisTopY = baselineY - valueToHeight(scaleMax);
  const axisX = 101.3;
  let out = `<line x1="${axisX}" y1="${barTop}" x2="${axisX}" y2="${axisTopY.toFixed(2)}" stroke="#555" stroke-width="0.7"/>`;
  // contextual "0" tick, aligned with the spectrum bar
  out += `<line x1="96.4" y1="${barTop}" x2="100.4" y2="${barTop}" stroke="#555" stroke-width="0.7"/>
    <text x="88.99" y="${barTop}" text-anchor="end" font-size="8" fill="#9b9a9a" font-family="Helvetica, Arial, sans-serif">0</text>`;
  for (let v = scaleMin; v <= scaleMax + 1e-9; v += 0.25) {
    const y = baselineY - valueToHeight(v);
    out += `<line x1="96.4" y1="${y.toFixed(2)}" x2="100.4" y2="${y.toFixed(2)}" stroke="#555" stroke-width="0.7"/>`;
    out += `<text x="77.87" y="${(y + 3).toFixed(2)}" text-anchor="end" font-size="8" fill="#9b9a9a" font-family="Helvetica, Arial, sans-serif">${v.toFixed(2)}</text>`;
    // horizontal gridline across the plot at this same height
    out += `<line x1="${plotLeft - 12}" y1="${y.toFixed(2)}" x2="${plotRight}" y2="${y.toFixed(2)}" stroke="#444" stroke-width="0.4252"/>`;
  }
  // gridline for the contextual "0" row too
  out += `<line x1="${plotLeft - 12}" y1="${barTop}" x2="${plotRight}" y2="${barTop}" stroke="#444" stroke-width="0.4252"/>`;
  return out;
}

function buildSVG(uid, data) {
  const vbW = BAR_GEOMETRY.viewBoxWidth, vbH = BAR_GEOMETRY.viewBoxHeight;
  const zoneName = data.zoneName || '';
  const zoneIdLabel = data.zoneIdLabel || '';
  const defsOut = [];

  let beforeBar = null, afterBar = null, bars = '', beforeLegend = '', afterRefLine = '';
  const hasBefore = data.ciZoneWeightedBefore !== undefined;
  const hasAfter = data.ciZoneWeightedAfter !== undefined;

  if (hasBefore) beforeBar = buildStateBar(uid, 'tiabar-before', data.ciZoneWeightedBefore, 0.45, defsOut);
  if (hasAfter) afterBar = buildStateBar(uid, 'tiabar-after', data.ciZoneWeightedAfter, 0.71, defsOut);
  const labelY = computeLabelPositions(beforeBar, afterBar);

  if (beforeBar) {
    bars += beforeBar.markup;
    bars += buildCornerLabel(beforeBar.cx, beforeBar.top, labelY.before) + buildCornerValue(beforeBar.cx, labelY.before, data.ciZoneWeightedBefore, {});
    beforeLegend = buildBeforeLegend(beforeBar, data.ciZoneWeightedBefore);
  }
  if (afterBar) {
    bars += buildCornerLabel(afterBar.cx, afterBar.top, labelY.after) + buildCornerValue(afterBar.cx, labelY.after, data.ciZoneWeightedAfter, { bold: true });
    bars += afterBar.markup;
    if (beforeBar) afterRefLine = buildAfterReferenceLine(afterBar);
  }

  const headlineBar = afterBar || beforeBar;
  const zoneNameCx = headlineBar ? headlineBar.cx : (BAR_GEOMETRY.plotLeft + BAR_GEOMETRY.plotRight) / 2;
  const spectrum = buildSpectrumBar(uid, defsOut);
  const meanForCategory = hasAfter ? data.ciZoneWeightedAfter : (hasBefore ? data.ciZoneWeightedBefore : undefined);
  const currentLabel = hasAfter
    ? `<text x="${zoneNameCx.toFixed(2)}" y="${BAR_GEOMETRY.currentLabelY}" text-anchor="middle" font-size="12" fill="#fff" font-family="Arial, sans-serif">CI_zone (after) ${data.ciZoneWeightedAfter.toFixed(3)}</text>`
    : '';

  return `<svg viewBox="0 0 ${vbW} ${vbH}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
    <defs>${defsOut.join('')}</defs>
    <rect width="${vbW}" height="${vbH}" fill="#111111"/>
    <text x="${BAR_GEOMETRY.titleX}" y="${BAR_GEOMETRY.titleY}" font-size="39.685" fill="#e5e5e5" font-family="Arial, sans-serif">TIA</text>
    <text x="${BAR_GEOMETRY.titleX}" y="${BAR_GEOMETRY.subtitleY}" font-size="17.0079" fill="#fff" font-family="Arial, sans-serif">Temporis Impact Assessment</text>
    <text x="${zoneNameCx.toFixed(2)}" y="${BAR_GEOMETRY.zoneNameY}" text-anchor="middle" font-size="17.0079" fill="#fff" font-family="Arial, sans-serif">${zoneName}</text>
    <text x="${zoneNameCx.toFixed(2)}" y="${BAR_GEOMETRY.zoneIdY}" text-anchor="middle" font-size="11" fill="#fff" font-family="Arial, sans-serif">${zoneIdLabel}</text>
    ${currentLabel}
    <line x1="${BAR_GEOMETRY.plotLeft}" y1="${BAR_GEOMETRY.baselineY}" x2="${BAR_GEOMETRY.plotRight}" y2="${BAR_GEOMETRY.baselineY}" stroke="#333" stroke-width="1"/>
    ${buildYAxis()}
    ${bars}
    ${afterRefLine}
    ${beforeLegend}
    ${buildCategoryRow(meanForCategory)}
    ${spectrum}
    <text x="${((BAR_GEOMETRY.plotLeft + BAR_GEOMETRY.plotRight) / 2).toFixed(2)}" y="${(BAR_GEOMETRY.tickLabelY + 24).toFixed(2)}" text-anchor="middle" font-size="11.34" letter-spacing="3" fill="#9b9a9a" font-family="Arial, sans-serif">CHRONITY INDEX (WEIGHTED)   -   SPECTRAL SCALE</text>
    ${buildResultsSummary(data)}
  </svg>`;
}

let stylesInjected = false;
function injectGlobalStyles() {
  if (stylesInjected) return;
  stylesInjected = true;
  const style = document.createElement('style');
  style.textContent = `.tiabar-root { position: relative; }`;
  document.head.appendChild(style);
}

const instances = new Map();

/**
 * renderTIABar(containerId, data)
 * data = {
 *   zoneName, zoneIdLabel,
 *   ciZoneWeightedBefore,   // zone CI(weighted) before the scenario —
 *                           // handleComputeTIA's ciZoneWeightedBefore, verbatim
 *   ciZoneWeightedAfter,    // zone CI(weighted) after the scenario —
 *                           // handleComputeTIA's ciZoneWeightedAfter, verbatim
 *   deltaCIWeighted,        // handleComputeTIA's deltaCIWeighted, verbatim
 *   decision,               // handleComputeTIA's decision string, verbatim
 * }
 * All four scenario fields are optional independently — omit
 * ciZoneWeightedBefore for a plain "current state, no scenario" snapshot
 * (draws only the after bar), or pass only ciZoneWeightedBefore for a
 * "before we intervene" preview. A response straight from computeTIA can be
 * passed through with just zoneName/zoneIdLabel added — no adapter needed.
 */
export function renderTIABar(containerId, data) {
  injectGlobalStyles();
  const container = document.getElementById(containerId);
  if (!container) { console.error(`tia-bar: no element #${containerId}`); return; }
  container.classList.add('tiabar-root');
  const uid = containerId + '-' + Math.random().toString(36).slice(2, 8);
  container.innerHTML = buildSVG(uid, data);
  instances.set(containerId, { uid, data });
}

export function updateTIABar(containerId, data) {
  renderTIABar(containerId, data);
}
