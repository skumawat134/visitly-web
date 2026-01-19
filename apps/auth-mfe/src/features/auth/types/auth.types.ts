
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