// features/pre-registration/types/index.ts
export interface VisitorType {
  id: string;
  visitorType: string;
}

export interface Site {
  id: string;
  name: string;
}

export interface Host {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface VisitorTypeField {
  fid: string;
  name: string;
  isPreregistrationOnly: boolean;
  isMandatoryForPreregistration: boolean;
  type: string;
  value: any;
  options?: any[];
  orgCustomFieldId?: string;
  displayText?: string;
  availableSpots?: number;
  totalSpots?: number;
  id: string;
  status: string;
  setting: string;
}

export interface PreRegistrationForm {
  siteId: string;
  visitorTypeId: string;
  scheduleCheckinDate: Date | null;
  scheduleCheckoutDate: Date | null;
  recurrenceType: string;
  recurrenceEndDateOnly: Date | null;
  checkoutTimeOnly: string | null;
  hostUserId: string | null;
  groupName: string;
  internalNote: string;
  notifyVisitFlag: boolean;
  notifyHostFlag: boolean;
  parentVisitId?: string;
  cohostUserIds: string[];
  preregisterVisitCustomFieldModels: Array<{
    name: string;
    orgCustomFieldId: string;
    visitTypeFieldId: string;
    value: any;
  }>;
  // Add more fields as needed
}