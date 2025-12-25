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
    accent: 'bg-emerald-500/15',
    iconColor: 'text-emerald-200',
    dot: 'bg-emerald-400',
  },
  highlight: {
    accent: 'bg-amber-500/12',
    iconColor: 'text-amber-200',
    dot: 'bg-amber-400',
  },
  info: {
    accent: 'bg-accent-500/12',
    iconColor: 'text-accent-500',
    dot: 'bg-accent-500',
  },
  default: {
    accent: 'bg-white/8',
    iconColor: 'text-white/70',
    dot: 'bg-white/50',
  },
};

export const getNotificationInitial = (value) => {
  if (!value || typeof value !== 'string') {
    return 'N';
  }

  const trimmed = value.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : 'N';
};
