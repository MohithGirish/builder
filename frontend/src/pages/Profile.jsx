/*
 * Profile.jsx — Authenticated user profile page.
 *
 * Displays the current user's identity card (name, email, role badge, verified
 * status), role-switching control, and AI onboarding preferences. Each
 * preference can be edited inline without re-running the full AI flow.
 * Switching roles clears existing preferences and routes the user through the
 * AI onboarding chat for their new role. Rendered inside DashboardSidebar layout.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Briefcase, CheckCircle2, IndianRupee,
  Users, BarChart2, RefreshCw, Mail, ShieldCheck,
  Pencil, Check, X, ArrowRightLeft, TrendingUp,
} from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useAuth } from '../context/AuthContext';

const BUILDER_PREF_LABELS = [
  { key: 'city',               label: 'Based In',              icon: MapPin,       placeholder: 'e.g. Hyderabad' },
  { key: 'project_type',       label: 'Specialisation',        icon: Briefcase,    placeholder: 'e.g. Luxury Residential' },
  { key: 'projects_completed', label: 'Projects Completed',    icon: CheckCircle2, placeholder: 'e.g. 12' },
  { key: 'funding_range',      label: 'Typical Funding Range', icon: IndianRupee,  placeholder: 'e.g. ₹50–100 Cr' },
];

const INVESTOR_PREF_LABELS = [
  { key: 'investor_type',    label: 'Investor Type',       icon: Users,      placeholder: 'e.g. VC Firm' },
  { key: 'sectors',          label: 'Sectors of Interest', icon: BarChart2,  placeholder: 'e.g. Residential, PropTech' },
  { key: 'investment_range', label: 'Investment Range',    icon: IndianRupee, placeholder: 'e.g. ₹10–50 Cr' },
  { key: 'regions',          label: 'Target Regions',      icon: MapPin,     placeholder: 'e.g. Hyderabad, Bangalore' },
];

export default function Profile() {
  const { user, role, preferences, updatePreference, switchRole, setOnboardingRole } = useAuth();
  const navigate = useNavigate();

  const [editingKey, setEditingKey]   = useState(null);
  const [editValue, setEditValue]     = useState('');
  const [showSwitch, setShowSwitch]   = useState(false);

  const prefLabels = role === 'investor' ? INVESTOR_PREF_LABELS : BUILDER_PREF_LABELS;
  const initials   = ((user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')).toUpperCase() || '?';
  const targetRole = role === 'investor' ? 'builder' : 'investor';

  function startEdit(key, currentValue) {
    setEditingKey(key);
    setEditValue(currentValue || '');
  }

  function saveEdit() {
    if (editingKey && editValue.trim()) {
      updatePreference(editingKey, editValue.trim());
    }
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
    navigate('/onboarding/chat');
  }

  return (
    <div className="flex bg-[#f8fafc]" style={{ height: 'calc(100vh - 56px)' }}>
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto px-6 py-7">
        <div className="max-w-2xl mx-auto space-y-5">

          {/* Page title */}
          <div>
            <h1 className="text-xl font-bold text-slate-800">My Profile</h1>
            <p className="text-sm text-slate-500 mt-0.5">Your account details, role, and AI preferences</p>
          </div>

          {/* ── Identity card ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-5">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg,#0d9488,#14c38e)' }}
              >
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
                        : 'linear-gradient(135deg,#f97316,#f59e0b)',
                    }}
                  >
                    {role === 'investor' ? '📈 Investor' : '🏗️ Builder'}
                  </span>

                  {user?.is_verified && (
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
                      style={{ background: 'linear-gradient(135deg,#0d9488,#14b8a6)' }}
                    >
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
                  Switch to <strong className="text-slate-600 capitalize">{targetRole}</strong> to update your AI preferences for that role.
                </p>
              </div>
              <button
                onClick={() => setShowSwitch(true)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {targetRole === 'investor'
                  ? <TrendingUp size={12} />
                  : <Briefcase size={12} />}
                Become {targetRole === 'investor' ? 'Investor' : 'Builder'}
              </button>
            </div>

            {/* Role switch confirmation */}
            {showSwitch && (
              <div className="mt-4 p-4 rounded-xl border border-amber-200 bg-amber-50">
                <p className="text-sm font-semibold text-amber-800 mb-1">Confirm Role Switch</p>
                <p className="text-xs text-amber-700 mb-3 leading-relaxed">
                  Switching to <strong className="capitalize">{targetRole}</strong> will clear your current preferences
                  and take you through the AI assistant to set new ones for your new role.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowSwitch(false)}
                    className="flex-1 py-2 rounded-lg border border-amber-300 text-amber-700 text-xs font-semibold hover:bg-amber-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmSwitch}
                    className="flex-1 py-2 rounded-lg text-white text-xs font-bold transition-all hover:opacity-90"
                    style={{
                      background: targetRole === 'investor'
                        ? 'linear-gradient(135deg,#1e88e5,#0369a1)'
                        : 'linear-gradient(to right,#f97316,#f59e0b)',
                    }}
                  >
                    Switch &amp; Set Preferences
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── AI Preferences card ────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-bold text-slate-800">AI Preferences</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Used to match you with the right {role === 'investor' ? 'builders' : 'investors'}.
                  Click the pencil to edit any field inline.
                </p>
              </div>
              <button
                onClick={() => navigate('/onboarding/retake')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(to right,#f97316,#f59e0b)' }}
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
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all
                        ${isEditing
                          ? 'border-brand-300 bg-brand-50 ring-1 ring-brand-200'
                          : 'border-slate-100 bg-slate-50'}`}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: 'linear-gradient(135deg,#f0fdfa,#ccfbf1)' }}
                      >
                        <Icon size={13} className="text-brand-600" />
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

                      {/* Edit / save / cancel actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {isEditing ? (
                          <>
                            <button
                              onClick={saveEdit}
                              className="w-7 h-7 rounded-lg flex items-center justify-center bg-brand-600 text-white hover:bg-brand-700 transition-colors"
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
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
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
                <div className="text-3xl mb-3">🤖</div>
                <p className="text-sm text-slate-500 mb-4">
                  No preferences set yet. Complete the AI onboarding to get personalised matches.
                </p>
                <button
                  onClick={() => navigate('/onboarding/retake')}
                  className="px-5 py-2 rounded-xl text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(to right,#f97316,#f59e0b)' }}
                >
                  Set Preferences
                </button>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
