export type User = {
    id: string;
    email: string;
  };
  
  export type AuthState = {
    user: User | null;
    tokens: AuthTokens;
    isAuthenticated: boolean;
  
    setUser: (user: User | null) => void;
    setTokens: (tokens: AuthTokens) => void;
    logout: () => void;
  };

export  type AuthTokens = {
    accessToken: string | null;
    refreshToken?: string | null;
  };
  