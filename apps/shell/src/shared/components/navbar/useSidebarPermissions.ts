import { useMemo } from 'react';
import { type SidebarContext } from './SidebarConfig';

export const useSidebarPermissions = (): SidebarContext => {
    const context = useMemo(() => {
        // 1. Roles from Session Storage
        const userinfoStr = sessionStorage.getItem('userinfo');
        const userDetail = userinfoStr ? JSON.parse(userinfoStr) : null;
        const roles = userDetail?.roles || [];
        const isGlobalAdmin = roles.some((x: any) => x.role === 'GLOBAL_ORG_ADMIN') || roles.some((x: any) => x.role === 'SITE_ADMIN');
        // Note: Angular logic says checkGlobalAdmin is true for SITE_ADMIN too?
        // Let's re-verify Angular code.
        // Angular: if GLOBAL_ORG_ADMIN -> checkGlobalAdmin=true.
        // if SITE_ADMIN -> checkGlobalAdmin=true, checkSiteAdmin=true.
        // So isGlobalAdmin in my context should probably match "checkGlobalAdmin" from Angular which seems to mean "Can see Admin stuff".

        // Let's stick to the boolean flags used in the Sidebar Config conditions:
        // ctx.isGlobalAdmin used for 'Locations', 'Evacuation', etc.

        const checkGlobalAdmin = roles.some((x: any) => x.role === 'GLOBAL_ORG_ADMIN') || roles.some((x: any) => x.role === 'SITE_ADMIN');
        const isSiteAdmin = roles.some((x: any) => x.role === 'SITE_ADMIN');
        const isFrontDeskManager = roles.some((x: any) => x.role === 'FRONTDESK_ADMIN');
        const isEvacManager = roles.some((x: any) => x.role === 'EVAC_MANAGER') || roles.some((x: any) => x.role === 'GLOBAL_ORG_ADMIN') || roles.some((x: any) => x.role === 'SITE_ADMIN');
        // Angular: EVAC_MANAGER role sets checkEvacManager=true.
        // GLOBAL_ORG_ADMIN sets checkEvacManager=true.
        // SITE_ADMIN sets checkEvacManager=true.

        const isHost = roles.some((x: any) => x.role === 'HOST') || roles.some((x: any) => x.role === 'EVAC_MANAGER');
        // Angular: EVAC_MANAGER sets checkHost=true. HOST role sets checkHost=true.

        const isDeliveryManager = roles.some((x: any) => x.role === 'DELIVERY_MANAGER') || roles.some((x: any) => x.role === 'GLOBAL_ORG_ADMIN');
        // Angular: GLOBAL_ORG_ADMIN sets checkDeliveryManager=true. DELIVERY_MANAGER sets checkDeliveryMananger=true.

        // 2. Entitlements from Session Storage
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
    }, []);

    return context;
};
