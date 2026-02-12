import {
    LayoutDashboard,
    ClipboardList,
    UserCheck,
    UserPlus,
    Truck,
    Building2,
    AlertTriangle,
    Layers,
    Users,
    BarChart2,
    Box,
    Settings,
    ArrowLeft,
    MapPin,
    KeyRound,
    Smartphone,
    Wifi,
    User,
    Tablet,
    FileText,
    BellRing,
    MessageSquare,
    Camera,
    Map,
    Contact,
    LogIn
} from 'lucide-react';

export interface SidebarItem {
    title: string;
    path?: string;
    icon?: any;
    action?: string;
    children?: SidebarItem[];
    // If provided, item is only shown if this function returns true
    condition?: (context: SidebarContext) => boolean;
    testid?: string;
    isActive?: (path: string) => boolean;
}

export interface SidebarContext {
    isGlobalInternalAdmin: boolean;
    isGlobalAdmin: boolean;
    isSiteAdmin: boolean;
    isFrontDeskManager: boolean;
    isEvacManager: boolean;
    isHost: boolean;
    isDeliveryManager: boolean;

    // Entitlements
    isDeliveryManagerEntitled: boolean;
    isAdvanceAnalyticsEntitled: boolean;
    isUserGroupEntitled: boolean;
    isBackgroundCheckEntitled: boolean;
    isAdvancedMegaLocationEntitled: boolean;

    // App State
    currentPlan: string;
}

export const MAIN_MENU: SidebarItem[] = [
    {
        title: 'Dashboard',
        icon: LayoutDashboard,
        path: '/admin/admin/work_area/dashboard',
        condition: (ctx) => !ctx.isDeliveryManagerEntitled,
        testid: 'nav-dashboard'
    },
    {
        title: 'Dashboard',
        icon: LayoutDashboard,
        condition: (ctx) => ctx.isDeliveryManagerEntitled,
        testid: 'nav-dashboard-submenu',
        children: [
            {
                title: 'Visitor Dashboard',
                path: '/admin/admin/work_area/dashboard',
                testid: 'visitor-dashboard-link'
            },
            {
                title: 'Delivery Dashboard',
                path: '/admin/admin/work_area/delivery-manager/dashboard',
                testid: 'delivery-dashboard-link'
            }
        ]
    },
    {
        title: 'Visitor Log',
        icon: ClipboardList,
        path: '/admin/admin/work_area/visitor-log',
        testid: 'nav-visitor-log'
    },
    // { title: 'Prefill Log', icon: ClipboardList, path: '/admin/work_area/prefill-log' },
    {
        title: 'Employee Log',
        icon: UserCheck,
        path: '/admin/admin/work_area/employee-log',
        condition: (ctx) => ctx.isGlobalAdmin || ctx.isFrontDeskManager,
        testid: 'nav-employee-log'
    },
    {
        title: 'Pre-Registration',
        icon: UserPlus,
        path: '/admin/admin/work_area/pre-registration',
        testid: 'nav-pre-registration'
    },
    {
        title: 'Deliveries',
        icon: Truck,
        condition: (ctx) => ctx.isDeliveryManagerEntitled && (ctx.isGlobalAdmin || ctx.isFrontDeskManager),
        testid: 'nav-deliveries-submenu',
        children: [
            { title: 'Delivery Log', path: '/admin/admin/work_area/delivery-manager/delivery-logs', testid: 'delivery-log-link' },
            { title: 'Receiving Log', path: '/admin/admin/work_area/delivery-manager/receiving-logs', testid: 'receiving-log-link' },
            { title: 'Delivery Areas', path: '/admin/admin/work_area/delivery-manager/delivery-area', testid: 'delivery-areas-link' }
        ]
    },
    {
        title: 'Delivery',
        icon: Truck,
        path: '/admin/admin/work_area/delivery',
        condition: (ctx) => !ctx.isDeliveryManagerEntitled,
        testid: 'nav-delivery'
    },
    {
        title: 'Locations',
        icon: Building2,
        path: '/admin/admin/work_area/locations/list',
        condition: (ctx) => ctx.isGlobalAdmin,
        testid: 'nav-locations',
        action :'GO_TO_LOCATION'
    },
    {
        title: 'Evacuation & Emergency',
        icon: AlertTriangle,
        path: '/admin/admin/work_area/evacuation/main',
        condition: (ctx) => ctx.isGlobalAdmin,
        testid: 'nav-evacuation'
    },
    {
        title: 'My Visitly',
        icon: Layers,
        condition: (ctx) => ctx.isGlobalAdmin || ctx.isFrontDeskManager,
        testid: 'nav-myvisitly-submenu',
        children: [
            { title: 'My Visitors', path: '/admin/admin/work_area/evacuation/past-visitors', testid: 'my-visitors-link' },
            { title: 'My Upcoming Visitors', path: '/admin/admin/work_area/evacuation/upcoming-visitors', testid: 'my-upcoming-visitors-link' },
            { title: 'My Sign In Log', path: '/admin/admin/work_area/evacuation/my-sign-in-log', testid: 'my-sign-in-log-link' },
            {
                title: 'My Deliveries',
                path: '/admin/admin/work_area/evacuation/my-deliveries',
                condition: (ctx) => ctx.isDeliveryManagerEntitled,
                testid: 'my-deliveries-link'
            },
            { title: 'Company Directory', path: '/admin/admin/work_area/evacuation/directory', testid: 'company-directory-link' }
        ]
    },
    {
        title: 'Users',
        icon: Users,
        condition: (ctx) => ctx.isGlobalAdmin && !ctx.isSiteAdmin,
        testid: 'nav-users-submenu',
        children: [
            { title: 'Users/Employees', path: '/admin/admin/work_area/users/users-list', testid: 'users-employees-link' },
            {
                title: 'User Groups',
                path: '/admin/admin/work_area/users/users-groups',
                condition: (ctx) => ctx.isUserGroupEntitled,
                testid: 'user-groups-link'
            },
            { title: 'Administrators', path: '/admin/admin/work_area/users/administrators', testid: 'administrators-link' },
            { title: 'User Delegate', path: '/admin/admin/work_area/users/user-delegate', testid: 'user-delegate-link' }
        ]
    },
    {
        title: 'Analytics',
        icon: BarChart2,
        path: '/admin/admin/work_area/analytics',
        condition: (ctx) => ctx.isAdvanceAnalyticsEntitled && (ctx.isGlobalAdmin || ctx.isSiteAdmin || ctx.isFrontDeskManager || ctx.isDeliveryManager),
        testid: 'nav-analytics'
    },
    {
        title: 'Integration',
        icon: Box,
        condition: (ctx) => ctx.isGlobalAdmin && !ctx.isSiteAdmin,
        testid: 'nav-integration-submenu',
        children: [
            { title: 'Notification', path: '/admin/admin/work_area/integration/notifications', testid: 'integration-notification-link' },
            { title: 'Guest WiFi', path: '/admin/admin/work_area/integration/guest-wifi', testid: 'integration-guest-wifi-link' },
            { title: 'Employee/Staff Directory', path: '/admin/admin/work_area/integration/employee-staff-directory', testid: 'integration-employee-directory-link' },
            { title: 'Single Sign On', path: '/admin/admin/work_area/integration/single-sign-on', testid: 'integration-sso-link' },
            { title: 'Webhooks', path: '/admin/admin/work_area/integration/webhook', testid: 'integration-webhooks-link' }
        ]
    },
    {
        title: 'Settings',
        icon: Settings,
        condition: (ctx) => ctx.isGlobalAdmin && !ctx.isSiteAdmin,
        testid: 'nav-settings-submenu',
        children: [
            { title: 'General', path: '/admin/admin/work_area/settings/general', testid: 'settings-general-link' },
            { title: 'Custom Fields', path: '/admin/admin/work_area/settings/custom-fields', testid: 'settings-custom-fields-link' },
            {
                title: 'Billing',
                path: '/admin/admin/work_area/settings/billing',
                condition: (ctx) => ctx.currentPlan !== 'Trial' && ctx.currentPlan !== 'Expired',
                testid: 'settings-billing-link'
            },
            { title: 'Global Watchlist Rules', path: '/admin/admin/work_area/settings/global-watchlist', testid: 'settings-global-watchlist-link' }
        ]
    }
];

export const LOCATION_MENU: SidebarItem[] = [
    {
        title: 'Back to Locations',
        icon: ArrowLeft,
        action: 'BACK_TO_LOCATIONS',
        testid: 'back-to-locations-link'
    },
    {
        title: 'General',
        icon: Settings,
        path: '/admin/admin/work_area/locations/general',
        testid: 'location-general-link'
    },
    {
        title: 'Advance Location',
        icon: MapPin,
        condition: (ctx) => ctx.isAdvancedMegaLocationEntitled,
        testid: 'nav-advance-location-submenu',
        children: [
            { title: 'Point of Entry', path: '/admin/admin/work_area/locations/advance-location/point-of-entry', testid: 'location-point-of-entry-link' },
            { title: 'Parking Lot', path: '/admin/admin/work_area/locations/advance-location/parking-lot', testid: 'location-parking-lot-link' },
            { title: 'Building', path: '/admin/admin/work_area/locations/advance-location/building', testid: 'location-building-link' }
        ]
    },
    {
        title: 'Employee Sign In',
        icon: KeyRound,
        path: '/admin/admin/work_area/locations/employee-sign-in',
        testid: 'location-employee-sign-in-link'
    },
    {
        title: 'Delivery Areas',
        icon: Truck,
        path: '/admin/admin/work_area/locations/delivery-area',
        condition: (ctx) => ctx.isDeliveryManagerEntitled,
        testid: 'location-delivery-areas-link'
    },
    {
        title: 'Look and Feel',
        icon: Smartphone,
        path: '/admin/admin/work_area/locations/look-and-feel',
        testid: 'location-look-and-feel-link'
    },
    {
        title: 'Guest WiFi',
        icon: Wifi,
        path: '/admin/admin/work_area/locations/guest-wifi',
        testid: 'location-guest-wifi-link'
    },
    {
        title: 'Custom Badge',
        icon: User,
        path: '/admin/admin/work_area/locations/custom-badge',
        testid: 'location-custom-badge-link'
    },
    {
        title: 'Devices',
        icon: Tablet,
        path: '/admin/admin/work_area/locations/devices',
        testid: 'location-devices-link'
    },
    {
        title: 'Visitor Types',
        icon: Users,
        path: '/admin/admin/work_area/locations/visitor-types',
        testid: 'location-visitor-types-link'
    },
    {
        title: 'Documents',
        icon: FileText,
        path: '/admin/admin/work_area/locations/documents',
        testid: 'location-documents-link'
    },
    {
        title: 'Notification Templates',
        icon: BellRing,
        path: '/admin/admin/work_area/locations/notification-templates',
        testid: 'location-notification-templates-link'
    },
    {
        title: 'Notifications',
        icon: MessageSquare,
        path: '/admin/admin/work_area/locations/notifications',
        testid: 'location-notifications-link'
    },
    {
        title: 'Visitor Verification',
        icon: Camera,
        path: '/admin/admin/work_area/locations/visitor-verification',
        condition: (ctx) => ctx.isBackgroundCheckEntitled,
        testid: 'location-visitor-verification-link'
    },
    {
        title: 'Location Watchlist',
        icon: Map,
        path: '/admin/admin/work_area/locations/location-watchlist',
        testid: 'location-watchlist-link'
    }
];

export const EVAC_HOST_MENU: SidebarItem[] = [
    {
        title: 'My Upcoming Visitors',
        icon: ClipboardList,
        path: '/admin/admin/work_area/evacuation/upcoming-visitors',
        testid: 'evac-my-upcoming-visitors-link'
    },
    {
        title: 'My Visitors',
        icon: Users,
        path: '/admin/admin/work_area/evacuation/past-visitors',
        testid: 'evac-my-visitors-link'
    },
    {
        title: 'My Sign In Log',
        icon: LogIn,
        path: '/admin/admin/work_area/evacuation/my-sign-in-log',
        testid: 'evac-my-sign-in-log-link'
    },
    {
        title: 'My Deliveries',
        icon: Truck,
        path: '/admin/admin/work_area/evacuation/my-deliveries',
        condition: (ctx) => ctx.isDeliveryManagerEntitled,
        testid: 'evac-my-deliveries-link'
    },
    {
        title: 'Company Directory',
        icon: Contact,
        path: '/admin/admin/work_area/evacuation/directory',
        testid: 'evac-company-directory-link'
    },
    {
        title: 'Evacuation & Emergency',
        icon: AlertTriangle,
        path: '/admin/admin/work_area/evacuation/main',
        condition: (ctx) => ctx.isEvacManager,
        testid: 'evac-evacuation-link'
    }
];

export const DELIVERY_MANAGER_MENU: SidebarItem[] = [
    {
        title: 'Dashboard',
        icon: LayoutDashboard,
        path: '/admin/admin/work_area/delivery-manager/dashboard',
        condition: (ctx) => ctx.isDeliveryManagerEntitled,
        testid: 'dm-dashboard-link'
    },
    {
        title: 'Delivery Log',
        icon: Users,
        path: '/admin/admin/work_area/delivery-manager/delivery-logs',
        condition: (ctx) => ctx.isDeliveryManagerEntitled,
        testid: 'dm-delivery-log-link'
    },
    {
        title: 'Receiving Log',
        icon: LogIn,
        path: '/admin/admin/work_area/delivery-manager/receiving-logs',
        condition: (ctx) => ctx.isDeliveryManagerEntitled,
        testid: 'dm-receiving-log-link'
    },
    {
        title: 'Delivery Area',
        icon: Contact,
        path: '/admin/admin/work_area/delivery-manager/delivery-area',
        condition: (ctx) => ctx.isDeliveryManagerEntitled,
        testid: 'dm-delivery-area-link'
    },
    {
        title: 'Analytics',
        icon: BarChart2,
        path: '/admin/admin/work_area/analytics',
        condition: (ctx) => ctx.isDeliveryManagerEntitled && ctx.isAdvanceAnalyticsEntitled,
        testid: 'dm-analytics-link'
    },
    {
        title: 'My Visitly',
        icon: Layers,
        testid: 'dm-myvisitly-submenu',
        children: [
            { title: 'My Visitors', path: '/admin/admin/work_area/evacuation/past-visitors', testid: 'dm-my-visitors-link' },
            { title: 'My Upcoming Visitors', path: '/admin/admin/work_area/evacuation/upcoming-visitors', testid: 'dm-my-upcoming-visitors-link' },
            { title: 'My Sign In Log', path: '/admin/admin/work_area/evacuation/my-sign-in-log', testid: 'dm-my-sign-in-log-link' },
            { title: 'Company Directory', path: '/admin/admin/work_area/evacuation/directory', testid: 'dm-company-directory-link' }
        ]
    }
];
