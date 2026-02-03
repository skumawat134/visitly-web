// SignIn Log Record Model
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

// API Query Params Payload
export interface MySignInLogQueryParams {
    limit: number;
    offset: number;
    sort?: string;
    sortBy?: string;
    q?: string;
    siteId?: string;
    signinStartDate?: string | null ;
    signinEndDate?: string | null ;
    status?: string;
}

// Site Model
export interface Site {
    id: string;
    name: string;
}
