
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

export interface SSOCheckResponse {
    enabledSso : boolean;
    ssoRequestUrl : string;
}