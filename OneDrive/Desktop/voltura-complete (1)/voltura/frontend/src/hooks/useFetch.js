import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Generic async fetch hook used across all pages for consistent
 * loading / error / data / refetch handling without a full query library.
 *
 * @param {Function} fetcher - async function returning data
 * @param {Array} deps - dependency array, refetches when changed
 * @param {Object} options - { enabled, initialData }
 */
export function useFetch(fetcher, deps = [], options = {}) {
  const { enabled = true, initialData = null } = options;
  const [data, setData] = useState(initialData);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const execute = useCallback(async () => {
    if (!enabled) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      setData(result);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps]);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, isLoading, error, refetch: execute, setData };
}
