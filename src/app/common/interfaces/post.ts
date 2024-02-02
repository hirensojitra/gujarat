export interface AvatarDetails {
    type: 'avatar';
    r: number;
    borderwidth: number;
    bordercolor: string;
    x: number;
    y: number;
}

export interface TextDetails {
    type: string;
    x: number;
    y: number;
    fs: number;
    fw: string;
    fontStyle: {
        italic: boolean;
        underline: boolean;
    };
    textAlign: string;
}

export interface TextGroupDetails {
    type: 'text_group';
    data: TextDetails[];
}

export interface PostDetails {
    w: number;
    h: number;
    backgroundUrl: string;
    data: (AvatarDetails | TextDetails | TextGroupDetails)[];
}

export interface Post {
    type: 'post';
    id?:string,
    details: PostDetails;
}
