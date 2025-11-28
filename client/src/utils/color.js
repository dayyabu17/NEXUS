export const hexToRgba = (hex, alpha = 1) => {
  if (typeof hex !== 'string') {
    return `rgba(0, 0, 0, ${alpha})`;
  }

  let normalized = hex.trim();
  if (!normalized.startsWith('#')) {
    normalized = `#${normalized}`;
  }

  if (normalized.length === 4) {
    const r = normalized[1];
    const g = normalized[2];
    const b = normalized[3];
    normalized = `#${r}${r}${g}${g}${b}${b}`;
  }

  if (!/^#([0-9A-Fa-f]{6})$/.test(normalized)) {
    return `rgba(0, 0, 0, ${alpha})`;
  }

  const value = parseInt(normalized.slice(1), 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
