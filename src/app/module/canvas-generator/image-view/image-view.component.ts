import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { AvatarDetails, Post, TextDetails, TextGroupDetails } from 'src/app/common/interfaces/post';
import { PostService } from 'src/app/common/services/post.service';
declare const bootstrap: any;
@Component({
  selector: 'app-image-view',
  templateUrl: './image-view.component.html',
  styleUrls: ['./image-view.component.scss']
})
export class ImageViewComponent {
  ele: any;
  requiredName: boolean = true;
  requiredAvatar: boolean = true;
  requiredAddress: boolean = true;
  dataQuequeue: { id: number, type: string }[] = [];
  captureScreenshot() {

  }
  @ViewChild('imageDraw') imageDraw!: ElementRef<SVGElement | HTMLElement>;
  constructor(private PS: PostService, private renderer: Renderer2) {

  }
  ngOnInit(): void {
    this.PS.getPostById('1').subscribe((value: Post) => {
      this.makeDataForImage(value);
      this.checkValues(this.ele);
      
    })
  }
  async drawSVG(e: any) {
    const { background, viewBox, elements } = e;
    const backgroundUrl = await this.getImageDataUrl(background);
    const svg = this.imageDraw.nativeElement;
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }
    this.renderer.setAttribute(svg, 'viewBox', viewBox);
    const b = this.renderer.createElement('image', 'http://www.w3.org/2000/svg');
    this.renderer.setAttribute(b, 'x', '0');
    this.renderer.setAttribute(b, 'y', '0');
    this.renderer.setAttribute(b, 'width', '100%'); // Set width to 100%
    this.renderer.setAttribute(b, 'height', '100%'); // Set height to 100%
    this.renderer.setAttribute(b, 'preserveAspectRatio', 'xMidYMid slice'); // Use slice to cover and maintain aspect ratio
    this.renderer.setAttribute(b, 'href', backgroundUrl);
    this.renderer.appendChild(svg, b);
    elements.forEach((element: any) => {
      if (element.type === 'name' || element.type === 'address') {
        const text = this.renderer.createElement('text', 'http://www.w3.org/2000/svg');
        const textAttributes = {
          'data-type': element.type,
          'x': element.x.toString(),
          'y': element.y.toString(),
          'font-size': element.fs,
          'fill': '#FFF',
          'text-anchor': this.textPosition(element.textAlign),
          'dominant-baseline': 'reset-size',
        };
        let textDecoration = '';
        let fontstyle = '';
        if (element.fontStyle.underline) {
          textDecoration += 'underline ';
        }
        if (element.fontStyle.italic) {
          fontstyle += 'italic ';
        }
        const textStyles = {
          '-webkit-user-select': 'none',
          'font-family': "'Hind Vadodara', sans-serif",
          'font-weight': element.fw.toString(),
          'text-decoration': textDecoration.trim(),
          'font-style': fontstyle.trim(),
        };
        Object.entries(textAttributes).forEach(([key, value]) => this.renderer.setAttribute(text, key, value));
        Object.entries(textStyles).forEach(([key, value]) => { this.renderer.setStyle(text, key, value) });
        if (element.text) {
          this.renderer.appendChild(text, this.renderer.createText(element.text));
        }
        this.renderer.appendChild(svg, text);
      } else if (element.type === 'avatar') {
        const circle = this.renderer.createElement('circle', 'http://www.w3.org/2000/svg');
        this.renderer.setAttribute(circle, 'data-type', 'avatar');
        this.renderer.setAttribute(circle, 'cx', element.x.toString());
        this.renderer.setAttribute(circle, 'cy', element.y.toString());
        this.renderer.setAttribute(circle, 'r', element.r.toString());
        this.renderer.setAttribute(circle, 'fill', 'url(#image-pattern)');
        this.renderer.setAttribute(circle, 'stroke', element.bordercolor);
        this.renderer.setAttribute(circle, 'stroke-width', element.borderwidth);
        this.renderer.setStyle(circle, 'cursor', 'grab');
        this.renderer.setStyle(circle, 'filter', 'url(#shadow)');
        this.renderer.appendChild(svg, circle);
        const imagePattern = this.renderer.createElement('pattern', 'http://www.w3.org/2000/svg');
        this.renderer.setAttribute(imagePattern, 'id', 'image-pattern');
        this.renderer.setAttribute(imagePattern, 'x', '0%');
        this.renderer.setAttribute(imagePattern, 'y', '0%');
        this.renderer.setAttribute(imagePattern, 'height', '100%');
        this.renderer.setAttribute(imagePattern, 'width', '100%');
        this.renderer.setAttribute(imagePattern, 'viewBox', '0 0 100 100');
        const image = this.renderer.createElement('image', 'http://www.w3.org/2000/svg');
        this.renderer.setAttribute(image, 'x', '0');
        this.renderer.setAttribute(image, 'y', '0');
        this.renderer.setAttribute(image, 'width', '100');
        this.renderer.setAttribute(image, 'height', '100');
        this.renderer.setAttribute(image, 'href', element.imageUrl);
        this.renderer.appendChild(imagePattern, image);
        this.renderer.appendChild(svg, imagePattern);
      }
    })
  }
  async makeDataForImage(d: Post) {
    const { w, h, backgroundUrl, data } = d.details;
    this.ele = {
      svgWidth: w || 0,
      svgHeight: h || 0,
      background: backgroundUrl || '',
      viewBox: "0 0 " + (w || 0) + " " + (h || 0),
      elements: data.map((item, index) => {
        if (item.type === 'text_group') {
          return {
            index: index,
            type: 'text_group',
            data: (item as TextGroupDetails).data.map((textItem: TextDetails, index) => {
              return {
                index: index,
                type: textItem.type,
                x: textItem.x,
                y: textItem.y,
                fs: textItem.fs,
                fw: textItem.fw,
                fontStyle: {
                  italic: textItem.fontStyle?.italic || false,
                  underline: textItem.fontStyle?.underline || false
                },
                textAlign: textItem.textAlign || ''
              };
            })
          };
        } else if (item.type === 'avatar') {
          return {
            index: index,
            type: 'avatar',
            r: (item as AvatarDetails).r || 0,
            borderwidth: (item as AvatarDetails).borderwidth || 0,
            bordercolor: (item as AvatarDetails).bordercolor || '',
            x: (item as AvatarDetails).x || 0,
            y: (item as AvatarDetails).y || 0
          };
        } else if (item.type === 'name' || item.type === 'address') {
          return {
            index: index,
            type: item.type,
            x: item.x,
            y: item.y,
            fs: item.fs,
            fw: item.fw,
            fontStyle: {
              italic: item.fontStyle?.italic || false,
              underline: item.fontStyle?.underline || false
            },
            textAlign: item.textAlign || ''
          };
        } else {
          return {
            index: index,
          };
        }
      }).filter(item => item !== null)
    };
    console.log(this.ele)
  }
  async checkValues(e: any) {
    let d: { id: number, type: string }[] = [];
    e.elements.map(async (element: any, index: number) => {
      let isAvailable = false;
      switch (element.type) {
        case 'name':
          isAvailable = element.text ? true : false;
          break;
        case 'address':
          isAvailable = element.text ? true : false;
          break;
        case 'avatar':
          isAvailable = element.imageUrl ? true : false;
          break;
        default:
          // Handle other types or provide a default case
          console.log('Unknown element type');
          break;
      }
      !isAvailable ? d.push({ id: index, type: element.type }) : () => {

      };
    });
    this.dataQuequeue = d;
    
  }
  async getImageDataUrl(imageUrl: string): Promise<string> {
    try {
      // Fetch the image
      const response = await fetch(imageUrl);
      const blob = await response.blob();

      // Convert the blob to a data URL
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error fetching or converting image:', error);
      throw error;
    }
  }
  textPosition(t: string): string {
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
  checkTypeValues(element: any) {
    const elementType = element.type;
    let isAvailable = true;
    switch (elementType) {
      case 'name':
        if (element.name == 'name' || undefined || null) {
          this.setInput(element.name);
        }
        isAvailable = false;
        break;
      case 'address':
        console.log('Processing address element');
        break;
      case 'avatar':
        if (element.imageUrl) {
          this.setInput(element.name);
        }
        break;
      default:
        console.log('Unknown element type');
        break;
    }
  }
  setInput(input: string, img?: boolean) {

  }
}


