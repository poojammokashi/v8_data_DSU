/**
 * Maps the backend's 422 validation error shape onto React Hook Form.
 *
 * Backend error.details (see backend/app/middleware/error_handler_middleware.py):
 *   [{ field: "body.email", message: "value is not a valid email address" }, ...]
 *
 * RHF field names don't have the "body." prefix, so it's stripped. Fields
 * that don't match a known form field still surface — via the returned
 * `unmatched` array — so callers can show them as a general form error
 * instead of silently dropping them.
 *
 * Usage:
 *   try {
 *     await someApiCall(values);
 *   } catch (err) {
 *     const { unmatched } = applyServerErrors(err, setError, ['email', 'password']);
 *     if (unmatched.length) toast.error(err.message);
 *   }
 */
export function applyServerErrors(error, setError, knownFields = []) {
  const details = error?.details;
  const unmatched = [];

  if (!Array.isArray(details) || details.length === 0) {
    return { matched: [], unmatched: [] };
  }

  const matched = [];

  for (const detail of details) {
    const rawField = detail.field || '';
    const fieldName = rawField.replace(/^body\./, '').replace(/^query\./, '');

    if (knownFields.length === 0 || knownFields.includes(fieldName)) {
      setError(fieldName, { type: 'server', message: detail.message });
      matched.push(fieldName);
    } else {
      unmatched.push(detail);
    }
  }

  return { matched, unmatched };
}
