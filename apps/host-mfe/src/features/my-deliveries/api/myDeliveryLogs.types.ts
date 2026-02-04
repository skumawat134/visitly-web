export enum DeliveryLogStatus {
    UNIDENTIFIED = 'Unidentified',
    PENDING = 'Pending',
    PICKEDUP = 'Picked up',
    DISCARD = 'Discard',
    DISPOSED = 'Disposed'
}

export interface DeliveryLogRecord {
    id: string;
    labelUri: string | null;
    recipientFirstName: string | null;
    recipientLastName: string | null;
    recipientUserId: string | null;
    carrier: string | null;
    siteName: string;
    siteId: string;
    siteDeliveryAreaName: string;
    siteDeliveryId: string;
    status: DeliveryLogStatus;
    receiveD: string;
    pickupD: string | null;
    trackingId: string | null;
    pickupNote: string | null;
    internalNote: string | null;
}

export interface MyDeliveryLogsResponse {
    results: DeliveryLogRecord[];
    totalRecords: number;
}

export interface MyDeliveryLogsQueryParams {
    limit: number;
    offset: number;
    sort?: string;
    sortBy?: string;
    q?: string;
    siteId?: string;
    receivedStartDate?: string;
    receivedEndDate?: string;
    status?: string[];
    siteAreaId?: string;
    recipientUserId?: string;
}

export interface DeliveryArea {
    id: string;
    name: string;
    status: string | boolean;
}

export interface Site {
    id: string;
    name: string;
}
