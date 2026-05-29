/*
 * MyInvestments.jsx — Portfolio tracker for investor users.
 *
 * Lists all of the investor's active investments (MY_INVESTMENTS) with
 * project thumbnails, ROI badges, invested amounts, status labels, and
 * animated funding-progress bars. Shows summary chips for total invested,
 * average ROI, and active investment count at the top. Accessible at
 * /investor-dashboard/investments.
 */
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MY_INVESTMENTS } from '../../data/dashboard';

function InvestmentCard({ inv }) {
  const statusConfig = {
    active:    { label: 'Active',    color: 'bg-green-100 text-green-700' },
    completed: { label: 'Completed', color: 'bg-brand-100 text-brand-700' },
    paused:    { label: 'Paused',    color: 'bg-slate-100 text-slate-600' },
  };
  const st = statusConfig[inv.status] || statusConfig.active;

  return (
    <div className="bg-white rounded-2xl shadow-card p-5 hover:shadow-card-hover transition-shadow duration-300">
      <div className="flex items-start gap-4">
        {/* Thumbnail */}
        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
          <img src={inv.project_image} alt={inv.project_name} className="w-full h-full object-cover" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800">{inv.project_name}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{inv.company} · {inv.city}</p>
            </div>
            {/* ROI % */}
            <div className="text-right shrink-0">
              <p className="text-lg font-extrabold text-amber-500">{inv.roi}%</p>
              <p className="text-[10px] text-slate-400">ROI</p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs text-slate-500">
              Investment: <span className="font-semibold text-slate-700">₹{inv.invested} Cr</span>
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${st.color}`}>
              {st.label}
            </span>
          </div>

          {/* Progress */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
              <span>Progress</span>
              <span className="font-semibold text-slate-700">{inv.progress}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width:      `${inv.progress}%`,
                  background: inv.progress === 100
                    ? 'linear-gradient(to right,#0d9488,#14c38e)'
                    : 'linear-gradient(to right,#f97316,#f59e0b)',
                }}
              />
            </div>
          </div>

          {/* CTA */}
          <div className="mt-3 flex justify-end">
            <Link
              to="/dealroom"
              className="text-xs font-semibold text-brand-700 hover:text-brand-800 transition-colors border border-brand-200 px-3 py-1.5 rounded-full hover:bg-brand-50"
            >
              View Project Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyInvestments() {
  const totalInvested = MY_INVESTMENTS.reduce((s, i) => s + i.invested, 0);
  const avgROI = Math.round(MY_INVESTMENTS.reduce((s, i) => s + i.roi, 0) / MY_INVESTMENTS.length);
  const active = MY_INVESTMENTS.filter((i) => i.status === 'active').length;

  return (
    <div className="p-6 max-w-3xl">
      {/* Back */}
      <Link to="/investor-dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-700 hover:text-brand-800 mb-4">
        <ArrowLeft size={14} /> Back to Dashboard
      </Link>

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">My Investments</h1>
        <p className="text-sm text-slate-500 mt-0.5">Track all your investment projects</p>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-white rounded-xl shadow-card px-4 py-3 text-center">
          <p className="text-lg font-extrabold text-brand-700">₹{totalInvested} Cr</p>
          <p className="text-xs text-slate-400 mt-0.5">Total Invested</p>
        </div>
        <div className="bg-white rounded-xl shadow-card px-4 py-3 text-center">
          <p className="text-lg font-extrabold text-amber-500">{avgROI}%</p>
          <p className="text-xs text-slate-400 mt-0.5">Avg ROI</p>
        </div>
        <div className="bg-white rounded-xl shadow-card px-4 py-3 text-center">
          <p className="text-lg font-extrabold text-green-600">{active}</p>
          <p className="text-xs text-slate-400 mt-0.5">Active Investments</p>
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-4">
        {MY_INVESTMENTS.map((inv) => (
          <InvestmentCard key={inv.id} inv={inv} />
        ))}
      </div>
    </div>
  );
}
