import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useSidebarStore } from './useSidebarStore';
import { useSidebarPermissions } from './useSidebarPermissions';
import {
    MAIN_MENU,
    LOCATION_MENU,
    EVAC_HOST_MENU,
    DELIVERY_MANAGER_MENU,
    type SidebarItem,
    type SidebarContext
} from './SidebarConfig';
import './Sidebar.css';
import { useIsMobile } from '../../hooks/useIsMobile';

const SidebarItemComponent: React.FC<{
    item: SidebarItem;
    context: SidebarContext;
    isCollapsed: boolean;
    onAction?: (action: string) => void;
    onNavigate?: () => void;
}> = ({ item, context, isCollapsed, onAction, onNavigate }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const itemRef = React.useRef<HTMLDivElement>(null);
    const Icon = item.icon;
    const location = useLocation();
    // Condition check
    if (item.condition && !item.condition(context)) return null;

    const hasChildren = item.children && item.children.length > 0;

    const handleClick = (e: React.MouseEvent) => {
        if (item.action && onAction) {
            e.preventDefault();
            onAction(item.action);
            onNavigate?.();
        } else if (hasChildren) {
            e.preventDefault();
            setIsOpen(!isOpen);
        } else {
            onNavigate?.();
        }
    };

    const handleMouseEnter = () => {
        if (isCollapsed && itemRef.current) {
            const rect = itemRef.current.getBoundingClientRect();
            setTooltipPosition({
                top: rect.top,
                left: rect.right + 4
            });
            setIsHovered(true);
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    // Custom active check
    const isItemActive = (reactActive: boolean, path?: string) => {
        if (item.isActive && item.isActive(location.pathname)) return true;
        if (path && path !== '#' && location.pathname.startsWith(path)) return true;

        const isAnyChildActive = (children?: SidebarItem[]): boolean => {
            if (!children) return false;
            return children.some(child => {
                if (child.isActive && child.isActive(location.pathname)) return true;
                if (child.path && child.path !== '#' && location.pathname.startsWith(child.path)) return true;
                if (child.children) return isAnyChildActive(child.children);
                return false;
            });
        }

        if (isAnyChildActive(item.children)) return true;

        return false;
    };

    const linkClass = ({ isActive }: { isActive: boolean }) => {
        const active = isItemActive(isActive, item.path);
        return `
    tw:flex tw:items-center tw:transition-all tw:duration-200 tw:relative tw:outline-none tw:no-underline tw:group
    ${isCollapsed ? 'tw:justify-center tw:py-4' : 'tw:justify-between tw:px-4 tw:py-3'}
    ${active && !item.action ? 'tw:bg-indigo-50! tw:text-indigo-700!' : 'tw:text-gray-600! tw:hover:bg-indigo-50! tw:hover:text-indigo-700!'}
  `};

    return (
        <div ref={itemRef} className="tw:relative tw:group" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <NavLink
                to={item.path || '#'}
                onClick={handleClick}
                className={linkClass}
                data-testid={item.testid}
            >
                {({ isActive }) => {
                    const active = isItemActive(isActive, item.path);
                    return (
                        <>
                            {active && !item.action && !isCollapsed && (
                                <div className="tw:absolute tw:left-0 tw:top-0 tw:bottom-0 tw:w-1 tw:bg-indigo-600" />
                            )}
                            <div className="tw:flex tw:items-center tw:gap-3 tw:group">
                                {Icon && (
                                    <Icon
                                        size={isCollapsed ? 24 : 20}
                                        strokeWidth={2}
                                        className={`${active && !item.action ? 'tw:text-indigo-600!' : 'tw:text-[#5e5e5e]! group-hover:tw:text-indigo-600!'} tw:group-hover:bg-indigo-50! tw:group-hover:text-indigo-700!`}
                                    />
                                )}
                                {!isCollapsed && <span className="tw:text-sm tw:font-medium">{item.title}</span>}
                            </div>

                            {!isCollapsed && hasChildren && (
                                <ChevronRight
                                    size={14}
                                    className={`tw:transition-transform tw:duration-200 ${isOpen ? 'tw:rotate-90' : ''}`}
                                />
                            )}
                        </>
                    )
                }}
            </NavLink>

            {/* Submenu */}
            {!isCollapsed && hasChildren && isOpen && (
                <div className="tw:bg-gray-50/50">
                    {item.children
                        ?.filter(child => !child.condition || child.condition(context))
                        .map(child => (
                            <NavLink
                                key={child.title}
                                to={child.path || '#'}
                                onClick={() => onNavigate?.()}
                                className={({ isActive }) => {
                                    const active = isActive ||
                                        (child.isActive && child.isActive(location.pathname)) ||
                                        (child.path && child.path !== '#' && location.pathname.startsWith(child.path));

                                    return `
                  tw:block tw:pl-12 tw:pr-4 tw:py-2.5 tw:text-sm tw:transition-colors tw:no-underline
                  ${active ? 'tw:text-indigo-700! tw:font-semibold' : 'tw:text-gray-500! hover:tw:text-indigo-700!'}
                  tw:hover:bg-indigo-50! tw:hover:text-indigo-700!
                `}}
                                data-testid={child.testid}
                            >
                                {child.title}
                            </NavLink>
                        ))}
                </div>
            )}

            {/* Collapsed Tooltip - Using Portals to escape stacking context */}
            {(isCollapsed && isHovered && createPortal(
                <div
                    className={`
                        tw:fixed tw:border tw:border-gray-100 tw:shadow-xl tw:rounded-lg 
                        tw:z-[9999] tw:transition-opacity tw:duration-200
                        ${hasChildren ? 'tw:w-60 tw:bg-white' : 'tw:w-max tw:px-6 tw:py-3 tw:bg-[#E5E9FF]!'}
                    `}
                    style={{
                        top: `${tooltipPosition.top}px`,
                        left: `${tooltipPosition.left}px`,
                        pointerEvents: 'auto'
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div className="tw:py-1">
                        <div className={`tw:text-[11px] tw:font-bold tw:uppercase tw:tracking-widest  
                            ${hasChildren ? 'tw:text-indigo-600! tw:px-4 tw:py-3 tw:border-b tw:border-gray-50 tw:mb-1 tw:bg-[#E5E9FF]!' : 'tw:text-indigo-600!'}`}>
                            {item.title}
                        </div>
                        {hasChildren && item.children?.map((child) => (
                            (!child.condition || child.condition(context)) && (
                                <NavLink
                                    key={child.title}
                                    to={child.path || '#'}
                                    onClick={() => onNavigate?.()}
                                    className={({ isActive }) => {
                                        const active = isActive ||
                                            (child.isActive && child.isActive(location.pathname)) ||
                                            (child.path && child.path !== '#' && location.pathname.startsWith(child.path));

                                        return `
                                            tw:block tw:px-4 tw:py-2.5 tw:text-sm tw:transition-colors tw:no-underline
                                            ${active ? 'tw:bg-indigo-50! tw:text-indigo-700!' : 'tw:text-gray-600! hover:tw:bg-indigo-50! hover:tw:text-indigo-700!'}
                                            tw:hover:bg-indigo-50! tw:hover:text-indigo-700!
                                        `
                                    }}
                                >
                                    {child.title}
                                </NavLink>
                            )
                        ))}
                    </div>
                </div>,
                document.body
            ) as any)}
        </div>
    );
};

export const Sidebar: React.FC = () => {
    const { isCollapsed, isLocationMode, setLocationMode, isMobileOpen, setMobileOpen } = useSidebarStore();
    const context = useSidebarPermissions();
    const navigate = useNavigate();
    const isMobile = useIsMobile();

    useEffect(() => {
        const handler = (event: any) => {
            const path = event.detail.pathname;
            const match = path.match(
                /^\/admin\/work_area\/locations(\/(?!list$).*)?$/
            );
            if (match) {
                setLocationMode(true);
            }
        };
        window.addEventListener('angular:navigation', handler);
        return () => {
            window.removeEventListener('angular:navigation', handler);
        };
    }, []);

    const handleAction = (action: string) => {
        if (action === 'BACK_TO_LOCATIONS') {
            setLocationMode(false);
            navigate('/admin/work_area/locations/list');
            window.dispatchEvent(
                new CustomEvent('host:navigation', {
                    detail: { pathname: '/admin/work_area/locations/list' },
                })
            );
        }
    };

    const getMenuItems = () => {
        if (isLocationMode && (context.isGlobalAdmin || context.isFrontDeskManager)) {
            return LOCATION_MENU;
        }
        if (!isLocationMode && (context.isGlobalAdmin || context.isFrontDeskManager)) {
            return MAIN_MENU;
        }
        if (!context.isGlobalAdmin && context.isDeliveryManager) {
            return DELIVERY_MANAGER_MENU;
        }
        if (!context.isGlobalAdmin && context.isEvacManager) {
            return EVAC_HOST_MENU;
        }
        if (context.isHost) {
            return EVAC_HOST_MENU;
        }
        return MAIN_MENU;
    };

    const menuItems = getMenuItems();

    const sidebarContent = (isMobile: boolean) => (
        <aside
            className={`
                tw:bg-white tw:border-r tw:border-gray-200
                tw:transition-all tw:duration-300 tw:z-40
                tw:flex tw:flex-col tw:h-full tw:min-h-0 tw:overflow-y-auto tw:flex-shrink-0 custom-scrollbar
                ${isMobile ? 'tw:w-72' : (isCollapsed ? 'tw:w-20' : 'tw:w-64')}
            `}
            data-testid="left-sidebar"
        >
            <nav className="tw:flex-1 tw:py-4 tw:overflow-x-hidden tw:min-h-0">
                {menuItems.map((item, index) => (
                    <SidebarItemComponent
                        key={index}
                        item={item}
                        context={context}
                        isCollapsed={isMobile ? false : isCollapsed}
                        onAction={handleAction}
                        onNavigate={isMobile ? () => setMobileOpen(false) : undefined}
                    />
                ))}
            </nav>
            {(!isCollapsed || isMobile) && (
                <div className="tw:p-4 tw:space-y-4 tw:border-t tw:border-gray-50">
                    <div className="tw:text-[10px] tw:text-gray-400 tw:text-center tw:font-medium">
                        v 1.3.201
                    </div>
                </div>
            )}
        </aside>
    );

    return (
        <>
            {/* Desktop sidebar – only rendered in flow when not mobile */}
            {!isMobile && (
                <div className="tw:flex tw:h-full">
                    {sidebarContent(false)}
                </div>
            )}

            {/* Mobile drawer overlay – only rendered on mobile */}
            {isMobile && isMobileOpen && (
                <div className="tw:fixed tw:inset-0 tw:z-50 tw:flex">
                    {/* Backdrop */}
                    <div
                        className="tw:absolute tw:inset-0 tw:bg-black/40 tw:backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                        aria-label="Close sidebar"
                    />
                    {/* Drawer */}
                    <div className="tw:relative tw:flex tw:h-full tw:animate-slide-in-left">
                        {sidebarContent(true)}
                    </div>
                </div>
            )}
        </>
    );
};
