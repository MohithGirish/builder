/*
 * OnboardingChat.jsx — AI-guided onboarding conversation.
 *
 * Talks to POST /api/v1/onboarding/chat (Claude, model claude-haiku-4-5) for a
 * warm, open-ended conversation that gathers the user's role-specific
 * preferences. When the backend signals completion it carries the same
 * structured preference fields the scripted flow used, which are saved via
 * AuthContext.savePreferences() before redirecting to the dashboard.
 * If the AI endpoint is unavailable (no API key) or errors on the first turn,
 * it falls back to the original scripted question flow so onboarding never
 * breaks. Also supports the "/onboarding/retake" path for updating preferences.
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../lib/api';

const BUILDER_PREF_KEYS  = ['city', 'project_type', 'projects_completed', 'funding_range'];
const INVESTOR_PREF_KEYS = ['investor_type', 'sectors', 'investment_range', 'regions'];

/* ── Scripted fallback question sets (used only if the AI is unavailable) ───── */
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

/* Render **bold** spans (the AI marks the choices it offers this way) as a
   brand-steel highlight; everything else stays plain text. No markdown lib. */
function renderRich(text) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i} className="font-semibold text-brand-700">{part.slice(2, -2)}</strong>
      : part
  );
}

/* ── Component ────────────────────────────────────────────────────────────── */
export default function OnboardingChat() {
  const { role, user, completeOnboarding, savePreferences, getAccessToken } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const isRetake  = location.pathname.includes('retake');

  const questions  = role === 'investor' ? INVESTOR_QUESTIONS : BUILDER_QUESTIONS;
  const totalSteps = questions.length;

  const [mode,        setMode]        = useState('deciding'); // 'deciding' | 'ai' | 'scripted'
  const [messages,    setMessages]    = useState([]);
  const [input,       setInput]       = useState('');
  const [step,        setStep]        = useState(0);          // scripted only
  const [answers,     setAnswers]     = useState([]);         // scripted only
  const [isTyping,    setIsTyping]    = useState(true);
  const [isComplete,  setIsComplete]  = useState(false);
  const [isLoading,   setIsLoading]   = useState(false);
  const [progress,    setProgress]    = useState(0);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  const firstName = user?.first_name || 'there';

  // Scroll to bottom on new messages, the typing indicator, and the loading bar.
  useEffect(() => {
    // block:'nearest' keeps the scroll inside the messages container — the
    // default 'start' would scroll the whole window, dragging the card off-screen.
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, isTyping, isLoading]);

  // Re-focus the input whenever it becomes enabled again, so the user can type
  // the next answer immediately without clicking. Runs after render (when the
  // disabled attribute has actually been cleared), unlike an inline .focus().
  useEffect(() => {
    if (mode !== 'deciding' && !isTyping && !isComplete) {
      inputRef.current?.focus();
    }
  }, [isTyping, isComplete, mode]);

  /* POST one conversational turn to the backend AI proxy. */
  async function postTurn(apiMessages) {
    const at = getAccessToken?.();
    const json = await apiFetch('/api/v1/onboarding/chat', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', ...(at ? { Authorization: `Bearer ${at}` } : {}) },
      body:    JSON.stringify({ role, userName: firstName, messages: apiMessages }),
    });
    return json.data; // { available, done, message, preferences }
  }

  /* UI messages → Anthropic message shape. */
  const toApi = (uiMsgs) =>
    uiMsgs.map((m) => ({ role: m.from === 'ai' ? 'assistant' : 'user', content: m.text }));

  // Decide the mode on mount: try the AI greeting, else fall back to scripted.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await postTurn([]);
        if (cancelled) return;
        // Key present (available) → LLM drives the whole conversation. The scripted
        // questions are only ever used when the AI is unavailable.
        if (res?.available) {
          setMode('ai');
          setIsTyping(false);
          const greeting = res.message
            || `Hi ${firstName}! I'd love to get to know you a little before we set things up. Tell me a bit about what you do?`;
          setMessages([{ from: 'ai', text: greeting }]);
          if (res.done && res.preferences) finishWith(res.preferences);
          inputRef.current?.focus();
        } else {
          startScripted();
        }
      } catch {
        if (!cancelled) startScripted();
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startScripted() {
    setMode('scripted');
    setIsTyping(true);
    setTimeout(() => {
      setMessages([{ from: 'ai', text: questions[0](answers, firstName) }]);
      setIsTyping(false);
      inputRef.current?.focus();
    }, 600);
  }

  // Scripted: show the next question when the step advances.
  useEffect(() => {
    if (mode !== 'scripted' || isComplete || step === 0) return;
    setIsTyping(true);
    const timer = setTimeout(() => {
      setMessages((prev) => [...prev, { from: 'ai', text: questions[step](answers, firstName) }]);
      setIsTyping(false);
      inputRef.current?.focus();
    }, 900);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, isComplete, mode]);

  // Animate loading progress bar, then complete onboarding + redirect.
  useEffect(() => {
    if (!isLoading) return;
    if (progress >= 88) {
      const t = setTimeout(() => {
        completeOnboarding();
        // New builders go through the verification step next; it consumes the
        // pending builderai_redirect on finish, so leave sessionStorage untouched.
        if (role === 'builder' && !isRetake) {
          navigate('/onboarding/verification', { replace: true });
          return;
        }
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
    const t = setTimeout(() => setProgress((p) => p + 1), 28);
    return () => clearTimeout(t);
  }, [isLoading, progress, role, navigate, completeOnboarding, isRetake]);

  /* Save preferences and kick off the completion animation. */
  function finishWith(preferences) {
    savePreferences(preferences);
    setIsComplete(true);
    setIsTyping(false);
    setTimeout(() => setIsLoading(true), 600);
  }

  function handleSend() {
    const val = input.trim();
    if (!val || isTyping || isComplete) return;
    if (mode === 'ai') handleSendAI(val);
    else handleSendScripted(val);
  }

  async function handleSendAI(val) {
    const next = [...messages, { from: 'user', text: val }];
    setMessages(next);
    setInput('');
    setIsTyping(true);
    try {
      const res = await postTurn(toApi(next));
      if (!res?.available) {
        setMessages((prev) => [...prev, { from: 'ai', text: "Sorry, I lost my train of thought there — could you say that again?" }]);
        setIsTyping(false);
        return;
      }
      if (res.message) setMessages((prev) => [...prev, { from: 'ai', text: res.message }]);
      setIsTyping(false);
      if (res.done && res.preferences) finishWith(res.preferences);
    } catch {
      setMessages((prev) => [...prev, { from: 'ai', text: "Sorry, I had a hiccup there — could you try sending that again?" }]);
      setIsTyping(false);
    }
  }

  function handleSendScripted(val) {
    setMessages((prev) => [...prev, { from: 'user', text: val }]);
    const newAnswers = [...answers, val];
    setAnswers(newAnswers);
    setInput('');

    if (step + 1 < totalSteps) {
      setStep((s) => s + 1);
    } else {
      const keys  = role === 'builder' ? BUILDER_PREF_KEYS : INVESTOR_PREF_KEYS;
      const prefs = keys.reduce((acc, key, i) => ({ ...acc, [key]: newAnswers[i] }), {});
      savePreferences(prefs);

      setIsComplete(true);
      setIsTyping(true);
      setTimeout(() => {
        setMessages((prev) => [...prev, { from: 'ai', text: COMPLETION[role] }]);
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

  const userInitial = (firstName[0] || 'U').toUpperCase();

  // Header subtitle + progress differ by mode (AI has no fixed step count).
  const currentStep = Math.min(step + 1, totalSteps);
  const subtitle =
    mode === 'scripted' ? (isRetake ? `Question ${currentStep} of ${totalSteps}` : `Step ${currentStep} of ${totalSteps}`)
    : mode === 'ai'      ? (isComplete ? 'All set!' : 'A quick chat to get to know you')
    :                      'Starting…';
  const headerProgress =
    isComplete           ? 100
    : mode === 'scripted' ? (step / totalSteps) * 100
    : mode === 'ai'       ? Math.min(90, messages.length * 12)
    :                       8;

  return (
    <div className="relative aurora bg-ink min-h-[calc(100dvh-56px)] flex items-center justify-center overflow-hidden p-4">
      {/* Blueprint dot texture */}
      <div className="absolute inset-0 hero-dot-grid opacity-40 pointer-events-none" />
      <div
        className="relative z-10 w-full max-w-xl bg-white rounded-2xl shadow-lifted overflow-hidden flex flex-col"
        style={{ height: '560px', maxHeight: 'calc(100dvh - 96px)' }}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="shrink-0 bg-brand-gradient">
          <div className="flex items-center gap-3 px-5 pt-4 pb-3">
            {/* Icon */}
            <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center shrink-0">
              <Sparkles size={18} className="text-white" />
            </div>

            {/* Title */}
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-tight">
                {isRetake ? 'Update Your Preferences' : 'AI Onboarding Assistant'}
              </p>
              <p className="font-mono text-[11px] text-white/70 mt-0.5 tracking-wide">{subtitle}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-white/20">
            <div
              className="h-full bg-azure transition-all duration-500"
              style={{ width: `${headerProgress}%` }}
            />
          </div>
        </div>

        {/* ── Messages ────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-white">

          {messages.map((msg, i) => (
            msg.from === 'ai' ? (
              /* AI bubble */
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-brand-gradient">
                  <Sparkles size={13} className="text-white" />
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[82%]">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{renderRich(msg.text)}</p>
                </div>
              </div>
            ) : (
              /* User bubble */
              <div key={i} className="flex items-start gap-2.5 flex-row-reverse">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5 bg-slate-700">
                  {userInitial}
                </div>
                <div className="bg-brand-600 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[82%]">
                  <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            )
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-brand-gradient">
                <Sparkles size={13} className="text-white" />
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3.5">
                <div className="flex items-center gap-1.5">
                  {[0, 150, 300].map(delay => (
                    <span
                      key={delay}
                      className="w-2 h-2 rounded-full bg-slate-400 animate-pulse"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Loading / analysing state */}
          {isLoading && (
            <div className="mx-2 bg-brand-50 border border-brand-100 rounded-xl px-5 py-4">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-4 h-4 rounded-full border-2 border-brand-600 border-t-transparent animate-spin shrink-0" />
                <span className="text-sm text-slate-700 font-medium">{LOADING_MSG[role]}</span>
              </div>
              <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-75 bg-brand-gradient"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="font-mono text-xs text-slate-400 mt-1.5">{progress}% complete</p>
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
              aria-label="Your message"
              disabled={isTyping || isComplete}
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-100 disabled:bg-slate-50 disabled:text-slate-400"
            />
            <button
              onClick={handleSend}
              aria-label="Send message"
              disabled={!input.trim() || isTyping || isComplete}
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white transition-all hover:-translate-y-0.5 hover:shadow-glow active:translate-y-0 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 shrink-0 bg-brand-gradient"
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
