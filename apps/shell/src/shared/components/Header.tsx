import React, { useState } from 'react';
import { Menu, ChevronDown, User, Key, LogOut, LockOpen } from 'lucide-react';
import { Button, Image, Popover } from '@visitly/ui';
import { Link } from 'react-router-dom';
import { useAuthStore, type AuthState } from '@visitly/app-store';

interface HeaderProps {
  onToggle: () => void,
  isCollapsed: boolean,
}

export const Header: React.FC<HeaderProps> = ({ isCollapsed, onToggle }) => {
  const user = useAuthStore((s) => s.user);
  return (
    <header className="tw:fixed tw:top-0 tw:z-50 tw:w-full tw:bg-white tw:border-b tw:border-gray-200 tw:h-16 tw:flex tw:items-center tw:justify-between tw:px-4">
      <div className="tw:flex tw:items-center tw:gap-4">
        {/* Logo Section - Width adjusts based on Sidebar state */}
        <div className={`tw:flex tw:items-center tw:transition-all tw:duration-300 ${isCollapsed ? 'tw:w-12' : 'tw:w-52'}`}>
          <div className="tw:flex tw:items-center tw:gap-2 tw:cursor-pointer">
            {/* The "Visitly" Diamond Logo */}
            {
              isCollapsed && <div className="tw:rounded-md tw:flex tw:items-center tw:justify-center">
                <Image src='/assets/images/logoicon.png' alt='logo icon' />
              </div>
            }

            {/* Logo Text - Hidden when collapsed */}
            {!isCollapsed && (
              <span className="tw:text-xl tw:font-bold tw:tracking-tight tw:px-4 tw:py-4">
                <Image src='/assets/images/logo.png' alt='logo icon' width={145} height={35} />
              </span>
            )}
          </div>
        </div>

        {/* Hamburger Menu - Now positioned close to the logo */}
        <button
          onClick={onToggle}
          className="tw:p-2 tw:rounded-md hover:tw:bg-gray-100 tw:transition-colors tw:text-gray-600 tw:cursor-pointer"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Right Side Actions */}
      <div className="tw:flex tw:items-center tw:gap-4">
        <Popover
          placement="bottom"
          contentClassName="tw:right-0 tw:left-auto tw:translate-x-0 tw:mt-4 tw:p-0 tw:rounded-lg"
          trigger={
            <button className="tw:cursor-pointer tw:w-9 tw:h-9 tw:bg-slate-200 tw:rounded-full tw:flex tw:items-center tw:justify-center tw:text-slate-600 hover:tw:ring-4 hover:tw:ring-indigo-50 tw:transition-all">
              <span className="tw:text-xs tw:font-bold">{user?.firstName?.charAt(0)}</span>
            </button>
          }
          content={<UserProfileMenu user={user} />}
        />
      </div>
    </header>
  );
};
const UserProfileMenu: React.FC<Pick<AuthState, "user">> = ({ user }) => (
  <div className="tw:w-64">
    {/* Profile Header */}
    <div className="tw:p-4 tw:flex tw:items-center tw:gap-3 tw:border-b tw:border-gray-100">
      <div className="tw:w-12 tw:h-12 tw:bg-slate-200 tw:rounded-lg tw:flex tw:items-center tw:justify-center">
        {user?.avatarUri ? <Image src={user?.avatarUri} alt='user-avtar' /> : <User size={24} className="tw:text-slate-500" />
        }
      </div>
      <div className="tw:flex tw:flex-col tw:overflow-hidden">
        <span className="tw:text-sm tw:font-bold tw:text-slate-700">{user?.firstName} <span></span>{user?.lastName}</span>
        <span className="tw:text-[11px] tw:text-slate-400 tw:truncate">{user?.email}</span>
      </div>
    </div>
    {/* Actions */}
    <div className="tw:py-1">
      <Link className="tw:w-full tw:flex tw:items-center tw:gap-3 tw:px-4 tw:py-2.5 tw:text-sm tw:text-slate-600 hover:tw:bg-indigo-50 hover:tw:text-indigo-600" to={"/admin/work_area/change-password"}>
        <User size={16} /> Profile
      </Link>
      <Link className="tw:w-full tw:flex tw:items-center tw:gap-3 tw:px-4 tw:py-2.5 tw:text-sm tw:text-slate-600 hover:tw:bg-indigo-50 hover:tw:text-indigo-600" to={"/admin/work_area/change-password"}>
        <LockOpen size={16} />Change Password
      </Link>
      <hr className="tw:my-1 tw:border-gray-100" />
      <button className="tw:w-full tw:flex tw:items-center tw:gap-3 tw:px-4 tw:py-2.5 tw:text-sm tw:text-red-600 hover:tw:bg-red-50">
        <LogOut size={16} /> Logout
      </button>
    </div>
  </div>
);
