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
import { Plus, X, Building2 } from 'lucide-react';
import { MY_PROJECTS, PROJECT_TYPES, PROJECT_CITIES } from '../../data/dashboard';
import { useAuth } from '../../context/AuthContext';
import { EINFRA_LISTINGS, isEinfraBuilder } from '../../data/realProjects';
import MyProjectCard from '../../components/cards/MyProjectCard';

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
          <button onClick={onClose} aria-label="Close dialog" className="w-11 h-11 -m-2 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
          {/* Name */}
          <div>
            <label htmlFor="proj-name" className="block text-xs font-semibold text-slate-600 mb-1.5">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              id="proj-name"
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
              <label htmlFor="proj-type" className="block text-xs font-semibold text-slate-600 mb-1.5">Project Type</label>
              <select
                id="proj-type"
                value={form.project_type}
                onChange={(e) => set('project_type', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 focus:outline-none focus:border-brand-400 transition-colors bg-white"
              >
                <option value="">Select type</option>
                {PROJECT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="proj-city" className="block text-xs font-semibold text-slate-600 mb-1.5">City</label>
              <select
                id="proj-city"
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
            <label htmlFor="proj-location" className="block text-xs font-semibold text-slate-600 mb-1.5">Area / Location</label>
            <input
              id="proj-location"
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              placeholder="e.g. Worli, BKC"
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-400 transition-colors"
            />
          </div>

          {/* Funding Target + ROI */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="proj-funding-target" className="block text-xs font-semibold text-slate-600 mb-1.5">
                Funding Target (₹ Cr) <span className="text-red-500">*</span>
              </label>
              <input
                id="proj-funding-target"
                required type="number" min="1"
                value={form.funding_target}
                onChange={(e) => set('funding_target', e.target.value)}
                placeholder="e.g. 250"
                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-400 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="proj-roi" className="block text-xs font-semibold text-slate-600 mb-1.5">Projected ROI (%)</label>
              <input
                id="proj-roi"
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
            <label htmlFor="proj-description" className="block text-xs font-semibold text-slate-600 mb-1.5">Description</label>
            <textarea
              id="proj-description"
              rows={3}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Describe the project..."
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-400 transition-colors resize-none"
            />
          </div>

          {/* Image URL */}
          <div>
            <label htmlFor="proj-image-url" className="block text-xs font-semibold text-slate-600 mb-1.5">Project Image URL</label>
            <input
              id="proj-image-url"
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
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 bg-brand-gradient"
            >
              {project ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── My Projects Page ──────────────────────────────────────────────────────────
export default function MyProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState(() => isEinfraBuilder(user) ? EINFRA_LISTINGS : MY_PROJECTS);
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
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">My Projects</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage all your projects in one place</p>
        </div>
        <button
          onClick={() => setModal('create')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-md shrink-0 bg-brand-gradient"
        >
          <Plus size={15} /> Add New Project
        </button>
      </div>

      {/* Grid */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <Building2 size={28} className="text-slate-300" />
          </div>
          <h3 className="font-semibold text-slate-700 mb-1">No projects yet</h3>
          <p className="text-sm text-slate-500 mb-5 max-w-xs">
            Create your first project to get started and attract investors.
          </p>
          <button
            onClick={() => setModal('create')}
            className="btn-brand px-6 py-2.5 text-sm"
          >
            <Plus size={15} /> New Project
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map((p) => (
            <MyProjectCard
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
