import { useAuthStore } from '@store/authStore';
import {
	roleHasPermission,
	roleHasAnyPermission,
} from '@utils/permissionMatrix';

export function usePermissions() {
	// const role = useAuthStore((state) => state.user?.role);
	const role = useAuthStore((state) => state.user?.role?.name);

	return {
		role,
		can: (permission) => roleHasPermission(role, permission),
		canAny: (permissions) => roleHasAnyPermission(role, permissions),
	};
}
