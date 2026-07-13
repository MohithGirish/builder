/*
 * AdminUsers.jsx — Admin user directory (/admin/users).
 *
 * Fetches GET /api/v1/users with debounced search + role/status filters and
 * page-based pagination. Renders a table of users (name, mono email, role,
 * verification + active badges, joined date); clicking a row opens the detail
 * page. Each row has a Suspend / Reactivate action guarded by a confirm dialog
 * that calls PUT /api/v1/users/:id/status, toasts, and refreshes the list. An
 * admin cannot suspend their own account (the control is hidden for that row).
 */
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Search, ChevronLeft, ChevronRight, UserCog, Ban, RotateCcw, Users as UsersIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAuthedApi } from '../../lib/useAuthedApi';
import Listbox from '../../components/admin/Listbox';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { VerificationBadge, ActiveBadge } from '../../components/admin/badges';

const LIMIT = 15;
const ROLE_OPTS = [
  { value: '', label: 'All Roles' },
  { value: 'builder', label: 'Builder' },
  { value: 'investor', label: 'Investor' },
  { value: 'admin', label: 'Admin' },
];
const STATUS_OPTS = [
  { value: '', label: 'All Status' },
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Suspended' },
];

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminUsers() {
  const { user: me, authedFetch } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch]   = useState('');
  const [debounced, setDebounced] = useState('');
  const [role, setRole]       = useState('');
  const [active, setActive]   = useState('');
  const [page, setPage]       = useState(1);
  const [target, setTarget]   = useState(null); // user pending suspend/reactivate confirm
  const [busy, setBusy]       = useState(false);

  // Debounce the search box (~300ms) and reset to page 1 on any filter change.
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);
  useEffect(() => { setPage(1); }, [debounced, role, active]);

  const path = useMemo(() => {
    const p = new URLSearchParams({ page: String(page), limit: String(LIMIT) });
    if (debounced) p.set('search', debounced);
    if (role)      p.set('role', role);
    if (active)    p.set('is_active', active);
    return `/api/v1/users?${p.toString()}`;
  }, [page, debounced, role, active]);

  const { data, loading, error, refetch } = useAuthedApi(path);
  const users      = data?.data?.users || [];
  const pagination = data?.data?.pagination || { page: 1, pages: 1, total: 0 };

  async function handleToggle() {
    if (!target) return;
    setBusy(true);
    try {
      await authedFetch(`/api/v1/users/${target.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !target.is_active }),
      }, 'Could not update the user.');
      toast.success(target.is_active ? 'User suspended' : 'User reactivated');
      setTarget(null);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not update the user.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Users</h1>
        <p className="text-sm text-slate-500 mt-0.5">Search, filter and moderate platform accounts</p>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-100 px-4 py-3 flex flex-wrap items-center gap-3 mb-5">
        <div className="flex-1 min-w-[180px] relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-400 placeholder-slate-400 transition-all"
          />
        </div>
        <div className="h-6 w-px bg-slate-100 hidden sm:block" />
        <Listbox icon={UserCog} value={role}   options={ROLE_OPTS}   onChange={setRole}   ariaLabel="Filter by role" />
        <Listbox value={active} options={STATUS_OPTS} onChange={setActive} ariaLabel="Filter by status" />
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Loading users…</div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-card border border-slate-100">
          <p className="font-semibold text-slate-600 mb-1">Couldn't load users</p>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-card border border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <UsersIcon size={22} className="text-slate-400" />
          </div>
          <p className="font-semibold text-slate-600 mb-1">No users found</p>
          <p className="text-slate-400 text-sm">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100">
                    <th className="px-4 py-3 font-semibold">User</th>
                    <th className="px-4 py-3 font-semibold">Role</th>
                    <th className="px-4 py-3 font-semibold">Verification</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Joined</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isSelf = u.id === me?.id;
                    return (
                      <tr
                        key={u.id}
                        onClick={() => navigate(`/admin/users/${u.id}`)}
                        className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-800">{u.first_name} {u.last_name}</p>
                          <p className="font-mono text-[11px] text-slate-400 truncate max-w-[220px]">{u.email}</p>
                        </td>
                        <td className="px-4 py-3 capitalize text-slate-600">{u.role}</td>
                        <td className="px-4 py-3"><VerificationBadge status={u.verification_status} /></td>
                        <td className="px-4 py-3"><ActiveBadge active={u.is_active} /></td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{fmtDate(u.created_at)}</td>
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          {isSelf ? (
                            <span className="text-[11px] text-slate-400 italic">You</span>
                          ) : u.is_active ? (
                            <button
                              onClick={() => setTarget(u)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
                            >
                              <Ban size={13} /> Suspend
                            </button>
                          ) : (
                            <button
                              onClick={() => setTarget(u)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-brand-700 border border-brand-200 hover:bg-brand-50 transition-colors"
                            >
                              <RotateCcw size={13} /> Reactivate
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-slate-400">{pagination.total} user{pagination.total === 1 ? '' : 's'} total</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} /> Prev
              </button>
              <span className="text-xs text-slate-500 tabular-nums">Page {pagination.page} of {pagination.pages || 1}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={pagination.page >= (pagination.pages || 1)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}

      {target && (
        <ConfirmDialog
          title={target.is_active ? 'Suspend user' : 'Reactivate user'}
          message={target.is_active
            ? `Suspend ${target.first_name} ${target.last_name}? They will lose access until reactivated.`
            : `Reactivate ${target.first_name} ${target.last_name}? They will regain access to their account.`}
          confirmLabel={target.is_active ? 'Suspend' : 'Reactivate'}
          danger={target.is_active}
          loading={busy}
          onConfirm={handleToggle}
          onClose={() => (busy ? null : setTarget(null))}
        />
      )}
    </div>
  );
}
