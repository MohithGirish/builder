/*
 * MessageInput.jsx — Compose bar for dealroom chat messages.
 *
 * Renders an auto-growing textarea (capped at 120px) with Enter-to-send
 * (Shift+Enter for newlines) and a send button. Provides file and image
 * attachment buttons via hidden file inputs that trigger the onFileAttach
 * callback with the selected file and its type ('file' or 'image').
 * Exports onSend(text) and onFileAttach(file, type) as prop callbacks.
 */
import { useRef, useState } from 'react';
import { Paperclip, Image, Send } from 'lucide-react';

export default function MessageInput({ onSend, onFileAttach, disabled }) {
  const [text, setText] = useState('');
  const textareaRef     = useRef(null);

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function submit() {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
    textareaRef.current?.focus();
  }

  function handleFileChange(e, type) {
    const file = e.target.files?.[0];
    if (file) onFileAttach?.(file, type);
    e.target.value = '';
  }

  return (
    <div className="shrink-0 border-t border-slate-100 bg-white px-5 pt-3 pb-4">

      {/* Attachment bar */}
      <div className="flex items-center gap-4 mb-2">
        <label className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-600 cursor-pointer transition-colors">
          <Paperclip size={14} />
          <span>Attach File</span>
          <input type="file" className="hidden" onChange={(e) => handleFileChange(e, 'file')} />
        </label>
        <label className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-600 cursor-pointer transition-colors">
          <Image size={14} />
          <span>Image</span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, 'image')} />
        </label>
      </div>

      {/* Input row */}
      <div className="flex items-end gap-3">
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            // Auto-grow
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
          }}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here..."
          disabled={disabled}
          className="flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-brand-400 focus:bg-white transition-colors disabled:opacity-50 overflow-hidden"
          style={{ minHeight: '42px' }}
        />
        <button
          onClick={submit}
          disabled={!text.trim() || disabled}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          style={{ background: 'linear-gradient(135deg,#1d4ed8,#2563eb)' }}
        >
          <Send size={15} />
        </button>
      </div>

      <p className="text-[10px] text-slate-400 mt-1.5">
        Press Enter to send • Shift + Enter for new line
      </p>
    </div>
  );
}
