import { getApiClient } from "@visitly/api-client";
import { LoginPayload, LoginResponse } from "../types/auth.types";

export async function loginApi(
  payload: LoginPayload
): Promise<LoginResponse> {
  const { data } = await getApiClient().post<LoginResponse>(
    "/auth/login",
    payload
  );
  return data;
}
