/**
 * pi-calc.js
 * ─────────────────────────────────────────────────────────────────────────
 * Vanilla ES6 module. The calculation engine behind intervention-entry.html
 * (InterventionEntryForm_FullPath_TZ, 2026-08-13): given an object's current
 * six PI sub-components + AD + II, an intervention type from
 * AT_ImpactMatrix_structured_13aug2026.json, and the researcher's S/E-inputs
 * for that type, compute the object's PI/AD/II/CI AFTER the intervention.
 *
 * computePI()/computeCI() are PORTED VERBATIM from ACAP_AppsScript_v8_1.gs
 * (Appendix J v2.0 — confirmed 2026-08-13 as the formula actually running in
 * production, see memory pi-aggregation-formula-conflict, RESOLVED). Do NOT
 * re-derive or "improve" these — any drift from the server's own computePI
 * makes this form's preview lie about what the backend will actually record.
 *
 * WHY THE OBJECT'S "BEFORE" SIX COMPONENTS ARE ASKED FRESH, NOT FETCHED:
 * PASSPORT_REGISTRY (REGISTRY_COLUMNS in ACAP_AppsScript_v8_1.gs) stores only
 * the aggregate PI_current — not its six components (A1/PMI/VQI/B2/C1/C2).
 * Those live per-measurement in the INPUT sheet log, which nothing on the
 * client currently fetches. Rather than add a new read path for old data,
 * this form asks the researcher to assess the object's CURRENT six
 * components fresh, exactly as Appendix J's own field protocol (J.4)
 * describes — a real reassessment, not a database lookup. AD/II ARE in
 * PASSPORT_REGISTRY (AD_current/II_current) and are auto-filled from there.
 * ─────────────────────────────────────────────────────────────────────────
 */

// ═══════════════════════════════════════════════════════════════
// 1) CORE FORMULA — ported verbatim from ACAP_AppsScript_v8_1.gs
// ═══════════════════════════════════════════════════════════════
// pmiWeightOverride (A14 only, 0.5): halves the PMI term's contribution
// while the /37.5 denominator stays fixed — deliberately does NOT rescale
// to a new max, so an artificially-aged surface can never earn full PMI
// credit. That's the intended "50% discount" penalty for pseudo-chronity
// (see the matrix's own A14 notes), not an inconsistency to fix.
export function computePI(c, pmiWeightOverride) {
  const pmiWeight = pmiWeightOverride !== undefined ? pmiWeightOverride : 2.0;
  const piRaw =
    (c.A1 * 1.0) +
    (c.PMI * pmiWeight) +
    (c.VQI * 1.5) +
    (c.B2 * 1.5) +
    (c.C1 * 0.75) +
    (c.C2 * 0.75);
  return (piRaw / 37.5) * 25;
}

export function computeCI(PI, AD, II) {
  return ((PI / 25) * 0.40) + (AD * 0.35) + ((II / 100) * 0.25);
}

function round3(n) { return Math.round(n * 1000) / 1000; }
function clamp05(v) { return Math.max(0, Math.min(5, v)); }
function clamp01(v) { return Math.max(0, Math.min(1, v)); }

// ═══════════════════════════════════════════════════════════════
// 2) CATALOG LOADING
// ═══════════════════════════════════════════════════════════════
let catalogPromise = null;
export function loadCatalog(url) {
  if (!catalogPromise) {
    catalogPromise = fetch(url || './AT_ImpactMatrix_structured_13aug2026.json')
      .then(r => {
        if (!r.ok) throw new Error('Could not load AT_ImpactMatrix_structured_13aug2026.json — HTTP ' + r.status);
        return r.json();
      });
  }
  return catalogPromise;
}

export function findType(catalog, typeId) {
  return catalog.types.find(t => t.id === typeId) || null;
}

// ═══════════════════════════════════════════════════════════════
// 3) R-FORMULAS — one explicit function per type id, mirroring the
// formula strings recorded in AT_ImpactMatrix_structured_13aug2026.json
// (kept as plain, auditable code rather than a generic string-parsed DSL —
// same "explicit over clever" style as the rest of this codebase, e.g.
// zone-profile.js's idwAt/weightedToT). Each function receives:
//   before   — {A1,PMI,VQI,B2,C1,C2,AD,II}, the freshly-assessed "before" state
//   ctx      — {S, extraVars} — S is 0..1 (only for gradual/gradual_resolved
//              types), extraVars is the {varName: value} map from the type's
//              extra_object_vars (if any)
// and return a PARTIAL update — only the keys this type's R-formulas
// actually touch. Keys not returned stay at their "before" value untouched
// (the no_formula_convention documented in the JSON's meta block).
// ═══════════════════════════════════════════════════════════════
const R_FORMULAS = {
  A1: (before, { S }) => ({
    PMI: before.PMI * (1 - S) + 1 * S,
    C1: before.C1 * (1 - S) + 1 * S,
    AD: clamp01(before.AD - S),
  }),
  A2: (before, { S }) => ({
    PMI: before.PMI * (1 - S) + 2 * S,
    C1: before.C1 * (1 - S) + 4 * S,
    AD: clamp01(before.AD + S),
  }),
  A3: (before, { S }) => ({
    PMI: before.PMI * (1 - S) + 2 * S,
    AD: clamp01(before.AD + S),
  }),
  A4: (before, { S }) => ({
    PMI: before.PMI * (1 - S) + 2 * S,
    C1: before.C1 * (1 - S) + 2 * S,
    AD: clamp01(before.AD - S),
  }),
  A5: (before, { extraVars }) => {
    const Vold = extraVars.V_old, Vadd = extraVars.V_add;
    const ADnewPart = extraVars.AD_new_part !== undefined ? extraVars.AD_new_part : 0; // typical addition: low/no authenticity, per matrix commentary
    const total = Vold + Vadd;
    return {
      AD: total > 0 ? clamp01((before.AD * Vold + ADnewPart * Vadd) / total) : before.AD,
      II: total > 0 ? Math.max(0, before.II - (Vadd / total) * 30) : before.II,
    };
  },
  A6: () => ({}), // AD/II unchanged at object level — see JSON notes (zone-only effect, not applied here)
  A7: (before, { S }) => ({ // S here is S_elem
    PMI: before.PMI * (1 - S),
    C1: before.C1 * (1 - S),
    AD: clamp01(before.AD * (1 - S)),
  }),
  A8: () => ({}),
  A9: (before, { S }) => ({ // S here is S_win
    PMI: before.PMI * (1 - S) + 1 * S,
    C1: before.C1 * (1 - S) + 1 * S,
    AD: clamp01(before.AD - S),
  }),
  A10: () => ({}),
  A13: (before, { S }) => ({
    PMI: before.PMI * (1 - S) + 1 * S,
    C1: before.C1 * (1 - S) + 1 * S,
  }),
  A14: (before, { S }) => ({
    PMI: before.PMI * (1 - S) + 3 * S,
  }),
  A15: () => ({}),
  B1: (before, { S }) => ({ // S here is S_road
    PMI: before.PMI * (1 - S) + 1 * S,
    C1: before.C1 * (1 - S) + 1 * S,
    AD: clamp01(before.AD - S),
  }),
  B3: (before, { extraVars }) => ({
    II: Math.max(0, before.II - extraVars.S_new_over_zone * 40),
  }),
  B4: (before, { extraVars }) => ({
    II: Math.max(0, before.II - extraVars.L_closed_over_total * 20),
  }),
  B5: (before, { S }) => ({ // S here is S_infra
    AD: clamp01(before.AD - S),
  }),
  B6: (before, { S }) => ({ // S here is S_demolished_over_zone
    PMI: before.PMI * (1 - S),
    II: Math.max(0, before.II - S * 100),
  }),
  B7a: (before, { S }) => ({
    PMI: before.PMI * (1 - S) + 2 * S,
    C1: before.C1 * (1 - S) + 4 * S,
    AD: clamp01(before.AD + S),
  }),
  B7b: (before, { S }) => ({
    PMI: before.PMI * (1 - S) + 1 * S,
    C1: before.C1 * (1 - S) + 1 * S,
    AD: clamp01(before.AD - S),
  }),
  B8: (before, { extraVars }) => ({
    II: Math.max(0, before.II - extraVars.S_rezone_over_zone * 15),
  }),
  B9: (before, { S, extraVars }) => ({ // S here is S_uncovered
    PMI: before.PMI + (extraVars.PMI_hidden - before.PMI) * S,
  }),
  B10: () => ({}),
};

// ═══════════════════════════════════════════════════════════════
// 4) E-PARAMETERS — a chosen delta (within the type's documented range)
// is added directly to the current value of that component, clamped 0..5.
// Applies uniformly to gradual and categorical types alike.
// ═══════════════════════════════════════════════════════════════
function applyEParams(before, type, eDeltas) {
  const after = {};
  (type.e_parameters || []).forEach(ep => {
    const key = ep.param.replace(/_zone$/, ''); // Group B rows are labelled e.g. "VQI_zone" in the source — see zone-level note in the JSON; applied to the selected object here, same simplification simulator.html already uses for Group B types
    const delta = eDeltas[ep.param];
    if (delta === undefined || delta === null || Number.isNaN(delta)) return;
    const base = before[key];
    if (base === undefined) return;
    after[key] = clamp05(base + delta);
  });
  return after;
}

// ═══════════════════════════════════════════════════════════════
// 5) PUBLIC ENTRY POINT
// ═══════════════════════════════════════════════════════════════
/**
 * applyIntervention(type, before, inputs)
 *
 * type: one entry from the catalog's `types[]` (must have supported !== false)
 * before: {A1,PMI,VQI,B2,C1,C2,AD,II} — freshly-assessed current state (AD/II
 *   normally pre-filled from PASSPORT_REGISTRY, A1..C2 entered fresh by the
 *   researcher — see file header)
 * inputs: {
 *   S?: number (0..1)        — required for gradual/gradual_resolved types
 *   eDeltas?: {param: number} — chosen value within each e_parameters range
 *   extraVars?: {var: number} — values for type.extra_object_vars, if any
 * }
 *
 * Returns { before, after: {A1,PMI,VQI,B2,C1,C2,AD,II}, piBefore, piAfter,
 *   ciBefore, ciAfter, deltaCI }. A15 (or any type with empty r_parameters
 *   AND empty e_parameters) naturally returns after === before, deltaCI = 0
 *   — no special-cased branch needed, it falls out of the same code path.
 */
export function applyIntervention(type, before, inputs) {
  if (type.supported === false) {
    throw new Error(`Intervention type "${type.id}" is not supported by this form yet: ${type.unsupportedReason || ''}`);
  }
  inputs = inputs || {};
  const S = inputs.S !== undefined ? inputs.S : null;
  const extraVars = inputs.extraVars || {};
  const eDeltas = inputs.eDeltas || {};

  const rFn = R_FORMULAS[type.id];
  const rUpdates = rFn ? rFn(before, { S, extraVars }) : {};
  const eUpdates = applyEParams(before, type, eDeltas);

  const after = {
    A1: before.A1, PMI: before.PMI, VQI: before.VQI, B2: before.B2,
    C1: before.C1, C2: before.C2, AD: before.AD, II: before.II,
    ...rUpdates, ...eUpdates,
  };
  // clamp the six PI components (AD/II already clamped inside their own formulas above)
  ['A1', 'PMI', 'VQI', 'B2', 'C1', 'C2'].forEach(k => { after[k] = clamp05(after[k]); });

  const pmiWeightOverride = type.pmiWeightOverride; // A14 pseudo-chronity, weight x0.5
  const piBefore = computePI(before, pmiWeightOverride);
  const piAfter = computePI(after, pmiWeightOverride);
  const ciBefore = computeCI(piBefore, before.AD, before.II);
  const ciAfter = computeCI(piAfter, after.AD, after.II);

  return {
    before, after,
    piBefore: round3(piBefore), piAfter: round3(piAfter),
    ciBefore: round3(ciBefore), ciAfter: round3(ciAfter),
    deltaCI: round3(ciAfter - ciBefore),
  };
}
