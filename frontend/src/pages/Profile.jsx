/*
 * Profile.jsx — Authenticated user profile page.
 *
 * Displays the current user's identity card (name, email, role badge, verified
 * status), role-switching control, and AI onboarding preferences. Each
 * preference can be edited inline without re-running the full AI flow.
 * Switching roles clears existing preferences and routes the user through the
 * AI onboarding chat for their new role. Rendered inside DashboardLayout
 * via a nested /profile route — no standalone sidebar needed.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Briefcase, CheckCircle2, IndianRupee,
  Users, BarChart2, RefreshCw, Mail, ShieldCheck,
  Pencil, Check, X, ArrowRightLeft, TrendingUp,
  Building2, Bot, Trash2, AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LocationsMap from '../components/profile/LocationsMap';
import DeleteAccountModal from '../components/profile/DeleteAccountModal';
import MyProjectCard from '../components/cards/MyProjectCard';
import { EINFRA_LISTINGS, isEinfraBuilder } from '../data/realProjects';
import { MY_PROJECTS } from '../data/dashboard';
import { deriveStatus, loadVerification } from '../lib/verification';

const BUILDER_PREF_LABELS = [
  { key: 'city',               label: 'Based In',              icon: MapPin,       placeholder: 'e.g. Hyderabad' },
  { key: 'project_type',       label: 'Specialisation',        icon: Briefcase,    placeholder: 'e.g. Luxury Residential' },
  { key: 'projects_completed', label: 'Projects Completed',    icon: CheckCircle2, placeholder: 'e.g. 12' },
  { key: 'funding_range',      label: 'Typical Funding Range', icon: IndianRupee,  placeholder: 'e.g. ₹50–100 Cr' },
];

const INVESTOR_PREF_LABELS = [
  { key: 'investor_type',    label: 'Investor Type',       icon: Users,       placeholder: 'e.g. VC Firm' },
  { key: 'sectors',          label: 'Sectors of Interest', icon: BarChart2,   placeholder: 'e.g. Residential, PropTech' },
  { key: 'investment_range', label: 'Investment Range',    icon: IndianRupee, placeholder: 'e.g. ₹10–50 Cr' },
  { key: 'regions',          label: 'Target Regions',      icon: MapPin,      placeholder: 'e.g. Hyderabad, Bangalore' },
];

export default function Profile() {
  const { user, role, preferences, updatePreference, switchRole, setOnboardingRole } = useAuth();
  const navigate = useNavigate();

  const [editingKey, setEditingKey] = useState(null);
  const [editValue, setEditValue]   = useState('');
  const [showSwitch, setShowSwitch] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const prefLabels = role === 'investor' ? INVESTOR_PREF_LABELS : BUILDER_PREF_LABELS;
  const initials   = ((user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')).toUpperCase() || '?';
  const targetRole = role === 'investor' ? 'builder' : 'investor';
  const listedProjects = role === 'builder'
    ? (isEinfraBuilder(user) ? EINFRA_LISTINGS : MY_PROJECTS)
    : [];

  // Map chips: investor → target regions; builder → listed-project locations.
  const regionItems = (preferences?.regions || '')
    .split(/[,/]| and /i)
    .map((r) => r.trim())
    .filter(Boolean)
    .map((r) => ({ key: r, label: r, query: `${r}, India` }));

  const projectItems = listedProjects.map((p) => ({
    key: p.id,
    label: p.name,
    query: p.coordinates
      ? `${p.coordinates[0]},${p.coordinates[1]}`
      : [p.location, p.city, 'India'].filter(Boolean).join(', '),
  }));

  const baseCity = preferences?.city?.trim();

  let mapProps;
  if (role === 'investor') {
    mapProps = { title: 'Target Regions', subtitle: 'Regions you focus on. Tap one to view it on the map.', emptyText: 'No target regions set yet.', items: regionItems };
  } else if (projectItems.length > 0) {
    mapProps = { title: 'Project Locations', subtitle: 'Where your listed projects are. Tap a project to view it.', emptyText: '', items: projectItems };
  } else if (baseCity) {
    // No listed projects yet — fall back to where the builder is based.
    mapProps = { title: 'Based In', subtitle: "You have no listed projects yet — showing where you're based.", emptyText: '', items: [{ key: 'base', label: baseCity, query: `${baseCity}, India` }] };
  } else {
    mapProps = { title: 'Project Locations', subtitle: '', emptyText: 'Add a project or set your base city to see it on the map.', items: [] };
  }

  function startEdit(key, currentValue) {
    setEditingKey(key);
    setEditValue(currentValue || '');
  }

  function saveEdit() {
    if (editingKey && editValue.trim()) updatePreference(editingKey, editValue.trim());
    setEditingKey(null);
    setEditValue('');
  }

  function cancelEdit() {
    setEditingKey(null);
    setEditValue('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') saveEdit();
    if (e.key === 'Escape') cancelEdit();
  }

  function confirmSwitch() {
    switchRole(targetRole);
    setOnboardingRole(targetRole);
    setShowSwitch(false);
    // Go straight to the new role's preference questions (no role picker).
    navigate('/onboarding/retake');
  }

  return (
    <div className="p-4 sm:p-6 max-w-screen-2xl">
      <div className="lg:grid lg:grid-cols-[minmax(0,40rem)_1fr] lg:gap-6 lg:items-stretch">
        <div className="space-y-5">

        {/* Page title */}
        <div>
          <h1 className="text-xl font-bold text-slate-800">My Profile</h1>
          <p className="text-sm text-slate-500 mt-0.5">Your account details, role, and AI preferences</p>
        </div>

        {/* ── Identity card ─────────────────────────────────────────────── */}
        <div className="bg-gradient-to-b from-teal-50 to-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0 bg-brand-gradient">
              {initials}
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-slate-800">
                {user?.first_name} {user?.last_name}
              </h2>

              <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500">
                <Mail size={13} />
                <span className="truncate">{user?.email}</span>
              </div>

              <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
                  style={{
                    background: role === 'investor'
                      ? 'linear-gradient(135deg,#1e88e5,#42a5f5)'
                      : 'linear-gradient(to right,#f97316,#f59e0b)',
                  }}
                >
                  {role === 'investor'
                    ? <><TrendingUp size={10} /> Investor</>
                    : <><Building2 size={10} /> Builder</>}
                </span>

                {user?.is_verified && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-white bg-brand-gradient">
                    <ShieldCheck size={10} /> Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Switch Role card ───────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <ArrowRightLeft size={14} className="text-slate-400" />
                Switch Role
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Currently: <strong className="text-slate-600 capitalize">{role}</strong>.
                Switch to <strong className="text-slate-600 capitalize">{targetRole}</strong> to update your AI preferences.
              </p>
            </div>
            <button
              onClick={() => setShowSwitch(true)}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              {targetRole === 'investor' ? <TrendingUp size={12} /> : <Briefcase size={12} />}
              Become {targetRole === 'investor' ? 'Investor' : 'Builder'}
            </button>
          </div>

          {showSwitch && (
            <div className="mt-4 p-4 rounded-xl border border-teal-100 bg-teal-50">
              <p className="text-sm font-semibold text-teal-800 mb-1">Confirm Role Switch</p>
              <p className="text-xs text-teal-700 mb-3 leading-relaxed">
                Switching to <strong className="capitalize">{targetRole}</strong> will clear your current preferences
                and take you through the AI assistant to set new ones.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSwitch(false)}
                  className="flex-1 py-2 rounded-lg border border-teal-200 text-teal-700 text-xs font-semibold hover:bg-teal-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSwitch}
                  className="flex-1 py-2 rounded-lg text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors"
                >
                  Switch &amp; Set Preferences
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Builder Verification card ──────────────────────────────────── */}
        {role === 'builder' && (() => {
          const vStatus = deriveStatus(loadVerification(user?.id));
          const submitted = vStatus === 'submitted';
          const ready = vStatus === 'ready';
          const linkLabel = submitted ? 'Update' : ready ? 'Submit' : 'Complete';
          return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-slate-400" />
                    Builder Verification
                  </h3>
                  <div className="mt-1.5">
                    {submitted ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200">
                        <ShieldCheck size={11} /> Submitted for verification
                      </span>
                    ) : ready ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200">
                        <ShieldCheck size={11} /> Ready to submit
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200">
                        <AlertTriangle size={11} /> Unverified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5">
                    {submitted
                      ? 'Statutory registrations recorded — reviewed against RERA, GST and MCA.'
                      : ready
                        ? 'Credentials look valid — open the form and submit for verification.'
                        : 'Add your RERA, PAN, GSTIN and entity registration to earn a verified badge.'}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/onboarding/verification')}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  <ShieldCheck size={12} /> {linkLabel}
                </button>
              </div>
            </div>
          );
        })()}

        {/* ── AI Preferences card ────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-800">AI Preferences</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Used to match you with the right {role === 'investor' ? 'builders' : 'investors'}.
                Hover a field to edit it inline.
              </p>
            </div>
            <button
              onClick={() => navigate('/onboarding/retake')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 transition-colors"
            >
              <RefreshCw size={11} />
              Retake All
            </button>
          </div>

          {preferences ? (
            <div className="space-y-3">
              {prefLabels.map(({ key, label, icon: Icon, placeholder }) => {
                const isEditing = editingKey === key;
                const value     = preferences[key] || '';

                return (
                  <div
                    key={key}
                    className={`group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all
                      ${isEditing
                        ? 'border-teal-300 bg-teal-50 ring-1 ring-teal-200'
                        : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br from-teal-50 to-teal-100">
                      <Icon size={13} className="text-teal-600" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-slate-400 font-medium">{label}</p>
                      {isEditing ? (
                        <input
                          autoFocus
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onKeyDown={handleKeyDown}
                          placeholder={placeholder}
                          className="w-full text-sm font-semibold text-slate-700 bg-transparent outline-none border-0 p-0 mt-0.5 placeholder-slate-300"
                        />
                      ) : (
                        <p className="text-sm text-slate-700 font-semibold truncate">
                          {value || <span className="text-slate-300 font-normal italic">Not set</span>}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isEditing ? (
                        <>
                          <button
                            onClick={saveEdit}
                            className="w-7 h-7 rounded-lg flex items-center justify-center bg-teal-600 text-white hover:bg-teal-700 transition-colors"
                            aria-label="Save"
                          >
                            <Check size={13} />
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="w-7 h-7 rounded-lg flex items-center justify-center bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors"
                            aria-label="Cancel"
                          >
                            <X size={13} />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => startEdit(key, value)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors opacity-0 group-hover:opacity-100"
                          aria-label={`Edit ${label}`}
                        >
                          <Pencil size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Bot size={32} className="mx-auto mb-3 text-slate-300" />
              <p className="text-sm text-slate-500 mb-4">
                No preferences set yet. Complete the AI onboarding to get personalised matches.
              </p>
              <button
                onClick={() => navigate('/onboarding/retake')}
                className="text-white text-sm font-semibold px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 transition-colors"
              >
                Set Preferences
              </button>
            </div>
          )}
        </div>

        </div>{/* /left column */}

        {/* ── Map (right column): investor regions or builder project locations ── */}
        <aside className="mt-5 lg:mt-0">
          <LocationsMap {...mapProps} />
        </aside>
      </div>

      {/* ── Builder: listed projects ───────────────────────────────────────── */}
      {role === 'builder' && (
        <section className="mt-5">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">My Listed Projects</h3>
              <p className="text-xs text-slate-400 mt-0.5">Projects you've listed for investors to discover.</p>
            </div>
            <button
              onClick={() => navigate('/dashboard/projects')}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Briefcase size={12} /> Manage Projects
            </button>
          </div>

          {listedProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
                <Building2 size={26} className="text-slate-300" />
              </div>
              <h4 className="font-semibold text-slate-700 mb-1">No projects yet</h4>
              <p className="text-sm text-slate-500 mb-4 max-w-xs">
                List your first project to start attracting investors.
              </p>
              <button
                onClick={() => navigate('/dashboard/projects')}
                className="text-white text-sm font-semibold px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 transition-colors"
              >
                Add a Project
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {listedProjects.map((p) => (
                <MyProjectCard key={p.id} project={p} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Danger Zone (always last) ──────────────────────────────────────── */}
      <div className="mt-5 bg-white rounded-2xl shadow-sm border border-red-100 p-5">
        <h3 className="text-sm font-bold text-red-700 flex items-center gap-1.5">
          <AlertTriangle size={14} /> Danger Zone
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Permanently delete your account and all associated data. This cannot be undone.
        </p>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={12} /> Delete Account
        </button>
      </div>

      {showDeleteModal && (
        <DeleteAccountModal
          role={role}
          onClose={() => setShowDeleteModal(false)}
          onDeleted={() => navigate('/', { replace: true })}
        />
      )}
    </div>
  );
}
