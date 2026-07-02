import { BrowserRouter } from 'react-router-dom';
import { useEffect } from 'react';
import AppRoutes from '@routes/AppRoutes';
import ErrorBoundary from '@components/feedback/ErrorBoundary';
import Toaster from '@components/feedback/Toaster';
import { useThemeStore } from '@store/themeStore';
import { AuthProvider } from '@features/auth/context/AuthContext';

export default function App() {
  const initTheme = useThemeStore((state) => state.initTheme);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
