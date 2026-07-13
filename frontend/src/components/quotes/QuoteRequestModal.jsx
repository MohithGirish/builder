/*
 * QuoteRequestModal.jsx — Multi-step quote request form modal.
 *
 * Renders a 3-step flow: (1) contact details with name pre-filled from auth,
 * (2) layout preferences derived dynamically from the project's unit types,
 * (3) free-form requirements textarea. On submission POSTs to the backend
 * /api/v1/quotes endpoint which sends email to the builder and (if consented)
 * a WhatsApp template message to the user. Returns a quote ID for tracking.
 * Shows a success screen with a link to the generated quote page.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronRight, ChevronLeft, FileText, CheckCircle2, Phone, Mail, User, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';

function WhatsAppIcon({ className, style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function getLayoutOptions(project) {
  if (project.sections?.unitTypes?.length) {
    return project.sections.unitTypes.map(u => u.type);
  }
  if (project.unitTypes) {
    return project.unitTypes.split('&').map(s => s.trim()).filter(Boolean);
  }
  const type = (project.type || '').toLowerCase();
  if (type.includes('commercial') || type.includes('office')) {
    return ['Private Office (2,000–5,000 Sq.Ft.)', 'Co-Working Space', 'Retail Space', 'Managed Office Suite'];
  }
  if (type.includes('villa')) {
    return ['3 BHK Villa', '4 BHK Villa', '5 BHK Villa + Study'];
  }
  return ['1 BHK', '2 BHK', '3 BHK', '4 BHK', '4 BHK+'];
}

const STEPS = ['Contact Details', 'Layout Preferences', 'Requirements'];

export default function QuoteRequestModal({ project, onClose }) {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [step, setStep]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error,   setError]   = useState('');

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ');
  const [name,             setName]           = useState(fullName || '');
  const [email,            setEmailVal]       = useState(user?.email || '');
  const [phone,            setPhone]          = useState('');
  const [whatsappConsent,  setWhatsappConsent]= useState(false);
  const [selected,         setSelected]       = useState([]);
  const [reqs,             setReqs]           = useState('');

  const layoutOptions = getLayoutOptions(project);

  function toggleLayout(opt) {
    setSelected(prev =>
      prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
    );
  }

  function canAdvance() {
    if (step === 0) return name.trim() && email.trim() && phone.trim();
    if (step === 1) return true; // layout is optional
    return true;
  }

  async function handleSubmit() {
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch('/api/v1/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId:         project.uuid || project.id, // DB UUID resolves the builder for the socket nudge; slug is the routing id
          projectName:       project.name,
          projectEmail:      project.email || 'sales@e-infra.in',
          userName:          name.trim(),
          userEmail:         email.trim(),
          accountEmail:      user?.email || null, // ties the quote to the signed-in account for My Quotes, even if reply email differs
          userPhone:         phone.trim(),
          whatsappConsent,
          layoutPreferences: selected,
          requirements:      reqs.trim(),
        }),
      });
      setSuccess(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in overflow-hidden flex flex-col max-h-[90dvh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 pt-6 pb-5 flex items-start justify-between shrink-0"
          style={{ background: project.gradient }}
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText size={16} className="text-white/80" />
              <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">Request Quote</span>
            </div>
            <h2 className="text-lg font-extrabold text-white leading-tight">{project.name}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-11 h-11 -m-2.5 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Step indicator */}
        {!success && (
          <div className="px-6 pt-5 pb-2 shrink-0">
            <div className="flex items-center gap-2">
              {STEPS.map((label, i) => (
                <div key={i} className="flex items-center gap-2 flex-1">
                  <div
                    className="flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold shrink-0 transition-all"
                    style={
                      i < step
                        ? { background: project.gradient, color: 'white' }
                        : i === step
                        ? { background: project.color, color: 'white' }
                        : { background: '#f1f5f9', color: '#94a3b8' }
                    }
                  >
                    {i < step ? <CheckCircle2 size={13} /> : i + 1}
                  </div>
                  <span className={`text-xs font-semibold whitespace-nowrap ${i === step ? 'text-slate-700' : 'text-slate-400'}`}>
                    {label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-px mx-1 ${i < step ? 'bg-teal-300' : 'bg-slate-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Body */}
        <div className="px-6 pb-6 pt-4 flex-1 min-h-0 overflow-y-auto">

          {/* ── Success state ── */}
          {success && (
            <div className="text-center py-6">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: project.gradient }}
              >
                <CheckCircle2 size={26} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Quote Request Submitted!</h3>
              <p className="text-slate-500 text-sm mb-1 leading-relaxed">
                Your request for <strong>{project.name}</strong> has been sent to the developer.
              </p>
              <p className="text-slate-500 text-sm mb-4 leading-relaxed">
                You'll receive an email confirmation shortly. The developer will review your requirements and send you a quote.
              </p>
              {whatsappConsent && (
                <div className="animate-fade-in flex items-center gap-2.5 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-4 py-2.5 mb-4 text-left">
                  <div className="w-7 h-7 rounded-lg bg-[#25D366] flex items-center justify-center shrink-0">
                    <WhatsAppIcon className="w-3.5 h-3.5" style={{ color: '#fff' }} />
                  </div>
                  <p className="text-xs text-[#15803d] font-medium leading-snug">
                    WhatsApp confirmation on its way to your number
                  </p>
                </div>
              )}
              <div className="bg-slate-50 rounded-xl px-4 py-3 mb-5 text-left">
                <p className="text-xs text-slate-400 mb-1">Reference ID</p>
                <p className="text-xs font-mono font-bold text-slate-700 break-all">{success.id}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => { onClose(); navigate(`/quote/${success.id}`); }}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90"
                  style={{ background: project.gradient }}
                >
                  View Quote Status
                </button>
              </div>
            </div>
          )}

          {/* ── Step 0: Contact Details ── */}
          {!success && step === 0 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="quote-name" className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Full Name
                </label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="quote-name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-400 text-sm text-slate-800 placeholder-slate-400 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="quote-email" className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="quote-email"
                    type="email"
                    value={email}
                    onChange={e => setEmailVal(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-400 text-sm text-slate-800 placeholder-slate-400 transition-colors"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">The developer's response will be sent to this address.</p>
              </div>

              <div>
                <label htmlFor="quote-phone" className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="quote-phone"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-400 text-sm text-slate-800 placeholder-slate-400 transition-colors"
                  />
                </div>

                {/* WhatsApp consent toggle */}
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={whatsappConsent}
                  onClick={() => setWhatsappConsent(c => !c)}
                  className="w-full mt-2.5 flex items-center gap-3 px-3.5 py-3 rounded-xl border-2 text-left cursor-pointer select-none transition-all duration-300 focus-visible:outline-none"
                  style={{
                    borderColor:      whatsappConsent ? '#25D366' : '#e2e8f0',
                    backgroundColor:  whatsappConsent ? '#f0fdf4' : '#f8fafc',
                  }}
                >
                  {/* Icon bubble */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300"
                    style={{
                      background:  whatsappConsent ? '#25D366' : '#e2e8f0',
                      boxShadow:   whatsappConsent ? '0 2px 10px rgba(37,211,102,0.4)' : 'none',
                    }}
                  >
                    <WhatsAppIcon
                      className="w-4 h-4 transition-colors duration-300"
                      style={{ color: whatsappConsent ? '#fff' : '#94a3b8' }}
                    />
                  </div>

                  {/* Labels */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold transition-colors duration-300 leading-tight"
                      style={{ color: whatsappConsent ? '#15803d' : '#475569' }}
                    >
                      WhatsApp confirmation
                    </p>
                    <p
                      className="text-xs mt-0.5 leading-snug transition-colors duration-300"
                      style={{ color: whatsappConsent ? '#16a34a' : '#94a3b8' }}
                    >
                      {whatsappConsent
                        ? 'One message will be sent to your number'
                        : 'Tap to receive a quick WhatsApp update'}
                    </p>
                  </div>

                  {/* Animated checkbox tick */}
                  <div
                    className="w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200"
                    style={{
                      borderColor:     whatsappConsent ? '#25D366' : '#cbd5e1',
                      backgroundColor: whatsappConsent ? '#25D366' : '#fff',
                    }}
                  >
                    {whatsappConsent && (
                      <svg
                        className="animate-scale-in"
                        width="11" height="8" viewBox="0 0 11 8"
                        fill="none" xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1 3.5L4 6.5L10 1"
                          stroke="white" strokeWidth="2"
                          strokeLinecap="round" strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* ── Step 1: Layout Preferences ── */}
          {!success && step === 1 && (
            <div>
              <p className="text-sm text-slate-500 mb-4">
                Select the layout types you're interested in. You can choose multiple options.
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {layoutOptions.map(opt => {
                  const isOn = selected.includes(opt);
                  return (
                    <button
                      key={opt}
                      onClick={() => toggleLayout(opt)}
                      aria-pressed={isOn}
                      className="text-left px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all"
                      style={
                        isOn
                          ? { borderColor: project.color, color: project.color, background: project.color + '12' }
                          : { borderColor: '#e2e8f0', color: '#64748b' }
                      }
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                          style={isOn ? { borderColor: project.color, background: project.color } : { borderColor: '#cbd5e1' }}
                        >
                          {isOn && <CheckCircle2 size={10} className="text-white" />}
                        </div>
                        {opt}
                      </div>
                    </button>
                  );
                })}
              </div>
              {selected.length === 0 && (
                <p className="text-xs text-slate-400 mt-3 text-center">
                  No layout selected — you can still submit and specify in the next step.
                </p>
              )}
            </div>
          )}

          {/* ── Step 2: Requirements ── */}
          {!success && step === 2 && (
            <div>
              <p className="text-sm text-slate-500 mb-3">
                Describe your requirements, budget range, timeline, or any specific questions for the developer.
              </p>
              <textarea
                value={reqs}
                onChange={e => setReqs(e.target.value)}
                aria-label="Requirements, budget, and timeline"
                rows={6}
                placeholder="e.g. Looking for a 3 BHK facing east on a higher floor. Interested in the premium fittings package. Budget around ₹1.2 Cr. Ready to book by Q3 2026..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-400 text-sm text-slate-800 placeholder-slate-400 transition-colors resize-none leading-relaxed"
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                {reqs.length}/1000 characters
              </p>

              {error && (
                <div role="alert" className="mt-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          {!success && (
            <div className="flex items-center gap-3 mt-6">
              {step > 0 && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft size={15} /> Back
                </button>
              )}

              <button
                onClick={step < 2 ? () => setStep(s => s + 1) : handleSubmit}
                disabled={!canAdvance() || loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: project.gradient }}
              >
                {loading ? (
                  <><Loader2 size={15} className="animate-spin" /> Submitting…</>
                ) : step < 2 ? (
                  <>Next <ChevronRight size={15} /></>
                ) : (
                  <>Submit Request <CheckCircle2 size={15} /></>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
