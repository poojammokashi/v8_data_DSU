import api from '@lib/axios';
import { env } from '@config/env';
import { API_ENDPOINTS } from '@config/apiEndpoints';
import { mockSuccess } from '@mocks/mockClient';
import { SEED_DAILY_TREND, SEED_MONTHLY_BILLING, SEED_SOURCE_MIX } from '@mocks/seedData';

/**
 * Real backend contract (see backend/app/api/v1/routes/analytics.py and billing.py):
 *   GET /analytics/daily?date_from=&date_to=     -> [{ date, purchase, generation, consumption }]
 *   GET /analytics/monthly?date_from=&date_to=    -> same series, frontend aggregates by period tab
 *   GET /analytics/yearly?date_from=&date_to=      -> same series
 *   GET /billing/monthly-summary?date_from=&date_to= -> [{ month, billed, settled }]
 *   GET /generation/source-wise?date_from=&date_to=   -> [{ source_type, source_name, quantity_mwh }]
 */
export const analyticsApi = {
  async getTrend({ period, dateFrom, dateTo }) {
    if (env.useMockApi) {
      return mockSuccess(SEED_DAILY_TREND);
    }
    const endpointMap = {
      daily: API_ENDPOINTS.ANALYTICS.DAILY,
      monthly: API_ENDPOINTS.ANALYTICS.MONTHLY,
      yearly: API_ENDPOINTS.ANALYTICS.YEARLY,
    };
    const endpoint = endpointMap[period] || API_ENDPOINTS.ANALYTICS.DAILY;
    return api.get(endpoint, { params: { date_from: dateFrom, date_to: dateTo } });
  },

  async getMonthlyBillingSummary({ dateFrom, dateTo }) {
    if (env.useMockApi) {
      return mockSuccess(SEED_MONTHLY_BILLING);
    }
    return api.get(API_ENDPOINTS.BILLING.MONTHLY_SUMMARY, {
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
