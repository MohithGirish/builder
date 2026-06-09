/*
 * dealrooms.js — Utility helpers for the dealroom feature.
 *
 * Mock conversation data has been removed. Real dealroom data will be fetched
 * from the backend WebSocket and REST API once the Dealroom feature launches.
 * This file retains only the pure helper functions used across dealroom UI
 * components: participant resolution, initials generation, avatar gradients,
 * and relative / absolute time formatting.
 */

export const MOCK_USER      = null;
export const MOCK_DEALROOMS = [];

export const STATUS_CONFIG = {
  initial_discussion: { label: 'Initial Discussion', color: 'bg-blue-100 text-blue-700' },
  due_diligence:      { label: 'Due Diligence',      color: 'bg-orange-100 text-orange-700' },
  term_sheet:         { label: 'Term Sheet',          color: 'bg-amber-100 text-amber-700' },
  closed:             { label: 'Closed',              color: 'bg-green-100 text-green-700' },
  rejected:           { label: 'Rejected',            color: 'bg-red-100 text-red-700' },
};

export function getOtherParticipant(dealroom, currentUserId) {
  return dealroom.builder_id === currentUserId ? dealroom.investor : dealroom.builder;
}

export function getInitials(participant) {
  const f = participant?.first_name?.[0] || '';
  const l = participant?.last_name?.[0]  || '';
  return (f + l).toUpperCase() || '?';
}

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
  const diff  = Date.now() - new Date(iso).getTime();
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
