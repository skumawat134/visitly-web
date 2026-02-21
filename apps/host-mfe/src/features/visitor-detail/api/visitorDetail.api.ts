import { getApiClient } from "@visitly/api-client";
import type {
  VisitorDetail,
  OffenderDetail,
  IdValidationDetail,
  NotificationLog,
  VisitNote,
  CustomField
} from "./visitorDetail.types";

// 1️⃣ For Pre-Registrations
export async function getPreRegistrationDetail(id: string): Promise<VisitorDetail> {
  const endpoint = `/v1/host/preregistrations/${id}`;
  const { data } = await getApiClient().get<VisitorDetail>(endpoint);
  return data
  return {
    ...data,
    visitCustomFields: buildCustomFields(data.preregisterVisitCustomFieldModels, data), // normalized field for UI
  };
}



// 2️⃣ For Visits (Prefill case)
export async function getVisitDetail(id: string): Promise<VisitorDetail> {
  const endpoint = `/v1/visits/${id}`;
  const { data } = await getApiClient().get<VisitorDetail>(endpoint);
  return data
  return {
    ...data,
    visitCustomFields: buildCustomFields(data.visitCustomFields, data), // normalized field for UI
  };
}



export async function getOffenderDetails(visitId: string): Promise<OffenderDetail | null> {
  try {
    const { data } = await getApiClient().get<any[]>(`/v1/offenderCheck/visit/${visitId}`);
    return {
      status: data.find(val => val.latestFlag === true)?.status || "No Status",
      offenderInformationCheckDetails: data.find(val => val.latestFlag === true)?.offenderInformationCheckDetails || []
    };
  } catch (error) {
    console.error("Error fetching offender details:", error);
    return null;
  }
}


export async function getIdValidationDetails(visitId: string): Promise<IdValidationDetail | null> {
  try {
    const { data } = await getApiClient().get<any[]>(`/v1/identity/visit/${visitId}`);
    return data.find(val => val.latestFlag === true) || null;
  } catch (error) {
    console.error("Error fetching ID validation details:", error);
    return null;
  }
}

export async function getNotificationLogs(visitId: string): Promise<NotificationLog[]> {
  try {
    const { data } = await getApiClient().get<{ results: NotificationLog[] }>(`/v1/visits/${visitId}/notifications`);
    return data.results || [];
  } catch (error) {
    console.error("Error fetching notification logs:", error);
    return [];
  }
}

export async function getVisitNotes(visitId: string): Promise<VisitNote[]> {
  try {
    const { data } = await getApiClient().get<{ results: VisitNote[] }>(`/v1/visits/${visitId}/notes`);
    return data.results || [];
  } catch (error) {
    console.error("Error fetching visit notes:", error);
    return [];
  }
}

export type CancelUpdateType =
  | "SELECTED_VISIT"
  | "FUTURE_VISITS_ONLY"
  | "ALL_VISITS";

export async function cancelPreRegistration(
  id: string,
  params: {
    notifyVisitFlag: boolean;
    notifyHostFlag: boolean;
    updateType: CancelUpdateType
  }
): Promise<void> {
  const { updateType, ...body } = params;
  const endpoint = `/v1/host/preregistrations/${id}?updateType=${updateType}`;
  await getApiClient().patch(endpoint, {
    ...body,
    status: "CANCELLED",
  });
}

function buildCustomFields(data1: any, data: any): CustomField[] {
  const fields: CustomField[] = [...(data1 || [])];

  if (data.parkingLotName) {
    fields.push({
      name: "Parking Lot",
      value: data.parkingLotName,
      isEdit: false,
    });
  }

  if (data.poeName) {
    fields.push({
      name: "Point of Entry",
      value: data.poeName,
      isEdit: false,
    });
  }

  if (data.buildingName) {
    fields.push({
      name: "Building",
      value: data.buildingName,
      isEdit: false,
    });
  }

  return fields;
}
