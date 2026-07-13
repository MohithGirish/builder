/*
 * ConfirmDialog.jsx — Reusable confirmation modal for admin actions.
 *
 * Centered dialog matching the app's modal style (backdrop blur, rounded-2xl
 * card). Shows a title, message, and Cancel / Confirm buttons; `danger` styles
 * the confirm button red, otherwise brand. Disables buttons while `loading`.
 * Used by the admin users / verifications / projects pages for suspend, delete,
 * pause/resume and approve confirmations.
 */
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({
  title, message, confirmLabel = 'Confirm', danger = false,
  loading = false, onConfirm, onClose, children,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90dvh]">
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <h2 className={`text-base font-bold flex items-center gap-2 ${danger ? 'text-red-700' : 'text-slate-800'}`}>
            {danger && <AlertTriangle size={18} />} {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-11 h-11 -m-2 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        <div className="px-6 py-5 flex-1 min-h-0 overflow-y-auto">
          {message && <p className="text-sm text-slate-700 leading-relaxed">{message}</p>}
          {children}
          <div className="flex gap-3 pt-5">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50 ${
                danger ? 'bg-red-600 hover:bg-red-700' : 'bg-brand-600 hover:bg-brand-700'
              }`}
            >
              {loading ? 'Working…' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
