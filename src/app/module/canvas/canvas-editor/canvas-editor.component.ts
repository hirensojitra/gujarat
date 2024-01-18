import { Component, ElementRef, ViewChild, HostListener } from '@angular/core';
import { User } from 'src/app/common/interfaces/commonInterfaces';
import { UserService } from 'src/app/common/services/user.service';
import { CdkDragMove } from '@angular/cdk/drag-drop';

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
    { type: 'avatar', x: 50, y: 50, imageUrl: 'path/to/avatar.jpg' },
    { type: 'text', x: 100, y: 100, text: 'John Doe' },
    // Add more elements as needed
  ];
  // Fixed canvas size
  canvasWidth: number = 1024;
  canvasHeight: number = 1024;

  // Initial container dimensions
  containerWidth: number = 0;
  containerHeight: number = 0;

  // Scale factor to maintain aspect ratio
  scale: number = 1;

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

    // Draw elements
    this.drawAvatar();
    // Add more drawing logic as needed
  }

  // Draw avatar as a circle with border and shadow
  drawAvatar(): void {
    const radius = 50;

    // Draw circle
    this.ctx.beginPath();
    this.ctx.arc(this.canvasWidth / 2, this.canvasHeight / 2, radius, 0, 2 * Math.PI);
    this.ctx.clip();

    // Draw image inside the circle
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = 'assets/images/jpeg/profile-1.jpeg';

    image.onload = () => {
      this.ctx.drawImage(image, this.canvasWidth / 2 - radius, this.canvasHeight / 2 - radius, 2 * radius, 2 * radius);
    };

    // Add border and shadow
    this.ctx.strokeStyle = 'white';
    this.ctx.lineWidth = 5;
    this.ctx.shadowColor = 'black';
    this.ctx.shadowBlur = 10;

    this.ctx.stroke();
  }

  // Handle drag and drop
  onDragMoved(event: CdkDragMove): void {
    const index = this.elements.findIndex(element => element.type === 'avatar');
    if (index !== -1) {
      this.elements[index].x += event.distance.x / this.scale;
      this.elements[index].y += event.distance.y / this.scale;
      this.drawCanvas();
    }
  }
}
