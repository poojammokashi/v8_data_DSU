import { createContext, useCallback, useContext, useRef, useState } from 'react';

const LoadingContext = createContext(null);

export function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(false);
  const [label, setLabel] = useState('Loading');
  const timerRef = useRef(null);

  const startLoading = useCallback((text = 'Loading') => {
    clearTimeout(timerRef.current);
    setLabel(text);
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback((minDelayMs = 250) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIsLoading(false), minDelayMs);
  }, []);

  return (
    <LoadingContext.Provider value={{ isLoading, label, startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error('useLoading must be used within LoadingProvider');
  return ctx;
}
