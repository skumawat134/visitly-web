
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

export type User = {
  id: string;
  email: string;
  roles: UserRole[];
};

// Single role entry
export interface UserRole {
  role: string;
  allSitesFlag: boolean;
}

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
  canAccess: (path: string) => boolean;
  failAuth: (error?: string) => void;
  clearCallback: () => void;
};
export type AuthTokens = {
  accessToken: string | null;
  refreshToken?: string | null;
};
