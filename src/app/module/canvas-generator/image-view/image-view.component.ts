import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AvatarDetails, Post, TextDetails, TextGroupDetails } from 'src/app/common/interfaces/post';
import { PostService } from 'src/app/common/services/post.service';
import { SVGImageService } from 'src/app/common/services/svgimage-service.service';
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
  requiredValues: { defaultValue: string, type: string, value: string, id: number }[] = [];

  textModal: any;
  textModalTitle: string = '';

  cropperModal: any;
  imgModalTitle: string = '';
  cropper!: Cropper;

  @ViewChild('textInput') textInput!: ElementRef;
  @ViewChild('imageDraw') imageDraw!: ElementRef<SVGElement | HTMLElement>;
  @ViewChild('imageInput') imageInput!: ElementRef;
  inputTextForm: FormGroup;
  profilePictureForm: FormGroup<any>;
  getDownload: boolean = false;
  constructor(private PS: PostService, private fb: FormBuilder, private renderer: Renderer2, private IMG: SVGImageService,
    private route: ActivatedRoute) {
    this.inputTextForm = this.fb.group({
      text: ['', Validators.required],
      id: ['']
    });
    this.profilePictureForm = this.fb.group({
      id: ['', Validators.required],
      image: ['']
    })
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const imgParam = params['img'];
      if (imgParam) {
        this.getPostById(imgParam);
      } else {
        window.close();
      }
    });

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
  getPostById(postId: any): void {
    this.PS.getPostById(postId).subscribe((value: Post) => {
      console.log(value)
      this.ele = this.IMG.makeDataForImage(value);
      this.drawSVG(this.ele);
    })
  }
  async drawSVG(e: any) {
    this.requiredValues = [];
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

    elements.map((element: any, index: number) => {
      if (element.type === 'name' || element.type === 'address') {
        const text = this.renderer.createElement('text', 'http://www.w3.org/2000/svg');
        const textAttributes = {
          'data-type': element.type,
          'x': element.x.toString(),
          'y': element.y.toString(),
          'font-size': element.fs,
          'fill': element.color,
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
        const defaultText = "Enter " + element.type;
        this.requiredValues.push({
          defaultValue: defaultText.toUpperCase(),
          type: element.type,
          value: (element.text).trim() || '',
          id: index
        })
        if (element.text !== undefined) {
          element.text = (element.text == "") ? ("Enter " + element.type).toUpperCase() : element.text;
          this.renderer.appendChild(text, this.renderer.createText(element.text));
        }
        this.renderer.appendChild(svg, text);

        text.addEventListener('click', (event: Event) => {
          this.setText(index)
        });

      } else if (element.type === 'avatar') {
        const circle = this.renderer.createElement('circle', 'http://www.w3.org/2000/svg');
        this.renderer.setAttribute(circle, 'data-type', 'avatar');
        this.renderer.setAttribute(circle, 'cx', element.x.toString());
        this.renderer.setAttribute(circle, 'cy', element.y.toString());
        this.renderer.setAttribute(circle, 'r', element.r.toString());
        this.renderer.setAttribute(circle, 'fill', 'url(#image-pattern)');
        this.renderer.setAttribute(circle, 'stroke', element.bordercolor);
        this.renderer.setAttribute(circle, 'stroke-width', element.borderwidth);
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
        const defaultText = "Select " + element.type;
        this.requiredValues.push({
          defaultValue: defaultText.toUpperCase(),
          type: element.type,
          value: (element.imageUrl).trim() || '',
          id: index
        })
        circle.addEventListener('click', (event: Event) => {
          this.setImage(index)
        });
      }
    })
    this.checkConditions(this.requiredValues)
  }

  checkConditions(items: any[]) {
    this.getDownload = true; // Reset getDownload flag

    for (let item of items) {
      if (item.type === 'name' || item.type === 'address') {
        if (item.value === '' || item.value === item.defaultValue) {
          this.getDownload = false;
          break; // No need to continue checking if condition is met
        }
      } else if (item.type === 'avatar') {
        if (item.value === 'assets/images/jpeg/profile-1.jpeg') {
          this.getDownload = false;
          break; // No need to continue checking if condition is met
        }
      }
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
  openImageCropperDialog(): void {
    const inputElement = this.imageInput.nativeElement;
    if (inputElement) {
      inputElement.click(); // Trigger click on the hidden file input
      inputElement.value = null;
    }
    this.cropperModal.hide();
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
      this.profilePictureForm.get('image')?.setValue(resizedImageData);
    }
  }
  setText(index: number) {
    this.requiredValues.map((element: { defaultValue: string, type: string, value: string, id: number }) => {
      if (element.id === index) {
        element.value !== element.defaultValue && this.inputTextForm.get('text')?.setValue(element.value, { emitEvent: false });
        this.inputTextForm.get('id')?.setValue(element.id, { emitEvent: false });
        this.textModalTitle = element.defaultValue.toUpperCase();
        this.textModal.show();
      }
    });
  }
  setImage(index: number) {
    this.requiredValues.map((element: { defaultValue: string, type: string, value: string, id: number }) => {
      if (element.id === index) {
        this.profilePictureForm.get('image')?.setValue(element.value, { emitEvent: false });
        this.profilePictureForm.get('id')?.setValue(element.id, { emitEvent: false });
        this.imgModalTitle = element.defaultValue.toUpperCase();
        this.cropperModal.show();
      }
    });
  }
  onTextSubmit() {
    const v = this.inputTextForm.value;
    this.ele.elements.map((element: any) => {
      if (element.index == v['id']) {
        if (element.type == 'name' ||
          element.type == 'address') {
          element.text = v['text'];
          this.drawSVG(this.ele);
          this.textModal.hide();
        }
      }
    });
  }

  onImageSubmit() {
    this.handleCropEvent()
    const v = this.profilePictureForm.value;
    this.ele.elements.map((element: any) => {
      if (element.index == v['id']) {
        if (element.type == 'avatar') {
          element.imageUrl = v['image'];
          this.drawSVG(this.ele);
          this.cropperModal.hide();
        }
      }
    });
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

}




