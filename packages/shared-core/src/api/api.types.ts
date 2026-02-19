

export type UserRoleType =
  | 'GLOBAL_ORG_ADMIN'
  | 'FRONTDESK_ADMIN'
  | 'EVAC_MANAGER'
  | 'DELIVERY_MANAGER'
  | 'SITE_ADMIN'
  | 'HOST';

export interface UserRole {
  role: UserRoleType;
  allSitesFlag: boolean;
}


export interface UserResponse {
  id: string;

  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;

  status: 'ACTIVE' | 'INACTIVE';

  workPhoneCountryCode?: string;
  mobilePhoneCountryCode?: string;

  orgId: string;

  roles: UserRole[];

  department?: string;

  delegateFor?: any []

  delegateTo? : any[]

  allowSigninFlag: boolean;
  skipHostNotification: boolean;

  deleted: boolean;

  createTime: string;   // ISO timestamp
  modifyTime: string;   // ISO timestamp
}
