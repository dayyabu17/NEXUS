export const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Date to be confirmed';
  }

  const dateLabel = date.toLocaleDateString(undefined, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const timeLabel = date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  return `${dateLabel} · ${timeLabel}`;
};

export const formatCurrency = (value) => {
  const amount = Number(value) || 0;
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
  }).format(amount);
};

const DEFAULT_AVATAR = '/images/default-avatar.jpeg';

export const resolveProfileImage = (value) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return DEFAULT_AVATAR;
  }

  const trimmed = value.trim();

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  return `http://localhost:5000/public${trimmed}`;
};

export const createGuestRecord = (name, email) => ({
  id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
  name,
  email,
  status: 'confirmed',
  addedAt: new Date().toISOString(),
  ticketId: null,
  avatar: null,
  checkedInAt: null,
  isCheckedIn: false,
  userId: null,
});

export const formatGuestStatus = (status, isCheckedIn = false) => {
  if (isCheckedIn) {
    return 'Checked-in';
  }

  if (!status) {
    return 'Pending';
  }

  const normalized = status.toLowerCase();

  if (normalized === 'checked-in') {
    return 'Checked-in';
  }

  if (normalized === 'confirmed') {
    return 'Confirmed';
  }

  return status;
};
