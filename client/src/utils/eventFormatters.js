const FALLBACK_DATE = 'Select date';
const FALLBACK_TIME = 'Set time';

export const formatDateDisplay = (value) => {
  if (!value) {
    return FALLBACK_DATE;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return FALLBACK_DATE;
  }

  const formatter = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  });

  const parts = formatter.formatToParts(date).reduce(
    (acc, part) => {
      acc[part.type] = part.value;
      return acc;
    },
    {},
  );

  const { weekday, day, month } = parts;

  if (!weekday || !day || !month) {
    return FALLBACK_DATE;
  }

  return `${weekday}, ${day} ${month}`;
};

export const formatTimeDisplay = (value) => {
  if (!value) {
    return FALLBACK_TIME;
  }

  const [hours, minutes] = value.split(':');
  if (hours === undefined || minutes === undefined) {
    return FALLBACK_TIME;
  }

  const numericHours = Number(hours);
  const numericMinutes = Number(minutes);

  if (Number.isNaN(numericHours) || Number.isNaN(numericMinutes)) {
    return FALLBACK_TIME;
  }

  const twoDigit = (input) => input.toString().padStart(2, '0');
  return `${twoDigit(numericHours)}:${twoDigit(numericMinutes)}`;
};

export const capacityLabel = (value) => {
  if (!value) {
    return 'Unlimited';
  }

  return `${value} seats`;
};

export const ticketPriceLabel = (value) => {
  if (!value || Number(value) <= 0) {
    return 'Free';
  }

  const formatted = Number(value).toLocaleString();
  return `₦${formatted}`;
};
