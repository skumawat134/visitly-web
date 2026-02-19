export interface UserProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    mobilePhone?: string;
    workPhone?: string;
    extension?: string;
    createTime: string;
    status: 'ACTIVE' | 'INACTIVE';
    title?: string;
    department?: string;
    employeeId?: string;
    avatarUri?: string;
    orgId?: string;
}

export interface UpdateProfilePicturePayload {
    avatarImageBase64String: string;
}

export interface ProfileResponse extends UserProfile { }
