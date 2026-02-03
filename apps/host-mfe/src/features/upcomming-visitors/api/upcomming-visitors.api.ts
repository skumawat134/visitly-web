import { getApiClient } from "@visitly/api-client";
import type { CustomFieldsApiResponse, VisitorListParams, VisitorVisitResponse } from "../types/upcomming-visitors.types";

export async function getUpCommingVisitors(params : VisitorListParams) : Promise<VisitorVisitResponse>{
    const { data } = await  getApiClient().get<VisitorVisitResponse>("/v1/host/preregistrations", { params }); 
    return data;
 }

export async function getCustomFields () : Promise<CustomFieldsApiResponse>{
    const { data } = await getApiClient().get<CustomFieldsApiResponse>("/v1/orgcustomFields?includeDeleted=false",{
      headers: {
        'Content-Type': 'application/json',
      },
    
    }); 
    return data;
}

export async function exportVisitorsCSV(params: VisitorListParams): Promise<Blob> {
    // We override the responseType to 'blob' to handle the CSV file stream
    const { data } = await getApiClient().get("/v1/visit/preregister/export", { 
        params: { ...params, limit: 10000 }, // Matching your 10k limit
        responseType: 'blob' 
    }); 
    return data;
}