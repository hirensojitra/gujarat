export interface RectProperties {
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    opacity: number;
    originX: number;
    originY: number;
    rotate: number;

}

export interface CircleProperties {
    cx: number;
    cy: number;
    r: number;
    fill: string;
    opacity: number;
    originX: number;
    originY: number;

}

export interface EllipseProperties {
    cx: number;
    cy: number;
    rx: number;
    ry: number;
    fill: string;
    opacity: number;
    originX: number;
    originY: number;
    rotate: number;

}

export interface LineProperties {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    stroke: string;
    strokeWidth: number;
    opacity: number;
    originX: number;
    originY: number;
    rotate: number;

}

export interface FontStyle {
    italic: boolean;
    underline: boolean;
}

export interface Gradient {
    enable: false;
    startColor: string;
    endColor: string;
    direction: string;
}

export interface TextShadow {
    enable: boolean;
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
}

export interface TextEffects {
    enable: boolean,
    gradient: Gradient;
    outline: {
        enable: false;
        color: string;
        width: number;
    };
    glow: {
        enable: false;
        color: string;
        blur: number;
    };
}

export interface TextElement {
    x: number;
    y: number;
    fs: number;
    fw: string;
    text: string;
    color: string;
    fontStyle: FontStyle;
    textAlign: string;
    rotate: number;
    fontFamily: string;
    textShadow: TextShadow;
    backgroundColor: string;
    textEffects: TextEffects;
    textAnchor: string;
    alignmentBaseline: string;
    letterSpacing: number;
    lineHeight: number;
    textTransformation: string;
    opacity: number;
    originX: number;
    originY: number;
}

export interface SvgProperties {
    fill: string;
    stroke: string;
    strokeWidth: number;
}

export interface ImageElement {
    r: number;
    x: number;
    y: number;
    imageUrl: string;
    borderColor: string;
    borderWidth: number;
    shape: string;
    origin: string;
    placeholder: string;
    svgProperties: SvgProperties;
    rotate: number;
}

export interface PostDetails {
    id: string | null;
    deleted: boolean;
    info: string,
    h: number;
    w: number;
    title: string;
    backgroundurl: string;
    download_counter:number;
    data: {
        title: string;
        editable: boolean;
        boxed: boolean;
        rect?: RectProperties;
        circle?: CircleProperties;
        ellipse?: EllipseProperties;
        line?: LineProperties;
        text?: TextElement;
        image?: ImageElement;
    }[];
    msg?: string;
}
