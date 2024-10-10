export interface User {
    id: string;
    username: string;
    email: string;
    roles: string;
    emailVerified: boolean;
    image: string;
    firstName: string;
    lastName: string;
    mobile: string;
    districtId: number;
    talukaId: number;
    villageId: number;
    isDeleted: boolean;
    verificationToken: string;
    tokenExpiration: string;
    [key: string]: any
}

export interface District {
    id: string,
    name: string,
    gu_name?: string,
    is_deleted: boolean
}
export interface Taluka {
    id: string,
    name: string,
    gu_name?: string,
    district_id: string,
    is_deleted: boolean
}
export interface Village {
    id: string,
    name: string,
    gu_name?: string,
    district: string,
    district_name: string,
    district_gu_name: string,
    taluka: string,
    taluka_name: string,
    taluka_gu_name: string,
    hasMember?: boolean
    [key: string]: any,
    is_deleted: boolean
}

export interface selectKey {
    id: string;
    name: string;
}
