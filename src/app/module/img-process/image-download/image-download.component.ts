import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { PostDetails } from 'src/app/common/interfaces/image-element';
import { PostDetailService } from 'src/app/common/services/post-detail.service';
declare const bootstrap: any;
interface data {
  id: string;
  value: string;
}
@Component({
  selector: 'app-image-download',
  templateUrl: './image-download.component.html',
  styleUrls: ['./image-download.component.scss']
})
export class ImageDownloadComponent implements AfterViewInit, OnInit {
  downloaded: boolean = false;
  imgParam: any;
  postDetailsDefault: PostDetails | undefined;
  postDetails: PostDetails | undefined;
  postStatus: string | undefined = 'loading';
  isDeleted: boolean | undefined;
  @ViewChild('imageDraw') imageDraw!: ElementRef<SVGElement | HTMLElement>;
  selectedIndex: number | null = null;
  selectedID: string | null = null;

  textModal: any;
  textModalTitle: string | undefined = '';
  inputTextForm: FormGroup;
  @ViewChild('textInput') textInput!: ElementRef;

  myInfo: any;
  encodedText = encodeURIComponent("Hello, Hiren!\nI'm interested to create Poster Generate Link");
  cropperModal: any;
  imgModalTitle: string = '';
  cropper!: Cropper;
  cropperModalTitle: string | undefined = '';
  inputImageForm: FormGroup;
  @ViewChild('imageInput') imageInput!: ElementRef;

  dataset: data[] = [];
  constructor(
    private route: ActivatedRoute,
    private PS: PostDetailService,
    private renderer: Renderer2,
    private fb: FormBuilder,
    private elementRef: ElementRef,
    private meta: Meta,
    private titleService: Title) {
    this.route.queryParams.subscribe(params => {
      this.imgParam = params['img'];
    });
    this.inputTextForm = this.fb.group({
      text: ['', Validators.required]
    });
    this.inputImageForm = this.fb.group({
      image: ['']
    })
  }
  ngOnInit(): void {
    this.textModal = new bootstrap.Modal(document.getElementById('textModal')!, { focus: false, keyboard: false, static: false });
    this.textModal._element.addEventListener('hide.bs.modal', () => {
      this.inputTextForm.reset();
    });
    this.textModal._element.addEventListener('show.bs.modal', () => {
    });
    this.textModal._element.addEventListener('shown.bs.modal', () => {
      this.textInput.nativeElement.focus();
    });

    this.myInfo = new bootstrap.Modal(document.getElementById('myInfo')!, { focus: false, keyboard: false, static: false });

    this.cropperModal = new bootstrap.Modal(document.getElementById('cropperModal')!, { focus: false, keyboard: false, static: false });
    this.cropperModal._element.addEventListener('hide.bs.modal', () => {
      if (this.cropper) {
        this.cropper.destroy();
      }
    });
    this.cropperModal._element.addEventListener('show.bs.modal', () => {

    });
  }
  ngAfterViewInit(): void {
    this.imgParam ??= '5';
    this.imgParam && this.getPostById(this.imgParam);
  }

  getPostById(postId: any): void {
    this.postDetails = undefined;
    this.postDetailsDefault = undefined;
    this.PS.getPostById(postId.toString())
      .subscribe(
        post => {
          if (post) {
            const p = JSON.parse(JSON.stringify(post));
            this.isDeleted = post.deleted;
            if (!post.deleted) {
              this.postDetails = post;
              this.postDetailsDefault = p;
              this.drawSVG()
              this.meta.updateTag({ property: 'og:title', content: this.postDetails.title });
              this.titleService.setTitle(this.postDetails.title);
              this.postStatus = 'Total Download: ' + post.download_counter
            } else if (post.deleted && post.msg) {
              this.postStatus = post.msg
            }
          } else {
            this.postStatus = undefined;
          }
        },
        error => {
          this.postStatus = undefined;
          console.error('Error fetching post:', error);
        }
      );
  }
  async drawSVG() {
    if (this.postDetails) {
      const backgroundurl = await this.getImageDataUrl(this.postDetails.backgroundurl);
      const svg = this.imageDraw.nativeElement;
      while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
      }
      this.renderer.setAttribute(svg, 'viewBox', "0 0 " + (this.postDetails.w || 0) + " " + (this.postDetails.h || 0));
      const b = this.renderer.createElement('image', 'http://www.w3.org/2000/svg');
      this.renderer.setAttribute(b, 'x', '0');
      this.renderer.setAttribute(b, 'y', '0');
      this.renderer.setAttribute(b, 'width', '100%'); // Set width to 100%
      this.renderer.setAttribute(b, 'height', '100%'); // Set height to 100%
      this.renderer.setAttribute(b, 'preserveAspectRatio', 'xMidYMid slice'); // Use slice to cover and maintain aspect ratio
      this.renderer.setAttribute(b, 'href', backgroundurl);
      this.renderer.appendChild(svg, b);
      let s = 0;
      this.postDetails?.data.forEach((item, i) => {
        const uniqueId = item.editable ? this.dataset[s]?.id || Math.random().toString(36).substr(2, 9) : Math.random().toString(36).substr(2, 9);
        switch (true) {
          case !!item.text:
            if (item.text) {
              const t = this.renderer.createElement('text', 'http://www.w3.org/2000/svg');
              let { x, y, fs, fw, text, color, fontStyle, textAlign, rotate, fontFamily, textShadow, backgroundColor, textEffects, textAnchor, alignmentBaseline, letterSpacing, lineHeight, textTransformation, originX, originY, opacity } = item.text;
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
                'font-weight': fw || 'normal',
                'text-decoration': fontStyle.underline ? 'underline' : 'none',
                'font-style': fontStyle.italic ? 'italic' : 'normal',
                'opacity': opacity ? opacity.toString() : '100',
              };
              if (backgroundColor) {
                textAttributes['background-color'] = backgroundColor;
              }
              if (textEffects) {

              }
              // Apply other text styles
              let textStyles: Record<string, string> = {
                '-webkit-user-select': 'none',
                'letter-spacing': letterSpacing ? `${letterSpacing}px` : 'normal',
                'line-height': lineHeight ? `${lineHeight}` : 'normal',
                'text-transform': textTransformation || 'none'
              };
              if (textShadow.enable) {
                textStyles['text-shadow'] = `${textShadow.offsetX}px ${textShadow.offsetY}px ${textShadow.blur}px ${textShadow.color}` || 'none'
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
              this.renderer.setAttribute(t, 'data-id', uniqueId);

              if (this.dataset[s] == undefined && item.editable) { this.dataset.push({ id: uniqueId, value: '' }); }
              item.editable && this.renderer.listen(t, 'click', () => {
                this.selectedIndex = i;
                this.selectedID = uniqueId;
                this.setText();
              });
              if (item.editable) { s++ }
            }
            break;
          case !!item.rect:
            if (item.rect) {
              const rect = this.renderer.createElement('rect', 'http://www.w3.org/2000/svg');
              const { x, y, width, height, fill, opacity, originX, originY, rotate } = item.rect;
              this.renderer.setAttribute(rect, 'x', String(x));
              this.renderer.setAttribute(rect, 'y', String(y));
              this.renderer.setAttribute(rect, 'width', String(width));
              this.renderer.setAttribute(rect, 'height', String(height));
              this.renderer.setAttribute(rect, 'fill', fill);
              this.renderer.setAttribute(rect, 'opacity', String(opacity));
              if (rotate || (originX !== undefined && originY !== undefined)) {
                const transformValue = `rotate(${rotate || 0} ${x + width / 2} ${y + height / 2})`;
                this.renderer.setAttribute(rect, 'transform', transformValue);
              }
              this.renderer.setAttribute(rect, 'data-type', 'rect');
              this.renderer.appendChild(svg, rect);
              return rect;
            }
            break;
          case !!item.circle:
            if (item.circle) {
              const c = this.renderer.createElement('circle', 'http://www.w3.org/2000/svg');
              const { cx, cy, r, fill, opacity } = item.circle;
              this.renderer.setAttribute(c, 'cx', String(cx));
              this.renderer.setAttribute(c, 'cy', String(cy));
              this.renderer.setAttribute(c, 'r', r.toString());
              this.renderer.setAttribute(c, 'data-type', 'circle');
              this.renderer.setAttribute(c, 'fill', fill);
              this.renderer.setAttribute(c, 'opacity', String(opacity));
              this.renderer.appendChild(svg, c);
              return c;
            }
            break;
          case !!item.image:
            if (item.image) {
              const { x, y, r, imageUrl, borderColor, borderWidth, shape, origin, placeholder, svgProperties, rotate } = item.image;
              let element: any;
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
                const id = uniqueId;
                this.renderer.setAttribute(element, 'fill', 'url(#' + id + ')');
                this.renderer.setStyle(element, 'cursor', 'pointer');
                this.renderer.setStyle(element, 'filter', 'url(#shadow)');
                const imagePattern = this.renderer.createElement('pattern', 'http://www.w3.org/2000/svg');
                this.renderer.setAttribute(imagePattern, 'id', id);
                this.renderer.setAttribute(imagePattern, 'x', '0');
                this.renderer.setAttribute(imagePattern, 'y', '0');
                this.renderer.setAttribute(imagePattern, 'height', '100%');
                this.renderer.setAttribute(imagePattern, 'width', '100%');
                this.renderer.setAttribute(imagePattern, 'viewBox', '0 0 ' + String(r * 2) + ' ' + String(r * 2));
                this.renderer.setAttribute(element, 'data-id', uniqueId);
                if (this.dataset[s] == undefined && item.editable) { this.dataset.push({ id: uniqueId, value: '' }); }
                item.editable && this.renderer.listen(element, 'click', () => {
                  this.selectedIndex = i;
                  this.selectedID = uniqueId;
                  this.setImage();
                });
                if (item.editable) { s++ }
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
            break;
          default:
            console.log('Element data not found');
            break;
        }
      })

    }
    this.downloaded = false;
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
  setText() {
    this.inputTextForm.reset();
    const i = this.selectedIndex;
    if (i !== null) {
      const t = this.postDetails?.data[i].text?.text;
      const dt = this.postDetailsDefault?.data[i].text?.text;
      let v = (t == dt) ? '' : t;
      this.inputTextForm.get('text')?.setValue(v);
      this.textInput.nativeElement.placeholder = dt;
      this.textModalTitle = this.postDetails?.data[i].title || undefined;
      this.textModal.show();
    }
  }
  setImage() {
    this.inputImageForm.reset();
    const i = this.selectedIndex;
    if (i !== null) {
      const t = this.postDetails?.data[i].image?.imageUrl;
      const dt = this.postDetailsDefault?.data[i].image?.imageUrl;
      let v = (t == dt) ? dt : t;
      this.inputImageForm.get('image')?.setValue(v);
      this.cropperModalTitle = this.postDetails?.data[i].title || undefined;
      this.cropperModal.show();
    }
  }

  onTextSubmit() {
    if (this.selectedIndex !== null && this.postDetails?.data) {
      this.postDetails.data = this.postDetails.data.map((item, index) => {
        if (index === this.selectedIndex && item.text) {
          let v = this.inputTextForm.get('text')?.value;
          if (this.selectedID) {
            const elementToChange = this.elementRef.nativeElement.querySelector(`[data-id="${this.selectedID}"]`);
            if (elementToChange) {
              const filteredItems = this.dataset.filter(item => item.id === this.selectedID);
              if (filteredItems[0]) {
                filteredItems[0].value = v || item.text.text;
              }
            }
          }
          return { ...item, text: { ...item.text, text: v } };
        }
        return item;
      });
    }
    this.drawSVG();
    this.textModal.hide();
  }

  onImageSubmit() {
    this.handleCropEvent()
    if (this.selectedIndex !== null && this.postDetails?.data) {
      this.postDetails.data = this.postDetails.data.map((item, index) => {
        if (index === this.selectedIndex && item.image) {
          let v = this.inputImageForm.get('image')?.value;
          if (this.selectedID) {
            const elementToChange = this.elementRef.nativeElement.querySelector(`[data-id="${this.selectedID}"]`);
            if (elementToChange) {
              const filteredItems = this.dataset.filter(item => item.id === this.selectedID);
              if (filteredItems[0]) {
                filteredItems[0].value = v || item.image.imageUrl;
              }
            }
          }
          return { ...item, image: { ...item.image, imageUrl: v } };
        }
        return item;
      });
    }
    this.drawSVG();
    this.cropperModal.hide();
  }

  checkDownload(t: string): boolean {
    for (const item of this.dataset) {
      if (item.value == '') {
        const elementToClick = this.elementRef.nativeElement.querySelector(`[data-id="${item.id}"]`);
        if (elementToClick) {
          const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
          });
          elementToClick.dispatchEvent(clickEvent);
        }
        return false;
      }
    }
    switch (t) {
      case 'download':
        this.capturePhoto();
        break;
      case 'whatsapp':
        this.capturePhoto();
        break;
      default:
        this.capturePhoto();
        break;
    }
    return true
  }
  handleImageInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement.files?.[0];
    if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageSrc = e.target?.result as string;
        // Open Bootstrap modal dialog with Cropper

        this.cropperModal.show();
        // Initialize Cropper
        const cropperElement = document.getElementById('cropper') as HTMLImageElement;
        this.cropper = new Cropper(cropperElement, {
          aspectRatio: 1,
          scalable: true,
          viewMode: 3, // Ensure the crop box is always within the container
          crop: (event) => {

          },
          autoCropArea: 1, // Ensure the initial crop area covers the entire image
          dragMode: 'move', // Allow dragging to move the image within the container
          responsive: true, // Update crop box on resize
          cropBoxResizable: false, // Disable resizing the crop box
          minCropBoxWidth: 320,
          minCropBoxHeight: 320,
          minContainerWidth: 320,
          minContainerHeight: 320
        });

        // Set image source for Cropper
        this.cropper.replace(imageSrc);
      };
      reader.readAsDataURL(file);
    } else {
    }
  }
  handleCropEvent(): void {
    if (this.cropper) {
      const croppedCanvas = this.cropper.getCroppedCanvas();
      const resizedCanvas = document.createElement('canvas');
      const resizedContext = resizedCanvas.getContext('2d')!;
      resizedCanvas.width = 800;
      resizedCanvas.height = 800;
      resizedContext.drawImage(croppedCanvas, 0, 0, 800, 800);
      const resizedImageData = resizedCanvas.toDataURL('image/png'); // Adjust format as needed
      this.inputImageForm.get('image')?.setValue(resizedImageData);
    }
  }
  openImageCropperDialog(): void {
    const inputElement = this.imageInput.nativeElement;
    if (inputElement) {
      inputElement.click(); // Trigger click on the hidden file input
      inputElement.value = null;
    }
    this.cropperModal.hide();
  }
  // capturePhoto() {
  //   // Get the SVG element
  //   const svgElement = this.imageDraw.nativeElement;

  //   // Extract viewBox dimensions
  //   const viewBoxAttr = svgElement.getAttribute('viewBox') || '';
  //   const viewBoxValues = viewBoxAttr.split(' ').map(Number);
  //   const viewBoxWidth = viewBoxValues[2];
  //   const viewBoxHeight = viewBoxValues[3];

  //   // Create a new canvas element
  //   const canvas = document.createElement('canvas');
  //   const context = canvas.getContext('2d');

  //   // Set canvas dimensions to match the viewBox dimensions
  //   canvas.width = viewBoxWidth;
  //   canvas.height = viewBoxHeight;

  //   // Create a new Image object
  //   const image = new Image();

  //   // Create a new XMLSerializer object to serialize the SVG element
  //   const serializer = new XMLSerializer();
  //   const svgString = serializer.serializeToString(svgElement);
  //   image.onload = () => {
  //     context?.drawImage(image, 0, 0);
  //     const dataURL = canvas.toDataURL('image/png');
  //     const timestamp = new Date().toISOString().replace(/:/g, '-');
  //     const fileName = `IMG-${timestamp}.png`;
  //     const link = document.createElement('a');
  //     link.href = dataURL;
  //     link.download = fileName;
  //     !this.downloaded && this.PS.updateDownloadCounter(this.imgParam)
  //       .subscribe(
  //         post => {
  //           if (post) {
  //             const p = JSON.parse(JSON.stringify(post));
  //             this.postStatus = p.download_counter;
  //           } else {

  //           }
  //         },
  //         error => {
  //           console.error('Error fetching post:', error);
  //         }
  //       )
  //     this.downloaded = true;
  //     link.click();
  //   };

  //   // Set the source of the image after defining the onload handler
  //   image.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
  // }
  capturePhoto() {
    // Get the SVG element
    const svgElement = this.imageDraw.nativeElement;

    // Extract viewBox dimensions
    const viewBoxAttr = svgElement.getAttribute('viewBox') || '';
    const viewBoxValues = viewBoxAttr.split(' ').map(Number);
    const viewBoxWidth = viewBoxValues[2];
    const viewBoxHeight = viewBoxValues[3];

    // Create a new canvas element
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    // Set canvas dimensions to match the viewBox dimensions
    canvas.width = viewBoxWidth;
    canvas.height = viewBoxHeight;

    // Create a new Image object
    const image = new Image();

    // Create a new XMLSerializer object to serialize the SVG element
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    image.onload = () => {
      context?.drawImage(image, 0, 0);
      const dataURL = canvas.toDataURL('image/png');
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const fileName = `IMG-${timestamp}.png`;

      // Convert data URL to Blob
      const byteString = atob(dataURL.split(',')[1]);
      const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([arrayBuffer], { type: mimeString });

      // Create an object URL from the Blob
      const objectURL = window.URL.createObjectURL(blob);

      // Create a link element and trigger the download
      const link = document.createElement('a');
      link.href = objectURL;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(objectURL);

      // Update download counter
      if (!this.downloaded) {
        this.PS.updateDownloadCounter(this.imgParam).subscribe(
          post => {
            if (post) {
              const p = JSON.parse(JSON.stringify(post));
              this.postStatus = p.download_counter;
            }
          },
          error => {
            console.error('Error fetching post:', error);
          }
        );
        this.downloaded = true;
      }
    };

    // Set the source of the image after defining the onload handler
    image.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
  }

  async shareToWhatsApp() {
    // URL of the exported image
    try {
      const imageUrl = await this.getImageDataURL();
      if (imageUrl) {
        // Description to be shared
        const description = 'Check out this image!';

        // URL of the current window
        const currentUrl = window.location.href;

        // Construct the WhatsApp message
        const message = `${description}\n${currentUrl}`;

        // Construct the WhatsApp sharing URL
        const whatsappUrl = `whatsapp://send?text=${encodeURIComponent(message)}&image=${encodeURIComponent(imageUrl)}`;

        // Open the WhatsApp sharing URL
        window.open(whatsappUrl, '_blank');
      } else {
        console.error('Failed to retrieve image data URL.');
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
    }
  }
  async getImageDataURL(): Promise<string | null> {
    // Get the SVG element
    const svgElement = this.imageDraw.nativeElement;

    // Create a new canvas element
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      console.error('Canvas context is not available.');
      return null;
    }

    // Extract viewBox dimensions
    const viewBoxAttr = svgElement.getAttribute('viewBox') || '';
    const viewBoxValues = viewBoxAttr.split(' ').map(Number);
    const viewBoxWidth = viewBoxValues[2];
    const viewBoxHeight = viewBoxValues[3];

    // Set canvas dimensions to match the viewBox dimensions
    canvas.width = viewBoxWidth;
    canvas.height = viewBoxHeight;

    // Create a new Image object
    const image = new Image();

    // Create a new XMLSerializer object to serialize the SVG element
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);

    // Define a promise to handle image loading
    return new Promise<string>((resolve, reject) => {
      image.onload = () => {
        context.drawImage(image, 0, 0);
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };
      image.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
    });
  }

  textFormat(text: string): string[] {
    const formattedText = text.replace(/\n/g, '\n').replace(/\n(?!\*{3})/g, '***\n');
    const lines = formattedText.split('\n');
    for (let i = 0; i < lines.length; i++) {
      lines[i] = lines[i].replace(/\*\*\*/g, '\u00A0');
    }
    return lines;
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
  copyAddressToClipboard(): void {
    // Check if the Clipboard API is supported
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      // If not supported, fallback to older method (e.g., document.execCommand for older browsers)
      this.copyAddressFallback();
      return;
    }

    // Get the current URL
    const currentUrl = window.location.href;

    // Copy the current URL to the clipboard
    navigator.clipboard.writeText(currentUrl)
      .then(() => {
        console.log('Address copied to clipboard');
      })
      .catch(error => {
        console.error('Error copying address to clipboard:', error);
      });
  }

  copyAddressFallback(): void {
    // Create a temporary input element
    const tempInput = document.createElement('input');
    tempInput.value = window.location.href;

    // Append the input element to the document body
    document.body.appendChild(tempInput);

    // Select the input element
    tempInput.select();

    try {
      // Execute the copy command
      document.execCommand('copy');
      console.log('Address copied to clipboard');
    } catch (error) {
      console.error('Error copying address to clipboard:', error);
    } finally {
      // Remove the input element from the document body
      document.body.removeChild(tempInput);
    }
  }
}
