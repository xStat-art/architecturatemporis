/**
 * tia-bar.js
 * ─────────────────────────────────────────────────────────────────────────
 * Vanilla ES6 module. Overlay bar chart for zone chronity + TIA impact.
 *
 * CONCEPT (Sergei's, from chat): each zone state is a rectangle whose
 * WIDTH is its min–max chronity range (coloured on the spectral scale)
 * and whose HEIGHT is its mean. Two states share one X axis:
 *   - "without outlier" (hypothetical/potential) — drawn behind, at
 *     reduced opacity
 *   - "with outlier" (the zone's real, current state) — drawn in front,
 *     fully opaque, and reads as both WIDER (the outlier drags the low
 *     edge of the range down) and SHORTER (the outlier drags the mean
 *     down) than the ghost behind it
 * Both effects are visible in one shape at once — this is the answer to
 * "on the map, one bad object visibly distorts the whole gradient
 * pattern — how do we show that here, where there's no map to distort?"
 * A 1D bar can't show spatial distortion, but it CAN show the same object
 * distorting the zone's aggregate shape (wider + shorter), which is the
 * same underlying fact the map's visual dent is standing in for.
 *
 * Earlier versions of this file (see prior chat) used a single spectral
 * bar with a separate grey "impact" block floating next to it, connected
 * by an arrow. That's gone — this replaces it, not extends it.
 * ─────────────────────────────────────────────────────────────────────────
 */

export const BAR_GEOMETRY = {
  viewBoxWidth: 760,
  viewBoxHeight: 610,   // was 580 — the reference file's footer text sits at y=590, so 580 was clipping it
  scaleMin: 0.25,
  scaleMax: 1.50,
  plotLeft: 122.4,
  plotRight: 574.1,
  legendX: 606,          // right-side column, "could have been" reference
  legendLineEndX: 687.3,
  baselineY: 420,
  maxBarHeight: 190,
  barTop: 452,
  barHeight: 15,
  categoryLabelY: 440,
  tickLabelY: 483,
  footerY: 507,
  cornerLabelY: 210,
  titleX: 75.54,
  titleY: 42,      // was 24.23 — at 39.685px font, the ascenders reached above y=0 and got clipped by the viewBox edge
  subtitleY: 64.69,
  zoneNameY: 117.17,
  zoneIdY: 133.17,
  currentLabelY: 152.39,
};

export const CATEGORIES = [
  { key: 'anxious', label: 'Anxious', lo: 0.25, hi: 0.50 },
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

function buildCornerLabel(x, shapeTopY) {
  const y = BAR_GEOMETRY.cornerLabelY;
  return `<line x1="${x.toFixed(2)}" y1="${y + 10}" x2="${x.toFixed(2)}" y2="${shapeTopY.toFixed(2)}" stroke="#666" stroke-width="0.5" stroke-dasharray="1,2"/>`;
}
function buildCornerValue(x, value, opts) {
  const { bold } = opts || {};
  return `<text x="${x.toFixed(2)}" y="${BAR_GEOMETRY.cornerLabelY}" text-anchor="middle" font-size="12" font-weight="${bold ? '700' : '400'}" fill="${bold ? '#fff' : '#ccc'}" font-family="Arial, sans-serif">${value.toFixed(3)}</text>`;
}

function buildOverlayBar(uid, id, range, opacity, defsOut) {
  const { baselineY } = BAR_GEOMETRY;
  const x0 = valueToX(range.min), x1 = valueToX(range.max);
  const h = valueToHeight(range.mean);
  const top = baselineY - h;
  const gradId = `${id}-grad-${uid}`;
  defsOut.push(buildGradientDef(gradId, x0, x1, top, top,
    t => valueToHex(range.min + t * (range.max - range.min))));
  return {
    markup: `<rect id="${id}-${uid}" x="${x0.toFixed(2)}" y="${top.toFixed(2)}" width="${Math.max(2, x1 - x0).toFixed(2)}" height="${h.toFixed(2)}" fill="url(#${gradId})" opacity="${opacity}"/>
      <line x1="${x0.toFixed(2)}" y1="${top.toFixed(2)}" x2="${x1.toFixed(2)}" y2="${top.toFixed(2)}" stroke="#fff" stroke-width="${opacity < 1 ? 0.5 : 1}" opacity="${opacity}"/>`,
    x0, x1, top, h,
  };
}

// The "current" state is no longer a plain rectangle. Per Sergei: its
// WIDTH should match the "normal" (non-outlier) range — same as the ghost
// behind it — and the outlier's own contribution becomes a separate strip
// attached to the main block's left edge, stepping DOWN to the outlier's
// own real height rather than being folded into one uniform bar. One
// connected silhouette: tall block for the zone, short step where the
// outlier sits, joined at the seam.
//
// EVERY boundary value gets a number at the fixed label row (min, max,
// and the outlier's own low value) — leaving any edge unlabelled reads as
// "this width was picked arbitrarily", which is exactly what Sergei
// flagged. Ghost's own min/max already cover the main block's left/right
// edges (they're the same x — normal range on both), so only the strip's
// own left edge needs a label the ghost doesn't already provide.
function buildCurrentStepShape(uid, withAnomaly, withoutAnomaly, tia, opacity, defsOut) {
  const { baselineY } = BAR_GEOMETRY;
  const strokeOpacity = 0.75; // reference file uses a slightly different stroke vs fill opacity
  const mainX0 = valueToX(withoutAnomaly.min), mainX1 = valueToX(withAnomaly.max);
  const mainH = valueToHeight(withAnomaly.mean);
  const mainTop = baselineY - mainH;
  const mainGradId = `tiabar-current-main-grad-${uid}`;
  defsOut.push(buildGradientDef(mainGradId, mainX0, mainX1, mainTop, mainTop,
    t => valueToHex(withoutAnomaly.min + t * (withAnomaly.max - withoutAnomaly.min))));
  let markup = `<rect x="${mainX0.toFixed(2)}" y="${mainTop.toFixed(2)}" width="${Math.max(2, mainX1 - mainX0).toFixed(2)}" height="${mainH.toFixed(2)}" fill="url(#${mainGradId})" opacity="${opacity}"/>
    <line x1="${mainX0.toFixed(2)}" y1="${mainTop.toFixed(2)}" x2="${mainX1.toFixed(2)}" y2="${mainTop.toFixed(2)}" stroke="#fff" stroke-width="0.7" opacity="${strokeOpacity}"/>`;

  let stripX0 = mainX0;
  if (tia) {
    const stripX0v = Math.min(tia.ciWeighted, withoutAnomaly.min);
    stripX0 = valueToX(stripX0v);
    const stripH = valueToHeight(tia.ciWeighted);
    const stripTop = baselineY - stripH;
    const stripGradId = `tiabar-current-strip-grad-${uid}`;
    defsOut.push(buildGradientDef(stripGradId, stripX0, mainX0, stripTop, stripTop,
      t => valueToHex(stripX0v + t * (withoutAnomaly.min - stripX0v))));
    markup += `<rect x="${stripX0.toFixed(2)}" y="${stripTop.toFixed(2)}" width="${Math.max(2, mainX0 - stripX0).toFixed(2)}" height="${stripH.toFixed(2)}" fill="url(#${stripGradId})" opacity="${opacity}"/>
      <line x1="${stripX0.toFixed(2)}" y1="${stripTop.toFixed(2)}" x2="${mainX0.toFixed(2)}" y2="${stripTop.toFixed(2)}" stroke="#fff" stroke-width="0.7" opacity="${strokeOpacity}"/>
      <line x1="${mainX0.toFixed(2)}" y1="${stripTop.toFixed(2)}" x2="${mainX0.toFixed(2)}" y2="${mainTop.toFixed(2)}" stroke="#fff" stroke-width="0.7" opacity="${strokeOpacity}"/>`;
    markup += `<text x="${((stripX0 + mainX0) / 2).toFixed(2)}" y="${(stripTop - 8).toFixed(2)}" text-anchor="middle" font-size="9.5" fill="#ccc" font-family="Arial, sans-serif">${tia.targetName || 'outlier'}</text>`;
    markup += buildCornerLabel(stripX0, stripTop) + buildCornerValue(stripX0, stripX0v, {});
  }

  return { markup, x0: stripX0, x1: mainX1, top: mainTop, h: mainH };
}

// "could have been" stays as a small right-side reference; the "current"
// mean moved up near the zone name (it's the headline number — promoted
// to a more prominent spot, per Sergei's reference file).
function buildGhostLegend(withoutBar, withoutAnomaly) {
  const { legendX, legendLineEndX } = BAR_GEOMETRY;
  const line1Y = withoutBar.top - 6.4;
  const line2Y = line1Y + 31.62;
  return `<line x1="${withoutBar.x1.toFixed(2)}" y1="${withoutBar.top.toFixed(2)}" x2="${legendLineEndX}" y2="${withoutBar.top.toFixed(2)}" stroke="#7c7b7b" stroke-width="0.5" stroke-dasharray="1,2"/>
    <text x="${legendX}" y="${line1Y.toFixed(2)}" font-size="11.5" fill="#999" font-family="Arial, sans-serif">could have been</text>
    <text x="${legendX}" y="${line2Y.toFixed(2)}" font-size="12" fill="#ccc" font-family="Arial, sans-serif">mean ${withoutAnomaly.mean.toFixed(3)}</text>`;
}

// Faint secondary reference line at the current bar's own top height —
// present in the reference file even though the "current" text label
// itself now lives up near the zone name, not next to this line.
function buildCurrentReferenceLine(withBar) {
  const { legendLineEndX } = BAR_GEOMETRY;
  return `<line x1="${withBar.x1.toFixed(2)}" y1="${withBar.top.toFixed(2)}" x2="${legendLineEndX}" y2="${withBar.top.toFixed(2)}" stroke="#888" stroke-width="0.7" stroke-dasharray="1,2"/>`;
}



function buildResultsSummary(data) {
  const parts = [];
  if (data.withAnomaly) {
    parts.push(`current range: ${data.withAnomaly.min.toFixed(3)} \u2013 ${data.withAnomaly.max.toFixed(3)}, mean ${data.withAnomaly.mean.toFixed(3)}`);
  }
  if (data.withoutAnomaly) {
    parts.push(`without outlier: ${data.withoutAnomaly.min.toFixed(3)} \u2013 ${data.withoutAnomaly.max.toFixed(3)}, mean ${data.withoutAnomaly.mean.toFixed(3)}`);
  }
  if (!parts.length) return '';
  const cx = (BAR_GEOMETRY.plotLeft + BAR_GEOMETRY.plotRight) / 2;
  let out = `<text x="${cx.toFixed(2)}" y="${BAR_GEOMETRY.footerY + 45}" text-anchor="middle" font-size="11.5" fill="#c8c8c8" font-family="Arial, sans-serif">${parts.join('   \u00b7   ')}</text>`;
  if (data.tia && data.tia.targetName) {
    const magnitude = Math.abs(data.tia.deltaCIWeighted).toFixed(3);
    out += `<text x="${cx.toFixed(2)}" y="${BAR_GEOMETRY.footerY + 65}" text-anchor="middle" font-size="11" fill="#aaa" font-family="Arial, sans-serif">${data.tia.targetName} (CI ${data.tia.ciWeighted.toFixed(3)}) pulls the zone mean down by ${magnitude}</text>`;
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

  let withoutBar = null, withBar = null, bars = '', ghostLegend = '', currentRefLine = '';
  if (data.withoutAnomaly) {
    withoutBar = buildOverlayBar(uid, 'tiabar-ghost', data.withoutAnomaly, 0.45, defsOut);
    bars += withoutBar.markup;
    // Every boundary gets a number — leaving the ghost's own min/max
    // unlabelled was exactly what made the width look arbitrary.
    bars += buildCornerLabel(withoutBar.x0, withoutBar.top) + buildCornerValue(withoutBar.x0, data.withoutAnomaly.min, {});
    bars += buildCornerLabel(withoutBar.x1, withoutBar.top) + buildCornerValue(withoutBar.x1, data.withoutAnomaly.max, { bold: true });
    ghostLegend = buildGhostLegend(withoutBar, data.withoutAnomaly);
  }
  if (data.withAnomaly && data.withoutAnomaly) {
    withBar = buildCurrentStepShape(uid, data.withAnomaly, data.withoutAnomaly, data.tia, 0.71, defsOut);
    bars += withBar.markup;
    currentRefLine = buildCurrentReferenceLine(withBar);
  } else if (data.withAnomaly) {
    withBar = buildOverlayBar(uid, 'tiabar-real', data.withAnomaly, 0.71, defsOut);
    bars += buildCornerLabel(withBar.x0, withBar.top) + buildCornerValue(withBar.x0, data.withAnomaly.min, {});
    bars += buildCornerLabel(withBar.x1, withBar.top) + buildCornerValue(withBar.x1, data.withAnomaly.max, { bold: true });
    bars += withBar.markup;
  }

  const zoneNameCx = withBar ? (withBar.x0 + withBar.x1) / 2 : (BAR_GEOMETRY.plotLeft + BAR_GEOMETRY.plotRight) / 2;
  const spectrum = buildSpectrumBar(uid, defsOut);
  const meanForCategory = data.withAnomaly ? data.withAnomaly.mean : undefined;
  const currentLabel = data.withAnomaly
    ? `<text x="${zoneNameCx.toFixed(2)}" y="${BAR_GEOMETRY.currentLabelY}" text-anchor="middle" font-size="12" fill="#fff" font-family="Arial, sans-serif">Current mean ${data.withAnomaly.mean.toFixed(3)}</text>`
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
    ${currentRefLine}
    ${ghostLegend}
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
 *   withAnomaly:    { min, max, mean },  // the zone's real state: ALL
 *     // measured objects, including the flagged low outlier
 *   withoutAnomaly: { min, max, mean },  // the zone's real state if the
 *     // outlier had never been measured: min/max/mean computed over the
 *     // REMAINING objects only — a strict statistic, not an illustrative
 *     // guess. (An earlier version of this file widened this range for
 *     // visual effect; that was a misreading — Sergei's actual point is
 *     // simpler: 8 objects give one real number, adding the 9th (low)
 *     // object pulls it down, and THAT real difference is what the chart
 *     // shows. Widening this range artificially shrinks the outlier's own
 *     // step in buildCurrentStepShape almost to nothing, which is exactly
 *     // the bug that prompted this correction.)
 *   tia: { targetName, ciWeighted, deltaCIWeighted },
 * }
 */
/**
 * computeZoneStats(objects, thresholdFraction = 0.9)
 *
 * Takes the zone's raw measured objects and derives everything renderTIABar
 * needs — no more hand-typed min/max/mean, which is exactly how the wrong
 * "illustrative" numbers snuck in earlier in this file's history.
 *
 * objects: [{ name, ciRaw, psm }]  (psm defaults to 1.0 if omitted)
 * thresholdFraction: an object is flagged as the outlier if its CI_raw
 *   falls below (thresholdFraction × the zone's simple CI_raw mean) — the
 *   same "-10% of the current mean" rule from the TIA methodology
 *   (thresholdFraction 0.9 = 10% below).
 *
 * Returns { withAnomaly, withoutAnomaly, tia } ready to spread into
 * renderTIABar's data object, or null in `tia` if nothing crosses the
 * threshold (no outlier to flag).
 */
export function computeZoneStats(objects, thresholdFraction = 0.9) {
  const weighted = objects.map(o => ({ name: o.name, ciRaw: o.ciRaw, w: o.ciRaw * (o.psm !== undefined ? o.psm : 1.0) }));
  const stat = list => ({
    min: Math.min(...list.map(o => o.w)),
    max: Math.max(...list.map(o => o.w)),
    mean: list.reduce((s, o) => s + o.w, 0) / list.length,
  });

  const withAnomaly = stat(weighted);

  const meanCiRaw = objects.reduce((s, o) => s + o.ciRaw, 0) / objects.length;
  const threshold = meanCiRaw * thresholdFraction;
  const flagged = weighted.filter(o => o.ciRaw < threshold).sort((a, b) => a.ciRaw - b.ciRaw)[0];

  if (!flagged) return { withAnomaly, withoutAnomaly: withAnomaly, tia: null };

  const remaining = weighted.filter(o => o.name !== flagged.name);
  const withoutAnomaly = stat(remaining);
  const tia = {
    targetName: flagged.name,
    ciWeighted: flagged.w,
    deltaCIWeighted: withAnomaly.mean - withoutAnomaly.mean, // negative: the outlier pulls the current mean down from what it'd be without it
  };
  return { withAnomaly, withoutAnomaly, tia };
}

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
