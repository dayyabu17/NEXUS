import axios from 'axios';

const TOKEN_STORAGE_KEY = 'token';
const REFRESH_TOKEN_STORAGE_KEY = 'refreshToken';
const USER_STORAGE_KEY = 'user';
const REFRESH_ENDPOINT = '/auth/refresh';
const AUTH_HEADER = 'Authorization';
const PUBLIC_AUTH_ROUTES = ['/auth/login', '/auth/register', '/auth/refresh'];

const baseUrl = import.meta.env.MODE === 'production'
  ? 'https://nexus-c2v7.onrender.com/api'
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
});

const runWithStorage = (callback) => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return callback(window.localStorage);
  } catch {
    return null;
  }
};

const getStoredValue = (key) => runWithStorage((storage) => storage.getItem(key));

const setStoredValue = (key, value) => {
  runWithStorage((storage) => {
    if (value === undefined || value === null) {
      storage.removeItem(key);
    } else {
      storage.setItem(key, value);
    }
    return null;
  });
};

const updateStoredUser = (user) => {
  if (!user) {
    return;
  }

  runWithStorage((storage) => {
    const serialized = JSON.stringify(user);
    storage.setItem(USER_STORAGE_KEY, serialized);
    return null;
  });
};

const getToken = () => getStoredValue(TOKEN_STORAGE_KEY);
const setToken = (token) => setStoredValue(TOKEN_STORAGE_KEY, token);
const getRefreshToken = () => getStoredValue(REFRESH_TOKEN_STORAGE_KEY);
const setRefreshToken = (token) => setStoredValue(REFRESH_TOKEN_STORAGE_KEY, token);

const clearAuthStorage = () => {
  setStoredValue(TOKEN_STORAGE_KEY, null);
  setStoredValue(REFRESH_TOKEN_STORAGE_KEY, null);
};

const isAuthRoute = (url = '') => PUBLIC_AUTH_ROUTES.some((route) => url.includes(route));

const shouldSkipAuth = (config = {}) => Boolean(config.skipAuth) || isAuthRoute(config.url);

const createNormalizedError = (error, fallbackMessage) => {
  const response = error?.response;
  const status = response?.status ?? 0;
  const payload = response?.data ?? null;
  const networkMessage = error?.message || 'Request failed';
  const message = (payload && (payload.message || payload.error)) || fallbackMessage || networkMessage;

  const normalized = new Error(message);
  normalized.status = status;
  normalized.data = payload;
  normalized.code = error?.code;
  normalized.isNetworkError = !response && Boolean(error?.request);
  normalized.isAuthError = status === 401 || status === 419;
  normalized.response = response;
  normalized.request = error?.request;
  normalized.originalError = error;

  return normalized;
};

let refreshPromise = null;

const fetchRefreshedToken = () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    clearAuthStorage();
    return Promise.reject(new Error('No refresh token available'));
  }

  refreshPromise = refreshClient
    .post(REFRESH_ENDPOINT, { refreshToken })
    .then((response) => {
      const { token: nextToken, refreshToken: nextRefreshToken, user } = response?.data || {};

      if (!nextToken) {
        throw new Error('Missing token in refresh response');
      }

      setToken(nextToken);

      if (nextRefreshToken) {
        setRefreshToken(nextRefreshToken);
      }

      if (user) {
        updateStoredUser(user);
      }

      return nextToken;
    })
    .catch((refreshError) => {
      clearAuthStorage();
      throw refreshError;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

api.interceptors.request.use(
  (config) => {
    if (shouldSkipAuth(config)) {
      return config;
    }

    const token = getToken();

    if (token) {
      config.headers = { ...config.headers };
      if (!config.headers[AUTH_HEADER]) {
        config.headers[AUTH_HEADER] = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(createNormalizedError(error))
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;

    const eligibleForRefresh =
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !shouldSkipAuth(originalRequest);

    if (eligibleForRefresh) {
      originalRequest._retry = true;

      try {
        const nextToken = await fetchRefreshedToken();

        if (nextToken) {
          originalRequest.headers = { ...originalRequest.headers, [AUTH_HEADER]: `Bearer ${nextToken}` };
          return api(originalRequest);
        }
      } catch (refreshError) {
        const normalizedFailure = createNormalizedError(
          refreshError,
          'Session expired. Please sign in again.'
        );

        normalizedFailure.isAuthError = true;
        normalizedFailure.status = normalizedFailure.status || 401;

        return Promise.reject(normalizedFailure);
      }
    }

    return Promise.reject(createNormalizedError(error));
  }
);

export default api;