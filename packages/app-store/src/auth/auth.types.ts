
export type AuthStatus =
  | 'init'            // app just mounted
  | 'checking'        // validating tokens / fetching profile
  | 'authenticated'  // user + permissions ready
  | 'unauthenticated'
  | 'error';
  
export type PersistedAuthState = {
  status: AuthStatus;
  user: User | null;
  tokens: AuthTokens;
  isAuthenticated: boolean;
  callbackUrl: string | null;
};
export type UserRoleType =
  | 'GLOBAL_ORG_ADMIN'
  | 'FRONTDESK_ADMIN'
  | 'EVAC_MANAGER'
  | 'DELIVERY_MANAGER'
  | 'GLOBAL_INTERNAL_ADMIN'
  | 'HOST'
  | 'SITE_ADMIN';

export interface UserRole {
  role: UserRoleType;
  allSitesFlag: boolean;
}

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export type User = {
  id: string;
  email: string;
  roles: UserRole[];
  externalId: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  status: UserStatus;
  workPhoneCountryCode?: string;
  workPhone?: string;
  mobilePhoneCountryCode?: string;
  mobilePhone?: string;
  orgId: string;
  employeeId?: string;
  avatarUri?: string;
  department?: string;
  title?: string;
  allowSigninFlag: boolean;
  skipHostNotification: boolean;
  deleted: boolean;
  createTime: string;   // ISO timestamp
  modifyTime: string;   // ISO timestamp
};

// The full "roles" field (array of role objects)
export type UserRoles = UserRole[];

export type AuthState = {
  status: AuthStatus;
  user: User | null;
  tokens: AuthTokens;
  isAuthenticated: boolean;
  callbackUrl: string | null;
  setUser: (user: User | null) => void;
  setTokens: (tokens: AuthTokens) => void;
  startAuth: (callbackUrl?: string) => void;
  setChecking: () => void;
  setUnauthenticated: () => void;
  setAuthenticated: (payload: { user: User; tokens: AuthTokens }) => void;
  logout: () => void;
  can: (cap: string) => boolean;
  canAccess: (cb:()=> boolean) => boolean;
  failAuth: (error?: string) => void; 
  clearCallback: () => void;
};
export type AuthTokens = {
  accessToken: string | null;
  refreshToken?: string | null;
};
