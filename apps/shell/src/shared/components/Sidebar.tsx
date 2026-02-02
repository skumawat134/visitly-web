import { useAuthStore } from '@visitly/app-store';
import { AlertTriangle, ChevronRight, IdCard, LogIn, type LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Truck,
  MapPin,
  Settings
} from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

export interface SidebarChildItem {
  title: string;
  path: string;
  permission: string[];
}

export interface SidebarItemConfig {
  title: string;
  icon: LucideIcon;
  permission: string[];
  path?: string;
  children?: SidebarChildItem[];
}

interface UserAuth {
  permissions: string[];
}



export const SIDEBAR_CONFIG = [
  // {
  //   title: 'Dashboard',
  //   icon: LayoutDashboard,
  //   path: '/dashboard',
  //   permission: 'view_dashboard'
  // },
  {
    title: 'My Upcoming Visitors',
    permission: ['GLOBAL_ORG_ADMIN', 'GLOBAL_INTERNAL_ADMIN', 'HOST', 'EVAC_MANAGER'],
    "testid": "evac-my-upcoming-visitors-link",
    icon: LayoutDashboard,
    path: '/host/work_area/evacuation/upcoming-visitors',
  },
  {
    title: 'My Visitors',
    icon: Users,
    testid: "evac-my-visitors-link",
    path: '/host/work_area/evacuation/past-visitors',
    permission: ['GLOBAL_ORG_ADMIN', 'GLOBAL_INTERNAL_ADMIN', 'HOST', 'EVAC_MANAGER'],
  },
  {
    title: 'My Sign In Log',
    icon: LogIn,
    testid: "evac-my-sign-in-log-link",
    path: '/host/work_area/evacuation/my-sign-in-log',
    permission: ['GLOBAL_ORG_ADMIN', 'GLOBAL_INTERNAL_ADMIN', 'HOST', 'EVAC_MANAGER'],
  },
  {
    title: 'My Deliveries',
    icon: Truck,
    path: '/host/work_area/evacuation/my-deliveries',
    testid: "evac-my-deliveries-link",
    permission: ['GLOBAL_ORG_ADMIN', 'GLOBAL_INTERNAL_ADMIN', 'HOST', 'EVAC_MANAGER'],
  },
  {
    title: 'Company Directory',
    icon: IdCard,
    path: '/host/work_area/evacuation/directory',
    testid: "evac-company-directory-link",
    permission: ['GLOBAL_ORG_ADMIN', 'GLOBAL_INTERNAL_ADMIN', 'HOST', 'EVAC_MANAGER'],
  },
  {
    title: 'Evacuation & Emergency',
    icon: AlertTriangle,
    path: '/host/work_area/evacuation/main',
    testid: 'evac-evacuation-link',
    permission: [ 'EVAC_MANAGER']
  }

];


interface SidebarItemProps {
  isCollapsed: boolean;
  item: SidebarItemConfig;
  isActive?: boolean;
  permissions: string[];
}

const hasAnyPermission = (
  userRoles: string[],
  allowedRoles?: string[]
): boolean => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  return allowedRoles.some(role => userRoles.includes(role));
};


const SidebarItem: React.FC<SidebarItemProps> = ({ item, permissions, isCollapsed }) => {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = item.icon;

  if (!hasAnyPermission(permissions, item.permission)) return null;
  const hasChildren = item.children && item.children.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="tw:relative tw:group">
      {/* 1. MAIN NAVIGATION ITEM
          Using NavLink's callback to handle dynamic classes for the indicator and background 
      */}
      <NavLink
        to={item.path || "#"}
        className={({ isActive }) => `
          tw:flex tw:items-center tw:transition-all tw:duration-200 tw:relative tw:outline-none
          ${isCollapsed ? 'tw:justify-center tw:py-4' : 'tw:justify-between tw:px-4 tw:py-3'}
          ${isActive ? 'tw:bg-indigo-50 tw:text-indigo-700' : 'tw:text-gray-600 hover:tw:bg-gray-50'}
        `}
      >
        {({ isActive }) => (
          <>
            {/* Active Indicator Bar: Left-most purple stripe */}
            {isActive && (
              <div className="tw:absolute tw:left-0 tw:top-0 tw:bottom-0 tw:w-1 tw:bg-indigo-600" />
            )}

            <div className="tw:flex tw:items-center tw:gap-3">
              <Icon
                size={isCollapsed ? 24 : 20}
                strokeWidth={2}
                /* Use dynamic color if active, otherwise fallback to the gray */
                className={`${isActive ? 'tw:text-indigo-600' : 'tw:text-[#5e5e5e] group-hover:tw:text-indigo-600'}`}
              />
              {!isCollapsed && <span className="tw:text-sm tw:font-medium">{item.title}</span>}
            </div>

            {/* Separate Arrow Toggle */}
            {!isCollapsed && hasChildren && (
              <button
                onClick={handleToggle}
                className="tw:p-1 tw:rounded hover:tw:bg-gray-200/50 tw:transition-colors"
              >
                <ChevronRight
                  size={14}
                  className={`tw:transition-transform tw:duration-200 ${isOpen ? 'tw:rotate-90' : ''}`}
                />
              </button>
            )}
          </>
        )}
      </NavLink>

      {/* 2. EXPANDED ACCORDION VIEW: Sub-links indented */}
      {!isCollapsed && hasChildren && isOpen && (
        <div className="tw:bg-gray-50/50">
          {item.children?.map((child) => (
            hasAnyPermission(permissions, child.permission) && (
              <NavLink
                key={child.path}
                to={child.path}
                className={({ isActive }) => `
                  tw:block tw:pl-12 tw:pr-4 tw:py-2.5 tw:text-sm tw:transition-colors
                  ${isActive ? 'tw:text-indigo-700 tw:font-semibold' : 'tw:text-gray-500 hover:tw:text-indigo-700'}
                `}
              >
                {child.title}
              </NavLink>
            )
          ))}
        </div>
      )}

      {/* 3. COLLAPSED HOVER FLYOUT: Dual-style tooltip */}
      {isCollapsed && (
        <div className={`
          tw:absolute tw:left-full tw:top-1 tw:ml-1 tw:bg-white 
          tw:border tw:border-gray-100 tw:shadow-xl tw:rounded-lg 
          tw:opacity-0 tw:invisible tw:group-hover:opacity-100 tw:group-hover:visible 
          tw:transition-all tw:duration-200 tw:z-50
          ${hasChildren ? 'tw:w-60' : 'tw:w-max tw:px-6 tw:py-4'}
        `}>
          <div className="tw:py-1">
            {/* Tooltip Title: Indigo for single, Gray for menus */}
            <div className={`tw:text-[11px] tw:font-bold tw:uppercase tw:tracking-widest 
              ${hasChildren ? 'tw:text-gray-400 tw:px-4 tw:py-2 tw:border-b tw:border-gray-50 tw:mb-1' : 'tw:text-indigo-600'}`}>
              {item.title}
            </div>

            {hasChildren && item.children?.map((child) => (
              hasAnyPermission(permissions, child.permission) && (
                <NavLink
                  key={child.path}
                  to={child.path}
                  className={({ isActive }) => `
                    tw:block tw:px-4 tw:py-2.5 tw:text-sm tw:transition-colors
                    ${isActive ? 'tw:bg-indigo-50 tw:text-indigo-700' : 'tw:text-gray-600 hover:tw:bg-indigo-50 hover:tw:text-indigo-700'}
                  `}
                >
                  {child.title}
                </NavLink>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC<{ isCollapsed: boolean }> = ({ isCollapsed }) => {
  const user = useAuthStore((s) => s.user);
  const permissions = user?.roles?.map((r) => r.role) || [];
  return (
    <aside className={`
      tw:fixed tw:left-0 tw:top-16 tw:h-[calc(100vh-64px)] tw:bg-white tw:border-r tw:border-gray-200 
      tw:transition-all tw:duration-300 tw:z-40 tw:overflow-y-visible
      ${isCollapsed ? 'tw:w-20' : 'tw:w-64'}
    `} id='sidebar' data-testid="left-sidebar">
      <div className="tw:flex tw:flex-col tw:h-full">
        <nav className="tw:flex-1 tw:py-4">
          {SIDEBAR_CONFIG.map((item) => (
            <SidebarItem
              permissions={permissions}
              key={item.title}
              item={item}
              isCollapsed={isCollapsed}
              isActive={item.title === 'Visitor Log'} // Testing active state
            />
          ))}
        </nav>

        {/* Version info at bottom as seen in image */}
        {!isCollapsed && (
          <div className="tw:p-4 tw:text-[10px] tw:border-t tw:border-gray-50">
            v 1.3.201 (e849028)
          </div>
        )}
      </div>
    </aside>
  );
};