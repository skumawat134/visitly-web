import React from 'react';
import { Menu, User, LogOut } from 'lucide-react';
import { Button, Image, Popover, Tooltip } from '@visitly/ui';
import { useAuthStore, type AuthState } from '@visitly/app-store';
import { useLogout } from '../hooks/useLogout';
import { useSwitchLogin } from '../hooks/useSwitchLogin';
import { useIsMobile } from '@visitly/shared-core';

interface HeaderProps {
  onToggle: () => void;
  isCollapsed: boolean;
  onMobileMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isCollapsed, onToggle, onMobileMenuToggle }) => {
  const { switchToAnotherRole, roles } = useSwitchLogin();
  const isMobile = useIsMobile();

  const ADMIN_ROLES = [
    'GLOBAL_ORG_ADMIN', 'GLOBAL_INTERNAL_ADMIN', 'GLOBAL_SITE_ADMIN',
    'FRONTDESK_ADMIN', 'DELIVERY_MANAGER', 'EVAC_MANAGER', 'SITE_ADMIN'
  ];

  const isAdmin = roles.some(role => ADMIN_ROLES.includes(role));
  const user = useAuthStore((s) => s.user);

  return (
    <header className="tw:w-full tw:bg-white tw:border-b tw:border-gray-200 tw:h-16 tw:flex tw:items-center tw:justify-between tw:px-3 tw:z-40">

      {/* ── Left: Logo → Hamburger ── */}
      <div className="tw:flex tw:items-center tw:gap-2">

        {/* Logo — state-driven sizing */}
        {isMobile ? (
          <Image
            src="/assets/images/logoicon.png"
            alt="Visitly"
            width={28}
            height={28}
            className="tw:object-contain tw:w-7 tw:h-7"
          />
        ) : isCollapsed ? (
          <div className="tw:w-[52px] tw:flex tw:justify-center">
            <Image
              src="/assets/images/logoicon.png"
              alt="Visitly"
              width={32}
              height={32}
              className="tw:object-contain"
            />
          </div>
        ) : (
          <div className="tw:w-[160px] tw:flex tw:items-center tw:pl-2">
            <Image
              src="/assets/images/logo.png"
              alt="Visitly"
              height={32}
              className="tw:h-8 tw:object-contain"
            />
          </div>
        )}

        {/* Hamburger — mobile opens drawer, desktop collapses sidebar */}
        {isMobile ? (
          <Tooltip content="Open menu" placement="bottom">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMobileMenuToggle}
              aria-label="Open mobile menu"
              leftIcon={<Menu size={22} />}
              className="tw:text-gray-500"
            />
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            aria-label="Toggle sidebar"
            data-testid="sidebar-toggle"
            leftIcon={<Menu size={22} />}
            className="tw:text-gray-500"
          />
        )}
      </div>

      {/* ── Right: Actions ── */}
      <div className="tw:flex tw:items-center tw:gap-2">
        {isAdmin && (
          isMobile ? (
            <Tooltip content="Return to Admin" placement="bottom">
              <Button
                variant="outline"
                size="sm"
                onClick={switchToAnotherRole}
                className="tw:h-7 tw:text-xs tw:px-2 tw:whitespace-nowrap"
              >
                Admin
              </Button>
            </Tooltip>
          ) : (
            <Button
              variant="outline"
              size="md"
              onClick={switchToAnotherRole}
            >
              Return to Admin
            </Button>
          )
        )}

        {/* User avatar dropdown */}
        <Popover
          placement="bottom"
          contentClassName="tw:right-0 tw:left-auto tw:translate-x-0 tw:mt-4 tw:p-0 tw:rounded-lg"
          trigger={
            <button className="tw:cursor-pointer tw:w-9 tw:h-9 tw:bg-slate-200 tw:rounded-full tw:flex tw:items-center tw:justify-center tw:text-slate-600 hover:tw:ring-4 hover:tw:ring-indigo-50 tw:transition-all tw:flex-shrink-0">
              {user?.avatarUri ? (
                <Image
                  src={user.avatarUri}
                  alt="avatar"
                  className="tw:w-full tw:h-full tw:rounded-full tw:object-cover"
                />
              ) : (
                <span className="tw:text-xs tw:font-bold tw:select-none">
                  {user?.firstName?.charAt(0)}
                </span>
              )}
            </button>
          }
          content={<UserProfileMenu user={user} />}
        />
      </div>
    </header>
  );
};

const UserProfileMenu: React.FC<Pick<AuthState, "user">> = ({ user }) => {
  const { logOut } = useLogout();

  return (
    <div className="tw:w-64">
      {/* Profile info */}
      <div className="tw:p-4 tw:flex tw:items-center tw:gap-3 tw:border-b tw:border-gray-100">
        <div className="tw:w-12 tw:h-12 tw:bg-slate-200 tw:rounded-lg tw:flex tw:items-center tw:justify-center tw:flex-shrink-0">
          {user?.avatarUri ? (
            <Image
              src={user.avatarUri}
              alt="avatar"
              className="tw:rounded-lg tw:h-full tw:w-full tw:object-cover"
            />
          ) : (
            <User size={24} className="tw:text-slate-500" />
          )}
        </div>
        <div className="tw:flex tw:flex-col tw:overflow-hidden">
          <span className="tw:text-sm tw:font-bold tw:text-slate-700 tw:leading-5">
            {user?.firstName} {user?.lastName}
          </span>
          <span className="tw:text-[11px] tw:text-slate-400 tw:truncate">
            {user?.email}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="tw:py-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={logOut}
          leftIcon={<LogOut size={16} />}
          className="tw:w-full tw:justify-start tw:text-red-600 tw:font-medium hover:tw:bg-red-50 tw:px-4 tw:py-2.5 tw:rounded-none"
        >
          Logout
        </Button>
      </div>
    </div>
  );
};
