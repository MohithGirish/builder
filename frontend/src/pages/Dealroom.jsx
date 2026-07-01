/*
 * Dealroom.jsx — Coming soon placeholder for the real-time deal collaboration hub.
 *
 * Displays a polished "Coming Soon" section explaining the planned Dealroom
 * feature: real-time messaging, document sharing, AI-powered deal summaries,
 * and status tracking. No mock data is used. Replaces the previous mock-data-
 * driven chat panel while the real WebSocket infrastructure is finalized.
 */
import { MessageSquare, Sparkles, FileText, Shield, Clock, ArrowRight, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const FEATURES = [
  {
    icon: MessageSquare,
    title: 'Real-Time Messaging',
    desc: 'Instant, secure communication between builders and investors within a dedicated deal room.',
    color: '#2b5e93',
  },
  {
    icon: FileText,
    title: 'Document Exchange',
    desc: 'Share term sheets, due diligence reports, and project documents securely in one place.',
    color: '#c2954a',
  },
  {
    icon: Sparkles,
    title: 'AI Deal Summaries',
    desc: 'AI-generated summaries of your conversations, highlighting key terms and next steps.',
    color: '#f59e0b',
  },
  {
    icon: Shield,
    title: 'Secure & Encrypted',
    desc: 'End-to-end encrypted deal rooms so your sensitive negotiations stay private.',
    color: '#5aa0e0',
  },
];

export default function Dealroom() {
  const navigate = useNavigate();
  const [notified, setNotified] = useState(false);
  const [notifyEmail, setNotifyEmail] = useState('');

  function handleNotify(e) {
    e.preventDefault();
    if (notifyEmail.trim()) setNotified(true);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#16263c] to-slate-950 flex flex-col items-center justify-center px-4 py-16">

      {/* Ambient glow — brand azure */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #2b5e93 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-3xl text-center">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold text-azure border border-white/20 bg-white/5 mb-8">
          <Clock size={12} />
          COMING SOON
        </div>

        {/* Icon */}
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl bg-brand-gradient">
          <MessageSquare size={36} className="text-white" />
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight">
          Deal Room
        </h1>
        <p className="text-slate-300 text-lg mb-3 font-medium">
          Your private space for closing deals — in real time.
        </p>
        <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed mb-12">
          The Dealroom is where builders and investors come together to negotiate, share documents,
          track deal progress, and close with confidence. We're building something exceptional.
        </p>

        {/* Feature grid */}
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          {FEATURES.map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left hover:bg-white/[0.08] transition-all backdrop-blur-sm"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: color + '25', border: `1px solid ${color}40` }}
              >
                <Icon size={18} style={{ color }} />
              </div>
              <h3 className="text-white font-bold text-sm mb-1">{title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Notify form */}
        {!notified ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-2 justify-center mb-3">
              <Bell size={16} className="text-brand-400" />
              <h3 className="text-white font-bold text-sm">Get notified when it launches</h3>
            </div>
            <form onSubmit={handleNotify} className="flex gap-2 max-w-sm mx-auto">
              <input
                type="email"
                value={notifyEmail}
                onChange={e => setNotifyEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="flex-1 px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-brand-500 focus:bg-white/15 transition-all"
              />
              <button
                type="submit"
                className="btn-brand px-5 py-2.5 text-sm flex items-center gap-1.5"
              >
                Notify Me <ArrowRight size={14} />
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-white/10 border border-white/20 rounded-2xl p-6 backdrop-blur-sm">
            <CheckIcon />
            <p className="text-slate-200 font-semibold text-sm mt-2">
              You're on the list! We'll notify you at <span className="font-bold">{notifyEmail}</span> when the Dealroom launches.
            </p>
          </div>
        )}

        {/* Back link */}
        <div className="mt-8">
          <button
            onClick={() => navigate(-1)}
            className="text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors inline-flex items-center gap-1.5"
          >
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center mx-auto">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M4 10l4 4 8-8" stroke="#2b5e93" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
