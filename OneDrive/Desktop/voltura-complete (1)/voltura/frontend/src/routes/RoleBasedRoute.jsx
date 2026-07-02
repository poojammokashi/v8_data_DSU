import { Navigate, Outlet } from 'react-router-dom';
import { usePermissions } from '@hooks/usePermissions';
import { ROUTE_PATHS } from './routePaths';

/**
 * Wrap nested routes with a required permission.
 * Usage: <Route element={<RoleBasedRoute permission={PERMISSIONS.USERS_VIEW} />}>
 */
export default function RoleBasedRoute({ permission, anyOf }) {
  const { can, canAny } = usePermissions();

  const allowed = anyOf ? canAny(anyOf) : permission ? can(permission) : true;

  if (!allowed) {
    return <Navigate to={ROUTE_PATHS.FORBIDDEN} replace />;
  }

  return <Outlet />;
}
