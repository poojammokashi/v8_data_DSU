import {
  HiOutlineSquares2X2,
  HiOutlineChartBar,
  HiOutlineDocumentChartBar,
  HiOutlineCloudArrowUp,
  HiOutlineUsers,
  HiOutlineCog6Tooth,
} from 'react-icons/hi2';
import { PERMISSIONS } from './constants';

export const NAV_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: HiOutlineSquares2X2,
    permission: PERMISSIONS.DASHBOARD_VIEW,
  },
  {
    id: 'analytics',
    label: 'Analytics',
    path: '/analytics',
    icon: HiOutlineChartBar,
    permission: PERMISSIONS.ANALYTICS_VIEW,
  },
  {
    id: 'reports',
    label: 'Reports',
    path: '/reports',
    icon: HiOutlineDocumentChartBar,
    permission: PERMISSIONS.REPORTS_VIEW,
  },
  {
    id: 'uploads',
    label: 'Data Upload',
    path: '/uploads',
    icon: HiOutlineCloudArrowUp,
    permission: PERMISSIONS.UPLOADS_VIEW,
  },
  {
    id: 'users',
    label: 'Users',
    path: '/users',
    icon: HiOutlineUsers,
    permission: PERMISSIONS.USERS_VIEW,
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: HiOutlineCog6Tooth,
    permission: PERMISSIONS.SETTINGS_VIEW,
  },
];
