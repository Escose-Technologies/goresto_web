// Shared order-status helpers used by the Orders grid and the details modal.

// MUI palette key per status (for chips / text).
export const STATUS_COLOR = {
  pending: 'warning',
  accepted: 'info',
  rejected: 'error',
  'on-hold': 'default',
  preparing: 'info',
  prepared: 'success',
  served: 'success',
  ready: 'success',
  completed: 'success',
  cancelled: 'error',
};

// Solid colour per status (for the card spine / dot).
export const STATUS_DOT = {
  pending: 'warning.main',
  accepted: 'info.main',
  rejected: 'error.main',
  'on-hold': 'grey.500',
  preparing: 'info.main',
  prepared: 'success.light',
  served: 'success.main',
  ready: 'success.dark',
  completed: 'success.main',
  cancelled: 'error.main',
};

export const isFinished = (s) => s === 'completed' || s === 'cancelled';

// Urgency for sorting orders — lower = needs attention sooner.
export const URGENCY = { pending: 0, accepted: 1, 'on-hold': 1, preparing: 2, prepared: 3, ready: 3, served: 4 };

export const money = (n, cur = '₹') => `${cur}${Number(n || 0).toFixed(2)}`;

// Short relative time, e.g. "12m ago", "3h ago", "2d ago".
export const timeAgo = (iso) => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};
