export interface AvatarDetails {
    type: 'avatar';
    radius: number;
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
        bold: boolean;
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
