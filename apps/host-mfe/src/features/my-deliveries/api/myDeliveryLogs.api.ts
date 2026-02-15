import { getApiClient } from '@visitly/api-client';
import type {
    MyDeliveryLogsResponse,
    MyDeliveryLogsQueryParams,
    Site,
    DeliveryArea,
    DeliveryLogRecord,
} from './myDeliveryLogs.types';

export async function getMyDeliveryLogs(params: MyDeliveryLogsQueryParams): Promise<MyDeliveryLogsResponse> {
    const { data } = await getApiClient().get<MyDeliveryLogsResponse>('/v1/host/deliverylogs', { params });
    return data;
}

export async function getAllSites(): Promise<{ results: Site[] }> {
    const { data } = await getApiClient().get('/v1/sites', { params: { status: 'ACTIVE' } });
    return data;
}

export async function getDeliveryAreasBySite(siteId: string): Promise<{ results: DeliveryArea[] }> {
    const { data } = await getApiClient().get('/v1/siteDeliveryArea', { params: { siteId, status: 'ACTIVE' } });
    return data;
}

// Used for saving notes, relocation (Move) and general updates
export async function updateDeliveryLog(id: string, payload: Partial<DeliveryLogRecord>): Promise<any> {
    const { data } = await getApiClient().patch(`/v1/deliveryLog/${id}`, payload);
    return data;
}

// Bulk update for relocation (Move)
export async function updateDeliveryLogBulk(payload: any[]): Promise<any> {
    const { data } = await getApiClient().patch('/v1/deliveryLog', payload);
    return data;
}

// Used for updating status (Picked Up, Discard, Disposed, Unidentified)
export async function updateDeliveryStatus(id: string, payload: { status: string; pickupD?: string }): Promise<any> {   
    const { data } = await getApiClient().patch(`/v1/host/delivery/${id}`, payload);
    return data;
}

// Bulk status update (Picked Up)
export async function updateDeliveryStatusBulk(payload: any[]): Promise<any> {
    const { data } = await getApiClient().patch('/v1/host/delivery', payload);
    return data;
}

export async function deleteDeliveryLogs(params: { deliveryLogId: string }[]): Promise<any> {
    // Evacuation component uses deliveryLogsAPI which points to /v1/deliveryLog
    const { data } = await getApiClient().delete('/v1/deliveryLog', { data: params });
    return data;
}

export async function searchRecipients(q: string): Promise<{ results: any[] }> {
    const { data } = await getApiClient().get('/v1/users', { params: { q } });
    return data;
}
