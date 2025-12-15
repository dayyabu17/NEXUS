const relativeTimeFormatter =
  typeof Intl !== 'undefined' && typeof Intl.RelativeTimeFormat === 'function'
    ? new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
    : null;

export const formatRelativeTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const diff = date.getTime() - Date.now();
  const abs = Math.abs(diff);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const ranges = [
    { limit: minute, value: diff / 1000, unit: 'second' },
    { limit: hour, value: diff / minute, unit: 'minute' },
    { limit: day, value: diff / hour, unit: 'hour' },
    { limit: Infinity, value: diff / day, unit: 'day' },
  ];

  const range = ranges.find((item) => abs < item.limit) || ranges[ranges.length - 1];
  const rounded = Math.round(range.value);

  if (relativeTimeFormatter) {
    return relativeTimeFormatter.format(rounded, range.unit);
  }

  const suffix = diff < 0 ? 'ago' : 'from now';
  const amount = Math.abs(rounded);
  const plural = amount === 1 ? range.unit : `${range.unit}s`;
  return `${amount} ${plural} ${suffix}`;
};
