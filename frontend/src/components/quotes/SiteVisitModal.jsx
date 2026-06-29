/*
 * SiteVisitModal.jsx — Site visit scheduling modal for real estate projects.
 *
 * Collects visitor name (pre-filled from auth), email, phone, preferred date,
 * preferred time slot, and optional notes. On submit POSTs to the backend
 * /api/v1/quotes/site-visit endpoint which sends an email to the project
 * developer. Displays a confirmation state on success.
 */
import { useState } from 'react';
import { X, Calendar, Clock, User, Phone, Mail, CheckCircle2, Loader2, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';

const TIME_SLOTS = [
  '9:00 AM – 11:00 AM',
  '11:00 AM – 1:00 PM',
  '2:00 PM – 4:00 PM',
  '4:00 PM – 6:00 PM',
];

export default function SiteVisitModal({ project, onClose }) {
  const { user } = useAuth();

  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ');
  const [name,    setName]    = useState(fullName || '');
  const [email,   setEmail]   = useState(user?.email || '');
  const [phone,   setPhone]   = useState('');
  const [date,    setDate]    = useState('');
  const [slot,    setSlot]    = useState('');
  const [notes,   setNotes]   = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState('');

  const isValid = name.trim() && email.trim() && phone.trim() && date && slot;

  async function handleSubmit() {
    setLoading(true);
    setError('');
    try {
      await apiFetch('/api/v1/quotes/site-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName:   project.name,
          projectEmail:  project.email || 'sales@e-infra.in',
          visitorName:   name.trim(),
          visitorEmail:  email.trim(),
          visitorPhone:  phone.trim(),
          preferredDate: date,
          preferredTime: slot,
          notes:         notes.trim(),
        }),
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in overflow-hidden flex flex-col max-h-[90dvh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-5 flex items-start justify-between shrink-0" style={{ background: project.gradient }}>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin size={15} className="text-white/80" />
              <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">Schedule Site Visit</span>
            </div>
            <h2 className="text-lg font-extrabold text-white leading-tight">{project.name}</h2>
          </div>
          <button onClick={onClose} aria-label="Close dialog" className="w-11 h-11 -m-2.5 flex items-center justify-center text-white/60 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 flex-1 min-h-0 overflow-y-auto">
          {success ? (
            <div className="text-center py-4">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background: project.gradient }}
              >
                <CheckCircle2 size={26} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Visit Scheduled!</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-5">
                Your site visit request for <strong>{project.name}</strong> has been submitted.
                The developer will contact you at <strong>{email}</strong> to confirm the appointment.
              </p>
              <button
                onClick={onClose}
                className="w-full py-2.5 rounded-xl text-white text-sm font-bold"
                style={{ background: project.gradient }}
              >
                Done
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="visit-name" className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Name</label>
                  <div className="relative">
                    <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="visit-name"
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Full name"
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-400 text-sm text-slate-800 placeholder-slate-400"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="visit-phone" className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Phone</label>
                  <div className="relative">
                    <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      id="visit-phone"
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-400 text-sm text-slate-800 placeholder-slate-400"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="visit-email" className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Email</label>
                <div className="relative">
                  <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    id="visit-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-400 text-sm text-slate-800 placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label htmlFor="visit-date" className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                  <Calendar size={11} className="inline mr-1" />Preferred Date
                </label>
                <input
                  id="visit-date"
                  type="date"
                  value={date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-400 text-sm text-slate-800"
                />
              </div>

              {/* Time slot */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">
                  <Clock size={11} className="inline mr-1" />Preferred Time Slot
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TIME_SLOTS.map(s => (
                    <button
                      key={s}
                      onClick={() => setSlot(s)}
                      aria-pressed={slot === s}
                      className="py-2 px-3 rounded-xl text-xs font-semibold border-2 transition-all text-left"
                      style={
                        slot === s
                          ? { borderColor: project.color, color: project.color, background: project.color + '12' }
                          : { borderColor: '#e2e8f0', color: '#64748b' }
                      }
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="visit-notes" className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Notes (Optional)</label>
                <textarea
                  id="visit-notes"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Any specific requirements or questions for the visit…"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-teal-400 text-sm text-slate-800 placeholder-slate-400 resize-none"
                />
              </div>

              {error && (
                <div role="alert" className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!isValid || loading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-bold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: project.gradient }}
                >
                  {loading ? <><Loader2 size={14} className="animate-spin" /> Booking…</> : 'Schedule Visit'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
