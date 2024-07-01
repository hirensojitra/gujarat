import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { CircleProperties } from '../interfaces/image-element';
import { DOCUMENT } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class SvgCircleService {
    private renderer: Renderer2;

    constructor(rendererFactory: RendererFactory2, @Inject(DOCUMENT) private document: any) {
        this.renderer = rendererFactory.createRenderer(null, null);
    }

    createCircle(circleData: CircleProperties): SVGCircleElement {
        const circle: SVGCircleElement = this.renderer.createElement('circle', 'svg');
        const { cx, cy, r, fill, fillOpacity, opacity, stroke, strokeWidth, strokeOpacity, strokeAlignment } = circleData;
        
        this.renderer.setAttribute(circle, 'cx', String(cx));
        this.renderer.setAttribute(circle, 'cy', String(cy));
        this.renderer.setAttribute(circle, 'r', String(r));
        this.renderer.setAttribute(circle, 'data-type', 'circle');
        this.renderer.setAttribute(circle, 'fill', fill);
        this.renderer.setAttribute(circle, 'opacity', String(opacity));
        if (fillOpacity !== undefined) {
            this.renderer.setAttribute(circle, 'fill-opacity', String(fillOpacity));
        }
        if (stroke !== undefined) {
            this.renderer.setAttribute(circle, 'stroke', String(stroke));
        }
        if (strokeWidth !== undefined) {
            this.renderer.setAttribute(circle, 'stroke-width', String(strokeWidth));
        }
        if (strokeOpacity !== undefined) {
            this.renderer.setAttribute(circle, 'stroke-opacity', String(strokeOpacity));
        }
        if (strokeAlignment !== undefined) {
            this.renderer.setAttribute(circle, 'stroke-alignment', String(strokeAlignment));
        }
        return circle;
    }
}
