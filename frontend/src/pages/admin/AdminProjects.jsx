/*
 * AdminProjects.jsx — Admin project moderation table (/admin/projects).
 *
 * Fetches GET /api/v1/projects (admin sees every status) with page-based
 * pagination and lists each project: name, builder, city, type, status badge,
 * funding target/raised and created date. Row actions: Pause/Resume (confirm →
 * PATCH { status }) toggling active↔paused, and Delete (warning confirm →
 * DELETE). Both toast and refresh. Loading, error and empty states included.
 */
import { useState } from 'react';
import { toast } from 'sonner';
import { Pause, Play, Trash2, FolderKanban, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAuthedApi } from '../../lib/useAuthedApi';
import ConfirmDialog from '../../components/admin/ConfirmDialog';
import { ProjectStatusBadge } from '../../components/admin/badges';

const LIMIT = 15;

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function builderName(p) {
  if (p.builder) {
    const n = `${p.builder.first_name || ''} ${p.builder.last_name || ''}`.trim();
    if (n) return n;
  }
  return p.developer || '—';
}

function fmtFunding(p) {
  const target = p.funding_target;
  const raised = p.funding_raised;
  if (target == null && raised == null) return '—';
  return `${raised ?? 0} / ${target ?? '—'}`;
}

export default function AdminProjects() {
  const { authedFetch } = useAuth();
  const [page, setPage] = useState(1);
  const { data, loading, error, refetch } = useAuthedApi(`/api/v1/projects?page=${page}&limit=${LIMIT}`);
  const projects   = data?.data?.projects || [];
  const pagination = data?.data?.pagination || { page: 1, pages: 1, total: 0 };

  const [toggleTarget, setToggleTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleToggle() {
    if (!toggleTarget) return;
    const next = toggleTarget.status === 'paused' ? 'active' : 'paused';
    setBusy(true);
    try {
      await authedFetch(`/api/v1/projects/${toggleTarget.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      }, 'Could not update the project.');
      toast.success(next === 'paused' ? 'Project paused' : 'Project resumed');
      setToggleTarget(null);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not update the project.');
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setBusy(true);
    try {
      await authedFetch(`/api/v1/projects/${deleteTarget.id}`, {
        method: 'DELETE',
      }, 'Could not delete the project.');
      toast.success('Project deleted');
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Could not delete the project.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Projects</h1>
        <p className="text-sm text-slate-500 mt-0.5">Moderate every listed project across the platform</p>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Loading projects…</div>
      ) : error ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-card border border-slate-100">
          <p className="font-semibold text-slate-600 mb-1">Couldn't load projects</p>
          <p className="text-slate-400 text-sm">{error}</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-card border border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
            <FolderKanban size={22} className="text-slate-400" />
          </div>
          <p className="font-semibold text-slate-600 mb-1">No projects yet</p>
          <p className="text-slate-400 text-sm">Projects listed by builders will appear here.</p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-card border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wide text-slate-400 border-b border-slate-100">
                    <th className="px-4 py-3 font-semibold">Project</th>
                    <th className="px-4 py-3 font-semibold">Builder</th>
                    <th className="px-4 py-3 font-semibold">City</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold whitespace-nowrap">Raised / Target</th>
                    <th className="px-4 py-3 font-semibold">Created</th>
                    <th className="px-4 py-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => {
                    const canToggle = p.status === 'active' || p.status === 'paused';
                    return (
                      <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/70 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-800">{p.name || 'Untitled'}</p>
                          <p className="text-[11px] text-slate-400">{p.project_type || p.type || '—'}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{builderName(p)}</td>
                        <td className="px-4 py-3 text-slate-600">{p.city || '—'}</td>
                        <td className="px-4 py-3"><ProjectStatusBadge status={p.status} /></td>
                        <td className="px-4 py-3 font-mono text-[12px] text-slate-600 tabular-nums whitespace-nowrap">{fmtFunding(p)}</td>
                        <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{fmtDate(p.created_at)}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {canToggle && (
                              <button
                                onClick={() => setToggleTarget(p)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-colors"
                              >
                                {p.status === 'paused' ? <><Play size={13} /> Resume</> : <><Pause size={13} /> Pause</>}
                              </button>
                            )}
                            <button
                              onClick={() => setDeleteTarget(p)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 size={13} /> Delete
                            </button>
                          </div>
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
            <p className="text-xs text-slate-400">{pagination.total} project{pagination.total === 1 ? '' : 's'} total</p>
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

      {toggleTarget && (
        <ConfirmDialog
          title={toggleTarget.status === 'paused' ? 'Resume project' : 'Pause project'}
          message={toggleTarget.status === 'paused'
            ? `Resume "${toggleTarget.name}"? It will be visible to investors again.`
            : `Pause "${toggleTarget.name}"? It will be hidden from investor discovery until resumed.`}
          confirmLabel={toggleTarget.status === 'paused' ? 'Resume' : 'Pause'}
          loading={busy}
          onConfirm={handleToggle}
          onClose={() => (busy ? null : setToggleTarget(null))}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete project"
          danger
          message={`Permanently delete "${deleteTarget.name}"? This removes the listing for everyone and cannot be undone.`}
          confirmLabel="Delete"
          loading={busy}
          onConfirm={handleDelete}
          onClose={() => (busy ? null : setDeleteTarget(null))}
        />
      )}
    </div>
  );
}
