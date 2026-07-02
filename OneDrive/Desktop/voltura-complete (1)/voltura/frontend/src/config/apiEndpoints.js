/**
 * Every backend endpoint path, in one place. Mirrors the FastAPI router
 * prefixes exactly (see backend/app/api/v1/routes/*.py). Path-building
 * functions (e.g. byId) keep callers from concatenating strings themselves.
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
  },

  USERS: {
    LIST: '/users/',
    BY_ID: (id) => `/users/${id}`,
    ROLE: (id) => `/users/${id}/role`,
    STATUS: (id) => `/users/${id}/status`,
  },

  POWER_PURCHASE: {
    LIST: '/power-purchase/',
    SUMMARY: '/power-purchase/summary',
    BY_ID: (id) => `/power-purchase/${id}`,
    STATUS: (id) => `/power-purchase/${id}/status`,
  },

  OPEN_ACCESS: {
    LIST: '/open-access/',
    SUMMARY: '/open-access/summary',
    BY_ID: (id) => `/open-access/${id}`,
    STATUS: (id) => `/open-access/${id}/status`,
  },

  GENERATION: {
    LIST: '/generation/',
    SOURCE_WISE: '/generation/source-wise',
  },

  CONSUMPTION: {
    LIST: '/consumption/',
    BY_FEEDER: '/consumption/by-feeder',
  },

  PEAK_DEMAND: {
    LIST: '/peak-demand/',
    TREND: '/peak-demand/trend',
  },

  BILLING: {
    LIST: '/billing/',
    MONTHLY_SUMMARY: '/billing/monthly-summary',
    BY_ID: (id) => `/billing/${id}`,
    FINALIZE: (id) => `/billing/${id}/finalize`,
  },

  SETTLEMENT: {
    CREATE: '/settlement/',
    STATUS: (id) => `/settlement/${id}/status`,
  },

  ANALYTICS: {
    DASHBOARD_SUMMARY: '/analytics/dashboard-summary',
    COMBINED_TREND: '/analytics/combined-trend',
    DAILY: '/analytics/daily',
    MONTHLY: '/analytics/monthly',
    YEARLY: '/analytics/yearly',
  },

  REPORTS: {
    GENERATE: '/reports/generate',
    BY_ID: (id) => `/reports/${id}`,
    FINANCIAL: '/reports/financial',
  },

  ALERTS: {
    RULES: '/alerts/rules',
    RULE_BY_ID: (id) => `/alerts/rules/${id}`,
    EVALUATE: '/alerts/rules/evaluate',
    NOTIFICATIONS: '/alerts/notifications',
    ACKNOWLEDGE: (id) => `/alerts/notifications/${id}/acknowledge`,
  },

  UPLOADS: {
    POWER_PURCHASE: '/uploads/power-purchase',
    OPEN_ACCESS: '/uploads/open-access',
    GENERATION: '/uploads/generation',
    CONSUMPTION: '/uploads/consumption',
    PEAK_DEMAND: '/uploads/peak-demand',
    COMMIT: (uploadId) => `/uploads/${uploadId}/commit`,
    HISTORY: '/uploads/history',
    ERRORS: (uploadId) => `/uploads/${uploadId}/errors`,
  },

  AUDIT_LOGS: {
    LIST: '/audit-logs/',
  },
};
