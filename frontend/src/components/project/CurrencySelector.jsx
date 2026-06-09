/*
 * CurrencySelector.jsx — Currency toggle and live-rate display for the project price card.
 *
 * Renders four pill buttons (INR, USD, AED, GBP) that switch the active display currency.
 * When a non-INR currency is selected it shows the converted price string, the original
 * INR figure, and the conversion rate + timestamp. Falls back gracefully when live rates
 * are unavailable. Persists the selected currency in sessionStorage across navigation.
 * Accepts: currency, onCurrencyChange, rates, updatedAt, fallback, projectGradient.
 */
import { RefreshCw } from 'lucide-react';

const CURRENCIES = [
  { code: 'INR', symbol: '₹',   label: 'INR' },
  { code: 'USD', symbol: '$',   label: 'USD' },
  { code: 'AED', symbol: 'AED', label: 'AED' },
  { code: 'GBP', symbol: '£',   label: 'GBP' },
];

export default function CurrencySelector({ currency, onCurrencyChange, rates, updatedAt, fallback, projectGradient }) {
  function formatTimestamp(iso) {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  }

  const rate    = currency !== 'INR' && rates ? rates[currency] : null;
  const ts      = formatTimestamp(updatedAt);

  return (
    <div className="mb-3">
      {/* Toggle pills */}
      <div className="flex items-center gap-1 flex-wrap">
        {CURRENCIES.map(({ code, label }) => {
          const active = currency === code;
          return (
            <button
              key={code}
              onClick={() => onCurrencyChange(code)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all
                ${active
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'bg-white/15 text-white/70 hover:bg-white/25 hover:text-white'}`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Rate + timestamp — only when a non-INR currency is active */}
      {rate && (
        <p className="text-[10px] text-white/60 mt-2 flex items-center gap-1">
          {fallback ? (
            <>
              <RefreshCw size={9} />
              Live rates unavailable · approx. 1 INR = {rate.toFixed(4)} {currency}
            </>
          ) : (
            <>1 INR = {rate.toFixed(4)} {currency} · updated {ts}</>
          )}
        </p>
      )}
    </div>
  );
}
