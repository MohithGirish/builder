/*
 * SkeletonCard.jsx — Animated placeholder card for directory loading states.
 *
 * Matches the dimensions of BuilderCard/InvestorCard: avatar circle, title line,
 * subtitle line, divider, two stat columns, two tag pills, and a button. Uses
 * animate-pulse with bg-slate-100 fills. Exported as a named SkeletonCard and
 * a SkeletonKPI for the dashboard KPI row.
 */

function Pulse({ className }) {
  return <div className={`animate-pulse rounded-md bg-slate-100 ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card flex flex-col h-full p-5">
      {/* Avatar + badge row */}
      <div className="flex items-start justify-between mb-4">
        <Pulse className="w-14 h-14 rounded-full" />
        <Pulse className="w-20 h-5 rounded-full" />
      </div>
      {/* Name lines */}
      <Pulse className="w-3/4 h-4 mb-2" />
      <Pulse className="w-1/2 h-3 mb-4" />
      {/* Divider */}
      <div className="border-t border-slate-100 mb-3" />
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div><Pulse className="w-full h-2.5 mb-1.5" /><Pulse className="w-2/3 h-3.5" /></div>
        <div><Pulse className="w-full h-2.5 mb-1.5" /><Pulse className="w-2/3 h-3.5" /></div>
      </div>
      {/* Tags */}
      <div className="flex gap-2 mb-5">
        <Pulse className="w-16 h-5 rounded-full" />
        <Pulse className="w-20 h-5 rounded-full" />
        <Pulse className="w-14 h-5 rounded-full" />
      </div>
      {/* Button */}
      <Pulse className="w-full h-9 rounded-full mt-auto" />
    </div>
  );
}

export function SkeletonKPI() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <Pulse className="w-24 h-3" />
        <Pulse className="w-8 h-8 rounded-xl" />
      </div>
      <Pulse className="w-20 h-7 rounded-md" />
      <Pulse className="w-16 h-4 rounded-full" />
      <Pulse className="w-full h-10 rounded-md" />
    </div>
  );
}
