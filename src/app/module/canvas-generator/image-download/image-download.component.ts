import { AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  imgParam: any;
  postDetailsDefault: PostDetails | undefined;
  postDetails: PostDetails | undefined;

  @ViewChild('imageDraw') imageDraw!: ElementRef<SVGElement | HTMLElement>;

  selectedIndex: number | null = null;
  selectedID: string | null = null;

  textModal: any;
  textModalTitle: string | undefined = '';
  inputTextForm: FormGroup;
  @ViewChild('textInput') textInput!: ElementRef;

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
    private elementRef: ElementRef) {
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
            this.postDetails = post;
            this.postDetailsDefault = p;
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
    if (this.postDetails) {
      console.log(this.postDetails)
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
        const uniqueId = this.dataset[s]?.id || Math.random().toString(36).substr(2, 9);
        switch (true) {
          case !!item.text:
            if (item.text) {
              const t = this.renderer.createElement('text', 'http://www.w3.org/2000/svg');
              let { x, y, fs, fw, text, color, fontStyle, textAlign, rotate, fontFamily, textShadow, backgroundColor, textEffects, textAnchor, alignmentBaseline, letterSpacing, lineHeight, textTransformation, originX, originY, opacity } = item.text;
              if (text) {
                this.renderer.appendChild(t, this.renderer.createText(text));
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
                'data-id': uniqueId
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
              this.dataset[s] == undefined && item.editable && this.dataset.push({ id: uniqueId, value: '' })
              item.editable && this.renderer.listen(t, 'click', () => {
                this.selectedIndex = i;
                this.selectedID = uniqueId;
                this.setText();
              });
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
          case !!item.circle || !!item.ellipse:
            if (item.text) {

            }
            if (item.image) {

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

                this.dataset[s] == undefined && item.editable && this.dataset.push({ id: uniqueId, value: '' })
                item.editable && this.renderer.listen(element, 'click', () => {
                  this.selectedIndex = i;
                  this.selectedID = uniqueId;
                  this.setImage();

                });
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
        s++;
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
              console.log(filteredItems)
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
              console.log(filteredItems)
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
      if (!item.value) {
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
    this.capturePhoto();
    return true;
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
      resizedCanvas.width = 200;
      resizedCanvas.height = 200;
      resizedContext.drawImage(croppedCanvas, 0, 0, 200, 200);
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

    // Set the Image source to a data URL representing the SVG element
    image.onload = () => {
      // Draw the Image onto the canvas
      context?.drawImage(image, 0, 0);

      // Convert the canvas to a data URL representing a PNG image
      const dataURL = canvas.toDataURL('image/png');

      // Create a timestamp for the file name
      const timestamp = new Date().toISOString().replace(/:/g, '-');

      // Create the file name
      const fileName = `IMG-${timestamp}.png`;

      // Create a temporary anchor element
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = fileName;

      // Simulate a click on the anchor element to trigger the download
      link.click();
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
        // Draw the Image onto the canvas
        context.drawImage(image, 0, 0);

        // Convert the canvas to a data URL representing a PNG image
        const dataURL = canvas.toDataURL('image/png');
        resolve(dataURL);
      };

      // Set the source of the image after defining the onload handler
      image.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgString)));
    });
  }
}
