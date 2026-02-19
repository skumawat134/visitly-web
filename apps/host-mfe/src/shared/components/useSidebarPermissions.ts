import { useMemo } from 'react';
import { useAuthStore } from '@visitly/app-store';
import type { SidebarContext } from './Sidebar';

export const useSidebarPermissions = (): SidebarContext => {
    const user = useAuthStore(s => s.user);

    const context = useMemo(() => {
        // 1. Roles - Prioritize user object from store (reactive), fallback to sessionStorage
        let roles: any[] = [];
        if (user && user.roles) {
            roles = user.roles;
        } else {
            const userinfoStr = sessionStorage.getItem('userinfo');
            const userDetail = userinfoStr ? JSON.parse(userinfoStr) : null;
            roles = userDetail?.roles || [];
        }

        const checkGlobalInternalAdmin = roles.some((x: any) => x.role === 'GLOBAL_INTERNAL_ADMIN');
        const checkGlobalAdmin = roles.some((x: any) => x.role === 'GLOBAL_ORG_ADMIN') || roles.some((x: any) => x.role === 'SITE_ADMIN');
        const isSiteAdmin = roles.some((x: any) => x.role === 'SITE_ADMIN');
        const isFrontDeskManager = roles.some((x: any) => x.role === 'FRONTDESK_ADMIN');
        const isEvacManager = roles.some((x: any) => x.role === 'EVAC_MANAGER') || roles.some((x: any) => x.role === 'GLOBAL_ORG_ADMIN') || roles.some((x: any) => x.role === 'SITE_ADMIN');
        const isHost = roles.some((x: any) => x.role === 'HOST') || roles.some((x: any) => x.role === 'EVAC_MANAGER');
        const isDeliveryManager = roles.some((x: any) => x.role === 'DELIVERY_MANAGER') || roles.some((x: any) => x.role === 'GLOBAL_ORG_ADMIN');

        // 2. Entitlements - Fallback to sessionStorage for now as entitlements might not be in the user object
        const productInfoStr = sessionStorage.getItem('entitlement');
        const productInfo = productInfoStr ? JSON.parse(productInfoStr) : null;

        let isDeliveryManagerEntitled = false;
        let isAdvanceAnalyticsEntitled = false;
        let isUserGroupEntitled = false;
        let isBackgroundCheckEntitled = false;
        let isAdvancedMegaLocationEntitled = false;
        let currentPlan = '';

        if (productInfo && productInfo.products && productInfo.products.length > 0) {
            currentPlan = productInfo.products[0].plan;
            const entitlements = productInfo.products[0].entitlements || [];

            entitlements.forEach((res: any) => {
                if (res.key === 'ADVANCED_DELIVERY_MANAGER') isDeliveryManagerEntitled = JSON.parse(res.value);
                if (res.key === 'ADVANCE_ANALYTICS') isAdvanceAnalyticsEntitled = JSON.parse(res.value);
                if (res.key === 'USER_GROUP') isUserGroupEntitled = JSON.parse(res.value);
                if (res.key === 'BACKGROUND_CHECK') isBackgroundCheckEntitled = JSON.parse(res.value);
                if (res.key === 'ADVANCED_MEGA_LOCATION') isAdvancedMegaLocationEntitled = JSON.parse(res.value);
            });
        }

        return {
            isGlobalInternalAdmin: checkGlobalInternalAdmin,
            isGlobalAdmin: checkGlobalAdmin,
            isSiteAdmin,
            isFrontDeskManager,
            isEvacManager,
            isHost,
            isDeliveryManager,
            isDeliveryManagerEntitled,
            isAdvanceAnalyticsEntitled,
            isUserGroupEntitled,
            isBackgroundCheckEntitled,
            isAdvancedMegaLocationEntitled,
            currentPlan
        };
    }, [user]);

    return context;
};
