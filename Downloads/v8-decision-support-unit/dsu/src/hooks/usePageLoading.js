import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useLoading } from '../context/LoadingContext.jsx';

export function usePageLoading(label = 'Loading page') {
  const location = useLocation();
  const { startLoading, stopLoading } = useLoading();
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    startLoading(label);
    const t = setTimeout(() => stopLoading(150), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);
}
