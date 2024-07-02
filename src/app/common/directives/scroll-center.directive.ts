import { Directive, ElementRef, Input, SimpleChanges } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';

@Directive({
  selector: '[scrollCenter]'
})
export class ScrollCenterDirective {
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
  constructor(private el: ElementRef) { }

  ngAfterViewInit(): void {
    this.activeIndexSet$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(async (value: number) => {
      this.activeIndex = value;
      await this.centerActiveItem();
    })
    this.selectedIndexSet$.pipe(
    ).subscribe(async () => {
      await this.centerActiveItem(true);
    })
  }
  private centerActiveItem(fast?: boolean) {
    console.log(fast)
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
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.activeIndexSetSubject?.unsubscribe();
  }
}
