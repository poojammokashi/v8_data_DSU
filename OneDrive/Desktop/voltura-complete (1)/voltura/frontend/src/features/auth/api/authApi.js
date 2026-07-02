import api from '@lib/axios';
import { env } from '@config/env';
import { API_ENDPOINTS } from '@config/apiEndpoints';
import { mockSuccess, mockError, mockDelay } from '@mocks/mockClient';
import { SEED_USERS, SEED_PASSWORD } from '@mocks/seedData';

/**
 * Real backend contract (see backend/app/api/v1/routes/auth.py):
 *   POST /auth/login            -> { access_token, refresh_token, user }
 *   POST /auth/refresh          -> { access_token }
 *   POST /auth/logout           -> { message }
 *   GET  /auth/me               -> UserRead
 *   POST /auth/forgot-password  -> { message }
 *   POST /auth/reset-password   -> { message }
 *   POST /auth/change-password  -> { message }
 */
export const authApi = {
  async login({ email, password }) {
    if (env.useMockApi) {
      await mockDelay();
      const user = SEED_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user || password !== SEED_PASSWORD) {
        mockError('Invalid email or password', { status: 401, code: 'AUTHENTICATION_ERROR' });
      }
      if (user.status === 'suspended') {
        mockError('This account has been suspended. Contact your administrator.', { status: 401 });
      }
      return mockSuccess({
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        token_type: 'bearer',
        user,
      });
    }

    const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
    return response;
  },

  async refresh(refreshToken) {
    if (env.useMockApi) {
      return mockSuccess({ access_token: 'mock-access-token-refreshed', token_type: 'bearer' });
    }
    return api.post(API_ENDPOINTS.AUTH.REFRESH, { refresh_token: refreshToken });
  },

  async logout() {
    if (env.useMockApi) {
      return mockSuccess({ message: 'Logged out successfully' });
    }
    return api.post(API_ENDPOINTS.AUTH.LOGOUT);
  },

  async getMe() {
    if (env.useMockApi) {
      return mockSuccess(SEED_USERS[0]);
    }
    return api.get(API_ENDPOINTS.AUTH.ME);
  },

  async forgotPassword(email) {
    if (env.useMockApi) {
      return mockSuccess({ message: 'If that email exists, reset instructions have been sent.' });
    }
    return api.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
  },

  async resetPassword({ token, newPassword }) {
    if (env.useMockApi) {
      return mockSuccess({ message: 'Password has been reset successfully.' });
    }
    return api.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, new_password: newPassword });
  },

  async changePassword({ currentPassword, newPassword }) {
    if (env.useMockApi) {
      await mockDelay();
      if (currentPassword !== SEED_PASSWORD) {
        mockError('Current password is incorrect', { status: 422, code: 'VALIDATION_ERROR' });
      }
      return mockSuccess({ message: 'Password changed successfully.' });
    }
    return api.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },
};
