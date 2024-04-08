import { AfterViewInit, Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PostDetails } from 'src/app/common/interfaces/image-element';
import { PostDetailService } from 'src/app/common/services/post-detail.service';

@Component({
  selector: 'app-image-download',
  templateUrl: './image-download.component.html',
  styleUrls: ['./image-download.component.scss']
})
export class ImageDownloadComponent implements AfterViewInit {
  imgParam: any;
  postDetailsDefault: PostDetails | undefined;
  postDetails: PostDetails | undefined;
  @ViewChild('imageDraw') imageDraw!: ElementRef<SVGElement | HTMLElement>;
  constructor(
    private route: ActivatedRoute,
    private PS: PostDetailService,
    private renderer: Renderer2) {
    this.route.queryParams.subscribe(params => {
      this.imgParam = params['img'];
    });
  }
  ngAfterViewInit(): void {
    this.imgParam && this.getPostById(this.imgParam);
  }
  getPostById(postId: any): void {
    this.postDetails = undefined;
    this.PS.getPostById(postId.toString())
      .subscribe(
        post => {
          if (post) {
            console.log(post.data)
            this.postDetails = post;
            this.postDetailsDefault = post;
            this.drawSVG()
          } else {

          }
        },
        error => {
          console.error('Error fetching post:', error);
        }
      );
  }
  async drawSVG() {
    if (this.postDetailsDefault) {
      const d = this.postDetailsDefault;
      const backgroundurl = await this.getImageDataUrl(d.backgroundurl);
      const svg = this.imageDraw.nativeElement;
      while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
      }
      this.renderer.setAttribute(svg, 'viewBox', "0 0 " + (d.w || 0) + " " + (d.h || 0));
      const b = this.renderer.createElement('image', 'http://www.w3.org/2000/svg');
      this.renderer.setAttribute(b, 'x', '0');
      this.renderer.setAttribute(b, 'y', '0');
      this.renderer.setAttribute(b, 'width', '100%'); // Set width to 100%
      this.renderer.setAttribute(b, 'height', '100%'); // Set height to 100%
      this.renderer.setAttribute(b, 'preserveAspectRatio', 'xMidYMid slice'); // Use slice to cover and maintain aspect ratio
      this.renderer.setAttribute(b, 'href', backgroundurl);
      this.renderer.appendChild(svg, b);
      this.postDetails?.data.forEach(item => {
        console.log(item)
        switch (true) {
          case !!item.text:
            if (item.text) {
              const t = this.renderer.createElement('text', 'http://www.w3.org/2000/svg');
              const { x, y, fs, fw, text, color, fontStyle, textAlign, rotate, fontFamily, textShadow, backgroundColor, textEffects, textAnchor, alignmentBaseline, letterSpacing, lineHeight, textTransformation, staticValue, originX, originY, opacity } = item.text;
              if (text) {
                this.renderer.appendChild(t, this.renderer.createText(item.text.text));
              }
              this.renderer.appendChild(svg, t);
              let textAttributes: Record<string, string> = {
                'data-type': 'text',
                'x': item.text.x.toString(),
                'y': item.text.y.toString(),
                'font-size': item.text.fs.toString(),
                'fill': item.text.color || '#000000', // Set default fill color to black if not provided
                'text-anchor': item.text.textAnchor || 'start',
                'alignment-baseline': item.text.alignmentBaseline || 'middle',
                'dominant-baseline': 'reset-size',
                'font-family': item.text.fontFamily ? "'" + item.text.fontFamily + "', sans-serif" : "'Hind Vadodara', sans-serif",
                'font-weight': item.text.fw || 'normal',
                'text-decoration': item.text.fontStyle.underline ? 'underline' : 'none',
                'font-style': item.text.fontStyle.italic ? 'italic' : 'normal',
                'opacity': item.text.opacity ? item.text.opacity.toString() : '100',
              };
              if (item.text.backgroundColor) {
                textAttributes['background-color'] = item.text.backgroundColor;
              }
              if (item.text.textEffects) {

              }

              // Apply other text styles
              let textStyles: Record<string, string> = {
                '-webkit-user-select': 'none',
                'letter-spacing': item.text.letterSpacing ? `${item.text.letterSpacing}px` : 'normal',
                'line-height': item.text.lineHeight ? `${item.text.lineHeight}` : 'normal',
                'text-transform': item.text.textTransformation || 'none'
              };
              if (item.text.textShadow.enable) {
                textStyles['text-shadow'] = `${item.text.textShadow.offsetX}px ${item.text.textShadow.offsetY}px ${item.text.textShadow.blur}px ${item.text.textShadow.color}` || 'none'
              }
              Object.entries(textAttributes).forEach(([key, value]) => this.renderer.setAttribute(t, key, value));
              Object.entries(textStyles).forEach(([key, value]) => this.renderer.setStyle(t, key, value));

              if (rotate || (originX !== undefined && originY !== undefined)) {
                const bbox = t.getBBox();
                const width = bbox.width;
                const height = bbox.height;
                const transformValue = `rotate(${rotate || 0} ${x + width / 2} ${y + height / 2})`;
                this.renderer.setAttribute(t, 'transform', transformValue);
              }
            }
            break;
          case !!item.rect || !!item.circle || !!item.ellipse:
            if (item.rect) {

            }
            if (item.text) {

            }
            if (item.image) {

            }
            break;
          case !!item.image:
            if (item.image) {

            }
            break;
          default:
            console.log('Element data not found');
            break;
        }
      })
    }
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
}
