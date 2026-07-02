import api from '@lib/axios';
import { env } from '@config/env';
import { API_ENDPOINTS } from '@config/apiEndpoints';
import { mockPaginated, mockSuccess, mockDelay, mockError, nextMockId } from '@mocks/mockClient';
import { SEED_UPLOAD_HISTORY } from '@mocks/seedData';

let mockUploadHistoryStore = [...SEED_UPLOAD_HISTORY];
const mockUploadValidations = new Map(); // upload_id -> validation result, for the commit step

const DATA_TYPE_ENDPOINT_MAP = {
  power_purchase: API_ENDPOINTS.UPLOADS.POWER_PURCHASE,
  open_access: API_ENDPOINTS.UPLOADS.OPEN_ACCESS,
  generation: API_ENDPOINTS.UPLOADS.GENERATION,
  consumption: API_ENDPOINTS.UPLOADS.CONSUMPTION,
  peak_demand: API_ENDPOINTS.UPLOADS.PEAK_DEMAND,
};

function inferFileType(filename) {
  const ext = filename.split('.').pop()?.toLowerCase();
  if (ext === 'csv') return 'csv';
  if (ext === 'xlsx' || ext === 'xls') return 'excel';
  if (ext === 'json') return 'json';
  return 'csv';
}

function buildMockValidationResult(file, dataType) {
  // Simulates the backend's row-level validation report. A small, fixed
  // proportion of rows are reported as failing, so the UI's error-review
  // flow has something representative to display.
  const totalRows = 40 + Math.floor(Math.random() * 60);
  const errorRows = Math.random() > 0.6 ? Math.floor(totalRows * 0.05) : 0;
  const validRows = totalRows - errorRows;

  const errors = Array.from({ length: errorRows }, (_, i) => ({
    row_number: 5 + i * 7,
    error_message: ["Missing required field 'quantity_mu'", "Field 'date' must be a valid date"][i % 2],
    raw_data: { date: '', quantity_mu: null },
  }));

  const preview = Array.from({ length: Math.min(10, validRows) }, (_, i) => ({
    date: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
    quantity_mu: Math.round((100 + Math.random() * 80) * 100) / 100,
  }));

  return {
    upload_id: nextMockId('upl'),
    filename: file.name,
    data_type: dataType,
    status: errorRows > 0 && validRows === 0 ? 'failed' : 'validated',
    total_rows: totalRows,
    valid_rows: validRows,
    error_rows: errorRows,
    errors,
    preview,
  };
}

/**
 * Real backend contract (see backend/app/api/v1/routes/uploads.py):
 *   POST /uploads/{data_type}        -> FileUploadValidationResult (phase 1: parse + validate, nothing committed yet)
 *   POST /uploads/{upload_id}/commit -> FileUploadCommitResult     (phase 2: persist staged rows)
 *   GET  /uploads/history             -> paginated FileUploadRead[]
 *   GET  /uploads/{upload_id}/errors  -> FileUploadRead (with nested errors)
 */
export const uploadsApi = {
  /**
   * @param {File} file - the browser File object from FileDropzone
   * @param {string} dataType - one of power_purchase | open_access | generation | consumption | peak_demand
   * @param {(percent: number) => void} onProgress - optional upload progress callback
   */
  async validate(file, dataType, onProgress) {
    if (env.useMockApi) {
      // Simulate progress ticks so the UI's progress bar has something to show.
      if (onProgress) {
        for (const pct of [20, 45, 70, 100]) {
          await mockDelay(180);
          onProgress(pct);
        }
      } else {
        await mockDelay(700);
      }

      const result = buildMockValidationResult(file, dataType);
      mockUploadValidations.set(result.upload_id, result);
      return mockSuccess(result);
    }

    const endpoint = DATA_TYPE_ENDPOINT_MAP[dataType];
    if (!endpoint) {
      throw new Error(`Unknown upload data type: ${dataType}`);
    }

    const formData = new FormData();
    formData.append('file', file);

    return api.post(endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress
        ? (event) => {
            const percent = event.total ? Math.round((event.loaded / event.total) * 100) : 0;
            onProgress(percent);
          }
        : undefined,
    });
  },

  async commit(uploadId) {
    if (env.useMockApi) {
      await mockDelay(500);
      const validation = mockUploadValidations.get(uploadId);
      if (!validation) mockError('File upload not found', { status: 404, code: 'NOT_FOUND' });

      const historyEntry = {
        id: uploadId,
        filename: validation.filename,
        file_type: inferFileType(validation.filename),
        data_type: validation.data_type,
        status: 'committed',
        total_rows: validation.total_rows,
        valid_rows: validation.valid_rows,
        error_rows: validation.error_rows,
        created_at: new Date().toISOString(),
      };
      mockUploadHistoryStore = [historyEntry, ...mockUploadHistoryStore];

      return mockSuccess({ upload_id: uploadId, status: 'committed', rows_committed: validation.valid_rows });
    }
    return api.post(API_ENDPOINTS.UPLOADS.COMMIT(uploadId));
  },

  async getHistory({ page = 1, pageSize = 20 } = {}) {
    if (env.useMockApi) {
      return mockPaginated(mockUploadHistoryStore, { page, pageSize });
    }
    return api.get(API_ENDPOINTS.UPLOADS.HISTORY, { params: { page, page_size: pageSize } });
  },

  async getErrors(uploadId) {
    if (env.useMockApi) {
      await mockDelay();
      const validation = mockUploadValidations.get(uploadId);
      if (!validation) mockError('File upload not found', { status: 404, code: 'NOT_FOUND' });
      return mockSuccess(validation);
    }
    return api.get(API_ENDPOINTS.UPLOADS.ERRORS(uploadId));
  },
};
