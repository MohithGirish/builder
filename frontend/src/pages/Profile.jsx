/*
 * Profile.jsx — Authenticated user profile page.
 *
 * Displays the current user's identity card (name, email, role badge, verified
 * status) and their AI onboarding preferences (e.g. city, project type,
 * investment range). Provides an "Update Preferences" button that navigates to
 * the onboarding retake flow. Rendered inside the DashboardSidebar layout.
 */
import { useNavigate } from 'react-router-dom';
import {
  MapPin, Briefcase, CheckCircle2, IndianRupee,
  Users, BarChart2, RefreshCw, Mail, ShieldCheck,
} from 'lucide-react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import { useAuth }      from '../context/AuthContext';

const BUILDER_PREF_LABELS = [
  { key: 'city',                label: 'Based In',             icon: MapPin },
  { key: 'project_type',        label: 'Specialisation',       icon: Briefcase },
  { key: 'projects_completed',  label: 'Projects Completed',   icon: CheckCircle2 },
  { key: 'funding_range',       label: 'Typical Funding Range', icon: IndianRupee },
];

const INVESTOR_PREF_LABELS = [
  { key: 'investor_type',    label: 'Investor Type',       icon: Users },
  { key: 'sectors',          label: 'Sectors of Interest', icon: BarChart2 },
  { key: 'investment_range', label: 'Investment Range',    icon: IndianRupee },
  { key: 'regions',          label: 'Target Regions',      icon: MapPin },
];

export default function Profile() {
  const { user, role, preferences } = useAuth();
  const navigate = useNavigate();

  const prefLabels = role === 'investor' ? INVESTOR_PREF_LABELS : BUILDER_PREF_LABELS;
  const initials   = ((user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')).toUpperCase() || '?';

  return (
    <div className="flex bg-[#f8fafc]" style={{ height: 'calc(100vh - 56px)' }}>
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto px-6 py-7">
        <div className="max-w-2xl mx-auto space-y-5">

          {/* Page title */}
          <div>
            <h1 className="text-xl font-bold text-slate-800">My Profile</h1>
            <p className="text-sm text-slate-500 mt-0.5">Your account details and AI preferences</p>
          </div>

          {/* ── Identity card ─────────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg,#0d9488,#14c38e)' }}
              >
                {initials}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-slate-800">
                  {user?.first_name} {user?.last_name}
                </h2>

                <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500">
                  <Mail size={13} />
                  <span className="truncate">{user?.email}</span>
                </div>

                <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                  {/* Role badge */}
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

                  {/* Verified badge */}
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

          {/* ── AI Preferences card ────────────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-bold text-slate-800">AI Preferences</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Used to match you with the right {role === 'investor' ? 'builders' : 'investors'}
                </p>
              </div>
              <button
                onClick={() => navigate('/onboarding/retake')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(to right,#f97316,#f59e0b)' }}
              >
                <RefreshCw size={11} />
                Update Preferences
              </button>
            </div>

            {preferences ? (
              <div className="space-y-3">
                {prefLabels.map(({ key, label, icon: Icon }) => (
                  <div
                    key={key}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: 'linear-gradient(135deg,#f0fdfa,#ccfbf1)' }}
                    >
                      <Icon size={13} className="text-brand-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-slate-400 font-medium">{label}</p>
                      <p className="text-sm text-slate-700 font-semibold truncate">
                        {preferences[key] || '—'}
                      </p>
                    </div>
                  </div>
                ))}
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
