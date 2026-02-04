// User Record Model for Evac Directory
export interface companyDirectoryUserRecord {
    id: string;
    firstName: string;
    lastName: string;
    fullName?: string; // Derived typically
    avatarUri: string | null;
    email: string;
    department: string | null;
    workPhone: string | null;
    workPhoneCountryCode: string | null;
    extension: string | null;
    mobilePhone: string | null;
    mobilePhoneCountryCode: string | null;
    title: string | null;
    status: string;
    createTime: string;
}

// API Response Wrapper
export interface CompanyDirectoryResponse {
    results: companyDirectoryUserRecord[];
    totalRecords: number;
}

// API Query Params Payload
export interface companyDirectoryUserRecordQueryParams {
    limit: number;
    offset: number;
    status?: string;
    sort?: "asc" | "desc";
    sortBy?: string;
    q?: string;
}
