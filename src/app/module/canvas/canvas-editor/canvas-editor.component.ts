import { Component, ElementRef, ViewChild, HostListener } from '@angular/core';
import { User } from 'src/app/common/interfaces/commonInterfaces';
import { UserService } from 'src/app/common/services/user.service';

@Component({
  selector: 'app-canvas-editor',
  templateUrl: './canvas-editor.component.html',
  styleUrls: ['./canvas-editor.component.scss']
})
export class CanvasEditorComponent {
  user!: User;
  @ViewChild('canvas') canvas!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;
  elements = [
    { type: 'avatar', x: 70, y: 70, imageUrl: 'assets/images/jpeg/profile-1.jpeg' },
    { type: 'text', x: 300, y: 300, text: 'John Doe' },
  ];
  // Fixed canvas size
  canvasWidth: number = 1024;
  canvasHeight: number = 1024;

  // Initial container dimensions
  containerWidth: number = 0;
  containerHeight: number = 0;

  // Scale factor to maintain aspect ratio
  scale: number = 1;
  // Variables for drag functionality
  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private draggedElement: any | null = null;

  
  constructor(private US: UserService) { }

  ngAfterViewInit(): void {
    this.US.getUser().subscribe((user: User | null) => {
      if (user) {
        this.user = user;
        this.ctx = this.canvas.nativeElement.getContext('2d')!;
        this.updateContainerSize();
        this.drawCanvas();
      }
    });
    // Bind mouse events to canvas
    this.canvas.nativeElement.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.canvas.nativeElement.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.nativeElement.addEventListener('mouseup', this.onMouseUp.bind(this));

    // Update container size on window resize
    window.addEventListener('resize', this.onResize.bind(this));
  }

  // Update container size when window is resized
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.updateContainerSize();
    this.drawCanvas();
  }

  // Update container size based on the actual size of the container element
  updateContainerSize(): void {
    const container = this.canvas.nativeElement.parentElement;
    if (container) {
      this.containerWidth = container.clientWidth;
      this.containerHeight = container.clientHeight;
      this.scale = Math.min(this.containerWidth / this.canvasWidth, this.containerHeight / this.canvasHeight);
    }
  }

  // Draw canvas elements
  drawCanvas(): void {
    // Set canvas size based on the fixed canvas size
    this.canvas.nativeElement.width = this.canvasWidth;
    this.canvas.nativeElement.height = this.canvasHeight;

    // Set the scale and transform origin based on container dimensions
    this.canvas.nativeElement.style.transform = `scale(${this.scale})`;
    this.canvas.nativeElement.style.transformOrigin = '50% 0';

    // Set the background color
    this.ctx.fillStyle = '#F5F5F5';
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    const textElements: any[] = [];
    const avatarElements: any[] = [];
    // Draw elements
    this.elements.forEach(element => {
      switch (element.type) {
        case 'avatar':
          avatarElements.push(element);
          break;
        case 'text':
          textElements.push(element);
          break;
        // Add more cases for other element types as needed
        default:
          // Handle unknown element types
          break;
      }
    });
    textElements.forEach(textElement => {
      this.drawText(textElement);
    });
    avatarElements.forEach(avatarElements => {
      this.drawAvatar(avatarElements);
    });
  }

  // Draw avatar as a circle with border and shadow
  drawAvatar(element: any): void {
    const radius = 60;
    // Save the current state of the canvas
    this.ctx.save();
    // Draw circle path
    this.ctx.beginPath();
    this.ctx.arc(element.x, element.y, radius, 0, 2 * Math.PI);
    // Clip the canvas to the circle path
    this.ctx.clip();
    // Draw image inside the circle
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = this.user.image || element.imageUrl;
    image.onload = () => {
      // Draw the image within the clipped area
      this.ctx.drawImage(image, element.x - radius, element.y - radius, 2 * radius, 2 * radius);

      // Restore the canvas state to remove the clip
      this.ctx.restore();

      // Add border and shadow
      this.ctx.strokeStyle = 'white';
      this.ctx.lineWidth = 5;
      this.ctx.shadowColor = 'black';
      this.ctx.shadowBlur = 10;

      // Stroke the circle to add border and shadow
      this.ctx.stroke();
    };
  }

  drawText(element: any): void {
    const fontSize = 20;
    // Set text properties
    this.ctx.font = `${fontSize}px Arial`;
    this.ctx.fillStyle = 'black';
    this.ctx.textAlign = 'center'; // Align text to the center
    // Draw text at specified position
    this.ctx.fillText(element.text, element.x, element.y - fontSize / 2);
  }
  // Mouse event handlers for drag functionality
  onMouseDown(event: MouseEvent): void {
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.isDragging = false;  // Reset the flag before checking elements

    // Check if the mouse is over any draggable element
    for (let i = this.elements.length - 1; i >= 0; i--) {
      const element = this.elements[i];
      if (this.isMouseOverElement(element, event)) {
        this.isDragging = true;
        this.draggedElement = element;

        // Redraw the canvas with the updated element positions
        this.drawCanvas();
        break;  // Stop checking once the topmost element is found
      }
    }
  }


  onMouseMove(event: MouseEvent): void {
    if (this.isDragging && this.draggedElement) {
      const offsetX = event.clientX - this.dragStartX;
      const offsetY = event.clientY - this.dragStartY;

      // Update the element position based on the drag
      this.draggedElement.x += offsetX;
      this.draggedElement.y += offsetY;

      // Redraw the canvas with the updated element positions
      this.drawCanvas();

      // Update the drag start coordinates for the next move event
      this.dragStartX = event.clientX;
      this.dragStartY = event.clientY;
    }
  }

  onMouseUp(event: MouseEvent): void {
    this.isDragging = false;
    this.draggedElement = null;
  }

  // Helper function to check if the mouse is over a specific element
  private isMouseOverElement(element: any, event: MouseEvent): boolean {
    const radius = element.type === 'avatar' ? 60 : 0; // Adjust for avatar circle radius

    return (
      event.clientX >= element.x - radius &&
      event.clientX <= element.x + radius &&
      event.clientY >= element.y - radius &&
      event.clientY <= element.y + radius
    );
  }
}
