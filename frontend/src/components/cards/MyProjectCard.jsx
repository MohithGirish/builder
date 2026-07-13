/*
 * MyProjectCard.jsx — Display card for a builder's listed project (dashboard shape).
 *
 * Renders image (with placeholder fallback), status badge, funding progress bar,
 * investor/view counters, and RERA indicator for one project in the shape
 * returned by lib/projects.js shapeProject(). When `onEdit`/`onDelete` handlers are
 * passed it shows Manage/Delete actions (with inline delete confirmation);
 * without them it renders read-only. Used by MyProjects (manage) and the
 * builder Profile (read-only listing).
 */
import { useState } from 'react';
import { Users, Eye, CheckCircle2, Pencil, Trash2, Building2, AlertTriangle } from 'lucide-react';

export default function MyProjectCard({ project, onEdit, onDelete }) {
  const [imgError,      setImgError]      = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const pct = project.funding_target > 0
    ? Math.min(100, Math.round((project.funding_raised / project.funding_target) * 100))
    : 0;

  const statusMap = {
    active:    { label: 'Active Funding', color: 'bg-green-500' },
    completed: { label: 'Completed',      color: 'bg-brand-500' },
    paused:    { label: 'Paused',         color: 'bg-slate-400' },
    draft:     { label: 'Draft',          color: 'bg-amber-500' },
  };
  const st = statusMap[project.status] || statusMap.draft;

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover transition-shadow duration-300">
      {/* Image */}
      <div className="relative h-44">
        {project.image_url && !imgError ? (
          <img
            src={project.image_url}
            alt={project.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center">
            <Building2 size={40} className="text-brand-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold text-white ${st.color}`}>
          {st.label}
        </span>
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="text-sm font-bold text-slate-800">{project.name}</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          {project.project_type} · {project.location || project.city}
        </p>

        {/* Progress */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span>₹{project.funding_raised} Cr / ₹{project.funding_target} Cr</span>
            <span className="font-semibold text-slate-700">{pct}% funded</span>
          </div>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 bg-cta-gradient"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-3">
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Users size={12} /> {project.investor_count}
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <Eye size={12} /> {project.view_count.toLocaleString()}
          </span>
          {project.rera_approved && (
            <span className="flex items-center gap-1 text-[11px] text-brand-600 font-medium">
              <CheckCircle2 size={11} /> RERA
            </span>
          )}
        </div>

        {/* Actions — only when management handlers are provided */}
        {(onEdit || onDelete) && (
          confirmDelete ? (
            <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200">
              <p className="text-xs font-semibold text-red-700 flex items-center gap-1 mb-2">
                <AlertTriangle size={12} /> Delete this project?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 py-1.5 rounded-lg border border-red-200 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onDelete(project.id)}
                  className="flex-1 py-1.5 rounded-lg bg-red-500 text-xs font-semibold text-white hover:bg-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => onEdit(project)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-brand-200 text-xs font-semibold text-brand-700 hover:bg-brand-50 transition-colors cursor-pointer"
              >
                <Pencil size={12} /> Manage
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                aria-label={`Delete project ${project.name}`}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-red-100 text-red-400 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
