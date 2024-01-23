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
  @ViewChild('imageDraw') imageDraw!: ElementRef<SVGElement>;

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
          { type: 'text', x: 300, y: 300, text: 'John Doe' },
          { type: 'avatar', x: 300, y: 300, r: 75, imageUrl: this.user.image || 'assets/images/jpeg/profile-1.jpeg' },
        ]
        this.drawCanvas();
      }
    });
  }
  drawCanvas(): void {
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
        this.renderer.setAttribute(text, 'data-type', 'text'); // Ensure a unique data-type attribute
        this.renderer.setAttribute(text, 'x', element.x.toString());
        this.renderer.setAttribute(text, 'y', element.y.toString());
        this.renderer.setAttribute(text, 'font-size', '20');
        this.renderer.setStyle(text, '-webkit-user-select', 'none');
        this.renderer.setAttribute(text, 'fill', '#FFFFFF');
        this.renderer.setAttribute(text, 'text-anchor', 'start');
        this.renderer.setAttribute(text, 'dominant-baseline', 'hanging');
        if (element.text) {
          this.renderer.appendChild(text, this.renderer.createText(element.text));
        }

        this.renderer.appendChild(svg, text);
      } else if (element.type === 'avatar') {
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
        this.renderer.setAttribute(image, 'href', this.user.image); // Replace with your image path

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
        this.renderer.listen(svgElement, 'mousemove', onMouseMove);
        this.renderer.listen(svgElement, 'mouseup', onMouseUp);
      }
    });
  }

  downloadCanvas(): void {
    // Implement logic to download the SVG as an image or save the SVG content
  }
  getMousePosition(evt: MouseEvent, svg: SVGSVGElement): { x: number, y: number } {
    const CTM = svg.getScreenCTM();
    return {
      x: (evt.x - CTM!.e) / CTM!.a,
      y: (evt.y - CTM!.f) / CTM!.d
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
}
