import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@features/auth/hooks/useAuth';
import PageLoader from '@components/feedback/PageLoader';
import { ROUTE_PATHS } from './routePaths';

export default function ProtectedRoute() {
  const { isAuthenticated, isInitializing } = useAuth();
  const location = useLocation();

  // Session restoration (validating a persisted token against /auth/me)
  // is still running — wait rather than redirecting, so a page refresh
  // with a valid token doesn't briefly bounce the user to /login.
  if (isInitializing) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTE_PATHS.LOGIN} state={{ from: location }} replace />;
  }

  return <Outlet />;
}
