/*
 * Listbox.jsx — Custom select dropdown for admin toolbars.
 *
 * A controlled listbox (replaces the native <select>) matching the Blueprint
 * Index design system, adapted from the directory FilterBar's FilterSelect.
 * Takes options as { value, label } pairs, shows the selected label, and closes
 * on outside click or selection. Used for the role / status filters on the admin
 * users and verifications pages.
 */
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function Listbox({ icon: Icon, value, options, onChange, ariaLabel }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function onOutside(e) { if (!ref.current?.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onOutside);
    return () => document.removeEventListener('mousedown', onOutside);
  }, [open]);

  const current = options.find((o) => o.value === value) || options[0];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className={[
          'flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 border text-xs font-medium text-slate-700 transition-all',
          open ? 'border-brand-400 ring-2 ring-brand-100' : 'border-slate-200 hover:border-brand-300',
        ].join(' ')}
      >
        {Icon && <Icon size={12} className="text-brand-600 shrink-0" />}
        <span className="min-w-[72px] text-left">{current?.label}</span>
        <ChevronDown size={11} className={`text-slate-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={ariaLabel}
          className="absolute top-full left-0 mt-1.5 z-50 min-w-[160px] bg-white border border-slate-200 rounded-xl shadow-lg py-1 overflow-hidden"
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={[
                'flex items-center gap-2 px-3 py-2 text-xs cursor-pointer transition-colors',
                opt.value === value ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-700 hover:bg-slate-50',
              ].join(' ')}
            >
              <span className="w-3 shrink-0 flex items-center">
                {opt.value === value && <Check size={11} className="text-brand-600" />}
              </span>
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
