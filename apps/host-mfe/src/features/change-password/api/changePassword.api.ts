import { getApiClient } from '@visitly/api-client';
import type { ChangePasswordPayload, ChangePasswordResponse } from './changePassword.types';

export async function changePassword(payload: ChangePasswordPayload): Promise<ChangePasswordResponse> {
    const { data } = await getApiClient().post<ChangePasswordResponse>('/v1/users/password/change', payload);
    return data;
}
