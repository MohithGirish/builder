/*
 * ConversationList.jsx — Left panel listing all active dealroom conversations.
 *
 * Renders a sidebar of all mock dealroom conversations (MOCK_DEALROOMS) with
 * participant avatars, company names, last message preview, project name,
 * dealroom status badge, relative timestamps, and unread-count badges.
 * Highlights the currently selected conversation and emits the selected id
 * to the parent via the onSelect callback.
 */
import { MessageSquare } from 'lucide-react';
import {
  MOCK_DEALROOMS,
  STATUS_CONFIG,
  getOtherParticipant,
  getInitials,
  avatarGradient,
  relativeTime,
} from '../../data/dealrooms';

export default function ConversationList({ selectedId, onSelect, currentUserId }) {
  const totalUnread = MOCK_DEALROOMS.reduce((s, d) => s + d.unread_count, 0);
  const lastMsg     = (dr) => dr.messages[dr.messages.length - 1];

  return (
    <aside className="w-72 shrink-0 flex flex-col bg-white border-r border-slate-100 h-full">

      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-brand-600" />
          <h2 className="text-sm font-bold text-slate-800">Active Conversations</h2>
        </div>
        {totalUnread > 0 && (
          <p className="text-xs text-slate-400 mt-0.5">{totalUnread} unread</p>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {MOCK_DEALROOMS.map((dr) => {
          const other   = getOtherParticipant(dr, currentUserId);
          const last    = lastMsg(dr);
          const status  = STATUS_CONFIG[dr.status];
          const isActive = dr.id === selectedId;

          return (
            <button
              key={dr.id}
              onClick={() => onSelect(dr.id)}
              className={`w-full text-left px-4 py-3.5 border-b border-slate-50 transition-colors duration-150 hover:bg-slate-50 ${
                isActive ? 'bg-brand-50 border-l-[3px] border-l-brand-500' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: avatarGradient(other?.id) }}
                >
                  {getInitials(other)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-semibold text-slate-800 truncate">
                      {other?.company || `${other?.first_name} ${other?.last_name}`}
                    </span>
                    {dr.unread_count > 0 && (
                      <span className="shrink-0 w-5 h-5 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                            style={{ background: 'linear-gradient(to right,#f97316,#f59e0b)' }}>
                        {dr.unread_count}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {other?.role === 'investor' ? other?.type || 'Investor' : 'Builder'}
                  </p>

                  <p className="text-xs text-slate-500 mt-1 truncate">
                    {dr.project_name}
                  </p>

                  {last && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {last.content}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-1.5">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${status?.color}`}>
                      {status?.label}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {relativeTime(dr.last_message_at)}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
