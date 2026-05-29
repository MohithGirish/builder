/*
 * OnboardingChat.jsx — AI-guided onboarding questionnaire.
 *
 * Simulates a conversational AI assistant that walks the user through 4
 * role-specific preference questions (city, project type, funding range, etc.)
 * step by step. Collects answers, saves them via AuthContext.savePreferences(),
 * marks onboarding complete, and animates a progress bar before redirecting to
 * the appropriate dashboard. Also supports the "/onboarding/retake" path for
 * updating preferences post-onboarding.
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Building2, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BUILDER_PREF_KEYS  = ['city', 'project_type', 'projects_completed', 'funding_range'];
const INVESTOR_PREF_KEYS = ['investor_type', 'sectors', 'investment_range', 'regions'];

/* ── Question sets ────────────────────────────────────────────────────────── */
const BUILDER_QUESTIONS = [
  (a, name) => `Welcome to Builder.AI Market, ${name}! Let's personalise your experience. Which city are you based in?`,
  ()        => "What type of projects do you specialise in? (e.g., Luxury Residential, Commercial, Infrastructure, Smart Cities)",
  ()        => "How many projects have you completed so far?",
  ()        => "What's the typical funding range you're looking for? (e.g., ₹50-100 Cr)",
];

const INVESTOR_QUESTIONS = [
  (a, name) => `Welcome to Builder.AI Market, ${name}! Let's personalise your experience. Are you an individual investor, VC Firm, or PE Fund?`,
  ()        => "Which sectors interest you most? (e.g., Residential, Commercial, Infrastructure, PropTech)",
  ()        => "What's your typical investment range per project? (e.g., ₹10-50 Cr)",
  ()        => "Which regions in India are you focusing on? (e.g., Mumbai, Bangalore, NCR)",
];

const COMPLETION = {
  builder:  "Perfect! I'll now match you with verified investors interested in your sector and location.",
  investor: "Excellent! Let me analyse 12,000+ builder portfolios to find your perfect matches.",
};

const LOADING_MSG = {
  builder:  'Analysing investor portfolios…',
  investor: 'Analysing builder portfolios…',
};

/* ── Component ────────────────────────────────────────────────────────────── */
export default function OnboardingChat() {
  const { role, user, completeOnboarding, savePreferences } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const isRetake  = location.pathname.includes('retake');

  const questions   = role === 'investor' ? INVESTOR_QUESTIONS : BUILDER_QUESTIONS;
  const totalSteps  = questions.length; // 5

  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState('');
  const [step,        setStep]        = useState(0);       // which question we're on
  const [answers,     setAnswers]     = useState([]);
  const [isTyping,    setIsTyping]    = useState(false);
  const [isComplete,  setIsComplete]  = useState(false);
  const [isLoading,   setIsLoading]   = useState(false);
  const [progress,    setProgress]    = useState(0);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Show AI question when step advances
  useEffect(() => {
    if (isComplete) return;
    setIsTyping(true);
    const delay = messages.length === 0 ? 600 : 900;
    const timer = setTimeout(() => {
      const text = questions[step](answers, user?.first_name || 'there');
      setMessages(prev => [...prev, { from: 'ai', text }]);
      setIsTyping(false);
      inputRef.current?.focus();
    }, delay);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, isComplete]);

  // Animate loading progress bar
  useEffect(() => {
    if (!isLoading) return;
    if (progress >= 88) {
      const t = setTimeout(() => {
        completeOnboarding();
        const savedRedirect = sessionStorage.getItem('builderai_redirect');
        if (savedRedirect && !isRetake) {
          sessionStorage.removeItem('builderai_redirect');
          navigate(savedRedirect, { replace: true });
        } else {
          navigate(isRetake ? '/profile' : (role === 'investor' ? '/investor-dashboard' : '/dashboard'), { replace: true });
        }
      }, 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setProgress(p => p + 1), 28);
    return () => clearTimeout(t);
  }, [isLoading, progress, role, navigate, completeOnboarding]);

  function handleSend() {
    const val = input.trim();
    if (!val || isTyping || isComplete) return;

    // Add user bubble
    setMessages(prev => [...prev, { from: 'user', text: val }]);
    const newAnswers = [...answers, val];
    setAnswers(newAnswers);
    setInput('');

    if (step + 1 < totalSteps) {
      setStep(s => s + 1);
    } else {
      // Save preferences before loading
      const keys  = role === 'builder' ? BUILDER_PREF_KEYS : INVESTOR_PREF_KEYS;
      const prefs = keys.reduce((acc, key, i) => ({ ...acc, [key]: newAnswers[i] }), {});
      savePreferences(prefs);

      setIsComplete(true);
      setIsTyping(true);
      setTimeout(() => {
        setMessages(prev => [...prev, { from: 'ai', text: COMPLETION[role] }]);
        setIsTyping(false);
        setTimeout(() => setIsLoading(true), 600);
      }, 900);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const userInitial = (user?.first_name?.[0] || 'U').toUpperCase();
  const currentStep = Math.min(step + 1, totalSteps);
  const headerProgress = isComplete ? 100 : ((step) / totalSteps) * 100;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg,#fff8f0 0%,#fffdf8 50%,#f8fff8 100%)' }}
    >
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col"
        style={{ height: '560px' }}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <div
          className="shrink-0"
          style={{ background: 'linear-gradient(to right,#f97316,#f59e0b)' }}
        >
          <div className="flex items-center gap-3 px-5 pt-4 pb-3">
            {/* Icon */}
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Building2 size={18} className="text-white" />
            </div>

            {/* Title */}
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-tight">
                {isRetake ? 'Update Your Preferences' : 'AI Onboarding Assistant'}
              </p>
              <p className="text-white/80 text-[11px] mt-0.5">
                {isRetake ? `Question ${currentStep} of ${totalSteps}` : `Almost there! Step ${currentStep} of ${totalSteps}`}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-white/20">
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${headerProgress}%`,
                background: 'linear-gradient(to right,#14c38e,#0d9488)',
              }}
            />
          </div>
        </div>

        {/* ── Messages ────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-white">

          {messages.map((msg, i) => (
            msg.from === 'ai' ? (
              /* AI bubble */
              <div key={i} className="flex items-start gap-2.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'linear-gradient(135deg,#f97316,#f59e0b)' }}
                >
                  <Building2 size={13} className="text-white" />
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[82%]">
                  <p className="text-sm text-slate-700 leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ) : (
              /* User bubble */
              <div key={i} className="flex items-start gap-2.5 flex-row-reverse">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
                  style={{ background: 'linear-gradient(to right,#f97316,#f59e0b)' }}
                >
                  {userInitial}
                </div>
                <div className="bg-slate-100 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[82%]">
                  <p className="text-sm text-slate-700 leading-relaxed">{msg.text}</p>
                </div>
              </div>
            )
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-start gap-2.5">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: 'linear-gradient(135deg,#f97316,#f59e0b)' }}
              >
                <Building2 size={13} className="text-white" />
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3.5">
                <div className="flex items-center gap-1.5">
                  {[0, 150, 300].map(delay => (
                    <span
                      key={delay}
                      className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Loading / analysing state */}
          {isLoading && (
            <div className="mx-2 bg-blue-50 border border-blue-100 rounded-xl px-5 py-4">
              <div className="flex items-center gap-2 mb-2.5">
                <div
                  className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin shrink-0"
                  style={{ borderColor: '#0d9488', borderTopColor: 'transparent' }}
                />
                <span className="text-sm text-slate-600 font-medium">{LOADING_MSG[role]}</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-75"
                  style={{
                    width: `${progress}%`,
                    background: 'linear-gradient(to right,#0d9488,#14c38e)',
                  }}
                />
              </div>
              <p className="text-xs text-slate-400 mt-1.5">{progress}% complete</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Input area ──────────────────────────────────────────── */}
        <div className="shrink-0 border-t border-slate-100 bg-white px-4 py-3">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer here…"
              disabled={isTyping || isComplete}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none transition-all focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-50 disabled:text-slate-400"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping || isComplete}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              style={{ background: 'linear-gradient(to right,#f97316,#f59e0b)' }}
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 text-center">Press Enter to send</p>
        </div>
      </div>
    </div>
  );
}
