import { getApiClient } from "@visitly/api-client";

export async function getOnboardingStatusApi() {
    const { data } = await getApiClient().get<any>("/v1/onboarding/selections");
    return data;
}
