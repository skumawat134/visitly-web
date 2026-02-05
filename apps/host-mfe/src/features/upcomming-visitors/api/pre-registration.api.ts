import { getApiClient } from "@visitly/api-client";
import type { SitesResponse } from "../types/upcomming-visitors.types";
import type { PreregistrationVisitorTypeConfig, UsersResponse, VisitorTypesResponse } from "../types/pre-registration.types";

// Fetches active sites
export async function getSites(): Promise<SitesResponse> {
    const { data } = await getApiClient().get("/v1/sites?status=ACTIVE");
    return data;
}


// Fetches visitor types based on siteId
export async function getVisitorTypes(siteId: string): Promise<VisitorTypesResponse> {
    const { data } = await getApiClient().get(`/v1/visitortypes?siteId=${siteId}&status=ACTIVE`);
    return data;
}

// Fetches hosts/users based on search query and siteId
export async function getHosts(search: string, siteId?: string): Promise<UsersResponse> {
    const { data } = await getApiClient().get("/v1/users", { 
        params: { q: search, status: 'ACTIVE' } 
    });
    return data;
}

// Similar signatures for co-hosts, point-of-entry, etc.
export async function getPointOfEntry(siteId: string): Promise<any[]> {
    const { data } = await getApiClient().get(`/v1/point-of-entry?siteId=${siteId}&status=ACTIVE`);
    return data;
}

export async function getParkingLots(siteId: string): Promise<any[]> {
    const { data } = await getApiClient().get(`/v1/parking-lots?siteId=${siteId}&status=ACTIVE`);
    return data;
}

export async function getVistorTypeFields(visitorTypeId: string): Promise<PreregistrationVisitorTypeConfig> {
    const { data } = await getApiClient().get(`/v1/visitortypes/${visitorTypeId}`);
    return data;
}
