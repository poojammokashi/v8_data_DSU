import { useCallback, useState } from 'react';
import { useFetch } from '@hooks/useFetch';
import { uploadsApi } from '../api/uploadsApi';

/**
 * Drives the two-phase upload flow used by the Data Upload page:
 *   1. validate(file, dataType) — uploads the file, returns a validation
 *      report (rows accepted/rejected) without touching domain tables.
 *   2. commit() — persists the previously-validated rows, using the
 *      upload_id returned from step 1.
 * Tracks its own progress/loading/error/result state so the page component
 * stays declarative.
 */
export function useFileUpload() {
  const [progress, setProgress] = useState(0);
  const [isValidating, setIsValidating] = useState(false);
  const [isCommitting, setIsCommitting] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [error, setError] = useState(null);

  const validate = useCallback(async (file, dataType) => {
    setIsValidating(true);
    setError(null);
    setProgress(0);
    setValidationResult(null);
    try {
      const { data } = await uploadsApi.validate(file, dataType, setProgress);
      setValidationResult(data);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsValidating(false);
    }
  }, []);

  const commit = useCallback(async () => {
    if (!validationResult?.upload_id) {
      throw new Error('No validated upload to commit');
    }
    setIsCommitting(true);
    setError(null);
    try {
      const { data } = await uploadsApi.commit(validationResult.upload_id);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsCommitting(false);
    }
  }, [validationResult]);

  const reset = useCallback(() => {
    setProgress(0);
    setValidationResult(null);
    setError(null);
  }, []);

  return {
    validate,
    commit,
    reset,
    progress,
    isValidating,
    isCommitting,
    validationResult,
    error,
    canCommit: validationResult?.status === 'validated' && validationResult.valid_rows > 0,
  };
}

export function useUploadHistory({ page = 1, pageSize = 20 } = {}) {
  const { data, isLoading, error, refetch } = useFetch(
    () => uploadsApi.getHistory({ page, pageSize }),
    [page, pageSize]
  );

  return {
    history: data?.data || [],
    meta: data?.meta,
    isLoading,
    error,
    refetch,
  };
}
