/*
 * MyProjects.jsx — Project management page for builder users.
 *
 * Renders a grid of the builder's projects (MY_PROJECTS) with image, status
 * badge, funding progress bar, investor/view counters, and RERA indicator.
 * Supports full CRUD via an inline modal form (ProjectFormModal) for creating
 * and editing projects, and window.confirm-guarded deletion. The form is a
 * sectioned listing editor mirroring the public project-detail page, with no
 * required fields, plus an "Upload Brochure" button that calls the backend AI
 * (POST /api/v1/brochure/extract) to pre-fill what it can. Accessible at
 * /dashboard/projects.
 */
import { useState, useRef } from 'react';
import { Plus, X, Building2, Upload, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { MY_PROJECTS, PROJECT_TYPES, PROJECT_CITIES } from '../../data/dashboard';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';
import { EINFRA_LISTINGS, isEinfraBuilder } from '../../data/realProjects';
import MyProjectCard from '../../components/cards/MyProjectCard';

const MAX_BROCHURE_BYTES = 20 * 1024 * 1024; // matches the backend / Claude limit
const CATEGORIES = ['residential', 'commercial', 'mixed-use', 'infrastructure'];

const inputCls =
  'w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-400 transition-colors';

// ── Small form primitives (collapse ~8 lines of label+input into one call) ─────
function Field({ label, value, onChange, placeholder, type = 'text', full, options }) {
  const id = `pf-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  const listId = options ? `${id}-list` : undefined;
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
      <input
        id={id} type={type} list={listId} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)} className={inputCls}
      />
      {options && <datalist id={listId}>{options.map((o) => <option key={o} value={o} />)}</datalist>}
    </div>
  );
}

function AreaField({ label, value, onChange, placeholder, rows = 3 }) {
  const id = `pf-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <div className="sm:col-span-2">
      <label htmlFor={id} className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
      <textarea
        id={id} rows={rows} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)} className={`${inputCls} resize-none`}
      />
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="border-t border-slate-100 pt-4">
      <h3 className="text-xs font-bold uppercase tracking-wide text-brand-700 mb-3">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
    </div>
  );
}

// ── Project Form Modal ────────────────────────────────────────────────────────
function ProjectFormModal({ project, onSave, onClose }) {
  const { getAccessToken } = useAuth();
  const fileRef = useRef(null);
  const [extracting, setExtracting] = useState(false);

  const [form, setForm] = useState({
    name:                project?.name                || '',
    tagline:             project?.tagline             || '',
    project_type:        project?.project_type        || project?.type || '',
    category:            project?.category            || '',
    construction_status: project?.construction_status || '',
    description:         project?.description         || '',
    city:                project?.city                || '',
    location:            project?.location            || '',
    fullAddress:         project?.fullAddress         || '',
    developer:           project?.developer           || '',
    phone:               project?.phone               || '',
    email:               project?.email               || '',
    website:             project?.website             || '',
    priceRange:          project?.priceRange          || '',
    funding_target:      project?.funding_target      || '',
    roi_projected:       project?.roi_projected       || '',
    possession:          project?.possession          || '',
    rera:                project?.rera                || '',
    rera_approved:       project?.rera_approved       || false,
    landArea:            project?.landArea            || '',
    towers:              project?.towers              || '',
    floors:              project?.floors              || '',
    totalUnits:          project?.totalUnits          || '',
    unitTypes:           project?.unitTypes           || '',
    unitSizes:           project?.unitSizes           || '',
    parking:             project?.parking             || '',
    totalOfficeArea:     project?.totalOfficeArea     || '',
    coworkingArea:       project?.coworkingArea       || '',
    officeSizes:         project?.officeSizes         || '',
    highlights:          project?.highlights          || '',
    amenities:           project?.amenities           || '',
    specifications:      project?.specifications      || '',
    image_url:           project?.image_url           || '',
    gallery:             project?.gallery             || '',
  });

  function set(key, val) { setForm((f) => ({ ...f, [key]: val })); }

  async function handleBrochure(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-picking the same file
    if (!file) return;
    if (file.size > MAX_BROCHURE_BYTES) {
      toast.error('Brochure is too large. Please upload a file under 20 MB.');
      return;
    }
    setExtracting(true);
    try {
      const at = getAccessToken?.();
      const fd = new FormData();
      fd.append('brochure', file);
      const json = await apiFetch('/api/v1/brochure/extract', {
        method: 'POST',
        headers: at ? { Authorization: `Bearer ${at}` } : {},
        body: fd,
      }, 'Could not read the brochure.');

      const { available, fields } = json.data || {};
      if (!available) {
        toast.error('AI brochure reading is not enabled. Please fill the form manually.');
        return;
      }
      const count = fields ? Object.keys(fields).length : 0;
      if (!count) {
        toast('No details found in that brochure — try a clearer file or fill the form in.');
        return;
      }
      setForm((f) => ({ ...f, ...fields }));
      toast.success(`Filled ${count} field${count > 1 ? 's' : ''} from the brochure. Please review before saving.`);
    } catch (err) {
      toast.error(err.message || 'Could not read the brochure.');
    } finally {
      setExtracting(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave({
      ...form,
      name: form.name.trim() || 'Untitled Project',
      id: project?.id || `proj-${Date.now()}`,
      status: 'active',
      funding_raised: project?.funding_raised || 0,
      investor_count: project?.investor_count || 0,
      view_count:     project?.view_count     || 0,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90dvh] overflow-y-auto animate-scale-in">
        <div className="sticky top-0 z-10 bg-white px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">
            {project ? 'Edit Project' : 'Add New Project'}
          </h2>
          <button onClick={onClose} aria-label="Close dialog" className="w-11 h-11 -m-2 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">
          {/* Brochure auto-fill */}
          <div className="rounded-xl border border-dashed border-brand-200 bg-brand-50/60 p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0 border border-brand-100">
                <Sparkles size={16} className="text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">Auto-fill from a brochure</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload a PDF or image and AI fills in what it can. Max 20 MB — nothing is required, review everything before saving.
                </p>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="application/pdf,image/*" className="hidden" onChange={handleBrochure} />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={extracting}
              className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-brand-300 text-brand-700 text-sm font-semibold hover:bg-brand-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {extracting
                ? <><Loader2 size={15} className="animate-spin" /> Reading brochure…</>
                : <><Upload size={15} /> Upload Brochure</>}
            </button>
          </div>

          {/* Overview */}
          <Section title="Overview">
            <Field label="Project Name"  value={form.name}    onChange={(v) => set('name', v)}    placeholder="e.g. Skyline Towers" full />
            <Field label="Tagline"       value={form.tagline} onChange={(v) => set('tagline', v)} placeholder="e.g. High Rise Lifestyle at Kollur" full />
            <Field label="Project Type"  value={form.project_type} onChange={(v) => set('project_type', v)} placeholder="e.g. Luxury Residential" options={PROJECT_TYPES} />
            <Field label="Category"      value={form.category}     onChange={(v) => set('category', v)}     placeholder="residential / commercial…" options={CATEGORIES} />
            <Field label="Status"        value={form.construction_status} onChange={(v) => set('construction_status', v)} placeholder="e.g. Under Construction" full />
            <AreaField label="Description" value={form.description} onChange={(v) => set('description', v)} placeholder="Describe the project…" rows={4} />
          </Section>

          {/* Location */}
          <Section title="Location">
            <Field label="City"          value={form.city}     onChange={(v) => set('city', v)}     placeholder="e.g. Hyderabad" options={PROJECT_CITIES} />
            <Field label="Area / Locality" value={form.location} onChange={(v) => set('location', v)} placeholder="e.g. Kokapet" />
            <Field label="Full Address"  value={form.fullAddress} onChange={(v) => set('fullAddress', v)} placeholder="Plot, street, city, PIN" full />
          </Section>

          {/* Developer & Contact */}
          <Section title="Developer & Contact">
            <Field label="Developer" value={form.developer} onChange={(v) => set('developer', v)} placeholder="e.g. e-Infra" full />
            <Field label="Phone"     value={form.phone}     onChange={(v) => set('phone', v)}     placeholder="+91 …" />
            <Field label="Email"     value={form.email}     onChange={(v) => set('email', v)}     placeholder="sales@…" type="email" />
            <Field label="Website"   value={form.website}   onChange={(v) => set('website', v)}   placeholder="www.example.com" full />
          </Section>

          {/* Pricing & Possession */}
          <Section title="Pricing & Possession">
            <Field label="Price Range"     value={form.priceRange}     onChange={(v) => set('priceRange', v)}     placeholder="e.g. ₹75 Lakh – ₹1.5 Cr" full />
            <Field label="Funding Target (₹ Cr)" value={form.funding_target} onChange={(v) => set('funding_target', v)} placeholder="e.g. 250" />
            <Field label="Projected ROI (%)"     value={form.roi_projected}  onChange={(v) => set('roi_projected', v)}  placeholder="e.g. 18" />
            <Field label="Possession"      value={form.possession}     onChange={(v) => set('possession', v)}     placeholder="e.g. Anticipated 2026" full />
          </Section>

          {/* Approvals */}
          <Section title="Approvals">
            <Field label="RERA Number" value={form.rera} onChange={(v) => set('rera', v)} placeholder="e.g. TS RERA P01100007243" full />
            <label className="flex items-center gap-2.5 cursor-pointer sm:col-span-2">
              <input
                type="checkbox"
                checked={form.rera_approved}
                onChange={(e) => set('rera_approved', e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-slate-700 font-medium">RERA Approved</span>
            </label>
          </Section>

          {/* Specifications & Quick Facts */}
          <Section title="Specifications & Quick Facts">
            <Field label="Land Area"   value={form.landArea}   onChange={(v) => set('landArea', v)}   placeholder="e.g. 4 Acres" />
            <Field label="Towers"      value={form.towers}     onChange={(v) => set('towers', v)}     placeholder="e.g. 3 Towers" />
            <Field label="Floors"      value={form.floors}     onChange={(v) => set('floors', v)}     placeholder="e.g. 23 Floors Each" />
            <Field label="Total Units" value={form.totalUnits} onChange={(v) => set('totalUnits', v)} placeholder="e.g. 526 Apartments" />
            <Field label="Unit Types"  value={form.unitTypes}  onChange={(v) => set('unitTypes', v)}  placeholder="e.g. 2 BHK & 3 BHK" />
            <Field label="Unit Sizes"  value={form.unitSizes}  onChange={(v) => set('unitSizes', v)}  placeholder="e.g. 1,375 – 2,205 Sq.Ft." />
            <Field label="Parking"     value={form.parking}    onChange={(v) => set('parking', v)}    placeholder="e.g. 2 Cellar + 3 Podium" />
            <Field label="Office Area"     value={form.totalOfficeArea} onChange={(v) => set('totalOfficeArea', v)} placeholder="e.g. 3,00,000 Sq.Ft." />
            <Field label="Co-Working Area" value={form.coworkingArea}   onChange={(v) => set('coworkingArea', v)}   placeholder="e.g. 1,00,000 Sq.Ft." />
            <Field label="Office Sizes"    value={form.officeSizes}     onChange={(v) => set('officeSizes', v)}     placeholder="e.g. 2,000 – 20,000 Sq.Ft." />
          </Section>

          {/* Highlights, Amenities & Specs */}
          <Section title="Highlights, Amenities & Specs">
            <AreaField label="Highlights"     value={form.highlights}     onChange={(v) => set('highlights', v)}     placeholder={'One "Label: Value" per line\ne.g. Land Area: 4 Acres'} />
            <AreaField label="Amenities"      value={form.amenities}      onChange={(v) => set('amenities', v)}      placeholder={'One amenity per line\ne.g. Swimming Pool'} rows={4} />
            <AreaField label="Specifications" value={form.specifications} onChange={(v) => set('specifications', v)} placeholder={'One "Label: Value" per line\ne.g. Structure: RCC Framed'} />
          </Section>

          {/* Media */}
          <Section title="Media">
            <Field label="Hero Image URL" value={form.image_url} onChange={(v) => set('image_url', v)} placeholder="https://…" full />
            <AreaField label="Gallery Image URLs" value={form.gallery} onChange={(v) => set('gallery', v)} placeholder={'One image URL per line'} />
          </Section>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
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
