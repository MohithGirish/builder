/*
 * dealrooms.js — Static mock data and utilities for the dealroom feature.
 *
 * Exports MOCK_USER (current user), MOCK_DEALROOMS (array of dealroom objects
 * with embedded participants and message histories), STATUS_CONFIG (label and
 * colour mapping per dealroom status), and helper functions: getOtherParticipant,
 * getInitials, avatarGradient, relativeTime, and formatTime. Used by the
 * ConversationList, ChatPanel, and DashboardSidebar components.
 */
// Mock dealroom conversations — matches the Figma mockup exactly

export const MOCK_USER = {
  id:         'user-builder-1',
  role:       'builder',
  first_name: 'Imat',
  last_name:  'Delhi',
  company:    'Kumar Infrastructure Pvt. Ltd.',
  is_verified: true,
};

const now = Date.now();
const minsAgo  = (m) => new Date(now - m * 60 * 1000).toISOString();
const hoursAgo = (h) => new Date(now - h * 60 * 60 * 1000).toISOString();

export const MOCK_DEALROOMS = [
  {
    id:           'dr-1',
    builder_id:   'user-builder-1',
    investor_id:  'user-investor-1',
    project_id:   'p1',
    project_name: 'Skyline Towers',
    status:       'due_diligence',
    last_message_at: minsAgo(2),
    unread_count: 1,
    builder: {
      id:           'user-builder-1',
      first_name:   'Imat',
      last_name:    'Delhi',
      role:         'builder',
      company:      'Kumar Infrastructure Pvt. Ltd.',
      is_verified:  true,
    },
    investor: {
      id:           'user-investor-1',
      first_name:   'Aditya',
      last_name:    'Ventures',
      role:         'investor',
      company:      'Aditya Ventures',
      type:         'VC Firm',
      is_verified:  true,
    },
    messages: [
      {
        id:           'msg-1',
        dealroom_id:  'dr-1',
        sender_id:    'user-investor-1',
        content:      'Hi! I\'m interested in your Skyline Towers project. Could you share more details about the funding structure?',
        message_type: 'text',
        is_read:      true,
        created_at:   minsAgo(120),
        sender: { id: 'user-investor-1', first_name: 'Aditya', last_name: 'Ventures', role: 'investor' },
      },
      {
        id:           'msg-2',
        dealroom_id:  'dr-1',
        sender_id:    'user-builder-1',
        content:      'Hello! Thank you for your interest. Skyline Towers is a luxury residential project in Worli with a total funding requirement of ₹250 Cr. We\'re looking for ₹75 Cr in equity investment with projected ROI of 18-22% over 24 months.',
        message_type: 'text',
        is_read:      true,
        created_at:   minsAgo(95),
        sender: { id: 'user-builder-1', first_name: 'Imat', last_name: 'Delhi', role: 'builder' },
      },
      {
        id:           'msg-3',
        dealroom_id:  'dr-1',
        sender_id:    'user-investor-1',
        content:      'That sounds promising. What\'s the current funding status and timeline for completion?',
        message_type: 'text',
        is_read:      true,
        created_at:   minsAgo(80),
        sender: { id: 'user-investor-1', first_name: 'Aditya', last_name: 'Ventures', role: 'investor' },
      },
      {
        id:           'msg-4',
        dealroom_id:  'dr-1',
        sender_id:    'user-builder-1',
        content:      'We\'ve secured ₹175 Cr so far (70% funded). Project is RERA approved with expected completion in Q4 2025. All regulatory clearances are in place.',
        message_type: 'text',
        is_read:      true,
        created_at:   minsAgo(65),
        sender: { id: 'user-builder-1', first_name: 'Imat', last_name: 'Delhi', role: 'builder' },
      },
      {
        id:           'msg-5',
        dealroom_id:  'dr-1',
        sender_id:    'user-investor-1',
        content:      'Could you share the detailed project report and financial projections?',
        message_type: 'text',
        is_read:      false,
        created_at:   minsAgo(2),
        sender: { id: 'user-investor-1', first_name: 'Aditya', last_name: 'Ventures', role: 'investor' },
      },
    ],
  },
  {
    id:           'dr-2',
    builder_id:   'user-builder-1',
    investor_id:  'user-investor-2',
    project_id:   'p3',
    project_name: 'Tech Park Phase 2',
    status:       'term_sheet',
    last_message_at: hoursAgo(1),
    unread_count: 0,
    builder: {
      id:          'user-builder-1',
      first_name:  'Imat',
      last_name:   'Delhi',
      role:        'builder',
      company:     'Kumar Infrastructure Pvt. Ltd.',
      is_verified: true,
    },
    investor: {
      id:          'user-investor-2',
      first_name:  'Sharma',
      last_name:   'Capital',
      role:        'investor',
      company:     'Sharma Capital',
      type:        'Angel Investor',
      is_verified: true,
    },
    messages: [
      {
        id:           'msg-6',
        dealroom_id:  'dr-2',
        sender_id:    'user-investor-2',
        content:      'Looking forward to the meeting tomorrow.',
        message_type: 'text',
        is_read:      true,
        created_at:   hoursAgo(1),
        sender: { id: 'user-investor-2', first_name: 'Sharma', last_name: 'Capital', role: 'investor' },
      },
    ],
  },
  {
    id:           'dr-3',
    builder_id:   'user-builder-1',
    investor_id:  'user-investor-3',
    project_id:   'p2',
    project_name: 'Green Valley Residences',
    status:       'initial_discussion',
    last_message_at: hoursAgo(3),
    unread_count: 0,
    builder: {
      id:          'user-builder-1',
      first_name:  'Imat',
      last_name:   'Delhi',
      role:        'builder',
      company:     'Kumar Infrastructure Pvt. Ltd.',
      is_verified: true,
    },
    investor: {
      id:          'user-investor-3',
      first_name:  'Patel',
      last_name:   'Construction',
      role:        'investor',
      company:     'Patel Construction',
      type:        'Builder',
      is_verified: false,
    },
    messages: [
      {
        id:           'msg-7',
        dealroom_id:  'dr-3',
        sender_id:    'user-investor-3',
        content:      'Thanks for the introduction!',
        message_type: 'text',
        is_read:      true,
        created_at:   hoursAgo(3),
        sender: { id: 'user-investor-3', first_name: 'Patel', last_name: 'Construction', role: 'investor' },
      },
    ],
  },
];

// Status display config
export const STATUS_CONFIG = {
  initial_discussion: { label: 'Initial Discussion', color: 'bg-blue-100 text-blue-700' },
  due_diligence:      { label: 'Due Diligence',      color: 'bg-orange-100 text-orange-700' },
  term_sheet:         { label: 'Term Sheet',          color: 'bg-amber-100 text-amber-700' },
  closed:             { label: 'Closed',              color: 'bg-green-100 text-green-700' },
  rejected:           { label: 'Rejected',            color: 'bg-red-100 text-red-700' },
};

// Returns the "other" participant in a dealroom relative to currentUser
export function getOtherParticipant(dealroom, currentUserId) {
  return dealroom.builder_id === currentUserId ? dealroom.investor : dealroom.builder;
}

// Initials from a participant object
export function getInitials(participant) {
  const f = participant?.first_name?.[0] || '';
  const l = participant?.last_name?.[0]  || '';
  return (f + l).toUpperCase() || '?';
}

// Avatar background gradient pool
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#0d9488,#14c38e)',
  'linear-gradient(135deg,#7c3aed,#a78bfa)',
  'linear-gradient(135deg,#dc2626,#f87171)',
  'linear-gradient(135deg,#d97706,#fbbf24)',
  'linear-gradient(135deg,#0891b2,#38bdf8)',
  'linear-gradient(135deg,#059669,#34d399)',
];

export function avatarGradient(id = '') {
  const idx = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
}

export function relativeTime(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return 'just now';
  if (mins  < 60) return `${mins} min ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}
