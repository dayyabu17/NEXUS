export const DEFAULT_AVATAR = '/images/default-avatar.jpeg';

const getApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    return 'http://localhost:5000';
  }

  const envBase = import.meta?.env?.VITE_API_BASE_URL;
  if (envBase) {
    return envBase.replace(/\/$/, '');
  }

  const clientOrigin = window.location.origin;

  if (clientOrigin.includes('localhost')) {
    return 'http://localhost:5000';
  }

  try {
    const stored = window.localStorage.getItem('apiBaseUrl');
    if (stored) {
      return stored.replace(/\/$/, '');
    }
  } catch {
    // Ignore storage access errors
  }

  return clientOrigin;
};

export const resolveProfileImage = (value) => {
  if (!value) {
    return DEFAULT_AVATAR;
  }

  if (value.startsWith('http://') || value.startsWith('https://')) {
    return value;
  }

  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/public${value}`;
};
