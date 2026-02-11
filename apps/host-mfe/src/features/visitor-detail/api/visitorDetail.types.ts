export interface VisitorDetail {
    id: string;
    fullName: string;
    email: string;
    phoneNumber?: string;
    companyName?: string;
    visitorType?: string;
    siteName?: string;
    siteId?: string;
    visitPhotoURI?: string;
    scheduleCheckinDate?: string;
    scheduleCheckoutDate?: string;
    visitStatus?: string;
    groupName?: string;
    internalNote?: string;
    recurrenceType?: string;
    status?: string;
    shouldPrefill?: boolean;
    createdName?: string;
    parentVisitId?: string;
    visitInfoModel?: { id: string };
    videoWatched?: string;
    idVerificationStatus?: string;
    offenderCheckStatus?: string;
    guestWifiPassword?: string;
    guestWifiSSID?: string;
    visitSignedDocsInfos?: SignedDocInfo[];
    visitCustomFields?: CustomField[];
    preregisterVisitCustomFieldModels?: CustomField[];
    parkingLotName?: string;
    poeName?: string;
    buildingName?: string;
    visitSignoutCustomFields?: CustomField[];
    cohosts?: any[];
    visitorWatchModelList?: VisitorWatchModel[];
    hostName?: string;
    hostEmail?: string;
    checkinTime?: string;
    checkoutTime?: string;
}

export interface VisitorWatchModel {
    watchGroupType: 'VISIT_FIELD' | 'PAST_VISIT' | 'PHOTO_FACEID' | 'ID_VALIDATION';
    keyName: string;
    value: string;
    imageUrl?: string;
    siteId?: string;
    watchlistRuleDescription?: string;
}

export interface SignedDocInfo {
    orgDocTemplateName: string;
    signedDocUri: string;
}

export interface CustomField {
    name: string;
    value: string;
    status?: string;
    fid?: string;
    type?: string;
    setting?: string;
    options?: any[];
    isEdit?: boolean;
}

export interface OffenderDetail {
    status: string;
    offenderInformationCheckDetails: any[];
}

export interface IdValidationDetail {
    status: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    issueDate?: string;
    expiryDate?: string;
    idType?: string;
    idFrontImgUri?: string;
    idBackImgUri?: string;
}

export interface NotificationLog {
    id: string;
    type: string;
    recipient: string;
    status: string;
    createTime: string;
}

export interface VisitNote {
    noteId?: string;
    userId?: string;
    userName?: string;
    createdBy?: string;
    userEmail?: string;
    noteText?: string;
    createdDate: string;
    modifiedDate?: string;
};
