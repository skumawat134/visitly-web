import { getApiClient } from "@visitly/api-client";
import type {
  CustomFieldsApiResponse,
  VisitorListParams,
  VisitorVisitResponse,
  SitesResponse,
  VisitorTypeResponse,
  VisitorTypeParams
} from "../types/upcomming-visitors.types";

export async function getUpCommingVisitors(params: VisitorListParams): Promise<VisitorVisitResponse> {
  const { data } = await getApiClient().get<VisitorVisitResponse>("/v1/host/preregistrations", { params });
  return data;
}

export async function getAllSites(): Promise<SitesResponse> {
  const { data } = await getApiClient().get<SitesResponse>("/v1/host/sites");
  return data;
}

export async function getAllVisitorType(params: VisitorTypeParams): Promise<VisitorTypeResponse> {
  const { data } = await getApiClient().get<VisitorTypeResponse>("/v1/visitortypes", { params });
  return data;
}

export async function getCustomFields(): Promise<CustomFieldsApiResponse> {
  const { data } = await getApiClient().get<CustomFieldsApiResponse>("/v1/orgcustomFields?includeDeleted=false", {
    headers: {
      'Content-Type': 'application/json',
    },

  });
  return data;
}

export async function exportVisitorsCSV(params: VisitorListParams): Promise<Blob> {
  // ... existing implementation
  const { data } = await getApiClient().get("/v1/visit/preregister/export", {
    params: { ...params, limit: 10000 }, // Matching your 10k limit
    responseType: 'blob'
  });
  return data;
}

export async function bulkUpdatePreRegistrations(payload: any): Promise<any> {
  const { data } = await getApiClient().patch("/v1/host/bulk", payload);
  return data;
}

export async function bulkCancelPreRegistrations(payload: any): Promise<any> {
  const { data } = await getApiClient().patch("/v1/host/bulk", {
    ...payload,
    status: 'CANCELLED'
  });
  return data;
}
