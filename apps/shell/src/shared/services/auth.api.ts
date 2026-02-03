import type { UserResponse } from "@/shared/types/auth.types";
import { getApiClient } from "@visitly/api-client";

export async function getUserInfoApi() {
  const { data } = await getApiClient().get<UserResponse>("/v1/users/userinfo");
  return data;
}