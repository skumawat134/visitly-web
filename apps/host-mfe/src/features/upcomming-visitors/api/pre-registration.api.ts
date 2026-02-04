import { getApiClient } from "@visitly/api-client";

// Fetches active sites
export async function getSites(): Promise<any[]> {
    const { data } = await getApiClient().get("/v1/sites?status=ACTIVE");
    return data.results;
}

// Fetches visitor types based on siteId
export async function getVisitorTypes(siteId: string): Promise<any[]> {
    const { data } = await getApiClient().get(`/v1/visitor-types?siteId=${siteId}&status=ACTIVE`);
    return data.results;
}

// Fetches hosts/users based on search query and siteId
export async function getHosts(search: string, siteId?: string): Promise<any[]> {
    const { data } = await getApiClient().get("/v1/users", { 
        params: { q: search, status: 'ACTIVE', siteId } 
    });
    return data.results;
}

// Similar signatures for co-hosts, point-of-entry, etc.
export async function getPointOfEntry(siteId: string): Promise<any[]> {
    const { data } = await getApiClient().get(`/v1/point-of-entry?siteId=${siteId}&status=ACTIVE`);
    return data.results;
}

export async function getParkingLots(siteId: string): Promise<any[]> {
    const { data } = await getApiClient().get(`/v1/parking-lots?siteId=${siteId}&status=ACTIVE`);
    return data.results;
}