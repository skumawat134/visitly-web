import type { UserResponse } from "@/shared/types/auth.types";
import { getApiClient } from "@visitly/api-client";

export async function getUserInfoApi() {
  const { data } = await getApiClient().get<UserResponse>("/v1/users/userinfo");
  return data;
}

export async function logoutApi(): Promise<any> {
    const { data } = await getApiClient().post('/v1/users/logout', {});
    return data;
}