/*
 * MyProjects.jsx — Project management page for builder users.
 *
 * Renders a grid of the builder's projects (MY_PROJECTS) with image, status
 * badge, funding progress bar, investor/view counters, and RERA indicator.
 * Supports full CRUD via an inline modal form (ProjectFormModal) for creating
 * and editing projects, and window.confirm-guarded deletion. State is managed
 * locally with useState. Accessible at /dashboard/projects.
 */
import { useState } from 'react';
import { Plus, Users, Eye, CheckCircle2, Pencil, Trash2, X } from 'lucide-react';
import { MY_PROJECTS, PROJECT_TYPES, PROJECT_CITIES } from '../../data/dashboard';

// ── Project Form Modal ────────────────────────────────────────────────────────
function ProjectFormModal({ project, onSave, onClose }) {
  const [form, setForm] = useState({
    name:           project?.name            || '',
    project_type:   project?.project_type    || '',
    city:           project?.city            || '',
    location:       project?.location        || '',
    funding_target: project?.funding_target  || '',
    roi_projected:  project?.roi_projected   || '',
    description:    project?.description     || '',
    rera_approved:  project?.rera_approved   || false,
    image_url:      project?.image_url       || '',
  });

  function set(key, val) { setForm((f) => ({ ...f, [key]: val })); }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({ ...form, id: project?.id || `proj-${Date.now()}`, status: 'active',
              funding_raised: project?.funding_raised || 0,
              investor_count: project?.investor_count || 0,
              view_count: project?.view_count || 0 });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">
            {project ? 'Edit Project' : 'Add New Project'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. Skyline Towers"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-400 transition-colors"
            />
          </div>

          {/* Type + City */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Project Type</label>
              <select
                value={form.project_type}
                onChange={(e) => set('project_type', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-brand-400 transition-colors bg-white"
              >
                <option value="">Select type</option>
                {PROJECT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">City</label>
              <select
                value={form.city}
                onChange={(e) => set('city', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-brand-400 transition-colors bg-white"
              >
                <option value="">Select city</option>
                {PROJECT_CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Location / Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Area / Location</label>
            <input
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              placeholder="e.g. Worli, BKC"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-400 transition-colors"
            />
          </div>

          {/* Funding Target + ROI */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Funding Target (₹ Cr) <span className="text-red-500">*</span>
              </label>
              <input
                required type="number" min="1"
                value={form.funding_target}
                onChange={(e) => set('funding_target', e.target.value)}
                placeholder="e.g. 250"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-400 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Projected ROI (%)</label>
              <input
                type="number" min="0" max="100"
                value={form.roi_projected}
                onChange={(e) => set('roi_projected', e.target.value)}
                placeholder="e.g. 18"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-400 transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Describe the project..."
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-400 transition-colors resize-none"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Project Image URL</label>
            <input
              value={form.image_url}
              onChange={(e) => set('image_url', e.target.value)}
              placeholder="https://..."
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-400 transition-colors"
            />
          </div>

          {/* RERA */}
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.rera_approved}
              onChange={(e) => set('rera_approved', e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-slate-700 font-medium">RERA Approved</span>
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg,#0d9488,#14c38e)' }}
            >
              {project ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Project Card ─────────────────────────────────────────────────────────────
function ProjectCard({ project, onEdit, onDelete }) {
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
        {project.image_url ? (
          <img src={project.image_url} alt={project.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-100 to-brand-50 flex items-center justify-center">
            <span className="text-brand-300 text-4xl">🏗️</span>
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
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${pct}%`,
                background: 'linear-gradient(to right,#f97316,#f59e0b)',
              }}
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

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => onEdit(project)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-brand-200 text-xs font-semibold text-brand-700 hover:bg-brand-50 transition-colors"
          >
            <Pencil size={12} /> Manage
          </button>
          <button
            onClick={() => onDelete(project.id)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-red-100 text-red-400 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── My Projects Page ──────────────────────────────────────────────────────────
export default function MyProjects() {
  const [projects, setProjects] = useState(MY_PROJECTS);
  const [modal,    setModal]    = useState(null); // null | 'create' | project obj

  function handleSave(data) {
    if (data.id && projects.find((p) => p.id === data.id)) {
      setProjects((prev) => prev.map((p) => (p.id === data.id ? data : p)));
    } else {
      setProjects((prev) => [data, ...prev]);
    }
    setModal(null);
  }

  function handleDelete(id) {
    if (window.confirm('Delete this project?')) {
      setProjects((prev) => prev.filter((p) => p.id !== id));
    }
  }

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">My Projects</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage all your projects in one place</p>
        </div>
        <button
          onClick={() => setModal('create')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-md"
          style={{ background: 'linear-gradient(135deg,#0d9488,#14c38e)' }}
        >
          <Plus size={15} /> Add New Project
        </button>
      </div>

      {/* Grid */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400">
          <span className="text-5xl mb-4">🏗️</span>
          <p className="font-semibold text-slate-600">No projects yet</p>
          <p className="text-sm mt-1">Click "Add New Project" to get started.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onEdit={setModal}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <ProjectFormModal
          project={modal === 'create' ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
