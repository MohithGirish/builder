/*
 * VerificationCredentials.jsx — Definition list of a builder's submitted credentials.
 *
 * Renders a verification_data record (Tier-1 RERA/PAN/GSTIN/entity plus any
 * Tier-2/3 extras and uploaded certificate names) as label/value rows, with
 * mono formatting on statutory numbers. Shared by the admin user-detail and
 * verifications pages so the credential layout stays identical.
 */
import { authorityFor, ENTITY_TYPES } from '../../lib/verification';

function Row({ label, value, mono }) {
  if (!value) return null;
  return (
    <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-3 py-2 border-b border-slate-50 last:border-0">
      <dt className="text-xs font-medium text-slate-400 sm:w-48 shrink-0">{label}</dt>
      <dd className={`text-sm text-slate-700 ${mono ? 'font-mono tracking-wide tabular-nums' : ''}`}>{value}</dd>
    </div>
  );
}

export default function VerificationCredentials({ data }) {
  if (!data) return null;
  const entityLabel = ENTITY_TYPES.find((t) => t.value === data.entityType)?.label;
  return (
    <dl>
      <Row label="RERA State / Authority" value={data.reraState ? `${data.reraState} — ${authorityFor(data.reraState)}` : ''} />
      <Row label="RERA Number" value={data.reraNumber} mono />
      <Row label="PAN" value={data.pan} mono />
      <Row label="GSTIN" value={data.gstin} mono />
      <Row label="Entity Type" value={entityLabel} />
      <Row label="Registration ID" value={data.entityId} mono />
      <Row label="BOCW / Labour Licence" value={data.bocw} mono />
      <Row label="EPF Code" value={data.epf} mono />
      <Row label="ESI Code" value={data.esi} mono />
      <Row label="CREDAI / NAREDCO No." value={data.membership} mono />
      <Row label="Completion Certificate" value={data.completionCert?.name} />
      <Row label="Commencement Certificate" value={data.commencementCert?.name} />
      <Row label="ISO 9001 Certificate" value={data.isoCert?.name} />
    </dl>
  );
}
