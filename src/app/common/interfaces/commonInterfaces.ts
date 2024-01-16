export interface User {
    username: string;
    email: string;
    roles: string;
    image: any;
    firstName: string;
    lastName: string;
    mobile: string;
    district: string,
    taluka: string,
    village: string,
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
    'district-name': string,
    taluka: string,
    'taluka-name': string,
    hasMember?: boolean
    [key: string]: any
}

export interface selectKey {
    id: string;
    name: string;
}
