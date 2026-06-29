/*
 * DeleteAccountModal.jsx — Multi-step confirmation flow for deleting an account.
 *
 * Step 1 (all roles): irreversible-action warning (Continue / Cancel).
 * Step 2 (builders only): notice that listed projects will be delisted
 * (Yes, I understand / Cancel). Step 3 (all roles): re-authenticate by
 * re-entering email + password, then performs the hard delete via
 * AuthContext.deleteAccount(). Calls onDeleted() on success, onClose() to dismiss.
 */
import { useState } from 'react';
import { AlertTriangle, X, Mail, Lock, Trash2, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function DeleteAccountModal({ role, onClose, onDeleted }) {
  const { deleteAccount } = useAuth();
  const isBuilder = role === 'builder';

  const [step,     setStep]     = useState('confirm'); // 'confirm' | 'projects' | 'verify'
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  async function handleDelete(e) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      await deleteAccount(email.trim(), password);
      onDeleted();
    } catch (err) {
      setError(err.message || 'Failed to delete account.');
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90dvh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-100 shrink-0">
          <h2 className="text-base font-bold text-red-700 flex items-center gap-2">
            <AlertTriangle size={18} /> Delete Account
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-11 h-11 -m-2 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* ── Step 1: irreversible warning ─────────────────────────────── */}
        {step === 'confirm' && (
          <div className="px-6 py-5 flex-1 min-h-0 overflow-y-auto">
            <p className="text-sm text-slate-700 leading-relaxed">
              This action is <strong className="text-red-700">unreversible</strong>. Your account and all
              associated data will be permanently deleted. Are you sure you want to do this?
            </p>
            <div className="flex gap-3 pt-5">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep(isBuilder ? 'projects' : 'verify')}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2 (builders only): projects will be delisted ────────── */}
        {step === 'projects' && (
          <div className="px-6 py-5 flex-1 min-h-0 overflow-y-auto">
            <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50">
              <Building2 size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 leading-relaxed">
                All of your <strong>listed projects will be delisted</strong> and removed from investor
                discovery if you continue with this action.
              </p>
            </div>
            <div className="flex gap-3 pt-5">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setStep('verify')}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Yes, I understand
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: re-authenticate, then delete ─────────────────────── */}
        {step === 'verify' && (
          <form onSubmit={handleDelete} className="px-6 py-5 flex-1 min-h-0 overflow-y-auto">
            <p className="text-sm text-slate-600 mb-4">
              For your security, re-enter your email and password to confirm you own this account.
            </p>

            <div className="space-y-3">
              <div>
                <label htmlFor="del-email" className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="del-email"
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="del-password" className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="del-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-red-400 transition-colors"
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-xs font-semibold text-red-700 mt-3">{error}</p>}

            <div className="flex gap-3 pt-5">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !email.trim() || !password}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Trash2 size={14} />
                {loading ? 'Deleting…' : 'Delete My Account'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
