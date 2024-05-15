import { Inject, Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TextElement } from '../interfaces/image-element';

@Injectable({
  providedIn: 'root'
})
export class SvgTextService {
  private renderer: Renderer2;

  constructor(private rendererFactory: RendererFactory2, @Inject(DOCUMENT) private document: any) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  createText(t: SVGGElement, textData: TextElement): SVGGElement {
    
    const { x, y, fs, fw, text, color, fontStyle, rotate, fontFamily, textShadow, backgroundColor, textEffects, textAnchor, alignmentBaseline, letterSpacing, lineHeight, textTransformation, originX, originY, opacity } = textData;

    const textAttributes = {
      'data-type': 'text',
      'x': x.toString(),
      'y': y.toString(),
      'font-size': fs.toString(),
      'fill': color || '#000000',
      'text-anchor': textAnchor || 'start',
      'alignment-baseline': alignmentBaseline || 'middle',
      'dominant-baseline': 'reset-size',
      'font-family': fontFamily ? "'" + fontFamily + "', sans-serif" : "'Hind Vadodara', sans-serif",
      'font-weight': fw || '400',
      'text-decoration': fontStyle.underline ? 'underline' : 'none',
      'font-style': fontStyle.italic ? 'italic' : 'normal',
      'opacity': opacity ? opacity.toString() : '100',
    };

    // Apply text shadow if available
    if (textShadow && textShadow.enable) {
      textAttributes['filter'] = `drop-shadow(${textShadow.offsetX}px ${textShadow.offsetY}px ${textShadow.blur}px ${textShadow.color})`;
    }

    // Apply background color if available
    if (backgroundColor) {
      textAttributes['background-color'] = backgroundColor;
    }

    // Apply other text styles
    const textStyles = {
      '-webkit-user-select': 'none',
      'letter-spacing': letterSpacing ? `${letterSpacing}px` : '0',
      'line-height': lineHeight ? `${lineHeight}` : '1.5',
      'text-transform': textTransformation || 'none'
    };

    // Set attributes and styles
    Object.entries(textAttributes).forEach(([key, value]) => this.renderer.setAttribute(t, key, value));
    Object.entries(textStyles).forEach(([key, value]) => this.renderer.setStyle(t, key, value));

    // Add text content if available
    if (text) {
      const lines = this.textFormat(text);
      lines.forEach((line, idx) => {
        const tspanElement = this.renderer.createElement('tspan', 'http://www.w3.org/2000/svg');
        this.renderer.appendChild(tspanElement, this.renderer.createText(line.trim()));
        if (idx > 0 || (idx === 0 && line.trim() === '')) {
          const dyOffset = fs * (lineHeight || 1.5) || 0;
          this.renderer.setAttribute(tspanElement, 'dy', `${dyOffset}px`);
        }
        this.renderer.setAttribute(tspanElement, 'x', x.toString());
        this.renderer.appendChild(text, tspanElement);
      });
    }

    // Apply rotation if specified
    if (rotate || (originX !== undefined && originY !== undefined)) {
      const bbox = t.getBBox();
      const width = bbox.width;
      const height = bbox.height;
      const transformValue = `rotate(${rotate || 0} ${x + width / 2} ${y + height / 2})`;
      this.renderer.setAttribute(t, 'transform', transformValue);
    }
    return t;
  
  }

  private textFormat(text: string): string[] {
    // Your text formatting logic here
    return text.split('\n');
  }
}
