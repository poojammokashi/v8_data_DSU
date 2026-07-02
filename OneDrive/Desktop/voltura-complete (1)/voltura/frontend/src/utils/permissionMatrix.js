import { ROLE_PERMISSIONS } from '@config/constants';

/**
 * Check whether a given role has a specific permission.
 */
export function roleHasPermission(role, permission) {
  if (!role || !permission) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check whether a role has at least one of the given permissions.
 */
export function roleHasAnyPermission(role, permissions = []) {
  if (!permissions.length) return true;
  return permissions.some((p) => roleHasPermission(role, p));
}
