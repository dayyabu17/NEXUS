export const formatTimelineDate = (date) =>
  date.toLocaleDateString(undefined, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });

export const formatFullDate = (date) =>
  date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export const formatTime = (date) =>
  date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

export const getStatusBadge = (status) => {
  const normalized = (status || '').toLowerCase();

  switch (normalized) {
    case 'approved':
      return { label: 'Approved', className: 'bg-[#7ba743]' };
    case 'rejected':
      return { label: 'Rejected', className: 'bg-[#802020]' };
    default:
      return { label: 'Pending', className: 'bg-[#5a3f00]' };
  }
};
