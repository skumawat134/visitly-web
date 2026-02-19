// SignIn Log Record Model
export interface SignInLogCustomField {
  id?: string;
  name?: string;
  value?: string;
  orgCustomFieldId?: string;
}

export interface SignInLogRecord {
  id?: string;
  fullName?: string;
  email?: string;
  employeeSigninConfigId?: string;

  workPhone?: string;
  mobilePhone?: string;
  userId?: string;

  department?: string;
  title?: string;
  employeeId?: string;

  status?: string;

  checkinTime: string;
  checkoutTime?: string | null;

  orgId?: string;
  orgName?: string;

  siteId?: string;
  siteName?: string;

  employeePhotoUrl?: string | null;

  checkinMethod?: string;

  createTime?: string;
  modifyTime?: string;

  employeeSigninLogCustomFieldModels?: SignInLogCustomField[];

  duration?: number; // API returns number
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
