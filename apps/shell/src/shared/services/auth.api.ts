import { UserResponse } from "@/shared/types/auth.types";
import { getApiClient } from "@visitly/api-client";

export async function getUserInfoApi() {
  const { data } = await getApiClient().get<UserResponse>("/users/userinfo");
  return data;
}