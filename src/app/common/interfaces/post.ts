export interface AvatarDetails {
    imageUrl?: string;
    type: 'avatar';
    r: any;
    borderwidth: number;
    bordercolor: string;
    x: number;
    y: number;
}

export interface TextDetails {
    text?: any;
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
    color: string;
}

export interface TextGroupDetails {
    type: 'text_group';
    data: TextDetails[];
}

export interface PostDetails {
    w: number;
    h: number;
    backgroundUrl: string;
    data: TextDetails[] | AvatarDetails[] | TextGroupDetails[];
}

export interface Post {
    type: 'post';
    id?: string,
    details: PostDetails;
}
