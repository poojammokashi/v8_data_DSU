/**
 * Shared helpers for mock API modules. Every mock function uses these so
 * mock-mode behaves close enough to the real network (latency, pagination
 * shape) that switching VITE_USE_MOCK_API to false is a non-event for
 * any component.
 */

const MOCK_LATENCY_MS = 350;

export function mockDelay(ms = MOCK_LATENCY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Wraps a value in the same { success, data } envelope the real API uses
 * (see backend SuccessResponse schema), after simulating network delay.
 */
export async function mockSuccess(data, { delay = MOCK_LATENCY_MS } = {}) {
  await mockDelay(delay);
  return { success: true, data };
}

/**
 * Wraps a paginated list in the same { success, data, meta } envelope the
 * real API uses (see backend PaginatedResponse / paginate() helper).
 */
export async function mockPaginated(allItems, { page = 1, pageSize = 20, delay = MOCK_LATENCY_MS } = {}) {
  await mockDelay(delay);
  const total = allItems.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const data = allItems.slice(start, start + pageSize);
  return {
    success: true,
    data,
    meta: { page, page_size: pageSize, total, total_pages: totalPages },
  };
}

/**
 * Throws a normalized error matching the shape lib/axios.js produces for
 * real failures, so error-handling code paths behave identically in mock
 * mode (used sparingly — e.g. to simulate "not found" or auth failures).
 */
export function mockError(message, { status = 400, code = 'MOCK_ERROR' } = {}) {
  const error = { status, message, code, details: null };
  throw error;
}

let mockIdCounter = 90000;
export function nextMockId(prefix = 'mock') {
  mockIdCounter += 1;
  return `${prefix}_${mockIdCounter}`;
}
