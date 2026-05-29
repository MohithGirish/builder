/*
 * ChatPanel.jsx — Active conversation panel for the dealroom.
 *
 * Displays the chat header (participant info, dealroom status, AI Summary
 * button, overflow menu), a scrollable message list with typing indicator,
 * and the MessageInput bar. Handles sending text and file messages by
 * appending them to local state. Provides an AI Summary modal that
 * summarises recent messages and suggests next steps based on dealroom status.
 */
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, MoreVertical, CheckCircle2, X, FolderOpen, ArrowRight } from 'lucide-react';
import MessageBubble from './MessageBubble';
import MessageInput  from './MessageInput';
import {
  MOCK_DEALROOMS,
  STATUS_CONFIG,
  getOtherParticipant,
  getInitials,
  avatarGradient,
  relativeTime,
} from '../../data/dealrooms';

const NEXT_STEPS = {
  initial_discussion: [
    'Share detailed project documentation',
    'Schedule a discovery call with the builder',
    'Request financial projections and RERA certificate',
  ],
  due_diligence: [
    'Submit all RERA and legal clearance documents',
    'Share a detailed financial model and revenue projections',
    'Arrange a site visit for the investor',
  ],
  term_sheet: [
    'Review and negotiate the term sheet clauses',
    'Complete final legal due diligence',
    'Finalise investment structure and disbursement schedule',
  ],
  closed: [
    'Execute the investment agreement',
    'Initiate fund transfer as per schedule',
    'Set up monthly project monitoring reports',
  ],
};

function buildSummary(dealroom, messages) {
  const status    = STATUS_CONFIG[dealroom.status]?.label || dealroom.status;
  const highlights = messages
    .filter((m) => m.content.length > 30)
    .slice(-4)
    .map((m) => ({
      role: m.sender?.role || 'unknown',
      text: m.content.length > 130 ? m.content.slice(0, 130) + '…' : m.content,
    }));
  const nextSteps = NEXT_STEPS[dealroom.status] || [];
  return { status, highlights, nextSteps };
}

export default function ChatPanel({ dealroomId, currentUserId }) {
  const dealroom   = MOCK_DEALROOMS.find((d) => d.id === dealroomId);
  const [messages,    setMessages]    = useState(dealroom?.messages || []);
  const [typing,      setTyping]      = useState(false);
  const [showMenu,    setShowMenu]    = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const bottomRef   = useRef(null);
  const navigate    = useNavigate();

  useEffect(() => {
    setMessages(dealroom?.messages || []);
    setShowMenu(false);
    setShowSummary(false);
  }, [dealroomId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend(content) {
    const newMsg = {
      id:           `msg-local-${Date.now()}`,
      dealroom_id:  dealroomId,
      sender_id:    currentUserId,
      content,
      message_type: 'text',
      is_read:      false,
      created_at:   new Date().toISOString(),
      sender: { id: currentUserId },
    };
    setMessages((prev) => [...prev, newMsg]);
  }

  function handleFileAttach(file, type) {
    const newMsg = {
      id:           `msg-local-${Date.now()}`,
      dealroom_id:  dealroomId,
      sender_id:    currentUserId,
      content:      '',
      message_type: type,
      file_url:     URL.createObjectURL(file),
      file_name:    file.name,
      is_read:      false,
      created_at:   new Date().toISOString(),
      sender: { id: currentUserId },
    };
    setMessages((prev) => [...prev, newMsg]);
  }

  function handleViewProject() {
    setShowMenu(false);
    navigate(`/projects?q=${encodeURIComponent(dealroom.project_name)}`);
  }

  function handleOpenSummary() {
    setShowMenu(false);
    setShowSummary(true);
  }

  if (!dealroom) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
        Select a conversation to start chatting
      </div>
    );
  }

  const other   = getOtherParticipant(dealroom, currentUserId);
  const status  = STATUS_CONFIG[dealroom.status];
  const summary = buildSummary(dealroom, messages);

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc] h-full min-w-0">

      {/* ── Chat header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-white border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
            style={{ background: avatarGradient(other?.id) }}
          >
            {getInitials(other)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-slate-800 truncate">
                {other?.company || `${other?.first_name} ${other?.last_name}`}
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                {dealroom.project_name}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${status?.color}`}>
                {status?.label}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Last active: {relativeTime(dealroom.last_message_at)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleOpenSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors"
          >
            <Brain size={13} />
            AI Summary
          </button>
          <div className="relative">
            <button
              onClick={() => setShowMenu((v) => !v)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <MoreVertical size={16} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-9 z-50 w-52 bg-white rounded-xl shadow-card-hover border border-slate-100 py-1 text-sm">
                <button
                  onClick={handleViewProject}
                  className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <FolderOpen size={13} className="text-brand-600" />
                  View Project Details
                </button>
                <button
                  onClick={handleOpenSummary}
                  className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                >
                  <Brain size={13} className="text-brand-600" />
                  AI Summary
                </button>
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Export Chat
                </button>
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Archive Dealroom
                </button>
                <hr className="my-1 border-slate-100" />
                <button
                  onClick={() => setShowMenu(false)}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors"
                >
                  Close Dealroom
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Messages area ─────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm gap-2">
            <CheckCircle2 size={32} className="text-brand-300" />
            <p className="font-medium text-slate-600">Dealroom created!</p>
            <p className="text-xs">Send the first message to get started.</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isSelf={msg.sender_id === currentUserId}
            />
          ))
        )}

        {typing && (
          <div className="flex items-end gap-2 mb-4">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
              style={{ background: avatarGradient(other?.id) }}
            >
              {getInitials(other)}
            </div>
            <div className="px-4 py-2.5 bg-white border border-slate-100 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Message input ─────────────────────────────────────────────────── */}
      <MessageInput onSend={handleSend} onFileAttach={handleFileAttach} />

      {/* ── AI Summary modal ──────────────────────────────────────────────── */}
      {showSummary && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowSummary(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

            {/* Modal header */}
            <div
              className="px-5 py-4 flex items-center justify-between"
              style={{ background: 'linear-gradient(to right,#0d9488,#0f766e)' }}
            >
              <div className="flex items-center gap-2">
                <Brain size={16} className="text-white" />
                <span className="text-white font-bold text-sm">
                  AI Summary — {dealroom.project_name}
                </span>
              </div>
              <button
                onClick={() => setShowSummary(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">

              {/* Status + stats */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${status?.color}`}>
                  {summary.status}
                </span>
                <span className="text-xs text-slate-500">
                  {messages.length} message{messages.length !== 1 ? 's' : ''} exchanged
                </span>
                <span className="text-xs text-slate-500">
                  Last active {relativeTime(dealroom.last_message_at)}
                </span>
              </div>

              {/* Key discussion points */}
              {summary.highlights.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Key Discussion Points
                  </p>
                  <div className="space-y-2">
                    {summary.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-2.5 bg-slate-50 rounded-xl px-3 py-2.5">
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded mt-0.5 shrink-0"
                          style={
                            h.role === 'builder'
                              ? { background: '#fff3e0', color: '#e65100' }
                              : { background: '#e3f2fd', color: '#0d47a1' }
                          }
                        >
                          {h.role === 'builder' ? 'Builder' : 'Investor'}
                        </span>
                        <p className="text-xs text-slate-600 leading-relaxed">{h.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested next steps */}
              {summary.nextSteps.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                    Suggested Next Steps
                  </p>
                  <div className="space-y-1.5">
                    {summary.nextSteps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700">
                        <ArrowRight size={11} className="text-brand-500 mt-0.5 shrink-0" />
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* View project link */}
              <button
                onClick={handleViewProject}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(to right,#f97316,#f59e0b)' }}
              >
                <FolderOpen size={14} />
                View Full Project Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
