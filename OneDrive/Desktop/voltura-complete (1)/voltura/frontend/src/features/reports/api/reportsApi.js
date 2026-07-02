import api from '@lib/axios';
import { env } from '@config/env';
import { API_ENDPOINTS } from '@config/apiEndpoints';
import { mockSuccess, mockDelay, nextMockId } from '@mocks/mockClient';
import { SEED_REPORTS } from '@mocks/seedData';

// Mutable in-memory copy so generated reports persist for the session
// without touching the read-only seed export.
let mockReportsStore = [...SEED_REPORTS];

const REPORT_TYPE_LABELS = {
  financial: 'Monthly Financial Summary',
  settlement: 'Power Purchase Settlement',
  open_access: 'Open Access Transaction Log',
  analytics: 'Peak Demand Analysis',
  generation: 'Annual Generation Report',
};

/**
 * Real backend contract (see backend/app/api/v1/routes/reports.py):
 *   POST /reports/generate          -> ReportRead (202 Accepted, status="processing")
 *   GET  /reports/{id}              -> ReportRead
 *   GET  /reports/financial         -> ReportRead[]
 */
export const reportsApi = {
  async list({ type } = {}) {
    if (env.useMockApi) {
      await mockDelay();
      const filtered = type ? mockReportsStore.filter((r) => r.report_type === type) : mockReportsStore;
      return { success: true, data: filtered };
    }
    // The backend doesn't expose a generic "list all reports" endpoint yet
    // (only /reports/financial as a filtered convenience route) — calling
    // code should request by type once more report-type list endpoints
    // exist, or fall back to /reports/financial for the financial tab.
    return api.get(API_ENDPOINTS.REPORTS.FINANCIAL);
  },

  async generate({ reportType, dateFrom, dateTo }) {
    if (env.useMockApi) {
      await mockDelay(700);
      const newReport = {
        id: nextMockId('rpt'),
        name: `${REPORT_TYPE_LABELS[reportType] || reportType} — ${dateFrom} to ${dateTo}`,
        report_type: reportType,
        status: 'processing',
        generated_at: null,
        file_path: null,
      };
      mockReportsStore = [newReport, ...mockReportsStore];

      // Simulate the async render completing shortly after, so the UI can
      // demonstrate a status transition without a real background worker.
      setTimeout(() => {
        mockReportsStore = mockReportsStore.map((r) =>
          r.id === newReport.id
            ? { ...r, status: 'approved', generated_at: new Date().toISOString(), file_path: `/files/reports/${newReport.id}.pdf` }
            : r
        );
      }, 4000);

      return mockSuccess(newReport);
    }
    return api.post(API_ENDPOINTS.REPORTS.GENERATE, {
      report_type: reportType,
      date_from: dateFrom,
      date_to: dateTo,
    });
  },

  async getById(id) {
    if (env.useMockApi) {
      await mockDelay();
      const report = mockReportsStore.find((r) => r.id === id);
      return mockSuccess(report);
    }
    return api.get(API_ENDPOINTS.REPORTS.BY_ID(id));
  },
};
