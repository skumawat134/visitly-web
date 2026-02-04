    import { getApiClient } from '@visitly/api-client';
import type {
    MySignInLogResponse,
    MySignInLogQueryParams,
    Site,
} from './mySignInLog.types';

export async function getMySignInLogs(params: MySignInLogQueryParams): Promise<MySignInLogResponse> {
    const { data } = await getApiClient().get<MySignInLogResponse>('/v1/host/mysigninlog', { params });
    return data;
}

export async function getHostSites(): Promise<{ results: Site[] }> {
    // Using status: 'ACTIVE' as per Angular service
    const { data } = await getApiClient().get('/v1/host/sites', { params: { status: 'ACTIVE' } });
    return data;
}

export async function getCustomFields () : Promise<any>{
    const { data } = await  getApiClient().get<any>("/v1/orgcustomFields?includeDeleted=true" ); 
    return data;
}
