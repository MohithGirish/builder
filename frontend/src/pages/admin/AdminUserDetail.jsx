/*
 * AdminUserDetail.jsx — Admin single-user view (/admin/users/:id).
 *
 * Fetches GET /api/v1/users/:id and shows an identity card (name, mono email,
 * role, joined date, active + verification badges, rejection reason). For
 * builders with submitted verification_data it renders the Tier-1 statutory
 * credentials as a definition list (mono for numbers) plus any Tier-2/3 extras.
 * Includes a Suspend / Reactivate action (confirm dialog → PUT status) and a
 * back link to the user directory.
 */
import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Mail, Ban, RotateCcw, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAuthedApi } from '../../lib/useAuthedApi';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { VerificationBadge, ActiveBadge } from '../../components/admin/badges';
import VerificationCredentials from '../../components/admin/VerificationCredentials';

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminUserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: me, authedFetch } = useAuth();

  const { data, loading, error, refetch } = useAuthedApi(`/api/v1/users/${id}`);
  const user = data?.data?.user || data?.data || null;

  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleToggle() {
    if (!user) return;
    setBusy(true);
    try {
      await authedFetch(`/api/v1/users/${user.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !user.is_active }),
      }, 'Could not update the user.');
      toast.success(user.is_active ? 'User suspended' : 'User reactivated');
      setConfirm(false);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not update the user.');
    } finally {
      setBusy(false);
    }
  }

  const vdata = user?.verification_data || null;

  return (
    <div className="p-4 sm:p-6 max-w-3xl">
      <Link to="/admin/users" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800 mb-4">
        <ArrowLeft size={14} /> Back to Users
      </Link>

      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Loading user…</div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-card border border-slate-100">
          <p className="font-semibold text-slate-600 mb-1">Couldn't load user</p>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      ) : !user ? (
        <div className="text-center py-16 text-slate-400 text-sm">User not found.</div>
      ) : (
        <div className="space-y-5">
          {/* Identity */}
          <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0 bg-brand-gradient">
                {((user.first_name?.[0] || '') + (user.last_name?.[0] || '')).toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold text-slate-800">{user.first_name} {user.last_name}</h1>
                <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
                  <Mail size={13} /> <span className="font-mono text-[13px] truncate">{user.email}</span>
                </p>
                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 capitalize">
                    {user.role}
                  </span>
                  <ActiveBadge active={user.is_active} />
                  <VerificationBadge status={user.verification_status} />
                </div>
                <p className="text-xs text-slate-400 mt-2.5">Joined {fmtDate(user.created_at)}</p>
                {user.verification_status === 'rejected' && user.verification_reason && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
                    <p className="text-xs text-red-700 leading-relaxed">
                      <strong>Rejection reason:</strong> {user.verification_reason}
                    </p>
                  </div>
                )}
              </div>
              {user.id !== me?.id && (
                <button
                  onClick={() => setConfirm(true)}
                  className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                    user.is_active
                      ? 'text-red-600 border-red-200 hover:bg-red-50'
                      : 'text-brand-700 border-brand-200 hover:bg-brand-50'
                  }`}
                >
                  {user.is_active ? <><Ban size={13} /> Suspend</> : <><RotateCcw size={13} /> Reactivate</>}
                </button>
              )}
            </div>
          </div>

          {/* Verification credentials */}
          {vdata && (
            <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-6">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mb-4">
                <ShieldCheck size={15} className="text-brand-600" /> Submitted Credentials
              </h2>
              <VerificationCredentials data={vdata} />
            </div>
          )}
        </div>
      )}

      {confirm && user && (
        <ConfirmDialog
          title={user.is_active ? 'Suspend user' : 'Reactivate user'}
          message={user.is_active
            ? `Suspend ${user.first_name} ${user.last_name}? They will lose access until reactivated.`
            : `Reactivate ${user.first_name} ${user.last_name}? They will regain access to their account.`}
          confirmLabel={user.is_active ? 'Suspend' : 'Reactivate'}
          danger={user.is_active}
          loading={busy}
          onConfirm={handleToggle}
          onClose={() => (busy ? null : setConfirm(false))}
        />
      )}
    </div>
  );
}
