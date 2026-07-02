import { useState } from 'react';
import { useFetch } from '@hooks/useFetch';
import { reportsApi } from '../api/reportsApi';

export function useReports({ type } = {}) {
  const { data, isLoading, error, refetch } = useFetch(
    () => reportsApi.list({ type }).then((r) => r.data),
    [type]
  );

  return { reports: data || [], isLoading, error, refetch };
}

export function useGenerateReport(onSuccess) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  async function generate({ reportType, dateFrom, dateTo }) {
    setIsGenerating(true);
    setError(null);
    try {
      const { data } = await reportsApi.generate({ reportType, dateFrom, dateTo });
      onSuccess?.(data);
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }

  return { generate, isGenerating, error };
}
