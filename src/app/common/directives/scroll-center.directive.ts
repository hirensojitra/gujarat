import { Directive, ElementRef, Input, OnDestroy, AfterViewInit, Renderer2 } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

@Directive({
  selector: '[scrollCenter]'
})
export class ScrollCenterDirective implements AfterViewInit, OnDestroy {
  private destroy$ = new Subject<void>();
  @Input() activeIndex!: number;
  @Input() selectedIndex!: number;
  private activeIndexSetSubject = new Subject<number>();
  private selectedIndexSetSubject = new Subject<number>();

  @Input() set activeIndexSet(value: number) {
    this.activeIndex = value;
    this.activeIndexSetSubject.next(value);
    this.centerActiveItem();
  }
  @Input() set selectedIndexSet(value: number) {
    this.selectedIndexSetSubject.next(value);
    this.centerActiveItem(true);
  }

  activeIndexSet$ = this.activeIndexSetSubject.asObservable();
  selectedIndexSet$ = this.selectedIndexSetSubject.asObservable();

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  ngAfterViewInit(): void {
    this.activeIndexSet$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(async (value: number) => {
      this.activeIndex = value;
      await this.centerActiveItem();
    });
    this.selectedIndexSet$.pipe(
    ).subscribe(async () => {
      await this.centerActiveItem(true);
    });

    // Add wheel event listener
    this.el.nativeElement.addEventListener('wheel', this.onWheel.bind(this));
    // Check initial overflow state
    this.checkOverflow();
    // Add scroll event listener
    this.el.nativeElement.addEventListener('scroll', this.checkOverflow.bind(this));
  }

  private centerActiveItem(fast?: boolean) {
    const container = this.el.nativeElement;
    const items = container.children;
    if (this.activeIndex >= 0 && this.activeIndex < items.length) {
      const activeItem = items[this.activeIndex] as HTMLElement;
      const containerWidth = container.offsetWidth;
      const itemWidth = activeItem.offsetWidth;
      const offsetLeft = activeItem.offsetLeft;
      const scrollPosition = offsetLeft - (containerWidth / 2) + (itemWidth / 2);
      setTimeout(() => {
        container.scroll({
          left: scrollPosition,
          behavior: fast ? 'instant' : 'smooth'
        });
      }, 0);
    }
  }

  private onWheel(event: WheelEvent) {
    const container = this.el.nativeElement;
    container.scrollLeft += event.deltaY;
  }

  private checkOverflow() {
    const container = this.el.nativeElement;
    const parent = container.parentElement;
    const isOverflowingStart = container.scrollLeft > 0;
    const isOverflowingRight = container.scrollLeft + container.offsetWidth < container.scrollWidth;
    this.renderer.setStyle(parent, 'overflow', 'hidden');
    if (isOverflowingStart) {
      this.renderer.addClass(parent, 'overflowing-start');
    } else {
      this.renderer.removeClass(parent, 'overflowing-start');
    }

    if (isOverflowingRight) {
      this.renderer.addClass(parent, 'overflowing-end');
    } else {
      this.renderer.removeClass(parent, 'overflowing-end');
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.activeIndexSetSubject?.unsubscribe();
    this.el.nativeElement.removeEventListener('wheel', this.onWheel);
    this.el.nativeElement.removeEventListener('scroll', this.checkOverflow);
  }
}
