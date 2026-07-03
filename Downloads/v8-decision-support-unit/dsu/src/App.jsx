import { Routes, Route } from 'react-router-dom';
import { AlertTriangle, RotateCw } from 'lucide-react';
import { MainLayout } from './layouts/MainLayout.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { SheetPage } from './pages/SheetPage.jsx';
import { NotFound } from './pages/NotFound.jsx';
import { FullScreenSpinner } from './components/Spinner/Spinner.jsx';
import { useData } from './context/DataContext.jsx';

export default function App() {
  const { status, error, reload } = useData();

  if (status === 'loading') {
    return <FullScreenSpinner label="Reading v8_Master_Data.xlsx…" />;
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-light dark:bg-surface-dark px-4 text-center">
        <AlertTriangle className="h-10 w-10 text-status-critical" />
        <div>
          <p className="text-base font-semibold text-ink-light dark:text-ink-dark">Couldn't load the workbook</p>
          <p className="mt-1 text-sm text-muted-light dark:text-muted-dark">{error}</p>
        </div>
        <button type="button" onClick={reload} className="btn-primary">
          <RotateCw className="h-4 w-4" />
          Try again
        </button>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="/module/:route" element={<SheetPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
