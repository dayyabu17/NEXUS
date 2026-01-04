export const avatarImage = '/images/default-avatar.jpeg';

export const formatTime = (date) => {
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const isPM = hours >= 12;
  const displayHour = hours % 12 || 12;

  const offsetMinutesTotal = -date.getTimezoneOffset();
  const offsetSign = offsetMinutesTotal >= 0 ? '+' : '-';
  const offsetHours = Math.floor(Math.abs(offsetMinutesTotal) / 60);
  const offsetMinutes = Math.abs(offsetMinutesTotal) % 60;
  const offsetSuffix = offsetMinutes === 0
    ? `${offsetHours}`
    : `${offsetHours}:${offsetMinutes.toString().padStart(2, '0')}`;

  return `${displayHour}:${minutes}${isPM ? 'PM' : 'AM'} GMT${offsetSign}${offsetSuffix}`;
};

export const formatDisplayName = (value) => {
  if (!value || typeof value !== 'string') {
    return 'Organizer';
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return 'Organizer';
  }

  if (trimmed.length > 23) {
    return `${trimmed.slice(0, 12)}...`;
  }

  return trimmed;
};

export const notificationToneStyles = {
  success: {
    accent: 'bg-emerald-100/80 dark:bg-emerald-500/15',
    iconColor: 'text-emerald-600 dark:text-emerald-200',
    dot: 'bg-emerald-400',
  },
  highlight: {
    accent: 'bg-amber-100/80 dark:bg-amber-500/12',
    iconColor: 'text-amber-600 dark:text-amber-200',
    dot: 'bg-amber-400',
  },
  info: {
    accent: 'bg-accent-100/70 dark:bg-accent-500/12',
    iconColor: 'text-accent-600 dark:text-accent-500',
    dot: 'bg-accent-400 dark:bg-accent-500',
  },
  default: {
    accent: 'bg-slate-100 dark:bg-white/8',
    iconColor: 'text-slate-600 dark:text-white/70',
    dot: 'bg-slate-300 dark:bg-white/50',
  },
};

export const getNotificationInitial = (value) => {
  if (!value || typeof value !== 'string') {
    return 'N';
  }

  const trimmed = value.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : 'N';
};
