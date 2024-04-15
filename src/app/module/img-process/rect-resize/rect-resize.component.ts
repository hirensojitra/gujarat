import { Component, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-svg-resize',
  templateUrl: './rect-resize.component.html',
  styleUrls: ['./rect-resize.component.scss']
})
export class RectResizeComponent {
  @ViewChild('rectangle') rectangle!: ElementRef<SVGRectElement>;
  
  dragging: boolean = false;
  dragTarget: string | null = null;
  startX: number = 0;
  startY: number = 0;
  startRectX: number = 0;
  startRectY: number = 0;
  startRectWidth: number = 0;
  startRectHeight: number = 0;
  handles: { id: string, x: number, y: number, size: number }[] = [];

  constructor() {}

  ngOnInit() {
    this.calculateHandles();
  }

  calculateHandles() {
    const rect = this.rectangle.nativeElement.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const x = rect.x;
    const y = rect.y;

    this.handles = [
      { id: 'top-left', x: x, y: y, size: 10 },
      { id: 'top-right', x: x + width, y: y, size: 10 },
      { id: 'bottom-left', x: x, y: y + height, size: 10 },
      { id: 'bottom-right', x: x + width, y: y + height, size: 10 },
      { id: 'top', x: x + width / 2, y: y, size: 10 },
      { id: 'bottom', x: x + width / 2, y: y + height, size: 10 },
      { id: 'left', x: x, y: y + height / 2, size: 10 },
      { id: 'right', x: x + width, y: y + height / 2, size: 10 }
    ];
  }

  startDragging(event: MouseEvent, target: string) {
    this.dragging = true;
    this.dragTarget = target;
    this.startX = event.clientX;
    this.startY = event.clientY;
    const rect = this.rectangle.nativeElement.getBoundingClientRect();
    this.startRectX = rect.x;
    this.startRectY = rect.y;
    this.startRectWidth = rect.width;
    this.startRectHeight = rect.height;
  }

  onSvgMouseMove(event: MouseEvent) {
    if (!this.dragging) {
      return;
    }
    const dx = event.clientX - this.startX;
    const dy = event.clientY - this.startY;
    switch (this.dragTarget) {
      case 'rectangle':
        this.moveRectangle(dx, dy);
        break;
      default:
        this.resizeRectangle(dx, dy);
        break;
    }
  }

  moveRectangle(dx: number, dy: number) {
    const newX = this.startRectX + dx;
    const newY = this.startRectY + dy;
    this.rectangle.nativeElement.setAttribute('x', newX.toString());
    this.rectangle.nativeElement.setAttribute('y', newY.toString());
    this.calculateHandles();
  }

  resizeRectangle(dx: number, dy: number) {
    let newX = this.startRectX;
    let newY = this.startRectY;
    let newWidth = this.startRectWidth;
    let newHeight = this.startRectHeight;
  
    if (this.dragTarget?.includes('left')) {
      newWidth -= dx;
      newX += dx;
    } else if (this.dragTarget?.includes('right')) {
      newWidth += dx;
    }
  
    if (this.dragTarget?.includes('top')) {
      newHeight -= dy;
      newY += dy;
    } else if (this.dragTarget?.includes('bottom')) {
      newHeight += dy;
    }
  
    if (newWidth > 0 && newHeight > 0) {
      this.rectangle.nativeElement.setAttribute('x', newX.toString());
      this.rectangle.nativeElement.setAttribute('y', newY.toString());
      this.rectangle.nativeElement.setAttribute('width', newWidth.toString());
      this.rectangle.nativeElement.setAttribute('height', newHeight.toString());
      this.calculateHandles();
    }
  }
  onSvgMouseUp() {
    this.dragging = false;
    this.dragTarget = null;
  }
  onSvgMouseLeave() {
    if (this.dragging) {
      this.dragging = false;
      this.dragTarget = null;
    }
  }
}
