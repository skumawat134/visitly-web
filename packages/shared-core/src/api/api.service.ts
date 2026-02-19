import { getApiClient } from "@visitly/api-client";
import type { UserResponse } from "./api.types";
export async function getUserInfoApi() {
  const { data } = await getApiClient().get<UserResponse>("/v1/users/userinfo");
  return data;
}