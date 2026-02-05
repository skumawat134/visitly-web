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

export interface VisitorField {
  id: string;
  name: string;
  type: "TEXT" | "DROPDOWN" | "NUMBER" | "DATE" | string;
  required?: boolean;
}



export interface VisitorType {
  id: string;
  siteId: string;

  visitorType: string;
  description: string;
  status: "ACTIVE" | "INACTIVE";

  isDeleted: boolean;
  showOnIpad: boolean;

  backgroundCheckEnabled: boolean;
  offenderCheck: boolean;

  photoFlag: boolean;
  printBadgeFlag: boolean;
  issueGuestWifiCredentialsFlag: boolean;

  idValidation: boolean;
  isIdCapturingEnabled: boolean;

  docExpiryInDays: number;

  fields: VisitorField[];
  adminFields: VisitorField[];
  signOutFields: VisitorField[];
}

export interface VisitorTypesResponse {
  results: VisitorType[];
}

export interface UserRole {
  id: string;
  role: 'HOST' | 'EMPLOYEE' | 'ADMIN' | string;
  allSitesFlag: boolean;
}

export interface User {
  id: string;

  firstName: string;
  lastName: string;
  email: string;

  status: 'ACTIVE' | 'INACTIVE' | string;

  roles: UserRole[];

  // Contact info
  mobilePhone?: string;
  mobilePhoneCountryCode?: string;
  workPhone?: string;
  workPhoneCountryCode?: string;
  extension?: string;

  // Org / identity
  employeeId?: string;
  externalId?: string;
  department?: string;
  title?: string;

  // Flags
  allowSigninFlag: boolean;
  skipHostNotification: boolean;
  emailVerified: boolean;
  deleted: boolean;

  // Timestamps
  createTime: string;   // ISO date string
  modifyTime: string;   // ISO date string
}

export interface UsersResponse {
  results: User[];
}


export type Status = 'ACTIVE' | 'INACTIVE';

export type PreregistrationFieldType =
  | 'TEXT'
  | 'NUMBER'
  | 'DROPDOWN'
  | 'RADIO'
  | 'REFERENCE'
  | 'DATEPICKER';

export type FieldSetting = 'MANDATORY' | 'OPTIONAL';
export interface PreregistrationFieldOption {
  id: string;
  label: string;
  value: string;
  displayOrder: number;
}

export interface PreregistrationFieldConfig {
  id: string;
  name: string;
  type: PreregistrationFieldType;
  displayText: string;
  setting: FieldSetting;

  editableFlag: boolean;
  isSigninField: boolean;
  status: Status;
  index: number;

  isPreregistrationOnly: boolean;
  isMandatoryForPreregistration: boolean;
  isEditableForVisit: boolean;

  orgCustomFieldId?: string;
  options?: PreregistrationFieldOption[];
}

export interface PreregistrationVisitorTypeConfig {
  id: string;
  visitorType: string;

  orgBadgeConfigId: string;
  orgBadgeName: string;
  description: string;

  photoFlag: boolean;
  printBadgeFlag: boolean;
  orgTemplateId: string;
  orgTemplateName: string;

  status: Status;
  siteId: string;

  fields: PreregistrationFieldConfig[];
}
