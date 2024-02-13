export interface RectProperties {
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    opacity: number;
    originX: number;
    originY: number;
    rotation: number;
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
    rotation: number;
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
    rotation: number;
}

export interface FontStyle {
    italic: boolean;
    underline: boolean;
}

export interface Gradient {
    startColor: string;
    endColor: string;
    direction: string;
}

export interface TextShadow {
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
}

export interface TextEffects {
    gradient: Gradient;
    outline: {
        color: string;
        width: number;
    };
    glow: {
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
    textAlignment: string;
    letterSpacing: number;
    lineHeight: number;
    textTransformation: string;
    staticValue: boolean;
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
}

export interface PostDetails {
    id: number;
    deleted: boolean;
    h: number;
    w: number;
    title: string;
    backgroundUrl: string;
    data: ({
        title: string;
        rect?: RectProperties;
        circle?: CircleProperties;
        ellipse?: EllipseProperties;
        line?: LineProperties;
        text?: TextElement;
        image?: ImageElement;
    })[];
}