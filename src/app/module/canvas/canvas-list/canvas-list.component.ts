import { Component, ViewChild, ElementRef, Renderer2, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/common/interfaces/commonInterfaces';
import { UserService } from 'src/app/common/services/user.service';

@Component({
  selector: 'app-canvas-list',
  templateUrl: './canvas-list.component.html',
  styleUrls: ['./canvas-list.component.scss']
})
export class CanvasListComponent implements AfterViewInit {
  @ViewChild('imageDraw') imageDraw!: ElementRef<SVGElement | HTMLElement>;

  viewBox = "0 0 1024 1024";
  svgWidth = 1024;
  svgHeight = 1024;
  backgroundUrl = 'https://images.unsplash.com/photo-1682685796063-d2604827f7b3?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
  elements: any = [];
  userSubscription: any;
  user!: User;
  offsetX = 0;
  offsetY = 0;
  selectedElement: any;
  elementForm!: FormGroup | null;
  constructor(private renderer: Renderer2, private US: UserService, private fb: FormBuilder) {

  }

  ngAfterViewInit(): void {
    this.userSubscription = this.US.getUser().subscribe((user: User | null) => {
      if (user) {
        this.user = user;
        this.elements = [
          { type: 'text', x: 300, y: 30, text: 'John Doe' },
          { type: 'avatar', x: 300, y: 300, r: 100, imageUrl: this.user.image || 'assets/images/jpeg/profile-1.jpeg' },
        ]
        this.drawCanvas();
      }
    });
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

  async drawCanvas() {
    this.backgroundUrl = await this.getImageDataUrl(this.backgroundUrl);
    const svg = this.imageDraw.nativeElement;
    // Set viewBox and dimensions
    this.renderer.setAttribute(svg, 'viewBox', this.viewBox);
    // Draw background
    const background = this.renderer.createElement('image', 'http://www.w3.org/2000/svg');
    this.renderer.setAttribute(background, 'x', '0');
    this.renderer.setAttribute(background, 'y', '0');
    this.renderer.setAttribute(background, 'width', '100%'); // Set width to 100%
    this.renderer.setAttribute(background, 'height', '100%'); // Set height to 100%
    this.renderer.setAttribute(background, 'preserveAspectRatio', 'xMidYMid slice'); // Use slice to cover and maintain aspect ratio
    this.renderer.setAttribute(background, 'href', this.backgroundUrl);
    this.renderer.appendChild(svg, background);

    // Draw elements
    this.elements.forEach((element: any) => {
      if (element.type === 'text') {
        const text = this.renderer.createElement('text', 'http://www.w3.org/2000/svg');
        const textAttributes = {
          'data-type': 'text',
          'x': element.x.toString(),
          'y': element.y.toString(),
          'font-size': '40',
          'fill': '#FFFFFF',
          'text-anchor': 'start',
          'dominant-baseline': 'hanging',
        };
        const textStyles = {
          '-webkit-user-select': 'none',
          'font-family': "'Hind Vadodara', sans-serif",
          'font-weight': '600'
        };

        Object.entries(textAttributes).forEach(([key, value]) => this.renderer.setAttribute(text, key, value));
        Object.entries(textStyles).forEach(([key, value]) => this.renderer.setStyle(text, key, value));

        if (element.text) {
          this.renderer.appendChild(text, this.renderer.createText(element.text));
        }
        this.renderer.appendChild(svg, text);
      }
      else if (element.type === 'avatar') {
        // Create the circle
        const circle = this.renderer.createElement('circle', 'http://www.w3.org/2000/svg');
        this.renderer.setAttribute(circle, 'data-type', 'avatar'); // Ensure a unique data-type attribute
        this.renderer.setAttribute(circle, 'cx', element.x.toString());
        this.renderer.setAttribute(circle, 'cy', element.y.toString());
        this.renderer.setAttribute(circle, 'r', element.r.toString()); // Radius
        this.renderer.setAttribute(circle, 'fill', 'url(#image-pattern)'); // Use the image pattern as fill
        this.renderer.setAttribute(circle, 'stroke', 'white');
        this.renderer.setAttribute(circle, 'stroke-width', '10');
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
        this.renderer.setAttribute(image, 'href', element.imageUrl); // Replace with your image path

        this.renderer.appendChild(imagePattern, image);
        this.renderer.appendChild(svg, imagePattern);
      }

    });

    this.addDraggableBehavior();
  }

  addDraggableBehavior(): void {
    this.elements.forEach((element: any) => {
      const svgElement = this.imageDraw.nativeElement as SVGSVGElement;
      const draggableElement = svgElement.querySelector(`[data-type="${element.type}"]`);
      if (draggableElement) {
        let isDragging = false;
        this.renderer.setAttribute(draggableElement, 'cursor', 'grab');
        const onMouseDown = (event: MouseEvent) => {
          this.selectedElement = element;
          isDragging = true;
          console.log(event);
          const svgPoint = this.getMousePosition(event, svgElement);
          // Get the coordinates of the clicked point
          const clickedX = svgPoint.x;
          const clickedY = svgPoint.y;
          let elementX;
          let elementY;
          if (element.type === 'avatar') {
            elementX = parseFloat(draggableElement.getAttribute('cx') || '0');
            elementY = parseFloat(draggableElement.getAttribute('cy') || '0');
          } else {
            elementX = parseFloat(draggableElement.getAttribute('x') || '0');
            elementY = parseFloat(draggableElement.getAttribute('y') || '0');
          }
          this.offsetX = elementX - clickedX;
          this.offsetY = elementY - clickedY;
          this.renderer.setAttribute(draggableElement, 'cursor', 'grabbing');
          this.buildForm(element);
        };

        const onMouseMove = (event: MouseEvent) => {
          event.preventDefault();
          if (isDragging) {
            const svgPoint = this.getMousePosition(event, svgElement);
            const draggableElement = svgElement.querySelector(`[data-type="${element.type}"]`) as SVGGraphicsElement;
            this.buildForm(this.selectedElement);
            if (draggableElement) {
              let x, y;
              let r = 0;
              if (element.type === 'avatar') {
                x = parseFloat(draggableElement.getAttribute('cx') || '0');
                y = parseFloat(draggableElement.getAttribute('cy') || '0');
                r = parseFloat(draggableElement.getAttribute('r') || '0');
              } else {
                x = parseFloat(draggableElement.getAttribute('x') || '0');
                y = parseFloat(draggableElement.getAttribute('y') || '0');
              }
              if (x && y) {
                // Calculate the difference between the mouse position and the initial clicked point
                const oX = svgPoint.x - x + this.offsetX;
                const oY = svgPoint.y - y + this.offsetY;

                // Update the position of the draggable element
                const newX = x + oX;
                const newY = y + oY;

                // Adjust boundaries (30px gap)
                const minX = 30 + r;
                const minY = 30 + r;
                const maxX = this.svgWidth - (draggableElement.getBBox().width + minX) + 2 * r;
                const maxY = this.svgHeight - (draggableElement.getBBox().height + minY) + 2 * r;

                const adjustedX = Math.min(Math.max(newX, minX), maxX);
                const adjustedY = Math.min(Math.max(newY, minY), maxY);
                element.x = adjustedX;
                element.y = adjustedY;
                // Set attributes based on element type
                if (element.type === 'avatar') {
                  this.renderer.setAttribute(draggableElement, 'cx', adjustedX.toString());
                  this.renderer.setAttribute(draggableElement, 'cy', adjustedY.toString());
                } else {

                  this.renderer.setAttribute(draggableElement, 'x', adjustedX.toString());
                  this.renderer.setAttribute(draggableElement, 'y', adjustedY.toString());
                }
              }
            }
          }
        };
        const onMouseUp = () => {
          isDragging = false;
          this.renderer.setAttribute(draggableElement, 'cursor', 'grab');
        };


        this.renderer.listen(draggableElement, 'mousedown', onMouseDown);
        this.renderer.listen(draggableElement, 'touchstart', onMouseDown);
        this.renderer.listen(svgElement, 'mousemove', onMouseMove);
        this.renderer.listen(svgElement, 'touchmove', onMouseMove);
        this.renderer.listen(svgElement, 'mouseup', onMouseUp);
        this.renderer.listen(svgElement, 'touchend', onMouseUp);
      }
    });
  }

  downloadCanvas(): void {
    // Implement logic to download the SVG as an image or save the SVG content
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
  buildForm(selectedElement: any): void {
    // Reset the form before building a new one
    this.elementForm = null;

    // Assuming selectedElement is an object with keys and values
    const formGroupConfig: { [key: string]: any } = {};

    // Loop through the keys of selectedElement
    Object.keys(selectedElement).forEach(key => {
      // Create a new FormControl for each key with its corresponding value
      formGroupConfig[key] = [selectedElement[key], Validators.required];
    });

    // Create the FormGroup using FormBuilder
    this.elementForm = this.fb.group(formGroupConfig);
  }
  captureScreenshot(): void {
    const svgElement = this.imageDraw.nativeElement as HTMLElement;

    // Set the SVG element dimensions (assuming you want to set them to the viewport size)
    svgElement.setAttribute('width', `${this.svgWidth}px`);
    svgElement.setAttribute('height', `${this.svgHeight}px`);

    // Create a canvas element with the same dimensions as the SVG viewport
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d') as CanvasRenderingContext2D;
    canvas.width = this.svgWidth;
    canvas.height = this.svgHeight;

    // Draw the SVG content onto the canvas
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const image = new Image();
    image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgString);

    image.onload = () => {
      context.drawImage(image, 0, 0);

      // Convert the canvas content to a Blob with JPEG format
      canvas.toBlob((blob) => {
        if (blob) {
          // Create a Blob URL
          const blobUrl = URL.createObjectURL(blob);

          // Create a link element for downloading the image
          const link = document.createElement('a');
          link.href = blobUrl;
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          link.download = `screenshot_${timestamp}.jpg`;

          // Simulate a click on the link to trigger the download
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Revoke the Blob URL to release resources
          URL.revokeObjectURL(blobUrl);
        }

        // Remove the width and height attributes from the SVG element to restore original size
        svgElement.removeAttribute('width');
        svgElement.removeAttribute('height');
      }, 'image/jpeg', 1); // Specify JPEG quality (0.0 to 1.0)
    };
  }


  openImageInNewWindow(dataURL: string): void {
    // Open a new window with a blank page
    const newWindow = window.open('', '_blank');

    if (newWindow) {
      // Write an HTML document to the new window with an img element pointing to the data URL
      newWindow.document.write('<html><head><title>Image Preview</title></head><body style="margin: 0; text-align: center;">');
      newWindow.document.write('<img src="' + dataURL + '" style="max-width: 100%; max-height: 100vh;"/>');

      // Add a download button
      newWindow.document.write('<button onclick="downloadImage()">Download</button>');

      // Add a script for downloading the image
      newWindow.document.write('<script>');
      newWindow.document.write('function downloadImage() {');
      newWindow.document.write('  var link = document.createElement("a");');
      newWindow.document.write('  link.href = "' + dataURL + '";');
      newWindow.document.write('  link.download = "image.jpg";');
      newWindow.document.write('  link.click();');
      newWindow.document.write('}');
      newWindow.document.write('</script>');

      newWindow.document.write('</body></html>');
      newWindow.document.close();
    } else {
      console.error('Failed to open a new window.');
    }
  }

}
