/*
 * OnboardingVerification.jsx — Builder verification step (post-onboarding, no AI).
 *
 * A single-page, form-driven collector for India builder credentials in three
 * tiers: Tier 1 statutory identity (RERA, PAN, GSTIN, entity registration) is the
 * primary section with inline format validation; Tiers 2–3 (project/compliance
 * track record and industry credibility) are secondary collapsible sections with
 * metadata-only document uploads. The whole record persists to localStorage under
 * `builderai_verification_<userId>`; status derives to 'ready' once all four
 * Tier-1 credentials validate and to 'submitted' only after the user presses
 * "Submit for verification" (which stamps submittedAt). Offers "Submit for
 * verification" and "Skip for now", both consuming any pending builderai_redirect.
 * Non-builders are redirected out.
 */
import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ShieldCheck, Check, ChevronDown, FileText, Upload, X,
  Landmark, FileBadge, Award, ArrowRight, Info, Loader2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';
import {
  RERA_STATES, authorityFor, ENTITY_TYPES, UPPERCASE_FIELDS,
  validatePan, validateGstin, validateReraNumber, validateEntityId,
  emptyRecord, isTier1Complete, deriveStatus, loadVerification, saveVerification,
} from '../lib/verification';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // ~5 MB
const ACCEPT = '.pdf,.jpg,.jpeg,.png';

/* ── Inline field with validation state (quiet check / specific hint) ───────── */
function TextField({ id, label, value, onChange, result, placeholder, mono, help }) {
  const state = result?.state || 'empty';
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className="relative">
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          aria-invalid={state === 'invalid'}
          className={`w-full px-3.5 py-2.5 pr-9 rounded-lg border text-sm outline-none transition-all
            ${mono ? 'font-mono tracking-wide tabular-nums' : ''}
            ${state === 'invalid'
              ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
              : state === 'valid'
                ? 'border-emerald-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
                : 'border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100'}`}
        />
        {state === 'valid' && (
          <Check size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
        )}
      </div>
      {state === 'invalid'
        ? <p className="mt-1 text-xs text-red-600" aria-live="polite">{result.hint}</p>
        : state === 'valid'
          ? <p className="mt-1 text-xs text-emerald-600" aria-live="polite">Looks valid.</p>
          : help ? <p className="mt-1 text-xs text-slate-400">{help}</p> : null}
    </div>
  );
}

/* ── Metadata-only file upload (no bytes leave the browser) ─────────────────── */
function UploadField({ id, label, meta, onPick, onClear }) {
  const [error, setError] = useState('');

  function handleFile(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-picking the same file
    if (!file) return;
    if (file.size > MAX_UPLOAD_BYTES) { setError('File is larger than 5 MB.'); return; }
    setError('');
    // ponytail: metadata-only uploads; real storage when backend verification review exists
    onPick({ name: file.name, size: file.size, type: file.type, addedAt: new Date().toISOString() });
  }

  return (
    <div>
      <p className="block text-sm font-medium text-slate-700 mb-1.5">{label}</p>
      {meta ? (
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border border-emerald-200 bg-emerald-50/60">
          <FileText size={16} className="text-emerald-600 shrink-0" />
          <span className="flex-1 min-w-0 text-sm text-slate-700 truncate">{meta.name}</span>
          <span className="font-mono text-[11px] text-slate-400 tabular-nums shrink-0">{(meta.size / 1024).toFixed(0)} KB</span>
          <button type="button" onClick={onClear} aria-label={`Remove ${label}`}
            className="w-6 h-6 rounded-md flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0">
            <X size={14} />
          </button>
        </div>
      ) : (
        <label htmlFor={id}
          className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border border-dashed border-slate-300 text-sm text-slate-500 cursor-pointer hover:border-brand-400 hover:bg-slate-50 transition-colors">
          <Upload size={16} className="text-slate-400 shrink-0" />
          <span>Upload PDF, JPG or PNG (max 5 MB)</span>
          <input id={id} type="file" accept={ACCEPT} onChange={handleFile} className="sr-only" />
        </label>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

/* ── Secondary collapsible section (Tiers 2–3) ─────────────────────────────── */
function Collapsible({ icon: Icon, tag, title, subtitle, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-xl border border-slate-200 bg-slate-50/50">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
          <Icon size={15} className="text-slate-500" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[10px] tracking-[0.16em] text-slate-400">{tag}</p>
          <p className="text-sm font-semibold text-slate-700">{title}</p>
        </div>
        <ChevronDown size={17} className={`text-slate-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-4">
          {subtitle && <p className="text-xs text-slate-500 leading-relaxed">{subtitle}</p>}
          {children}
        </div>
      )}
    </section>
  );
}

/* ── Page ──────────────────────────────────────────────────────────────────── */
export default function OnboardingVerification() {
  const { user, role, getAccessToken, refreshUser } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id;
  const [submitting, setSubmitting] = useState(false);

  const [record, setRecord] = useState(() => ({ ...emptyRecord(), ...(loadVerification(userId) || {}) }));
  const [showErrors, setShowErrors] = useState(false);

  // Persist on every change (localStorage-only, no backend).
  useEffect(() => {
    if (userId) saveVerification(userId, record);
  }, [userId, record]);

  // Only builders verify; send anyone else to their dashboard.
  if (role !== 'builder') {
    return <Navigate to={role === 'investor' ? '/investor-dashboard' : '/dashboard'} replace />;
  }

  function set(field, raw) {
    const value = UPPERCASE_FIELDS.includes(field) ? raw.toUpperCase() : raw;
    setRecord((r) => ({ ...r, [field]: value }));
  }

  // Validation results (force-shown after a failed submit even when empty).
  const reraRes = validateReraNumber(record.reraNumber);
  const panRes = validatePan(record.pan);
  const gstinRes = validateGstin(record.gstin);
  const entityRes = validateEntityId(record.entityId, record.entityType);
  const forceEmptyInvalid = (res, filledCond) =>
    showErrors && !filledCond ? { state: 'invalid', hint: 'Required to submit for verification.' } : res;

  const tier1Done = isTier1Complete(record);
  const status = deriveStatus(record);
  const addedCount =
    (record.reraState && reraRes.state === 'valid' ? 1 : 0) +
    (panRes.state === 'valid' ? 1 : 0) +
    (gstinRes.state === 'valid' ? 1 : 0) +
    (record.entityType && entityRes.state === 'valid' ? 1 : 0);

  const entityFmt = ENTITY_TYPES.find((t) => t.value === record.entityType)?.idFormat;
  const entityIdPlaceholder = entityFmt === 'cin' ? 'U70100MH2015PTC123456'
    : entityFmt === 'llpin' ? 'AAA-1234'
    : 'Firm registration / Udyam / GST-linked ID';

  function finish() {
    const dest = sessionStorage.getItem('builderai_redirect');
    sessionStorage.removeItem('builderai_redirect');
    navigate(dest || '/dashboard', { replace: true });
  }

  async function handleSubmit() {
    if (!tier1Done) {
      setShowErrors(true);
      toast.error('Add all four statutory credentials to submit for verification.');
      return;
    }
    if (submitting) return;
    const submitted = { ...record, submittedAt: new Date().toISOString() };

    setSubmitting(true);
    try {
      const at = getAccessToken?.();
      await apiFetch('/api/v1/users/me/verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(at ? { Authorization: `Bearer ${at}` } : {}) },
        body: JSON.stringify(submitted),
      }, 'Could not submit your verification.');
      // Only stamp the submit action locally AFTER the POST succeeds, so a failed
      // request never leaves localStorage marked 'submitted' while the server is
      // still 'unverified'. On failure the record stays un-stamped ('ready').
      setRecord(submitted);
      saveVerification(userId, submitted);
      // Pull the new verification_status ('pending') onto the user snapshot.
      try { await refreshUser?.(); } catch {}
      toast.success('Submitted for review');
      finish();
    } catch (err) {
      // Leave the user on the form with the record un-stamped so they can retry;
      // the Submit button re-enables via the finally block below.
      toast.error(err.message || 'Could not submit your verification. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative aurora bg-ink min-h-[calc(100dvh-56px)] overflow-hidden px-4 py-10">
      <div className="absolute inset-0 hero-dot-grid opacity-40 pointer-events-none" />

      <div className="relative z-10 w-full max-w-2xl mx-auto animate-fade-up">
        {/* Heading */}
        <div className="text-center mb-7">
          <p className="font-mono text-[11px] tracking-[0.22em] text-brand-300 mb-3">02 — VERIFICATION</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Verify your builder profile</h1>
          <p className="text-sm text-white/60 max-w-lg mx-auto">
            Add your statutory registrations to earn a verified badge. Everything except the four
            core credentials is optional — you can skip and complete this later from your profile.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lifted p-6 sm:p-8 space-y-7">

          {/* Progress + submitted banner */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="text-sm font-semibold text-slate-700">Statutory credentials</p>
              <p className="font-mono text-xs text-slate-500 tabular-nums">{addedCount} of 4 added</p>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-brand-gradient transition-all duration-500" style={{ width: `${(addedCount / 4) * 100}%` }} />
            </div>
            {status === 'submitted' && (
              <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-800 leading-relaxed">
                  <strong>Submitted for verification</strong> — our team reviews statutory registrations
                  against government portals (RERA, GST, MCA).
                </p>
              </div>
            )}
            {status === 'ready' && (
              <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-brand-200 bg-brand-50 px-3.5 py-3">
                <ShieldCheck size={16} className="text-brand-600 shrink-0 mt-0.5" />
                <p className="text-xs text-brand-800 leading-relaxed">
                  <strong>All four statutory credentials look valid</strong> — hit Submit for
                  verification when you're ready.
                </p>
              </div>
            )}
          </div>

          {/* ── Tier 1: statutory identity (primary) ──────────────────────── */}
          <section className="space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shrink-0">
                <Landmark size={15} className="text-white" />
              </div>
              <div>
                <p className="font-mono text-[10px] tracking-[0.16em] text-brand-600">TIER 1 — REQUIRED</p>
                <p className="text-sm font-semibold text-slate-800">Statutory identity</p>
              </div>
            </div>

            {/* RERA */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="reraState" className="block text-sm font-medium text-slate-700 mb-1.5">RERA state / authority</label>
                <select
                  id="reraState"
                  value={record.reraState}
                  onChange={(e) => set('reraState', e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all bg-white
                    ${showErrors && !record.reraState ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100'}`}
                >
                  <option value="">Select state / UT…</option>
                  {RERA_STATES.map((s) => (
                    <option key={s.value} value={s.value}>{s.value} — {s.authority}</option>
                  ))}
                </select>
                {record.reraState
                  ? <p className="mt-1 text-xs text-slate-500">Authority: <span className="font-medium text-slate-600">{authorityFor(record.reraState)}</span></p>
                  : <p className="mt-1 text-xs text-slate-400">Mandatory for projects &gt;500 sqm or &gt;8 units.</p>}
              </div>
              <TextField
                id="reraNumber" label="RERA registration number" mono
                value={record.reraNumber} onChange={(v) => set('reraNumber', v)}
                result={forceEmptyInvalid(reraRes, !!record.reraNumber)}
                placeholder="P51700000000" help="As printed on your RERA certificate."
              />
            </div>

            {/* PAN + GSTIN */}
            <div className="grid sm:grid-cols-2 gap-4">
              <TextField
                id="pan" label="PAN" mono
                value={record.pan} onChange={(v) => set('pan', v)}
                result={forceEmptyInvalid(panRes, !!record.pan)}
                placeholder="ABCDE1234F" help="Permanent Account Number of the entity."
              />
              <TextField
                id="gstin" label="GSTIN" mono
                value={record.gstin} onChange={(v) => set('gstin', v)}
                result={forceEmptyInvalid(gstinRes, !!record.gstin)}
                placeholder="22ABCDE1234F1Z5" help="15-character GST identification number."
              />
            </div>

            {/* Entity registration */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="entityType" className="block text-sm font-medium text-slate-700 mb-1.5">Entity type</label>
                <select
                  id="entityType"
                  value={record.entityType}
                  onChange={(e) => set('entityType', e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm outline-none transition-all bg-white
                    ${showErrors && !record.entityType ? 'border-red-300 focus:ring-red-100' : 'border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100'}`}
                >
                  <option value="">Select entity type…</option>
                  {ENTITY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-400">
                  {entityFmt === 'cin' ? 'Registered with the MCA — provide the CIN.'
                    : entityFmt === 'llpin' ? 'Registered as an LLP — provide the LLPIN.'
                    : 'Provide your firm registration ID.'}
                </p>
              </div>
              <TextField
                id="entityId" label="Registration ID" mono
                value={record.entityId} onChange={(v) => set('entityId', v)}
                result={forceEmptyInvalid(entityRes, !!record.entityId)}
                placeholder={entityIdPlaceholder}
                help={record.entityType ? '' : 'Select an entity type first.'}
              />
            </div>
          </section>

          {/* ── Tier 2: project & compliance track record (secondary) ─────── */}
          <Collapsible
            icon={FileBadge} tag="TIER 2 — RECOMMENDED"
            title="Project & compliance track record"
            subtitle="Not required to submit, but delivered-project and labour-compliance records strengthen your profile."
          >
            <UploadField
              id="completionCert" label="Completion / Occupancy Certificate"
              meta={record.completionCert}
              onPick={(m) => setRecord((r) => ({ ...r, completionCert: m }))}
              onClear={() => setRecord((r) => ({ ...r, completionCert: null }))}
            />
            <UploadField
              id="commencementCert" label="Commencement Certificate / building-plan approval"
              meta={record.commencementCert}
              onPick={(m) => setRecord((r) => ({ ...r, commencementCert: m }))}
              onClear={() => setRecord((r) => ({ ...r, commencementCert: null }))}
            />
            <div className="grid sm:grid-cols-3 gap-4">
              <TextField id="bocw" label="BOCW / labour licence no." value={record.bocw} onChange={(v) => set('bocw', v)} result={null} placeholder="Optional" />
              <TextField id="epf" label="EPF code" value={record.epf} onChange={(v) => set('epf', v)} result={null} placeholder="Optional" />
              <TextField id="esi" label="ESI code" value={record.esi} onChange={(v) => set('esi', v)} result={null} placeholder="Optional" />
            </div>
          </Collapsible>

          {/* ── Tier 3: industry credibility (optional) ───────────────────── */}
          <Collapsible
            icon={Award} tag="TIER 3 — OPTIONAL"
            title="Industry credibility"
            subtitle="Trade-body membership and quality certifications add extra trust signals."
          >
            <TextField
              id="membership" label="CREDAI / NAREDCO membership number"
              value={record.membership} onChange={(v) => set('membership', v)} result={null} placeholder="Optional"
            />
            <UploadField
              id="isoCert" label="ISO 9001:2015 certificate"
              meta={record.isoCert}
              onPick={(m) => setRecord((r) => ({ ...r, isoCert: m }))}
              onClear={() => setRecord((r) => ({ ...r, isoCert: null }))}
            />
          </Collapsible>

          {/* Info note */}
          <div className="flex items-start gap-2 text-xs text-slate-400">
            <Info size={13} className="shrink-0 mt-0.5" />
            <p>Documents stay on your device — only their names are recorded until a reviewer requests them.</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1">
            <button type="button" onClick={finish} disabled={submitting}
              className="sm:flex-1 py-3 rounded-xl text-sm font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-60">
              Skip for now
            </button>
            <button type="button" onClick={handleSubmit} disabled={submitting}
              className="btn-cta sm:flex-1 py-3 justify-center disabled:opacity-70 disabled:cursor-not-allowed">
              {submitting
                ? <><Loader2 size={16} className="animate-spin" /> Submitting…</>
                : <><ShieldCheck size={16} /> Submit for verification <ArrowRight size={15} /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
