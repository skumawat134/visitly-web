export interface Cohost {
  cohostUserId: string;
  cohostEmail: string;
  cohostName: string;
}

export interface VisitorVisit {
  id: string;
  fullName: string;
  email: string;
  hostUserId: string;
  hostEmail: string;
  hostName: string;
  createdUserId: string;
  createdEmail: string;
  createdName: string;
  visitorType: string;
  visitorTypeId: string;
  companyName: string;
  phoneNumber: string;
  scheduleCheckinDate: string; // ISO Date string
  scheduleCheckoutDate: string; // ISO Date string
  orgId: string;
  orgName: string;
  siteId: string;
  siteName: string;
  createTime: string; // ISO Date string
  modifyTime: string; // ISO Date string
  notifyHostFlag: boolean;
  notifyVisitFlag: boolean;
  status: "ACTIVE" | "INACTIVE" | string;
  shouldPrefill: boolean;
  preregisterVisitCustomFieldModels: any[]; // Replace any if you have a specific custom field model
  groupName: string;
  internalNote: string;
  recurrenceType: "NONE" | "DAILY" | "WEEKLY" | string;
  parentVisitId: string;
  sendMail: boolean;
  cohosts: Cohost[];
  recurringParent: boolean;
}

export interface VisitorVisitResponse {
  results: VisitorVisit[];
  totalRecords: number;
}

export interface VisitorListParams {
  limit: number;
  offset: number;
  sort: 'ASC' | 'DESC' | string;
  sortBy: string;
  q: string;
  userId: string | undefined;
  siteId: string;
  groupName: string;
  visitorTypeId: string;
  scheduleCheckinStartDate: string;
  scheduleCheckinEndDate: string;
}

export interface VisitorFilters {
  siteId?: string;
  groupName?: string;
  visitorTypeId?: string;
  dateRange?: {
    startDate: Date | null;
    endDate: Date | null;
  };
}

export interface ColumnSetting {
  columnTitle: string,
  prop: string,
  isSelected: boolean,
  isDisabled: boolean,
  isSortable: boolean,
  width?: any,
  type: string
}
export const STORAGE_KEY = 'columnSettingsForUpcomingVisitors';

export const MEGA_LOCATION_FIELDS = ['Parking Lot', 'Point of Entry', 'Building'];

export const standardFields: ColumnSetting[] = [
  {
    columnTitle: 'Name',
    prop: 'fullName',
    isSelected: true,
    isDisabled: true,
    isSortable: true,
    type: 'Standard'
  },
  {
    columnTitle: 'Type',
    prop: 'visitorType',
    isSelected: true,
    isDisabled: false,
    isSortable: true,
    type: 'Standard'
  },
  {
    columnTitle: 'Host',
    prop: 'hostName',
    isSelected: true,
    isDisabled: false,
    isSortable: true,
    type: 'Standard'
  },
  {
    columnTitle: 'Location',
    prop: 'siteName',
    isSelected: true,
    isDisabled: false,
    isSortable: true,
    type: 'Standard',
    width: 200
  },
  {
    columnTitle: 'Company',
    prop: 'companyName',
    isSelected: true,
    isDisabled: false,
    isSortable: true,
    type: 'Standard'
  },
  {
    columnTitle: 'Group Name',
    prop: 'groupName',
    isSelected: false,
    isDisabled: false,
    isSortable: true,
    type: 'Standard'
  },
  {
    columnTitle: 'Phone',
    prop: 'phoneNumber',
    isSelected: false,
    isDisabled: false,
    isSortable: true,
    type: 'Standard',
    width: 125
  },
  {
    columnTitle: 'Point of Entry',
    prop: 'poeName',
    isSelected: false,
    isDisabled: false,
    isSortable: true,
    type: 'Standard',
    width: 125
  },
  {
    columnTitle: 'Parking Lot',
    prop: 'parkingLotName',
    isSelected: false,
    isDisabled: false,
    isSortable: true,
    type: 'Standard',
    width: 125
  },
  {
    columnTitle: 'Building',
    prop: 'buildingName',
    isSelected: false,
    isDisabled: false,
    isSortable: true,
    type: 'Standard',
    width: 125
  },
  {
    columnTitle: 'Pre-fill Status',
    prop: 'id',
    isSelected: true,
    isDisabled: false,
    isSortable: true,
    type: 'Standard',
    width: 125
  },
  {
    columnTitle: 'Internal Note',
    prop: 'internalNote',
    isSelected: false,
    isDisabled: false,
    isSortable: true,
    type: 'Standard',
    width: 125
  },
  {
    columnTitle: 'Email',
    prop: 'email',
    isSelected: false,
    isDisabled: false,
    isSortable: true,
    type: 'Standard',
    width: 125
  },
  {
    columnTitle: 'Scheduled Check-In Date',
    prop: 'scheduleCheckinDate',
    isSelected: true,
    isDisabled: true,
    isSortable: true,
    type: 'Standard'
  },
  {
    columnTitle: 'Action',
    prop: 'id',
    isSelected: true,
    isDisabled: true,
    isSortable: false,
    type: 'Standard'
  }
];

export interface VisitorsRowsType extends VisitorVisit {
  [key: string]: unknown;
}
export interface VisitorColumnType extends ColumnSetting {

}

export interface CustomFieldOption {
  id: string;
  label: string;
  value: string;
  displayOrder: number;
}

export interface CustomField {
  id: string;
  name: string;
  internalName: string;
  description: string;
  type: "TEXT";           // can be extended later: | "SELECT" | "DATE" etc.
  status: "ACTIVE";
  isDeleted: false;       // or boolean if you expect other values later
  orgName: string;
  options: CustomFieldOption[];
}

// Response is array of these objects
export type CustomFieldsApiResponse = CustomField[];

export interface Site {
  id: string;
  name: string;
  orgId: string;
  orgName: string;
  status: "ACTIVE" | "INACTIVE";
  country: string;
  language: string;

  allowWalkin: boolean;
  allowBadgePolling: boolean;
  allowEmployeeSignInFeature: boolean;
  allowSignInDuringOffBusinessHours: boolean;
  allowSignInOnPersonalDevice: boolean;

  backgroundCheckEntityField: string;
  backgroundCheckProvider: string;
  backgroundCheckPassedText: string;
  backgroundCheckFailedText: string;

  logoURI: string;
  bgImgURI: string;

  btnColor: string;
  btnTextColor: string;
  bgColor: string;
  textColor: string;
  footerTextColor: string;

  homeScreenMessage: string;
  purposeMessage: string;

  createdDate: string;
  modifiedDate: string;

  retentionPeriod: number;
  timezone: string;

  siteKey: string;
  theme: string;

  additionalLanguages: string[];

  visitWatchListEnabled: boolean;
  deliveryEnabledFlag: boolean;
  checkOutFlag: boolean;

  state: string;
}

export interface SitesResponse {
  results: Site[];
}

export interface VisitorField {
  id?: string;
  name?: string;
  type?: 'TEXT' | 'NUMBER' | 'REFERENCE';
  displayText?: string;
  setting?: 'MANDATORY' | 'OPTIONAL';
  editableFlag?: boolean;
  isSigninField?: boolean;
  status?: 'ACTIVE' | 'INACTIVE';
  index?: number;
  isPreregistrationOnly?: boolean;
  isMandatoryForPreregistration?: boolean;
  isEditableForVisit?: boolean;
}

export interface VisitorType {
  id: string; // required
  visitorType: string; // required
  description?: string;
  photoFlag?: boolean;
  printBadgeFlag?: boolean;
  orgTemplateId?: string;
  orgTemplateName?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  siteId?: string;
  fields?: VisitorField[];
  signOutFields?: VisitorField[];
  adminFields?: VisitorField[];
  docExpiryInDays?: number;
  issueGuestWifiCredentialsFlag?: boolean;
  isIdCapturingEnabled?: boolean;
  isDeleted?: boolean;
  idValidationPattern?: string;
}

export interface VisitorTypeResponse {
  results: VisitorType[],
  totalRecords: number
}

export interface VisitorTypeParams {
  siteId: string;
  status: string;
}


