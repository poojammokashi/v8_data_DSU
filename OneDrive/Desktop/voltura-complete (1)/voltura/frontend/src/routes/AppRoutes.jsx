import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthLayout from '@layouts/AuthLayout';
import DashboardLayout from '@layouts/DashboardLayout';
import ProtectedRoute from './ProtectedRoute';
import RoleBasedRoute from './RoleBasedRoute';
import PageLoader from '@components/feedback/PageLoader';
import { PERMISSIONS } from '@config/constants';
import { ROUTE_PATHS } from './routePaths';

// Lazy-loaded pages — each route is its own chunk (code splitting requirement)
const LoginPage = lazy(() => import('@pages/auth/LoginPage'));
const ForgotPasswordPage = lazy(() => import('@pages/auth/ForgotPasswordPage'));

const DashboardOverviewPage = lazy(() => import('@pages/dashboard/DashboardOverviewPage'));
const AnalyticsPage = lazy(() => import('@pages/analytics/AnalyticsPage'));
const ReportsPage = lazy(() => import('@pages/reports/ReportsPage'));
const DataUploadPage = lazy(() => import('@pages/uploads/DataUploadPage'));
const UsersPage = lazy(() => import('@pages/users/UsersPage'));
const ProfilePage = lazy(() => import('@pages/profile/ProfilePage'));
const NotificationsPage = lazy(() => import('@pages/notifications/NotificationsPage'));
const SettingsPage = lazy(() => import('@pages/settings/SettingsPage'));

const NotFoundPage = lazy(() => import('@pages/errors/NotFoundPage'));
const ForbiddenPage = lazy(() => import('@pages/errors/ForbiddenPage'));
const ServerErrorPage = lazy(() => import('@pages/errors/ServerErrorPage'));

function withSuspense(Component) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public auth routes */}
      <Route element={<AuthLayout />}>
        <Route path={ROUTE_PATHS.LOGIN} element={withSuspense(LoginPage)} />
        <Route path={ROUTE_PATHS.FORGOT_PASSWORD} element={withSuspense(ForgotPasswordPage)} />
      </Route>

      {/* Authenticated app */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route
            element={<RoleBasedRoute permission={PERMISSIONS.DASHBOARD_VIEW} />}
          >
            <Route path={ROUTE_PATHS.DASHBOARD} element={withSuspense(DashboardOverviewPage)} />
          </Route>

          <Route element={<RoleBasedRoute permission={PERMISSIONS.ANALYTICS_VIEW} />}>
            <Route path={ROUTE_PATHS.ANALYTICS} element={withSuspense(AnalyticsPage)} />
          </Route>

          <Route element={<RoleBasedRoute permission={PERMISSIONS.REPORTS_VIEW} />}>
            <Route path={ROUTE_PATHS.REPORTS} element={withSuspense(ReportsPage)} />
          </Route>

          <Route element={<RoleBasedRoute permission={PERMISSIONS.UPLOADS_VIEW} />}>
            <Route path={ROUTE_PATHS.UPLOADS} element={withSuspense(DataUploadPage)} />
          </Route>

          <Route element={<RoleBasedRoute permission={PERMISSIONS.USERS_VIEW} />}>
            <Route path={ROUTE_PATHS.USERS} element={withSuspense(UsersPage)} />
          </Route>

          <Route element={<RoleBasedRoute permission={PERMISSIONS.SETTINGS_VIEW} />}>
            <Route path={ROUTE_PATHS.SETTINGS} element={withSuspense(SettingsPage)} />
          </Route>

          {/* No specific permission required beyond being authenticated */}
          <Route path={ROUTE_PATHS.PROFILE} element={withSuspense(ProfilePage)} />
          <Route path={ROUTE_PATHS.NOTIFICATIONS} element={withSuspense(NotificationsPage)} />

          <Route path={ROUTE_PATHS.FORBIDDEN} element={withSuspense(ForbiddenPage)} />
          <Route path="/500" element={withSuspense(ServerErrorPage)} />
        </Route>
      </Route>

      {/* Default redirects */}
      <Route path="/" element={<Navigate to={ROUTE_PATHS.DASHBOARD} replace />} />
      <Route path="*" element={withSuspense(NotFoundPage)} />
    </Routes>
  );
}
