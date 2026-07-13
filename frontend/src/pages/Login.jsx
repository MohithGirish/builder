/*
 * Login.jsx — User sign-in page.
 *
 * Split-screen layout (AuthLayout). Email field has a Mail icon prefix (pl-10),
 * password has a Lock icon prefix + eye toggle button (absolute right-2).
 * Inline error messages replace the old error banner. Submit shows Loader2
 * spinner while loading. Redirects to role-appropriate dashboard on success.
 */
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff, Loader2, ArrowRight,
  Shield, BadgeCheck, TrendingUp, AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';

const HIGHLIGHTS = [
  { icon: BadgeCheck, text: 'Access 45,000+ verified builders & investors' },
  { icon: TrendingUp, text: 'Track ₹20,000+ Cr of active opportunities' },
  { icon: Shield,     text: 'Bank-grade security on every deal' },
];

function validate(form) {
  const errors = {};
  if (!form.email.trim())
    errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = 'Please enter a valid email address.';
  if (!form.password)
    errors.password = 'Password is required.';
  return errors;
}

export default function Login() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const location    = useLocation();
  const from        = location.state?.from?.pathname;

  const [form,      setForm]      = useState({ email: '', password: '' });
  const [showPass,  setShowPass]  = useState(false);
  const [errors,    setErrors]    = useState({});
  const [apiError,  setApiError]  = useState('');
  const [loading,   setLoading]   = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((p) => { const n = { ...p }; delete n[name]; return n; });
    if (apiError) setApiError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setApiError('');
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const user = await login(form.email.trim().toLowerCase(), form.password);
      const home = user.role === 'admin'
        ? '/admin'
        : user.role === 'builder' ? '/dashboard' : '/investor-dashboard';
      const dest = from && !from.startsWith('/login') && !from.startsWith('/register')
        ? from
        : home;
      navigate(dest, { replace: true });
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      headline="Welcome back to smarter dealmaking."
      sub="Sign in to pick up where you left off — your matches, dealrooms, and analytics are ready."
      highlights={HIGHLIGHTS}
    >
      {/* Heading */}
      <div className="text-center mb-7">
        <h1 className="text-2xl font-bold text-slate-800">Welcome back</h1>
        <p className="text-sm text-slate-500 mt-1.5">Sign in to your Builder.AI account</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-card p-8">

        {/* Global API error — inline, styled */}
        {apiError && (
          <div role="alert" className="mb-5 flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            <AlertTriangle size={15} className="shrink-0 mt-0.5" />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">

          {/* Email */}
          <div>
            <label htmlFor="login-email" className="block text-xs font-semibold text-slate-600 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                id="login-email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@company.com"
                autoComplete="email"
                autoFocus
                aria-invalid={errors.email ? true : undefined}
                aria-describedby={errors.email ? 'login-email-err' : undefined}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                  errors.email
                    ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100'
                    : 'border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100'
                }`}
              />
            </div>
            {errors.email && (
              <p id="login-email-err" role="alert" className="text-xs text-red-600 mt-1.5">
                {errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="text-xs font-semibold text-slate-600">
                Password
              </label>
              <button
                type="button"
                onClick={() => setApiError('Password reset coming soon. Contact support.')}
                className="text-xs text-teal-600 hover:underline font-medium"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                aria-invalid={errors.password ? true : undefined}
                aria-describedby={errors.password ? 'login-pass-err' : undefined}
                className={`w-full pl-10 pr-11 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                  errors.password
                    ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100'
                    : 'border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && (
              <p id="login-pass-err" role="alert" className="text-xs text-red-600 mt-1.5">
                {errors.password}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white bg-brand-gradient transition-all hover:-translate-y-0.5 hover:shadow-glow active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Signing in…</>
              : <><ArrowRight size={16} /> Sign in</>
            }
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-5">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-teal-600 hover:underline">
            Create one free
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
