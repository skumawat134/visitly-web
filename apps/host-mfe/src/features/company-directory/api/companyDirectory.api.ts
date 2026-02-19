import { getApiClient } from '@visitly/api-client';
import type {
    CompanyDirectoryResponse,
    companyDirectoryUserRecordQueryParams,
    companyDirectoryUserRecord
} from './companyDirectory.types';

export async function getCompanyDirectoryUsers(params: companyDirectoryUserRecordQueryParams): Promise<CompanyDirectoryResponse> {
    const { data } = await getApiClient().get<CompanyDirectoryResponse>('/v1/users', { params });
    return data;
}

export async function getCompanyDirectoryUserDetail(userId: string): Promise<companyDirectoryUserRecord> {
    const { data } = await getApiClient().get<companyDirectoryUserRecord>(`/v1/users/${userId}`);
    return data;
}
