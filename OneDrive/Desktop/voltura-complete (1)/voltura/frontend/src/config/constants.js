export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  ANALYST: 'analyst',
  VIEWER: 'viewer',
};

export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.ADMIN]: 'Admin',
  [ROLES.ANALYST]: 'Analyst',
  [ROLES.VIEWER]: 'Viewer',
};

// Permission matrix — single source of truth for route + nav guarding
export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard:view',
  ANALYTICS_VIEW: 'analytics:view',
  REPORTS_VIEW: 'reports:view',
  REPORTS_GENERATE: 'reports:generate',
  UPLOADS_VIEW: 'uploads:view',
  USERS_VIEW: 'users:view',
  USERS_MANAGE: 'users:manage',
  SETTINGS_VIEW: 'settings:view',
};

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.ADMIN]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_GENERATE,
    PERMISSIONS.UPLOADS_VIEW,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_MANAGE,
    PERMISSIONS.SETTINGS_VIEW,
  ],
  [ROLES.ANALYST]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_GENERATE,
    PERMISSIONS.UPLOADS_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
  ],
  [ROLES.VIEWER]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
  ],
};

export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
};

export const ALERT_SEVERITY = {
  CRITICAL: 'critical',
  WARNING: 'warning',
  INFO: 'info',
};

export const THEME = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};
