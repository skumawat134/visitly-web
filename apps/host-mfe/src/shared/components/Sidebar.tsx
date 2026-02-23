import { useState } from 'react';
import { useAuthStore } from '@visitly/app-store';
import { Image } from '@visitly/ui';
import {
  AlertTriangle, BookOpen, ChevronRight, ClipboardList,
  IdCard, LogIn, Package, User, UserCircle, type LucideIcon,
  LayoutDashboard, Users, UserCheck, Truck, MapPin, Settings, X,
  UserRoundPlus
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useSidebarPermissions } from './useSidebarPermissions';
import { useIsMobile } from '@visitly/shared-core';

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
  testid?: string;
  condition?: (context: SidebarContext) => boolean;
}

export interface SidebarContext {
  isDeliveryManagerEntitled: boolean;
  isAdvanceAnalyticsEntitled: boolean;
  isUserGroupEntitled: boolean;
  isBackgroundCheckEntitled: boolean;
  isAdvancedMegaLocationEntitled: boolean;
  currentPlan: string;
}

interface UserAuth {
  permissions: string[];
}

export const SIDEBAR_CONFIG: SidebarItemConfig[] = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/host/dashboard',
    permission: ['HOST'],
  },
  {
    title: 'Visitors',
    permission: ['HOST'],
    testid: 'evac-my-upcoming-visitors-link',
    icon: Users,
    path: '/host/upcoming-visitors',
  },
  {
    title: 'Sign In Log',
    icon: ClipboardList,
    testid: 'evac-my-sign-in-log-link',
    path: '/host/my-sign-in-log',
    permission: ['HOST'],
  },
  {
    title: 'Packages',
    icon: Package,
    path: '/host/my-deliveries',
    testid: 'evac-my-deliveries-link',
    permission: ['HOST'],
    condition: (ctx) => ctx.isDeliveryManagerEntitled,
  },
  {
    title: 'Company Directory',
    icon: BookOpen,
    path: '/host/directory',
    testid: 'evac-company-directory-link',
    permission: ['HOST'],
  },
  {
    title: 'Profile',
    icon: UserCircle,
    path: '/host/profile',
    testid: 'evac-profile-settings-link',
    permission: ['HOST'],
  },

];

interface SidebarItemProps {
  isCollapsed: boolean;
  item: SidebarItemConfig;
  isActive?: boolean;
  permissions: string[];
  context: SidebarContext;
  onNavigate?: () => void;
}

const hasAnyPermission = (
  userRoles: string[],
  allowedRoles?: string[]
): boolean => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  return allowedRoles.some(role => userRoles.includes(role));
};

const SidebarItem: React.FC<SidebarItemProps> = ({ item, context, permissions, isCollapsed, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = item.icon;

  if (!hasAnyPermission(permissions, item.permission)) return null;
  if (item.condition && !item.condition(context)) return null;

  const hasChildren = item.children && item.children.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="tw:relative tw:group">
      <NavLink
        to={item.path || '#'}
        onClick={() => !hasChildren && onNavigate?.()}
        data-testid={item.testid}
        className={({ isActive }) => `
                    tw:flex tw:items-center tw:transition-all tw:duration-200 tw:relative tw:outline-none tw:no-underline
                    ${isCollapsed ? 'tw:justify-center tw:py-4' : 'tw:justify-between tw:px-4 tw:py-3'}
                    ${isActive ? 'tw:bg-indigo-50 tw:text-indigo-700' : 'tw:text-gray-600 hover:tw:bg-indigo-50 hover:tw:text-indigo-700'}
                `}
      >
        {({ isActive }) => (
          <>
            {/* Active indicator bar */}
            {isActive && !isCollapsed && (
              <div className="tw:absolute tw:left-0 tw:top-0 tw:bottom-0 tw:w-1 tw:bg-indigo-600" />
            )}

            <div className="tw:flex tw:items-center tw:gap-3">
              <Icon
                size={isCollapsed ? 24 : 20}
                strokeWidth={2}
                className={`${isActive ? 'tw:text-indigo-600' : 'tw:text-[#5e5e5e] group-hover:tw:text-indigo-600'}`}
              />
              {!isCollapsed && (
                <span className={`tw:text-sm ${isActive ? 'tw:font-semibold' : 'tw:font-medium'}`}>
                  {item.title}
                </span>
              )}
            </div>

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

      {/* Expanded submenu */}
      {!isCollapsed && hasChildren && isOpen && (
        <div className="tw:bg-gray-50/50">
          {item.children?.map((child) => (
            hasAnyPermission(permissions, child.permission) && (
              <NavLink
                key={child.path}
                to={child.path}
                onClick={() => onNavigate?.()}
                className={({ isActive }) => `
                                    tw:block tw:pl-12 tw:pr-4 tw:py-2.5 tw:text-sm tw:transition-colors tw:no-underline
                                    ${isActive ? 'tw:text-indigo-700 tw:font-semibold' : 'tw:text-gray-500 tw:font-medium hover:tw:text-indigo-700'}
                                `}
              >
                {child.title}
              </NavLink>
            )
          ))}
        </div>
      )}

      {/* Collapsed flyout tooltip */}
      {isCollapsed && (
        <div className={`
                    tw:absolute tw:left-full tw:top-1 tw:ml-1 tw:bg-white
                    tw:border tw:border-gray-100 tw:shadow-xl tw:rounded-lg
                    tw:opacity-0 tw:invisible tw:group-hover:opacity-100 tw:group-hover:visible
                    tw:transition-all tw:duration-200 tw:z-50
                    ${hasChildren ? 'tw:w-60' : 'tw:w-max tw:px-6 tw:py-4'}
                `}>
          <div className="tw:py-1">
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
                                        tw:block tw:px-4 tw:py-2.5 tw:text-sm tw:transition-colors tw:no-underline
                                        ${isActive ? 'tw:bg-indigo-50 tw:text-indigo-700 tw:font-semibold' : 'tw:text-gray-600 tw:font-medium hover:tw:bg-indigo-50 hover:tw:text-indigo-700'}
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

// ─────────────────────────────────────────────
// Main Sidebar export – supports mobile drawer
// ─────────────────────────────────────────────
export const Sidebar: React.FC<{
  isCollapsed: boolean;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}> = ({ isCollapsed, isMobileOpen = false, onMobileClose }) => {
  const user = useAuthStore((s) => s.user);
  const permissions = user?.roles?.map((r) => r.role) || [];
  const context = useSidebarPermissions();
  const isMobile = useIsMobile();

  const sidebarContent = (mobile: boolean) => (
    <aside
      className={`
        tw:bg-white tw:border-r tw:border-gray-200
        tw:transition-all tw:duration-300 tw:z-40
        tw:flex tw:flex-col tw:h-full tw:min-h-0 tw:overflow-y-auto
        ${mobile ? 'tw:w-72' : (isCollapsed ? 'tw:w-20' : 'tw:w-64')}
      `}
      id="sidebar"
      data-testid="left-sidebar"
    >
      {/* Mobile close button */}
      {mobile && (
        <div className="tw:flex tw:items-center tw:justify-between tw:px-4 tw:py-3 tw:border-b tw:border-gray-100">
          <Image src='/assets/images/logo.png' alt='logo' width={120} height={30} className="tw:object-contain" />
          <button
            onClick={onMobileClose}
            className="tw:p-1.5 tw:rounded-md hover:tw:bg-gray-100 tw:text-gray-500 tw:cursor-pointer"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
      )}

      <div className="tw:flex tw:flex-col tw:flex-1">
        <nav className="tw:flex-1 tw:py-4">
          {SIDEBAR_CONFIG.map((item) => (
            <SidebarItem
              permissions={permissions}
              key={item.title}
              item={item}
              isCollapsed={mobile ? false : isCollapsed}
              context={context}
              onNavigate={mobile ? onMobileClose : undefined}
            />
          ))}
        </nav>

        {(!isCollapsed || mobile) && (
          <div className="tw:p-4 tw:text-[10px] tw:text-gray-400 tw:font-medium tw:text-center tw:border-t tw:border-gray-50">
            v 1.3.201
          </div>
        )}
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      {!isMobile && (
        <div className="tw:flex tw:h-full">
          {sidebarContent(false)}
        </div>
      )}

      {/* Mobile drawer overlay */}
      {isMobile && isMobileOpen && (
        <div className="tw:fixed tw:inset-0 tw:z-50 tw:flex">
          <div
            className="tw:absolute tw:inset-0 tw:bg-black/40 tw:backdrop-blur-sm"
            onClick={onMobileClose}
            aria-label="Close sidebar"
          />
          <div className="tw:relative tw:flex tw:h-full tw:animate-slide-in-left">
            {sidebarContent(true)}
          </div>
        </div>
      )}
    </>
  );
};