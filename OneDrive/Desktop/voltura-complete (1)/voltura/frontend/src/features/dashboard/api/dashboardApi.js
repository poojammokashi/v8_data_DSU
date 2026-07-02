import api from '@lib/axios';
import { env } from '@config/env';
import { API_ENDPOINTS } from '@config/apiEndpoints';
import { mockSuccess } from '@mocks/mockClient';
import {
  SEED_DAILY_TREND,
  SEED_SOURCE_MIX,
  SEED_POWER_PURCHASE,
  SEED_OPEN_ACCESS,
  SEED_BILLING,
  SEED_NOTIFICATIONS,
} from '@mocks/seedData';

function buildMockDashboardSummary() {
  const totalPurchase = SEED_POWER_PURCHASE.reduce((sum, p) => sum + p.quantity_mu, 0);
  const totalOpenAccess = SEED_OPEN_ACCESS.reduce((sum, o) => sum + o.quantity_mu, 0);
  const outstanding = SEED_BILLING.filter((b) => ['pending', 'overdue'].includes(b.status)).reduce(
    (sum, b) => sum + b.amount,
    0
  );
  const activeAlerts = SEED_NOTIFICATIONS.filter((n) => !n.acknowledged).length;

  return {
    power_purchase_mu: { label: 'Power Purchase', value: Math.round(totalPurchase), unit: 'MU', change_percent: 4.2 },
    generation_mwh: { label: 'Energy Generation', value: 9862, unit: 'MWh', change_percent: -1.8 },
    peak_demand_mw: { label: 'Peak Demand', value: 482.6, unit: 'MW', change_percent: 6.5 },
    open_access_mu: { label: 'Open Access Volume', value: Math.round(totalOpenAccess), unit: 'MU', change_percent: 2.1 },
    outstanding_billing: { label: 'Outstanding Billing', value: outstanding, unit: 'INR', change_percent: null },
    active_alerts: { label: 'Active Alerts', value: activeAlerts, unit: 'count', change_percent: null },
  };
}

/**
 * Real backend contract (see backend/app/api/v1/routes/analytics.py):
 *   GET /analytics/dashboard-summary?date_from=&date_to=  -> DashboardSummary
 *   GET /analytics/combined-trend?date_from=&date_to=     -> [{ date, purchase, generation, consumption }]
 *   GET /generation/source-wise?date_from=&date_to=       -> [{ source_type, source_name, quantity_mwh }]
 */
export const dashboardApi = {
  async getSummary({ dateFrom, dateTo }) {
    if (env.useMockApi) {
      return mockSuccess(buildMockDashboardSummary());
    }
    return api.get(API_ENDPOINTS.ANALYTICS.DASHBOARD_SUMMARY, {
      params: { date_from: dateFrom, date_to: dateTo },
    });
  },

  async getCombinedTrend({ dateFrom, dateTo }) {
    if (env.useMockApi) {
      return mockSuccess(SEED_DAILY_TREND);
    }
    return api.get(API_ENDPOINTS.ANALYTICS.COMBINED_TREND, {
      params: { date_from: dateFrom, date_to: dateTo },
    });
  },

  async getSourceMix({ dateFrom, dateTo }) {
    if (env.useMockApi) {
      return mockSuccess(SEED_SOURCE_MIX);
    }
    return api.get(API_ENDPOINTS.GENERATION.SOURCE_WISE, {
      params: { date_from: dateFrom, date_to: dateTo },
    });
  },
};
