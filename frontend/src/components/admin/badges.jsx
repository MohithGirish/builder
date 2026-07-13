/*
 * badges.jsx — Small status badge components for the admin console.
 *
 * Exports VerificationBadge (unverified / pending / approved / rejected),
 * ActiveBadge (active / suspended) and ProjectStatusBadge (draft / active /
 * paused / completed) — each a coloured pill matching the design system's muted
 * palette. Shared across the admin users, verifications and projects pages so
 * status colours stay consistent.
 */
import { ShieldCheck, Clock, ShieldAlert, ShieldX, CheckCircle2, Ban } from 'lucide-react';

const VERIFY = {
  approved:   { label: 'Verified',   cls: 'text-emerald-700 bg-emerald-50 border-emerald-200', Icon: ShieldCheck },
  pending:    { label: 'Pending',    cls: 'text-amber-700 bg-amber-50 border-amber-200',       Icon: Clock },
  rejected:   { label: 'Rejected',   cls: 'text-red-700 bg-red-50 border-red-200',             Icon: ShieldX },
  unverified: { label: 'Unverified', cls: 'text-slate-500 bg-slate-50 border-slate-200',       Icon: ShieldAlert },
};

export function VerificationBadge({ status }) {
  const s = VERIFY[status] || VERIFY.unverified;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${s.cls}`}>
      <s.Icon size={11} /> {s.label}
    </span>
  );
}

export function ActiveBadge({ active }) {
  return active ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200">
      <CheckCircle2 size={11} /> Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200">
      <Ban size={11} /> Suspended
    </span>
  );
}

const PROJECT_STATUS = {
  draft:     'text-slate-600 bg-slate-100 border-slate-200',
  active:    'text-emerald-700 bg-emerald-50 border-emerald-200',
  paused:    'text-amber-700 bg-amber-50 border-amber-200',
  completed: 'text-brand-700 bg-brand-50 border-brand-200',
};

export function ProjectStatusBadge({ status }) {
  const cls = PROJECT_STATUS[status] || PROJECT_STATUS.draft;
  const label = status ? status[0].toUpperCase() + status.slice(1) : 'Draft';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${cls}`}>
      {label}
    </span>
  );
}
