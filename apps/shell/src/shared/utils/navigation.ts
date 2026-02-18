
export function resolveLanding(user: any): string {
    const roles = user?.roles || [];
    const permissions = {
        isGlobalInternalAdmin: roles.some((r: any) => r.role === 'GLOBAL_INTERNAL_ADMIN'),
        isGlobalAdmin: roles.some((r: any) => r.role === 'GLOBAL_ORG_ADMIN'),
        isSiteAdmin: roles.some((r: any) => r.role === 'SITE_ADMIN'),
        isFrontDeskManager: roles.some((r: any) => r.role === 'FRONTDESK_ADMIN'),
        isDeliveryManager: roles.some((r: any) => r.role === 'DELIVERY_MANAGER'),
        isHost: roles.some((r: any) => r.role === 'HOST'),
        isEvacManager: roles.some((r: any) => r.role === 'EVAC_MANAGER'),
    };

    if (permissions.isGlobalInternalAdmin) return '/admin/internalAdmin/org-list';
    if (permissions.isGlobalAdmin || permissions.isSiteAdmin || permissions.isFrontDeskManager) return '/admin/work_area/dashboard';
    if (permissions.isDeliveryManager) return '/admin/work_area/delivery-manager/dashboard';
    if (permissions.isHost || permissions.isEvacManager) return '/admin/work_area/evacuation/past-visitors';

    return '/admin/work_area/dashboard';
}

export function resolveRole(user: any): string {
    const roles = user.roles || [];
    if (roles.some((r: any) => r.role === 'GLOBAL_ORG_ADMIN')) return 'gadmin';
    if (roles.some((r: any) => r.role === 'FRONTDESK_ADMIN')) return 'fdadmin';
    if (roles.some((r: any) => r.role === 'EVAC_MANAGER')) return 'lamadmin';
    if (roles.some((r: any) => r.role === 'SITE_ADMIN')) return 'stadmin';
    if (roles.some((r: any) => r.role === 'DELIVERY_MANAGER')) return 'lamadmin';
    return 'host';
}
