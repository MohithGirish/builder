/*
 * Register.jsx — New user registration page.
 *
 * Split-screen via AuthLayout. Email field has a Mail icon prefix (pl-10).
 * Both password fields have a Lock prefix + eye-toggle right button. Inline
 * error messages replace the old banner. Submit shows Loader2 when loading.
 * On success navigates to /onboarding.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, Shield, BadgeCheck, Users, AlertTriangle } from 'lucide-react';
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
  if (!form.last_name.trim())
    errors.last_name = 'Last name is required.';
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

/* Reusable field with icon prefix + optional eye toggle */
function IconInput({ id, icon: Icon, type = 'text', name, value, onChange, placeholder, autoComplete, autoFocus, 'aria-invalid': ariaInvalid, 'aria-describedby': ariaDesc, hasError, showToggle, showValue, onToggle }) {
  return (
    <div className="relative">
      <Icon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        autoFocus={autoFocus}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDesc}
        className={`w-full pl-10 ${showToggle ? 'pr-11' : 'pr-4'} py-2.5 rounded-xl border text-sm outline-none transition-all ${
          hasError
            ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100'
            : 'border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100'
        }`}
      />
      {showToggle && (
        <button
          type="button"
          onClick={onToggle}
          aria-label={showValue ? 'Hide password' : 'Show password'}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
        >
          {showValue ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      )}
    </div>
  );
}

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form,        setForm]       = useState({ first_name: '', last_name: '', email: '', password: '', confirm_password: '' });
  const [errors,      setErrors]     = useState({});
  const [apiError,    setApiError]   = useState('');
  const [loading,     setLoading]    = useState(false);
  const [showPass,    setShowPass]   = useState(false);
  const [showConfirm, setShowConfirm]= useState(false);

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
      await register({
        first_name: form.first_name.trim(),
        last_name:  form.last_name.trim(),
        email:      form.email.trim().toLowerCase(),
        password:   form.password,
        role:       'builder',
      });
      navigate('/onboarding', { replace: true });
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const field = (name, label, opts = {}) => (
    <div key={name}>
      <label htmlFor={`reg-${name}`} className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label}
      </label>
      {opts.plain ? (
        /* Plain input (no icon) for first/last name */
        <input
          id={`reg-${name}`}
          name={name}
          value={form[name]}
          onChange={handleChange}
          placeholder={opts.placeholder}
          autoComplete={opts.autoComplete}
          aria-invalid={errors[name] ? true : undefined}
          aria-describedby={errors[name] ? `reg-${name}-err` : undefined}
          className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
            errors[name]
              ? 'border-red-400 bg-red-50 focus:ring-2 focus:ring-red-100'
              : 'border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-100'
          }`}
        />
      ) : (
        <IconInput
          id={`reg-${name}`}
          icon={opts.icon}
          type={opts.type || 'text'}
          name={name}
          value={form[name]}
          onChange={handleChange}
          placeholder={opts.placeholder}
          autoComplete={opts.autoComplete}
          autoFocus={opts.autoFocus}
          aria-invalid={errors[name] ? true : undefined}
          aria-describedby={errors[name] ? `reg-${name}-err` : undefined}
          hasError={!!errors[name]}
          showToggle={opts.showToggle}
          showValue={opts.showValue}
          onToggle={opts.onToggle}
        />
      )}
      {errors[name] && (
        <p id={`reg-${name}-err`} role="alert" className="text-xs text-red-600 mt-1.5">
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <AuthLayout
      headline="Start matching with the right partners."
      sub="Create your free account in seconds. Build your verified profile and let AI surface your best-fit matches."
      highlights={HIGHLIGHTS}
    >
      <div className="text-center mb-7">
        <h1 className="text-2xl font-bold text-slate-800">Create your account</h1>
        <p className="text-sm text-slate-500 mt-1.5">
          Join 45,000+ builders &amp; investors — takes 30 seconds
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-card p-8">
        {apiError && (
          <div role="alert" className="mb-5 flex items-start gap-2 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
            <AlertTriangle size={15} className="shrink-0 mt-0.5" />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            {field('first_name', 'First Name *', { plain: true, placeholder: 'Rajesh', autoComplete: 'given-name' })}
            {field('last_name',  'Last Name *',  { plain: true, placeholder: 'Kumar',  autoComplete: 'family-name' })}
          </div>

          {field('email', 'Email Address *', {
            icon: Mail, type: 'email',
            placeholder: 'you@company.com', autoComplete: 'email', autoFocus: true,
          })}

          {field('password', 'Password *', {
            icon: Lock, type: showPass ? 'text' : 'password',
            placeholder: 'Min 8 chars, uppercase, number, special char',
            autoComplete: 'new-password',
            showToggle: true, showValue: showPass, onToggle: () => setShowPass((v) => !v),
          })}

          {field('confirm_password', 'Confirm Password *', {
            icon: Lock, type: showConfirm ? 'text' : 'password',
            placeholder: 'Repeat your password',
            autoComplete: 'new-password',
            showToggle: true, showValue: showConfirm, onToggle: () => setShowConfirm((v) => !v),
          })}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white bg-brand-gradient transition-all hover:-translate-y-0.5 hover:shadow-glow active:translate-y-0 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Creating account…</>
              : <><ArrowRight size={16} /> Create Account &amp; Continue</>
            }
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-teal-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
