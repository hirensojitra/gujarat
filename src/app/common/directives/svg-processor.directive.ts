import { Directive, Input, ElementRef, OnInit, Renderer2, Output, EventEmitter } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import {
  PostDetails,
  RectProperties,
  CircleProperties,
  EllipseProperties,
  LineProperties,
  TextElement,
  ImageElement
} from '../interfaces/image-element';
import ColorThief from 'colorthief';

interface Data {
  title: string,
  rect?: RectProperties,
  circle?: CircleProperties,
  ellipse?: EllipseProperties,
  line?: LineProperties,
  text?: TextElement,
  image?: ImageElement
}

@Directive({
  selector: '[svgProcessor]'
})
export class SvgProcessorDirective implements OnInit {
  offsetX: number = 0;
  offsetY: number = 0;
  width: number = 0;
  height: number = 0;
  private postDataSetSubject = new Subject<PostDetails>();

  private destroy$ = new Subject<void>();
  @Input() set postDataSet(value: PostDetails) {
    this.postDataSetSubject.next(value);
  }
  postDataSet$ = this.postDataSetSubject.asObservable();

  @Output() dataChanges = new EventEmitter<{ data: Data, index: number }>();
  postData!: PostDetails;
  data: Data[] = [];
  dataLoaded: boolean = false;
  private eventListeners: (() => void)[] = [];
  constructor(private el: ElementRef<SVGSVGElement>, private renderer: Renderer2) {

  }
  get dataArray(): Data[] {
    return this.data;
  }
  createSVG(data: any) {

  }
  updateSvg(d: Data[]) { }
  async updateBackGround(backgroundUrl: string) {
    if (backgroundUrl) {
      const svg = this.el.nativeElement;
      const background = await this.getImageDataUrl(backgroundUrl);
      const b = this.renderer.createElement('image', 'http://www.w3.org/2000/svg');
      this.renderer.setAttribute(b, 'x', '0');
      this.renderer.setAttribute(b, 'data-type', 'background-img');
      this.renderer.setAttribute(b, 'y', '0');
      this.renderer.setAttribute(b, 'width', '100%'); // Set width to 100%
      this.renderer.setAttribute(b, 'height', '100%'); // Set height to 100%
      this.renderer.setAttribute(b, 'preserveAspectRatio', 'xMidYMid slice'); // Use slice to cover and maintain aspect ratio
      this.renderer.setAttribute(b, 'href', background);
      this.renderer.appendChild(svg, b);
      await this.getColors(backgroundUrl);
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
      const r = this.renderer.createElement('rect', 'http://www.w3.org/2000/svg');
      const { x, y, width, height, fill } = d.rect;
      this.renderer.setAttribute(r, 'x', String(x));
      this.renderer.setAttribute(r, 'y', String(y));
      this.renderer.setAttribute(r, 'data-type', 'rect');
      this.renderer.setAttribute(r, 'width', String(width));
      this.renderer.setAttribute(r, 'height', String(height));
      this.renderer.setAttribute(r, 'fill', fill);
      this.renderer.appendChild(svg, r);
      return r;
    }
    return null;
  }
  createCircle(d: Data, i: number) {
    if (this.el.nativeElement && d.circle) {
      const svg = this.el.nativeElement;
      const c = this.renderer.createElement('circle', 'http://www.w3.org/2000/svg');
      const { cx, cy, r, fill } = d.circle; // Assuming cx, cy, r, and fill are properties of the circle
      this.renderer.setAttribute(c, 'cx', String(cx));
      this.renderer.setAttribute(c, 'cy', String(cy));
      this.renderer.setAttribute(c, 'r', r.toString());
      this.renderer.setAttribute(c, 'data-type', 'circle');
      this.renderer.setAttribute(c, 'fill', fill);
      this.renderer.appendChild(svg, c);
      return c;
    }
    return null;
  }
  createText(d: Data, i: number) {
    if (this.el.nativeElement && d.text) {
      console.log(d.text)
      const svg = this.el.nativeElement;
      const text = this.renderer.createElement('text', 'http://www.w3.org/2000/svg');
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
      Object.entries(textAttributes).forEach(([key, value]) => this.renderer.setAttribute(text, key, value));
      Object.entries(textStyles).forEach(([key, value]) => this.renderer.setStyle(text, key, value));

      // Add text content if available
      if (d.text.text) {
        this.renderer.appendChild(text, this.renderer.createText(d.text.text));
        this.renderer.listen(text, 'click', () => {
          console.log(i);
        });
      }

      // Append the text element to the SVG
      this.renderer.appendChild(svg, text);
      return text;
    }
    return null;
  }
  textAnchor(t: string): string {
    switch (t) {
      case 'center':
        return 'middle';
      case 'left':
        return 'start';
      case 'right':
        return 'end';
      default:
        return 'middle';
    }
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
    elements.forEach((element: any, index: number) => {
      const eleData = this.postData.data[index]
      if (element) {
        let isDragging = false;
        this.renderer.setAttribute(element, 'cursor', 'grab');
        const elementType = element.getAttribute('data-type');
        const onMouseDown = (event: MouseEvent) => {
          isDragging = true;
          const svgPoint = this.getMousePosition(event, svg);
          const clickedX = svgPoint.x;
          const clickedY = svgPoint.y;
          let elementX;
          let elementY;
          if (['circle', 'image'].includes(elementType)) {
            elementX = parseFloat(element.getAttribute('cx') || '0');
            elementY = parseFloat(element.getAttribute('cy') || '0');
          } else {
            elementX = parseFloat(element.getAttribute('x') || '0');
            elementY = parseFloat(element.getAttribute('y') || '0');
          }
          this.offsetX = elementX - clickedX;
          this.offsetY = elementY - clickedY;
          this.renderer.setAttribute(element, 'cursor', 'grabbing');
        };
        const onMouseMove = (event: MouseEvent) => {
          if (isDragging) {
            const svgPoint = this.getMousePosition(event, svg);
            if (element) {
              let x, y;
              let r = 0;
              if (['circle', 'image'].includes(elementType)) {
                x = parseFloat(element.getAttribute('cx') || '0');
                y = parseFloat(element.getAttribute('cy') || '0');
                r = parseFloat(element.getAttribute('r') || '0');
              } else {
                x = parseFloat(element.getAttribute('x') || '0');
                y = parseFloat(element.getAttribute('y') || '0');
              }
              console.log(this.width, this.height);
              if (x && y) {
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
                const adjustedX = Math.floor(Math.min(Math.max(newX, minX), maxX));
                const adjustedY = Math.floor(Math.min(Math.max(newY, minY), maxY));
                switch (true) {
                  case !!eleData.circle:
                    if (eleData.circle) {
                      eleData.circle.cx = adjustedX;
                      eleData.circle.cy = adjustedY;
                    }
                    break;
                  case !!eleData.rect || !!eleData.text:
                    if (eleData.rect) {
                      eleData.rect.x = adjustedX;
                      eleData.rect.y = adjustedY;
                    }
                    if (eleData.text) {
                      eleData.text.x = adjustedX;
                      eleData.text.y = adjustedY;
                    }
                    break;
                  default:
                    console.log('Element data not found');
                    break;
                }
                if (['circle', 'image'].includes(elementType)) {
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
          isDragging && this.dataChanges.emit({ data: eleData, index: index });
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
  ngOnInit() {
    const post = this.postDataSet$;
    post.pipe(
      takeUntil(this.destroy$)
    ).subscribe((value: PostDetails) => {
      this.initSVG(value)
    });
  }
  initSVG(d: PostDetails) {
    const { id, deleted, h, w, title, backgroundUrl, data } = d;
    this.height = h;
    this.width = w;
    if (!this.postData || backgroundUrl !== this.postData.backgroundUrl) {
      this.updateBackGround(backgroundUrl);
    }
    if (!this.postData || w !== this.postData.w || h !== this.postData.h) {
      this.updateViewBox(Math.min(Math.max(w, 1024), 1920), Math.min(Math.max(h, 1024), 1920));
    }
    if (data && this.postData) {

      if (data != this.postData.data) {

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
            console.log("Removed : ", removed)
          }
        } else {
          let updateRequire = this.postData.data.map((item, index) => data[index] !== this.postData.data[index]);
          console.log(updateRequire)
          if (updateRequire) {
            let updated = this.postData.data.filter((item, index) => {
              if (data[index] !== item) {
                this.postData.data[index] = data[index];
              } return data[index] !== item
            });
            if (updated.length > 0) {
              console.log("Updated : ", updated);
              this.updateElements(this.postData.data)
            }
          }
        }
      }
    }
    if (!this.dataLoaded) {
      this.dataLoaded = true;
      this.postData = d;
    }

  }
  ngOnDestroy() {
    this.removeEventListeners();
    this.destroy$.next();
    this.destroy$.complete();
  }
}

