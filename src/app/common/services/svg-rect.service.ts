import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { RectProperties } from '../interfaces/image-element';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SvgRectService {
  private renderer: Renderer2;

  constructor(rendererFactory: RendererFactory2, @Inject(DOCUMENT) private document: any) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  createRect(rect: SVGGElement, rectData: RectProperties): SVGGElement {
    const { x, y, width, height, rx, ry, fill, fillOpacity, opacity, rotate, originX, originY, stroke, strokeWidth, strokeAlignment, strokeOpacity } = rectData;
    this.renderer.setAttribute(rect, 'x', String(x));
    this.renderer.setAttribute(rect, 'y', String(y));
    this.renderer.setAttribute(rect, 'width', String(width));
    this.renderer.setAttribute(rect, 'height', String(height));

    if (rx !== undefined) {
      this.renderer.setAttribute(rect, 'rx', String(rx));
    }
    if (ry !== undefined) {
      this.renderer.setAttribute(rect, 'ry', String(ry));
    }
    if (fill !== undefined) {
      this.renderer.setAttribute(rect, 'fill', fill);
    }
    if (fillOpacity !== undefined) {
      this.renderer.setAttribute(rect, 'fill-opacity', String(fillOpacity));
    }
    if (opacity !== undefined) {
      this.renderer.setAttribute(rect, 'opacity', String(opacity));
    }
    if (rotate !== undefined || (originX !== undefined && originY !== undefined)) {
      const transformValue = `rotate(${rotate || 0} ${x + width / 2} ${y + height / 2})`;
      this.renderer.setAttribute(rect, 'transform', transformValue);
    }
    if (stroke !== undefined) {
      this.renderer.setAttribute(rect, 'stroke', stroke);
    }
    if (strokeOpacity !== undefined) {
      this.renderer.setAttribute(rect, 'stroke-opacity', String(strokeOpacity));
    }
    if (strokeWidth !== undefined) {
      this.renderer.setAttribute(rect, 'stroke-width', String(strokeWidth));
    }
    if (strokeAlignment !== undefined) {
      this.renderer.setAttribute(rect, 'stroke-alignment', strokeAlignment);
    }

    this.renderer.setAttribute(rect, 'data-type', 'rect');
    return rect;

  }
}