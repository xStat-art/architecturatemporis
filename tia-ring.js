/**
 * tia-ring.js
 * ─────────────────────────────────────────────────────────────────────────
 * Vanilla ES6 module. Renders the TIA Chronity Ring (approved design:
 * TIA_Ring_Black.svg) into any container, for any zone, with hover
 * highlighting, tooltips, and an animated TIA arrow.
 *
 * WHAT IS AND ISN'T REGENERATED
 * The ring wedges, compass arrows, leader/spoke lines, the curved category
 * name+range labels, and the two Mean/Min-Max connector arcs are the
 * ORIGINAL markup from TIA_Ring_Black.svg — copied verbatim (paths,
 * per-letter transforms, colours) and never rewritten or re-derived. That
 * is a deliberate constraint from the brief: "не переписывай геометрию".
 *
 * Two pieces are genuinely dynamic, because they are what actually differs
 * from zone to zone:
 *   1. The TIA gradient arrow + its radial spoke line. Original shape,
 *      unchanged — but wrapped in a <g> that gets CSS-rotated around the
 *      ring centre to point at wherever the zone's post-scenario CI lands.
 *      Rotating a rigid group preserves the exact original artwork; it does
 *      not redraw it.
 *   2. Zone name / Zone_ID (centre) and the plain, non-curved "before"/
 *      "after" numbers — simple text-content swaps, geometry and position
 *      untouched.
 * "Mean now 0.789" is NOT swapped: those digits are individually
 * positioned+rotated letters baked by Illustrator's type-on-path export.
 * There is no safe way to change the digits without recomputing each
 * letter's transform — which is exactly the geometry rewrite the brief
 * forbids. If Mean needs to be dynamic, flag it and I'll add a proper
 * per-letter layout function (a real, separate piece of work).
 *
 * DATA SOURCE (v8.4): reconnected to the real backend. The ring no longer
 * computes or flags any single "outlier" object (the old data.tia =
 * {targetName, ciWeighted, angle, deltaCIWeighted} shape is gone) —
 * everything driving the arrow, the thickened wedges, and the Mean label
 * now comes straight from handleComputeTIA's response: ciZoneWeightedBefore,
 * ciZoneWeightedAfter, deltaCIWeighted, decision. This matches
 * scenario.modify's actual shape (ACAP_AppsScript_v8_1.gs, applyTiaScenario):
 * it's a single flat patch per object per request, accumulated by the
 * caller before sending — by the time a response comes back, all this file
 * ever sees is one before/after pair for the whole zone, regardless of how
 * many objects a scenario actually touched. The ring shows that zone-level
 * shift, not any particular object.
 *
 * RESOLVED, formerly "OPEN QUESTION": the original TIA_Ring_Black.svg
 * baked artwork genuinely does label both "High Chronity" and "Deep
 * Chronity" with the same "1.05 - 1.25" range (confirmed 2026-08-12 by
 * reading the raw SVG's per-letter tspans directly) — that bug is real in
 * the static source file. It does NOT reach the screen, though: category
 * labels are generated at runtime by buildCategoryLabelsSVG() from
 * RING_CATEGORIES below, which already gives Deep its own distinct
 * 1.25–1.50 range. No code change needed here; this note replaces the
 * stale "pending confirmation" one so it stops reading as still-open.
 * ─────────────────────────────────────────────────────────────────────────
 */

// ── Geometry, measured directly off TIA_Ring_Black.svg (580×580 viewBox) ──
export const RING_GEOMETRY = {
  viewBox: 580,
  cx: 278.4,
  cy: 303.42,
  rInner: 129,
  rOuterThin: 167,
  rOuterThick: 174,
  // the TIA spoke/arrow group's own artwork was drawn pointing at this
  // angle (0°=12 o'clock, clockwise) — rotating the group by
  // (targetAngle - defaultAngle) points it anywhere else
  defaultTiaAngle: 71.5,
};

// Five fixed 72° slots (label text baked verbatim in the SVG). Kept here
// too, as plain data, so hover tooltips can report "which category + what
// value" without re-parsing the SVG at runtime.
export const RING_CATEGORIES = [
  { key: 'anxious', label: 'Anxious',          lo: 0.20, hi: 0.50, a0: 0,   a1: 72  },
  { key: 'low',      label: 'Low Chronity',     lo: 0.50, hi: 0.80, a0: 72,  a1: 144 },
  { key: 'moderate', label: 'Moderate Chronity',lo: 0.80, hi: 1.05, a0: 144, a1: 216 },
  { key: 'high',     label: 'High Chronity',    lo: 1.05, hi: 1.25, a0: 216, a1: 288 },
  { key: 'deep',     label: 'Deep Chronity',    lo: 1.25, hi: 1.50, a0: 288, a1: 360 },
];

// angle (0=12 o'clock, clockwise) -> {category, value}, used for sector
// tooltips. Linear interpolation across each category's own labelled range.
function angleToReading(angleDeg) {
  const a = ((angleDeg % 360) + 360) % 360;
  const cat = RING_CATEGORIES.find(c => a >= c.a0 && a < c.a1) || RING_CATEGORIES[RING_CATEGORIES.length - 1];
  const frac = (a - cat.a0) / (cat.a1 - cat.a0);
  const value = cat.lo + frac * (cat.hi - cat.lo);
  return { category: cat.label, value };
}

// value -> angle (inverse of the above), used to aim the TIA arrow and to
// place any future data-driven marks on the same scale the labels use.
export function valueToAngle(value) {
  const cat = RING_CATEGORIES.find(c => value >= c.lo && value < c.hi) || RING_CATEGORIES[RING_CATEGORIES.length - 1];
  const frac = (value - cat.lo) / (cat.hi - cat.lo);
  return cat.a0 + frac * (cat.a1 - cat.a0);
}

// Every ring wedge's exact angular span (measured off the source paths),
// so each <path> can carry a data-angle-mid attribute for tooltips without
// re-parsing any geometry at runtime.
const WEDGE_SPANS = [
  {cls:"cls-25", a0:0.5, a1:71.2},{cls:"cls-3", a0:71.2, a1:78.5},{cls:"cls-34", a0:78.4, a1:85.7},
  {cls:"cls-37", a0:85.5, a1:92.9},{cls:"cls-41", a0:92.8, a1:100.1},{cls:"cls-2", a0:100.0, a1:107.3},
  {cls:"cls-21", a0:107.2, a1:114.6},{cls:"cls-18", a0:114.5, a1:121.8},{cls:"cls-15", a0:121.7, a1:129.0},
  {cls:"cls-28", a0:129.0, a1:136.4},{cls:"cls-29", a0:136.3, a1:143.6},{cls:"cls-16", a0:143.3, a1:158.0},
  {cls:"cls-35", a0:157.9, a1:172.6},{cls:"cls-1", a0:172.5, a1:187.2},{cls:"cls-40", a0:187.2, a1:201.8},
  {cls:"cls-19", a0:201.8, a1:216.5},{cls:"cls-10", a0:216.4, a1:240.6},{cls:"cls-20", a0:240.6, a1:264.7},
  {cls:"cls-27", a0:264.6, a1:288.7},{cls:"cls-17", a0:288.6, a1:295.9},{cls:"cls-4", a0:295.8, a1:303.1},
  {cls:"cls-31", a0:302.9, a1:310.2},{cls:"cls-30", a0:310.1, a1:317.4},{cls:"cls-36", a0:317.3, a1:324.5},
  {cls:"cls-24", a0:324.4, a1:331.6},{cls:"cls-23", a0:331.5, a1:338.7},{cls:"cls-22", a0:338.7, a1:345.8},
  {cls:"cls-38", a0:345.8, a1:352.9},
];

// class -> hex, read straight off the source file's own <style> block (see
// STYLE_BLOCK below) so the spectral colours never drift from it.
const WEDGE_COLORS = {
  "cls-25":"#ffa300","cls-3":"#f2a60d","cls-34":"#d9ac26","cls-37":"#bfb140","cls-41":"#a6b759",
  "cls-2":"#8cbd73","cls-21":"#73c28c","cls-18":"#59c8a6","cls-15":"#40cebf","cls-28":"#26d3d9",
  "cls-29":"#0dd9f2","cls-16":"#00dcff","cls-35":"#00b2ff","cls-1":"#009dff","cls-40":"#006fff",
  "cls-19":"#0069ff","cls-10":"#0049ff","cls-20":"#0013ff","cls-27":"#1d00ff","cls-17":"#2200fb",
  "cls-4":"#2c00f4","cls-31":"#3600ec","cls-30":"#4100e5","cls-36":"#4b00de","cls-24":"#5500d6",
  "cls-23":"#5f00cf","cls-22":"#6a00c8","cls-38":"#7400c0",
};

// ── Static markup, verbatim from TIA_Ring_Black.svg ────────────────────────
const STYLE_BLOCK = `
      .cls-1 {
        fill: #009dff;
      }

      .cls-2 {
        fill: #8cbd73;
      }

      .cls-3 {
        fill: #f2a60d;
      }

      .cls-4 {
        fill: #2c00f4;
      }

      .cls-5 {
        fill: #c6c6c6;
        font-size: 34.02px;
      }

      .cls-5, .cls-6, .cls-7, .cls-8 {
        font-family: ArialMT, Arial;
      }

      .cls-5, .cls-9, .cls-7, .cls-8 {
        isolation: isolate;
      }

      .cls-10 {
        fill: #0049ff;
      }

      .cls-11 {
        stroke: #4f4f4f;
        stroke-width: .27px;
      }

      .cls-11, .cls-12, .cls-13, .cls-14 {
        fill: none;
      }

      .cls-15 {
        fill: #40cebf;
      }

      .cls-16 {
        fill: #00dcff;
      }

      .cls-17 {
        fill: #2200fb;
      }

      .cls-18 {
        fill: #59c8a6;
      }

      .cls-19 {
        fill: #0069ff;
      }

      .cls-20 {
        fill: #0013ff;
      }

      .cls-21 {
        fill: #73c28c;
      }

      .cls-22 {
        fill: #6a00c8;
      }

      .cls-23 {
        fill: #5f00cf;
      }

      .cls-24 {
        fill: #5500d6;
      }

      .cls-25 {
        fill: #ffa300;
      }

      .cls-6, .cls-26 {
        font-size: 12px;
      }

      .cls-27 {
        fill: #1d00ff;
      }

      .cls-28 {
        fill: #26d3d9;
      }

      .cls-29 {
        fill: #0dd9f2;
      }

      .cls-30 {
        fill: #4100e5;
      }

      .cls-31 {
        fill: #3600ec;
      }

      .cls-9 {
        fill: url(#linear-gradient);
        opacity: .49;
      }

      .cls-7 {
        font-size: 14.17px;
      }

      .cls-7, .cls-8 {
        fill: #fff;
      }

      .cls-26, .cls-32 {
        fill: #9b9a9a;
        font-family: MyriadPro-Regular, 'Myriad Pro';
      }

      .cls-33 {
        letter-spacing: -.06em;
      }

      .cls-34 {
        fill: #d9ac26;
      }

      .cls-12 {
        stroke: #9e9e9e;
        stroke-width: .43px;
      }

      .cls-35 {
        fill: #00b2ff;
      }

      .cls-36 {
        fill: #4b00de;
      }

      .cls-13 {
        stroke: #fff;
      }

      .cls-13, .cls-14 {
        stroke-miterlimit: 10;
        stroke-width: .71px;
      }

      .cls-37 {
        fill: #bfb140;
      }

      .cls-14 {
        stroke: #7f7f7f;
      }

      .cls-38 {
        fill: #7400c0;
      }

      .cls-39 {
        fill: #7f7f7f;
      }

      .cls-8 {
        font-size: 25.51px;
      }

      .cls-40 {
        fill: #006fff;
      }

      .cls-32 {
        font-size: 9.92px;
      }

      .cls-41 {
        fill: #a6b759;
      }
    `;
const GRADIENT_DEF = `<linearGradient id="linear-gradient" x1="417.85" y1="459.96" x2="503.53" y2="312.79" gradientTransform="translate(0 582) scale(1 -1)" gradientUnits="userSpaceOnUse">
      <stop offset=".05" stop-color="#fff"/>
      <stop offset=".27" stop-color="#fcfcfc" stop-opacity=".77"/>
      <stop offset=".41" stop-color="#f4f4f4" stop-opacity=".63"/>
      <stop offset=".52" stop-color="#e5e5e5" stop-opacity=".51"/>
      <stop offset=".62" stop-color="#d1d1d1" stop-opacity=".41"/>
      <stop offset=".71" stop-color="#b6b6b6" stop-opacity=".32"/>
      <stop offset=".8" stop-color="#969696" stop-opacity=".23"/>
      <stop offset=".88" stop-color="#6f6f6f" stop-opacity=".14"/>
      <stop offset=".96" stop-color="#434343" stop-opacity=".06"/>
      <stop offset="1" stop-color="#262626" stop-opacity=".02"/>
    </linearGradient>`;
const TIA_TITLE = `<text class="cls-5" transform="translate(473.35 305.86)"><tspan x="0" y="0">TI</tspan><tspan class="cls-33" x="30.23" y="0">A</tspan></text>`;
const LEADERS_1 = `<line class="cls-11" x1="278.4" y1="126.5" x2="278.4" y2="62.7"/>
      <polyline class="cls-12" points="278.4 102.3 278.4 171.5 278.4 201.3"/>
      <polyline class="cls-12" points="257.6 136.3 262 172.5 266 204.3"/>
      <line class="cls-12" x1="345.9" y1="395.43" x2="390.3" y2="457.03"/>
      <line class="cls-12" x1="209.08" y1="396.86" x2="165.28" y2="457.56"/>
      <line class="cls-12" x1="162.35" y1="265" x2="91.25" y2="242"/>
      `;
const ARROWS_BLOCK = `<g>
      <g id="lp0">
        <g>
          <path class="cls-14" d="M292.3,115c70.6,5.3,132.2,50,159.1,115.5"/>
          <polygon class="cls-14" points="294.8 118.7 295.5 118.2 292.7 115.1 296 112.5 295.4 111.8 291.4 115 294.8 118.7"/>
          <path class="cls-14" d="M445.4,226.7c.1-.2,.4-.2,.6-.1l5.4,3.7,1.1-6.4c0-.2,.3-.4,.5-.3,.2,0,.4,.3,.3,.5l-1.2,7.1c0,.1-.1,.3-.3,.3-.1,.1-.3,0-.4,0l-5.9-4.1c-.1,0-.1-.1-.2-.2,0-.2,0-.3,.1-.5Z"/>
        </g>
      </g>
      <g id="lp2">
        <g>
          <path class="cls-14" d="M180.1,460.6c60.2,37.2,136.3,37.2,196.5,.1"/>
          <polygon class="cls-14" points="180.7 465 181.5 464.8 180.4 460.7 184.5 459.9 184.3 459 179.3 460.1 180.7 465"/>
          <path class="cls-14" d="M373.8,467.1c-.2-.1-.3-.4-.2-.6l2.9-5.8-6.5-.2c-.2,0-.4-.2-.4-.4s.2-.4,.4-.4l7.2,.2c.1,0,.3,.1,.4,.2s.1,.3,0,.4l-3.2,6.4c0,.1-.1,.1-.2,.2-.2,.1-.3,.1-.4,0Z"/>
        </g>
      </g>
      <g id="lp2-2" data-name="lp2">
        <g>
          <path class="cls-14" d="M400.9,443.3c53.5-46.4,76.1-119,58.6-187.6"/>
          <polygon class="cls-14" points="405.3 444 405.3 443.2 401.1 443.1 401.5 438.9 400.7 438.8 400.2 443.9 405.3 444"/>
          <path class="cls-14" d="M464.8,260.4c-.2,.2-.4,.2-.6,0l-4.7-4.5-2.1,6.2c-.1,.2-.3,.3-.5,.3-.2-.1-.3-.3-.3-.5l2.3-6.8c0-.1,.2-.2,.3-.3s.3,0,.4,.1l5.2,5q.1,.1,.1,.2s0,.2-.1,.3Z"/>
        </g>
      </g>
      <g id="lp3">
        <g>
          <path class="cls-14" d="M96.8,257.1c-16.8,68.8,6.7,141.2,60.7,187"/>
          <polygon class="cls-14" points="92.8 259.1 93.3 259.8 96.7 257.4 98.8 261.1 99.6 260.6 97 256.2 92.8 259.1"/>
          <path class="cls-14" d="M150.4,443.3c0-.2,.3-.4,.5-.4l6.4,1-1.8-6.2c-.1-.2,.1-.5,.3-.5s.5,.1,.5,.3l2,6.9c0,.1,0,.3-.1,.4s-.2,.2-.4,.1l-7.1-1.1c-.1,0-.2,0-.2-.1-.1-.1-.1-.2-.1-.4Z"/>
        </g>
      </g>
      <g id="lp4">
        <g>
          <path class="cls-14" d="M105.3,230.6c26.8-65.4,85.5-105.5,148.5-114.5"/>
          <polygon class="cls-14" points="109.7 229.3 109.3 228.6 105.5 230.3 104 226.3 103.2 226.6 105 231.4 109.7 229.3"/>
          <path class="cls-14" d="M248.8,121.1c-.2-.2-.1-.4,0-.6l4.8-4.4-6-2.5c-.2-.1-.3-.3-.2-.6,.1-.2,.3-.3,.6-.2l6.6,2.8c.1,.1,.2,.2,.3,.3s0,.3-.1,.4l-5.3,4.8q-.1,.1-.2,.1c-.2,0-.4,0-.5-.1Z"/>
        </g>
      </g>
    </g>
    `;
const TRAILING_SPOKES = `<line class="cls-12" x1="203" y1="239.05" x2="139.7" y2="186.7"/>
    <line class="cls-12" x1="419.5" y1="418.2" x2="351.61" y2="362.07"/>
    <line class="cls-13" x1="408.9" y1="102.3" x2="349" y2="194.1"/>
    `;
// Category name + range labels ("Anxious   0.20 - 0.50", etc.) are also
// generated now, not baked — "Medium" becoming "Moderate" changes the
// letter count from 6 to 9, which baked per-letter positions can't absorb,
// and the Anxious lower bound moved 0.30 -> 0.20. Radius/start-angle/
// direction below were measured from the original baked letters' own
// coordinates (first-letter anchor point), same calibration approach as
// buildMeanArcText.
const CATEGORY_LABEL_ARCS = {
  anxious:  { radius: 196.4, startAngleDeg: 3.4,   direction: 1 },
  low:      { radius: 191.4, startAngleDeg: 94.7,  direction: 1 },
  moderate: { radius: 190.1, startAngleDeg: 157.0, direction: 1 }, // was wrongly -1, see chat
  high:     { radius: 190.9, startAngleDeg: 234.4, direction: 1 },
  deep:     { radius: 193.1, startAngleDeg: 302.3, direction: 1 },
};
function buildCategoryLabelsSVG() {
  return RING_CATEGORIES.map(cat => {
    const arc = CATEGORY_LABEL_ARCS[cat.key];
    if (!arc) return '';
    const text = `${cat.label}   ${cat.lo.toFixed(2)} - ${cat.hi.toFixed(2)}`;
    return buildArcText(text, { ...arc, cx: RING_GEOMETRY.cx, cy: RING_GEOMETRY.cy, fontPx: 12, cls: 'cls-26' });
  }).join('\n      ');
}

const CONNECTOR_MEAN_MAX = `<g>
      <path class="cls-14" d="M184.86,339.05c-4.94-11.94-7.67-25.02-7.67-38.75,0-23.9,8.27-45.86,22.1-63.19"/>
      <polygon class="cls-39" points="186.71 335.79 186.05 335.53 184.78 338.79 181.62 337.28 181.32 337.92 185.16 339.75 186.71 335.79"/>
      <polygon class="cls-39" points="200.24 240.74 199.54 240.81 199.16 237.34 195.72 237.97 195.59 237.28 199.78 236.51 200.24 240.74"/>
    </g>
    `;
// Mean label is generated per-render by buildMeanArcText() below — see
// that function for why this can no longer be a baked string constant.
const CONNECTOR_MIN_MEAN = `<g>
      <path class="cls-14" d="M355.46,366.34c-18.59,21.63-46.15,35.32-76.9,35.32-12.06,0-23.63-2.11-34.36-5.97"/>
      <polygon class="cls-39" points="351.72 366.15 351.79 366.86 355.26 366.53 355.33 370.03 356.04 370.01 355.96 365.76 351.72 366.15"/>
      <polygon class="cls-39" points="247.37 393.7 247.66 394.35 244.46 395.77 246.11 398.85 245.48 399.18 243.48 395.43 247.37 393.7"/>
    </g>`;

function polarPt(cx, cy, r, angleDeg) {
  const rad = angleDeg * Math.PI / 180;
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
}

// Donut-segment path between two radii/angles — same construction as the
// original artwork's wedges, just computed instead of hand-drawn, which is
// what makes the "thickened" span able to move to wherever THIS zone's
// before/after journey actually falls instead of staying fixed at the
// demo's range.
function ringWedgePath(cx, cy, rInner, rOuter, a0, a1) {
  const largeArc = (a1 - a0) > 180 ? 1 : 0;
  const p1 = polarPt(cx, cy, rOuter, a0), p2 = polarPt(cx, cy, rOuter, a1);
  const p3 = polarPt(cx, cy, rInner, a1), p4 = polarPt(cx, cy, rInner, a0);
  return [
    `M ${p1.x.toFixed(2)} ${p1.y.toFixed(2)}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`,
    `L ${p3.x.toFixed(2)} ${p3.y.toFixed(2)}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${p4.x.toFixed(2)} ${p4.y.toFixed(2)}`,
    'Z',
  ].join(' ');
}

function angleInRange(mid, a0, a1) {
  // a0 is always the lower angle and a1 the higher angle for a realistic
  // zone move (a span well under 360°) — no wraparound handling needed
  // since a before→after shift doesn't straddle the ring's seam in practice.
  return mid >= a0 && mid <= a1;
}

/**
 * Regenerates all 28 ring wedges: same angular slots and colours as the
 * source artwork (WEDGE_SPANS / WEDGE_COLORS, untouched), but the OUTER
 * radius per wedge switches from the thin baseline to the thick band
 * depending on where minAngle/maxAngle fall.
 *
 * v8.4: minAngle/maxAngle used to be this zone's real min/max CI across its
 * individual objects (an outlier-detection artifact). There is no
 * per-object data here anymore — instead minAngle/maxAngle now bound the
 * angular arc between the zone's before and after CI(weighted) (whichever
 * is lower/higher), so the thickened band literally traces the path the
 * zone travelled across categories because of the scenario. A bigger
 * intervention effect thickens a wider arc; a small one thickens almost
 * nothing.
 */
function buildRingWedges(minAngle, maxAngle) {
  const { cx, cy, rInner, rOuterThin, rOuterThick } = RING_GEOMETRY;
  return WEDGE_SPANS.map(({ cls, a0, a1 }) => {
    const mid = (a0 + a1) / 2;
    const thick = minAngle !== null && angleInRange(mid, minAngle, maxAngle);
    const rOuter = thick ? rOuterThick : rOuterThin;
    const d = ringWedgePath(cx, cy, rInner, rOuter, a0, a1);
    return `<path class="${cls} tiaring-sector" data-angle-mid="${mid.toFixed(1)}" fill="${WEDGE_COLORS[cls]}" d="${d}"/>`;
  }).join('\n      ');
}

let _measureCtx = null;
let _measureCtxTried = false;
function measureChar(ch, fontPx) {
  if (!_measureCtxTried) {
    _measureCtxTried = true;
    try {
      const c = document.createElement('canvas');
      _measureCtx = c.getContext && c.getContext('2d');
    } catch (e) { _measureCtx = null; }
  }
  if (_measureCtx) {
    try {
      _measureCtx.font = `${fontPx}px MyriadPro-Regular, Arial, sans-serif`;
      const w = _measureCtx.measureText(ch).width;
      if (w > 0) return w;
    } catch (e) { /* fall through to estimate */ }
  }
  // No usable canvas (older browser, some SSR/test environments) — a flat
  // per-character estimate. Narrow glyphs (i, l, ., space) are ~40% of
  // fontPx, average letters ~55-60%; good enough for arc placement, where
  // being off by a pixel or two per letter isn't visually noticeable.
  if (' .'.includes(ch)) return fontPx * 0.32;
  if ('ilIt'.includes(ch)) return fontPx * 0.35;
  return fontPx * 0.58;
}

function buildArcText(text, { cx, cy, radius, startAngleDeg, fontPx, cls, direction = -1, rotOffset = 0 }) {
  let angle = startAngleDeg;
  const parts = [];
  for (const ch of text) {
    const w = measureChar(ch, fontPx);
    const halfDeg = (w / 2) / radius * (180 / Math.PI);
    angle += direction * halfDeg;
    const pt = polarPt(cx, cy, radius, angle);
    const rot = angle + rotOffset;
    const glyph = ch === ' ' ? ' ' : ch;
    parts.push(`<text class="${cls}" transform="translate(${pt.x.toFixed(2)} ${pt.y.toFixed(2)}) rotate(${rot.toFixed(2)})"><tspan x="0" y="0">${glyph}</tspan></text>`);
    angle += direction * halfDeg;
  }
  return parts.join('\n    ');
}

// radius/start-angle measured from the original "Mean now 0.789" baked
// letters (first letter's anchor sits at r≈100, angle≈246°). This label
// sits INSIDE the hole, facing the centre, which is why it needs the
// rotate = angle - 180 flip that the outer category labels do NOT.
const MEAN_ARC = { radius: 99.5, startAngleDeg: 246.2, fontPx: 9.92, cls: 'cls-32', rotOffset: -180 };
function buildMeanArcText(meanValue) {
  const label = `Mean now  ${meanValue.toFixed(3)}`;
  return buildArcText(label, { ...MEAN_ARC, cx: RING_GEOMETRY.cx, cy: RING_GEOMETRY.cy });
}

// ── Tooltip (one shared element per container, reused across hovers) ──────
function ensureTooltip(root) {
  let tip = root.querySelector('.tiaring-tooltip');
  if (!tip) {
    tip = document.createElement('div');
    tip.className = 'tiaring-tooltip';
    root.appendChild(tip);
  }
  return tip;
}

function showTooltip(root, evt, html) {
  const tip = ensureTooltip(root);
  tip.innerHTML = html;
  tip.style.opacity = '1';
  positionTooltip(root, evt);
}
function positionTooltip(root, evt) {
  const tip = root.querySelector('.tiaring-tooltip');
  if (!tip) return;
  const bounds = root.getBoundingClientRect();
  tip.style.left = (evt.clientX - bounds.left + 14) + 'px';
  tip.style.top  = (evt.clientY - bounds.top + 14) + 'px';
}
function hideTooltip(root) {
  const tip = root.querySelector('.tiaring-tooltip');
  if (tip) tip.style.opacity = '0';
}

// Injected once globally — hover highlight, tooltip box, arrow transition.
let stylesInjected = false;
function injectGlobalStyles() {
  if (stylesInjected) return;
  stylesInjected = true;
  const style = document.createElement('style');
  style.textContent = `
    .tiaring-root { position: relative; }
    .tiaring-sector {
      transition: opacity .15s ease, filter .15s ease;
      cursor: pointer;
    }
    .tiaring-sector:hover {
      filter: brightness(1.35);
      opacity: 1;
    }
    .tiaring-root:has(.tiaring-sector:hover) .tiaring-sector:not(:hover) {
      opacity: .55;
    }
    .tiaring-tia-arrow-group {
      transform-origin: ${RING_GEOMETRY.cx}px ${RING_GEOMETRY.cy}px;
      transition: transform 0.9s cubic-bezier(.4,0,.2,1);
      cursor: pointer;
    }
    .tiaring-tia-arrow-group:hover { filter: brightness(1.3); }
    .tiaring-tia-label-counter {
      transform-origin: 0 0;
      transition: transform 0.9s cubic-bezier(.4,0,.2,1);
    }
    .tiaring-hotspot {
      fill: transparent;
      cursor: pointer;
    }
    .tiaring-tooltip {
      position: absolute;
      pointer-events: none;
      background: rgba(20,20,20,.95);
      border: 1px solid #333;
      color: #eee;
      font: 11px/1.5 Arial, sans-serif;
      padding: 6px 10px;
      border-radius: 3px;
      opacity: 0;
      transition: opacity .12s ease;
      white-space: nowrap;
      z-index: 20;
    }
    .tiaring-tooltip b { color: #fff; }
  `;
  document.head.appendChild(style);
}

// ── SVG assembly ────────────────────────────────────────────────────────
// TIA arrow, generated (not baked): same grey/gradient visual language as
// the source file's comet shape, but length and how dense the gradient's
// base opacity is both scale with |deltaCIWeighted|. A bigger intervention
// effect reads as a longer, darker pointer; a small one is short and faint.
// Drawn in LOCAL coordinates at the ring's fixed default angle — the
// arrow's own rotation to the real target angle happens one level up, on
// the group (see applyTiaRotation), same rig as before.
function buildTiaArrowMarkup(uid, data) {
  if (data.deltaCIWeighted === undefined) return { defs: '', markup: '' };
  const { cx, cy } = RING_GEOMETRY;
  const angle = RING_GEOMETRY.defaultTiaAngle;
  const mag = Math.abs(data.deltaCIWeighted || 0);
  const length = Math.min(160, Math.max(40, mag * 320));
  const rStart = 187; // matches the source file's own spoke-line start radius
  const p0 = polarPt(cx, cy, rStart, angle);
  const p1 = polarPt(cx, cy, rStart + length, angle);
  const baseOpacity = Math.min(0.95, 0.28 + mag * 2.6);
  const gradId = `tiaring-tia-grad-${uid}`;
  const defs = `<linearGradient id="${gradId}" gradientUnits="userSpaceOnUse" x1="${p0.x.toFixed(2)}" y1="${p0.y.toFixed(2)}" x2="${p1.x.toFixed(2)}" y2="${p1.y.toFixed(2)}"><stop id="tiaring-tia-grad-stop0-${uid}" offset="0" stop-color="#999999" stop-opacity="${baseOpacity.toFixed(2)}"/><stop offset="1" stop-color="#999999" stop-opacity="0.02"/></linearGradient>`;
  const markup = `<line id="tiaring-tia-arrowline-${uid}" x1="${p0.x.toFixed(2)}" y1="${p0.y.toFixed(2)}" x2="${p1.x.toFixed(2)}" y2="${p1.y.toFixed(2)}" stroke="url(#${gradId})" stroke-width="7" stroke-linecap="round"/>`;
  return { defs, markup };
}

function buildSVG(uid, data) {
  const zoneName = data.zoneName || '';
  const zoneIdLabel = data.zoneIdLabel || '';
  // Fixed physical slots, unchanged from the baked artwork's own layout:
  // the upper text position always shows "before", the lower one always
  // shows "after" — regardless of which number happens to be bigger. A
  // magnitude-based swap would make the two labels change position between
  // renders, which reads as far more confusing on a live dashboard than a
  // number that's sometimes smaller at the top.
  const beforeLabel = data.ciZoneWeightedBefore !== undefined ? data.ciZoneWeightedBefore.toFixed(3) : '0.975';
  const afterLabel = data.ciZoneWeightedAfter !== undefined ? data.ciZoneWeightedAfter.toFixed(3) : '0.746';
  const meanValue = data.ciZoneWeightedAfter !== undefined ? data.ciZoneWeightedAfter : 0.789;

  const numbersBlock = `<text class="cls-26" transform="translate(200.42 253.43)"><tspan x="0" y="0">${beforeLabel}</tspan></text>
      <text class="cls-26" transform="translate(342.57 357.03)"><tspan x="0" y="0">${afterLabel}</tspan></text>
    </g>
    `;

  const centreLabels = `<text class="cls-8" transform="translate(192.48 301.47)"><tspan x="0" y="0">${zoneName}</tspan></text>
      <text class="cls-7" transform="translate(224.52 325.87)"><tspan x="0" y="0">${zoneIdLabel}</tspan></text>
      `;

  // Ring thickening — "выступающие части кольца" — now tracks the angular
  // arc between this zone's before and after CI(weighted), see
  // buildRingWedges' own doc comment above for why.
  const haveBoth = data.ciZoneWeightedBefore !== undefined && data.ciZoneWeightedAfter !== undefined;
  const minAngle = haveBoth ? valueToAngle(Math.min(data.ciZoneWeightedBefore, data.ciZoneWeightedAfter)) : null;
  const maxAngle = haveBoth ? valueToAngle(Math.max(data.ciZoneWeightedBefore, data.ciZoneWeightedAfter)) : null;

  // TIA arrow — length and gradient darkness both scale with
  // |deltaCIWeighted|, per Sergei: "серая градиентная стрелка... градиент
  // будет светлеть или темнеть в зависимости от... значения TIA". Points at
  // where the zone lands after the scenario (ciZoneWeightedAfter). Drawn at
  // the fixed default angle in LOCAL coordinates; the enclosing group is
  // what gets rotated to the real target angle (applyTiaRotation), same as
  // before.
  const tiaArrow = buildTiaArrowMarkup(uid, data);

  // Persistent ΔCI-TIA readout — the main number on this whole diagram
  // ("они здесь главные"), sized and coloured to read as the headline,
  // not a footnote. Position orbits with the arrow (clock-hand rig, see
  // applyTiaRotation); the nested counter-rotation keeps the glyphs level.
  // Right-anchored so it can't run past the viewBox edge regardless of
  // digit length (see the "TIA label ran off-canvas" fix from before).
  const tiaLabel = data.deltaCIWeighted !== undefined
    ? `<g transform="translate(498 222)"><g class="tiaring-tia-label-counter" id="tiaring-tia-label-counter-${uid}"><text id="tiaring-tia-label-${uid}" class="tiaring-tia-label" text-anchor="end" font-size="22" font-weight="700" fill="#fff"><tspan x="0" y="0">ΔCI-TIA ${data.deltaCIWeighted >= 0 ? '+' : ''}${data.deltaCIWeighted.toFixed(3)}</tspan></text></g></g>`
    : '';

  return `<svg viewBox="0 0 580 580" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs><style>${STYLE_BLOCK}</style>${GRADIENT_DEF}${tiaArrow.defs}</defs>
  <g id="Layer_1-2-${uid}">
    <rect width="580" height="580"/>
    ${TIA_TITLE}
    <g>
      <g id="tiaring-wedges-${uid}">${buildRingWedges(minAngle, maxAngle)}</g>
      ${LEADERS_1}
      ${centreLabels}
      <g class="tiaring-tia-arrow-group" id="tiaring-arrow-${uid}">
        ${tiaArrow.markup}
        ${tiaLabel}
      </g>
    </g>
    ${ARROWS_BLOCK}
    ${TRAILING_SPOKES}
    <g>${buildCategoryLabelsSVG()}</g>
    ${numbersBlock}
    ${CONNECTOR_MEAN_MAX}
    <g id="tiaring-mean-${uid}">${buildMeanArcText(meanValue)}</g>
    ${CONNECTOR_MIN_MEAN}
  </g>
</svg>`;
}

// ── Interaction wiring ──────────────────────────────────────────────────
function wireInteractivity(root, data) {
  root.querySelectorAll('.tiaring-sector').forEach(el => {
    el.addEventListener('mouseenter', evt => {
      const mid = parseFloat(el.getAttribute('data-angle-mid'));
      const { category, value } = angleToReading(mid);
      showTooltip(root, evt, `<b>${category}</b><br>CI (weighted) ≈ ${value.toFixed(3)}`);
    });
    el.addEventListener('mousemove', evt => positionTooltip(root, evt));
    el.addEventListener('mouseleave', () => hideTooltip(root));
  });

  const arrowGroup = root.querySelector('.tiaring-tia-arrow-group');
  if (arrowGroup && data.deltaCIWeighted !== undefined) {
    arrowGroup.addEventListener('mouseenter', evt => {
      const sign = data.deltaCIWeighted >= 0 ? '+' : '';
      const decisionLine = data.decision ? `<br>${data.decision}` : '';
      showTooltip(root, evt,
        `<b>TIA scenario</b><br>ΔCI-TIA ${sign}${data.deltaCIWeighted.toFixed(3)}${decisionLine}`);
    });
    arrowGroup.addEventListener('mousemove', evt => positionTooltip(root, evt));
    arrowGroup.addEventListener('mouseleave', () => hideTooltip(root));
  }

  // Before/after plain-text numbers also get a tooltip (they're not <path>
  // sectors, so wired separately by nearest-text lookup)
  const numberTexts = root.querySelectorAll('text.cls-26');
  numberTexts.forEach(t => {
    const content = t.textContent.trim();
    if (/^\d\.\d{3}$/.test(content)) {
      t.style.cursor = 'pointer';
      t.addEventListener('mouseenter', evt => showTooltip(root, evt, `<b>${content}</b>`));
      t.addEventListener('mousemove', evt => positionTooltip(root, evt));
      t.addEventListener('mouseleave', () => hideTooltip(root));
    }
  });
}

function applyTiaRotation(root, uid, data, animate) {
  const arrowGroup = root.querySelector(`#tiaring-arrow-${uid}`);
  const labelCounter = root.querySelector(`#tiaring-tia-label-counter-${uid}`);
  if (!arrowGroup || data.deltaCIWeighted === undefined) return;
  const targetAngle = data.ciZoneWeightedAfter !== undefined ? valueToAngle(data.ciZoneWeightedAfter) : RING_GEOMETRY.defaultTiaAngle;
  const delta = targetAngle - RING_GEOMETRY.defaultTiaAngle;
  const groups = [arrowGroup, labelCounter].filter(Boolean);
  if (!animate) groups.forEach(g => { g.style.transition = 'none'; });
  arrowGroup.style.transform = `rotate(${delta}deg)`;
  // counter-rotation: cancels the parent's rotate(delta) so the label's
  // own glyphs stay level no matter where the arrow is pointing, while its
  // translate(462 236) anchor still orbits with the parent group
  if (labelCounter) labelCounter.style.transform = `rotate(${-delta}deg)`;
  if (!animate) {
    // force reflow, then restore transitions for future updates
    groups.forEach(g => void g.offsetWidth);
    groups.forEach(g => { g.style.transition = ''; });
  }
}

const instances = new Map(); // containerId -> { uid, data }

/**
 * renderTIARing(containerId, data)
 *
 * data = {
 *   zoneName:    'HERCEG NOVI',
 *   zoneIdLabel: 'ZN·ME·BJ·HN·001',
 *   ciZoneWeightedBefore,   // zone CI(weighted) before the scenario —
 *                           // handleComputeTIA's ciZoneWeightedBefore, verbatim
 *   ciZoneWeightedAfter,    // zone CI(weighted) after the scenario —
 *                           // handleComputeTIA's ciZoneWeightedAfter, verbatim;
 *                           // also drives the "Mean now …" arc label and the
 *                           // TIA arrow's target angle
 *   deltaCIWeighted,        // handleComputeTIA's deltaCIWeighted, verbatim —
 *                           // drives the arrow's length/brightness and the
 *                           // ΔCI-TIA readout
 *   decision,               // handleComputeTIA's decision string, verbatim —
 *                           // shown in the arrow's tooltip only
 * }
 *
 * All fields are optional independently — a response straight from
 * computeTIA can be passed through with just zoneName/zoneIdLabel added, no
 * adapter needed. There is no more targetName/single-object concept: the
 * ring shows the zone's aggregate before/after state regardless of how many
 * objects a scenario touched.
 *
 * Mounts a fresh ring. Call updateTIARing() afterwards for subsequent
 * data changes so the TIA arrow animates instead of snapping.
 */
export function renderTIARing(containerId, data) {
  injectGlobalStyles();
  const container = document.getElementById(containerId);
  if (!container) { console.error(`tia-ring: no element #${containerId}`); return; }
  container.classList.add('tiaring-root');

  const uid = containerId + '-' + Math.random().toString(36).slice(2, 8);
  container.innerHTML = buildSVG(uid, data);
  wireInteractivity(container, data);
  applyTiaRotation(container, uid, data, /*animate=*/false); // no transition on first paint
  instances.set(containerId, { uid, data });
}

/**
 * updateTIARing(containerId, data)
 * Re-renders zone name/ID, before/after/mean text, and the ΔCI-TIA readout
 * immediately, and animates the TIA arrow to its new angle via the CSS
 * transition already set up in renderTIARing(). Use this (not
 * renderTIARing again) for live updates so the rotation actually animates.
 */
export function updateTIARing(containerId, data) {
  const inst = instances.get(containerId);
  const container = document.getElementById(containerId);
  if (!inst || !container) { renderTIARing(containerId, data); return; }

  // text-only swaps (zone name/id, before/after) — same geometry, new content
  const zoneNameEl = container.querySelector('text.cls-8 tspan');
  const zoneIdEl = container.querySelector('text.cls-7 tspan');
  if (zoneNameEl && data.zoneName !== undefined) zoneNameEl.textContent = data.zoneName;
  if (zoneIdEl && data.zoneIdLabel !== undefined) zoneIdEl.textContent = data.zoneIdLabel;

  const numberTexts = container.querySelectorAll('text.cls-26 > tspan');
  numberTexts.forEach(tspan => {
    if (/^\d\.\d{3}$/.test(tspan.textContent.trim())) {
      const parent = tspan.parentElement;
      const transform = parent.getAttribute('transform') || '';
      if (transform.includes('200.42') && data.ciZoneWeightedBefore !== undefined) tspan.textContent = data.ciZoneWeightedBefore.toFixed(3);
      if (transform.includes('342.57') && data.ciZoneWeightedAfter !== undefined) tspan.textContent = data.ciZoneWeightedAfter.toFixed(3);
    }
  });

  // Mean is real arc-text, not a baked string — different digit count
  // means different total arc length, so it's regenerated wholesale
  // rather than patched letter-by-letter.
  if (data.ciZoneWeightedAfter !== undefined) {
    const meanGroup = container.querySelector(`#tiaring-mean-${inst.uid}`);
    if (meanGroup) meanGroup.innerHTML = buildMeanArcText(data.ciZoneWeightedAfter);
  }

  // ΔCI-TIA readout text next to the arrow (decision intentionally left out
  // here — see the comment in buildSVG; it's tooltip-only)
  if (data.deltaCIWeighted !== undefined) {
    const label = container.querySelector(`#tiaring-tia-label-${inst.uid}`);
    const sign = data.deltaCIWeighted >= 0 ? '+' : '';
    const text = `ΔCI-TIA ${sign}${data.deltaCIWeighted.toFixed(3)}`;
    if (label) label.querySelector('tspan').textContent = text;
  }

  // Ring thickening — regenerate wedges wholesale rather than tweak radii
  // in place, since the whole point is that the thickened arc can move to
  // a completely different set of wedges as before/after change.
  const nextBefore = data.ciZoneWeightedBefore !== undefined ? data.ciZoneWeightedBefore : inst.data.ciZoneWeightedBefore;
  const nextAfter = data.ciZoneWeightedAfter !== undefined ? data.ciZoneWeightedAfter : inst.data.ciZoneWeightedAfter;
  if (data.ciZoneWeightedBefore !== undefined || data.ciZoneWeightedAfter !== undefined) {
    const wedgeGroup = container.querySelector(`#tiaring-wedges-${inst.uid}`);
    if (wedgeGroup && nextBefore !== undefined && nextAfter !== undefined) {
      const minAngle = valueToAngle(Math.min(nextBefore, nextAfter));
      const maxAngle = valueToAngle(Math.max(nextBefore, nextAfter));
      wedgeGroup.innerHTML = buildRingWedges(minAngle, maxAngle);
    }
  }

  // TIA arrow shape — length and gradient darkness track |deltaCIWeighted|,
  // so these also need regenerating, not just re-rotating.
  if (data.deltaCIWeighted !== undefined) {
    const mag = Math.abs(data.deltaCIWeighted || 0);
    const length = Math.min(160, Math.max(40, mag * 320));
    const rStart = 187;
    const angle = RING_GEOMETRY.defaultTiaAngle;
    const p0 = polarPt(RING_GEOMETRY.cx, RING_GEOMETRY.cy, rStart, angle);
    const p1 = polarPt(RING_GEOMETRY.cx, RING_GEOMETRY.cy, rStart + length, angle);
    const baseOpacity = Math.min(0.95, 0.28 + mag * 2.6);
    const grad = container.querySelector(`#tiaring-tia-grad-${inst.uid}`);
    const line = container.querySelector(`#tiaring-tia-arrowline-${inst.uid}`);
    const stop0 = container.querySelector(`#tiaring-tia-grad-stop0-${inst.uid}`);
    if (grad) { grad.setAttribute('x1', p0.x.toFixed(2)); grad.setAttribute('y1', p0.y.toFixed(2)); grad.setAttribute('x2', p1.x.toFixed(2)); grad.setAttribute('y2', p1.y.toFixed(2)); }
    if (stop0) stop0.setAttribute('stop-opacity', baseOpacity.toFixed(2));
    if (line) { line.setAttribute('x1', p0.x.toFixed(2)); line.setAttribute('y1', p0.y.toFixed(2)); line.setAttribute('x2', p1.x.toFixed(2)); line.setAttribute('y2', p1.y.toFixed(2)); }
  }

  instances.set(containerId, { uid: inst.uid, data });
  applyTiaRotation(container, inst.uid, data, /*animate=*/true);
  // tooltip content for the arrow reads from `data` live via closures set
  // up in wireInteractivity — re-wire so the new data gets captured, and
  // so the freshly-regenerated wedges above get their hover handlers
  wireInteractivity(container, data);
}
