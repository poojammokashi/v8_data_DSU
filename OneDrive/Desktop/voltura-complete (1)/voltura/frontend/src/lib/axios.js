import axios from 'axios';
import { env } from '@config/env';
import { API_ENDPOINTS } from '@config/apiEndpoints';
import { useAuthStore } from '@store/authStore';

export const api = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: env.apiTimeout,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every outgoing request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Token refresh queuing: if multiple requests fail with 401 while a refresh
 * is already in flight, they all wait on the same refresh promise instead
 * of each triggering their own — avoids a thundering herd of refresh calls
 * and the race condition where a second refresh invalidates the first.
 */
let refreshPromise = null;

function performRefresh() {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) {
    return Promise.reject(new Error('No refresh token available'));
  }

  // Plain axios call (not the `api` instance) to avoid recursing through
  // these same interceptors.
  return axios
    .post(`${env.apiBaseUrl}${API_ENDPOINTS.AUTH.REFRESH}`, { refresh_token: refreshToken })
    .then((response) => {
      const newAccessToken = response.data?.data?.access_token;
      if (!newAccessToken) throw new Error('Refresh response missing access_token');
      useAuthStore.getState().setAccessToken(newAccessToken);
      return newAccessToken;
    });
}

function normalizeError(error) {
  const status = error.response?.status;
  return {
    status,
    message:
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'Something went wrong. Please try again.',
    code: error.response?.data?.error?.code || 'UNKNOWN_ERROR',
    details: error.response?.data?.error?.details || null,
  };
}

function forceLogout() {
  useAuthStore.getState().logout();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config;
    const isAuthEndpoint =
      originalRequest?.url?.includes(API_ENDPOINTS.AUTH.LOGIN) ||
      originalRequest?.url?.includes(API_ENDPOINTS.AUTH.REFRESH);

    // Attempt exactly one silent refresh per request on 401 (never for the
    // login/refresh calls themselves — that would loop).
    if (status === 401 && !isAuthEndpoint && !originalRequest._retried) {
      originalRequest._retried = true;

      try {
        refreshPromise = refreshPromise || performRefresh();
        const newAccessToken = await refreshPromise;
        refreshPromise = null;

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        refreshPromise = null;
        forceLogout();
        return Promise.reject(normalizeError(error));
      }
    }

    if (status === 401 && (isAuthEndpoint || originalRequest._retried)) {
      // Refresh already attempted and still unauthorized, or the login
      // call itself failed — no further retry, just normalize and surface.
      if (!isAuthEndpoint) forceLogout();
    }

    return Promise.reject(normalizeError(error));
  }
);

export default api;
