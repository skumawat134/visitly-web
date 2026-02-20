import { getApiClient } from '@visitly/api-client';
import  type { VisitorVisitResponse, PastVisitorsResponse, MyDeliveryLogsResponse,MySignInLogResponse } from '../api/hoastDashboard.types'


export async function getUpCommingVisitors(params : any) : Promise<VisitorVisitResponse>{
    const { data } = await  getApiClient().get<VisitorVisitResponse>("/v1/host/preregistrations", { params }); 
    return data;
 }

  export async function  getPastVisitors(params : any) : Promise<PastVisitorsResponse>{
     const { data } = await  getApiClient().get<PastVisitorsResponse>("/v1/host/visits", { params }); 
     return data;
  }

  export async function getMyDeliveryLogs(params: any): Promise<MyDeliveryLogsResponse> {
      const { data } = await getApiClient().get<MyDeliveryLogsResponse>('/v1/host/deliverylogs', { params });
      return data;
  }

  export async function updateDeliveryStatus(id: string, payload: { status: string; pickupD?: string }): Promise<any> {
    const { data } = await getApiClient().patch(`/v1/host/delivery/${id}`, payload);
    return data;
}

export async function getMySignInLogs(params: any): Promise<MySignInLogResponse> {
    const { data } = await getApiClient().get<MySignInLogResponse>('/v1/host/mysigninlog', { params });
    return data;
}

export async function getHostSites(): Promise<{ results: Site[] }> {
    // Using status: 'ACTIVE' as per Angular service
    const { data } = await getApiClient().get('/v1/host/sites', { params: { status: 'ACTIVE' } });
    return data;
}

