import { Directive, Input, ElementRef, OnInit, Renderer2, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { Subject, takeUntil, timer } from 'rxjs';
import {
  PostDetails,
  RectProperties,
  CircleProperties,
  EllipseProperties,
  LineProperties,
  TextElement,
  ImageElement,
  SvgProperties
} from '../interfaces/image-element';
import ColorThief from 'colorthief';

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
  constructor(private el: ElementRef<SVGSVGElement>, private renderer: Renderer2) {

  }
  get dataArray(): Data[] {
    return this.data;
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
        //     const attributeValue = svgProperties[propertyKey];
        //     this.renderer.setAttribute(element!, propertyKey, String(attributeValue));
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
        'font-weight': d.text.fw || 'normal',
        'text-decoration': d.text.fontStyle.underline ? 'underline' : 'none',
        'font-style': d.text.fontStyle.italic ? 'italic' : 'normal',
        'opacity': d.text.opacity ? d.text.opacity.toString() : '100',
      };

      // Apply text shadow if available


      // Apply background color if available
      if (d.text.backgroundColor) {
        textAttributes['background-color'] = d.text.backgroundColor;
      }

      // Apply text effects if available
      if (d.text.textEffects) {
        // Apply gradient if available
        // if (d.text.textEffects.gradient) {
        //   const gradient = `linear-gradient(to right, ${d.text.textEffects.gradient.startColor}, ${d.text.textEffects.gradient.endColor})`;
        //   textAttributes['fill'] = gradient; // Change fill to apply gradient
        // }

        // Apply outline if available
        // if (d.text.textEffects.outline) {
        //   const strokeColor = d.text.textEffects.outline.color || '#000000'; // Default stroke color to black if not provided
        //   const strokeWidth = `${d.text.textEffects.outline.width}px`; // Convert width to string with 'px' unit
        //   this.renderer.setStyle(text, 'stroke', strokeColor); // Apply stroke color
        //   this.renderer.setStyle(text, 'stroke-width', strokeWidth); // Apply stroke width
        // }

        // Apply glow if available
        // if (d.text.textEffects.glow) {
        //   const glowColor = d.text.textEffects.glow.color || '#FFFFFF'; // Default glow color to white if not provided
        //   const glowBlur = `${d.text.textEffects.glow.blur}px`; // Convert blur to string with 'px' unit
        //   const glowShadow = `${glowColor} ${glowBlur}`; // Create glow shadow string
        //   let existingTextShadow = textAttributes['text-shadow'] || ''; // Get existing text shadow
        //   textAttributes['text-shadow'] = existingTextShadow ? `${existingTextShadow}, ${glowShadow}` : glowShadow; // Append or set glow shadow
        // }
      }

      // Apply other text styles
      let textStyles: Record<string, string> = {
        '-webkit-user-select': 'none',
        'letter-spacing': d.text.letterSpacing ? `${d.text.letterSpacing}px` : 'normal',
        'line-height': d.text.lineHeight ? `${d.text.lineHeight}` : 'normal',
        'text-transform': d.text.textTransformation || 'none'
      };
      if (d.text.textShadow.enable) {
        textStyles['text-shadow'] = `${d.text.textShadow.offsetX}px ${d.text.textShadow.offsetY}px ${d.text.textShadow.blur}px ${d.text.textShadow.color}` || 'none'
      }
      Object.entries(textAttributes).forEach(([key, value]) => this.renderer.setAttribute(t, key, value));
      Object.entries(textStyles).forEach(([key, value]) => this.renderer.setStyle(t, key, value));

      // Add text content if available
      if (text) {
        this.renderer.appendChild(t, this.renderer.createText(d.text.text));
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
  updateElements(data: Data[]) {
    const svg = this.el.nativeElement;
    const children = svg.childNodes;
    for (let i = children.length - 1; i >= 0; i--) {
      const child = children[i] as HTMLElement;
      const dataType = child.getAttribute('data-type');
      if (dataType !== "background-img") {
        svg.removeChild(child);
      }
    }
    const elements: SVGSVGElement[] = []
    data.forEach((d, i) => {
      (d.rect) && elements.push(this.createRect(d, i));
      (d.circle) && elements.push(this.createCircle(d, i));
      (d.ellipse) && elements.push(this.createEllipse(d, i));
      (d.line) && elements.push(this.createLine(d, i));
      (d.image) && elements.push(this.createImage(d, i));
      (d.text) && elements.push(this.createText(d, i))
    })
    this.removeEventListeners();
    this.addDraggableBehavior(elements);
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
    let handleResize: any = [];
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
        // const resizeHandles = [
        //   { x: x - 5, y: y - 5, cursor: 'nw-resize' }, // Top-left corner
        //   { x: x + width / 2 - 5, y: y - 5, cursor: 'n-resize' }, // Top-center
        //   { x: x + width - 5, y: y - 5, cursor: 'ne-resize' }, // Top-right corner
        //   { x: x - 5, y: y + height / 2 - 5, cursor: 'w-resize' }, // Middle-left
        //   { x: x + width - 5, y: y + height / 2 - 5, cursor: 'e-resize' }, // Middle-right
        //   { x: x - 5, y: y + height - 5, cursor: 'sw-resize' }, // Bottom-left corner
        //   { x: x + width / 2 - 5, y: y + height - 5, cursor: 's-resize' }, // Bottom-center
        //   { x: x + width - 5, y: y + height - 5, cursor: 'se-resize' } // Bottom-right corner
        // ].map((position, idx) => {
        //   const handle = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        //   handle.setAttribute('x', position.x.toString());
        //   handle.setAttribute('y', position.y.toString());
        //   handle.setAttribute('width', '10');
        //   handle.setAttribute('height', '10');
        //   handle.setAttribute('fill', 'blue');
        //   handle.setAttribute('cursor', position.cursor); // Set the cursor style based on position
        //   svg.appendChild(handle);
        //   return handle;
        // });
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
          let elementX;
          let elementY;
          if (['circle'].includes(elementType)) {
            elementX = parseFloat(element.getAttribute('cx') || '0');
            elementY = parseFloat(element.getAttribute('cy') || '0');
          } else {
            elementX = parseFloat(element.getAttribute('x') || '0');
            elementY = parseFloat(element.getAttribute('y') || '0');
          }
          this.offsetX = elementX - clickedX;
          this.offsetY = elementY - clickedY;
          this.renderer.setAttribute(element, 'cursor', 'grabbing');
          while (handleResize.length > 0) {
            const handle = handleResize.pop(); // Remove the last element from the array
            if (handle && handle.parentNode) {
              handle.parentNode.removeChild(handle); // Remove handle from SVG DOM
            }
          }
          switch (elementType) {
            case 'circle':
              if (showControls[index]) {
                const linePositions = [
                  { x1: x, y1: y, x2: x + width, y2: y }, // Top boundary
                  { x1: x + width, y1: y, x2: x + width, y2: y + height }, // Right boundary
                  { x1: x + width, y1: y + height, x2: x, y2: y + height }, // Bottom boundary
                  { x1: x, y1: y + height, x2: x, y2: y } // Left boundary
                ];
                linePositions.forEach((position, i) => {
                  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                  line.setAttribute('x1', position.x1.toString());
                  line.setAttribute('y1', position.y1.toString());
                  line.setAttribute('x2', position.x2.toString());
                  line.setAttribute('y2', position.y2.toString());
                  line.setAttribute('stroke', '#CCC');
                  line.setAttribute('stroke-width', '1');
                  line.setAttribute('stroke-linecap', 'round');
                  svg.appendChild(line);
                });
                const radius = element.getAttribute('r');
                const centerX = x + parseFloat(radius);
                const centerY = y + parseFloat(radius);
                [
                  { x: centerX, y: y, cursor: 'n-resize' }, // Top-center
                  { x: x, y: centerY, cursor: 'w-resize' }, // Middle-left
                  { x: x + parseFloat(width), y: centerY, cursor: 'e-resize' }, // Middle-right
                  { x: centerX, y: y + parseFloat(height), cursor: 's-resize' } // Bottom-center
                ].map((position) => {
                  const handle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                  handle.setAttribute('cx', position.x.toString());
                  handle.setAttribute('cy', position.y.toString());
                  handle.setAttribute('r', '5');
                  handle.setAttribute('fill', 'blue');
                  handle.setAttribute('cursor', position.cursor);
                  svg.appendChild(handle);
                  handleResize.push(handle)
                });
              }
              break;
            case 'rectangle':
              // Logic for handling rectangle elements
              break;
            case 'text':
              if (showControls[index]) {
                const linePositions = [
                  { x1: x, y1: y, x2: x + width, y2: y }, // Top boundary
                  { x1: x + width, y1: y, x2: x + width, y2: y + height }, // Right boundary
                  { x1: x + width, y1: y + height, x2: x, y2: y + height }, // Bottom boundary
                  { x1: x, y1: y + height, x2: x, y2: y } // Left boundary
                ];
                linePositions.forEach((position, i) => {
                  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                  line.setAttribute('x1', position.x1.toString());
                  line.setAttribute('y1', position.y1.toString());
                  line.setAttribute('x2', position.x2.toString());
                  line.setAttribute('y2', position.y2.toString());
                  line.setAttribute('stroke', '#CCC');
                  line.setAttribute('stroke-width', '1');
                  line.setAttribute('stroke-linecap', 'round');
                  svg.appendChild(line);
                });
                const centerX = x + parseFloat(width) / 2;
                const centerY = y + parseFloat(height) / 2;
                [
                  { x: centerX, y: y, cursor: 'n-resize' }, // Top-center
                  { x: x, y: centerY, cursor: 'w-resize' }, // Middle-left
                  { x: x + parseFloat(width), y: centerY, cursor: 'e-resize' }, // Middle-right
                  { x: centerX, y: y + parseFloat(height), cursor: 's-resize' } // Bottom-center
                ].map((position) => {
                  const handle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                  handle.setAttribute('cx', position.x.toString());
                  handle.setAttribute('cy', position.y.toString());
                  handle.setAttribute('r', '5');
                  handle.setAttribute('fill', 'blue');
                  handle.setAttribute('cursor', position.cursor);
                  svg.appendChild(handle);
                  handleResize.push(handle)
                });
              }
              break;
            case 'image':
              // Logic for handling image elements
              break;
            default:
              // Default case
              break;
          }
          this.getSelected.emit({ index: index })
        };
        const onMouseMove = (event: MouseEvent) => {
          if (isDragging) {
            isDragged = true;
            while (handleResize.length > 0) {
              const handle = handleResize.pop(); // Remove the last element from the array
              if (handle && handle.parentNode) {
                handle.parentNode.removeChild(handle); // Remove handle from SVG DOM
              }
            }
            const svgPoint = this.getMousePosition(event, svg);
            if (element) {
              let x, y;
              let r = 0;
              if (['circle'].includes(elementType)) {
                x = parseFloat(element.getAttribute('cx') || '0');
                y = parseFloat(element.getAttribute('cy') || '0');
                r = parseFloat(element.getAttribute('r') || '0');
              } else {
                x = parseFloat(element.getAttribute('x') || '0');
                y = parseFloat(element.getAttribute('y') || '0');
              }
              console.log(this.width, this.height);
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
                      console.log(adjustedX + width / 2);
                      const transformValue = `rotate(${eleData.text.rotate || 0} ${adjustedX + width / 2} ${adjustedY + height / 2})`;
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
                if (['circle'].includes(elementType)) {
                  this.renderer.setAttribute(element, 'cx', adjustedX.toString());
                  this.renderer.setAttribute(element, 'cy', adjustedY.toString());
                } else {
                  this.renderer.setAttribute(element, 'x', adjustedX.toString());
                  this.renderer.setAttribute(element, 'y', adjustedY.toString());
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

}

