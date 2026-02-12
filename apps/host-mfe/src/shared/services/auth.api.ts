import { getApiClient } from "@visitly/api-client";



export async function logoutApi(): Promise<any> {
    const { data } = await getApiClient().post('/v1/users/logout', {});
    return data;
}