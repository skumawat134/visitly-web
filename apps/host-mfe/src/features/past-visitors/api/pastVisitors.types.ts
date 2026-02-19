// Visitor Record Model
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
  hostUserId : string;
  visitCustomFields?: Array<{ name: string; value: string }>;
}

// API Response Wrapper
export interface PastVisitorsResponse {
  results: VisitRecord[];
  totalRecords: number;
}

// API Query Params Payload
export interface PastVisitorsQueryParams {
  limit: number;
  offset: number;
  q?: string;
  siteId?: string;
  visitorTypeId?: string;
  userId?: string;
  groupName?: string;
  visitStartDate?: string;
  visitEndDate?: string;
  sort?: string;
  sortBy?: string;
}
