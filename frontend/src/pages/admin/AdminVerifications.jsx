/*
 * AdminVerifications.jsx — Builder verification review queue (/admin/verifications).
 *
 * Status-tabbed list (Pending default | Approved | Rejected) fetched from
 * GET /api/v1/admin/verifications?status=. Each entry shows the builder's name,
 * mono email, submitted date and full submitted credentials. Pending entries
 * offer Approve (confirm → PATCH { action:'approve' }) and Reject (reason-
 * required modal → PATCH { action:'reject', reason }); both toast and refresh.
 */
import { useState } from 'react';
import { toast } from 'sonner';
import { ShieldCheck, Check, X, Mail, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAuthedApi } from '../../lib/useAuthedApi';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import VerificationCredentials from '../../components/admin/VerificationCredentials';

const TABS = [
  { value: 'pending',  label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminVerifications() {
  const { authedFetch } = useAuth();
  const [status, setStatus] = useState('pending');
  const { data, loading, error, refetch } = useAuthedApi(`/api/v1/admin/verifications?status=${status}`);
  const users = data?.data?.users || data?.data || [];

  const [approveTarget, setApproveTarget] = useState(null);
  const [rejectTarget, setRejectTarget]   = useState(null);
  const [reason, setReason] = useState('');
  const [busy, setBusy]     = useState(false);

  async function patch(userId, body, successMsg) {
    setBusy(true);
    try {
      await authedFetch(`/api/v1/admin/verifications/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }, 'Could not update the verification.');
      toast.success(successMsg);
      setApproveTarget(null);
      setRejectTarget(null);
      setReason('');
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not update the verification.');
    } finally {
      setBusy(false);
    }
  }

  function handleReject() {
    if (!reason.trim()) { toast.error('Please provide a reason for rejection.'); return; }
    patch(rejectTarget.id, { action: 'reject', reason: reason.trim() }, 'Verification rejected');
  }

  return (
    <div className="p-4 sm:p-6 max-w-3xl">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Verifications</h1>
        <p className="text-sm text-slate-500 mt-0.5">Review builder statutory credentials</p>
      </div>

      {/* Status tabs */}
      <div className="flex items-center gap-1 mb-5 border-b border-slate-100">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setStatus(t.value)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              status === t.value
                ? 'text-brand-700 border-brand-600'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Loading verifications…</div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-card border border-slate-100">
          <p className="font-semibold text-slate-600 mb-1">Couldn't load verifications</p>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-card border border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck size={22} className="text-slate-400" />
          </div>
          <p className="font-semibold text-slate-600 mb-1">
            {status === 'pending' ? 'No pending verifications' : `No ${status} verifications`}
          </p>
          <p className="text-slate-400 text-sm">Nothing to review here right now.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {users.map((u) => (
            <div key={u.id} className="bg-white rounded-2xl shadow-card border border-slate-100 p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-full bg-brand-gradient flex items-center justify-center text-sm font-bold text-white shrink-0">
                    {((u.first_name?.[0] || '') + (u.last_name?.[0] || '')).toUpperCase() || '?'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{u.first_name} {u.last_name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Mail size={11} /> <span className="font-mono">{u.email}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
                      <Clock size={10} /> Submitted {fmtDate(u.verification_submitted_at)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <VerificationCredentials data={u.verification_data} />
              </div>

              {status === 'pending' && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => setApproveTarget(u)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors"
                  >
                    <Check size={15} /> Approve
                  </button>
                  <button
                    onClick={() => { setRejectTarget(u); setReason(''); }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
                  >
                    <X size={15} /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {approveTarget && (
        <ConfirmDialog
          title="Approve verification"
          message={`Approve ${approveTarget.first_name} ${approveTarget.last_name}'s builder verification? They will be marked verified and able to list projects.`}
          confirmLabel="Approve"
          loading={busy}
          onConfirm={() => patch(approveTarget.id, { action: 'approve' }, 'Verification approved')}
          onClose={() => (busy ? null : setApproveTarget(null))}
        />
      )}

      {rejectTarget && (
        <ConfirmDialog
          title="Reject verification"
          danger
          confirmLabel="Reject"
          loading={busy}
          onConfirm={handleReject}
          onClose={() => (busy ? null : setRejectTarget(null))}
        >
          <p className="text-sm text-slate-700 mb-3">
            Reject {rejectTarget.first_name} {rejectTarget.last_name}'s verification. Share a reason — the builder will see it.
          </p>
          <textarea
            autoFocus
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. RERA number could not be matched on the state portal."
            className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition-all resize-none"
          />
        </ConfirmDialog>
      )}
    </div>
  );
}
