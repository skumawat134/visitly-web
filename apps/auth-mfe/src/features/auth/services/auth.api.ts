import { getApiClient } from "@visitly/api-client";
import { LoginPayload, LoginResponse, SSOCheckResponse } from "../types/auth.types";

export async function loginApi(
  payload: LoginPayload
): Promise<LoginResponse> {
  const { data } = await getApiClient().post<LoginResponse>(
    "/users/authenticate",
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