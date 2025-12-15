export const formatCurrency = (value) => {
  if (!value) {
    return '₦0';
  }

  if (value >= 1_000_000) {
    return `₦${(value / 1_000_000).toFixed(2)}M`;
  }

  if (value >= 1_000) {
    return `₦${(value / 1_000).toFixed(2)}K`;
  }

  return `₦${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

export const getStatusConfig = (status) => {
  switch (status) {
    case 'approved':
      return { label: 'Approved', badgeClass: 'bg-[#7ba743]' };
    case 'rejected':
      return { label: 'Rejected', badgeClass: 'bg-[#802020]' };
    default:
      return { label: 'Pending', badgeClass: 'bg-[#5a3f00]' };
  }
};

export const formatEventDate = (dateString) => {
  const date = new Date(dateString);
  return {
    timelineLabel: date.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' }),
    timeLabel: date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    }),
    fullDateLabel: date.toLocaleDateString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
  };
};

export const relativeTimeFromNow = (dateString) => {
  if (!dateString) {
    return '';
  }

  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / (1000 * 60));

  if (diffMinutes < 1) {
    return 'Just now';
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
};
