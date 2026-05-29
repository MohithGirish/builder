/*
 * MessageBubble.jsx — Individual chat message bubble for the dealroom.
 *
 * Renders a single message in the correct alignment (right for self, left for
 * others) with an avatar for non-self messages. Supports text, file
 * attachment, and image message types. Shows a timestamp and a double-tick
 * read-receipt indicator below self messages.
 */
import { CheckCheck, FileText, Image } from 'lucide-react';
import { avatarGradient, getInitials, formatTime } from '../../data/dealrooms';

export default function MessageBubble({ message, isSelf }) {
  const { content, message_type, file_url, file_name, is_read, created_at, sender } = message;

  return (
    <div className={`flex items-end gap-2 mb-4 animate-fade-in ${isSelf ? 'flex-row-reverse' : 'flex-row'}`}>

      {/* Other-user avatar */}
      {!isSelf && (
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mb-1"
          style={{ background: avatarGradient(sender?.id) }}
        >
          {getInitials(sender)}
        </div>
      )}

      <div className={`max-w-[65%] flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
        {/* Bubble */}
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
            isSelf
              ? 'text-white rounded-br-sm bg-brand-gradient'
              : 'bg-white text-slate-700 border border-slate-100 rounded-bl-sm'
          }`}
        >
          {/* File / Image attachment */}
          {message_type === 'file' && (
            <a
              href={file_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <FileText size={16} />
              <span className="underline text-xs">{file_name || 'Attachment'}</span>
            </a>
          )}
          {message_type === 'image' && file_url && (
            <img
              src={file_url}
              alt={file_name || 'Image'}
              className="max-w-xs rounded-lg"
            />
          )}
          {/* Text content (always shown, even with attachments) */}
          {content && <p className="whitespace-pre-wrap">{content}</p>}
        </div>

        {/* Timestamp + read receipt */}
        <div className={`flex items-center gap-1 mt-1 ${isSelf ? 'flex-row-reverse' : ''}`}>
          <span className="text-[10px] text-slate-400">{formatTime(created_at)}</span>
          {isSelf && (
            <CheckCheck
              size={12}
              className={is_read ? 'text-brand-500' : 'text-slate-300'}
            />
          )}
        </div>
      </div>
    </div>
  );
}
