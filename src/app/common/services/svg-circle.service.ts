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

    createCircle(c: SVGGElement, circleData: CircleProperties): SVGGElement {
        const { cx, cy, r, fill, fillOpacity, opacity, stroke, strokeWidth, strokeOpacity, strokeAlignment } = circleData;
        this.renderer.addClass(c, 'pointer-events-none');
        this.renderer.setAttribute(c, 'cx', String(cx));
        this.renderer.setAttribute(c, 'cy', String(cy));
        this.renderer.setAttribute(c, 'r', r.toString());
        this.renderer.setAttribute(c, 'data-type', 'circle');
        this.renderer.setAttribute(c, 'fill', fill);
        this.renderer.setAttribute(c, 'opacity', String(opacity));
        if (fillOpacity !== undefined) {
            this.renderer.setAttribute(c, 'fill-opacity', String(fillOpacity));
        }
        if (stroke !== undefined) {
            this.renderer.setAttribute(c, 'stroke', String(stroke));
        }
        if (strokeWidth !== undefined) {
            this.renderer.setAttribute(c, 'stroke-width', String(strokeWidth));
        }
        if (strokeOpacity !== undefined) {
            this.renderer.setAttribute(c, 'stroke-opacity', String(strokeOpacity));
        }
        if (strokeAlignment !== undefined) {
            this.renderer.setAttribute(c, 'stroke-alignment', String(strokeAlignment));
        }
        return c
    }
}