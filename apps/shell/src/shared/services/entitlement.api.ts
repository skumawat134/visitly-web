import { getApiClient } from "@visitly/api-client";
import type { EntitlementsResponse } from "../types/entitlement.type";

export async function getProductInfo (orgId : string){
    const { data } = await getApiClient().get<EntitlementsResponse>(`/orgs/${orgId}/products`);
    return data;
  }