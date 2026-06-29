/*
 * StyleGuide.jsx — Living reference for the Blueprint Index design language.
 *
 * Renders the institutional palette (Ink Navy + Steel + Brass), the three type
 * voices (Space Grotesk / Inter / JetBrains Mono), the control set, and the
 * signature Compatibility Instrument in both dark and light variants. Route:
 * /styleguide. Mirrors design-system/MASTER.md so designers can eyeball tokens
 * against shipped components.
 */
import CompatibilityInstrument, { MatchBadge, BrandMark } from '../components/CompatibilityInstrument';

const SAMPLE = [
  { key: 'sector',   label: 'Sector',   value: 23, max: 25 },
  { key: 'location', label: 'Location', value: 16, max: 20 },
  { key: 'fit',      label: 'Fit',      value: 25, max: 25 },
  { key: 'roi',      label: 'ROI',      value: 15, max: 20 },
  { key: 'risk',     label: 'Risk',     value: 8,  max: 10, flag: true },
];

const SWATCHES = [
  { name: 'Ink Navy', hex: '#0E1B2E', cls: 'bg-ink' },
  { name: 'Steel',    hex: '#2B5E93', cls: 'bg-brand-600' },
  { name: 'Azure',    hex: '#5AA0E0', cls: 'bg-azure' },
  { name: 'Brass',    hex: '#C2954A', cls: 'bg-brass' },
  { name: 'Paper',    hex: '#F5F7F9', cls: 'bg-slate-50 border border-slate-200' },
  { name: 'Graphite', hex: '#1B2735', cls: 'bg-slate-800' },
];

function Eyebrow({ children }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
      {children}
    </span>
  );
}

function Section({ tag, title, children }) {
  return (
    <section className="border-b border-brand-600/15 py-14">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-7 flex items-baseline gap-3.5">
          <Eyebrow>[ {tag} ]</Eyebrow>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-slate-900">{title}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}

export default function StyleGuide() {
  return (
    <div className="coord-grid min-h-dvh bg-slate-50">
      {/* Hero — the score is the thesis */}
      <div className="aurora border-b border-ink-700 bg-ink text-slate-100">
        <div className="relative z-[1] mx-auto grid max-w-5xl items-center gap-12 px-6 py-16 md:grid-cols-2">
          <div>
            <span className="inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-azure">
              <BrandMark heights={[6, 11, 16, 13, 9]} onDark /> Match engine · <b className="text-brass">5 dimensions</b>
            </span>
            <h1 className="mt-4 font-display text-5xl font-bold leading-[1.05] tracking-tight text-white">
              Funding, <span className="text-azure">measured.</span>
              <br />Not guessed.
            </h1>
            <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-[#c2d4e8]">
              Every builder–investor match is scored across five dimensions — sector, location, fit, ROI
              and risk. No black box. You see the whole instrument.
            </p>
            <div className="mt-7 flex gap-3">
              <a href="#" className="btn-cta">Find your match →</a>
              <a href="#" className="btn-ghost border-ink-600 bg-transparent text-[#c2d4e8] hover:bg-white/5">Browse projects</a>
            </div>
          </div>
          <CompatibilityInstrument
            score={87}
            breakdown={SAMPLE}
            variant="dark"
            label="Compatibility · E-Infra ↔ Meridian Cap"
          />
        </div>
      </div>

      {/* Color */}
      <Section tag="01 · COLOR" title="Institutional, blended.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {SWATCHES.map((s) => (
            <div key={s.name} className="overflow-hidden rounded-xl border border-brand-600/15 bg-white">
              <div className={`h-20 ${s.cls}`} />
              <div className="p-3 font-mono text-[11px]">
                <div className="font-bold text-slate-800">{s.name}</div>
                <div className="text-slate-500">{s.hex}</div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 font-mono text-xs text-slate-500">
          › Ink Navy owns dark surfaces · Steel carries primary actions and the gauge fills · Brass is the
          single rare accent — eyebrows, the peak tick, and one conversion CTA per screen.
        </p>
      </Section>

      {/* Type */}
      <Section tag="02 · TYPE" title="Three voices">
        <div className="divide-y divide-dashed divide-brand-600/15">
          <div className="py-4">
            <div className="font-mono text-[11px] uppercase tracking-widest text-slate-500">Display — Space Grotesk 700</div>
            <div className="font-display text-4xl font-bold tracking-tight text-slate-900">Measured, not guessed.</div>
          </div>
          <div className="py-4">
            <div className="font-mono text-[11px] uppercase tracking-widest text-slate-500">Body — Inter 400</div>
            <p className="max-w-[60ch] text-[17px] leading-relaxed text-slate-800">
              Inter stays the workhorse: fully legible at 16px, letting the display and data faces carry the
              personality without fighting them.
            </p>
          </div>
          <div className="py-4">
            <div className="font-mono text-[11px] uppercase tracking-widest text-slate-500">Data — JetBrains Mono 600 (signature role)</div>
            <div className="font-mono text-[15px] font-semibold text-brand-700">
              SECTOR 23/25 · LOC 16/20 · FIT 25/25 · ROI 15/20 · RISK 8/10 → 87/100
            </div>
          </div>
        </div>
      </Section>

      {/* Controls + the instrument on light */}
      <Section tag="03 · CONTROLS" title="Quiet base, loud signature">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="mb-3.5 font-mono text-xs text-slate-500">Buttons — one brass CTA per screen; everything else steel or ghost.</p>
            <div className="flex flex-wrap items-center gap-2.5">
              <a className="btn-cta" href="#">Request quote</a>
              <a className="btn-brand" href="#">View match</a>
              <a className="btn-ghost" href="#">Save</a>
            </div>
            <p className="mb-2.5 mt-6 font-mono text-xs text-slate-500">Match badge — the instrument, compact (doubles as the brand mark).</p>
            <MatchBadge score="87 MATCH" heights={[8, 13, 18, 11, 14]} />
          </div>
          <CompatibilityInstrument
            score={87}
            breakdown={SAMPLE}
            variant="light"
            label="On light · same instrument"
          />
        </div>
      </Section>
    </div>
  );
}
