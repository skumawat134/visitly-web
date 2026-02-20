import { getApiClient } from "@visitly/api-client";
import type {
  LoginPayload, LoginResponse, ConfirmEmailPayload, ConfirmEmailResponse, ForgotPasswordPayload, ForgotPasswordResponse,
  VerifyEmailPayload, VerifyEmailResponse, ResetPasswordPayload, SSOCheckResponse,
  UserResponse,
  SignUpPayload,
  SignupResponse , samlAuthenticationPayload , samlAuthenticationResponse
} from "../types/auth.types";

export async function loginApi(
  payload: LoginPayload
): Promise<LoginResponse> {
  const { data } = await getApiClient().post<LoginResponse>(
    "/v1/users/authenticate",
    payload
  );
  return data;
}

export async function confirmEmailApi(
  payload: ConfirmEmailPayload
): Promise<ConfirmEmailResponse> {
  const { data } = await getApiClient().post<ConfirmEmailResponse>(
    "/v1/users/confirm",
    payload
  );
  return data;
}

export async function forgotPassword(
  payload: ForgotPasswordPayload
): Promise<ForgotPasswordResponse> {
  const { data } = await getApiClient().post<ForgotPasswordResponse>(
    "/v1/users/password/forgot",
    payload
  );
  return data;
}

export async function resetPasswordApi(
  payload: ResetPasswordPayload
): Promise<void> {
  const { data } = await getApiClient().post("/v1/users/password/reset", payload);
  return data;
}

export async function verifyEmailApi(
  payload: VerifyEmailPayload
): Promise<VerifyEmailResponse> {
  const { data } = await getApiClient().post<VerifyEmailResponse>(
    "/v1/users/activate",
    payload
  );
  return data;
}
export async function ssoCheckApi(
  payload: Pick<LoginPayload, "email">
): Promise<SSOCheckResponse> {
  const { data } = await getApiClient().post<SSOCheckResponse>(
    "/v1/users/check-email",
    payload
  );
  return data;
}

export async function getUserInfoApi() {
  const { data } = await getApiClient().get<UserResponse>("/v1/users/userinfo");
  return data;
}

export async function createHubSpotApi(
  payload: any
): Promise<any> {
  const { data } = await getApiClient().post<any>("", payload, {
    baseURL: 'https://api.hsforms.com/submissions/v3/integration/submit/23980162/86782110-3546-4e90-bdfd-3b61b3f10fbb',
    headers: {}
  });
  return data;
}  

export async function createUserApi(
  payload: SignUpPayload
): Promise<SignupResponse> {
 const {data} =  await getApiClient().post<SignupResponse>("/v1/account", payload);
 return data;
}

export async function samlAuthenticationApi(payload : samlAuthenticationPayload) : Promise<samlAuthenticationResponse>{
  const {data} = await getApiClient().post<samlAuthenticationResponse>('/v1/saml/authenticate',payload)
  return data;
}
