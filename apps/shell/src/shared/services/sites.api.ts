import { getApiClient } from "@visitly/api-client";

export async function getAllSites() {
    const { data } = await getApiClient().get("/v1/sites");
    return data;
}
