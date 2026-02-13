import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, Menu } from 'lucide-react';
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
import { Button } from '@visitly/ui';

const SidebarItemComponent: React.FC<{
    item: SidebarItem;
    context: SidebarContext;
    isCollapsed: boolean;
    onAction?: (action: string) => void;
}> = ({ item, context, isCollapsed, onAction }) => {
    const [isOpen, setIsOpen] = useState(false);
    const Icon = item.icon;
    const location = useLocation();
    console.log('Rendering SidebarItem:', item.title, context);
    // Condition check
    if (item.condition && !item.condition(context)) return null;

    const hasChildren = item.children && item.children.length > 0;

    const handleClick = (e: React.MouseEvent) => {
        if (item.action && onAction) {
            e.preventDefault();
            onAction(item.action);
        } else if (hasChildren) {
            e.preventDefault();
            setIsOpen(!isOpen);
        }
    };

    // Custom active check
    const isItemActive = (reactActive: boolean, path?: string) => {
        // 1. React Router active
        // if (reactActive) return true;

        // 2. Custom isActive function from config
        if (item.isActive && item.isActive(location.pathname)) return true;

        // 3. Fallback: Check if current location starts with the item's path (for Angular routes)
        // Ensure path is defined and not just '#' or empty
        if (path && path !== '#' && location.pathname.startsWith(path)) return true;

        // 4. Check if any child is active (Recursive)
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
        <div className="tw:relative tw:group">
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
                    {item.children?.map((child) => (
                        (!child.condition || child.condition(context)) && (
                            <NavLink
                                key={child.title}
                                to={child.path || '#'}
                                className={({ isActive }) => {
                                    // Submenu item active check
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
                        )
                    ))}
                </div>
            )}

            {/* Collapsed Tooltip */}
            {isCollapsed && (
                <div className={`
           tw:absolute tw:left-full tw:top-1 tw:ml-1
           tw:border tw:border-gray-100 tw:shadow-xl tw:rounded-lg 
           tw:opacity-0 tw:invisible tw:group-hover:opacity-100 tw:group-hover:visible
           tw:transition-all tw:duration-200 tw:z-50
           ${hasChildren ? 'tw:w-60  tw:bg-white' : 'tw:w-max tw:px-6 tw:py-3 tw:bg-[#E5E9FF]!'}
         `}>
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
                                    className={({ isActive }) => {
                                        const active = isActive ||
                                            (child.isActive && child.isActive(location.pathname)) ||
                                            (child.path && child.path !== '#' && location.pathname.startsWith(child.path));

                                        return `
                     tw:block tw:px-4 tw:py-2.5 tw:text-sm tw:transition-colors tw:no-underline
                     ${active ? 'tw:bg-indigo-50! tw:text-indigo-700!' : 'tw:text-gray-600! hover:tw:bg-indigo-50! hover:tw:text-indigo-700!'}
                   tw:hover:bg-indigo-50! tw:hover:text-indigo-700!
                     `}}
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

export const Sidebar: React.FC = () => {
    const { isCollapsed, isLocationMode, setLocationMode } = useSidebarStore();
    const context = useSidebarPermissions();
    const navigate = useNavigate();

    useEffect(() => {
        const handler = (event: any) => {
            const path = event.detail.pathname;
            // update location 
            const match = path.match(
                /^\/admin\/work_area\/locations(\/(?!list$).*)?$/
            );
            if (match) {
                setLocationMode(true);
            }
            debugger;
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
            //dispatch a custom event to angular
            window.dispatchEvent(
                new CustomEvent('host:navigation', {
                    detail: { pathname: '/admin/work_area/locations/list' },
                })
            );
        }
        // if (action == 'GO_TO_LOCATION') {
        //     setLocationMode(true);
        //     navigate('/admin/admin/work_area/locations/list');
        // }
    };

    const getMenuItems = () => {
        console.log('Evaluating menu items with context:', context);
        if (isLocationMode && (context.isGlobalAdmin || context.isFrontDeskManager)) {
            return LOCATION_MENU;
        }
        if (!isLocationMode && (context.isGlobalAdmin || context.isFrontDeskManager)) {
            return MAIN_MENU;
        }

        // Delivery Manager specific view (only if not viewing as Global Admin in standard mode? 
        // Angular logic: !GlobalAdmin && DeliveryManager -> sidebarnav-delivery-manager
        // If GlobalAdmin, they see MAIN_MENU which includes "Deliveries" submenu if entitled.
        // The Angular logic separates GlobalAdmin menus from "pure" DeliveryManager menus.

        if (!context.isGlobalAdmin && context.isDeliveryManager) {
            return DELIVERY_MANAGER_MENU;
        }

        if (!context.isGlobalAdmin && context.isEvacManager) {
            return EVAC_HOST_MENU;
        }
        
        if (context.isHost) {
            return EVAC_HOST_MENU;
        }

        // Default Main Menu (Global Admin, Front Desk Manager, or fallthrough)
        // Note: Angular also checks !isDeliveryManagerEntitled for Dashboard link etc inside the main menu.
        // Our MAIN_MENU config handles those intra-menu conditions.
        return MAIN_MENU;
    };

    const menuItems = getMenuItems();
    console.log('menuItems:', menuItems);
    return (
        //         <aside
        //             className={`
        //     tw:bg-white tw:border-r tw:border-gray-200
        //     tw:transition-all tw:duration-300 tw:z-40
        //     tw:flex tw:flex-col
        //     tw:h-screen
        //      custom-scrollbar
        //     ${isCollapsed ? 'tw:w-20' : 'tw:w-64'}
        //   `}
        <aside className={`
      tw:bg-white tw:border-r tw:border-gray-200 
      tw:transition-all tw:duration-300 tw:z-40 tw:overflow-y-visible
      ${isCollapsed ? 'tw:w-20' : 'tw:w-64'}
    `}
            data-testid="left-sidebar"  >
            <nav className="tw:flex-1 tw:py-4 ">
                {menuItems.map((item, index) => (
                    <SidebarItemComponent
                        key={index}
                        item={item}
                        context={context}
                        isCollapsed={isCollapsed}
                        onAction={handleAction}
                    />
                ))}
            </nav>
            {!isCollapsed && context.isGlobalAdmin && context.currentPlan === 'Trial' && (
                <div className="tw:p-4">
                    <Button className="tw:w-full tw:bg-indigo-600 tw:text-white tw:py-2 tw:rounded-md tw:text-sm tw:font-medium hover:tw:bg-indigo-700 tw:transition-colors">
                        Quick Setup
                    </Button>
                </div>
            )}

            {/* Version */}
            {!isCollapsed && (
                <div className="tw:p-4 tw:text-[10px] tw:text-gray-400 tw:border-t tw:border-gray-50 tw:text-center">
                    v 1.3.201
                </div>
            )}
        </aside>
    );
};
