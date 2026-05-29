/*
 * Login.jsx — User login page.
 *
 * Renders the sign-in form with email and password fields, client-side
 * validation, a "Remember me" checkbox, and a show/hide password toggle.
 * On successful authentication via AuthContext.login(), redirects the user
 * to their role-appropriate dashboard or the original intended destination
 * stored in router location state. Displays an API error banner on failure.
 */
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Building2, Eye, EyeOff, Loader2, ArrowRight,
  Shield, BadgeCheck, TrendingUp,
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
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const location     = useLocation();
  const from         = location.state?.from?.pathname;

  const [form, setForm]       = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPass, setShowPass]   = useState(false);
  const [errors, setErrors]   = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
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
      const dest = from && !from.startsWith('/login') && !from.startsWith('/register')
        ? from
        : user.role === 'builder' ? '/dashboard' : '/investor-dashboard';
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
      {/* Mobile logo */}
      <div className="flex lg:hidden justify-center mb-7">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-brand-gradient">
            <Building2 size={20} className="text-white" />
          </div>
          <div className="leading-tight">
            <span className="text-xl font-bold text-slate-800">Builder.AI</span>
            <span className="block text-[11px] text-slate-400 font-medium -mt-0.5">Market</span>
          </div>
        </Link>
      </div>

      {/* Heading */}
      <div className="text-center mb-7">
        <h1 className="text-2xl font-bold text-slate-800">Welcome back</h1>
        <p className="text-sm text-slate-500 mt-1.5">Sign in to your Builder.AI account</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-card p-8">

          {/* API error banner */}
          {apiError && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@company.com"
                autoComplete="email"
                autoFocus
                className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all
                  ${errors.email
                    ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100'
                    : 'border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100'
                  }`}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1.5">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-600">Password</label>
                <button
                  type="button"
                  className="text-xs text-brand-600 hover:underline font-medium"
                  tabIndex={-1}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`w-full px-4 py-2.5 pr-11 rounded-xl border text-sm outline-none transition-all
                    ${errors.password
                      ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100'
                      : 'border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1.5">{errors.password}</p>
              )}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 accent-teal-600 cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs text-slate-600 cursor-pointer select-none">
                Keep me signed in
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white bg-cta-gradient transition-all hover:-translate-y-0.5 hover:shadow-glow-amber active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Signing in…</>
                : <><ArrowRight size={16} /> Sign in</>
              }
            </button>
          </form>

          {/* Footer link */}
          <p className="text-center text-xs text-slate-500 mt-5">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:underline">
              Create one free
            </Link>
          </p>
      </div>
    </AuthLayout>
  );
}
