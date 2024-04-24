import { Directive, Input, ElementRef, OnInit, Renderer2, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { Subject, takeUntil, timer } from 'rxjs';
import * as opentype from 'opentype.js';

import {
  PostDetails,
  RectProperties,
  CircleProperties,
  EllipseProperties,
  LineProperties,
  TextElement,
  ImageElement,
  SvgProperties,
  TextShadow
} from '../interfaces/image-element';
import ColorThief from 'colorthief';
import { FontService } from '../services/fonts.service';

interface Data {
  title: string;
  editable: boolean;
  boxed: boolean;
  rect?: RectProperties;
  circle?: CircleProperties;
  ellipse?: EllipseProperties;
  line?: LineProperties;
  text?: TextElement;
  image?: ImageElement;
}

@Directive({
  selector: '[svgProcessor]'
})
export class SvgProcessorDirective implements OnInit, AfterViewInit {
  offsetX: number = 0;
  offsetY: number = 0;
  width: number = 0;
  height: number = 0;
  defaultValue!: PostDetails;
  private postDataSetSubject = new Subject<PostDetails>();
  @Input() loadOnly!: PostDetails;
  private destroy$ = new Subject<void>();
  @Input() set postDataSet(value: PostDetails) {
    this.postDataSetSubject.next(value);
    this.defaultValue = value;
  }
  postDataSet$ = this.postDataSetSubject.asObservable();

  @Output() dataChanges = new EventEmitter<{ data: Data, index: number }>();
  @Output() getSelected = new EventEmitter<{ index: number }>();
  postData!: PostDetails;
  data: Data[] = [];
  dataLoaded: boolean = false;
  firstLoad: boolean = true;
  private eventListeners: (() => void)[] = [];
  constructor(private el: ElementRef<SVGSVGElement>, private renderer: Renderer2, private fontService: FontService) {

  }
  get dataArray(): Data[] {
    return this.data;
  }

  getFontPath(fontFamily: string, fontWeight: string): string {
    return this.fontService.getFontPath(fontFamily, fontWeight);
  }
  async updateBackGround(backgroundurl: string) {
    if (backgroundurl) {
      const svg = this.el.nativeElement;
      const background = await this.getImageDataUrl(backgroundurl);
      const b = this.renderer.createElement('image', 'http://www.w3.org/2000/svg');
      this.renderer.setAttribute(b, 'x', '0');
      this.renderer.setAttribute(b, 'data-type', 'background-img');
      this.renderer.setAttribute(b, 'y', '0');
      this.renderer.setAttribute(b, 'width', '100%'); // Set width to 100%
      this.renderer.setAttribute(b, 'height', '100%'); // Set height to 100%
      this.renderer.setAttribute(b, 'preserveAspectRatio', 'xMidYMid slice'); // Use slice to cover and maintain aspect ratio
      this.renderer.setAttribute(b, 'href', background);
      this.renderer.listen(b, 'click', (event) => {
        this.getSelected.emit({ index: -1 })
      });
      const firstChild = svg.firstChild;
      if (firstChild) {
        svg.insertBefore(b, firstChild);
        firstChild.nodeName === 'image' && firstChild.remove();
      } else {
        svg.appendChild(b);
      }
      await this.getColors(backgroundurl);
    }
  }
  colorSet: string[] = [];
  async getColors(image: string): Promise<void> {
    try {
      const colorThief = new ColorThief();
      const img = new Image();
      img.src = image;
      img.crossOrigin = "Anonymous";
      let colorCounts = 10;
      img.onload = () => {
        const dominantColors = colorThief.getPalette(img, colorCounts);
        this.colorSet = dominantColors.map((rgb: number[]) => this.rgbToHex(rgb[0], rgb[1], rgb[2]));
        this.colorSet.unshift('#000000', '#FFFFFF');
      };
      // img.onerror = (error) => {
      //     console.error("Error loading image:", error);
      // };
    } catch (error) {
      console.error("Error getting colors:", error);
    }
  }
  rgbToHex(r: number, g: number, b: number): string {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  updateViewBox(x: number, y: number) {
    if (this.el.nativeElement) {
      const svg = this.el.nativeElement;
      const viewBoxValue = `0 0 ${x} ${y}`;
      svg.setAttribute('viewBox', viewBoxValue);
    }
  }
  createRect(d: Data, i: number) {
    if (this.el.nativeElement && d.rect) {
      const svg = this.el.nativeElement;
      const rect = this.renderer.createElement('rect', 'http://www.w3.org/2000/svg');
      const { x, y, width, height, fill, opacity, originX, originY, rotate } = d.rect;

      // Set attributes using an object
      this.renderer.setAttribute(rect, 'x', String(x));
      this.renderer.setAttribute(rect, 'y', String(y));
      this.renderer.setAttribute(rect, 'width', String(width));
      this.renderer.setAttribute(rect, 'height', String(height));
      this.renderer.setAttribute(rect, 'fill', fill);
      this.renderer.setAttribute(rect, 'opacity', String(opacity));

      // Apply rotate and origin if specified
      if (rotate || (originX !== undefined && originY !== undefined)) {
        const transformValue = `rotate(${rotate || 0} ${x + width / 2} ${y + height / 2})`;
        this.renderer.setAttribute(rect, 'transform', transformValue);
      }

      // Set additional attributes if needed

      this.renderer.setAttribute(rect, 'data-type', 'rect');
      this.renderer.appendChild(svg, rect);
      return rect;
    }
    return null;
  }

  createCircle(d: Data, i: number) {
    if (this.el.nativeElement && d.circle) {
      const svg = this.el.nativeElement;
      const c = this.renderer.createElement('circle', 'http://www.w3.org/2000/svg');
      const { cx, cy, r, fill, opacity } = d.circle; // Assuming cx, cy, r, and fill are properties of the circle
      this.renderer.setAttribute(c, 'cx', String(cx));
      this.renderer.setAttribute(c, 'cy', String(cy));
      this.renderer.setAttribute(c, 'r', r.toString());
      this.renderer.setAttribute(c, 'data-type', 'circle');
      this.renderer.setAttribute(c, 'fill', fill);
      this.renderer.setAttribute(c, 'opacity', String(opacity));
      this.renderer.appendChild(svg, c);
      return c;
    }
    return null;
  }
  createEllipse(d: Data, i: number) {
    if (this.el.nativeElement && d.ellipse) {
      const svg = this.el.nativeElement;
      const e = this.renderer.createElement('ellipse', 'http://www.w3.org/2000/svg');
      const { cx, cy, rx, ry, fill, opacity, rotate } = d.ellipse; // Assuming cx, cy, rx, ry, fill, opacity, and rotate are properties of the ellipse
      this.renderer.setAttribute(e, 'cx', String(cx));
      this.renderer.setAttribute(e, 'cy', String(cy));
      this.renderer.setAttribute(e, 'rx', String(rx));
      this.renderer.setAttribute(e, 'ry', String(ry));
      this.renderer.setAttribute(e, 'fill', fill);
      this.renderer.setAttribute(e, 'opacity', String(opacity));
      this.renderer.setAttribute(e, 'transform', `rotate(${rotate} ${cx} ${cy})`); // Apply rotate
      this.renderer.setAttribute(e, 'data-type', 'ellipse');
      this.renderer.appendChild(svg, e);
      return e;
    }
    return null;
  }
  createLine(d: Data, i: number) {
    if (this.el.nativeElement && d.line) {
      const svg = this.el.nativeElement;
      const line = this.renderer.createElement('line', 'http://www.w3.org/2000/svg');
      const { x1, y1, x2, y2, stroke, strokeWidth, opacity, rotate } = d.line; // Extract line properties
      this.renderer.setAttribute(line, 'x1', String(x1));
      this.renderer.setAttribute(line, 'y1', String(y1));
      this.renderer.setAttribute(line, 'x2', String(x2));
      this.renderer.setAttribute(line, 'y2', String(y2));
      this.renderer.setAttribute(line, 'stroke', stroke);
      this.renderer.setAttribute(line, 'stroke-width', String(strokeWidth));
      this.renderer.setAttribute(line, 'opacity', String(opacity));
      this.renderer.setAttribute(line, 'transform', `rotate(${rotate} ${x1} ${y1})`); // Apply rotate
      this.renderer.setAttribute(line, 'data-type', 'line');
      this.renderer.appendChild(svg, line);
      return line;
    }
    return null;
  }
  createImage(d: Data, i: number) {
    if (this.el.nativeElement && d.image) {
      const svg = this.el.nativeElement as SVGSVGElement | null;
      const { x, y, r, imageUrl, borderColor, borderWidth, shape, origin, placeholder, svgProperties, rotate } = d.image;
      let element: any; // Initialize as null

      switch (shape) {
        case 'circle':
          element = this.renderer.createElement('circle', 'http://www.w3.org/2000/svg');
          this.renderer.setAttribute(element, 'cx', String(x));
          this.renderer.setAttribute(element, 'cy', String(y));
          this.renderer.setAttribute(element, 'r', String(r));
          this.renderer.setAttribute(element, 'data-type', 'circle');
          break;
        case 'ellipse':
          element = this.renderer.createElement('ellipse', 'http://www.w3.org/2000/svg');
          this.renderer.setAttribute(element, 'cx', String(x));
          this.renderer.setAttribute(element, 'cy', String(y));
          this.renderer.setAttribute(element, 'rx', String(r));
          this.renderer.setAttribute(element, 'ry', String(r));
          this.renderer.setAttribute(element, 'data-type', 'ellipse');
          break;
        case 'rect':
          element = this.renderer.createElement('rect', 'http://www.w3.org/2000/svg');
          this.renderer.setAttribute(element, 'x', String(x)); // X coordinate
          this.renderer.setAttribute(element, 'y', String(y)); // Y coordinate
          this.renderer.setAttribute(element, 'width', String(r * 2)); // Width
          this.renderer.setAttribute(element, 'height', String(r * 2)); // Height
          this.renderer.setAttribute(element, 'data-type', 'rect');
          break;
        default:
          console.error('Invalid shape');
          return null;
      }

      if (element !== null) {
        // Set common attributes for all shapes
        const id = 'image-pattern-' + i;
        this.renderer.setAttribute(element, 'fill', 'url(#' + id + ')');
        this.renderer.setStyle(element, 'cursor', 'grab');
        this.renderer.setStyle(element, 'filter', 'url(#shadow)');
        const imagePattern = this.renderer.createElement('pattern', 'http://www.w3.org/2000/svg');
        this.renderer.setAttribute(imagePattern, 'id', id);
        this.renderer.setAttribute(imagePattern, 'x', '0');
        this.renderer.setAttribute(imagePattern, 'y', '0');
        this.renderer.setAttribute(imagePattern, 'height', '100%');
        this.renderer.setAttribute(imagePattern, 'width', '100%');
        this.renderer.setAttribute(imagePattern, 'viewBox', '0 0 ' + String(r * 2) + ' ' + String(r * 2));


        const image = this.renderer.createElement('image', 'http://www.w3.org/2000/svg');
        this.renderer.setAttribute(image, 'x', '0');
        this.renderer.setAttribute(image, 'y', '0');
        this.renderer.setAttribute(image, 'width', String(r * 2));
        this.renderer.setAttribute(image, 'height', String(r * 2));
        this.renderer.setAttribute(image, 'href', imageUrl);

        this.renderer.appendChild(imagePattern, image);
        this.renderer.appendChild(svg, imagePattern);

        // Apply border if needed
        if (borderWidth && borderColor) {
          this.renderer.setAttribute(element, 'stroke', borderColor);
          this.renderer.setAttribute(element, 'stroke-width', String(borderWidth));
        }

        // Apply SVG properties if provided
        // if (svgProperties) {
        //   Object.keys(svgProperties).forEach(key => {
        //     const propertyKey = key as keyof SvgProperties;
        //     let attributeValue = svgProperties[propertyKey];
        //     if (propertyKey == 'fill') {
        //       attributeValue = (attributeValue == 'none' || !attributeValue) ? `url(#${id})` : attributeValue;
        //     }
        //     !(propertyKey == 'stroke') && this.renderer.setAttribute(element!, propertyKey, String(attributeValue));

        //   });
        // }
        this.renderer.appendChild(svg, element);
        if (rotate || (x !== undefined && y !== undefined)) {
          const bbox = element.getBBox();
          const width = bbox.width;
          const height = bbox.height;
          const transformValue = `rotate(${rotate || 0} ${x + width / 2} ${y + height / 2})`;
          this.renderer.setAttribute(element, 'transform', transformValue);
        }
        return element as any;
      }
    }
    return null;
  }


  createText(d: Data, i: number) {
    if (this.el.nativeElement && d.text) {
      const svg = this.el.nativeElement;
      const t = this.renderer.createElement('text', 'http://www.w3.org/2000/svg');
      const { x, y, fs, fw, text, color, fontStyle, textAlign, rotate, fontFamily, textShadow, backgroundColor, textEffects, textAnchor, alignmentBaseline, letterSpacing, lineHeight, textTransformation, originX, originY, opacity } = d.text;
      let textAttributes: Record<string, string> = {
        'data-type': 'text',
        'x': d.text.x.toString(),
        'y': d.text.y.toString(),
        'font-size': d.text.fs.toString(),
        'fill': d.text.color || '#000000', // Set default fill color to black if not provided
        'text-anchor': d.text.textAnchor || 'start',
        'alignment-baseline': d.text.alignmentBaseline || 'middle',
        'dominant-baseline': 'reset-size',
        'font-family': d.text.fontFamily ? "'" + d.text.fontFamily + "', sans-serif" : "'Hind Vadodara', sans-serif",
        'font-weight': d.text.fw || '400',
        'text-decoration': d.text.fontStyle.underline ? 'underline' : 'none',
        'font-style': d.text.fontStyle.italic ? 'italic' : 'normal',
        'opacity': d.text.opacity ? d.text.opacity.toString() : '100',
      };

      // Apply text shadow if available


      // Apply background color if available
      if (d.text.backgroundColor) {
        textAttributes['background-color'] = d.text.backgroundColor;
      }
      if (d.text.textEffects) {

      }

      // Apply other text styles
      let textStyles: Record<string, string> = {
        '-webkit-user-select': 'none',
        'letter-spacing': d.text.letterSpacing ? `${d.text.letterSpacing}px` : '0',
        'line-height': d.text.lineHeight ? `${d.text.lineHeight}` : '1.5',
        'text-transform': d.text.textTransformation || 'none'
      };
      if (d.text.textShadow.enable) {
        textAttributes['filter'] = `drop-shadow(${textShadow.offsetX}px ${textShadow.offsetY}px ${textShadow.blur}px ${textShadow.color})` || 'none'
      }
      Object.entries(textAttributes).forEach(([key, value]) => this.renderer.setAttribute(t, key, value));
      Object.entries(textStyles).forEach(([key, value]) => this.renderer.setStyle(t, key, value));

      // Add text content if available
      if (text) {

        const lines = this.textFormat(text);
        if (lines.length === 1) {
          // If there's only one line of text, create a single tspan element
          this.renderer.appendChild(t, this.renderer.createText(text));
        } else {
          // Calculate dy offset based on font size
          const dyOffset = fs * lineHeight || 0;

          // Calculate dx offset based on text-anchor
          let dxOffset = 0;
          switch (textAnchor) {
            case 'middle':
              // For middle alignment, calculate the total width of the text and divide by 2
              const totalWidth = lines.reduce((sum, line) => sum + this.getTextWidth(line, fs, fontFamily), 0);
              dxOffset = totalWidth / 2;
              break;
            case 'end':
              // For end alignment, calculate the total width of the text
              dxOffset = lines.reduce((maxWidth, line) => {
                const lineWidth = this.getTextWidth(line, fs, fontFamily);
                return lineWidth > maxWidth ? lineWidth : maxWidth;
              }, 0);
              break;
            // For start alignment, dxOffset remains 0
          }

          // Iterate over each line of text
          lines.forEach((line, index) => {
            // Create a tspan element for each line
            const tspanElement = this.renderer.createElement('tspan', 'http://www.w3.org/2000/svg');

            // Set text content
            this.renderer.appendChild(tspanElement, this.renderer.createText(line));

            // Apply dy offset
            if (index > 0 || (index === 0 && line.trim() === '')) {
              this.renderer.setAttribute(tspanElement, 'dy', `${dyOffset}px`);
            }
            this.renderer.setAttribute(tspanElement, 'x', x.toString());
            // Apply dx offset based on text-anchor
            switch (textAnchor) {
              case 'middle':
                // For middle alignment, set dx to half of the total width
                this.renderer.setAttribute(tspanElement, 'dx', `-${dxOffset}px`);
                break;
              case 'end':
                // For end alignment, set dx to the total width
                this.renderer.setAttribute(tspanElement, 'dx', `-${dxOffset}px`);
                break;
              // For start alignment, dx remains 0
            }

            // Append tspan to text element
            this.renderer.appendChild(t, tspanElement);
          });
        }
      }


      this.renderer.appendChild(svg, t);
      if (rotate || (originX !== undefined && originY !== undefined)) {
        const bbox = t.getBBox();
        const width = bbox.width;
        const height = bbox.height;
        const transformValue = `rotate(${rotate || 0} ${x + width / 2} ${y + height / 2})`;
        this.renderer.setAttribute(t, 'transform', transformValue);
      }
      // Append the text element to the SVG
      return t;
    }
    return null;
  }
  async updateElements(data: Data[]) {
    const svg = this.el.nativeElement;
    const children = svg.childNodes;
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i] as HTMLElement;
      const dataType = child.getAttribute('data-type');
      if (dataType !== "background-img") {
        svg.removeChild(child);
      }
    }
    const elements: SVGSVGElement | SVGGElement[] = [];
    for (const [i, d] of data.entries()) {
      if (d.rect) elements.push(this.createRect(d, i));
      if (d.circle) elements.push(this.createCircle(d, i));
      if (d.ellipse) elements.push(this.createEllipse(d, i));
      if (d.line) elements.push(this.createLine(d, i));
      if (d.image) elements.push(this.createImage(d, i));
      if (d.text) elements.push(this.createText(d, i));
      // if (d.text) {
      //   try {
      //     const svgElement = await this.generateSVGPathData(d);
      //     if (svgElement) {
      //       this.renderer.appendChild(svg, svgElement);
      //       elements.push(svgElement);
      //     } else {
      //       console.error('Failed to generate SVG path data for element:', d);
      //     }
      //   } catch (error) {
      //     console.error('Error generating SVG path data:', error);
      //   }
      // }
    }
    this.removeEventListeners();
    this.addDraggableBehavior(elements);
  }

  getTextWidth(text: string, fontSize: number, fontFamily: string): number {
    const svgText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    svgText.setAttribute('font-size', `${fontSize}px`);
    svgText.setAttribute('font-family', fontFamily);
    svgText.textContent = text;
    document.body.appendChild(svgText);
    const width = svgText.getBBox().width;
    document.body.removeChild(svgText);
    return width;
  }

  async getImageDataUrl(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const convertedImageUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      return convertedImageUrl;
    } catch (error) {
      console.error('Error fetching or converting image:', error);
      throw error;
    }
  }
  addDraggableBehavior(elements: any): void {
    const svg = this.el.nativeElement as SVGSVGElement;
    const showControls = elements.map(() => {
      return false;
    })
    elements.forEach((element: any, index: number) => {
      const eleData = this.postData.data[index]
      if (element) {
        let isDragging = false;
        let isDragged = false;
        const bbox = element.getBBox();
        const x = bbox.x;
        const y = bbox.y;
        const width = bbox.width;
        const height = bbox.height;

        this.renderer.setAttribute(element, 'cursor', 'grab');
        const elementType = element.getAttribute('data-type');
        const onMouseDown = (event: MouseEvent) => {
          isDragging = true;
          isDragged = false;
          showControls.fill(false);
          showControls[index] = true;
          const svgPoint = this.getMousePosition(event, svg);
          const clickedX = svgPoint.x;
          const clickedY = svgPoint.y;
          let elementX = 0;
          let elementY = 0;
          if (['circle'].includes(elementType)) {
          } else {
          }
          this.renderer.setAttribute(element, 'cursor', 'grabbing');

          switch (elementType) {
            case 'circle':
              elementX = parseFloat(element.getAttribute('cx') || '0');
              elementY = parseFloat(element.getAttribute('cy') || '0');
              break;
            case 'rectangle':

              break;
            case 'svg':
              const pathBoundingBox = element.getBBox(); // Get the bounding box of the path
              elementX = pathBoundingBox.x;
              elementY = pathBoundingBox.y;
              break;
            case 'image':
              // Logic for handling image elements
              break;
            case 'g':
              const transformAttribute = element.getAttribute('transform');
              if (transformAttribute) {
                const match = transformAttribute.match(/translate\(([^,]+),([^)]+)\)/);
                if (match && match.length === 3) {
                  elementX = parseFloat(match[1]);
                  elementY = parseFloat(match[2]);
                }
              }
              break;
            default:
              elementX = parseFloat(element.getAttribute('x') || '0');
              elementY = parseFloat(element.getAttribute('y') || '0');
              break;
          }
          this.offsetX = elementX - clickedX;
          this.offsetY = elementY - clickedY;
          this.getSelected.emit({ index: index })
        };
        const onMouseMove = (event: MouseEvent) => {
          if (isDragging) {
            isDragged = true;

            const svgPoint = this.getMousePosition(event, svg);
            if (element) {
              let x, y;
              let r = 0;
              switch (elementType) {
                case 'circle':
                  x = parseFloat(element.getAttribute('cx') || '0');
                  y = parseFloat(element.getAttribute('cy') || '0');
                  r = parseFloat(element.getAttribute('r') || '0');
                  break;
                case 'g':
                  const transformAttribute = element.getAttribute('transform');
                  if (transformAttribute) {
                    const match = transformAttribute.match(/translate\(([^,]+),([^)]+)\)/);
                    if (match && match.length === 3) {
                      x = parseFloat(match[1]);
                      y = parseFloat(match[2]);
                    }
                  }
                  break;
                default:
                  x = parseFloat(element.getAttribute('x') || '0');
                  y = parseFloat(element.getAttribute('y') || '0');
                  break;
              }
              if (x !== undefined && y !== undefined) {
                const oX = svgPoint.x - x + this.offsetX;
                const oY = svgPoint.y - y + this.offsetY;
                const newX = x + oX;
                const newY = y + oY;
                let minX = 30 + r;
                let minY = 30 + r;
                let maxX = this.width - (element.getBBox().width + minX) + 2 * r;
                let maxY = this.height - (element.getBBox().height + minY) + 2 * r;
                const textAnchor = element.getAttribute('text-anchor');
                if (textAnchor) {
                  minY += element.getBBox().height / 2;
                  maxY += element.getBBox().height;
                  switch (textAnchor) {
                    case 'middle':
                      minX += element.getBBox().width / 2;
                      maxX += element.getBBox().width / 2;
                      break;
                    case 'start':

                      break;
                    case 'end':
                      minX += element.getBBox().width;
                      maxX += element.getBBox().width;
                      break;
                    default:
                      // Handle other cases if needed
                      break;
                  }
                }
                const adjustedX = eleData.boxed ? Math.floor(Math.min(Math.max(newX, minX), maxX)) : Math.floor(newX);
                const adjustedY = eleData.boxed ? Math.floor(Math.min(Math.max(newY, minY), maxY)) : Math.floor(newY);

                switch (true) {
                  case !!eleData.circle:
                    if (eleData.circle) {
                      eleData.circle.cx = adjustedX;
                      eleData.circle.cy = adjustedY;
                    }
                    break;
                  case !!eleData.rect || !!eleData.text || !!eleData.image:
                    if (eleData.rect) {
                      eleData.rect.x = adjustedX;
                      eleData.rect.y = adjustedY;
                      const transformValue = `rotate(${eleData.rect.rotate || 0} ${x + width / 2} ${y + height / 2})`;
                      this.renderer.setAttribute(element, 'transform', transformValue);
                    }
                    if (eleData.text) {
                      eleData.text.x = adjustedX;
                      eleData.text.y = adjustedY;
                      const bbox = element.getBBox();
                      const width = bbox.width;
                      const height = bbox.height;
                      const transformValue = `rotate(${eleData.text.rotate || 0} ${adjustedX + width / 2} ${adjustedY + height / 2})`;
                      const tspanElements = element.getElementsByTagName('tspan');
                      if (tspanElements.length > 0) {
                        for (let i = 0; i < tspanElements.length; i++) {
                          const tspanElement = tspanElements[i];
                          this.renderer.setAttribute(tspanElement, 'x', adjustedX.toString());
                        }
                      }
                      this.renderer.setAttribute(element, 'transform', transformValue);
                    }
                    if (eleData.image) {
                      eleData.image.x = adjustedX;
                      eleData.image.y = adjustedY;
                      const transformValue = `rotate(${eleData.image.rotate || 0} ${x + width / 2} ${y + height / 2})`;
                      this.renderer.setAttribute(element, 'transform', transformValue);
                    }
                    break;
                  default:
                    console.log('Element data not found');
                    break;
                }
                switch (elementType) {
                  case 'circle':
                    this.renderer.setAttribute(element, 'cx', adjustedX.toString());
                    this.renderer.setAttribute(element, 'cy', adjustedY.toString());
                    break;
                  case 'rect':
                    this.renderer.setAttribute(element, 'x', adjustedX.toString());
                    this.renderer.setAttribute(element, 'y', adjustedY.toString());
                    break;
                  case 'svg':
                    // Logic for handling SVG elements
                    break;
                  case 'image':
                    // Logic for handling image elements
                    break;
                  case 'g':
                    this.renderer.setAttribute(element, 'transform', `translate(${adjustedX},${adjustedY})`);
                    break;
                  default:
                    this.renderer.setAttribute(element, 'x', adjustedX.toString());
                    this.renderer.setAttribute(element, 'y', adjustedY.toString());
                    break;
                }
                

              }
            }
          }
        };
        const onMouseUp = () => {
          isDragging && isDragged && this.dataChanges.emit({ data: eleData, index: index });
          isDragging = false;
          this.renderer.setAttribute(element, 'cursor', 'grab');
        };
        const mousedownListener = this.renderer.listen(element, 'mousedown', onMouseDown);
        const touchstartListener = this.renderer.listen(element, 'touchstart', onMouseDown);
        const mousemoveListener = this.renderer.listen(svg, 'mousemove', onMouseMove);
        const touchmoveListener = this.renderer.listen(svg, 'touchmove', onMouseMove);
        const mouseupListener = this.renderer.listen(svg, 'mouseup', onMouseUp);
        const mouseleaveListener = this.renderer.listen(svg, 'mouseleave', onMouseUp);
        const touchendListener = this.renderer.listen(svg, 'touchend', onMouseUp);

        this.eventListeners.push(mousedownListener, touchstartListener, mousemoveListener,
          touchmoveListener, mouseupListener, mouseleaveListener,
          touchendListener);
      }
    });
  }
  getMousePosition(evt: TouchEvent | MouseEvent, svg: SVGSVGElement): { x: number, y: number } {
    evt.preventDefault();
    const touchOrMouse = 'touches' in evt ? evt.touches[0] : evt;
    const CTM = svg.getScreenCTM();
    return {
      x: (touchOrMouse.clientX - CTM!.e) / CTM!.a,
      y: (touchOrMouse.clientY - CTM!.f) / CTM!.d
    };
  }
  removeEventListeners() {
    this.eventListeners.forEach(removeListener => removeListener());
    this.eventListeners = [];
  }
  textFormat(text: string): string[] {
    const formattedText = text.replace(/\n/g, '\n').replace(/\n(?!\*{3})/g, '***\n');
    const lines = formattedText.split('\n');
    for (let i = 0; i < lines.length; i++) {
      lines[i] = lines[i].replace(/\*\*\*/g, '\u00A0');
    }
    console.log(lines)
    return lines;
  }

  ngAfterViewInit(): void {
    this.loadOnly && this.initSVG(this.loadOnly);
  }
  ngOnInit(): void {
    this.postDataSet$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((value: PostDetails) => {
      this.initSVG(value);
    });
  }
  initSVG(d: PostDetails) {
    const { id, deleted, h, w, title, backgroundurl, data } = d;

    this.height = h;
    this.width = w;
    if (!this.postData || backgroundurl !== this.postData.backgroundurl) {
      this.updateBackGround(backgroundurl);
    }
    if (!this.postData || w !== this.postData.w || h !== this.postData.h) {
      this.updateViewBox(Math.min(Math.max(w, 1024), 1920), Math.min(Math.max(h, 1024), 1920));
    }
    if (data && this.postData) {
      if (data != this.postData.data || this.firstLoad) {
        if (data.length !== this.postData.data.length) {

          let added = data.filter(item => !this.postData.data.includes(item));
          let removed = this.postData.data.filter(item => !data.includes(item));
          if (added) {
            added.forEach((item) => this.postData.data.push(item))
            this.updateElements(this.postData.data)
          }
          if (removed) {
            this.postData.data = data
            this.updateElements(this.postData.data)
          }
        } else {
          let updateRequire = this.postData.data.map((item, index) => data[index] !== this.postData.data[index]);
          if (updateRequire) {
            let updated = this.postData.data.filter((item, index) => {
              if (data[index] !== item) {
                this.postData.data[index] = data[index];
              } return data[index] !== item
            });
            if (updated.length > 0) {
              this.updateElements(this.postData.data)
            }
          }
        }
      }
    }
    if (!this.dataLoaded) {
      this.dataLoaded = true;
      this.postData = d;
      this.updateElements(data);
    }
  }
  ngOnDestroy() {
    this.removeEventListeners();
    this.destroy$.next();
    this.destroy$.complete();
  }
  getEventListeners(element: HTMLElement): { [event: string]: EventListener[] } {
    const eventListeners: { [event: string]: EventListener[] } = {};
    const registeredEvents = this.getRegisteredEvents(element);
    for (const event in registeredEvents) {
      if (registeredEvents.hasOwnProperty(event)) {
        const listeners: EventListener[] = [];
        registeredEvents[event].forEach((listener: EventListener) => { // Specify EventListener type
          listeners.push(listener);
        });
        eventListeners[event] = listeners;
      }
    }
    return eventListeners;
  }
  private getRegisteredEvents(element: HTMLElement): { [event: string]: EventListener[] } {
    const registeredEvents: { [event: string]: EventListener[] } = {};
    const listeners = this.renderer.data['get'](element);
    if (listeners) {
      Object.keys(listeners).forEach(eventName => {
        const eventListeners = listeners[eventName].map((listener: EventListenerObject) => listener.handleEvent);
        registeredEvents[eventName] = eventListeners;
      });
    }
    return registeredEvents;
  }

  async generateSVGPathData(t: { title: string; editable: boolean; boxed: boolean; text?: TextElement; }): Promise<SVGGElement> {
    try {
      if (!t.text) {
        console.error('Font loading failed');
        throw new Error('Font loading failed');
      } else {
        const fontUrl = this.getFontPath(t.text?.fontFamily, t.text?.fw)
        const font = await this.loadFont(`assets/fonts/${fontUrl}.ttf`);
        if (!font || !t.text) {
          console.error('Font loading failed');
          throw new Error('Font loading failed');
        }
        const textData = t.text;
        const fontSize = textData.fs;
        const pathData = [];
        const yOffset = 0; // Start y position from the text data
        const lines = textData.text.split('\n');

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
          const line = lines[lineIndex];
          const lineHeightFactor = textData.lineHeight; // Line height factor (e.g., 1.5 for 1.5 times the font size)
          const ascent = font.ascender / font.unitsPerEm * fontSize;
          const descent = font.descender / font.unitsPerEm * fontSize;
          const lineHeight = (ascent - descent) * lineHeightFactor;
          let yoff = yOffset + lineHeight * lineIndex;
          let xOffset = 0;
          switch (textData.textAnchor) {
            case 'middle':
              xOffset -= font.getAdvanceWidth(line, fontSize) / 2; // Center align
              break;
            case 'end':
              xOffset -= font.getAdvanceWidth(line, fontSize); // End align
              break;
            case 'start':
            default:
              break;
          }
          
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            console.log(char)
            const glyph = font.charToGlyph(char);
            const glyphPath = glyph.getPath(xOffset, yoff, fontSize);
            pathData.push(glyphPath.toPathData(5));
            xOffset += glyph.advanceWidth * fontSize / font.unitsPerEm; // Adjust for glyph width
          }
        }
        const svgPathData = pathData.join(' ');
        const pathElement = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathElement.setAttribute('d', svgPathData);

        // Create SVG element
        const lineGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        lineGroup.setAttribute('transform', `translate(${textData.x},${textData.y})`);

        for (const prop in textData) {
          if (Object.prototype.hasOwnProperty.call(textData, prop) && prop !== 'text') {
            const propValue = textData[prop as keyof TextElement];
            if (propValue !== undefined && propValue !== null) {
              let p: string | null = null;
              let v: string | null = null
              switch (prop) {
                case 'color':
                  p = 'fill';
                  v = propValue as string;
                  break;
                case 'letterSpacing':
                  break;
                case 'lineHeight':
                  break;
                case 'textTransform':
                  break;
                case 'textShadow':
                  p = 'filter';
                  const t = propValue as TextShadow;
                  v = `drop-shadow(${t.offsetX}px ${t.offsetY}px ${t.blur}px ${t.color})` || 'none';
                  break; // Handle textShadow separately if needed
                default:
                  break;
              }
              if (p && v) {
                pathElement.setAttribute(p, v); // Convert propValue to string
              }
            }
          }
        }
        this.renderer.setAttribute(lineGroup, 'data-type', 'g')
        lineGroup.appendChild(pathElement);
        return lineGroup;
      }
    } catch (error) {
      console.error('Error generating SVG path data:', error);
      throw error; // Propagate the error
    }
  }
  
  loadFont(fontUrl: string): Promise<any> {
    return new Promise((resolve, reject) => {
      opentype.load(fontUrl, (err, font) => {
        if (err) {
          reject(err);
        } else {
          resolve(font);
        }
      });
    });
  }

}

