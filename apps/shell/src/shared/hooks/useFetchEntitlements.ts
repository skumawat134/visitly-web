import React, { useEffect } from 'react'
import { useQuery } from "@tanstack/react-query";
import { EntitlementsResponse } from '../types/entitlement.type';
import { getProductInfo } from '../services/entitlement.api';

export const useFetchEntitlements = (orgId?: string, enabled = false) => {
    const query = useQuery<EntitlementsResponse, Error>({
        queryKey: ['entitlements', orgId],
        queryFn: () => getProductInfo(orgId!),
        enabled: !!orgId && enabled,
    });
    const { data } = query;
    useEffect(() => {
        if (!data) return;
        sessionStorage.setItem('entitlement', JSON.stringify(data));
        sessionStorage.setItem('flagForMenu' ,"false");
    }, [data]);
};

export default useFetchEntitlements