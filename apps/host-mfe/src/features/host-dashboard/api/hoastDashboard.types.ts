


export interface DashboardMetric {
    label: string;
    value: number;
    icon: any;
    color: string;
    bg: string;
}

export interface MatrixData {
    expectedToday: number;
    checkedInToday: number;
    pendingDeliveries: number;
}


export interface Cohost {
    cohostUserId: string;
    cohostEmail: string;
    cohostName: string;
  }

export interface VisitorVisit {
    id: string;
    fullName: string;
    email: string;
    hostUserId: string;
    hostEmail: string;
    hostName: string;
    createdUserId: string;
    createdEmail: string;
    createdName: string;
    visitorType: string;
    visitorTypeId: string;
    companyName: string;
    phoneNumber: string;
    scheduleCheckinDate: string; // ISO Date string
    scheduleCheckoutDate: string; // ISO Date string
    orgId: string;
    orgName: string;
    siteId: string;
    siteName: string;
    createTime: string; // ISO Date string
    modifyTime: string; // ISO Date string
    notifyHostFlag: boolean;
    notifyVisitFlag: boolean;
    status: "ACTIVE" | "INACTIVE" | string;
    shouldPrefill: boolean;
    preregisterVisitCustomFieldModels: any[]; // Replace any if you have a specific custom field model
    groupName: string;
    internalNote: string;
    recurrenceType: "NONE" | "DAILY" | "WEEKLY" | string;
    parentVisitId: string;
    sendMail: boolean;
    cohosts: Cohost[];
    recurringParent: boolean;
  }
  
  export interface VisitorVisitResponse {
    results: VisitorVisit[];
    totalRecords: number;
  }

  export interface VisitRecord {
  id: string;
  fullName: string;
  companyName: string;
  visitorType: string;
  checkinTime: string;
  checkoutTime: string | null;
  avatarUri: string | null;
  email: string;
  phoneNumber: string;
  visitCustomFields?: Array<{ name: string; value: string }>;
}

// API Response Wrapper
export interface PastVisitorsResponse {
  results: VisitRecord[];
  totalRecords: number;
}

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

export interface SignInLogRecord {
    id: string;
    fullName: string;
    employeePhotoUrl: string | null;
    siteName: string;
    checkinTime: string;
    checkoutTime: string | null;
    duration?: string; // We'll calculate this or use the one from API if provided
}

// API Response Wrapper
export interface MySignInLogResponse {
    results: SignInLogRecord[];
    totalRecords: number;
}

export interface Site {
    id: string;
    name: string;
}
