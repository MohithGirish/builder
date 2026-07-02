/*
 * verification.js — Builder verification credential model, validators, and storage.
 *
 * Single source of truth for the India builder-verification step: the RERA
 * state→authority list, statutory-format regexes (PAN, GSTIN, CIN, LLPIN),
 * per-field validators, the empty-record shape, localStorage load/save under
 * `builderai_verification_<userId>`, and deriveStatus() which returns
 * 'submitted' once all four Tier-1 credentials are valid AND the record has
 * been submitted (submittedAt set), 'ready' when Tier 1 is complete but not yet
 * submitted, else 'unverified'.
 * Shared by OnboardingVerification.jsx (the form) and Profile.jsx (the badge).
 */

// Indian states / UTs paired with their RERA authority label.
export const RERA_STATES = [
  { value: 'Andhra Pradesh', authority: 'AP RERA' },
  { value: 'Arunachal Pradesh', authority: 'Arunachal RERA' },
  { value: 'Assam', authority: 'Assam RERA' },
  { value: 'Bihar', authority: 'RERA Bihar' },
  { value: 'Chhattisgarh', authority: 'CG RERA' },
  { value: 'Goa', authority: 'Goa RERA' },
  { value: 'Gujarat', authority: 'GujRERA' },
  { value: 'Haryana', authority: 'HARERA' },
  { value: 'Himachal Pradesh', authority: 'RERA HP' },
  { value: 'Jharkhand', authority: 'RERA Jharkhand' },
  { value: 'Karnataka', authority: 'K-RERA (RERA Karnataka)' },
  { value: 'Kerala', authority: 'K-RERA (Kerala)' },
  { value: 'Madhya Pradesh', authority: 'RERA MP' },
  { value: 'Maharashtra', authority: 'MahaRERA' },
  { value: 'Manipur', authority: 'Manipur RERA' },
  { value: 'Meghalaya', authority: 'Meghalaya RERA' },
  { value: 'Mizoram', authority: 'Mizoram RERA' },
  { value: 'Nagaland', authority: 'Nagaland RERA' },
  { value: 'Odisha', authority: 'ORERA' },
  { value: 'Punjab', authority: 'RERA Punjab' },
  { value: 'Rajasthan', authority: 'RERA Rajasthan' },
  { value: 'Sikkim', authority: 'Sikkim RERA' },
  { value: 'Tamil Nadu', authority: 'TNRERA' },
  { value: 'Telangana', authority: 'TG RERA' },
  { value: 'Tripura', authority: 'Tripura RERA' },
  { value: 'Uttar Pradesh', authority: 'UP RERA' },
  { value: 'Uttarakhand', authority: 'RERA Uttarakhand' },
  { value: 'West Bengal', authority: 'WBRERA' },
  // Union Territories
  { value: 'Andaman & Nicobar Islands', authority: 'A&N RERA' },
  { value: 'Chandigarh', authority: 'RERA Chandigarh' },
  { value: 'Dadra & Nagar Haveli and Daman & Diu', authority: 'DNHDD RERA' },
  { value: 'Delhi', authority: 'Delhi RERA' },
  { value: 'Jammu & Kashmir', authority: 'J&K RERA' },
  { value: 'Ladakh', authority: 'Ladakh RERA' },
  { value: 'Lakshadweep', authority: 'Lakshadweep RERA' },
  { value: 'Puducherry', authority: 'Puducherry RERA' },
];

export function authorityFor(state) {
  return RERA_STATES.find((s) => s.value === state)?.authority || '';
}

// Entity types and the registration-ID format each expects.
export const ENTITY_TYPES = [
  { value: 'private_ltd', label: 'Private Limited Company', idFormat: 'cin' },
  { value: 'public_ltd', label: 'Public Limited Company', idFormat: 'cin' },
  { value: 'llp', label: 'Limited Liability Partnership (LLP)', idFormat: 'llpin' },
  { value: 'partnership', label: 'Partnership Firm', idFormat: 'free' },
  { value: 'proprietorship', label: 'Sole Proprietorship', idFormat: 'free' },
];

export const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
export const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/;
export const CIN_RE = /^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/;
export const LLPIN_RE = /^[A-Z]{3}-[0-9]{4}$/;

// Fields whose values are always uppercase, so inputs auto-uppercase them.
export const UPPERCASE_FIELDS = ['reraNumber', 'pan', 'gstin', 'entityId'];

/*
 * Each validator returns { state, hint }:
 *   state 'empty'   → nothing typed yet (no message)
 *   state 'valid'   → passes format (quiet confirmation)
 *   state 'invalid' → typed but wrong (specific format hint)
 */
const ok = { state: 'valid', hint: '' };
const empty = { state: 'empty', hint: '' };
const bad = (hint) => ({ state: 'invalid', hint });

export function validatePan(v) {
  if (!v) return empty;
  return PAN_RE.test(v) ? ok : bad('PAN is 5 letters, 4 digits, then 1 letter — e.g. ABCDE1234F');
}

export function validateGstin(v) {
  if (!v) return empty;
  return GSTIN_RE.test(v) ? ok : bad('GSTIN is 15 characters — 2-digit state code, PAN, entity code, Z, then a check digit');
}

export function validateReraNumber(v) {
  if (!v) return empty;
  return /^[A-Z0-9/-]+$/.test(v) ? ok : bad('Use letters, digits, "/" and "-" only — e.g. P51700000000');
}

// Registration ID validity depends on the chosen entity type.
export function validateEntityId(v, entityType) {
  if (!v) return empty;
  const fmt = ENTITY_TYPES.find((t) => t.value === entityType)?.idFormat;
  if (fmt === 'cin') return CIN_RE.test(v) ? ok : bad('CIN is 21 characters — e.g. U70100MH2015PTC123456');
  if (fmt === 'llpin') return LLPIN_RE.test(v) ? ok : bad('LLPIN is 3 letters, a hyphen, then 4 digits — e.g. AAA-1234');
  return ok; // partnership / proprietorship → freeform
}

export function emptyRecord() {
  return {
    reraState: '',
    reraNumber: '',
    pan: '',
    gstin: '',
    entityType: '',
    entityId: '',
    // Tier 2
    completionCert: null,   // { name, size, type, addedAt } | null
    commencementCert: null,
    bocw: '',
    epf: '',
    esi: '',
    // Tier 3
    membership: '',
    isoCert: null,
    updatedAt: '',
    submittedAt: '',
  };
}

// All four Tier-1 credentials valid — the precondition for 'ready' / 'submitted'.
export function isTier1Complete(r) {
  if (!r) return false;
  const reraOk = !!r.reraState && validateReraNumber(r.reraNumber).state === 'valid';
  const panOk = validatePan(r.pan).state === 'valid';
  const gstinOk = validateGstin(r.gstin).state === 'valid';
  const entityOk = !!r.entityType && validateEntityId(r.entityId, r.entityType).state === 'valid';
  return reraOk && panOk && gstinOk && entityOk;
}

// 'submitted' → Tier 1 complete and the user pressed Submit (submittedAt set);
// 'ready' → Tier 1 complete but not yet submitted; 'unverified' → otherwise.
export function deriveStatus(r) {
  if (!isTier1Complete(r)) return 'unverified';
  return r?.submittedAt ? 'submitted' : 'ready';
}

export function storageKey(userId) {
  return `builderai_verification_${userId}`;
}

export function loadVerification(userId) {
  if (!userId) return null;
  try { return JSON.parse(localStorage.getItem(storageKey(userId))) || null; } catch { return null; }
}

export function saveVerification(userId, record) {
  if (!userId) return;
  localStorage.setItem(storageKey(userId), JSON.stringify({ ...record, updatedAt: new Date().toISOString() }));
}
