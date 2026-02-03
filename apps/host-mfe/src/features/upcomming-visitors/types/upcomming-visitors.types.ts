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
    userId: string;
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
const standardFields: ColumnSetting[] = [
    {
      columnTitle: 'Name',
      prop: 'fullName',
      isSelected: true,
      isDisabled: true,
      isSortable: false,
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
      isSelected: true,
      isDisabled: false,
      isSortable: true,
      type: 'Standard'
    },
    {
      columnTitle: 'Phone',
      prop: 'phoneNumber',
      isSelected: true,
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
    // {
    //   columnTitle: 'ID Validation',
    //   prop: 'idVerificationStatus',
    //   isSelected: false,
    //   isDisabled: false,
    //   isSortable: true,
    //   type: 'Standard',

    // },
    // {
    //   columnTitle: 'Offender Check',
    //   prop: 'offenderCheckStatus',
    //   isSelected: false,
    //   isDisabled: false,
    //   isSortable: true,
    //   type: 'Standard',

    // },
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
    },
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