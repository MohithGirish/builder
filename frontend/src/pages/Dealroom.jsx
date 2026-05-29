/*
 * Dealroom.jsx — Real-time deal collaboration page.
 *
 * Assembles the full dealroom UI by composing DashboardSidebar,
 * ConversationList, and ChatPanel. Manages the currently selected
 * conversation ID in local state and passes it down to the child panels.
 * Uses mock data (MOCK_DEALROOMS) during development; real-time messaging
 * is handled via Socket.io inside ChatPanel.
 */
import { useState } from 'react';
import DashboardSidebar    from '../components/dashboard/DashboardSidebar';
import ConversationList    from '../components/dealroom/ConversationList';
import ChatPanel           from '../components/dealroom/ChatPanel';
import { MOCK_DEALROOMS, MOCK_USER } from '../data/dealrooms';

export default function Dealroom() {
  const [selectedId, setSelectedId] = useState(MOCK_DEALROOMS[0]?.id || null);
  const currentUserId = MOCK_USER.id;

  return (
    <div
      className="flex bg-[#f0f6ff]"
      style={{ height: 'calc(100vh - 56px)' }}
    >
      <DashboardSidebar />

      <div className="flex-1 flex overflow-hidden">
        <ConversationList
          selectedId={selectedId}
          onSelect={setSelectedId}
          currentUserId={currentUserId}
        />
        <ChatPanel
          dealroomId={selectedId}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
}
