export const formatPrice = (value) => `EGP ${Number(value).toLocaleString('en-US')}`;

export const pluralize = (count, word) => `${count} ${word}${count === 1 ? '' : 's'}`;

const sameDay = (a, b) => a.toDateString() === b.toDateString();
const yesterdayOf = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);

/** "14:05" */
export const formatTime = (value) =>
  new Date(value).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

/** Chat list stamp: time today, "Yesterday", otherwise "12 Oct". */
export const formatShortDate = (value) => {
  const date = new Date(value);
  const now = new Date();
  if (sameDay(date, now)) return formatTime(date);
  if (sameDay(date, yesterdayOf(now))) return 'Yesterday';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

/** Day separator inside a thread: "Today", "Yesterday", "Monday, 12 October". */
export const formatDayLabel = (value) => {
  const date = new Date(value);
  const now = new Date();
  if (sameDay(date, now)) return 'Today';
  if (sameDay(date, yesterdayOf(now))) return 'Yesterday';
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
};

/** "just now", "5m ago", "3h ago", then the short date. */
export const formatTimeAgo = (value) => {
  const seconds = Math.floor((Date.now() - new Date(value)) / 1000);
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return formatShortDate(value);
};

export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
