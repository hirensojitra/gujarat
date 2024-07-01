import { Directive, Input, OnChanges, Output, SimpleChanges, EventEmitter, ElementRef, Renderer2, OnInit } from '@angular/core';
import { isEqual } from 'lodash';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { AspectRatios, CircleProperties, EllipseProperties, ImageElement, LineProperties, PostDetails, RectProperties, TextElement } from '../interfaces/image-element';
import { SvgRectService } from '../services/svg-rect.service';
import { SvgCircleService } from '../services/svg-circle.service';
import { SvgEllipseService } from '../services/svg-ellipse.service';

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
  selector: '[svgDraw]'
})
export class SvgResponseDirective implements OnChanges, OnInit {
  @Input('svgDraw') formGroupValue: any;
  private postDataSetSubject = new Subject<PostDetails>();
  private destroy$ = new Subject<void>();
  @Input() set postDataSet(value: PostDetails) {
    this.postDataSetSubject.next(value);
  }
  postDataSet$ = this.postDataSetSubject.asObservable();
  @Input() loadOnly: boolean = false;
  @Output() dataChanges = new EventEmitter<{ data: Data, index: number }>();
  @Output() getSelected = new EventEmitter<{ index: number }>();
  formGroupValueChanges: Subject<any> = new Subject<any>();
  private eventListeners: (() => void)[] = [];
  private previousFormGroupValue: any;
  private newFormGroupValue: any;
  private subscription: Subscription;
  offsetX: number = 0;
  offsetY: number = 0;
  width: number = 0;
  height: number = 0;
  apiData: { [key: string]: any[] };
  controlList: { [key: string]: { title: string, control: SVGElement, lang: string, text: string, api: string, dependency: string } } = {};
  constructor(
    private el: ElementRef<SVGSVGElement>,
    private renderer: Renderer2,
    private Rect: SvgRectService,
    private Circle: SvgCircleService,
    private Ellipse: SvgEllipseService,
  ) {
    this.apiData = {};
    this.subscription = new Subscription();
  }
  ngOnInit(): void {
    let f = true;
    this.postDataSet$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(async (value: PostDetails) => {
      const currentValue = value;
      this.newFormGroupValue = currentValue;
      const previousValue: Partial<PostDetails> = this.previousFormGroupValue;
      const differences = this.findDifferences(previousValue, currentValue);
      console.log(differences)
      const { id, deleted, h, w, title, backgroundurl, data, boxed, apiData } = differences;
      this.formGroupValueChanges.next(differences);
      if (apiData) {
        this.apiData = apiData.current;
        await this.updateElements(currentValue.data || []);
      }
      if (backgroundurl && backgroundurl['current']) {
        await this.updateBackGround(backgroundurl['current']);
      }

      if (w || h) {
        const width = w.current || previousValue['w'];
        const height = h.current || previousValue['h'];
        this.height = height;
        this.width = width;
        w && h && this.updateViewBox(Math.min(Math.max(width, 1024), 1920), Math.min(Math.max(height, 1024), 1920));
      }

      if (data) {
        await this.updateElements(data.current);
      }
      this.previousFormGroupValue = { ...this.newFormGroupValue };
      for (let key in this.controlList) {
        let data = this.controlList[key];
        this.renderer.setValue(data.control, data.title);
        if (data) {
          const a = this.apiData[key]
          for (let k in a) {
            let d = a[k]
            if (d.id == data.text) {
              this.renderer.setValue(data.control, data['lang'] == 'en' ? d['name'] : data['lang'] == 'gu' ? d['gu_name'] : d['name']);
              break;
            }
          }
        }
      }
    })
  }
  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['formGroupValue']) {
      // const currentValue = changes['formGroupValue'].currentValue;
      // this.newFormGroupValue = currentValue;
      // const previousValue = this.previousFormGroupValue;
      // const differences = this.findDifferences(previousValue, currentValue);
      // const { id, deleted, h, w, title, backgroundurl, data, boxed, apiData } = differences;
      // this.formGroupValueChanges.next(differences);
      // if (!previousValue||apiData) {
      //   this.apiData = apiData.current;
      //   await this.updateElements(currentValue.data || []);
      // }
      // if (!previousValue ||backgroundurl && backgroundurl['current']) {
      //   await this.updateBackGround(backgroundurl['current']);
      // }

      // if (w || h) {
      //   const width = w.current || previousValue['w'];
      //   const height = h.current || previousValue['h'];
      //   this.height = height;
      //   this.width = width;
      //   w && h && this.updateViewBox(Math.min(Math.max(width, 1024), 1920), Math.min(Math.max(height, 1024), 1920));
      // }

      // if (data) {
      //   console.log(data.differences)
      //   console.log(data.previous)
      //   console.log(data.current)
      //   await this.updateElements(data.current);
      // }
      // this.previousFormGroupValue = { ...this.newFormGroupValue };
      // for (let key in this.controlList) {
      //   let data = this.controlList[key];
      //   this.renderer.setValue(data.control, data.title);
      //   if (data) {
      //     const a = this.apiData[key]
      //     for (let k in a) {
      //       let d = a[k]
      //       if (d.id == data.text) {
      //         this.renderer.setValue(data.control, data['lang'] == 'en' ? d['name'] : data['lang'] == 'gu' ? d['gu_name'] : d['name']);
      //         break;
      //       }
      //     }
      //   }
      // }
    }
  }

  private findDifferences(previousValue: Partial<PostDetails>, currentValue: Partial<PostDetails>): any {
    const changes: any = {};
    for (const key in currentValue) {
      if (currentValue.hasOwnProperty(key)) {
        const keyTyped = key as keyof PostDetails;
        const currentVal = currentValue[keyTyped];
        if (previousValue) {
          const previousVal = previousValue[keyTyped];
          if (previousVal !== currentVal) {
            changes[keyTyped] = {
              previous: previousValue?.[keyTyped],
              current: currentValue[keyTyped]
            };
          }
        } else {
          changes[keyTyped] = {
            previous: previousValue?.[keyTyped],
            current: currentValue[keyTyped]
          };
        }
      }
    }

    return changes;
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
        this.getSelected.emit({ index: -1 });
      });
      const firstChild = svg.firstChild;
      if (firstChild) {
        svg.insertBefore(b, firstChild);
        firstChild.nodeName === 'image' && firstChild.remove();
      } else {
        svg.appendChild(b);
      }
    }
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

  updateViewBox(x: number, y: number) {
    if (this.el.nativeElement) {
      const svg = this.el.nativeElement;
      const viewBoxValue = `0 0 ${x} ${y}`;
      svg.setAttribute('viewBox', viewBoxValue);
    }
  }

  private async updateElements(data: Data[]): Promise<void> {

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
      if (d.rect) {
        const rect = await this.createRect(d, i);
        rect && elements.push(rect)
      };
      if (d.circle) {
        const circle = await this.createCircle(d, i);
        circle && elements.push(circle)
      };
      if (d.ellipse) {
        const ellipse = await this.createEllipse(d, i);
        ellipse && elements.push(ellipse)
      };
      if (d.line) elements.push(this.createLine(d, i));
      if (d.image) elements.push(this.createImage(d, i));
      if (d.text) elements.push(await this.createText(d, i));
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
    !this.loadOnly && this.addDraggableBehavior(elements);
  }
  createRect(d: Data, i: number) {
    if (this.el.nativeElement && d.rect) {
      const svg = this.el.nativeElement;
      const rect = this.Rect.createRect(d.rect)
      this.renderer.appendChild(svg, rect);
      return rect;
    }
    return null;
  }
  createCircle(d: Data, i: number) {
    if (this.el.nativeElement && d.circle) {
      const svg = this.el.nativeElement;
      const c = this.Circle.createCircle(d.circle)
      this.renderer.appendChild(svg, c);
      return c;
    }
    return null;
  }
  createEllipse(d: Data, i: number) {
    if (this.el.nativeElement && d.ellipse) {
      const svg = this.el.nativeElement;
      const c = this.Ellipse.createEllipse(d.ellipse)
      this.renderer.appendChild(svg, c);
      return c;
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
      const newWH = this.calculateWH(d.image);
      const w = newWH.w;
      const h = newWH.h;
      switch (shape) {
        case 'circle':
          element = this.renderer.createElement('circle', 'http://www.w3.org/2000/svg');
          this.renderer.setAttribute(element, 'cx', String(x));
          this.renderer.setAttribute(element, 'cy', String(y));
          this.renderer.setAttribute(element, 'r', String(r));
          this.renderer.setAttribute(element, 'fill', '#FFF');
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
        case 'rect_3_2':
        case 'rect':
        case 'rect_4_3':
        case 'rect_16_9':
        case 'rect_1_1':
        case 'rect_5_4':
        case 'rect_3_1':
        case 'rect_7_5':
        case 'rect_2_3':
        case 'rect_3_4':
        case 'rect_9_16':
        case 'rect_4_5':
        case 'rect_5_7':
          element = this.renderer.createElement('rect', 'http://www.w3.org/2000/svg');
          this.renderer.setAttribute(element, 'x', String(x)); // X coordinate
          this.renderer.setAttribute(element, 'y', String(y)); // Y coordinate
          this.renderer.setAttribute(element, 'width', String(w)); // Width
          this.renderer.setAttribute(element, 'height', String(h)); // Height
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
        this.renderer.setAttribute(imagePattern, 'viewBox', '0 0 ' + String(w) + ' ' + String(h));


        const image = this.renderer.createElement('image', 'http://www.w3.org/2000/svg');
        this.renderer.setAttribute(image, 'x', '0');
        this.renderer.setAttribute(image, 'y', '0');
        this.renderer.setAttribute(image, 'width', String(w));
        this.renderer.setAttribute(image, 'height', String(h));
        this.renderer.setAttribute(image, 'href', imageUrl);

        const extraRect = this.renderer.createElement('rect', 'http://www.w3.org/2000/svg');
        this.renderer.setAttribute(extraRect, 'x', '0'); // X coordinate
        this.renderer.setAttribute(extraRect, 'y', '0'); // Y coordinate
        this.renderer.setAttribute(extraRect, 'width', String(w)); // Width
        this.renderer.setAttribute(extraRect, 'height', String(h)); // Height
        this.renderer.setAttribute(extraRect, 'fill', '#FFFFFF');

        d.editable && this.renderer.appendChild(imagePattern, extraRect);
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
  async createText(d: Data, i: number) {
    if (this.el.nativeElement && d.text) {
      const svg = this.el.nativeElement;
      const t = this.renderer.createElement('text', 'http://www.w3.org/2000/svg');
      const { x, y, fs, fw, text, type, controlName, api, lang, dependency, color, fontStyle, rotate, fontFamily, textShadow, backgroundColor, textEffects, textAnchor, alignmentBaseline, letterSpacing, lineHeight, textTransformation, originX, originY, opacity } = d.text;
      let textAttributes: Record<string, string> = {
        'data-type': 'text',
        'x': x.toString(),
        'y': y.toString(),
        'font-size': fs.toString(),
        'fill': color || '#000000', // Set default fill color to black if not provided
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


      // Apply background color if available
      if (d.text.backgroundColor) {
        textAttributes['background-color'] = backgroundColor;
      }
      if (textEffects) {

      }

      // Apply other text styles
      let textStyles: Record<string, string> = {
        '-webkit-user-select': 'none',
        'letter-spacing': letterSpacing ? `${letterSpacing}px` : '0',
        'line-height': d.text.lineHeight ? `${d.text.lineHeight}` : '1.5',
        'text-transform': textTransformation || 'none'
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
          const textElement = this.renderer.createText(text)
          if (controlName && lang && type && type == "select") {
            this.controlList[controlName] = { title: d.title, control: textElement, lang: lang, text: text, api: api || '', dependency: dependency || '' }
          }
          this.renderer.appendChild(t, textElement);
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
            this.renderer.appendChild(tspanElement, this.renderer.createText(line.trim()));

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
  textFormat(text: string): string[] {
    const formattedText = text.replace(/\n/g, '\n').replace(/\n(?!\*{3})/g, '***\n');
    const lines = formattedText.split('\n');
    for (let i = 0; i < lines.length; i++) {
      lines[i] = lines[i].replace(/\*\*\*/g, '\u00A0').trim();
    }
    return lines;
  }
  calculateWH(image: ImageElement): { w: number, h: number } {
    let w = 320;
    let h = 320;
    const shape = image.shape;
    const aspectRatios: AspectRatios = {
      'circle': { ratio: 1, divisor: 1 },
      'ellipse': { ratio: 1, divisor: 1 },
      'rect': { ratio: 1, divisor: 1 },
      'rect_3_2': { ratio: 3, divisor: 2 },
      'rect_4_3': { ratio: 4, divisor: 3 },
      'rect_16_9': { ratio: 16, divisor: 9 },
      'rect_1_1': { ratio: 1, divisor: 1 },
      'rect_5_4': { ratio: 5, divisor: 4 },
      'rect_3_1': { ratio: 3, divisor: 1 },
      'rect_7_5': { ratio: 7, divisor: 5 },
      'rect_2_3': { ratio: 2, divisor: 3 },
      'rect_3_4': { ratio: 3, divisor: 4 },
      'rect_9_16': { ratio: 9, divisor: 16 },
      'rect_4_5': { ratio: 4, divisor: 5 },
      'rect_5_7': { ratio: 5, divisor: 7 }
    };
    const closestMatch = aspectRatios[shape];
    if (closestMatch) {
      const r = image.r; // Assuming r is the radius
      w = r * 2;
      h = (w * closestMatch.ratio) / closestMatch.divisor;
    } else {
      console.error('Aspect ratio not defined for shape:', shape);
    }

    return { w, h };
  }

  addDraggableBehavior(elements: any): void {
    const svg = this.el.nativeElement as SVGSVGElement;
    const showControls = elements.map(() => {
      return false;
    })
    elements.forEach((element: any, index: number) => {

      const eleData = this.newFormGroupValue.data[index]
      const { boxed } = eleData;
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
            case 'ellipse':
              elementX = parseFloat(element.getAttribute('cx') || '0');
              elementY = parseFloat(element.getAttribute('cy') || '0');
              break;
            case 'svg':
              const pathBoundingBox = element.getBBox(); // Get the bounding box of the path
              elementX = pathBoundingBox.x;
              elementY = pathBoundingBox.y;
              break;
            case 'image':

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
                case 'ellipse':
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
                      break;
                  }
                }

                const adjustedX = boxed ? Math.max(minX, Math.min(newX, maxX)) : newX;
                const adjustedY = boxed ? Math.max(minY, Math.min(newY, maxY)) : newY;

                switch (true) {
                  case !!eleData.circle || !!eleData.ellipse:
                    if (eleData.circle) {
                      eleData.circle.cx = adjustedX;
                      eleData.circle.cy = adjustedY;
                    }
                    if (eleData.ellipse) {
                      eleData.ellipse.cx = adjustedX;
                      eleData.ellipse.cy = adjustedY;
                    }
                    break;
                  case !!eleData.rect || !!eleData.text || !!eleData.image:
                    if (eleData.rect) {
                      eleData.rect.x = adjustedX;
                      eleData.rect.y = adjustedY;
                      const width = element.getBBox().width;
                      const height = element.getBBox().height;
                      const transformValue = `rotate(${eleData.rect.rotate || 0} ${adjustedX + width / 2} ${adjustedY + height / 2})`;
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
                      const width = element.getBBox().width;
                      const height = element.getBBox().height;
                      const transformValue = `rotate(${eleData.image.rotate || 0} ${adjustedX + width / 2} ${adjustedY + height / 2})`;
                      this.renderer.setAttribute(element, 'transform', transformValue);
                    }
                    break;
                  default:
                    console.log('Element data not found');
                    break;
                }

                switch (elementType) {
                  case 'circle':
                  case 'ellipse':
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
        !this.loadOnly && this.eventListeners.push(mousedownListener, touchstartListener, mousemoveListener,
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
  ngOnDestroy() {
    this.removeEventListeners();
    this.destroy$.next();
    this.destroy$.complete();
    this.postDataSetSubject?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
