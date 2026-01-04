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
      return {
        label: 'Approved',
        className: 'bg-green-100 text-green-700 dark:bg-[#7ba743] dark:text-white',
      };
    case 'rejected':
      return {
        label: 'Rejected',
        className: 'bg-red-100 text-red-700 dark:bg-[#802020] dark:text-white',
      };
    default:
      return {
        label: 'Pending',
        className: 'bg-yellow-100 text-yellow-700 dark:bg-[#5a3f00] dark:text-white',
      };
  }
};
