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
  Building2, Bot,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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

  const prefLabels = role === 'investor' ? INVESTOR_PREF_LABELS : BUILDER_PREF_LABELS;
  const initials   = ((user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')).toUpperCase() || '?';
  const targetRole = role === 'investor' ? 'builder' : 'investor';

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
    navigate('/onboarding/chat');
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl">
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

      </div>
    </div>
  );
}
