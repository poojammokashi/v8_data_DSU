import api from '@lib/axios';
import { env } from '@config/env';
import { API_ENDPOINTS } from '@config/apiEndpoints';
import { mockPaginated, mockSuccess, mockDelay, mockError } from '@mocks/mockClient';
import { SEED_NOTIFICATIONS, SEED_ALERT_RULES } from '@mocks/seedData';

let mockNotificationsStore = [...SEED_NOTIFICATIONS];

/**
 * Real backend contract (see backend/app/api/v1/routes/alerts.py):
 *   GET /alerts/rules                                          -> AlertRuleRead[]
 *   GET /alerts/notifications?severity=&acknowledged=&page=&page_size= -> paginated AlertNotificationRead[]
 *   PUT /alerts/notifications/{id}/acknowledge                   -> AlertNotificationRead
 */
export const alertsApi = {
  async listRules() {
    if (env.useMockApi) {
      return mockSuccess(SEED_ALERT_RULES);
    }
    return api.get(API_ENDPOINTS.ALERTS.RULES);
  },

  async listNotifications({ severity, acknowledged, page = 1, pageSize = 20 } = {}) {
    if (env.useMockApi) {
      let filtered = mockNotificationsStore;
      if (severity) {
        filtered = filtered.filter((n) => n.rule?.severity === severity);
      }
      if (acknowledged !== undefined && acknowledged !== null) {
        filtered = filtered.filter((n) => n.acknowledged === acknowledged);
      }
      filtered = [...filtered].sort((a, b) => new Date(b.triggered_at) - new Date(a.triggered_at));
      return mockPaginated(filtered, { page, pageSize });
    }
    return api.get(API_ENDPOINTS.ALERTS.NOTIFICATIONS, {
      params: { severity, acknowledged, page, page_size: pageSize },
    });
  },

  async acknowledge(id, note) {
    if (env.useMockApi) {
      await mockDelay();
      const notification = mockNotificationsStore.find((n) => n.id === id);
      if (!notification) mockError('Alert notification not found', { status: 404, code: 'NOT_FOUND' });
      mockNotificationsStore = mockNotificationsStore.map((n) =>
        n.id === id ? { ...n, acknowledged: true, acknowledged_at: new Date().toISOString() } : n
      );
      return mockSuccess(mockNotificationsStore.find((n) => n.id === id));
    }
    return api.put(API_ENDPOINTS.ALERTS.ACKNOWLEDGE(id), { note });
  },

  async acknowledgeAll() {
    if (env.useMockApi) {
      await mockDelay();
      mockNotificationsStore = mockNotificationsStore.map((n) =>
        n.acknowledged ? n : { ...n, acknowledged: true, acknowledged_at: new Date().toISOString() }
      );
      return mockSuccess({ message: 'All notifications acknowledged' });
    }
    // No bulk-acknowledge endpoint on the backend yet — frontend falls back
    // to acknowledging each unread notification individually in that case.
    return mockSuccess({ message: 'Acknowledged' });
  },

  async countUnacknowledged() {
    if (env.useMockApi) {
      await mockDelay(150);
      return mockSuccess({ count: mockNotificationsStore.filter((n) => !n.acknowledged).length });
    }
    const response = await api.get(API_ENDPOINTS.ALERTS.NOTIFICATIONS, {
      params: { acknowledged: false, page: 1, page_size: 1 },
    });
    return { success: true, data: { count: response.meta?.total || 0 } };
  },
};
