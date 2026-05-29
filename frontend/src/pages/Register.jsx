/*
 * Register.jsx — New user registration page.
 *
 * Renders the account creation form collecting first name, last name, email,
 * password, and password confirmation with client-side validation enforcing
 * strong password rules. On success, calls AuthContext.register() and
 * redirects to the onboarding flow. Displays an API error banner on failure
 * and includes show/hide toggles for both password fields.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Eye, EyeOff, Loader2, ArrowRight, Shield, BadgeCheck, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const HIGHLIGHTS = [
  { icon: BadgeCheck, text: 'Get verified and stand out to serious partners' },
  { icon: Users,      text: 'Join 8,500+ active investors & 45,000+ builders' },
  { icon: Shield,     text: 'Your data is protected with bank-grade security' },
];

function validate(form) {
  const errors = {};
  if (!form.first_name.trim() || form.first_name.trim().length < 2)
    errors.first_name = 'First name must be at least 2 characters.';
  if (!form.last_name.trim() || form.last_name.trim().length < 2)
    errors.last_name = 'Last name must be at least 2 characters.';
  if (!form.email.trim())
    errors.email = 'Email is required.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = 'Please enter a valid email address.';
  if (!PASSWORD_REGEX.test(form.password))
    errors.password = 'Must be 8+ chars with uppercase, lowercase, number & special char (@$!%*?&).';
  if (form.password !== form.confirm_password)
    errors.confirm_password = 'Passwords do not match.';
  return errors;
}

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm]     = useState({ first_name: '', last_name: '', email: '', password: '', confirm_password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

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
      await register({
        first_name: form.first_name.trim(),
        last_name:  form.last_name.trim(),
        email:      form.email.trim().toLowerCase(),
        password:   form.password,
        role:       'builder', // overridden during onboarding
      });
      navigate('/onboarding', { replace: true });
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      headline="Start matching with the right partners."
      sub="Create your free account in seconds. Build your verified profile and let AI surface your best-fit matches."
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
        <h1 className="text-2xl font-bold text-slate-800">Create your account</h1>
        <p className="text-sm text-slate-500 mt-1.5">
          Join 45,000+ builders &amp; investors — takes 30 seconds
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-card p-8">

          {apiError && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-medium">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">First Name *</label>
                <input
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  placeholder="Rajesh"
                  autoComplete="given-name"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all
                    ${errors.first_name
                      ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100'
                      : 'border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100'}`}
                />
                {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Last Name *</label>
                <input
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  placeholder="Kumar"
                  autoComplete="family-name"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all
                    ${errors.last_name
                      ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100'
                      : 'border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100'}`}
                />
                {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email Address *</label>
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
                    : 'border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100'}`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password *</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min 8 chars, uppercase, number, special char"
                  autoComplete="new-password"
                  className={`w-full px-4 py-2.5 pr-11 rounded-xl border text-sm outline-none transition-all
                    ${errors.password
                      ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100'
                      : 'border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirm Password *</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirm_password"
                  value={form.confirm_password}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  className={`w-full px-4 py-2.5 pr-11 rounded-xl border text-sm outline-none transition-all
                    ${errors.confirm_password
                      ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100'
                      : 'border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-100'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.confirm_password && <p className="text-xs text-red-500 mt-1">{errors.confirm_password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white bg-cta-gradient transition-all hover:-translate-y-0.5 hover:shadow-glow-amber active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Creating account…</>
                : <><ArrowRight size={16} /> Create Account &amp; Continue</>
              }
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:underline">Sign in</Link>
          </p>
      </div>
    </AuthLayout>
  );
}
