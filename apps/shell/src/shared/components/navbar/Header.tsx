import React, { useState, useEffect } from 'react';
import { Menu, User, LogOut, LockOpen, HelpCircle, ExternalLink, Sparkles } from 'lucide-react';
import { Button, cn, Image, Popover, Select, Tooltip } from '@visitly/ui';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore, type AuthState } from '@visitly/app-store';
import { useLogout } from '../../hooks/useLogout';
import { useSwitchLogin } from '../../hooks/useSwitchLogin';
import { useSidebarPermissions } from './useSidebarPermissions';
import { useSidebarStore } from './useSidebarStore';
import { useQuery } from '@tanstack/react-query';
import { getAllSites } from '../../services/sites.api';
import { useIsMobile } from '../../hooks/useIsMobile';

interface HeaderProps {
    onToggle: () => void;
    isCollapsed: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isCollapsed, onToggle }) => {
    const { switchToAnotherRole, roles } = useSwitchLogin();
    const permissions = useSidebarPermissions();
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const { toggleMobileOpen } = useSidebarStore();
    const isMobile = useIsMobile();

    const [selectedLocation, setSelectedLocation] = useState<string | undefined>(undefined);
    const SESSION_TO_LOCAL_KEYS: string = "__session_backup_keys__";

    const ADMIN_ROLES = [
        'GLOBAL_ORG_ADMIN',
        'GLOBAL_INTERNAL_ADMIN',
        'GLOBAL_SITE_ADMIN',
        'FRONTDESK_ADMIN',
        'DELIVERY_MANAGER',
        'EVAC_MANAGER',
        'SITE_ADMIN'
    ];

    const isAdmin = roles.some(role => ADMIN_ROLES.includes(role));
    const isHost = !isAdmin;

    async function switchToHost() {
        await setToLocalStorageTemporarily();
        window.open("/switch", "_blank");
    }

    function setToLocalStorageTemporarily() {
        const copiedKeys: string[] = [];
        localStorage.setItem('redirectFrom', 'ADMIN');
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (!key) continue;
            const value = sessionStorage.getItem(key);
            if (value !== null) {
                localStorage.setItem(key, value);
                copiedKeys.push(key);
            }
        }
        localStorage.setItem(SESSION_TO_LOCAL_KEYS, JSON.stringify(copiedKeys));
    }

    // Fetch Sites
    const { data: sitesData } = useQuery({
        queryKey: ['sites'],
        queryFn: getAllSites,
        enabled: permissions.isGlobalAdmin,
    });

    const sites = sitesData?.results || [];

    useEffect(() => {
        const storedLocId = sessionStorage.getItem('dId');
        if (storedLocId) {
            setSelectedLocation(storedLocId);
        }
    }, []);

    const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const locId = e.target.value;
        const loc = sites.find((s: any) => s.id === locId);
        if (loc) {
            setSelectedLocation(locId);
            sessionStorage.setItem('lcId', loc.id);
            sessionStorage.setItem('lcnm', loc.name);
            sessionStorage.setItem('dId', loc.id);
            sessionStorage.setItem('flagForMenu', JSON.stringify(true));
            navigate('/admin/work_area/locations/general');
        }
    };

    const handleUpgradePlan = () => {
        navigate('/admin/work_area/settings/upgrade-plan');
    };

    const isTrial = permissions.currentPlan === 'Trial';
    const isExpired = permissions.currentPlan === 'Expired';
    const showUpgrade = (isTrial || isExpired) && permissions.currentPlan !== 'Enterprise' && permissions.isGlobalAdmin;

    return (
        <>
            {/* "New Version" banner - host only */}
            {isHost && (
                <div className="tw:flex tw:items-center tw:gap-3 tw:px-4 tw:py-2 tw:bg-gradient-to-r tw:from-purple-50 tw:to-indigo-50 tw:border-b tw:border-purple-100">
                    <div className="tw:flex tw:items-center tw:gap-2 tw:text-sm">
                        <Sparkles className="tw:w-4 tw:h-4 tw:text-purple-600" />
                        <span className="tw:text-gray-700">New Version Available</span>
                    </div>
                    <span
                        onClick={() => navigate('/host/dashboard')}
                        className="tw:text-sm tw:text-gray-500 tw:border tw:border-gray-300 tw:px-2 tw:rounded-lg tw:cursor-pointer"
                    >
                        Try now
                    </span>
                </div>
            )}

            <header
                className="tw:top-0 tw:z-50 tw:w-full tw:bg-white tw:border-b tw:border-gray-200 tw:h-16 tw:flex! tw:items-center tw:justify-between tw:px-3"
                data-testid="topbar-header"
            >
                {/* ── Left: Logo + Hamburger ── */}
                <div className={cn("tw:flex tw:items-center tw:gap-1" , {'tw:md:gap-10': !isCollapsed })}>


                    {/* Logo – small icon on mobile, full logo on desktop */}
                    <div className={`tw:flex tw:items-center tw:transition-all tw:duration-300 ${!isMobile && isCollapsed ? 'tw:w-16' : 'tw:w-auto'}`}>
                        <div className="tw:flex tw:items-center tw:gap-2 tw:cursor-pointer">
                            {isMobile ? (
                                /* Small icon logo on mobile */
                                <div className="tw:rounded-md tw:flex tw:items-center tw:justify-center tw:ml-1">
                                    <Image src='/assets/images/logoicon.png' alt='logo icon' width={28} height={28} />
                                </div>
                            ) : !isMobile && isCollapsed ? (
                                <div className="tw:rounded-md tw:flex tw:items-center tw:justify-center">
                                    <Image src='/assets/images/logoicon.png' alt='logo icon'  width={52} height={32} />
                                </div>
                            ) : (
                                <span className="tw:text-xl tw:font-bold tw:tracking-tight tw:px-2 tw:py-4">
                                    <Image src='/assets/images/logo.png' alt='logo icon' width={145} height={35} />
                                </span>
                            )}
                        </div>
                    </div>
                    {isMobile ? (
                        /* Mobile hamburger → opens drawer */
                        <Tooltip content="Open menu" placement="bottom">
                            <Button
                                onClick={toggleMobileOpen}
                                variant="ghost"
                                size="sm"
                                className="tw:p-2 tw:rounded-md tw:text-gray-600"
                                aria-label="Open mobile menu"
                                leftIcon={<Menu size={24} />}
                            />
                        </Tooltip>
                    ) : null}
                    {/* Desktop hamburger → collapses sidebar */}
                    {!isMobile && (
                        <Button
                            onClick={onToggle}
                            variant="ghost"
                            size="sm"
                            className="tw:p-2 tw:rounded-md tw:text-gray-600"
                            data-testid="sidebar-toggle"
                            leftIcon={<Menu size={24} />}
                        />
                    )}
                </div>

                {/* ── Right: Actions ── */}
                <div className="tw:flex tw:items-center tw:gap-2">

                    {/* Location Selector – full width on desktop, compact on mobile */}
                    {permissions.isGlobalAdmin && (
                        <Tooltip
                            content={isMobile ? 'Switch location' : undefined}
                            placement="bottom"
                        >
                            <div
                                className={isMobile ? 'tw:w-28' : 'tw:w-60'}
                                data-testid="location-selector-container"
                            >
                                <Select
                                    value={selectedLocation || ''}
                                    onChange={handleLocationChange}
                                    options={[
                                        { value: '', label: isMobile ? 'Location' : 'Choose a location to Edit', disabled: true },
                                        ...sites.map((site: any) => ({ value: site.id, label: site.name }))
                                    ]}
                                    data-testid="location-select-dropdown"
                                    className={`
                                        tw:bg-white tw:border tw:border-gray-200 tw:rounded-md tw:px-2
                                        tw:text-[#5e5e5e] tw:shadow-sm tw:min-h-0 tw:leading-tight
                                        tw:focus:outline-none tw:focus:ring-2 tw:focus:ring-indigo-100 tw:transition-all
                                        ${isMobile ? 'tw:text-xs tw:h-7 tw:py-0!' : 'tw:text-sm tw:h-9 tw:py-1!'}
                                    `}
                                />
                            </div>
                        </Tooltip>
                    )}

                    {/* Upgrade Plan – desktop only */}
                    {!isMobile && showUpgrade && (
                        <Button variant="primary" onClick={handleUpgradePlan} data-testid="upgrade-plan-button">
                            Upgrade Plan
                        </Button>
                    )}

                    {/* Launch My Visitly – full text on desktop, compact text on mobile */}
                    {isAdmin && (
                        isMobile ? (
                            <Tooltip content="Launch My Visitly" placement="bottom">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="tw:rounded-md! tw:text-xs! tw:h-7! tw:px-2! tw:whitespace-nowrap"
                                    onClick={switchToHost}
                                    data-testid="launch-visitly-button"
                                >
                                    Launch
                                </Button>
                            </Tooltip>
                        ) : (
                            <Button variant="outline" className="tw:rounded-lg!" onClick={switchToHost} data-testid="launch-visitly-button">
                                Launch My Visitly
                            </Button>
                        )
                    )}

                    {/* Help Dropdown */}
                    <Popover
                        placement="bottom"
                        contentClassName="tw:right-0 tw:left-auto tw:translate-x-0 tw:mt-4 tw:p-0 tw:rounded-lg tw:w-48"
                        trigger={
                            <Button
                                variant="ghost"
                                size="sm"
                                className="tw:p-2 tw:text-gray-500"
                                data-testid="help-dropdown-toggle"
                                leftIcon={<HelpCircle size={24} />}
                            />
                        }
                        content={
                            <div className="tw:py-1">
                                <a
                                    href="https://help.visitly.io/support/solutions"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-2.5 tw:text-sm tw:text-slate-600 hover:tw:bg-indigo-50 hover:tw:text-indigo-600 tw:no-underline"
                                    data-testid="documentation-link"
                                >
                                    <ExternalLink size={16} /> Documentation
                                </a>
                                <button
                                    className="tw:w-full tw:flex tw:items-center tw:gap-2 tw:px-4 tw:py-2.5 tw:text-sm tw:text-slate-600 hover:tw:bg-indigo-50 hover:tw:text-indigo-600"
                                    onClick={() => { (window as any).FreshworksWidget?.('open'); }}
                                    data-testid="support-link"
                                >
                                    Support
                                </button>
                            </div>
                        }
                    />

                    {/* User Profile */}
                    <Popover
                        placement="bottom"
                        contentClassName="tw:right-0 tw:left-auto tw:translate-x-0 tw:mt-4 tw:p-0 tw:rounded-lg!"
                        trigger={
                            <Button
                                variant="ghost"
                                size="sm"
                                className="tw:w-9 tw:h-9 tw:bg-slate-200! tw:rounded-full! tw:flex! tw:items-center tw:justify-center tw:text-slate-600! hover:tw:ring-4! hover:tw:ring-indigo-50! tw:transition-all tw:p-0!"
                                data-testid="user-profile-toggle"
                            >
                                {user?.avatarUri ? (
                                    <Image
                                        src={user.avatarUri}
                                        alt="user-avatar"
                                        className="tw:w-full tw:h-full tw:rounded-full! tw:object-cover"
                                        wrapperClassName="tw:flex tw:h-full"
                                    />
                                ) : (
                                    <span className="tw:text-xs tw:font-bold">{user?.firstName?.charAt(0)}</span>
                                )}
                            </Button>
                        }
                        content={({ close }) => <UserProfileMenu user={user} close={close} />}
                    />
                </div>
            </header>
        </>
    );
};

const UserProfileMenu: React.FC<Pick<AuthState, "user"> & { close: () => void }> = ({ user, close }) => {
    const { logOut } = useLogout();

    return (
        <div className="tw:w-64">
            {/* Profile Header */}
            <div className="tw:p-4 tw:flex tw:items-center tw:gap-3 tw:border-b tw:border-gray-100">
                <div className="tw:w-12 tw:h-12 tw:bg-slate-200 tw:rounded-lg tw:flex tw:items-center tw:justify-center">
                    {user?.avatarUri ? (
                        <Image src={user?.avatarUri} alt="user-avtar" className="tw:rounded-lg tw:h-full tw:w-full" wrapperClassName="tw:h-full tw:w-full" />
                    ) : (
                        <User size={24} className="tw:text-slate-500" />
                    )}
                </div>
                <div className="tw:flex tw:flex-col tw:overflow-hidden">
                    <span className="tw:text-sm tw:font-bold tw:text-slate-700!">
                        {user?.firstName} {user?.lastName}
                    </span>
                    <span className="tw:text-[11px] tw:text-slate-400! tw:truncate">
                        {user?.email}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="tw:py-1">
                <Link
                    className="tw:w-full tw:flex tw:items-center tw:gap-3 tw:px-4 tw:py-2.5 tw:text-sm tw:text-slate-600! hover:tw:bg-indigo-50 hover:tw:text-indigo-600 tw:no-underline"
                    to={"/admin/work_area/profile"}
                    data-testid="profile-link"
                    onClick={close}
                >
                    <User size={16} /> Profile
                </Link>
                <Link
                    className="tw:w-full tw:flex tw:items-center tw:gap-3 tw:px-4 tw:py-2.5 tw:text-sm tw:text-slate-600! hover:tw:bg-indigo-50! hover:tw:text-indigo-600! tw:no-underline tw:border-b tw:border-gray-200"
                    to={"/admin/work_area/change-password"}
                    data-testid="change-password-link"
                    onClick={close}
                >
                    <LockOpen size={16} /> Change Password
                </Link>
                <Button
                    onClick={logOut}
                    variant="ghost"
                    className="tw:w-full tw:flex tw:items-center tw:gap-3 tw:px-4 tw:py-2.5 tw:text-sm tw:text-red-600 hover:tw:bg-red-50"
                    data-testid="logout-link"
                    leftIcon={<LogOut size={16} />}
                >
                    Logout
                </Button>
            </div>
        </div>
    );
};
