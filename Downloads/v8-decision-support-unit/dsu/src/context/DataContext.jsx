import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { loadWorkbook } from '../services/excelService.js';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState(null);
  const [workbook, setWorkbook] = useState(null);

  const fetchData = useCallback(async () => {
    setStatus('loading');
    setError(null);
    try {
      const data = await loadWorkbook();
      setWorkbook(data);
      setStatus('ready');
    } catch (err) {
      setError(err.message || 'Failed to load workbook');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <DataContext.Provider value={{ status, error, workbook, reload: fetchData }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}

export function useSheet(sheetKey) {
  const { workbook, status, error } = useData();
  const sheet = workbook?.bySheet?.[sheetKey] || null;
  return { sheet, status, error };
}
