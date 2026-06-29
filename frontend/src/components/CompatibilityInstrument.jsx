/*
 * CompatibilityInstrument.jsx — The signature element of the Blueprint Index
 * design language: the 5-dimension match score rendered as an engineering
 * readout instead of a soft ring or a lone number.
 *
 * Exports three coherent forms of the same mark:
 *   - <CompatibilityInstrument> — full readout (hero / match detail), light or dark.
 *   - <MatchBadge>              — compact "barcode" pill for cards.
 *   - <BrandMark>               — the bare five-tick mark (logo accent, loaders).
 * Dimensions match the AI service contract (Sector 25 · Location 20 · Fit 25 ·
 * ROI 20 · Risk 10 = 100). Fill animates on mount; the global reduced-motion
 * guard in index.css neutralises it. Numbering 01–05 maps 1:1 to the real axes.
 */
import { useEffect, useState } from 'react';

export const DEFAULT_DIMENSIONS = [
  { key: 'sector',   label: 'Sector',   max: 25 },
  { key: 'location', label: 'Location', max: 20 },
  { key: 'fit',      label: 'Fit',      max: 25 },
  { key: 'roi',      label: 'ROI',      max: 20 },
  { key: 'risk',     label: 'Risk',     max: 10, flag: true },
];

// Heights (px) for the five ticks of the compact mark; the tallest is the brass peak.
function ticksFor(heights = [8, 14, 22, 18, 12], onDark = false) {
  const peak = heights.indexOf(Math.max(...heights));
  return heights.map((h, i) => (
    <span
      key={i}
      aria-hidden="true"
      className={`block w-1 rounded-sm ${
        i === peak ? 'bg-brass' : onDark ? 'bg-azure' : 'bg-brand-600'
      }`}
      style={{ height: h }}
    />
  ));
}

export function BrandMark({ heights, onDark = false, className = '' }) {
  return (
    <span className={`inline-flex items-end gap-[3px] ${className}`} style={{ height: 22 }}>
      {ticksFor(heights, onDark)}
    </span>
  );
}

export function MatchBadge({ score, heights, onDark = false }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-sm font-bold ${
        onDark
          ? 'border-white/15 bg-white/5 text-azure'
          : 'border-brand-600/15 bg-brand-50 text-brand-700'
      }`}
    >
      <BrandMark heights={heights} onDark={onDark} />
      {score}
    </span>
  );
}

export default function CompatibilityInstrument({
  score,
  breakdown,
  variant = 'dark',
  label = 'Compatibility',
}) {
  const rows = breakdown ?? DEFAULT_DIMENSIONS.map((d) => ({ ...d, value: 0 }));
  const total = rows.reduce((s, r) => s + r.max, 0);
  const dark = variant === 'dark';

  // Animate fills in on mount (reduced-motion guard makes this a no-op).
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const surface = dark
    ? 'bg-ink-800 border-ink-700 shadow-lifted'
    : 'bg-white border-slate-200 shadow-card';
  const labelClr = dark ? 'text-[#8aa6c4]' : 'text-slate-500';
  const keyClr   = dark ? 'text-[#c2d4e8]' : 'text-brand-700';
  const numClr   = dark ? 'text-[#5d7795]' : 'text-slate-400';
  const valClr   = dark ? 'text-slate-100' : 'text-slate-800';
  const track    = dark ? 'bg-white/[0.07]' : 'bg-slate-100';

  return (
    <div
      className={`rounded-2xl border p-5 ${surface}`}
      role="img"
      aria-label={`Compatibility score ${score} of ${total}. ${rows
        .map((r) => `${r.label} ${r.value} of ${r.max}`)
        .join(', ')}.`}
    >
      <div
        className={`mb-4 flex items-baseline justify-between border-b border-dashed pb-3 ${
          dark ? 'border-ink-600' : 'border-slate-200'
        }`}
      >
        <span className={`font-mono text-xs uppercase tracking-wider ${labelClr}`}>{label}</span>
        <span className={`font-mono text-3xl font-bold tabular-nums ${dark ? 'text-white' : 'text-slate-900'}`}>
          {score}
          <small className={`text-base font-medium ${dark ? 'text-azure' : 'text-brand-700'}`}>/{total}</small>
        </span>
      </div>

      {rows.map((r, i) => (
        <div key={r.key ?? i} className="my-3 grid grid-cols-[16px_84px_1fr_52px] items-center gap-3">
          <span className={`font-mono text-[11px] ${numClr}`}>{String(i + 1).padStart(2, '0')}</span>
          <span className={`font-mono text-xs uppercase tracking-wide ${keyClr}`}>{r.label}</span>
          <span className={`h-2 overflow-hidden rounded-full ${track}`}>
            <span
              className={`block h-full rounded-full origin-left transition-transform duration-700 ease-out ${
                r.flag ? 'ci-fill-risk' : 'ci-fill'
              }`}
              style={{
                width: `${Math.round((r.value / r.max) * 100)}%`,
                transform: shown ? 'scaleX(1)' : 'scaleX(0)',
                transitionDelay: `${i * 80}ms`,
              }}
            />
          </span>
          <span className={`text-right font-mono text-[13px] font-semibold tabular-nums ${valClr}`}>
            {r.value}/{r.max}
          </span>
        </div>
      ))}
    </div>
  );
}
