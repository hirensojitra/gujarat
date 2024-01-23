import { Directive, ElementRef, Renderer2, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appDraggable]'
})
export class DraggableDirective {
  private isDragging = false;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @Input() dragData: any;

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    event.preventDefault();
    this.isDragging = true;
    this.renderer.addClass(this.el.nativeElement, 'dragging');
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      this.renderer.setStyle(this.el.nativeElement, 'left', event.clientX - 25 + 'px');
      this.renderer.setStyle(this.el.nativeElement, 'top', event.clientY - 25 + 'px');
    }
  }

  @HostListener('document:mouseup')
  onMouseUp(): void {
    this.isDragging = false;
    this.renderer.removeClass(this.el.nativeElement, 'dragging');
  }
}
