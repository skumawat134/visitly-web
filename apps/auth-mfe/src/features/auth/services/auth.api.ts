import { getApiClient } from "@visitly/api-client";
import { LoginPayload, LoginResponse, ConfirmEmailPayload , ConfirmEmailResponse, ForgotPasswordPayload, ForgotPasswordResponse,
  VerifyEmailPayload , VerifyEmailResponse , ResetPasswordPayload , SSOCheckResponse,
  UserResponse
  } from "../types/auth.types";

export async function loginApi(
  payload: LoginPayload
): Promise<LoginResponse> {
  const { data } = await getApiClient().post<LoginResponse>(
    "/users/authenticate",
    payload
  );
  return data;
}

export async function confirmEmailApi(
  payload: ConfirmEmailPayload
): Promise<ConfirmEmailResponse> {
  const { data } = await getApiClient().post<ConfirmEmailResponse>(
    "/users/confirm",
    payload
  );
  return data;
}

export async function forgotPassword(
  payload: ForgotPasswordPayload
): Promise<ForgotPasswordResponse> {
  console.log("forgotPassword called with payload:", payload);
  const { data } = await getApiClient().post<ForgotPasswordResponse>(
    "/users/password/forgot",
    payload
  );
  return data;
}

export async function resetPasswordApi(
  payload: ResetPasswordPayload
): Promise<void> {
 const {data} =  await getApiClient().post("/users/password/reset", payload);
 return data;
}

export async function verifyEmailApi(
  payload: VerifyEmailPayload
): Promise<VerifyEmailResponse> {
  const { data } = await getApiClient().post<VerifyEmailResponse>(
    "/users/verify-email",
    payload
  );
  return data;
}
export async function ssoCheckApi(
    payload: Pick<LoginPayload , "email">
  ): Promise<SSOCheckResponse> {
    const { data } = await getApiClient().post<SSOCheckResponse>(
      "/users/check-email",
      payload
    );
    return data;
  }

  export async function getUserInfoApi (){
    const { data } = await getApiClient().get<UserResponse>("/users/userinfo"  );
    return data;
  }