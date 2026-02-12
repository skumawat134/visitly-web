import { getApiClient } from "@visitly/api-client";
import type { SitesResponse } from "../types/upcomming-visitors.types";
import type { PreregistrationVisitorTypeConfig, UsersResponse, VisitorTypesResponse } from "../types/pre-registration.types";
import { format, subDays } from "date-fns";

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
    const { data } = await getApiClient().get(`/v1/sites/${siteId}/advanced-locations/poe`);
    return data;
}

export async function getParkingLots(siteId: string): Promise<any[]> {
    const yesterday = format(subDays(new Date(), 1), "yyyy-MM-dd");
    const { data } = await getApiClient().get(`/v1/sites/${siteId}/advanced-locations/parking-availability?date=${yesterday}`);
    return data;
}

export async function getDestinations(siteId: string): Promise<any[]> {
    const { data } = await getApiClient().get(`/v1/sites/${siteId}/advanced-locations/buildings`);
    return data;
}

export async function getVistorTypeFields(visitorTypeId: string): Promise<PreregistrationVisitorTypeConfig> {
    const { data } = await getApiClient().get(`/v1/visitortypes/${visitorTypeId}`);
    return data;
}

export async function bulkPreRegistration(payload: any): Promise<any> {
    const { data } = await getApiClient().post("/v1/preregistrations/bulk", payload);
    return data;
}

export async function createPreregistration(payload: any): Promise<any> {
    const { data } = await getApiClient().post("/v1/visit/preregister", payload);
    return data;
}

export async function updatePreregistration(visitId: string, updateType: string, payload: any): Promise<any> {
    const { data } = await getApiClient().patch(`/v1/preregistrations/${visitId}?updateType=${updateType}`, payload);
    return data;
}

export async function getPreregistrationById(visitId: string): Promise<any> {
    const { data } = await getApiClient().get(`/v1/preregistrations/${visitId}`);
    return data;
}

export async function getVisitPreregistration(visitId: string): Promise<any> {
    const { data } = await getApiClient().get(`/v1/visit/preregister/${visitId}`);
    return data;
}

export async function preScreenBulk(payload: any): Promise<any> {
    const { data } = await getApiClient().post("/v1/host/preregistrations", payload);
    return data;
}

export async function preScreenSingle(payload: any): Promise<any> {
    const { data } = await getApiClient().post("/v1/preregistrations/pre-screen/single", payload);
    return data;
}
