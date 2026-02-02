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
}
