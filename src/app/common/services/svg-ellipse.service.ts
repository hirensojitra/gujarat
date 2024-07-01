import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { EllipseProperties } from '../interfaces/image-element';

@Injectable({
    providedIn: 'root'
})
export class SvgEllipseService {
    private renderer: Renderer2;

    constructor(rendererFactory: RendererFactory2, @Inject(DOCUMENT) private document: any) {
        this.renderer = rendererFactory.createRenderer(null, null);
    }

    createEllipse(ellipseData: EllipseProperties): SVGEllipseElement {
        const ellipse: SVGEllipseElement = this.renderer.createElement('ellipse', 'svg');
        const { cx, cy, rx, ry, fill, opacity, rotate } = ellipseData;

        this.renderer.setAttribute(ellipse, 'cx', String(cx));
        this.renderer.setAttribute(ellipse, 'cy', String(cy));
        this.renderer.setAttribute(ellipse, 'rx', String(rx));
        this.renderer.setAttribute(ellipse, 'ry', String(ry));
        this.renderer.setAttribute(ellipse, 'fill', fill);
        this.renderer.setAttribute(ellipse, 'opacity', String(opacity));
        this.renderer.setAttribute(ellipse, 'transform', `rotate(${rotate} ${cx} ${cy})`);
        this.renderer.setAttribute(ellipse, 'data-type', 'ellipse');

        return ellipse;
    }
}
