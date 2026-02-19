import { getApiClient } from '@visitly/api-client';
import type { ProfileResponse, UpdateProfilePicturePayload } from './profile.types';

export async function getUserProfile(): Promise<ProfileResponse> {
    const { data } = await getApiClient().get<ProfileResponse>('/v1/users/userinfo');
    return data;
}

export async function updateProfilePicture(userId: string, payload: UpdateProfilePicturePayload): Promise<any> {
    const { data } = await getApiClient().patch(`/v1/users/${userId}`, payload);
    return data;
}
