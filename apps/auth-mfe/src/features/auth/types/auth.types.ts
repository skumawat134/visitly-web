
export interface LoginPayload {
    email: string;
    password: string;
}

export interface LoginResponse {
    accessToken: string;
    refreshToken?: string;
    user: {
        id: string;
        email: string;
        name?: string;
    };
}

export interface ConfirmEmailPayload {
    email: string;
    code: string;
}

export interface ConfirmEmailResponse {
    message: string;
}   

export interface ForgotPasswordPayload {
    email: string;
}

export interface ForgotPasswordResponse {
    result: string;
    message?: string;
    code?: string;
 }

 export interface VerifyEmailPayload {
    email: string;
}

export interface VerifyEmailResponse {
    result: string;
    message?: string;
}

export interface ResetPasswordPayload {
    email: string;
    code: string;
    password: string;
    confirmPassword: string;
}
export interface SSOCheckResponse {
    enabledSso : boolean;
    ssoRequestUrl : string;
}

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export type UserRoleType =
  | 'GLOBAL_ORG_ADMIN'
  | 'FRONTDESK_ADMIN'
  | 'EVAC_MANAGER'
  | 'DELIVERY_MANAGER'
  | 'SITE_ADMIN';

export interface UserRole {
  role: UserRoleType;
  allSitesFlag: boolean;
}

export interface UserResponse {
  id: string;
  externalId: string;

  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;

  status: UserStatus;

  workPhoneCountryCode?: string;
  workPhone?: string;

  mobilePhoneCountryCode?: string;
  mobilePhone?: string;

  orgId: string;
  employeeId?: string;

  avatarUri?: string;

  roles: UserRole[];

  department?: string;
  title?: string;

  allowSigninFlag: boolean;
  skipHostNotification: boolean;

  deleted: boolean;

  createTime: string;   // ISO timestamp
  modifyTime: string;   // ISO timestamp
}
export interface SignUpPayload{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phoneNumber: string;
    companyName: string;
    confirmPassword: string;
}

export interface SignupResponse {
    message: string;
}

export interface samlAuthenticationPayload {
    samlResponse : string,
}

export interface samlAuthenticationResponse{
    accessToken: string;
    refreshToken?: string;
}
